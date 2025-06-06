# (Jules) RESTful API 設計風格與標準探討

## 前言：API 設計的重要性

應用程式介面（API）是現代軟體開發的核心，它允許不同的軟體系統之間進行溝通和數據交換。一個設計良好的 API 不僅能提升開發者體驗，降低整合的複雜性，更能確保系統的可擴展性、安全性及可維護性。隨著微服務架構與雲端運算的普及，API 的角色日益重要，選擇合適的設計風格與遵循業界標準成為成功的關鍵。本文將首先深入探討廣泛應用的 RESTful API 設計原則與標準，接著介紹 GraphQL、gRPC 與 AsyncAPI 等新興的 API 設計風格，最後總結如何根據具體需求選擇最適合的 API 設計。

## RESTful API 設計原則與常見標準

REST (Representational State Transfer) 是一種軟體架構風格，自 Roy Fielding 於 2000 年提出以來，已成為 Web API 設計的主流標準。RESTful API 強調無狀態（Statelessness）、客戶端-伺服器（Client-Server）架構、以及統一介面（Uniform Interface）等原則。以下將參考社群最佳實踐及 Google 等公司的設計指南，詳細介紹 RESTful API 的核心設計原則與標準。

### 1. 資源導向設計（Resource-Oriented Design）

REST 的核心概念是「資源」（Resource）。資源是網路上可被命名的資訊或服務，例如使用者、產品、訂單等。API 的設計應圍繞這些資源展開，並使用名詞（Nouns）而非動詞來標識資源。

*   **URI 使用名詞**：端點路徑應使用名詞來表示資源。例如，獲取所有使用者應使用 `/users`，而非 `/getUsers`。HTTP 方法本身已表達了操作意圖。

### 2. HTTP 方法的正確使用

HTTP 定義了一組標準方法（或稱動詞），用於對資源執行操作。正確使用這些方法是 RESTful 設計的基礎：

*   **GET**：讀取資源。用於獲取資源的表示，不應產生副作用。
    *   **業界範例 (GitHub)**：當透過 GitHub API 請求一個不存在的倉庫時，例如 `GET /repos/octocat/non-existent-repo`，API 會一致地返回 `404 Not Found` 狀態碼，明確指出資源不存在。這是 RESTful API 處理不存在資源的標準做法。
*   **POST**：建立新資源或執行特定操作。
    *   當用於建立資源時，成功後通常返回 `201 Created` 狀態碼，並在 `Location` 標頭中提供新資源的 URI。回應體中通常包含新建立資源的完整表示。
    *   **業界範例 (Stripe API - 建立資源)**：當使用 Stripe API 建立一個新的 Charge 時 (例如 `POST /v1/charges`，雖然此特定端點可能已被更新的 API 取代，但其設計模式仍具代表性)，若建立成功，Stripe API 通常返回 HTTP `200 OK` 狀態碼。值得注意的是，雖然 RESTful 的典型實踐是為新資源返回 `201 Created` 並在 `Location` 標頭中提供新資源的 URI，但 Stripe 的慣例是對於成功的請求（包括創建）返回 `200 OK`，並在回應體中直接包含創建或修改後的完整資源物件。此回應體會包含完整的 Charge 物件，如 ID、金額、狀態等詳細資訊，讓客戶端能立即獲得新資源的完整資訊。這種做法簡化了客戶端的操作，因為它無需再發送一個 GET 請求來獲取新資源的詳細資訊。
    *   若 POST 用於執行一個不直接建立新資源的動作（例如觸發一個流程），則根據操作的性質，成功時可能返回 `200 OK`（若操作同步完成並有回應內容）、`202 Accepted`（若操作被接受異步處理）或 `204 No Content`（若操作成功執行但無內容返回）。
