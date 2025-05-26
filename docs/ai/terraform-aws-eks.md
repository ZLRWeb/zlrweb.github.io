---
title: Terraform 管理 AWS EKS 實戰教學
description: 本文將引導您如何使用 Terraform 來建立、管理和維護 AWS Elastic Kubernetes Service (EKS) 叢集，從基礎 VPC 建置到節點群組配置，提供完整的實戰教學。
tags:
  - AWS
  - EKS
  - Terraform
  - Kubernetes
  - IaC
---
# 使用 Terraform 管理 AWS EKS

## 介紹

### Terraform
Terraform 是一種開源的基礎設施即代碼 (IaC) 工具，由 HashiCorp 開發。它允許使用者使用宣告式組態檔來定義和佈建基礎設施資源。Terraform 支援多種雲端供應商，包括 AWS、Azure、Google Cloud 等。

### AWS EKS (Elastic Kubernetes Service)
AWS EKS 是一項受管 Kubernetes 服務，可讓您輕鬆在 AWS 上執行 Kubernetes，而無需安裝、操作和維護您自己的 Kubernetes 控制平面或節點。EKS 與 AWS 生態系統中的其他服務 (例如 IAM、VPC、CloudWatch) 深度整合。

本文將引導您如何使用 Terraform 來建立和管理 AWS EKS 叢集。

## 先決條件

在開始之前，請確保您已具備以下條件：

