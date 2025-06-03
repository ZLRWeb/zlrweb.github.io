# Node.js Error Handling

## 📌 1. 錯誤分類

| 錯誤類型                  | 範例                  | 是否可捕捉                |
|---------------------------|-----------------------|---------------------------|
| 語法錯誤 (SyntaxError)    | JSON.parse('{')       | 否，執行前報錯            |
| 執行期錯誤 (RuntimeError) | foo.bar()             | ✅ 可使用 try-catch        |
| 非同步錯誤 (Async error)  | fs.readFile() callback| ✅ 需在 callback 或 catch 處理 |
| 未捕捉例外                | 無 try-catch 包裹     | ❌ 會導致 process crash    |
| 未處理 Promise 拋錯       | Promise 未加 .catch() | ❌ 會觸發全域錯誤          |

## 📌 2. 同步錯誤處理（try-catch）

```javascript
try {
  const json = JSON.parse('{ invalid }');
} catch (err) {
  console.error('解析錯誤:', err.message);
}
```

✅ try-catch 僅限於同步執行區塊。

## 📌 3. 非同步錯誤處理（callback / async）

### callback 範例：
```javascript
fs.readFile('notfound.txt', (err, data) => {
  if (err) {
    console.error('讀檔錯誤:', err.message);
    return;
  }
  console.log(data);
});
```

### async/await 錯誤捕捉：
```javascript
async function loadFile() {
  try {
    const data = await fs.promises.readFile('test.txt');
    console.log(data.toString());
  } catch (err) {
    console.error('讀檔錯誤:', err.message);
  }
}
```

## 📌 4. Promise 錯誤處理

```javascript
doSomething()
  .then(result => doNext(result))
  .catch(err => {
    console.error('錯誤發生:', err.message);
  });
```

✅ 所有鏈式 Promise 中只需一個 .catch() 處理整體錯誤。

## 📌 5. 全域錯誤監控

| 事件                              | 用途                                 |
|------------------------------------|--------------------------------------|
| process.on('uncaughtException')    | 捕捉未處理的同步錯誤（不建議繼續執行）|
| process.on('unhandledRejection')   | 捕捉未處理的 Promise 拋錯            |

```javascript
process.on('uncaughtException', err => {
  console.error('未捕捉例外:', err);
  process.exit(1); // 建議退出，避免應用進入不穩定狀態
});

process.on('unhandledRejection', reason => {
  console.error('未處理 Promise 拋錯:', reason);
});
```

## 📌 6. 實務建議

| 作法                                 | 建議         |
|--------------------------------------|--------------|
| 所有 async function 加 try-catch     | ✅ 必要      |
| 中央錯誤處理 middleware（如 Express）| ✅ 集中處理  |
| 不依賴 uncaughtException 作業務處理   | ❌ 不建議    |
| 拋出 Error 實體（非字串）            | ✅ throw new Error('訊息') |
| 使用型別區分錯誤類型（自訂 error class）| ✅ 增強可讀性與可維護性 |

## 📌 7. 常見面試題與解析

### 🧠 Q1：try-catch 可以包住 fs.readFile() 嗎？

✅ 建議答法：

不行，因為 fs.readFile() 是非同步函式。錯誤只能在 callback 中處理，或使用 fs.promises.readFile() 搭配 async/await 包在 try-catch 裡處理。

---

### 🧠 Q2：為何不建議依賴 uncaughtException 處理錯誤後繼續執行？

✅ 建議答法：

uncaughtException 可能發生在程式進入非預期狀態，無法保證系統完整性與安全性，因此只應記錄錯誤後優雅關閉服務。

---

### 🧠 Q3：如何設計可重用的錯誤處理機制？

✅ 建議：
- 建立自訂錯誤類別（如 AppError, ValidationError）
- 在中介層統一包裝錯誤
- 中央錯誤處理器統一處理輸出格式與狀態碼

## 📘 延伸學習資源

- [The Error Object – MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)
- [Async error handling patterns in Node.js](https://blog.risingstack.com/mastering-async-await-in-nodejs/)