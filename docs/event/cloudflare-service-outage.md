原文： https://blog.cloudflare.com/cloudflare-service-outage-june-12-2025/

**事件概述與基本資訊**
2025 年 6 月 12 日，Cloudflare 經歷了一次嚴重的服務中斷，持續了 2 小時 28 分鐘，全球範圍內使用受影響服務的所有 Cloudflare 客戶都受到了影響 [1, 2]。這次中斷並非由於攻擊或任何安全事件，也未導致任何數據丟失 [3]。

**根本原因**
此次中斷的根本原因是 Cloudflare 的 Workers KV 服務所使用的底層儲存基礎設施發生故障 [2]。Workers KV 是一個關鍵的依賴項，許多 Cloudflare 產品都依賴它來進行配置、身份驗證和資產交付 [2, 4]。這部分基礎設施由一個第三方雲提供商支援，該提供商當天經歷了中斷，直接影響了 Workers KV 服務的可用性 [2]。

Cloudflare 承認這是他們自身設計上的失誤，並對此深感抱歉，儘管直接原因（或觸發因素）是第三方供應商的故障，但他們對所選擇的依賴項以及如何圍繞它們進行架構負有最終責任 [3]。Workers KV 被設計為一種「無核心（coreless）」服務，旨在避免單點故障，因為它在全球各地的每個地點獨立運行 [5]。然而，Workers KV 目前仍依賴一個中央數據儲存作為數據的真相來源。該儲存的故障導致了 Cloudflare 各服務所使用的 KV 命名空間的冷讀取和寫入完全中斷 [5]。

值得注意的是，Workers KV 正在向更具彈性的基礎設施（Cloudflare R2）過渡，以防止數據一致性問題並改善數據駐留要求 [5]。這次事件暴露了在過渡期間的覆蓋空白 [5]。

**受影響的服務及其具體影響**
多項關鍵的 Cloudflare 服務受到了中斷的影響，其程度因服務而異：