1.  **AWS 帳戶**: 您需要一個有效的 AWS 帳戶以及適當的權限來建立 EKS 叢集和相關資源。
2.  **Terraform 安裝**:
    *   從 [Terraform 官方網站](https://www.terraform.io/downloads.html) 下載並安裝 Terraform。
    *   驗證安裝：`terraform --version`
3.  **AWS CLI**:
    *   安裝和設定 AWS 命令列介面 (CLI)。
    *   設定您的 AWS 憑證，通常透過 `aws configure` 命令。Terraform 會使用這些憑證來與您的 AWS 帳戶互動。
4.  **kubectl**:
    *   安裝 Kubernetes 命令列工具 kubectl。它用於與您的 EKS 叢集互動。
    *   您可以從 [Kubernetes 官方文件](https://kubernetes.io/docs/tasks/tools/install-kubectl/) 找到安裝說明。
5.  **程式碼編輯器**: 任何您偏好的文字編輯器或 IDE，例如 VS Code、Sublime Text 或 Vim。

## 使用 Terraform 建立 EKS 叢集步驟指南

以下步驟將引導您完成使用 Terraform 建立 EKS 叢集的過程。

### 1. 專案設定

首先，為您的 Terraform 專案建立一個新的目錄：

```bash
mkdir terraform-eks-demo
cd terraform-eks-demo
```

在這個目錄中，您將建立 `.tf` 檔案來定義您的基礎設施。

### 2. 提供者和後端設定 (選用但建議)

建立一個 `providers.tf` 檔案來定義 AWS 提供者：

```terraform
# providers.tf

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0" # 請檢查最新的穩定版本
    }
  }

  # 建議設定遠端後端 (例如 S3) 來儲存 Terraform 狀態檔
  # backend "s3" {
  #   bucket         = "your-terraform-state-bucket-name" # 替換成您的 S3 儲存桶名稱
  #   key            = "eks-cluster/terraform.tfstate"
  #   region         = "your-aws-region" # 替換成您的 AWS 區域
  #   encrypt        = true
  #   # dynamodb_table = "your-terraform-locks-table" # 選用，用於狀態鎖定
  # }
}

provider "aws" {
  region = var.aws_region # 您可以將區域設定為變數
}
```

建立一個 `variables.tf` 檔案來定義變數：

```terraform
# variables.tf

variable "aws_region" {
  description = "要部署 EKS 叢集的 AWS 區域"
  type        = string
  default     = "us-west-2" # 根據您的需求更改預設區域
}

variable "cluster_name" {
  description = "EKS 叢集的名稱"
  type        = string
  default     = "my-eks-cluster"
}

variable "vpc_cidr_block" {
  description = "VPC 的 CIDR 區塊"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "公用子網路的 CIDR 區塊列表"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "私有子網路的 CIDR 區塊列表"
  type        = list(string)
  default     = ["10.0.3.0/24", "10.0.4.0/24"]
}

variable "availability_zones" {
  description = "要使用的可用區域列表"
  type        = list(string)
  default     = ["us-west-2a", "us-west-2b"] # 根據您的區域調整
}

variable "node_group_instance_types" {
  description = "節點群組的 EC2 執行個體類型"
  type        = list(string)
  default     = ["t3.medium"]
}

variable "node_group_desired_size" {
  description = "節點群組的期望節點數量"
  type        = number
  default     = 2
}

variable "node_group_min_size" {
  description = "節點群組的最小節點數量"
  type        = number
  default     = 1
}

variable "node_group_max_size" {
  description = "節點群組的最大節點數量"
  type        = number
  default     = 3
}
```

### 3. VPC 設定

EKS 叢集需要在 VPC (虛擬私有雲) 中執行。我們將建立一個新的 VPC 或使用現有的 VPC。以下是如何建立一個新的 VPC。

建立一個 `vpc.tf` 檔案：

```terraform
# vpc.tf

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.5.2" # 請檢查最新的穩定版本

  name = "${var.cluster_name}-vpc"
  cidr = var.vpc_cidr_block

  azs             = var.availability_zones
  private_subnets = var.private_subnet_cidrs
  public_subnets  = var.public_subnet_cidrs

  enable_nat_gateway   = true # 如果您的私有子網路中的 Pod 需要對外存取，則設為 true
  single_nat_gateway   = true # 為了節省成本，可以考慮在開發環境中使用單一 NAT 閘道
  enable_dns_hostnames = true
  enable_dns_support   = true

  public_subnet_tags = {
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    "kubernetes.io/role/elb"                  = "1"
  }

  private_subnet_tags = {
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    "kubernetes.io/role/internal-elb"         = "1"
  }

  tags = {
    "Terraform"   = "true"
    "Environment" = "dev" # 或 "prod"
  }
}
```
**注意**: `terraform-aws-modules/vpc/aws` 是一個常用的社群模組，可以簡化 VPC 的建立。

### 4. EKS 叢集 IAM 角色和政策

EKS 叢集需要一個 IAM 角色，使其能夠代表您呼叫其他 AWS 服務。

建立一個 `iam_eks.tf` 檔案：

```terraform
# iam_eks.tf

resource "aws_iam_role" "eks_cluster_role" {
  name = "${var.cluster_name}-cluster-role"

  assume_role_policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [
      {
        Effect    = "Allow",
        Principal = {
          Service = "eks.amazonaws.com"
        },
        Action    = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "eks_cluster_AmazonEKSClusterPolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks_cluster_role.name
}

# 可選：如果您的叢集需要與 Fargate 互動，則附加此政策
# resource "aws_iam_role_policy_attachment" "eks_cluster_AmazonEKSVPCResourceController" {
#   policy_arn = "arn:aws:iam::aws:policy/AmazonEKSVPCResourceController"
#   role       = aws_iam_role.eks_cluster_role.name
# }
```

### 5. EKS 叢集設定

現在我們可以定義 EKS 叢集本身了。

建立一個 `eks_cluster.tf` 檔案：

```terraform
# eks_cluster.tf

resource "aws_eks_cluster" "main" {
  name     = var.cluster_name
  role_arn = aws_iam_role.eks_cluster_role.arn
  version  = "1.29" # 請檢查最新的 EKS Kubernetes 版本並根據需求調整

  vpc_config {
    subnet_ids              = concat(module.vpc.public_subnet_ids, module.vpc.private_subnet_ids)
    endpoint_private_access = true # 建議啟用私有端點存取
    endpoint_public_access  = true # 根據您的安全需求設定
    # public_access_cidrs   = ["YOUR_IP_ADDRESS/32"] # 限制對公用 API 端點的存取
  }

  # 確保 VPC 模組和 IAM 角色已建立
  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_AmazonEKSClusterPolicy,
    module.vpc
  ]

  tags = {
    "Terraform"   = "true"
    "Environment" = "dev"
  }
}

# 輸出 EKS 叢集的資訊
output "eks_cluster_endpoint" {
  description = "EKS 叢集的端點 URL"
  value       = aws_eks_cluster.main.endpoint
}

output "eks_cluster_ca_certificate" {
  description = "EKS 叢集的 CA 憑證 (base64 編碼)"
  value       = aws_eks_cluster.main.certificate_authority[0].data
  sensitive   = true
}

output "eks_cluster_name" {
  description = "EKS 叢集的名稱"
  value       = aws_eks_cluster.main.name
}
```

### 6. 節點群組 IAM 角色和政策

工作節點 (EC2 執行個體) 需要一個 IAM 角色來與 EKS 控制平面通訊，並存取其他 AWS 服務 (例如 ECR 拉取映像)。

繼續在 `iam_eks.tf` 檔案中加入以下內容：

```terraform
# iam_eks.tf (繼續)

resource "aws_iam_role" "eks_node_group_role" {
  name = "${var.cluster_name}-node-group-role"

  assume_role_policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [
      {
        Effect    = "Allow",
        Principal = {
          Service = "ec2.amazonaws.com"
        },
        Action    = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "eks_node_group_AmazonEKSWorkerNodePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.eks_node_group_role.name
}

resource "aws_iam_role_policy_attachment" "eks_node_group_AmazonEC2ContainerRegistryReadOnly" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.eks_node_group_role.name
}

# 如果您的 Pod 需要存取 S3，可以附加相關政策
# resource "aws_iam_role_policy_attachment" "eks_node_group_AmazonS3ReadOnlyAccess" {
#   policy_arn = "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess" # 或更精細的權限
#   role       = aws_iam_role.eks_node_group_role.name
# }

# 如果您的 Pod 需要使用 CNI 插件的功能 (例如 IRSA)，則附加此政策
resource "aws_iam_role_policy_attachment" "eks_node_group_AmazonEKS_CNI_Policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.eks_node_group_role.name
}
```

### 7. 節點群組設定

節點群組是執行您的 Kubernetes Pod 的 EC2 執行個體。

建立一個 `node_groups.tf` 檔案：

```terraform
# node_groups.tf

resource "aws_eks_node_group" "main" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "${var.cluster_name}-ng"
  node_role_arn   = aws_iam_role.eks_node_group_role.arn
  subnet_ids      = module.vpc.private_subnet_ids # 建議將節點放在私有子網路中

  instance_types = var.node_group_instance_types
  disk_size      = 20 # GB

  scaling_config {
    desired_size = var.node_group_desired_size
    min_size     = var.node_group_min_size
    max_size     = var.node_group_max_size
  }

  # 確保叢集和 IAM 角色已建立
  depends_on = [
    aws_iam_role_policy_attachment.eks_node_group_AmazonEKSWorkerNodePolicy,
    aws_iam_role_policy_attachment.eks_node_group_AmazonEC2ContainerRegistryReadOnly,
    aws_iam_role_policy_attachment.eks_node_group_AmazonEKS_CNI_Policy,
    aws_eks_cluster.main
  ]

  # 最佳實踐：為您的節點群組新增標籤
  tags = {
    "Name"                                      = "${var.cluster_name}-worker-nodes"
    "kubernetes.io/cluster/${var.cluster_name}" = "owned"
    "Terraform"                                 = "true"
  }

  # 可選：設定遠端存取 (例如 SSH)
  # remote_access {
  #   ec2_ssh_key               = "your-ec2-ssh-key-name" # 替換成您的 EC2 金鑰對名稱
  #   source_security_group_ids = ["sg-xxxxxxxxxxxxxxxxx"] # 替換成允許 SSH 存取的安全群組 ID
  # }

  # 更新策略
  update_config {
    max_unavailable_percentage = 33 # 在更新期間，最多 33% 的節點可以不可用
  }
}

output "eks_node_group_name" {
  description = "EKS 節點群組的名稱"
  value       = aws_eks_node_group.main.node_group_name
}

output "eks_node_group_role_arn" {
  description = "EKS 節點群組的 IAM 角色 ARN"
  value       = aws_iam_role.eks_node_group_role.arn
}
```

### 8. 設定 `kubectl` 以存取叢集 (Auth Map)

EKS 使用 `aws-auth` ConfigMap 來將 IAM 身分 (使用者或角色) 映射到 Kubernetes RBAC 群組。當您建立 EKS 叢集時，建立叢集的 IAM 身分 (通常是您的 AWS CLI 設定檔中的使用者或角色) 會自動獲得叢集的 `system:masters` 權限。

若要允許工作節點加入叢集，`aws_eks_node_group` 資源會自動處理節點的 `aws-auth` ConfigMap 項目。

如果您需要讓其他 IAM 使用者或角色存取叢集，您需要手動設定 `aws-auth` ConfigMap。Terraform 的 `kubernetes` 和 `kubectl` 提供者可以協助管理這個 ConfigMap。

首先，設定 Kubernetes 提供者。建立一個 `kubernetes_provider.tf` 檔案：

```terraform
# kubernetes_provider.tf

data "aws_eks_cluster" "cluster" {
  name = aws_eks_cluster.main.name
}

data "aws_eks_cluster_auth" "cluster_auth" {
  name = aws_eks_cluster.main.name
}

provider "kubernetes" {
  host                   = data.aws_eks_cluster.cluster.endpoint
  cluster_ca_certificate = base64decode(data.aws_eks_cluster.cluster.certificate_authority[0].data)
  token                  = data.aws_eks_cluster_auth.cluster_auth.token
}
```

然後，您可以選擇性地使用 `kubernetes_config_map_v1_data` 資源來管理 `aws-auth` ConfigMap。

**注意：** 直接使用 Terraform 管理 `aws-auth` ConfigMap 可能會比較複雜，特別是當 EKS 控制平面自動管理某些項目時。一個常見的替代方法是使用 `aws eks update-kubeconfig` 命令來設定您的 `kubectl`，然後手動或透過 `kubectl` apply YAML 檔案來管理 `aws-auth`。

為了讓 `kubectl` 能夠與您的新 EKS 叢集互動，請執行以下 AWS CLI 命令：

```bash
aws eks update-kubeconfig --region $(terraform output -raw aws_region) --name $(terraform output -raw eks_cluster_name)
```
將 `aws_region` 和 `eks_cluster_name` 替換成您 Terraform 輸出中的實際值，或者直接使用 `terraform output` 命令。

例如：
```bash
aws eks update-kubeconfig --region us-west-2 --name my-eks-cluster
```

之後，您可以測試連線：
```bash
kubectl get svc
kubectl get nodes
```

### 9. 初始化並套用 Terraform 組態

現在所有組態檔都已準備就緒，您可以初始化並套用 Terraform。

1.  **初始化 Terraform**:
    ```bash
    terraform init
    ```
    此命令會下載必要的提供者外掛程式。

2.  **規劃 Terraform**:
    ```bash
    terraform plan
    ```
    此命令會顯示 Terraform 將要建立、修改或刪除的資源。仔細檢查輸出。

3.  **套用 Terraform**:
    ```bash
    terraform apply
    ```
    此命令會開始佈建您的 EKS 叢集和相關資源。系統會提示您確認。輸入 `yes`。

    建立 EKS 叢集可能需要 10-20 分鐘或更長時間。

## 使用 Terraform 管理 EKS 資源

一旦您的 EKS 叢集成功建立，您可以使用 Terraform 進行各種管理操作。

### 更新叢集

如果您需要修改叢集設定 (例如，更新 Kubernetes 版本、變更記錄設定)，您可以：

1.  修改您的 `.tf` 檔案中的相應參數 (例如，`eks_cluster.tf` 中的 `version`)。
2.  執行 `terraform plan` 來預覽變更。
3.  執行 `terraform apply` 來套用變更。

**重要**: 更新 Kubernetes 版本是一個敏感操作。請務必查閱 AWS EKS 文件中有關版本升級的最佳實踐和注意事項。通常建議逐步升級，並在升級前備份您的應用程式和資料。

### 擴展節點群組

如果您需要增加或減少節點群組中的節點數量：

1.  修改 `node_groups.tf` 檔案中的 `scaling_config` 參數 (例如，`desired_size`、`min_size`、`max_size`)。
2.  執行 `terraform plan`。
3.  執行 `terraform apply`。

EKS 會自動調整節點數量以符合您的新設定。

### 新增節點群組

您可以定義額外的 `aws_eks_node_group` 資源來新增不同類型或設定的節點群組 (例如，具有 GPU 的節點群組、Spot 執行個體的節點群組)。

### 銷毀資源

如果您不再需要 EKS 叢集，可以使用 Terraform 將其銷毀以避免產生費用：

1.  執行 `terraform destroy`。
2.  系統會提示您確認。輸入 `yes`。

此命令會刪除 Terraform 在此專案中建立的所有資源。

## 最佳實踐

### 1. 管理 Terraform 狀態 (State)

*   **遠端後端**: 強烈建議使用遠端後端 (如 AWS S3 搭配 DynamoDB 進行狀態鎖定) 來儲存您的 Terraform 狀態檔 (`terraform.tfstate`)。這對於團隊協作和防止狀態損毀至關重要。
    *   在 `providers.tf` 中設定 `backend "s3"`。
*   **狀態鎖定**: 使用 DynamoDB 進行狀態鎖定，以防止多個使用者同時修改狀態。
*   **敏感資料**: 狀態檔可能包含敏感資訊。確保您的後端儲存 (例如 S3 儲存桶) 已啟用加密。

### 2. 模組化您的程式碼

*   **Terraform 模組**: 將您的 Terraform 組態分解為可重複使用的模組。例如，您可以為 VPC、EKS 叢集、節點群組等建立單獨的模組。
    *   使用本地模組或從 Terraform Registry 引用社群/官方模組 (例如，`terraform-aws-modules/eks/aws`)。
*   **關注點分離**: 模組有助於保持程式碼的組織性、可讀性和可維護性。

### 3. 版本控制

*   將您的 Terraform 程式碼儲存在版本控制系統中 (例如 Git)。
*   遵循 Git 工作流程 (例如，功能分支、合併請求/拉取請求) 進行變更管理和協作。

### 4. 變數管理

*   使用 `variables.tf` 檔案來定義輸入變數，並使用 `.tfvars` 檔案 (例如 `terraform.tfvars` 或環境特定的 `dev.tfvars`, `prod.tfvars`) 來提供變數值。
*   避免在程式碼中硬式編碼值。
*   使用 `outputs.tf` 檔案來輸出重要的資源屬性。

### 5. IAM 權限最小化

*   遵循最小權限原則。為 Terraform 用於部署的 IAM 使用者/角色以及 EKS 叢集和節點群組的 IAM 角色授予必要的最小權限。

### 6. 測試您的組態

*   在套用變更到生產環境之前，先在開發或測試環境中進行測試。
*   使用 `terraform plan` 仔細檢查變更。

### 7. 叢集和節點群組標籤

*   為您的 EKS 叢集和節點群組設定一致且有意義的標籤。這有助於成本管理、資源組織和自動化。

### 8. Kubernetes 版本管理

*   定期查閱 AWS EKS 文件以了解支援的 Kubernetes 版本和升級路徑。
*   規劃並謹慎執行叢集版本升級。

### 9. 安全性

*   **網路安全**: 仔細規劃您的 VPC 子網路、安全群組和網路 ACL，以限制對 EKS 控制平面和節點的存取。
*   **API 端點存取**: 考慮限制對 EKS API 公用端點的存取 (使用 `public_access_cidrs`)，並優先使用私有端點。
*   **IAM 身分驗證**: 使用 IAM 進行 Kubernetes 叢集驗證，並使用 RBAC 進行授權。
*   **密碼管理**: 使用像 HashiCorp Vault 或 AWS Secrets Manager 這樣的工具來管理 Kubernetes Secrets。

### 10. 監控與記錄

*   設定 CloudWatch Logs for EKS 控制平面記錄。
*   使用 CloudWatch Container Insights 或其他監控解決方案 (如 Prometheus/Grafana) 來監控您的叢集和應用程式。

## 範例 Terraform 程式碼片段

以下是一些常見操作的簡化程式碼片段。完整的程式碼已在前面的步驟中提供。

### 定義 AWS 提供者
```terraform
# main.tf 或 providers.tf
provider "aws" {
  region = "us-west-2" # 您的 AWS 區域
}
```

### 建立 VPC (使用模組)
```terraform
# vpc.tf
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.5.2"

  name = "my-eks-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["us-west-2a", "us-west-2b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

  enable_nat_gateway = true
  enable_dns_hostnames = true
}
```

### 建立 EKS 叢集
```terraform
# eks_cluster.tf
resource "aws_eks_cluster" "my_cluster" {
  name     = "my-demo-cluster"
  role_arn = aws_iam_role.eks_cluster_role.arn # 參考您建立的 IAM 角色

  vpc_config {
    subnet_ids = module.vpc.private_subnet_ids # 或 concat(module.vpc.public_subnet_ids, module.vpc.private_subnet_ids)
  }

  depends_on = [aws_iam_role_policy_attachment.eks_cluster_AmazonEKSClusterPolicy]
}
```

### 建立受管節點群組
```terraform
# node_groups.tf
resource "aws_eks_node_group" "my_node_group" {
  cluster_name    = aws_eks_cluster.my_cluster.name
  node_group_name = "my-worker-nodes"
  node_role_arn   = aws_iam_role.eks_node_group_role.arn # 參考您建立的 IAM 角色
  subnet_ids      = module.vpc.private_subnet_ids

  instance_types = ["t3.medium"]

  scaling_config {
    desired_size = 2
    min_size     = 1
    max_size     = 3
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_node_group_AmazonEKSWorkerNodePolicy,
    aws_iam_role_policy_attachment.eks_node_group_AmazonEC2ContainerRegistryReadOnly,
  ]
}
```

## 結論

Terraform 提供了一種強大且可重複的方式來佈建和管理 AWS EKS 叢集。透過將您的基礎設施定義為程式碼，您可以實現自動化、版本控制和更可靠的部署。遵循最佳實踐將有助於您有效地管理複雜的 Kubernetes 環境。

請記住，AWS 和 Terraform 的功能不斷發展，建議您定期查閱官方文件以獲取最新的資訊和功能。
```
