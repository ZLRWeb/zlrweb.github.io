# Kubernetes 多租戶 FQDN 管理

多租戶環境下，跨 Namespace 進行 Service FQDN 溝通的最佳實踐

在 Kubernetes 的多租戶環境中，跨 Namespace 的 Service 溝通是常見需求，而採用完整網域名稱 (FQDN, Fully Qualified Domain Name) 進行服務探索 (Service Discovery) 則是最直接且標準的方式。

然而，如何在確保租戶隔離與安全的前提下，有效管理這些跨 Namespace 的 FQDN 溝通，是一項重要的挑戰。

本文將深入探討在多租戶場景下，管理 Service FQDN 溝通的各種策略與最佳實踐。

## 基礎：Kubernetes 的 FQDN 與 Namespace

在 Kubernetes 中，每個 Service 都會被自動指派一個 DNS 名稱。

當一個 Pod 需要存取另一個 Namespace 中的 Service 時，可以使用其 FQDN。

其標準格式為：
<service-name>.<namespace-name>.svc.cluster.local

例如，一個位於 tenant-a Namespace 的應用，若要存取 tenant-b Namespace 中名為 user-service 的服務，其溝通端點即為 user-service.tenant-b.svc.cluster.local。這種方式簡單明瞭，但隨之而來的挑戰是：如何精細地控制哪些租戶之間可以互相溝通？

## 管理跨 Namespace FQDN 溝通的策略

以下我們將從原生 Kubernetes 功能到服務網格 (Service Mesh) 等不同層次的解決方案，剖析其優劣勢與適用場景。

### 原生 Kubernetes 網路策略 (Network Policies)

網路策略是 Kubernetes 原生的資源，用於控制 Pod 之間的流量。

您可以把它想像成是 Pod 層級的防火牆。

管理方式：
 * 預設拒絕所有流量 (Default Deny)： 在多租戶環境中，最佳安全實踐是為每個 Namespace 設定一個預設的 Network Policy，拒絕所有非預期的流入 (Ingress) 與流出 (Egress) 流量。
 * 基於 Namespace 標籤允許流量： 接著，針對需要互相溝通的 Namespace，可以建立特定的 Network Policy，利用 namespaceSelector 來允許來自特定 Namespace 的流量。
 * 結合 IP Block (進階應用)： 雖然標準的 Network Policy 不直接支援 FQDN 作為選擇器，但您可以允許流出至 CoreDNS/kube-dns 的流量 (通常在 kube-system Namespace)，以確保 FQDN 能夠被正常解析。對於需要存取外部服務的場景，也可以限制流出至特定的 IP 區段。

範例：允許 tenant-a 存取 tenant-b 的 user-service

1. tenant-b 的 Ingress 規則，僅允許來自 tenant-a 的流量

apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-from-tenant-a
  namespace: tenant-b
spec:
  podSelector:
    matchLabels:
      app: user-service # 選擇 tenant-b 中的 user-service Pod
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: tenant-a # 允許來自 tenant-a Namespace 的流量

優點：
 * 原生支援： 無需安裝額外元件，是 Kubernetes 的標準功能。
 * 簡單易用： 對於基於 Namespace 的基本隔離，設定相對直觀。
缺點：
 * 不直接支援 FQDN 規則： 無法直接在 Egress 規則中寫「允許流出至 *.tenant-b.svc.cluster.local」。這使得針對特定服務的精細化控管變得困難。
 * 需要 CNI 支援： 您的叢集網路介面 (CNI) 插件（如 Calico, Cilium）必須支援 NetworkPolicy。值得注意的是，像 Cilium 這樣的 CNI 提供了更強大的功能，可以直接支援基於 FQDN 的 Egress 規則，彌補了原生 Network Policy 的不足。
2. Kubernetes Gateway API
Gateway API 是 Kubernetes SIG-Network 社群推動的下一代 Ingress 標準，旨在提供更豐富、更具表達力且角色分離的路由管理方式。
管理方式：
在多租戶場景下，可以由叢集管理員定義一個共用的 Gateway，而各租戶（Namespace）則可以透過 HTTPRoute 或 TCPRoute 等資源，將自己的服務附加到這個 Gateway 上。這種模型允許跨 Namespace 的路由，同時保持了租戶間的配置隔離。
優點：
 * 角色分離： 清晰劃分了基礎設施（Gateway）與應用路由（HTTPRoute）的管理權責，適合多租戶協作。
 * 標準化與可擴展性： 作為下一代標準，提供了比 Ingress 更豐富的路由功能，且設計上易於擴展。
缺點：
 * 較新技術： 相較於 Network Policy 和 Service Mesh，Gateway API 還在快速發展中，生態系與最佳實踐尚在成形。
 * 主要針對南北向流量： 其設計初衷更多是為了管理叢集外部到內部的流量，雖然也可用於內部路由，但在東西向流量的細粒度安全策略上，不如 Service Mesh 強大。
