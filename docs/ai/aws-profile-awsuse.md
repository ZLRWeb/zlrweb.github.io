---
title: AWS Profile 管理利器：awsuse 與 awsrun 實用 Shell 工具
description: 介紹 awsuse 及 awsrun 兩個 shell function，讓你在終端機中快速切換 AWS profile、查詢身份、列出 profiles，並用指定 profile 執行 AWS 指令，提升多帳號多環境開發效率。
tags:
  - AWS
  - shell
  - CLI
  - 工具
---

本篇文章將介紹兩個實用的 shell function —— `awsuse` 及 `awsrun`，幫助你在終端機中快速切換 AWS profile、查詢目前使用者、列出所有可用的 profile，並用指定 profile 執行 AWS 指令。這些工具能大幅提升多帳號、多環境下的開發與運維效率。

## awsuse 工具說明

`awsuse` 支援以下功能：

- `awsuse <profile>`：切換到指定的 AWS profile，並顯示目前身份資訊。
- `awsuse list`：列出所有可用的 AWS profiles。
- `awsuse whoami`：顯示目前使用中的 profile 與 AWS 身份資訊。
- 無參數時顯示使用說明。

## awsrun 工具說明

`awsrun` 允許你：

- `awsrun <profile> <aws command...>`：用指定 profile 執行 AWS CLI 指令，不會改變當前 shell 的 AWS_PROFILE。

## 實作方式

只需將以下程式碼加入到你的 `~/.bashrc` 或 `~/.zshrc`：

```sh
awsuse() {
  if [ "$1" = "list" ]; then
    echo "Available AWS profiles:"
    aws configure list-profiles
  elif [ "$1" = "whoami" ]; then
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

awsrun() {
  if [[ -z "$1" ]]; then
    echo "Usage: awsrun <profile> <aws command...>"
    return 1
  fi

  local profile="$1"
  shift

  if [[ -z "$1" ]]; then
    echo "❌ Please provide an AWS command to run."
    return 1
  fi

  AWS_PROFILE="$profile" aws "$@"
}
```

儲存後，重新載入設定檔（例如執行 `source ~/.zshrc`），即可隨時使用 `awsuse` 與 `awsrun` 指令。

這些 shell function 提供了簡單直觀的 AWS profile 管理方式，讓你能夠快速切換、查詢與驗證 AWS 身份，提升日常開發與維運效率。建議所有經常操作 AWS CLI 的開發者都可以將這些工具加入到自己的 shell 設定中。

## 建議整合：.aws-utils.sh

建議將 `awsuse` 與 `awsrun` 這兩個 function 一起放到 `~/.aws-utils.sh`，然後在 `~/.bashrc` 或 `~/.zshrc` 加入：

```sh
[ -f ~/.aws-utils.sh ] && source ~/.aws-utils.sh
```

這樣可以集中管理 AWS 相關 shell 工具，日後維護更方便。

參考資料：

- https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html
