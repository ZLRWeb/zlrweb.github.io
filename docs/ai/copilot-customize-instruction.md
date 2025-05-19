---
title: 如何使用 Copilot Customize Instruction
slug: copilot-customize-instruction
sidebar_position: 1
description:
  介紹如何在 VS Code 中設定與使用 GitHub Copilot 的自訂指令（custom instructions），提升 AI 產生程式碼的品質與一致性。
tags:
  - copilot
  - ai
  - vscode
  - 自動化
  - 教學
---

# 如何使用 Copilot Customize Instruction

GitHub Copilot 支援自訂指令（custom instructions），讓你能夠針對專案或團隊的需求，定義專屬的程式碼風格、技術選擇與最佳實
踐。這篇文章將介紹如何在 VS Code 中設定與使用 Copilot 的自訂指令。

## 什麼是自訂指令？

自訂指令讓你可以用 Markdown 文件描述你的開發規範、偏好技術與專案需求。Copilot 會自動將這些指令加入每次的聊天請求，產生更
貼合你需求的程式碼建議。

## 常見自訂指令檔案類型

### 1. `.github/copilot-instructions.md`

- 適用於整個 workspace 或 repository。
- 只要在專案根目錄下建立 `.github/copilot-instructions.md`，Copilot 就會自動讀取。
- 內容可用 Markdown 撰寫，描述你的規範與需求。

#### 範例：

```markdown
# Coding Guidelines

- 所有變數使用 camelCase
- React 元件使用 PascalCase
- 錯誤處理需加上 log
```

### 2. `.instructions.md`

- 可針對不同語言、框架或任務建立多個指令檔。
- 放在 `.github/instructions/` 資料夾下。
- 可用 Front Matter 設定 `applyTo`，自動套用到特定檔案類型。

#### 範例：

```markdown
---
applyTo: '**/*.ts,**/*.tsx'
---

# TypeScript/React 規範

- 新增程式碼請使用 TypeScript
- React 元件請使用 function component 與 hooks
```

## 如何啟用自訂指令

1. **啟用 Copilot 指令檔案功能**
   - 在 VS Code 設定中搜尋 `github.copilot.chat.codeGeneration.useInstructionFiles`，設為 `true`。
2. **建立指令檔案**
   - 在專案根目錄建立 `.github/copilot-instructions.md` 或 `.github/instructions/*.instructions.md`。
3. **撰寫你的規範**
   - 以自然語言與 Markdown 格式描述你的需求。

## 進階用法

- 可在 `settings.json` 直接設定自訂指令：

```json
"github.copilot.chat.codeGeneration.instructions": [
  { "text": "所有檔案結尾加註：'AI 產生'" },
  { "file": "general.instructions.md" }
]
```

- 多個指令檔案可互相引用，方便大型專案維護。
- 可針對不同任務（如測試、code review、commit message）設定不同指令。

## 小技巧

- 指令請簡潔明確，避免衝突。
- 可用 `applyTo` 只針對特定檔案類型自動套用。
- 指令檔案可加入版本控制，方便團隊協作。

## 參考資料

- [官方文件：Copilot Customization](https://code.visualstudio.com/docs/copilot/copilot-customization)

---

自訂 Copilot 指令能大幅提升 AI 產生程式碼的品質與一致性，建議每個專案都建立專屬的指令檔案！
