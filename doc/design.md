# app025: レンダリング待ちタスク管理 - 技術設計書

## 1. 技術スタック

### 1.1 フレームワーク・ライブラリ
- **Next.js**: 14.x (App Router)
- **React**: 18.x
- **TypeScript**: 5.x
- **Tailwind CSS**: 3.x

### 1.2 選定理由
- **Next.js 14**: App Router、静的エクスポート可能、デスクトップアプリ向けに最適
- **React 18**: useTransition等の最新機能、リアルタイム更新に有効
- **TypeScript**: タイマー処理・タスク管理の複雑なロジックに型安全性が必須
- **Tailwind CSS**: ポップアップUIの迅速な構築

### 1.3 主要ライブラリ
- **状態管理**: Zustand
- **データ永続化**: LocalStorage
- **タイマー**: カスタム実装（Web Workers使用）
- **通知**: Web Notifications API
- **AI API**: @google/genai（Gemini API）
- **UI コンポーネント**: Radix UI
- **アイコン**: lucide-react

## 2. アーキテクチャ設計

### 2.1 全体アーキテクチャ
```
┌────────────────────────────────────────┐
│        Presentation Layer              │
│  (React Components + Popup Window)     │
└──────────────┬─────────────────────────┘
               │
┌──────────────▼─────────────────────────┐
│       Application Layer                │
│    (State Management: Zustand)         │
└──────────────┬─────────────────────────┘
               │
┌──────────────▼─────────────────────────┐
│          Timer Layer                   │
│     (Web Workers + setInterval)        │
└──────────────┬─────────────────────────┘
               │
┌──────────────▼─────────────────────────┐
│          Data Layer                    │
│   (LocalStorage + Gemini API)          │
└────────────────────────────────────────┘
```

### 2.2 コンポーネント構成
```
app/
├── page.tsx                    # メインページ
├── layout.tsx                  # ルートレイアウト
└── components/
    ├── TaskList.tsx            # タスク一覧
    ├── TaskItem.tsx            # タスクアイテム
    ├── TaskForm.tsx            # タスク追加フォーム
    ├── TaskFilter.tsx          # タスクフィルター
    ├── TimerSetup.tsx          # タイマー設定
    ├── TimerDisplay.tsx        # タイマー表示
    ├── PopupWindow.tsx         # ポップアップウィンドウ
    ├── ProgressBar.tsx         # 進行状況バー
    ├── NotificationManager.tsx # 通知管理
    ├── Statistics.tsx          # 統計表示
    ├── AITaskSuggestion.tsx    # AIタスク提案
    ├── ApiKeySettings.tsx      # APIキー設定
    └── Header.tsx              # ヘッダー
```

## 3. データモデル設計

### 3.1 Task（タスク）
```typescript
interface Task {
  id: string;                    // UUID
  title: string;                 // タスク名
  duration: number;              // 所要時間（分）
  priority: 'low' | 'medium' | 'high'; // 優先度
  category?: string;             // カテゴリー
  completed: boolean;            // 完了状態
  createdAt: Date;               // 作成日時
  updatedAt: Date;               // 更新日時
  completedAt?: Date;            // 完了日時
}
```

### 3.2 TimerSession（タイマーセッション）
```typescript
interface TimerSession {
  id: string;                    // UUID
  startTime: Date;               // 開始時刻
  duration: number;              // 設定時間（分）
  remainingTime: number;         // 残り時間（秒）
  isRunning: boolean;            // 実行中フラグ
  isPaused: boolean;             // 一時停止フラグ
  completedTasks: string[];      // 完了タスクID配列
}
```

### 3.3 TaskHistory（タスク履歴）
```typescript
interface TaskHistory {
  date: string;                  // 日付（YYYY-MM-DD）
  totalTime: number;             // 合計時間（分）
  completedTasks: number;        // 完了タスク数
  tasksByCategory: Record<string, number>; // カテゴリー別完了数
}
```

### 3.4 AppSettings（アプリ設定）
```typescript
interface AppSettings {
  geminiApiKey?: string;         // Gemini APIキー
  notificationSound: boolean;    // 通知音ON/OFF
  alwaysOnTop: boolean;          // 常に最前面表示
  defaultDuration: number;       // デフォルト時間（分）
  popupWidth: number;            // ポップアップ幅
  popupHeight: number;           // ポップアップ高さ
}
```