*   **PUT**：完整替換目標資源的所有當前表示。客戶端必須發送資源的完整表示。PUT 操作應具備冪等性，即多次相同的 PUT 請求應產生相同的結果。
    *   **業界範例 (Google API 設計指南 - AIP-134 關於更新操作的考量)**：Google 的 API 設計指南 (AIP-134) 在討論標準更新方法時，雖然最終強烈建議使用 `PATCH`，但也闡述了 `PUT` 的語義。如果一個 API 選擇使用 `PUT` 進行更新 (例如，一個假設的 `PUT /users/{userId}/settings` 端點)，它意味著客戶端必須發送該使用者設定的**完整**表示。任何客戶端未在請求中提供的欄位，都應被伺服器視為應被清除或重置為其資料類型的預設值。這正是 `PUT` 的「完整替換」語義。由於這種行為可能導致意外的數據丟失（如果客戶端僅獲取了部分資源表示，修改後再用 `PUT` 發回，就可能清除掉未獲取的欄位），Google 傾向於使用 `PATCH` 配合 `FieldMask` 進行更新，除非 API 的設計確實意圖僅支持完整替換，且客戶端總是能夠也應該提供完整資源。
*   **PATCH**：對資源進行部分修改。客戶端僅發送需要變更的欄位。與 PUT 不同，PATCH 不要求客戶端發送完整的資源表示，這使其更適合於更新操作，尤其是在資源欄位較多或客戶端只想修改部分內容時。
    *   **業界範例 (Google API - AIP-134 & AIP-161 實踐)**：Google Cloud API 廣泛採用 `PATCH` 方法進行資源更新，並結合 `google.protobuf.FieldMask` (在請求 JSON 中通常表示為 `update_mask` 欄位) 來精確指定哪些欄位需要被修改。例如，要更新一個 Google Cloud Pub/Sub 主題的標籤 (labels)，請求可能是 `PATCH /v1/projects/{project}/topics/{topic}`，請求體中包含 `{"labels": {"new_key": "new_value"}, "update_mask": "labels"}`。這樣 API 只會更新 `labels` 欄位，而資源的其他部分則保持不變。`update_mask` 的值是一個包含要更新欄位路徑的列表 (例如 "labels", "display_name", "config.message_retention_duration")。這種方式提供了高度的靈活性並避免了因 `PUT` 的完整替換語義可能導致的意外數據丟失。如果 `update_mask` 包含特殊值 `"*"`，則表示完整替換所有客戶端提供的欄位，行為類似 `PUT`，但即便如此，API 也只會更新客戶端在請求體中明確提供的欄位，而不是資源的所有欄位。
*   **DELETE**：刪除指定的資源。

### 3. URL 設計最佳實踐

清晰且一致的 URL 結構有助於 API 的理解與使用。

*   **集合使用複數名詞**：表示資源集合時，應使用複數名詞，例如 `/users` 代表所有使用者，`/users/123` 代表 ID 為 123 的特定使用者。
*   **邏輯性巢狀結構**：對於具有層級關係的資源，可以使用巢狀結構表示，但建議保持簡潔，避免過深的巢狀（通常不超過 2-3 層）。例如，獲取某使用者的訂單可使用 `/users/{userId}/orders`。
*   **版本控制**：當 API 發生重大變更可能影響既有客戶端時，應進行版本控制。常見做法是在 URL 中加入版本號，例如 `/v1/users`、`/v2/users`。

### 4. 標準化 JSON 格式

雖然 REST 本身不限定數據格式，但 JSON (JavaScript Object Notation) 已成為事實上的標準，因其輕量、易讀且易於各種程式語言解析。

*   **請求與回應使用 JSON**：API 應接受 JSON 格式的請求體，並返回 JSON 格式的回應。
*   **設定 Content-Type**：HTTP 標頭中的 `Content-Type` 應設定為 `application/json`。

### 5. HTTP 狀態碼與錯誤處理

HTTP 狀態碼提供了標準化的方式來告知客戶端請求的結果。

