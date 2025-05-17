---
title: AWS Profile 快速切換工具：awsuse 函數介紹
description: 實用 shell function awsuse，快速切換 AWS profile、查詢身份與列出 profiles，提升多帳號多環境開發效率。
tags:
  - AWS
  - shell
  - CLI
  - 工具
---

本篇文章將介紹一個實用的 shell function —— `awsuse`，幫助你在終端機中快速切換 AWS profile、查詢目前使用者與列出所有可用
的 profile。這個工具能大幅提升多帳號、多環境下的開發與運維效率。

## 工具說明

`awsuse` 支援以下功能：

- `awsuse <profile>`：切換到指定的 AWS profile，並顯示目前身份資訊。
- `awsuse list`：列出所有可用的 AWS profiles。
- `awsuse whoami`：顯示目前使用中的 profile 與 AWS 身份資訊。
- 無參數時顯示使用說明。

## 實作方式

只需將以下程式碼加入到你的 `~/.bashrc` 或 `~/.zshrc`：

```sh
awsuse() {
  if [ "$1" == "list" ]; then
    echo "Available AWS profiles:"
    aws configure list-profiles
  elif [ "$1" == "whoami" ]; then
    echo "Current profile: ${AWS_PROFILE:-default}"
    aws sts get-caller-identity
  elif [ -n "$1" ]; then
    export AWS_PROFILE="$1"
    echo "Switched to profile: $AWS_PROFILE"
    aws sts get-caller-identity
  else
    echo "Usage:"
    echo "  awsuse <profile>     # switch to profile"
    echo "  awsuse list          # list all profiles"
    echo "  awsuse whoami        # show current profile & identity"
  fi
}
```

儲存後，重新載入設定檔（例如執行 `source ~/.zshrc`），即可隨時使用 `awsuse` 指令。

awsuse shell function 提供了簡單直觀的 AWS profile 管理方式，讓你能夠快速切換、查詢與驗證 AWS 身份，提升日常開發與維運效
率。建議所有經常操作 AWS CLI 的開發者都可以將這個工具加入到自己的 shell 設定中。

參考資料：

- https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html
- https://linux.vbird.org/linux_basic/0340bashshell-scripts.php