## 4. ファイル構成

```
app025/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   └── components/
│       ├── TaskList.tsx
│       ├── TaskItem.tsx
│       ├── TaskForm.tsx
│       ├── TaskFilter.tsx
│       ├── TimerSetup.tsx
│       ├── TimerDisplay.tsx
│       ├── PopupWindow.tsx
│       ├── ProgressBar.tsx
│       ├── NotificationManager.tsx
│       ├── Statistics.tsx
│       ├── AITaskSuggestion.tsx
│       ├── ApiKeySettings.tsx
│       └── Header.tsx
├── lib/
│   ├── timerEngine.ts          # タイマーエンジン
│   ├── taskUtils.ts            # タスクユーティリティ
│   ├── notificationService.ts  # 通知サービス
│   ├── geminiService.ts        # Gemini API呼び出し
│   └── storage.ts              # LocalStorage管理
├── workers/
│   └── timer.worker.ts         # タイマー用Web Worker
├── store/
│   └── useTaskStore.ts         # Zustand Store
├── types/
│   └── index.ts                # 型定義
├── public/
│   └── notification.mp3        # 通知音
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 5. API・インターフェース設計

### 5.1 Zustand Store
```typescript
interface TaskStore {
  // State
  tasks: Task[];
  currentSession: TimerSession | null;
  history: TaskHistory[];
  settings: AppSettings;

  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  removeTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  toggleTaskCompletion: (id: string) => void;

  // Timer Actions
  startTimer: (duration: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  updateRemainingTime: (seconds: number) => void;

  // History Actions
  recordSession: (completedTaskIds: string[]) => void;

  // Computed
  filteredTasks: (maxDuration: number, priority?: string) => Task[];
  todayStats: () => TaskHistory | null;
}
```

### 5.2 Timer Engine
```typescript
interface TimerEngine {
  // タイマー制御
  start(durationMinutes: number, onTick: (remaining: number) => void): void;
  pause(): void;
  resume(): void;
  stop(): void;

  // 状態取得
  getRemainingTime(): number;
  getProgress(): number;  // 0-100

  // イベント
  onComplete(callback: () => void): void;
  onTick(callback: (remaining: number) => void): void;
}
```

### 5.3 Notification Service
```typescript
interface NotificationService {
  // 通知許可リクエスト
  requestPermission(): Promise<boolean>;

  // 通知送信
  notify(title: string, body: string, options?: NotificationOptions): void;

  // 音声通知
  playSound(): void;

  // 通知状態
  isPermissionGranted(): boolean;
}
```

### 5.4 Gemini API インターフェース
```typescript
interface GeminiService {
  // 最適タスク提案
  suggestTasks(
    availableTime: number,
    existingTasks: Task[]
  ): Promise<Task[]>;

  // タスク自動分類
  classifyTask(taskTitle: string): Promise<{
    category: string;
    estimatedDuration: number;
    priority: 'low' | 'medium' | 'high';
  }>;

  // タスク自動生成
  generateTasks(context: {
    timeOfDay: string;
    recentCompletions: Task[];
  }): Promise<Task[]>;

  // 生産性アドバイス
  analyzeProductivity(history: TaskHistory[]): Promise<{
    insights: string[];
    recommendations: string[];
  }>;

  // タスク粒度最適化
  optimizeTaskGranularity(task: Task): Promise<{
    isTooLarge: boolean;
    isTooSmall: boolean;
    suggestions: Task[];
  }>;
}
```

## 6. 主要機能の実装方針

### 6.1 高精度タイマー実装

**問題**: setInterval/setTimeoutは精度が低い（ブラウザの挙動により数秒のズレが発生）

**解決策**: Web Worker + Date.now()による精密計測

```typescript
// workers/timer.worker.ts
let startTime: number;
let duration: number;
let intervalId: NodeJS.Timeout;

self.onmessage = (e) => {
  const { type, payload } = e.data;

  if (type === 'START') {
    startTime = Date.now();
    duration = payload.duration * 60 * 1000; // 分→ミリ秒

    intervalId = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);

      self.postMessage({
        type: 'TICK',
        remaining: Math.floor(remaining / 1000) // 秒単位
      });

      if (remaining <= 0) {
        clearInterval(intervalId);
        self.postMessage({ type: 'COMPLETE' });
      }
    }, 100); // 100msごとに更新（精度向上）
  }

  if (type === 'PAUSE') {
    clearInterval(intervalId);
  }

  if (type === 'STOP') {
    clearInterval(intervalId);
  }
};
```

**メインスレッド統合**:
```typescript
// lib/timerEngine.ts
class TimerEngine {
  private worker: Worker;

