---
title: Terraform AWS CloudFront + S3 靜態網站與 Route53 網域
description: 這篇文章詳細說明如何使用 Terraform 配置來設置 AWS CloudFront 分發與 S3 存儲桶進行靜態網站託管，並使用 Route53 網域，提供只讀訪問、最小 IAM 權限、WAF 限制以及每月 $10 的預算限制。
tags:
  - AWS
  - IaC
  - terraform
  - s3
  - cloudfront
  - route53
---

# Terraform AWS CloudFront + S3 靜態網站與 Route53 網域

這篇文章詳細說明如何使用 Terraform 配置來設置 AWS CloudFront 分發與 S3 存儲桶進行靜態網站託管，並使用 Route53 網域，提供只讀訪問、最小 IAM 權限、WAF 限制以及每月 $10 的預算限制。

## 先決條件

- 在您的機器上安裝 [Terraform](https://www.terraform.io/downloads.html)
- 具有適當權限的 AWS 帳戶
- 使用您的憑證配置 AWS CLI

## 使用方法

1. 克隆存儲庫：

    ```sh
    git clone https://github.com/zeroLR/terraform-practies.git
    cd terraform-practies/terraform-aws-cloudfront-s3
    ```

2. 初始化 Terraform：

    ```sh
    terraform init
    ```

3. 應用配置：

    ```sh
    terraform apply -var="aws_region=us-east-1" -var="s3_bucket_name=your-s3-bucket-name" -var="domain_name=your-domain-name" -var="route53_zone_id=your-route53-zone-id"
    ```

## 範例使用

以下是如何使用此 Terraform 配置的範例：

```sh
terraform init
terraform apply -var="aws_region=us-east-1" -var="s3_bucket_name=your-s3-bucket-name" -var="domain_name=your-domain-name" -var="route53_zone_id=your-route53-zone-id"
```

## 預算控制

此配置包括每月 $10 的預算限制。您可以通過修改 `variables.tf` 文件中的 `budget_limit` 變量來調整此限制。

## WAF 配置

WAF 配置包括一個速率限制規則，以阻止單個 IP 地址在 5 分鐘內超過 2000 次請求。您可以通過修改 `variables.tf` 文件中的 `waf_rules` 變量來調整 WAF 規則。

## 疑難排解

### 常見問題

1. **Terraform 初始化錯誤**：確保您安裝了正確版本的 Terraform，並且您的 AWS CLI 配置正確。
2. **S3 存儲桶創建錯誤**：確保您提供的 S3 存儲桶名稱是唯一的，且未被使用。
3. **CloudFront 分發錯誤**：驗證域名和 Route53 區域 ID 是否正確，並且您具有創建 CloudFront 分發的必要權限。

### 解決方案

1. **Terraform 初始化錯誤**：運行 `terraform init -upgrade` 以確保所有提供程序都是最新的。
2. **S3 存儲桶創建錯誤**：檢查 AWS S3 控制台，查看存儲桶名稱是否已被佔用，如有必要，選擇不同的名稱。
3. **CloudFront 分發錯誤**：仔細檢查域名和 Route53 區域 ID，確保您的 IAM 用戶具有必要的權限。

## 其他資源

- [Terraform 文檔](https://www.terraform.io/docs)
- [AWS S3 文檔](https://docs.aws.amazon.com/s3/index.html)
- [AWS CloudFront 文檔](https://docs.aws.amazon.com/cloudfront/index.html)
- [AWS Route53 文檔](https://docs.aws.amazon.com/Route53/index.html)
- [AWS WAF 文檔](https://docs.aws.amazon.com/waf/index.html)