*   **Workers KV**：90.22% 的請求失敗，任何未被緩存且需要從 Workers KV 源儲存後端檢索的鍵值對都導致了帶有 503 或 500 響應碼的失敗請求 [6]。儘管如此，已儲存在 Workers KV 中的數據並未受到影響 [7]。
*   **Access**：在事件期間，Access 服務 100% 的基於身份的登錄失敗，包括自託管、SaaS 和基礎設施類型的應用程序 [7]。用戶身份信息在事件期間無法提供給 WARP 和 Gateway 等其他服務 [7]。Access 的設計是當無法成功獲取策略配置或用戶身份時會「關閉失敗（fail closed）」[7]。主動的基礎設施應用程序 SSH 會話若啟用命令記錄，由於對 Workers KV 的依賴而無法保存日誌 [8]。Access 的跨域身份系統（SCIM）也受到影響，導致用戶身份未能更新 [8]。服務身份驗證登錄（如服務令牌、Mutual TLS 和基於 IP 的策略）和旁路策略未受影響 [9]。
*   **Gateway**：大多數 Gateway DNS 查詢未受影響 [9]。然而，帶有身份規則的 DoH 查詢失敗，因為 Gateway 無法檢索所需的用戶身份信息 [9]。部分用戶的身份驗證 DoH 服務中斷，新會話或刷新身份驗證令牌的用戶無法連接 [10]。Gateway 代理、出站和 TLS 解密服務的用戶無法連接、註冊、代理或記錄流量，這是因為需要 Workers KV 來檢索最新的身份和設備狀態信息 [10]。Gateway 在此情況下也會「關閉失敗」，以防止流量繞過客戶配置的規則 [10]。
*   **WARP**：WARP 客戶端受到影響，因為其核心依賴於 Access 和 Workers KV，這對於設備註冊和身份驗證是必需的 [11]。因此，事件期間沒有新客戶端能夠連接或註冊 [11]。現有 WARP 客戶通過 Gateway 代理的會話也中斷了 [11]。WARP 緊急斷開覆蓋功能也因底層依賴 Workers KV 的故障而失效 [11]。消費者版 WARP 也受到了類似的零信任版本影響 [12]。
*   **Dashboard**：儀表板用戶登錄和大多數現有儀表板會話不可用，原因是 Turnstile、Durable Objects、KV 和 Access 服務中斷 [12]。標準登錄因 Turnstile 不可用而失敗，Google 登錄因 KV 依賴問題而失敗，SSO 登錄則完全依賴 Access 而失敗 [12]。Cloudflare v4 API 在此事件中未受影響 [12]。
*   **Challenges 和 Turnstile**：支持 Cloudflare Challenges 和 Turnstile 的挑戰平台在事件期間，由於依賴 Workers KV 和 Durable Objects，導致 siteverify API 請求出現高失敗率和超時 [13]。儘管啟用了應急開關以防止用戶被阻止，但這可能允許惡意行為者多次使用以前有效的令牌進行繞過攻擊 [13]。然而，Turnstile 檢測機器人的能力未受影響 [14]。
*   **Browser Isolation**：現有的基於鏈接的瀏覽器隔離會話受到影響，因為它依賴 Gateway 進行策略評估 [14]。新的基於鏈接的瀏覽器隔離會話無法啟動，因為它依賴 Cloudflare Access [14]。
*   **Images**：在事件期間，Cloudflare Images 的批量上傳受到影響，峰值時失敗率為 100% [14]。其他上傳未受影響 [14]。整體圖片交付成功率降至約 97% [15]。圖片轉換和 Polish 功能未受顯著影響 [15]。
*   **Stream**：Stream 的錯誤率在事件期間超過 90%，因為無法提供視頻播放列表 [15]。Stream Live 的錯誤率達 100% [15]。視頻上傳未受影響 [15]。
*   **Realtime**：Realtime TURN 服務（使用 KV）受到嚴重影響，錯誤率在事件期間接近 100% [15]。Realtime SFU 服務無法創建新會話，儘管現有連接得以維持，導致流量降至正常水平的 20% [15]。
*   **Workers AI**：事件期間，Workers AI 的所有推斷請求都失敗了 [16]。Workers AI 依賴 Workers KV 來分發 AI 請求的配置和路由信息 [16]。
*   **Pages & Workers Assets**：Cloudflare Pages 和 Workers Assets 提供的靜態資產（如 HTML、JavaScript、CSS、圖片等）儲存在 Workers KV 中 [16]。Workers Assets 的總請求錯誤率平均增加了約 0.06% [16]。Pages 的錯誤率在事件期間峰值接近 100%，所有 Pages 構建都無法完成 [16]。
*   **AutoRAG**：AutoRAG 由於依賴 Workers AI 模型而在此次事件中不可用 [17]。
*   **Durable Objects**：使用 SQLite 作為後端的 Durable Objects 與 Workers KV 共享相同的底層儲存基礎設施 [17]。事件期間平均錯誤率峰值達到 22%，並在服務恢復時降至 2% [17]。使用舊版鍵值儲存的 Durable Object 命名空間未受影響 [17]。
*   **D1**：D1 數據庫與 Workers KV 和 Durable Objects 共享相同的底層儲存基礎設施 [18]。與 Durable Objects 類似，錯誤率峰值為 22%，恢復時降至 2% [18]。
*   **Queues & Event Notifications**：Queues 消息操作（包括推送和消費）在事件期間不可用 [18]。Queues 使用 KV 將每個隊列映射到底層的 Durable Objects [18]。Event Notifications 使用 Queues 作為其底層交付機制 [18]。
*   **AI Gateway**：AI Gateway 建立在 Workers 之上，並依賴 Workers KV 進行客戶端和內部配置 [19]。事件期間，AI Gateway 的錯誤率峰值達到 97% [19]。
*   **CDN**：自動化流量管理基礎設施運行正常，但在影響期間效能降低 [19]。Zero Trust 客戶的註冊請求大幅增加，導致部分 Cloudflare 地點（如聖保羅、費城、亞特蘭大和羅利）負載增加，觸發了自動化流量管理系統的響應 [19]。系統將傳入的 CDN 流量重新路由到附近的地點，減少了對客戶的影響 [19]。然而，仍有部分流量未按預期重新路由，正在調查中，受影響的 CDN 請求可能會出現延遲增加、HTTP 499 錯誤和/或 HTTP 503 錯誤 [19]。
*   **Workers / Workers for Platforms**：Workers 和 Workers for Platforms 依賴第三方服務進行上傳 [20]。事件期間，Workers 的總體錯誤率峰值約為 2%，Workers for Platforms 的峰值約為 10% [20]。
*   **Workers Builds (CI/CD)**：從 UTC 時間 18:03 開始，Workers builds 無法接收新的源代碼管理推送事件，因為 Access 服務中斷 [20]。事件期間，100% 的新 Workers Builds 失敗 [20]。
*   **Browser Rendering**：Browser Rendering 依賴 Browser Isolation 來獲取瀏覽器實例基礎設施 [21]。對 REST API 和 Workers Browser Binding 的請求在事件期間 100% 受影響 [21]。
*   **Zaraz**：在事件期間，100% 的請求受到影響 [21]。Zaraz 依賴 Workers KV 配置來處理網站流量 [21]。

