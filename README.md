
# 📸 Self-Hosted Image Uploader (Dockerized)

这是一个基于 **Node.js (Express)** 和 **Nginx** 构建的轻量级自托管图床服务。它支持 Docker 一键部署，具备**权限验证**、**自动按日期归档**以及**文件名规范化**功能。

## ✨ 功能特性 (Features)

- **Docker 部署**：基于 Docker Compose，包含 Node.js 上传服务和 Nginx 静态文件服务。
- **智能目录管理**：上传的文件会自动按 `YYYY/MM/DD` (年/月/日) 创建文件夹归档，保持目录整洁。
- **规范化命名**：文件名自动重命名为 `时间戳-随机码.后缀`，防止重名。
- **安全验证**：通过 `Authorization` Header 进行简单的 Token 验证，防止未授权上传。
- **高性能访问**：使用 Nginx 直接处理静态资源请求，速度快且稳定。

## 📂 目录结构 (Directory Structure)

项目运行后，文件存储结构如下所示：

```text
uploads/                  # 挂载的根目录
├── 2023/                 # 年
│   ├── 10/               # 月
│   │   ├── 27/           # 日
│   │   │   ├── 20231027-143001-12345.jpg  # 规范化后的文件
│   │   │   └── 20231027-143500-67890.png
│   │   └── 28/
│   └── 11/
└── ...
```

## 🚀 快速开始 (Quick Start)

### 1. 前置要求
- Docker
- Docker Compose

### 2. 启动服务

```bash
# 构建并后台启动
docker compose up -d --build
```

### 3. 配置说明
主要配置位于 `uploader/index.js` (或 `server.js`) 中：
- `PORT`: 上传服务端口 (默认 3000)
- `AUTH_TOKEN`: 上传鉴权密码 (默认 "my-secret-password")
- `UPLOAD_DIR`: 容器内存储路径 (默认 "/usr/share/uploads")

---

## 🔌 API 接口文档

### 上传图片

- **URL**: `http://<你的服务器IP>:3000/upload`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`

#### 请求参数 (Headers)

| 参数名 | 值 | 说明 |
| :--- | :--- | :--- |
| Authorization | `Bearer my-secret-password` | **必填**，注意Bearer后有空格 |

#### 请求体 (Body)

| 参数名 | 类型 | 说明 |
| :--- | :--- | :--- |
| **file** | File | **必填**，要上传的图片文件 |

#### 返回示例 (Success)

```json
{
    "message": "success",
    "url": "http://localhost/2023/10/27/20231027-143001-12345.jpg",
    "filename": "20231027-143001-12345.jpg",
    "path": "2023/10/27/20231027-143001-12345.jpg"
}
```

---

## 💻 客户端测试示例

你可以使用 `curl` 命令或 Postman 进行测试。

**使用 cURL 测试：**

```bash
curl -X POST http://localhost:3000/upload \
  -H "Authorization: Bearer my-secret-password" \
  -F "file=@/Users/yourname/Desktop/test.jpg"
```

> **注意**：如果不带 Header 或 Token 错误，将返回 `403 Forbidden`。

---

## 🛠️ 维护与排错

### 查看日志
如果你发现上传失败，可以查看 Node 服务日志：
```bash
docker compose logs -f uploader
```

### 访问图片
上传成功后，通过浏览器访问 Nginx 端口（通常是 80）：
`http://localhost/2023/10/27/xxxx.jpg`

### 持久化数据
请确保 `docker-compose.yml` 中配置了 Volumes 映射，否则重启容器后图片会丢失：
```yaml
volumes:
  - ./uploads:/usr/share/uploads
```

## 📝 License
MIT
