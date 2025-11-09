# app025: レンダリング待ちタスク管理 - 実装計画書（TDD準拠版）

## 概要
本実装計画書は、TDD（Test-Driven Development）の原則に従い、全ての機能実装において**Red-Green-Refactor**サイクルを適用します。高精度タイマー、Web Notifications、AI機能を段階的に実装します。

## 完了条件
- ✅ 全テストがパス（Jest + React Testing Library + Playwright）
- ✅ コードカバレッジ80%以上
- ✅ ESLintエラー・警告ゼロ
- ✅ タイマー精度 ±1秒以内
- ✅ 要件定義書の全機能が実装済み

## 工数見積もり合計
**約45時間**（TDD対応分を含む）

---

## Phase 0: テスト環境構築（予定工数: 3時間）

### タスク

#### 【x】0-1. Next.jsプロジェクト初期化（30分）
- `npx create-next-app@latest app025 --typescript --tailwind --app`
- **Red**: 動作確認テスト
- **Green**: プロジェクト起動確認
- **Refactor**: 不要ファイル削除

#### 【x】0-2. Jestセットアップ（1時間）
- **Red**: Jest設定ファイルのテスト
- **Green**: Jest, @testing-library/react インストール
- Web Worker モック設定
- **Refactor**: 設定最適化

#### 【x】0-3. Playwrightセットアップ（1時間）
- **Red**: E2Eテストスケルトン
- **Green**: Playwright インストール・設定
- **Refactor**: テスト構成整理

#### 【x】0-4. テスト実行確認（30分）
- **Red**: ダミーテスト作成
- **Green**: テスト実行スクリプト設定
- **Refactor**: テストコマンド整理

---

## Phase 1: データモデル・状態管理実装（予定工数: 5時間）

### タスク

#### 【x】1-1. 型定義作成（1時間）
- **Red**: 型定義のテスト
- **Green**: Task, TimerSession, UserProgress, AppSettings 定義
- **Refactor**: 型の共通化

#### 【x】1-2. Zustand Store実装（3時間）
- **Red**: Store各アクションのテスト
  ```typescript
  test('should add task', () => {
    const { addTask, tasks } = useTaskStore.getState();
    addTask(mockTask);
    expect(tasks).toHaveLength(1);
  });
  ```
- **Green**: `store/useTaskStore.ts` 実装
  - addTask, removeTask, updateTask
  - startTimer, pauseTimer, stopTimer
  - recordSession
- **Refactor**: 状態管理最適化

#### 【x】1-3. LocalStorage統合（1時間）
- **Red**: 永続化テスト
- **Green**: `lib/storage.ts` 実装
- **Refactor**: デバウンス処理

---

## Phase 2: 高精度タイマー実装（Web Worker）（予定工数: 6時間）

### タスク

#### 【x】2-1. Web Worker実装（3時間）
- **Red**: Web Workerテスト（モック）
- **Green**: `workers/timer.worker.ts` 実装
  - Date.now()による精密計測
  - 100ms間隔更新
  - START/PAUSE/STOP制御
- **Refactor**: 精度向上

#### 【x】2-2. TimerEngineクラス実装（2時間）
- **Red**: TimerEngineテスト
- **Green**: `lib/timerEngine.ts` 実装
  - Worker統合
  - イベントハンドラー
- **Refactor**: エラーハンドリング

#### 【x】2-3. タイマー精度テスト（1時間）
- **Red**: 精度計測テスト
- **Green**: ±1秒以内達成確認
- **Refactor**: 調整・最適化

---

## Phase 3: UIコンポーネント実装（予定工数: 8時間）

### タスク

#### 【x】3-1. Headerコンポーネント（1時間）
- **Red**: Header表示テスト
- **Green**: ヘッダーUI実装
- **Refactor**: レイアウト調整

#### 【x】3-2. TaskFormコンポーネント（2時間）
- **Red**: タスク追加テスト
- **Green**: フォーム入力UI実装
- **Refactor**: バリデーション追加

#### 【x】3-3. TaskListコンポーネント（2時間）
- **Red**: タスク一覧表示テスト
- **Green**: リスト表示、チェックボックス実装
- **Refactor**: React.memo適用

#### 【x】3-4. TimerSetupコンポーネント（2時間）
- **Red**: タイマー設定テスト
- **Green**: 待ち時間入力、プリセットボタン実装
- **Refactor**: UX改善

#### 【x】3-5. TimerDisplayコンポーネント（1時間）
- **Red**: カウントダウン表示テスト
- **Green**: リアルタイム表示実装
- **Refactor**: アニメーション調整

---

## Phase 4: ポップアップウィンドウ実装（予定工数: 4時間）

### タスク

#### 【x】4-1. PopupWindowコンポーネント（2時間）
- **Red**: ポップアップ表示テスト
- **Green**: React Portal使用、モーダル実装
- **Refactor**: リサイズ対応

#### 【x】4-2. ProgressBarコンポーネント（1時間）
- **Red**: 進行状況表示テスト
- **Green**: プログレスバー実装
- **Refactor**: アニメーション調整

#### 【x】4-3. 常に最前面表示（1時間）
- **Red**: z-indexテスト
- **Green**: CSS設定（z-index: 9999）
- **Refactor**: レイアウト調整

---

## Phase 5: タスクフィルタリング機能実装（予定工数: 3時間）

### タスク

#### 【 】5-1. 所要時間フィルター（2時間）
- **Red**: フィルタリングテスト
- **Green**: `lib/taskUtils.ts` 実装
  ```typescript
  function filterTasksByDuration(tasks: Task[], maxDuration: number): Task[]
  ```
