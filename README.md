# 待办贴 DeskTodo · 下载官网

静态下载页，无构建依赖，双击 `index.html` 即可在浏览器打开预览。

Mac Apple 芯片和 Intel 芯片下载分别使用 `download/macos-latest.json`、`download/macos-intel-latest.json`，不覆盖 Windows 的 `latest.json` 和安装包。版本、SHA-256 及大小以各自清单为准；包更新需先明确授权，再新增不可变版本路径、更新对应清单及页面链接，并验证公网下载哈希。

## 生产访问与部署（2026-10-26 起）

`www.daibantie.com` 和 `daibantie.com` 已指向官方服务器 `8.133.182.248`。官网由 Caddy 托管，裸域名保留路径跳转至 www；证书自动续期。GitHub 继续保存公开源码和安装包备份，官网访问不再依赖 GitHub Pages。

**仅推送本仓库不能更新服务器官网。** Windows、Mac 发版以及单独修改官网后，都必须在桌面端/服务端仓库执行：

```powershell
pwsh -NoProfile -File scripts/deploy-website.ps1 -WebRepositoryPath <本仓库绝对路径>
```

部署要求本仓库干净且已经提交，通过逐文件哈希验证后原子切换 `/srv/daibantie-web/current`。已有相同文件硬链接复用，历史目录保留；不要直接修改服务器 current 中的硬链接文件。首次配置与回滚见桌面端仓库 `server/deploy/WEBSITE.md`。

## 目录结构

```text
todo_tool_web/
├─ index.html                 # 唯一页面
├─ assets/
│  ├─ css/style.css           # 样式
│  ├─ js/main.js              # 交互（导航、滚动动画、下载反馈）
│  ├─ app-icon.svg / .png     # 应用图标
│  └─ screenshots/*.png       # 产品截图
├─ download/
│  ├─ DeskTodo-Setup.exe      # 官网按钮使用的最新正式版（固定文件名）
│  ├─ latest.json             # 最近一次正式发布的版本与哈希记录
│  └─ releases/
│     └─ v1.0.1/
│        └─ Daibantie-v1.0.1-x64-setup.exe  # 客户端更新使用的不可变文件
└─ preview/                   # 整页预览图（生成产物，可删除）
```

## 如何发布正式安装包

官网下载主入口优先使用 `api.daibantie.com` 上的不可变安装包，www 提供相同文件和备用入口。`download/DeskTodo-Setup.exe` 仅保留为兼容的最新包别名；客户端自动更新使用 `download/releases/v版本号/` 下带哈希的不可变安装包，避免缓存旧文件导致安全校验失败。

Windows 正式安装包不再手工复制和提交。桌面端仓库的 `scripts/release-public.ps1` 会生成版本化安装包、预置 API 下载文件、更新兼容别名和 `latest.json`、提交并推送 `main`，随后部署服务器官网，再从公网重新下载文件校验大小与 SHA-256。只有服务器官网和安装包验证通过，才通知客户端有新版本。Mac 发版同样需要部署服务器官网，但仍保留自己的清单及安装包，不得覆盖 Windows 文件。

本仓库只承载正式版本；本地 QA 安装包严禁提交。不要覆盖已经发布的 `download/releases/v版本号/` 文件。发现线上版本有问题时停止发布清单并发布更高版本修复，不要原地替换安装包。

## 如何验证下载链接可用

- 本地双击 `index.html`，点击任一“下载 Windows 版”应能正常保存文件。
- 上线后访问 `download/DeskTodo-Setup.exe`，应直接下载最新正式安装包。
- 版本化安装包必须与 `download/latest.json` 记录的大小及 SHA-256 一致。

## 更新应用图标 / 产品截图（可选）

- 图标：`assets/app-icon.svg`（矢量，页面内使用）与 `assets/app-icon.png`（512×512，网站 favicon）。
- 截图：UI 有较大改版时，替换 `assets/screenshots/` 下对应图片（保持同名即可，无需改 HTML）：`app-hero.png`、`app-today.png`、`shot-notes.png`。
