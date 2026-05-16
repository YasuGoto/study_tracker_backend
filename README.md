# Study Tracker Backend

勉強時間を記録・集計するアプリのバックエンドAPI。

## 技術スタック
- **Framework**: NestJS / TypeScript
- **Database**: PostgreSQL / TypeORM
- **Cache**: Redis（Upstash）
- **Auth**: JWT認証
- **Deploy**: Render

## 機能
- ユーザー認証（登録・ログイン）
- 勉強セッション管理（開始・停止・進行中確認）
- 日次サマリー集計・取得（JST基準）
- 期間指定での履歴取得
- Redisによるレスポンスキャッシュ

## API
- `POST /auth/register` - 新規登録
- `POST /auth/login` - ログイン
- `POST /study-sessions/start` - セッション開始
- `POST /study-sessions/stop` - セッション停止
- `GET /study-sessions/active` - 進行中セッション確認
- `GET /daily-summary/:date` - 日次サマリー取得
- `POST /daily-summary` - 日次サマリー集計・保存
- `GET /daily-summary/period` - 期間指定サマリー取得
