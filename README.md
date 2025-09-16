# Zero 技術筆記

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-121013?style=for-the-badge&logo=github&logoColor=white)](https://zlrweb.github.io)
[![Docusaurus](https://img.shields.io/badge/Docusaurus-3.8.0-brightgreen?style=for-the-badge&logo=facebook&logoColor=white)](https://docusaurus.io/)

## 關於我

嗨，我叫楊承恩，也可以叫我 **Joseph**，網路上常用的名稱為 **Zero**，是一名軟體工程師，有系統設計、軟體開發、資料庫設計等相關經驗，熟悉 TypeScript 等程式語言。

- **GitHub**: [@zeroLR](https://github.com/zeroLR)
- **LinkedIn**: [Joseph Yang](https://www.linkedin.com/in/joseph-yang-84a641173)
- **個人部落格**: [blog.zerolr.net](https://blog.zerolr.net)

## 網站簡介

這是一個基於 [Docusaurus](https://docusaurus.io/) 建置的個人技術筆記網站，主要記錄個人學習及工作上遇到的問題及解決方法，包含前後端開發、服務建置、資料庫、網路安全等等。

**網站特色**：
- 📝 技術筆記與文件整理
- 🎯 面試準備相關資料
- 🔍 技術探索與實作經驗
- 🤖 AI 相關應用與工具分享
- 🛡️ 資訊安全實務經驗

架設筆記網站的目的是可以記錄一些自己在學習、工作上遇到的問題及解決方法，方便日後遇到同樣的問題能快速想起，也希望可以幫助到有需要的人。

## 文章類型

### 📚 技術筆記 (主要內容)
- **面試準備** - Node.js 相關面試題目與解答
  - Event Loop 機制
  - V8 引擎基礎
  - Process & Worker Threads
  - 效能優化技巧
  - 錯誤處理最佳實務
- **資料庫** - 資料庫設計與優化
- **基礎設施** - Kubernetes、Docker 等容器化技術
- **系統設計** - 大型系統架構設計
- **資訊安全** - NPM 安全實務、漏洞防護
- **AI 應用** - Copilot 客製化、Terraform 與 AWS 整合

### 🚀 技術探索
- 定期更新的技術資訊摘要
- 新技術趨勢與工具評測
- 開發工具使用心得

### 📰 會議記錄
- JCConf 等技術會議心得分享

### 🤖 AI 相關
- 每日 AI 聊天總結
- AI 工具應用經驗
- 漏洞報告自動化

## 專案結構

```
├── blog/                    # 部落格文章
│   ├── tech-info/          # 技術資訊摘要
│   ├── vulnerability-report/ # 漏洞報告
│   └── daily-chat-summary/ # AI 聊天總結
├── docs/                   # 主要技術文件
│   ├── interview/          # 面試相關
│   ├── database/           # 資料庫
│   ├── infra/             # 基礎設施
│   ├── security/          # 資訊安全
│   ├── system-design/     # 系統設計
│   ├── ai/                # AI 相關
│   └── conference/        # 會議記錄
├── src/                   # 網站原始碼
│   ├── components/        # React 元件
│   ├── pages/            # 自定義頁面
│   └── theme/            # 主題設定
└── static/               # 靜態資源
```

## 開發環境設置

### 系統需求
- Node.js >= 18.0
- npm 或 pnpm

### 安裝相依套件

使用 pnpm（推薦）：
```bash
$ pnpm install
```

或使用 npm：
```bash
$ npm install
```

### 本地開發

```bash
$ pnpm start
# 或
$ npm start
```

此命令會啟動本地開發伺服器並自動開啟瀏覽器，大部分的變更都會即時反映，無需重新啟動伺服器。

### 建置

```bash
$ pnpm build
# 或
$ npm run build
```

此命令會在 `build` 目錄中產生靜態內容，可以使用任何靜態內容託管服務來提供服務。

### 部署

使用 SSH：
```bash
$ USE_SSH=true pnpm deploy
```

不使用 SSH：
```bash
$ GIT_USER=<Your GitHub username> pnpm deploy
```

如果您使用 GitHub Pages 進行託管，此命令可以方便地建置網站並推送到 `gh-pages` 分支。

## 技術棧

- **框架**: [Docusaurus 3.8.0](https://docusaurus.io/)
- **語言**: TypeScript, MDX
- **部署**: GitHub Pages
- **樣式**: CSS Modules, 自定義 CSS
- **圖表**: Mermaid
- **評論系統**: Giscus

## 貢獻

歡迎提出 Issue 或 Pull Request 來改善內容或指正錯誤！

## 授權

Copyright © 2024 Zero (Joseph Yang). Built with Docusaurus.
