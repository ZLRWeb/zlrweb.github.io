# Node.js 效能優化與記憶體分析重點

## 📌 1. 效能瓶頸常見來源

| 類型           | 範例                                 |
|----------------|--------------------------------------|
| ❌ 同步阻塞     | 大型排序、同步 I/O                   |
| ❌ 記憶體洩漏   | 未釋放 closure、全域變數、過大快取   |
| ❌ 頻繁 GC      | 太多短命物件或大物件                 |
| ❌ 事件迴圈卡住 | 長時間執行的 callback                |
| ❌ thread pool 滿載 | 同時大量 fs/crypto 非同步任務    |

## 📌 2. 效能優化原則

- 避免同步函式（如 fs.readFileSync()）
- 拆解 CPU 密集任務（改用 Worker Thread 或外部服務）
- 減少 GC 壓力（重複利用物件、避免產生短命大物件）
- 避免記憶體洩漏（解除不必要的閉包、監控物件數量）
- 限制 thread pool 負載（合理分配非同步任務）

## 📌 3. 記憶體管理與垃圾回收（GC）

Node.js 使用 V8 記憶體模型：

| 區段              | 用途                         |
|-------------------|------------------------------|
| New Space         | 小型、短生命週期的物件（快 GC）|
| Old Space         | 大型、長壽命物件（慢 GC）    |
| Code Space        | 儲存已編譯的程式碼           |
| Large Object Space| 大於固定大小的物件           |
| Map Space         | 儲存內部元資料               |

垃圾回收策略：
- Scavenge：處理 New Space（快速）
- Mark-Sweep / Mark-Compact：處理 Old Space（較慢，會造成延遲）

✅ 若物件從 New Space 活太久，會被提升到 Old Space。

## 📌 4. 提升效能的實務策略

### ✅ 減少 I/O 阻塞：
- 改用非同步函式 (fs.promises)
- 使用快取層（如 Redis）

### ✅ 避免事件迴圈卡住：
```javascript
// 將重運算拆分避免阻塞
setImmediate(() => doHeavyTask());
```

### ✅ 使用 cluster 或 worker_threads：
- cluster: 適用於多核心 HTTP server
- worker_threads: 適合拆解 CPU 密集邏輯

## 📌 5. 常用效能分析工具

| 工具                        | 功能                         |
|-----------------------------|------------------------------|
| --inspect / chrome://inspect| 啟用 V8 Inspector（Chrome DevTools）|
| node --trace-gc             | 顯示 GC 執行紀錄             |
| process.memoryUsage()       | 查看記憶體使用狀況           |
| clinic.js                   | 視覺化效能瓶頸分析           |
| heapdump                    | 產生記憶體快照               |
| v8.getHeapStatistics()      | 查詢 V8 分區記憶體狀態       |

## 📌 6. 觀測記憶體與效能

```javascript
console.log(process.memoryUsage());
```

```json
{
  "rss": 23068672,
  "heapTotal": 4569088,
  "heapUsed": 2923664,
  "external": 1050
}
```

- heapUsed：實際使用中的 JS 記憶體
- rss：常駐記憶體（包含 C++、快取、堆疊等）

## 📌 7. 常見面試題與解析

### 🧠 Q1：如何處理 Node.js 中 CPU 密集任務？

✅ 建議答法：

Node.js 單執行緒執行 JS，無法有效處理長時間 CPU 密集任務。可將此類任務移至 worker_threads 執行，或將其委派至外部微服務（如 Python 或 Go 實作）。

---

### 🧠 Q2：如何避免記憶體洩漏？

✅ 建議做法：
- 移除不再使用的 closure 引用
- 清除大型 cache 或 map 中未使用 key
- 避免無限成長的資料結構（如 global array）
- 使用工具如 heapdump 觀察 retained size

---

### 🧠 Q3：process.memoryUsage() 和 heapdump 有何不同？

| 工具                  | 說明                                 |
|-----------------------|--------------------------------------|
| process.memoryUsage() | 即時數字，快速掌握趨勢               |
| heapdump              | 詳細記憶體快照，可用 Chrome DevTools 分析 |

## 📘 延伸學習資源

- [Node.js Poor Performance Best Practices (官方)](https://nodejs.org/en/learn/diagnostics/poor-performance#poor-performance)
- [V8 Memory Management Docs](https://v8.dev/docs/memory-management)
- [NearForm Clinic 工具](https://clinicjs.org/)
- [Chrome DevTools: Memory Profiler](https://developer.chrome.com/docs/devtools/memory)