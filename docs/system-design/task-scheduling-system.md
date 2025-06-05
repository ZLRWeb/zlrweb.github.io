# 任務調度系統設計

本文透過 'NotebookLM' 整理 Youtube 上影片內容，用於紀錄與學習，來源：
https://youtu.be/fvygzszm4ac

覺得有幫助的話可以給頻道主點個讚支持😇

## 摘要

文本來源對設計任務調度系統進行了深入討論。
文章強調了在系統設計中進行**權衡取捨**的重要性，並以任務調度系統為例，探討了**系統類型**（內部/外部）、**調度類型**以及**任務類型**等方面的初步決策。
隨後，作者闡述了設計**最低可行產品 (MVP)** 的必要性，並確定了使用者可以**提交任務**和**查看執行結果**等核心功能需求。
文章還討論了**非功能性需求**，如低延遲、可擴展性和可靠性，並進一步探討了**數據模型**設計和任務狀態轉換。
最後，文章提出了不同的系統架構方案，包括使用**數據庫**或**消息隊列**作為數據存儲和任務分發機制，並分析了**工作節點與任務協調者之間的通信模式**。
討論也觸及了**資源管理與優化**以及如何實現**定時任務**和**任務依賴**等進階功能。

## 內容分析

這個設計是針對一個**任務調度系統 (Job Scheduling System)** [1]。在系統設計時，需要在不同方向進行權衡取捨 [1]。

首先，討論從定義系統的範圍 (scope) 開始 [1]：
*   **內部系統 (Internal System) vs. 公開系統 (Public System)**：假設這是一個內部系統 (Internal System)，用戶量大約在幾萬人 (10K) 左右 [1]。如果對外公開 (public)，用戶可能超過一百萬 (1M) [1]。對於內部系統，可討論的點可能多一點 [1]。
*   **調度器類型 (Scheduler Type)**：提到了一些現有的調度器，如 Cron、Spark、Linc job [1]。需要設計一個特定類型的調度器 [1]。
*   **任務類型 (Task Type)**：任務可以是短暫執行的腳本 (script) [1] 或長時間運行的服務 (long-running service) [1, 2]，例如監聽 web 或一直運行 [1]。設計應包含這兩種類型 (job can be all type) [1]。

設計過程強調先實現一個**最小可行產品 (Minimum Viable Product, MVP)**，滿足最基本的功能，並限定初步的範圍 [1]。設想一個最基礎的調度器來進行設計 [1]。

**功能需求 (Functional Requirements)** 包括 [1, 3]：
*   用戶可以**提交 (submit)** 任務 [1].
*   系統在後台執行任務 (System background execution) [1].
*   用戶可以**查看任務的執行結果 (task result)** [1, 3].

**進階功能 (Advanced Future)** 可能包括 [1, 3]：
*   調度未來的任務 (schedule some task in future) [1].
*   設定定時任務 (cron service)，如每隔 30 分鐘執行或每天特定時間執行 [1, 2].
*   支持有任務依賴關係的 DAG (Directed Acyclic Graph) 任務，例如任務 A 跑完後才能跑任務 B 和 C [2, 3].

**非功能需求 (Non-functional Requirements)** 考慮了 [3]：
*   **延遲 (Latency)**：提交的任務應在 1 秒內執行 (task execution within 1 second) [3]。查看結果的儀表板 (dashboard) 可以在 60 秒內更新 (dashboard within 60 seconds) [3]。
*   **可擴展性 (Scalability)**：系統應能擴展以處理大量任務 [3].
*   **可靠性 (Reliability)**：系統需要考慮到可靠性問題 [3]。如果系統崩潰後重啟，需要重新撿起正在執行的任務 [3]。

**任務數據模型 (Job Data Model)** 的設計包括兩部分 [3]：
1.  **可執行文件 (executable file)** 或配置 (config)，它們可以被抽象成一個可執行的二進制文件 (binary file) [3]。這部分可以存儲在一個獨立的倉庫 (repository) 或對象存儲服務中，如 AWS S3 [4].
2.  **元數據 (Meta Data)**，包含任務相關的資訊 [3]。例如：
    *   ID [3]
    *   OwnerId [3]
    *   可執行文件的二進制 URL (Binary URL) [3]
    *   Input 和 Output 路徑 (Input and Output paths) [3]
    *   創建時間 (Create time) [3]
    *   執行結果 (Execution result) [3]
    *   重試次數 (Number of retries) [3]

