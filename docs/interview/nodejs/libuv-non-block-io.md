# libuv 非阻塞 I/O 概念與面試題解析

## 📌 1. 基本概念

libuv 是一個 C 語言實作的跨平台非同步 I/O 函式庫，最初為 Node.js 而生，支援 Linux / Windows / macOS。其功能包含事件迴圈（Event Loop）、非同步檔案 I/O、TCP/UDP socket、子行程控制、Thread pool 等。

✅ Node.js 核心將 JavaScript 的執行交給 V8，系統層的非同步操作交給 libuv。

## 📌 2. libuv 的角色

| 層級       | 技術      | 功能                       |
|------------|-----------|----------------------------|
| JS 執行層  | V8 引擎   | 執行 JS、處理微任務        |
| 非同步層   | libuv     | 管理非同步任務與事件迴圈   |
| 系統層     | OS        | 真正執行系統呼叫（如 I/O） |

## 📌 3. libuv 如何處理非同步？

✅ 原理說明：
- JS 呼叫如 fs.readFile() 時，會託管給 libuv
- libuv 把任務加入其內部事件迴圈
- 若是檔案/壓縮等耗時操作，會委託 thread pool 執行
- 結果完成後加入 callback queue，等待事件迴圈處理

## 📌 4. libuv Thread Pool 機制

預設有 4 個 threads（可透過環境變數 UV_THREADPOOL_SIZE 設定上限為 128）。

常用於：
- fs.*
- crypto.*
- dns.lookup()

❗ 非 I/O 的 JS 運算（如排序）不會自動使用 thread pool。

## 📌 5. 事件循環（Event Loop）與 libuv 的整合流程

Node.js 事件迴圈分為以下階段（與 libuv 密切關聯）：

| 階段名稱           | 處理對象                        |
|--------------------|---------------------------------|
| timers             | setTimeout / setInterval        |
| pending callbacks  | 某些系統操作的回呼              |
| idle, prepare      | 內部使用                        |
| poll               | I/O 事件發生與回應              |
| check              | setImmediate                    |
| close callbacks    | socket.on('close')              |

✅ 每一輪事件循環稱為一個 tick。

Microtasks（如 Promise.then）在每個階段後立即清空。

## 📌 6. 常見面試題與解析

### 🧠 Q1：Node.js 是非同步的，那誰在背後幫忙處理？

✅ 建議答法：

是由 libuv 負責抽象出跨平台的非同步執行模型，整合 thread pool 和事件循環，讓 JavaScript 層可以維持非同步的寫法而不阻塞主執行緒。

---

### 🧠 Q2：哪些內建模組會使用 libuv 的 thread pool？

| 類別         | 使用 Thread Pool |
|--------------|-----------------|
| 檔案系統 fs  | ✅ 是            |
| DNS lookup   | ✅ 是            |
| 加解密 crypto| ✅ 是            |
| 網路 socket  | ❌ 否（使用 OS 非同步 API，如 epoll/kqueue）|

---

### 🧠 Q3：為什麼 setTimeout(fn, 0) 不會立即執行？

✅ 建議答法：

它會排入事件循環的 timers phase，而不是 microtask。真正的執行會等到目前 call stack 清空與 microtask queue 處理完後，才會在下一輪事件迴圈中執行。

---

### 🧠 Q4：libuv 如何處理高併發？

✅ 建議答法：

對於 I/O 密集任務，libuv 採非阻塞設計，讓多個任務可同時註冊並在完成後回傳 callback，不需同步等待。對於 CPU 密集任務，則可透過 thread pool 處理，避免阻塞主執行緒。

## 📘 延伸學習資源

- [libuv 官方網站](https://libuv.org/)
- [官方文檔：libuv API](https://docs.libuv.org/en/v1.x/)
- [Node.js Event Loop Explained (Node.js Docs)](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick)