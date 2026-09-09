# 待办贴 DeskTodo · 下载官网

静态下载页，无构建依赖，双击 `index.html` 即可在浏览器打开预览。

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

官网两个下载入口继续使用固定文件名 `DeskTodo-Setup.exe`，因此网页链接不需要随版本修改。客户端自动更新不使用这个可覆盖地址，而是使用 `download/releases/v版本号/` 下的不可变安装包，避免 GitHub Pages 缓存旧文件导致安全校验失败。

正式安装包不再手工复制和提交。桌面端仓库的 `scripts/release-public.ps1` 会生成版本化安装包、覆盖官网固定下载包、写入 `latest.json`、提交并推送 `main`，再从公网重新下载两份文件校验大小与 SHA-256。只有 GitHub Pages 文件完全正确，才会通知客户端有新版本。

本仓库只承载正式版本；本地 QA 安装包严禁提交。不要覆盖已经发布的 `download/releases/v版本号/` 文件。发现线上版本有问题时停止发布清单并发布更高版本修复，不要原地替换安装包。

## 如何验证下载链接可用

- 本地双击 `index.html`，点击任一“下载 Windows 版”应能正常保存文件。
- 上线后访问 `download/DeskTodo-Setup.exe`，应直接下载最新正式安装包。
- 版本化安装包必须与 `download/latest.json` 记录的大小及 SHA-256 一致。

## 更新应用图标 / 产品截图（可选）

- 图标：`assets/app-icon.svg`（矢量，页面内使用）与 `assets/app-icon.png`（512×512，网站 favicon）。
- 截图：UI 有较大改版时，替换 `assets/screenshots/` 下对应图片（保持同名即可，无需改 HTML）：`app-hero.png`、`app-today.png`、`shot-notes.png`。