**任務狀態轉換 (State Transition)** 是一個核心問題 [3]。設計了一個簡單的狀態轉換機 [3, 4]：
*   **Ready (0 狀態)**：初始狀態 [3].
*   **Waiting (排隊等待)**：任務提交後進入此狀態 [3].
*   **Executing (執行中)**：從 Waiting 狀態進入 [3].
*   **Success (成功)**：執行完成且成功 [3].
*   **Failed (失敗)**：執行失敗 [3].
    *   如果重試次數 (number of retries) 小於閾值 (例如 3 次) [3, 4]，回到 Waiting 狀態等待下一次執行 [3, 4]。
    *   如果重試次數大於等於閾值 [4]，進入 **Final Fail** 狀態 [3, 4]。

**高層級架構圖 (High-Level Diagram)** 包括以下組件 [4]：
*   **Repository**：存儲代碼、配置或可執行二進制文件，例如 AWS S3 [4]。
*   **Client**：客戶端，可以提交任務請求 [4].
*   **Submission**：接收客戶端的任務請求 [4].
*   **Data Store**：數據存儲，用於保存任務資訊和狀態 [4]。Submission 將任務保存到 Data Store [4]。Dashboard 也從 Data Store 讀取任務狀態 [4].
*   **Queue (MQ)**：消息隊列，用於緩衝和解耦提交和執行過程 [4, 5]。任務提交後進入 Queue [4]。Worker 從 Queue 獲取任務 [4].
*   **Worker**：工作節點，從 Queue 獲取任務並執行 [4].
*   **Dashboard**：儀表板，用於查看任務執行狀態 [4].

**數據存儲 (Data Store)** 的選擇和討論 [4, 5]：
*   通過對內部系統的用戶量 (10K) 和每個用戶每天提交的作業數 (100) 進行估算，計算出每日總作業數為 10^6 [4]。假設每日 10 萬秒，提交的 QPS 大約是 10，峰值 QPS 估計約為 50 [4]。Dashboard 的讀 QPS 估計約為 100，峰值 QPS 約為 500 [4]。這些 QPS 值相對較低 [4]。
*   在 Dashboard 和 Data Store 之間可以考慮加緩存 (cache) 來滿足 60 秒延遲的需求 [4]。緩存的 TTL (Time To Live) 可以設為 60 秒 [4]。但由於 QPS 不高，初步設計可能不需要緩存 [4]。
*   對於寫入 QPS (提交任務)，估算結果也很低 (峰值約 50) [4]。
*   考慮單數據庫的風險 (單點故障) [4]。可以考慮使用主從複製 (Master-Replica) 或雙主結構 (Dual Master) 來提高可靠性，實現雙機熱備 [4, 5]。
*   討論了使用 **NoSQL 數據庫的可能性** [5]。來源資料中認為場景沒有強烈要求使用關係型數據庫 (relational database) [5]。判斷使用 SQL 或 NoSQL 通常看三個信號 [5]：
    1.  **數據模型 (Data model)**：是否需要外鍵約束 (foreign key) [5]。
    2.  **查詢模式 (Query pattern)**：是否需要做聯表查詢 (join) [5]。
    3.  **一致性要求 (Consistency requirement)**：是否可以放寬到最終一致性 (eventual consistency) 而非強一致性 (strong consistency) [5]。
    *   對於這個任務調度系統，這三個信號都不強烈支持必須使用 SQL [5]。沒有外鍵約束、聯表查詢的需求，且由於延遲要求較寬，最終一致性可能也可以接受 [5]。因此，NoSQL 也是一個可選項 [5]。
*   如果沒有強烈的信號指向特定類型的數據庫，可以遵循 **"延遲決策 (Defer Decision)" 或 "Defer Commitment" 原則** [5]。這原則源自整潔架構 (Clean Architecture)，旨在保留更多選項，推遲細節決策，以增加未來變更的靈活性 [5]。

