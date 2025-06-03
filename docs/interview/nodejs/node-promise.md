# Node Promise

## 📌 1. 基本概念

Promise 是 ES6 引入的非同步編程解法，用來避免 callback hell。

一個 Promise 物件表示一個尚未完成但預期會完成的操作結果。

| 狀態      | 說明               |
|-----------|--------------------|
| pending   | 初始狀態，尚未結束 |
| fulfilled | 操作成功完成（resolve） |
| rejected  | 操作失敗（reject） |

```javascript
const promise = new Promise((resolve, reject) => {
  if (someCondition) resolve('成功');
  else reject('錯誤');
});
```

## 📌 2. Promise 執行順序與事件循環（Event Loop）

| 類型                | 分類      | 優先順序                       |
|---------------------|-----------|--------------------------------|
| .then, .catch, .finally | Microtask | 高（在 macrotask 後立即執行）   |
| setTimeout, setImmediate | Macrotask | 較低                           |

```javascript
console.log('start');

setTimeout(() => console.log('timeout'), 0);
Promise.resolve().then(() => console.log('promise'));
console.log('end');
```
✅ 預期輸出：

```
start
end
promise
timeout
```

## 📌 3. async/await 是怎麼實現的？

- async 函數本質上會回傳一個 Promise。
- await 會暫停該函數執行，等待 Promise resolve，再繼續執行後續程式。

```javascript
async function main() {
  console.log('1');
  await Promise.resolve();
  console.log('2');
}
main();
console.log('3');
```
✅ 預期輸出：

```
1
3
2
```
❗ await 會將後續程式包進 microtask queue！

## 📌 4. 常見面試題與解析

### 🧠 Q1：Promise 是如何與事件循環互動的？

✅ 建議答法：

Promise 的 .then、.catch 屬於 microtask，在當前事件循環的 macrotask 結束後會立即被執行。這保證了非同步操作的順序性與預測性，也避免 blocking 主執行緒。

---

### 🧠 Q2：以下程式碼輸出順序為？

```javascript
Promise.resolve().then(() => {
  console.log('A');
  Promise.resolve().then(() => {
    console.log('B');
  });
});
```
✅ 預期輸出：

```
A
B
```

✅ 原因：

第一個 .then() 進入 microtask queue，執行時註冊第二個 .then()，然後下一輪 microtask queue 才執行 B。

---

### 🧠 Q3：為何 Promise 被稱為 "微任務"（microtask）？

✅ 建議答法：

因為它在每個事件循環（tick）結束後、進入下一個 macrotask 之前執行。這使得它具有比 setTimeout 等 macrotask 更高的優先級，能即時處理非同步邏輯。

---

### 🧠 Q4：Promise.all 和 Promise.race 差異？

| 方法         | 說明                                   | 使用場景         |
|--------------|----------------------------------------|------------------|
| Promise.all  | 所有都 fulfilled 才成功，任一 reject 則整體失敗 | 多個 API 要成功  |
| Promise.race | 最快的 promise 決定結果（無論成功或失敗）     | 超時處理         |

```javascript
Promise.race([
  fetch('/slow-api'),
  new Promise((_, reject) => setTimeout(() => reject('timeout'), 3000))
])
```

---

### 🧠 Q5：如何將 callback 函式封裝成 Promise？

```javascript
const fs = require('fs');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
readFile('./test.txt', 'utf-8')
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

## 📘 延伸學習資源

- [MDN – Promise](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [Node.js 官方文檔 – process.nextTick vs Promise](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
- [Jake Archibald – Tasks, microtasks, queues and schedules](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/)

