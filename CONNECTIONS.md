# 資料庫連線資訊

本專案使用的資料庫由 [database](file:///c:/Users/User/Johnny/database) 專案統一管理。

啟動方式：在該目錄執行 `.\start.ps1`

## 連線設定

### PostgreSQL

- Host: `localhost`
- Port: `5432`
- User: `postgres`
- Password: (無)
- Connection String: `postgresql://postgres@localhost:5432/<your_db>`

建立資料庫：
```sql
CREATE DATABASE your_db_name;
```

### MongoDB

- URI: `mongodb://localhost:27017/<your_db>`

### Redis

- URL: `redis://localhost:6379`

### ClickHouse

- HTTP URL: `http://localhost:8123`
- User: `default`
- Password: (無)

### MinIO (S3 Compatible)

- Endpoint: `localhost:9000`
- Access Key: `minioadmin`
- Secret Key: `minioadmin`
- Console: `http://localhost:9001`

### Milvus

- Host: `localhost`
- Port: `19530`