**消息隊列 (MQ)** 的進一步討論 [5, 6]：
*   引入 MQ 是為了**解耦 (decouple)** 上下游的執行和提交過程 [5]。
*   考慮 MQ 的實現類型：**內存隊列 (in-memory queue)** 或 **持久化隊列 (persistent queue)** [5]。
    *   **內存隊列**：無狀態 (stateless)，擴展方便 [5]。缺點是數據可能丟失 [5]。
    *   **持久化隊列**：數據不丟失 [5]。缺點是擴展較麻煩 [5]。
*   討論了同時使用 Data Store 和 MQ 可能帶來的問題 [5, 6]：
    *   數據可能在兩邊重複存儲 [5, 6]。
    *   可能導致兩邊數據不一致 [6]。
    *   引入事務 (transaction) 或分佈式鎖 (distributed lock) 來保證雙寫一致會增加額外複雜性和風險 [6]。例如，MQ 故障可能導致 Data Store 也無法寫入，這與解耦的目的相悖 [6]。
*   另一種思路是讓 Data Store 作為數據的單一事實來源 (source of truth)，MQ 中的數據依賴於 Data Store [6]。但這又引出問題：為什麼需要兩套數據系統？ [6]

**數據系統的替代方案 (Alternatives for Data Systems)** [6, 7]：
*   **能否使用 MQ 作為 Data Storage (比如 Configuration Database)**？ [6]
    *   技術上可行，且在低 QPS 場景下能夠承受 [6]。支持分區 (partitioning) [6]。
    *   優勢：延遲非常低 (low latency)，能提供較低的 SLA 保證 [6]。
    *   缺點：增加工程師負擔 [6]。流表一體 (streaming database) 概念相對較新，接受度低 [6]。後期運維複雜性可能高 (Operation complexity) [6]。
*   **能否使用 Data Storage 作為 MQ (比如 Database as MQ)**？ [6]
    *   技術上可行，且業界接受度更高 [6]。例如 Google 的 Spanner 實現了基於其數據存儲的 Pull 和 Push 語義的隊列 [6]。業界有不少實例 [6]。
    *   缺點：單機性能可能不高 (除非使用 Spanner 這類高性能數據庫) [6]。
    *   優勢：可以通過分庫分表 (sharding) 解決性能問題 [6]。在此低 QPS 場景下完全可行 [6]。
    *   具體實現：可以在 Data Store 中存儲任務，然後通過定時查詢 (例如 `SELECT * FROM job_table WHERE status = 'Waiting' AND ... ORDER BY ... LIMIT N`) 來實現隊列語義 [6, 7]。
*   最終建議：可以單獨加入一個 **Informer (發布者)** [7]。Informer 定時查詢 Data Store 中的等待執行任務，然後將這些任務發布出去 [7]。這將 Data Store 和 Worker 隔離開 [7]。

**Worker 通信模型 (Worker Communication Models)**：當 Informer 獲取到等待執行的任務後，如何將其交給 Worker 執行？有三種方案 [7, 8]：
1.  **Pull 模型 (Worker 主動拉取)**：Worker 發起 RPC 請求，從 Informer 或 Queue 拉取任務 [7]。
    *   優點：Informer 管理負擔輕 [7]。Fire and forget 模式 [7]。
    *   缺點：Worker 需要不停輪詢 (polling)，95% 時間可能空轉 [7]。RPC 從 Worker 發起，Worker 需要較高權限，安全性較差 [7]。Worker 可能崩潰，導致狀態無法更新 [7]。
2.  **Push 模型 (Informer 推送)**：Informer 發起 RPC，將任務推給 Worker [7]. Informer 需要跟蹤 Worker 狀態 [7].
    *   優點：解耦 Worker，只有在有任務時才啟動 Worker [7]。
    *   缺點：Informer 需要長期追蹤 Worker 狀態 [7]。可能需要額外強一致性服務 [7]。Informer 需要知道每個 Task 對應的 Worker 地址 [7].
    *   Worker 需要定期發送心跳 (heartbeat) 更新狀態，否則可能擁塞 [7]。對 Long-running service 任務類型，Timeout 不可行 [7]。
