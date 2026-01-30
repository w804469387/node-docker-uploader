
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
## 🚀 快速开始

### 1. 启动服务

```bash
# 构建并启动所有服务
docker compose up -d --build
```

### 2. 服务说明

| 服务名称 | 端口 | 说明 | 默认凭证 |
| :--- | :--- | :--- | :--- |
| **图片访问 (CDN)** | `80` | Nginx 静态服务 | 无 |
| **上传接口 (API)** | `3000` | POST 上传接口 | Token: `my-secret-password` |
| **文件管理 (UI)** | `8080` | FileBrowser 管理后台 | admin / admin |

---

## 🔌 API 接口文档

### 上传图片

- **URL**: `http://localhost:3000/upload`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`

#### 请求头 (Headers)

| 参数名 | 值 | 说明 |
| :--- | :--- | :--- |
| Authorization | `Bearer my-secret-password` | **必填** (可在代码中修改) |

#### 请求体 (Body)

| 参数名 | 类型 | 说明 |
| :--- | :--- | :--- |
| **file** | File | **必填**，目标图片文件 |

#### 返回示例

```json
{
  "message": "success",
  "url": "http://localhost/2023/10/27/xxxx.jpg",
  "path": "2023/10/27/xxxx.jpg"
}
```

---

## 🛠️ 维护与配置

### 数据持久化
所有图片存储在项目根目录下的 `./data` 文件夹中。
FileBrowser 的数据库配置存储在 `./filebrowser` 文件夹中。
**警告**：请勿在未备份的情况下直接删除 `data` 目录。

### 修改 Nginx 配置
Nginx 配置文件位于 `./nginx/default.conf`，修改后需要重启容器：
```bash
docker compose restart nginx
```

### 修改上传密码
修改 `uploader/index.js` 中的 `AUTH_TOKEN` 常量，然后重建容器：
```bash
docker compose up -d --build uploader
```

## 📝 License
MIT
