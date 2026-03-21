【Webサイト運用・開発ガイド】
このリポジトリは、notreサイトを効率的かつ安全にWebサイトを運用・改善するためのガイドラインです。

◯運用フロー（Git / Vercel）
Vercelの自動デプロイ機能を利用しています。

・本番環境 (mainブランチ)
URL: https://www.notre.co.jp/

developの内容が最終確認された後、こちらにマージ（統合）することで本番公開されます。

・検証環境 (developブランチ)
URL: https://notre-git-develop-tetsuma-itos-projects.vercel.app/

日々の修正や新機能の確認用です。必ずまずはこちらに反映させてください。

◯修正・開発の流れ
1.最新状態の取得
作業前に必ず git checkout develop → git pull origin develop を行い、最新の状態から開始してください。

2.作業用ブランチの作成
直接 develop をいじらず、新しいブランチを作ります（命名規則は後述）。

3.実装・テスト
ローカル環境で表示を確認してください。

4.Push と Pull Request (PR)
作業が終わったらGitHubへPushし、develop に向けて Pull Request を作成します。

5.確認とマージ
VercelのプレビューURLで動作確認し、問題なければ develop へマージします。

◯ブランチ命名規則
ログを読みやすくするため以下の規則を使います。

新規機能・ページ追加: feature/日付-内容 （例: feature/20260321-add-blog-post）
バグ修正: fix/日付-内容 （例: fix/20260321-header-logo-size）
テキスト修正・微調整: chore/日付-内容 （例: chore/20260321-update-copy）

◯注意点
.env ファイルの扱い
APIキーなどの機密情報は GitHub に上げないでください。もし設定が必要な場合は相談してください。

・コンフリクト（衝突）が起きたら
AIに「Gitでコンフリクトが起きたので解消して」と頼むか、相談してください。

・コミットメッセージ
後で見て何をしたか分かるよう「〇〇ページのテキストを修正」など、日本語で簡潔に記載してください。
