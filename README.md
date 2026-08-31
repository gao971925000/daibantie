# 待办贴 DeskTodo · 下载官网

静态下载页，无构建依赖，双击 `index.html` 即可在浏览器打开预览。

## 目录结构

```
todo_tool_web/
├─ index.html                 # 唯一页面
├─ assets/
│  ├─ css/style.css           # 样式
│  ├─ js/main.js              # 交互（导航、滚动动画、下载反馈）
│  ├─ app-icon.svg / .png     # 应用图标
│  └─ screenshots/*.png       # 产品截图
├─ download/
│  └─ DeskTodo-Setup.exe      # 安装包（固定文件名）
└─ preview/                   # 整页预览图（生成产物，可删除）
```

## 如何替换 / 升级安装包

安装包使用**固定文件名** `DeskTodo-Setup.exe`，页面里有 2 个下载入口
（顶部导航栏 + Hero 主按钮），都指向同一个文件。升级只需两步：

1. **覆盖文件**：把新构建的安装包改名为 `DeskTodo-Setup.exe`，替换
   `download/DeskTodo-Setup.exe`（文件名保持不变，网页里的下载链接无需改动）。

2. **更新大小文案（可选）**：打开 `index.html`，搜索 `安装包`，把 Hero 里
   「2.55 MB 安装包」改成新的体积即可：

   ```html
   <span><b>2.60 MB</b> 安装包</span>
   ```

> 说明：安装包保持固定文件名是为了「覆盖即升级」，网页链接零改动。
> 如果你更希望安装包文件名带版本号（如 `待办_2.0.0-alpha.24_x64-setup.exe`），
> 则每次还要同步修改 `index.html` 里两处 `<a href="download/...">` 的文件名。

## 如何验证下载链接可用

- 本地双击 `index.html`，点击任一「下载 Windows 版」应能正常保存文件。
- 上线后：浏览器地址栏访问 `download/DeskTodo-Setup.exe` 能直接下载即为正常。

## 更新应用图标 / 产品截图（可选）

- 图标：`assets/app-icon.svg`（矢量，页面内使用）与 `assets/app-icon.png`（512×512，网站 favicon）。
- 截图：UI 有较大改版时，替换 `assets/screenshots/` 下对应图片（保持同名即可，无需改 HTML）：
  `app-hero.png`、`app-today.png`、`shot-notes.png`。