3. 服務網格 (Service Mesh) - Istio / Linkerd
對於有複雜跨租戶溝通需求、且對安全性與可觀測性有更高要求的場景，服務網格是更理想的選擇。
Istio
管理方式：
Istio 提供了強大的流量管理與安全功能，可以直接且精細地控制基於 FQDN 的跨 Namespace 通訊。
 * AuthorizationPolicy： 這是 Istio 實現存取控制的核心。您可以定義非常細粒度的規則，例如：
   * 允許來自 tenant-a Namespace 中特定服務帳號 (Service Account) 的請求。
   * 允許存取 user-service.tenant-b.svc.cluster.local 這個 FQDN。
   * 允許帶有特定 JWT Token 的請求。
 * VirtualService & ServiceEntry： 這些資源可以用來控制流量路由，甚至可以將叢集外的服務（透過 FQDN）納入網格管理，實現統一的策略。
 * 強制 mTLS： Istio 可以為所有網格內的服務間通訊自動啟用雙向 TLS (mTLS)，確保流量即使在叢集內部也是加密且經過身份驗證的。
範例：Istio 的 AuthorizationPolicy
# 僅允許 tenant-a 的 sleep 服務存取 tenant-b 的 httpbin 服務
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: allow-sleep-to-httpbin
  namespace: tenant-b
spec:
  selector:
    matchLabels:
      app: httpbin # 在 tenant-b 中選擇 httpbin 服務
  action: ALLOW
  rules:
  - from:
    - source:
        principals:
        - "cluster.local/ns/tenant-a/sa/sleep" # 根據 Service Account 進行身份驗證

## Linkerd
管理方式：
Linkerd 以其輕量和易用性著稱，同樣提供了強大的多租戶管理能力。
 * 自動 mTLS： 與 Istio 類似，Linkerd 為所有網格內的 Pod 通訊自動啟用 mTLS，確保安全。
 * Server 和 ServerAuthorization： Linkerd 透過這些 CRD 來定義哪些服務可以接收流量，以及誰有權限發送這些流量。您可以基於客戶端的身份（Service Account）來授權跨 Namespace 的通訊。
優點：
 * 強大的安全性： 提供零信任網路的基礎，所有通訊預設加密並需驗證。
 * 細粒度控制： 可以基於服務身份 (而不僅是 Namespace) 進行授權，這是 Network Policy 難以做到的。
 * 豐富的可觀測性： 提供跨服務通訊的詳細指標、日誌與追蹤，便於除錯與監控。
缺點：
 * 學習曲線與維運成本： 引入服務網格會增加系統的複雜度，需要額外的學習與維運成本。
 * 資源開銷： 每個應用 Pod 都會注入一個 sidecar proxy，會帶來一定的 CPU 與記憶體開銷。
總結與建議
| 管理方式 | 優點 | 缺點 | 適用場景 |
|---|---|---|---|
| 原生 Network Policies | 原生支援、簡單易用 | 不直接支援 FQDN 規則、功能依賴 CNI | 基礎的 Namespace 隔離，對服務級別的細粒度控制要求不高。 |
| Gateway API | 角色分離、標準化、可擴展 | 較新技術、主要針對南北向流量 | 需要統一管理叢集入口，並將路由規則授權給不同租戶。 |
| 服務網格 (Istio/Linkerd) | 強大的安全性 (mTLS)、細粒度控制、豐富的可觀測性 | 學習曲線高、維運成本與資源開銷 | 對安全性、可觀測性有高要求，需要精細控制服務間通訊的複雜多租戶環境。 |
最佳實踐建議：
 * 從基礎開始： 無論選擇哪種方案，都應以 Namespace 作為租戶隔離的基本單位，並搭配 RBAC 限制使用者權限，以及 ResourceQuotas 防止資源濫用。
 * 預設安全： 採用 預設拒絕 (Default Deny) 的網路策略作為安全基準線。
 * 分層演進：
   * 對於簡單的場景，從 原生 Network Policy 開始，如果使用的 CNI (如 Cilium) 支援 FQDN 策略，則能更好地滿足需求。
   * 當需要更精細的控制、強化的安全性與深入的可觀測性時，引入服務網格 (Service Mesh) 是必然的選擇。Istio 在功能豐富度與靈活性上佔優，而 Linkerd 則以其易用性和低資源消耗為特色。
 * 明確 FQDN 策略： 在團隊中建立明確的規範，要求開發人員在進行跨 Namespace 呼叫時，務必使用完整的 FQDN (<service>.<namespace>.svc.cluster.local)，避免因 Kubernetes DNS 搜尋路徑 (search) 配置導致的非預期行為或安全風險。
總之，管理多租戶環境下的 FQDN 溝通是一個需要在安全、靈活性與成本之間取得平衡的過程。根據您的具體需求和團隊的技術成熟度，選擇最適合的方案，並逐步演進，是確保叢集穩定、安全與高效運行的關鍵。