*   **成功回應 (2xx)**：
    *   `200 OK`：請求成功。常用於 GET 請求成功，或用於 POST/PUT/PATCH 操作成功且有回應內容時。
    *   `201 Created`：資源成功建立。主要用於 POST 請求成功建立新資源後，應伴隨 `Location` 標頭指向新資源的 URI。
    *   `202 Accepted`：請求已被接受處理，但處理尚未完成（異步操作）。適用於耗時較長的 POST/PUT/PATCH 操作。
    *   `204 No Content`：請求成功，但回應體中沒有內容。常用於 DELETE 請求成功，或用於 POST/PUT/PATCH 操作成功但無需返回內容時。
*   **客戶端錯誤 (4xx)**：
    *   `400 Bad Request`：請求無效，例如參數錯誤、請求體格式不正確或語義錯誤。
    *   `401 Unauthorized`：未經授權，客戶端需要提供有效的身份驗證憑證。
    *   `403 Forbidden`：禁止訪問，客戶端已通過身份驗證，但沒有權限訪問該資源。
    *   `404 Not Found`：請求的資源不存在。GET 請求一個不存在的資源時應返回此狀態碼。
*   **伺服器錯誤 (5xx)**：
    *   `500 Internal Server Error`：伺服器內部發生錯誤。
    *   `502 Bad Gateway`：作為閘道或代理的伺服器從上游伺服器收到了無效的回應。
    *   `503 Service Unavailable`：伺服器暫時無法處理請求（例如過載或維護中）。
*   **清晰的錯誤訊息**：除了狀態碼，回應體中應包含易於理解的錯誤訊息，幫助開發者排查問題。

### 6. 安全性考量

API 安全性至關重要，需保護數據免受未經授權的訪問和篡改。

*   **HTTPS (SSL/TLS)**：始終使用 HTTPS 加密客戶端與伺服器之間的通訊。
*   **身份驗證 (Authentication)**：驗證請求者的身份。常見方法包括 Token-based (如 JWT - JSON Web Tokens)、OAuth 2.0 等。
*   **授權 (Authorization)**：驗證已通過身份驗證的請求者是否有權限執行特定操作或訪問特定資源。最小權限原則是一個重要的指導思想。

### 7. 效能考量

API 的效能直接影響使用者體驗和系統負載。

*   **分頁 (Pagination)**：當返回大量數據時，應實施分頁機制，允許客戶端分批獲取數據（例如使用 `?page=1&limit=20`）。
*   **過濾 (Filtering)**：允許客戶端根據特定條件篩選資源（例如 `?status=active`）。
*   **排序 (Sorting)**：允許客戶端指定結果的排序方式（例如 `?sort_by=createdAt&order=desc`）。
*   **快取 (Caching)**：利用 HTTP 快取機制（如 `Cache-Control`, `ETag` 標頭）或伺服器端快取（如 Redis）來減少不必要的請求和數據庫負載。

### 8. 方法的冪等性 (Idempotency) 與安全性 (Safety)

理解 HTTP 方法的特性有助於設計更可靠的 API。

*   **安全性 (Safe Methods)**：`GET`、`HEAD`、`OPTIONS`、`TRACE` 是安全方法，它們不應改變伺服器上的資源狀態。客戶端可以安全地重複呼叫這些方法。
*   **冪等性 (Idempotent Methods)**：`GET`、`HEAD`、`PUT`、`DELETE`、`OPTIONS`、`TRACE` 是冪等方法。對同一資源執行一次或多次相同的冪等請求，其效果應該相同。`POST` 通常不是冪等的（多次提交可能導致建立多個資源）。`PATCH` 的冪等性取決於具體實現。

### 9. 一致性的重要性

在整個 API 設計中保持一致性，包括命名慣例、URL 結構、請求/回應格式、錯誤處理等，可以顯著提升 API 的易用性和可維護性。

### 10. 處理非 CRUD 操作的商業邏輯端點

對於不僅是簡單 CRUD（建立、讀取、更新、刪除）的商業操作，端點設計需要更細緻的考量。以下是一些常見策略：

*   **在資源路徑中使用動詞 (謹慎使用)**：雖然通常建議 URL 中使用名詞，但在某些情況下，如果操作本質上是一個動作且難以用標準 HTTP 方法對資源的 CRUD 操作來清晰表達，可以在 URL 的末尾使用動詞。
    *   **業界範例 (GitHub - Star a repository)**：GitHub API 使用 `PUT /user/starred/{owner}/{repo}` 來標星一個倉庫。這個操作是冪等的 (多次標星同一個倉庫結果一致)，`PUT` 在這裡表示確保「標星」這個狀態存在。相對應地，`DELETE /user/starred/{owner}/{repo}` 用於取消標星。
    *   **業界範例 (Stripe - Capture a PaymentIntent)**：Stripe API 使用 `POST /v1/payment_intents/{payment_intent_id}/capture` 來捕獲一個之前已授權的支付意圖。這裡 `capture` 是一個明確的動作，作用於特定的 `payment_intent` 資源。由於捕獲操作可能會產生新的交易記錄並改變支付意圖的狀態，且多次執行（如果允許）可能會導致問題，因此使用 `POST` 是合適的。
*   **將操作視為子資源或使用特定動作端點**：這是更常見且推薦的做法，將操作視為目標資源的一個子資源或在其上執行的一個明確動作。
    *   **業界範例 (Google Cloud Pub/Sub - Publish a message)**：`POST /v1/projects/{project}/topics/{topic}:publish`。這裡 `:publish` 指明了在特定主題上執行的動作，而不是對主題資源本身的 CRUD 操作。請求體中包含要發布的訊息。這種使用冒號來分隔資源路徑和動作名稱是 Google API 的一種常見模式。
    *   **業界範例 (假設的 Netflix API)**：由於 Netflix 的公開 API 已棄用，我們以一個假設的場景來說明。若要設計「添加到觀看列表」或「播放影片」等操作：
        *   **添加到觀看列表 (Add to Watchlist)**：
            *   `POST /users/{userId}/watchlist`：請求體中包含 `{ "itemId": "movie123", "itemType": "movie" }`。此操作將一個項目添加到觀看列表集合中。使用 `POST` 是因為這會創建一個新的觀看列表條目。
            *   或者，如果觀看列表中的條目本身被視為一個獨立的資源，且使用者可以多次添加或修改觀看狀態（例如，標記為已觀看），則可能是 `PUT /users/{userId}/watchlist/{itemId}`，用於創建或更新特定條目在觀看列表中的狀態。
        *   **播放影片 (Play Video)**：這類操作通常更複雜，可能涉及生成臨時播放 URL、記錄播放進度等。
            *   一個可能的設計是 `POST /users/{userId}/media/{itemId}/play`。這裡 `play` 是一個明確的動作。`POST` 適用於此，因為它可能會在伺服器端創建播放會話、記錄日誌等，並且不是冪等的。回應中可能包含串流媒體的 URL 或播放權杖。

選擇哪種策略取決於操作的語義、冪等性、複雜性以及期望的 API 風格一致性。關鍵是保持清晰和可預測性，並參考業界成熟的實踐。

## 探索替代性 API 設計風格

儘管 RESTful 風格應用廣泛，但在某些複雜場景下，它可能不是最佳選擇。為了解決 REST 的一些限制，社群發展出了其他 API 設計風格。

### 1. GraphQL

GraphQL 是 Facebook 於 2015 年開源的一種 API 查詢語言及伺服器端執行環境。

*   **核心思想**：允許客戶端精確請求其所需的數據，不多也不少。客戶端透過一個查詢語句，可以一次性獲取來自多個資源的數據。
*   **運作方式**：
    *   **強型別結構 (Schema)**：GraphQL API 的核心是一個描述數據類型及其關係的結構（Schema）。
    *   **單一端點**：通常，GraphQL API 只提供一個端點，所有查詢（Query）、變更（Mutation）和訂閱（Subscription）都發送到此端點。
    *   **客戶端指定查詢**：客戶端發送的查詢結構與期望的回應數據結構一致。
*   **使用場景**：
    *   數據模型複雜、資源間關聯性強的應用（例如社交網絡、具有多樣產品結構的電商平台）。
    *   行動應用或前端框架，對減少數據傳輸量和請求次數有較高要求的場景。
    *   客戶端數據需求多樣且不斷變化的情況。
*   **優點**：
    *   **高效的數據載入**：避免了 REST 中常見的過度獲取（Over-fetching）和獲取不足（Under-fetching）問題。
    *   **減少網絡請求次數**：可以透過單一請求獲取多個關聯資源的數據。
    *   **強型別與自文檔化**：Schema 提供了清晰的數據契約，並可透過內省（Introspection）機制自我探索。
    *   **靈活的查詢**：客戶端可以根據自身需求定制查詢。
    *   **API 演進**：通常可以透過添加新欄位和標記舊欄位為棄用（deprecated）來演進 API，而無需像 REST 那樣進行嚴格的版本控制。
*   **限制**：
    *   初始設置可能比簡單的 REST API 更複雜。
    *   快取機制比 REST 的標準 HTTP 快取更複雜。
    *   檔案上傳並非規格核心部分，需要額外實現。
    *   對於查詢的複雜度和速率限制管理可能更具挑戰性。

### 2. gRPC (Google Remote Procedure Call)

gRPC 是 Google 開發的一款高效能、開源的遠程程序呼叫（RPC）框架。

*   **核心思想**：採用合約優先（Contract-First）的設計方法，使用 Protocol Buffers (Protobuf) 作為介面定義語言（IDL）來定義服務和訊息（負載），然後生成客戶端和伺服器端的程式碼。強調效能和強型別合約。
*   **運作方式**：
    *   **Protocol Buffers**：一種語言中立、平台中立、可擴展的序列化數據結構的方法，通常比 JSON 更小更快。
    *   **HTTP/2 傳輸**：利用 HTTP/2 的特性，如雙向串流（Bi-directional Streaming）、多路復用（Multiplexing）、標頭壓縮（Header Compression）等，以提升效能。
*   **使用場景**：
    *   對效能和低延遲有極高要求的內部微服務間通訊。
    *   多語言環境下的服務（Polyglot Systems）。
    *   需要即時數據交換的應用，如物聯網（IoT）、即時更新、聊天服務等。
    *   網絡頻寬受限的環境。
*   **優點**：
    *   **高效能**：由於採用二進制序列化（Protobuf）和 HTTP/2，通常具有比 REST 更低的延遲和更高的吞吐量。
    *   **原生串流支援**：支援單向和雙向串流，這在 REST 中實現起來較為複雜。
    *   **強型別合約**：Protobuf 提供了清晰的服務合約，減少了歧義，並能在編譯時期捕捉錯誤。
    *   **程式碼生成**：自動生成多種語言的客戶端和伺服器端程式碼，簡化開發。
    *   **網絡效率高**：更小的負載和 HTTP/2 的特性使得網絡資源利用更有效率。
*   **限制**：
    *   **可讀性**：Protobuf 的二進制格式不像 JSON 那樣易於人類閱讀和調試。
    *   **瀏覽器支援**：直接的瀏覽器支援有限，通常需要 gRPC-Web 和一個代理（如 Envoy）。REST 則具有普遍的瀏覽器兼容性。
    *   **快取**：REST 更能直接利用標準的 HTTP 快取機制。gRPC 的快取實現可能更為複雜。
    *   **生態系統與工具**：雖然 gRPC 的工具鏈很強大，但對於簡單的 API，REST 的生態系統和工具可能更為廣泛和易於上手。

### 3. AsyncAPI

AsyncAPI 是一個用於描述事件驅動架構（Event-Driven Architectures, EDA）和異步 API 的開源規範。它常被稱為「事件驅動架構的 OpenAPI」。

*   **核心思想**：為基於訊息的異步通訊提供一個機器可讀的合約，類似於 OpenAPI (Swagger) 為 REST API 所做的工作。
*   **運作方式**：
    *   **協議無關性**：AsyncAPI 設計為可與多種異步協議配合使用，如 AMQP (例如 RabbitMQ)、MQTT、Apache Kafka、WebSockets、STOMP 等。
    *   **核心概念**：定義了通道（Channels，訊息傳輸的媒介）、訊息（Messages，傳輸的數據負載和標頭）、操作（Operations，發布或訂閱訊息的動作）和伺服器（Servers，訊息代理或伺服器的連接細節）。
    *   **綁定 (Bindings)**：提供特定於協議的額外資訊。
*   **使用場景**：
    *   描述微服務之間的異步通訊模式（例如事件溯源、CQRS）。
    *   物聯網（IoT）應用中設備與伺服器之間的訊息通訊。
    *   即時數據串流應用（例如金融行情、即時儀表板、遊戲事件）。
    *   任何應用程式需要對事件做出反應而非直接同步請求的系統。
*   **優點（解決 REST 在異步場景的不足）**：
    *   **為異步系統提供清晰文檔**：REST 和 OpenAPI 主要為同步請求-回應互動設計。AsyncAPI 填補了空白，為基於訊息的事件驅動 API 提供了標準化的描述方式。
    *   **程式碼生成**：與 OpenAPI 類似，AsyncAPI 文檔可用於生成客戶端/伺服器端程式碼、文檔和測試案例。
    *   **提升可發現性與理解度**：為如何與事件驅動系統互動提供了清晰的合約。
    *   **標準化**：為描述多樣化的異步系統帶來了通用的語言和格式。
*   **與 REST 的比較**：
    *   **同步 vs. 異步**：REST 是同步的（客戶端發送請求並等待回應）。AsyncAPI 描述的是異步互動（生產者發送訊息，消費者稍後處理；或伺服器向客戶端推送訊息）。
    *   **通訊風格**：REST 通常是請求-回應模式。AsyncAPI 則是發布-訂閱、訊息隊列或事件串流。
    *   AsyncAPI 並非 REST 的直接替代品，而是對其的補充，專門處理 REST 不直接涵蓋的異步通訊方面。

## 結論：選擇合適的 API 設計風格

API 設計沒有一體適用的完美方案。RESTful 風格因其簡單性、成熟的生態系統以及對 HTTP 標準的良好利用，仍然是許多 Web API 的首選，特別是對於公開的、基於資源的 CRUD 操作。

然而，隨著應用場景的日益複雜和多樣化：

*   當客戶端需要高度靈活的數據查詢，以避免不必要的數據傳輸時，**GraphQL** 提供了一個強大的解決方案。
*   當內部服務間通訊對效能、低延遲和串流有極高要求時，**gRPC** 以其基於 HTTP/2 和 Protocol Buffers 的高效能特性脫穎而出。
*   當系統架構以事件驅動為核心，需要清晰定義和管理異步訊息流時，**AsyncAPI** 則彌補了傳統同步 API 描述的不足。

最終，選擇哪種 API 設計風格取決於具體的業務需求、技術棧、團隊熟悉度、效能目標以及客戶端的類型和能力。理解各種風格的優勢與局限，並結合實際情況做出明智的決策，是構建成功軟體系統的關鍵一步。在某些複雜的系統中，甚至可能同時採用多種 API 風格來滿足不同組件的需求。

## 參考來源
Fielding, R. T. (2000). "Architectural Styles and the Design of Network-based Software Architectures" (REST 論文)
https://www.ics.uci.edu/~fielding/pubs/dissertation/top.htm

GitHub REST API Documentation
https://docs.github.com/en/rest

Stripe API Reference
https://stripe.com/docs/api

Google Cloud API Design Guide (AIP-134, AIP-161)
https://cloud.google.com/apis/design
https://google.aip.dev/134
https://google.aip.dev/161

GraphQL 官方檔案
https://graphql.org/learn/

gRPC 官方檔案
https://grpc.io/docs/

Protocol Buffers (protobuf)
https://developers.google.com/protocol-buffers

AsyncAPI 官方網站
https://www.asyncapi.com/docs

OpenAPI Specification
https://swagger.io/specification/

JSON Web Tokens (JWT) 官方網站
https://jwt.io/introduction

OAuth 2.0 標準
https://oauth.net/2/
