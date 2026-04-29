# 从 0 开始运行（中文）

## 1) 环境准备

你只需要以下任意一项：

- `python3`（推荐）
- 或 `npx`

检查：

```bash
python3 --version
# 或
npx --version
```

## 2) 进入项目目录

```bash
cd /Users/bzhang/Downloads/paper-summarizer
```

## 3) 配置 API（推荐，避免界面手动输入）

复制示例文件：

```bash
cp config.local.example.js config.local.js
```

编辑 `config.local.js`，填写：

- `libraryType` (`group` 或 `user`)
- `zoteroGroupId` 或 `zoteroUserId`
- `zoteroApiKey`
- `mistralApiKey`

> `config.local.js` 已在 `.gitignore` 中，不会被提交。

## 4) 启动本地服务

```bash
./start-server.sh
```

打开浏览器：

`http://localhost:8000`

## 5) 首次使用

- 如果已配置 `config.local.js`：直接点 `Fetch Papers` / `Generate Summaries`
- 如果没配：在左侧配置面板输入 API 信息后再操作

## 6) 常见问题

### 页面能打开但没摘要

这是正常的，代表还没生成或还没加载到摘要。

- 先点击 `Generate Summaries`
- 或确保 `summaries/*.json` 存在
- 然后强制刷新（`Cmd + Shift + R`）

### 显示 “No papers found”

- 点击 `Fetch Papers`
- 或确认 `data/papers.json` 存在并是有效 JSON

### 端口被占用

```bash
./start-server.sh 5050
```

然后打开 `http://localhost:5050`。