**事件時間線**
以下是事件的關鍵時間點（所有時間均為 UTC）：
*   **2025 年 6 月 12 日 17:52**：**事件開始**。Cloudflare WARP 團隊開始發現新設備註冊失敗並著手調查，隨後宣布事件 [22]。
*   **2025 年 6 月 12 日 18:05**：Cloudflare Access 團隊收到錯誤率快速增加的警報 [23]。多個服務的服務水平目標（SLO）低於目標，觸發了相關團隊的警報 [23]。
*   **2025 年 6 月 12 日 18:06**：多個服務特定事件合併為一個單一事件，因為識別出共同原因（Workers KV 不可用），事件優先級升級至 P1 [23]。
*   **2025 年 6 月 12 日 18:21**：由於影響的嚴重性變得清晰，事件優先級從 P1 升級至 P0 [23]。
*   **2025 年 6 月 12 日 18:43**：Cloudflare Access 團隊開始探索通過遷移到不同的後端數據存儲來移除 Workers KV 依賴的選項，這是預防性措施，以防儲存基礎設施持續不可用 [24]。
*   **2025 年 6 月 12 日 19:09**：Zero Trust Gateway 開始著手移除對 Workers KV 的依賴，通過優雅地降級引用身份或設備狀態的規則 [24]。
*   **2025 年 6 月 12 日 19:32**：Access 和 Device Posture 強制丟棄身份和設備狀態請求，以減輕 Workers KV 的負載，直到第三方服務恢復在線 [24]。
*   **2025 年 6 月 12 日 19:45**：Cloudflare 團隊繼續努力部署 Workers KV 版本到替代的後端數據存儲，並讓關鍵服務將配置數據寫入該存儲 [25]。
*   **2025 年 6 月 12 日 20:23**：隨著儲存基礎設施開始恢復，服務開始恢復 [25]。由於服務重新填充緩存導致的請求湧入，仍然存在不可忽略的錯誤率和基礎設施速率限制 [25]。
*   **2025 年 6 月 12 日 20:25**：隨著第三方服務的恢復，Access 和 Device Posture 恢復調用 Workers KV [25]。
*   **2025 年 6 月 12 日 20:28**：**影響結束**。服務水平目標恢復到事件前水平 [25]。
*   **事件結束**：Cloudflare 團隊看到所有受影響的服務恢復正常功能，服務水平目標警報恢復 [26]。

**補救措施與後續步驟**
Cloudflare 正在立即採取措施，提高依賴 Workers KV 和其儲存基礎設施的服務的彈性 [26]。這包括加速現有的計劃工作 [26]。具體措施包括：

*   **加強 Workers KV 儲存基礎設施的冗餘性**：正在積極推進的工作，以消除對任何單一提供商的依賴 [27]。在事件期間，他們已經開始將關鍵 KV 命名空間切換並回填到自己的基礎設施，以防事件持續 [27]。
*   **縮小單個產品的影響範圍**：正在積極進行的工作，以使每個受此事件影響的產品都能夠抵禦任何單點故障（包括第三方依賴）導致的服務損失 [27]。
*   **實施漸進式重新啟用命名空間的工具**：正在積極進行的工作，這將允許他們在儲存基礎設施事件期間逐步重新啟用命名空間，確保關鍵依賴（包括 Access 和 WARP）能夠在不導致自身基礎設施拒絕服務風險的情況下恢復，因為緩存會被重新填充 [28]。

Cloudflare 表示這份清單並不詳盡，其團隊將繼續重新審視設計決策，並評估在近期和長期需要進行的基礎設施變革，以減輕未來類似事件的發生 [28]。

**Cloudflare 的責任與承諾**
Cloudflare 深知大小組織和機構都依賴其服務來保護和/或運行其網站、應用程序、零信任和網絡基礎設施 [29]。他們再次對此次事件的影響深感抱歉，並正在努力提高服務的彈性 [29]。

**相關事件**
值得注意的是，這不是 Cloudflare 唯一一次經歷中斷。例如，在 2025 年 4 月 28 日，葡萄牙和西班牙的停電影響了互聯網流量和連接 [30]。此外，2025 年 3 月 21 日和 2025 年 2 月 6 日，Cloudflare 也經歷了涉及 R2 對象儲存服務的事件，導致了錯誤率的升高 [31]。