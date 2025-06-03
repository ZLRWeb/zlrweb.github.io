# Node.js Event Loop

## 📌 1. 基本概念

Node.js 採用 單執行緒（single-threaded）非阻塞 I/O 架構。

Event Loop 是負責協調 非同步任務的核心機制。

所有非同步任務都會被排入隊列中等待事件循環依序執行。

## 📌 2. Event Loop 流程階段（六個階段）

| 階段名稱           | 處理對象                        |
|--------------------|---------------------------------|
| timers             | setTimeout / setInterval        |
| pending callbacks  | 某些系統操作的回呼              |
| idle, prepare      | 內部使用                        |
| poll               | I/O 事件發生與回應              |
| check              | setImmediate                    |
| close callbacks    | socket.on('close')              |

✅ 每一輪事件循環稱為 一個 tick。

## 📌 3. 微任務 vs 巨任務（Microtasks vs Macrotasks）

| 任務類型   | 代表                                         |
|------------|----------------------------------------------|
| Microtask  | process.nextTick, Promise.then, queueMicrotask |
| Macrotask  | setTimeout, setImmediate, I/O callback        |

執行順序：

每次 macrotask 結束後，會立刻清空 microtask 隊列再進入下一輪 event loop。

## 📌 4. 常見面試題與範例

### 🧠 Q1：請解釋 Event Loop 在 Node.js 中的運作方式。

✅ 建議回答：

Node.js 使用單執行緒的事件迴圈搭配非阻塞 I/O 模型，將非同步操作排入事件隊列中，並依據不同階段（timers、poll、check 等）逐步處理 callback。每完成一個 macrotask 後會清空所有 microtask。這讓 Node.js 在處理大量 I/O 時仍具有高效能。

### 🧠 Q2：以下程式碼輸出順序為何？

```javascript
console.log('start');

setTimeout(() => {
  console.log('timeout');
}, 0);

setImmediate(() => {
  console.log('immediate');
});

Promise.resolve().then(() => {
  console.log('promise');
});

process.nextTick(() => {
  console.log('nextTick');
});

console.log('end');
```
✅ 預期輸出順序：

```
start
end
nextTick
promise
timeout / immediate （非定義順序）
```

✅ 解析：

nextTick 與 Promise 屬於 microtask，會在目前 tick 結束後立即執行。

setTimeout 和 setImmediate 為 macrotask，可能順序不定，取決於環境（如是否在 I/O callback 內觸發）。

### 🧠 Q3：process.nextTick 與 setImmediate 有什麼差異？

| 特性       | process.nextTick                  | setImmediate                         |
|------------|-----------------------------------|--------------------------------------|
| 優先順序   | 高（microtask）                   | 低（macrotask）                      |
| 執行時機   | 當前 tick 結束後立即執行         | poll 階段後的 check 階段執行         |
| 使用情境   | 優先保證 callback 被執行（但會阻塞 event loop） | 延遲至下一輪 tick 更安全             |

✅ 建議答法：

process.nextTick 會在當前事件循環結束前執行，因此過度使用可能阻塞整個事件迴圈；而 setImmediate 保證在下一輪事件循環的 check 階段執行，適合不影響當前流程的延遲處理。

### 🧠 Q4：為何 Node.js 採用單執行緒模型？
✅ 建議答法：

JavaScript 語言設計為單執行緒，Node.js 透過事件驅動與非阻塞 I/O，配合底層 libuv 的多執行緒 I/O 操作實現高併發。這種模型適合 I/O 密集型應用，例如 API server、文件上傳等。


### 📘 延伸學習資源
- [Node.js 官方文檔：Event Loop 說明](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick)

- [Philip Roberts - What the heck is the event loop?（JSConf Video）](https://www.youtube.com/watch?v=8aGhZQkoFbQ)

- [Node.js Internals – Deep dive into event loop](https://blog.insiderattack.net/event-loop-and-the-big-picture-nodejs-event-loop-part-1-1cb67a182810)