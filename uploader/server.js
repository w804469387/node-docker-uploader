const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors());

// --- 配置项 ---
const PORT = 3000;
// 鉴权密码，请修改为你想要的密码
const AUTH_TOKEN = "my-secret-password";
// 上传根目录
const UPLOAD_ROOT = "/usr/share/uploads";

// --- Multer 存储引擎配置 ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 1. 生成日期路径: 2023/10/27
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    const relativePath = `${year}/${month}/${day}`;
    const absolutePath = path.join(UPLOAD_ROOT, relativePath);

    // 2. 递归创建目录
    fs.mkdirSync(absolutePath, { recursive: true });

    // 3. 将路径传递给 multer (注意：这里传的是绝对路径)
    cb(null, absolutePath);
  },
  filename: function (req, file, cb) {
    // 4. 生成唯一文件名: 时间戳-随机数.后缀
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // 获取原始文件后缀 (例如 .jpg, .zip, .mp4)
    const ext = path.extname(file.originalname); 
    cb(null, uniqueSuffix + ext);
  }
});

// --- 初始化 Upload 中间件 ---
// 关键修改：去掉了 fileFilter，现在允许所有文件类型
const upload = multer({ 
  storage: storage,
  // 如果你想限制文件大小，可以在这里加 limits，例如限制 100MB
  // limits: { fileSize: 100 * 1024 * 1024 } 
});

// --- 鉴权中间件 ---
const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization'];
  if (token === `Bearer ${AUTH_TOKEN}`) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

// --- 上传接口 ---
app.post('/upload', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // 构造返回给客户端的相对路径
  // req.file.destination 是绝对路径，我们需要把它转回相对路径给前端
  // 方法是：去掉 UPLOAD_ROOT 部分
  let relativePath = req.file.path.replace(UPLOAD_ROOT, '');
  
  // 处理路径分隔符问题 (Windows/Linux兼容)
  if (relativePath.startsWith(path.sep)) {
    relativePath = relativePath.substring(1); 
  }
  // 统一转为 URL 的斜杠 /
  relativePath = relativePath.split(path.sep).join('/');

  // 构造完整的 URL (假设 Nginx 在 80 端口运行)
  const fullUrl = `http://localhost/${relativePath}`;

  res.json({
    message: 'success',
    url: fullUrl,
    path: relativePath,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size
  });
});

app.listen(PORT, () => {
  console.log(`Uploader service running on port ${PORT}`);
});