- **Refactor**: ソートロジック最適化

#### 【 】5-2. TaskFilterコンポーネント（1時間）
- **Red**: フィルターUI表示テスト
- **Green**: カテゴリー、優先度フィルターUI実装
- **Refactor**: UX改善

---

## Phase 6: Web Notifications実装（予定工数: 4時間）

### タスク

#### 【 】6-1. 通知許可リクエスト（1時間）
- **Red**: 許可リクエストテスト
- **Green**: `lib/notificationService.ts` 実装
  ```typescript
  async function requestPermission(): Promise<boolean>
  ```
- **Refactor**: エラーハンドリング

#### 【 】6-2. 通知送信機能（2時間）
- **Red**: 通知送信テスト
- **Green**: notify 関数実装、音声通知追加
- **Refactor**: 通知内容最適化

#### 【 】6-3. NotificationManagerコンポーネント（1時間）
- **Red**: 通知管理UIテスト
- **Green**: 設定画面実装
- **Refactor**: UX改善

---

## Phase 7: タスク完了記録・統計機能実装（予定工数: 4時間）

### タスク

#### 【 】7-1. セッション記録ロジック（2時間）
- **Red**: セッション記録テスト
- **Green**: recordSession 実装
  - 完了タスク集計
  - カテゴリー別集計
- **Refactor**: データ集計最適化

#### 【 】7-2. Statisticsコンポーネント（2時間）
- **Red**: 統計表示テスト
- **Green**: 統計UI実装（グラフ、数値表示）
- **Refactor**: ビジュアル改善

---

## Phase 8: AI機能実装（Gemini API）（予定工数: 6時間）

### タスク

#### 【 】8-1. Gemini API統合（1時間）
- **Red**: API接続テスト（モック）
- **Green**: `lib/geminiService.ts` 実装
- **Refactor**: エラーハンドリング

#### 【 】8-2. 最適タスク提案（2時間）
- **Red**: タスク提案テスト
- **Green**: suggestTasks 実装
  - 待ち時間・既存タスク分析
  - 最適タスク推薦
- **Refactor**: プロンプト最適化

#### 【 】8-3. タスク自動分類（2時間）
- **Red**: 自動分類テスト
- **Green**: classifyTask 実装
  - カテゴリー判定
  - 所要時間推定
  - 優先度判定
- **Refactor**: 分類精度向上

#### 【 】8-4. 生産性アドバイス（1時間）
- **Red**: アドバイス生成テスト
- **Green**: analyzeProductivity 実装
- **Refactor**: アドバイス内容改善

---

## Phase 9: エラーハンドリング・バリデーション（予定工数: 3時間）

### タスク

#### 【 】9-1. タイマーエラーハンドリング（1時間）
- **Red**: エラー処理テスト
- **Green**: Web Workerエラー、フォールバック実装
- **Refactor**: 安定性向上

#### 【 】9-2. 通知エラーハンドリング（1時間）
- **Red**: 通知エラーテスト
- **Green**: 許可なし、送信失敗処理
- **Refactor**: フォールバック実装

#### 【 】9-3. タスクバリデーション（1時間）
- **Red**: バリデーションテスト
- **Green**: タスク名サニタイズ、所要時間範囲チェック
- **Refactor**: エラーメッセージ改善

---

## Phase 10: E2Eテスト・統合テスト（予定工数: 4時間）

### タスク

#### 【 】10-1. タスク管理シナリオ（1時間）
- **Red**: E2Eテスト作成
- **Green**: テストパス確認
- **Refactor**: アサーション強化

#### 【 】10-2. タイマー機能シナリオ（1時間）
- **Red**: E2Eテスト作成
- **Green**: タイマー精度検証
- **Refactor**: エッジケース追加

#### 【 】10-3. ポップアップシナリオ（1時間）
- **Red**: E2Eテスト作成
- **Green**: テストパス確認
- **Refactor**: 操作性確認

#### 【 】10-4. AI機能統合テスト（1時間）
- **Red**: AI機能E2Eテスト作成
- **Green**: モックAPI使用テスト
- **Refactor**: テスト安定性向上

---

## Phase 11: デプロイ準備・最終調整（予定工数: 2時間）

### タスク

#### 【 】11-1. 静的エクスポート設定（30分）
- next.config.js 設定
- Web Worker バンドル設定

#### 【 】11-2. ビルド・動作確認（1時間）
- `npm run build` 実行
- タイマー精度確認

#### 【 】11-3. README作成（30分）
- セットアップ手順、使い方記述

---

## マイルストーン

### M1: 基本機能実装完了（Phase 0-5）
- 期限: 開始から1週間
- 完了条件: タスク管理、タイマー、フィルタリングが動作

### M2: 通知・統計機能実装完了（Phase 6-7）
- 期限: 開始から2週間
- 完了条件: Web Notifications、統計表示が動作

### M3: AI機能実装完了（Phase 8）
- 期限: 開始から3週間
- 完了条件: Gemini APIが動作

### M4: 品質保証・デプロイ準備完了（Phase 9-11）
- 期限: 開始から4週間
- 完了条件: 全テストパス、タイマー精度達成

---

## リスク管理

### 高リスク項目
1. **タイマー精度**: ±1秒以内達成が困難
   - 対策: Web Worker使用、Date.now()計測
2. **通知許可**: ユーザーが許可しない可能性
   - 対策: 音声通知フォールバック

---

## 品質チェックリスト

### 機能品質
- [ ] タイマー精度 ±1秒以内
- [ ] ポップアップが邪魔にならない
- [ ] 通知が確実に表示される
- [ ] AI提案が役立つ
