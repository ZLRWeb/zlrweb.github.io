# Node.js Process 與 Worker Threads

## 📌 1. 基本概念

Node.js 在 JavaScript 執行層面為單執行緒，但底層（如 I/O 操作、libuv thread pool）是多執行緒。這讓 Node.js 能同時處理大量 I/O 任務，並可透過 child_process 或 worker_threads 實現平行運算。

## 📌 2. process 與 child_process 模組

### ✅ process 物件（全域物件）
提供與當前執行流程互動的 API。

| 屬性 / 方法                | 說明                       |
|---------------------------|----------------------------|
| process.pid                | 目前行程 ID                |
| process.argv               | 執行參數                   |
| process.env                | 環境變數                   |
| process.exit()             | 結束程序                   |
| process.on('exit')         | 程式結束前的 callback      |
| process.on('uncaughtException') | 捕捉未處理例外         |

### ✅ child_process 模組
允許在 Node.js 中建立子行程（process），達到真正平行處理。

三種用法：

```javascript
const { exec, spawn, fork } = require('child_process');

// exec：執行 shell 指令
exec('ls -la', (err, stdout) => console.log(stdout));

// spawn：啟動子行程並與 stdin/stdout 溝通
const ls = spawn('ls', ['-lh']);
ls.stdout.on('data', data => console.log(`輸出: ${data}`));

// fork：啟動 Node.js 子行程（可互傳訊息）
const child = fork('worker.js');
child.send({ hello: 'world' });
```

## 📌 3. Worker Threads 模組

從 Node.js v10.5 開始引入，v12 以上穩定。適合處理 CPU 密集運算（非 I/O）。

```javascript
// worker.js
const { parentPort } = require('worker_threads');
parentPort.postMessage('Hello from worker');

// main.js
const { Worker } = require('worker_threads');
const worker = new Worker('./worker.js');
worker.on('message', msg => console.log(msg));
```

## 📌 4. child_process vs worker_threads

| 項目         | child_process         | worker_threads           |
|--------------|----------------------|--------------------------|
| 執行單位     | 獨立行程             | 同行程內的執行緒         |
| 記憶體隔離   | 有（各自空間）        | 無（可共享記憶體）        |
| IPC 通訊     | send, on('message')  | postMessage, on('message') |
| 適用場景     | 子系統執行 / shell    | CPU 密集任務             |
| 效能         | 較高開銷              | 較低開銷，效能佳          |

## 📌 5. 常見面試題與解析

### 🧠 Q1：Node.js 是單執行緒嗎？那怎麼處理高併發？

✅ 建議答法：

雖然 Node.js 在 JavaScript 層面是單執行緒，但透過非阻塞 I/O 模型與 libuv 的 thread pool，可同時處理大量 I/O 任務。而 CPU 密集型任務則可用 worker_threads 或 child_process 平行處理。

---

### 🧠 Q2：spawn, exec, fork 差異是什麼？

| 方法 | 適合場景         | 備註                |
|------|------------------|---------------------|
| exec | 簡單 shell 指令  | 回傳整體 output     |
| spawn| 大量資料流       | 資料流（stream）方式處理 |
| fork | Node 子程式      | 可傳遞 JS 物件，最適 Node 專案內模組溝通 |

---

### 🧠 Q3：在什麼情況下該使用 worker_threads？

✅ 建議答法：

當需要進行大量 CPU 密集處理（如影像處理、壓縮、加密）時，使用 worker threads 可平行執行任務而不阻塞主執行緒。

---

### 🧠 Q4：如何在多執行緒間共享資料？

worker_threads 可使用 SharedArrayBuffer 與 Atomics。

child_process 間則無法共用記憶體，只能靠訊息傳遞。

## 📘 延伸學習資源

- [Node.js 官方文件 – worker_threads](https://nodejs.org/api/worker_threads.html)
- [Node.js child_process 模組介紹](https://nodejs.org/api/child_process.html)
- [理解 SharedArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer)