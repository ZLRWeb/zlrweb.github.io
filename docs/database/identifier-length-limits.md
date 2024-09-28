# Identifier Length Limits

不同資料庫的 identifier 長度限制有些不同，以下筆記常見的資料庫限制

### 各資料庫 identifier 長度限制(部分不同)

| **Database**         | **Identifier length limits**                        |
| -------------------- | --------------------------------------------------- |
| PostgreSQL           | 63 bytes                                            |
| MySQL                | 64 bytes                                            |
| MariaDB              | 64 bytes                                            |
| Microsoft SQL Server | 128 bytes                                           |
| OracleDB             | 30 bytes(12.1 and below), 128 bytes(12.2 and above) |

### Postgres

identifier length 為 **63 bytes,** 包含 tables, columns, indexes, constraints, view…等等，創建時若超過會被自動截斷。

可以查看當前 database 的 identifier length

```sql
SHOW max_identifier_length;
```

要修改長度限制可以修改 source code 重新編譯 postgreSQL，但實務上不會這麼做，建議是以良好
的[命名原則](https://github.com/RootSoft/Database-Naming-Convention)來規範。

```c
// pg_config_manual.h
#define NAMEDATALEN 64  // Change this to a higher value, e.g., 128
```

> 補充：Postgres 有一些保留字，不能當作 identifier 使用，可以參考
> [官方文件](https://www.postgresql.org/docs/current/sql-keywords-appendix.html)。

### MySQL

大部分 identifier length 為 **64 bytes**, 除了 Alias 為 256 bytes， Compound Statement Label 為 16 bytes。

:::info

Aliases for column names in CREATE VIEW statements are checked against the maximum column length of 64 characters (not
the maximum alias length of 256 characters).

:::

### MariaDB

大部分與 MySQL 相同，少部分不同的如下：

- Users: 80 bytes
- Roles: 128 bytes

### Microsoft SQL Server

常規的 identifier length 為 **128 bytes**。

:::info

Both regular and delimited identifiers must contain from 1 through 128 characters. For local temporary tables, the
identifier can have a maximum of 116 characters.

:::

## Reference

https://www.postgresql.org/docs/current/limits.html

https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-IDENTIFIERS

https://dev.mysql.com/doc/refman/8.4/en/identifier-length.html

https://mariadb.com/kb/en/identifier-names/

https://learn.microsoft.com/en-us/sql/relational-databases/databases/database-identifiers?view=sql-server-ver16

https://stackoverflow.com/questions/756558/what-is-the-maximum-length-of-a-table-name-in-oracle
