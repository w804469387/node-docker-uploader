const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors()); // 允许前端跨域

// === 配置项 ===
const PORT = 3000;
const UPLOAD_DIR = '/usr/share/uploads'; // 容器内的固定根路径
const AUTH_TOKEN = "my-secret-password"; // 【重要】前端上传必须带这个Token
// =============

// 确保根目录存在
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// --- 核心修改：自定义存储策略 ---
const storage = multer.diskStorage({
  // 1. 动态定义目录：按 年/月/日 分类
  destination: (req, file, cb) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    // 组合路径：/usr/share/uploads/2023/10/27
    const subDir = path.join(String(year), month, day);
    const fullDir = path.join(UPLOAD_DIR, subDir);

    // 检查并创建目录
    if (!fs.existsSync(fullDir)) {
      fs.mkdirSync(fullDir, { recursive: true });
    }

    cb(null, fullDir);
  },
  
  // 2. 动态定义文件名：YYYYMMDD-HHmmss-随机码.后缀
  filename: (req, file, cb) => {
    const now = new Date();
    // 格式化时间戳：20231027-143005
    const timestamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 14); 
    const random = Math.round(Math.random() * 1E5); // 5位随机数
    const ext = path.extname(file.originalname);
    
    cb(null, `${timestamp}-${random}${ext}`);
  }
});

const upload = multer({ storage: storage });

// 上传接口
app.post('/upload', upload.single('file'), (req, res) => {
  // 1. 安全验证
  const token = req.headers['authorization'];
  if (token !== `Bearer ${AUTH_TOKEN}`) {
    return res.status(403).json({ error: '权限验证失败' });
  }

  if (!req.file) return res.status(400).json({ error: '未接收到文件' });

  // 2. 生成返回链接
  // 计算相对路径：从 UPLOAD_DIR 到 实际保存路径
  // 例如：req.file.path 是 /usr/share/uploads/2023/10/27/xxx.jpg
  // relativePath 就是 2023/10/27/xxx.jpg
  let relativePath = path.relative(UPLOAD_DIR, req.file.path);
  
  // 确保 Windows/Linux 路径分隔符统一转为 URL 的 '/'
  relativePath = relativePath.split(path.sep).join('/');

  // 假设外部访问域名/IP 是 localhost (部署上线时这里通常需要改为你的域名或服务器IP)
  const fileUrl = `http://localhost/${relativePath}`;
  
  console.log(`[Success] File uploaded to: ${relativePath}`);
  
  res.json({
    message: 'success',
    url: fileUrl,
    filename: req.file.filename,
    path: relativePath
  });
});

app.listen(PORT, () => console.log(`Uploader running on port ${PORT}`));