3.  **混合模型 (Push + Sidecar)**：Informer 將 Task 推送出去 [7]。Worker 旁邊搭載一個 Sidecar 進程，負責監控 Worker 運行狀態並定期發送心跳 (每 60 秒一次) [7, 8]。
    *   優點：融合前兩種優勢 [8]。更安全 (Worker 不發起 RPC) [8]。Informer 不需直接維護 Task 和 Worker 的映射 [8]。Sidecar 管理元數據並利用心跳匯報狀態 [8]。如果 Data Store 在一段時間 (例如 180 秒，三次心跳週期) 內未收到心跳，可將任務狀態從 Running 轉為 Failed [7, 8]。Failed 任務根據重試次數決定是 Retry 還是 Final Fail [7, 8]。
    *   缺點：增加了每個 Worker 的開銷 (Sidecar) [8]。

**資源管理與優化 (Resource Management/Optimization)**：如何處理 Worker 資源不足的問題？ [2, 8]
*   **增加機器/資源**：最簡單，但不總可行 (例如成本限制) [8]。
*   **增加等待時間**：使用指數退避 (exponential backoff) 延遲重試，適用於資源暫時緊張的情況 [8]。
*   **節約/優化資源**：
    *   **Worker 隔離/沙箱 (Sandboxing)**：通常使用 VM 或容器隔離任務執行環境以保證安全性 [8]。容器 (Container) 更輕量、節約資源，但暴露更多攻擊面，需要額外隔離層如 GVisor [8]。輕量級 VM (Lightweight VM) 如 Firecracker、Google 的 gVM 或 AWS Firecracker 更智能，體積小 (不超過 5MB)，啟動快 (小於 500ms)，同時保證安全性 [8]。選擇取決於使用場景和團隊工程能力 [8].
    *   **調度優化 (Scheduling Optimization)**：從 Worker 隔離 (可能浪費資源) 轉向混合部署 (Hyper-deployment) [8]。在同一台機器上混合部署不同類型的任務 (如 IO 密集型和 CPU 密集型)，提高機器利用率 [2, 8]。這需要開發特殊的調度算法 [8]。這被稱為重新分配資源 (reallocate resource) [2].
    *   **資源回收 (Recycle Resource)**：系統自動回收用戶過度申請的資源 [2]。用戶常申請比實際需要更多的資源以應對峰值 [2]。通過回收過剩資源可以提高整體性能 [2]。提到 Google 的 Autopilot 和騰訊的 Gocuring 項目作為例子 [2].
    *   **區分任務類型**：對於長時間運行的生產服務 (long-running production service)，需要優先保證其高可用性 [2]。對於執行完就關閉的短暫任務 (terminating task)，如定時備份數據庫，即使延遲十幾分鐘執行也沒問題 [2]。這類任務屬於可搶佔的 (preemptible) 任務 [2]。資源緊張時，可以考慮延後或壓縮這類任務的資源 [2]。需要注意有些資源不可壓縮，如內存 (可能導致 OOM)，而 CPU 減少只會讓執行變慢 [2].

**在基礎調度器上實現進階功能** [2, 9]：
*   **定時任務 (Cron Service)**：可以在基礎調度器之上封裝一個 Client Library [2]。上層可以接入一個 Cron Service 微服務 [2, 9]。Cron Service 維護一個優先級隊列 (priority queue)，按任務的下次運行時間排序 [2]。時間一到，將任務彈出並發送給 Task Scheduler Client 提交 [2]。同時計算任務的下一次執行時間並重新插入隊列 [2, 9]。
*   **DAG 任務 (DAG Service)**：上層添加一個 DAG Service 微服務 [2, 9]。將 DAG 任務丟給此服務 [2]。可以在內存中對任務進行拓撲排序 (topological sort) [2]。按照排序順序，將任務提交給 Task Client [2]。等待 Task Client 返回 Success 信號後，再按順序提交下一個任務 [2].
*   **實現方式權衡**：可以將優先級隊列和拓撲排序邏輯放在 Informer 的內存中，避免維護額外服務，但增加了單個組件的複雜性 [9]。或者將它們抽成獨立的微服務 [9]。獨立微服務降低了複雜性，但增加了額外開銷 [9]。優點是增加了系統的可擴展性 [9]。最終方案取決於具體使用場景 [9].

這個設計過程展示了從需求分析、功能定義、模型設計、架構草圖到細節討論的系統設計思路，並在過程中權衡不同方案的優劣及風險 [1, 5-9]。特別是在數據存儲和隊列選擇上，應用了延遲決策原則 [5]。在 Worker 通信和資源管理方面，探討了多種可行的技術方案及其取捨 [2, 7, 8]。