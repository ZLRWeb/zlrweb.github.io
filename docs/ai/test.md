您好！以下是針對您提供的 Visual Studio Code 2025 年 5 月 (版本 1.101) 發佈內容的重點整理，幫助您瞭解新功能與改進重點：

---

### VS Code 2025 年 5 月 (版本 1.101) 重點整理

#### 一、主要亮點功能
- MCP (Model Context Protocol) 支援：
 - 支援提示（Prompts）、資源（Resources）、抽樣（Sampling，實驗性質）
 - 支援需認證的 MCP 伺服器
 - MCP 伺服器開發模式（開發中，含監控與除錯）
 - 發佈 MCP 伺服器擴充（支援擴充套件內建 MCP 伺服器）

- Chat（聊天）功能進化：
 - 定義工具組（Tool Sets），群組多個相關工具以便快速切換
 - 改進 UI/UX，如訊息辨識、請求撤銷（加入「X」按鈕和快捷鍵）
 - 支援自訂對話模式（Custom Chat Modes），針對特定工作流程做個性化設定

- 資訊視覺化與追蹤：
 - 支援源控（Source Control）中的檔案視圖與任務編排
 - 更豐富的歷史記錄展示，並能將歷史資源加入聊天上下文
 - 支援在側邊輸出訊息（浮動視窗）

- 強化自動化及效率工具：
 - 更智能的任務控制（EX：instance policy）
 - 進階檔案/Notebook 操作工具（如追蹤執行進度、組態 Kernel）
 - 支援 Web 頁面元素選取並加入聊天（實驗性功能）

#### 二、改善點與新特性
- UX 改進：
 - 聊天訊息的樣式更清楚區分，用戶請求撤銷更方便
 - 支援浮動視窗的「Dock」與「新建」操作
 - 更明確的錯誤提示與警示（如部署警告、擴充外掛未公開提示）
 
- 可及性（Accessibility）：
 - 增加聽覺提示（例如操作需要用戶介入時的提示聲）
 - 改善螢幕閱讀器體驗（針對 Confirm 字框、提示訊息提供詳細資訊）
 - User action signals 來提醒用戶需操作的狀況

- Editor 相關改進：
 - 「Find as you type」 可選控制
 - 本地化 Windows 標題列和右鍵菜單（native/custom/inherit）
 - 支援 Linux 原生狀態菜單
 - 使用 PowerShell 時能獲取環境變數
 - 增強搜尋體驗：更快的提示、語義搜尋控制、推薦設定

- 遠端開發（Remote Development）：
 - 支援 Dev Container、SSH、Remote Tunnels 等更完善的遠端工作流程
 - 提升探索資源、擴充功能的可靠性

- 擴充外掛與 API
 - 支援 MCP 伺服器的擴充包（模組化）
 - 改進內建工具的開關控制（如：編輯檔案、執行指令）
 - 提升擴充開發流程（例如：秘密檢測，Web 環境偵測、API 相關改進）

#### 三、開發者與擴充支援
- API 提案與擴展：
 - 描述認證提供者（Authentication Provider）支援的授權伺服器聲明
 - MCP API 進一步完善，包括動態認證、授權流程
 - 準備支援 Web 環境（例如：navigator 對應）調整，供擴充開發者遷移

- 模組與測試工具：
 - 支援 ESM 模組：建置擴充套件時可用「import/export」
 - secret scanning：打包時自動檢測不安全資訊

---

### 小結
VS Code 2025 年 5 月版本帶來多項重點改進：
- 強化與 MCP 相關的智慧化工具與 API
- 改進聊天體驗，更友善的 UI 與自訂模組
- 多層次 UX 改善，讓開發者操作更便利
- 支援遠端開發與高階擴充功能
- 可及性與搜尋體驗升級，迎合多元用戶需求

---

### 參考資料
- 官方更新說明
- MCP Protocol 規範
- VSCode Developer API 與 Extension 開發指南

---

如需深入瞭解或實際操作範例，建議下載最新INSIDERS版本體驗！