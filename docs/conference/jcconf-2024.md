# JCConf 2024

這次難得公司贊助參加 conference，看了些有興趣的議程，紀錄一下有印象的內容跟一些額外查詢的資料。

議程表 https://jcconf.tw/2024/

## Java 21 and Beyond: State of Loom and Amber

一位外國講者 **Jose PAUMARD**，以聯播(錄影)的方式演講，在 youtube 有
[JEP Café](https://youtube.com/playlist?list=PLX8CzqL3ArzV4BpOzLanxd4bZr46x5e87&si=R0Ye5TwMGrev6hVs) 系列影片。

主要分享了:

### Concurrency and Structured Concurrency

- Java 5 提供 Concurrency， 跑在 Platform thread 上會受到硬體 thread 上限的限制，且有 thread 洩漏的風險。
- Java 21 提供 Structured Concurrency，在 Virtual thread 上執行時不阻塞 Platform thread，且能在預期範圍內執行，防止資源
  洩漏問題。

### Object Oriented Programming and Data Oriented Programming

<details>
  <summary>沒有記下來說了什麼，用 ChatGPT 來做 summary</summary>
  
| **比較項目**       | **物件導向程式設計 (OOP)**                                            | **資料導向程式設計 (DOP)**                                                     |
|:------------------ |:--------------------------------------------------------------------- |:------------------------------------------------------------------------------ |
| **核心概念**       | 將軟體設計圍繞在物件上，將資料和行為（方法）綁定在一起。              | 專注於資料的結構及其操作，強調高效的資料處理。                                 |
| **抽象**           | 強調透過類別和物件進行抽象，使程式碼更具模組化和可重用性。            | 強調資料結構和記憶體中的資料佈局，優化效能和快取效率。                         |
| **資料封裝**       | 推崇封裝，隱藏內部細節，只暴露必要的介面。                            | 鼓勵直接暴露資料，並以優化資料存取模式的方式操作資料。                         |
| **狀態管理**       | 物件維護內部狀態，行為依據物件狀態變化。                              | 資料通常與行為分離，使狀態管理更加明確和可控。                                 |
| **效能**           | 由於抽象的開銷及物件分散可能導致效能損失和快取未命中。                | 通常在效能上更優，特別是在遊戲和模擬中，透過優化記憶體存取模式提高效能。       |
| **靈活性與重用性** | 高度靈活，可透過繼承、多型性和設計模式進行重用。                      | 在程式碼重用上較為僵硬，因為緊密依賴於特定資料結構和存取模式。                 |
| **擴展性**         | 適合具有高度抽象和模組化需求的複雜應用。                              | 在效能要求高的應用中擴展性良好，特別是對於資料區域性和快取一致性需求高的情況。 |
| **理解難易度**     | 對熟悉此設計的人來說較易理解，並且與實際世界中的實體關係類似。        | 需要深入了解硬體和記憶體存取來編寫高效能程式，因此理解難度較高。               |
| **設計模式**       | 擁有豐富的設計模式（如 Singleton、Factory、Observer）來解決常見問題。 | 正式的設計模式較少，但通常針對特定效能需求優化演算法和資料佈局。               |
| **學習曲線**       | 對初學者來說較容易，因為它與現實世界中的物件和實體映射直觀。          | 學習曲線較陡，需要了解記憶體架構及硬體效能優化的知識。                         |
| **模組化**         | 強調模組化，促進易於維護和擴展的程式碼。                              | 模組化依然存在，但更多是功能性的，專注於資料轉換的隔離。                       |
| **除錯與測試**     | 由於清晰的物件邊界和狀態封裝，測試和除錯較為容易。                    | 由於資料操作的底層特性及可能的副作用，除錯可能較困難。                         |
| **並發處理**       | 共享物件狀態可能需要複雜的同步機制（如互斥鎖、鎖定）。                | 由於明確的資料控制和較少的隱藏狀態，並行化通常更簡單。                         |
| **應用範例**       | 常見於企業應用程式、桌面軟體及需要模組化和抽象的系統。                | 在遊戲、模擬和需要高度效能的即時系統中廣泛使用，因為資料區域性非常重要。       |
</details>

### Memory API

沒有記下來說了什麼...

## Kotlin 2.0 降肉 - Kotlin 的過去、現在以及未來

大多在講 Kotlin 2.0 的新特性、K2 Compiler 內部運作，以及 KMP (Kotlin Multiplatform)。

參考 https://kotlinlang.org/docs/k2-compiler-migration-guide.html

## Power Up system design depth along with Amazon Q Developer

### Amazon Q 有哪些相關服務

看[官方網站](https://aws.amazon.com/tw/q/)

### Amazon Q Developer 功能簡介

- 提供多平台 extension， 參考
  [什麼是 Amazon Q 開發者？](https://docs.aws.amazon.com/zh_tw/amazonq/latest/qdeveloper-ug/what-is.html)
- 能將根據當前專案進行上下文分析，產生 BDD 測試案例，並自動生成測試程式碼。

### Amazon Q Developer v.s. Github Copilot

自己只用過 Github Copilot，沒有使用過 Amazon Q Developer，等後續有機會再來試試看，目前看來 Amazon Q Developer 無法生成
unit test code，但有更多針對 AWS 相關服務的支援。

### DDD Event Storming

- https://github.com/ddd-crew/aggregate-design-canvas

## 掌握 Feature Toggle 與 OpenFeature 規範：提升開發效率與降低風險

由 LINE Taiwan 的 Backend Engineer **Noah Hsu** 分享。

主要分享導入情境、Feature Toggle 的實作方式，以及 Line 團隊開源的 [Flagship4j](https://github.com/line/Flagship4j) ，提
供 `On/Off`, `A/B Testing`, `Canary Release`, `White List` 等實作方式。

## OpenRewrite 與程式重構：提升程式碼品質的利器

簡介了 OpenRewrite 的功能，以一個簡單的範例示範 java 8 到 java 17 的轉換。

- https://docs.openrewrite.org/

## Building Event-Driven Architecture with Spring Event and Spring Modulith

主要分享 Spring Event 的使用情境及方式，以及 Spring Modulith 在單體式應用下如何做到模組化解耦，並提供了一個範例專案。

- https://github.com/godisren/edd-spring-modulith-event?tab=readme-ov-file

## 使用工作流引擎簡化多步驟流程開發 Simplify Multi-step Process Development with Workflow Engines

分享了一些工作流引擎的使用情境，以及簡介 Camunda 的功能。

## 提升錯誤處理的優雅與安全：Arrow kt Typed Error 實踐

主要分享 Arrow kt 的 Typed Error 的使用情境及方式，以及如何使用 Arrow kt 來處理錯誤。

- https://arrow-kt.io/

## Generic, Fastutil, And Project Valhalla

蠻硬的一個議程，主要分享了 Java 的泛型底層實現、Fastutil 的優缺，以及部分 Project Valhalla 的想解決的問題。

- java 5 開始支援泛型，但是在底層實現上是透過 Type Erasure 來實現的，所以在執行時期是不知道泛型的型別的。
- Fastutil 是一個 Java 的高效率資料結構庫，主要是針對 primitive type 的資料結構做了優化，但其產生的轉換方式會增加一些記
  憶體使用。
- 大量不必要的 Autoboxing 與 boxing 造成性能開銷，如 `List<Integer>` 會將 Integer 裝箱成 int，造成記憶體使用增加。

### JEP 401: Value Classes and Objects

https://openjdk.org/jeps/401

```java
value class Substring implements CharSequence {
   private String str;
   private int start, end;

   public int length() {
       return end - start;
   }

   public char charAt(int i) {
       return str.charAt(start + i);
   }

   public String toString() {
       return str.substring(start, end);
   }

   public boolean equals(Object o) {
      return o instanceof Substring && toString().equals(o.toString());
   }
}

Substring s1 = new Substring("ionization", 0, 3);
Substring s2 = new Substring("ionization", 7, 10);
Substring s3 = new Substring(new String("ionization"), 7, 10);
assert s1 != s2; // true
assert s1.equals(s2); // true
assert s2 == s3; // false
```

### JEP 402: Enhanced Primitive Boxing

https://openjdk.org/jeps/402

```java
int i = 12;
int iSize = i.SIZE;
double iAsDouble = i.doubleValue();
Supplier<String> iSupp = i::toString;
```

### JEP draft: Null-Restricted Value Class Types

https://openjdk.org/jeps/8316779

```java
void printAll(Range! r) {
    for (int i = r.start; i < r.end; i++)
        System.out.println(i);
}

printAll(new Range(5, 50));
printAll(null); // compiler error
```