  constructor() {
    this.worker = new Worker(new URL('../workers/timer.worker.ts', import.meta.url));
    this.worker.onmessage = this.handleWorkerMessage.bind(this);
  }

  start(durationMinutes: number, onTick: (remaining: number) => void) {
    this.onTickCallback = onTick;
    this.worker.postMessage({ type: 'START', payload: { duration: durationMinutes } });
  }

  private handleWorkerMessage(e: MessageEvent) {
    const { type, remaining } = e.data;
    if (type === 'TICK') {
      this.onTickCallback?.(remaining);
    }
    if (type === 'COMPLETE') {
      this.onCompleteCallback?.();
    }
  }
}
```

### 6.2 ポップアップウィンドウ実装

**アプローチ**: window.openではなく、React Portalでモーダル実装

```typescript
// components/PopupWindow.tsx
export function PopupWindow({ isOpen, onClose }: PopupWindowProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div
        className="w-[400px] h-[600px] bg-white rounded-lg shadow-2xl"
        style={{ resize: 'both', overflow: 'auto' }}
      >
        <PopupHeader onClose={onClose} />
        <TimerDisplay />
        <TaskList filtered />
      </div>
    </div>,
    document.body
  );
}
```

**常に最前面表示**:
```css
/* globals.css */
.popup-window {
  position: fixed;
  z-index: 9999;
}
```

### 6.3 Web Notifications実装

**許可リクエスト**:
```typescript
// lib/notificationService.ts
async function requestPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.error('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}
```

**通知送信**:
```typescript
function notify(title: string, body: string) {
  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted');
    return;
  }

  const notification = new Notification(title, {
    body,
    icon: '/icon.png',
    badge: '/badge.png',
    tag: 'timer-complete',
    requireInteraction: true, // ユーザーが閉じるまで表示
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };
}
```

### 6.4 タスクフィルタリング

**所要時間フィルター**:
```typescript
function filterTasksByDuration(tasks: Task[], maxDuration: number): Task[] {
  return tasks
    .filter(task => !task.completed && task.duration <= maxDuration)
    .sort((a, b) => {
      // 優先度でソート（高→中→低）
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
}
```

**リアルタイムフィルタリング**:
```typescript
// components/PopupWindow.tsx
const filteredTasks = useMemo(() => {
  const remainingMinutes = Math.ceil(session.remainingTime / 60);
  return filterTasksByDuration(tasks, remainingMinutes);
}, [tasks, session.remainingTime]);
```

### 6.5 タスク完了の記録

**セッション記録**:
```typescript
function recordSession(completedTaskIds: string[]) {
  const today = new Date().toISOString().split('T')[0];
  const existingHistory = history.find(h => h.date === today);

  const completedTasks = tasks.filter(t => completedTaskIds.includes(t.id));
  const totalTime = completedTasks.reduce((sum, t) => sum + t.duration, 0);

  const tasksByCategory = completedTasks.reduce((acc, task) => {
    const category = task.category || 'uncategorized';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (existingHistory) {
    existingHistory.totalTime += totalTime;
    existingHistory.completedTasks += completedTaskIds.length;
    existingHistory.tasksByCategory = {
      ...existingHistory.tasksByCategory,
      ...tasksByCategory
    };
  } else {
    history.push({
      date: today,
      totalTime,
      completedTasks: completedTaskIds.length,
      tasksByCategory
    });
  }
}
```

### 6.6 AI機能（Gemini API）

#### 最適タスク提案
```typescript
async function suggestTasks(availableTime: number, existingTasks: Task[]): Promise<Task[]> {
  const prompt = `待ち時間: ${availableTime}分

既存タスク:
${existingTasks.map(t => `- ${t.title} (${t.duration}分, 優先度: ${t.priority})`).join('\n')}

この待ち時間で実行すべき最適なタスクを提案してください。
優先度と所要時間を考慮し、3〜5個のタスクを推薦してください。`;

  const response = await geminiAPI.generateContent(prompt);
  return parseTaskSuggestions(response.text);
}
```

#### タスク自動分類
```typescript
async function classifyTask(taskTitle: string): Promise<Classification> {
  const prompt = `タスク: "${taskTitle}"

このタスクを以下の観点で分類してください：
1. カテゴリー（仕事/私用/学習/雑務）
2. 推定所要時間（分）
3. 優先度（高/中/低）

JSON形式で回答してください。`;

  const response = await geminiAPI.generateContent(prompt);
  return JSON.parse(response.text);
}
```

#### タスク自動生成
```typescript
async function generateTasks(context: GenerationContext): Promise<Task[]> {
  const prompt = `現在時刻: ${context.timeOfDay}

最近完了したタスク:
${context.recentCompletions.map(t => `- ${t.title}`).join('\n')}

ユーザーの作業パターンから、この時間帯に適したタスクを3〜5個生成してください。`;

  const response = await geminiAPI.generateContent(prompt);
  return parseGeneratedTasks(response.text);
}
```

#### 生産性アドバイス
```typescript
async function analyzeProductivity(history: TaskHistory[]): Promise<Analysis> {
  const prompt = `タスク完了履歴:
${history.map(h => `${h.date}: ${h.completedTasks}タスク, ${h.totalTime}分`).join('\n')}

この履歴から以下を分析してください：
1. 隙間時間の活用状況
2. 完了率・達成パターン
3. 改善提案（具体的に）`;

  const response = await geminiAPI.generateContent(prompt);
  return parseProductivityAnalysis(response.text);
}
```

## 7. パフォーマンス最適化

### 7.1 タイマー精度
- Web Worker使用でメインスレッドブロック回避
- 100ms間隔で更新（UIは1秒ごと）
- Date.now()による絶対時刻計測

### 7.2 React最適化
- React.memo でタスクアイテム再レンダリング抑制
- useMemo でフィルタリング結果をキャッシュ
- useTransition でタスク追加時の遅延防止

### 7.3 LocalStorage管理
- デバウンス処理（500ms）で保存頻度を制限
- 履歴は直近30日分のみ保持（自動削除）

## 8. セキュリティ対策

### 8.1 入力検証
- タスク名のサニタイズ（XSS対策）
- 所要時間の範囲チェック（1〜1440分）

### 8.2 APIキー管理
- LocalStorage保存（平文）
- 設定画面でマスク表示

### 8.3 通知権限
- 許可リクエストは初回起動時のみ
- 拒否時は音声通知にフォールバック

## 9. エラーハンドリング

### 9.1 タイマー
- Web Worker読み込み失敗: setIntervalにフォールバック
- タイマー途中でのブラウザクラッシュ: LocalStorageに状態保存

### 9.2 通知
- 通知許可なし: 「通知許可を有効にしてください」
- 通知送信失敗: コンソールにエラーログ

### 9.3 Gemini API
- APIキー未設定: 「APIキーを設定してください」
- レート制限: 「APIリクエスト制限に達しました」
- ネットワークエラー: 「AI機能が一時的に利用できません」

## 10. テスト戦略

### 10.1 単体テスト
- timerEngine の各関数
- taskUtils（フィルタリング、ソート）
- Zustand Store のアクション

### 10.2 統合テスト
- タイマー開始 → ポップアップ表示
- タスク完了 → 履歴記録
- 通知送信

### 10.3 E2Eテスト
- ユーザーシナリオ全体
- タイマー精度検証
- ブラウザ間互換性

## 11. デプロイ・運用

### 11.1 ビルド
- `next build` で静的エクスポート
- Web Worker のバンドル設定

### 11.2 ブラウザ対応
- Chrome 90+（Web Notifications）
- Firefox 90+
- Safari 16+（Web Worker制約あり）
- Edge 90+

### 11.3 モニタリング
- タイマー精度のログ記録
- エラー追跡（Sentry等）

## 12. 今後の拡張性

### 12.1 追加機能候補
- CPU/GPU使用率監視（自動検出）
- 外部カレンダー連携
- スマホアプリ版

### 12.2 技術的改善
- Service Worker（バックグラウンド通知）
- Electron化（デスクトップアプリ）
- IndexedDB（大量履歴管理）
