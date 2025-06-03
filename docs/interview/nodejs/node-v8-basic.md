# Node V8 Engine

## 📌 1. 基本概念

V8 是 Google 開發的 JavaScript 引擎，最初用於 Chrome 瀏覽器，後被 Node.js 引入。以 C++ 編寫，負責將 JS 編譯成原生機器碼執行，而非直譯。Node.js 將 JS 執行邏輯交由 V8 處理，將 I/O 與系統調用交給 libuv。

## 📌 2. V8 的核心組件

| 組件                  | 說明                                 |
|-----------------------|--------------------------------------|
| Parser / AST Generator| 將 JS 程式碼轉成抽象語法樹           |
| Ignition              | 解譯器，將 AST 轉成 bytecode         |
| TurboFan              | JIT 編譯器，最佳化 bytecode 為機器碼  |
| Garbage Collector     | 記憶體管理與釋放未使用物件           |

## 📌 3. V8 的 JIT 編譯流程

JS Code → Parse → AST → Ignition（bytecode）→ TurboFan（JIT 編譯）→ Optimized Machine Code

✅ 熱點程式碼會重複執行，V8 會優化它以提升效能。

## 📌 4. 記憶體管理與垃圾回收（Garbage Collection）

### 🧠 分代垃圾回收：

| 分區              | 說明                                 |
|-------------------|--------------------------------------|
| New Space         | 儲存短期物件，採用 Scavenge GC       |
| Old Space         | 儲存長期存活物件，Mark-Sweep+Compact |
| Large Object Space| 超大物件，獨立配置                   |
| Code Space        | 儲存 JIT 編譯的機器碼                |

回收機制：
- Minor GC（快）：清除 New Space
- Major GC（慢）：清除 Old Space

## 📌 5. 常見面試題與解析

### 🧠 Q1：V8 是如何提升 JavaScript 執行效能的？

✅ 建議答法：

V8 透過 JIT（Just-In-Time）編譯器，將 JS 編譯成機器碼執行，並根據執行熱度進行最佳化。此外，V8 搭配 Scavenge 和 Mark-Compact 垃圾回收演算法，有效提升記憶體管理效率。

---

### 🧠 Q2：Node.js 中的 V8 與瀏覽器中的有何不同？

| 面向       | Node.js                        | Browser                      |
|------------|-------------------------------|------------------------------|
| Host API   | 提供 fs, net, http, process 等 | 提供 DOM, window, document 等|
| 使用場景   | Server-side                    | Client-side                  |
| 環境控制   | 無 sandbox，控制更多           | 瀏覽器沙箱限制               |

✅ 建議答法：

雖然 V8 核心一致，但 Node.js 提供 server API 而非 DOM，並直接存取底層資源（透過 libuv），用途與環境不同。

---

### 🧠 Q3：如何查看 Node.js 使用的 V8 版本？

```bash
node -p process.versions.v8
```

---

### 🧠 Q4：V8 是不是支援多執行緒？

✅ 答法：

V8 本身以單執行緒運作 JavaScript。但 Node.js 可透過 Worker Threads 或 libuv 的 thread pool 處理平行任務（例如加解密、檔案 I/O），實現多執行緒的效果。

---

### 🧠 Q5：V8 垃圾回收會造成效能問題嗎？

✅ 建議答法：

在大型應用中，Major GC（針對 Old Space）可能暫停應用數十毫秒。V8 採用增量式與並行 GC 策略（Incremental + Concurrent GC）來減少停頓時間，但仍建議避免大物件、全域變數與記憶體洩漏。

## 📘 延伸學習資源

- [V8 官方部落格](https://v8.dev/blog)
- [V8 探索工具 – v8-profiler, v8 heap snapshot](https://nodejs.org/en/docs/guides/simple-profiling/)

