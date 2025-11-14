import type { Task, TaskPriority } from '@/types/models';

const DEFAULT_MODEL = process.env.NEXT_PUBLIC_GEMINI_MODEL ?? 'gemini-2.0-flash';
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

export interface AISuggestedTask {
  title: string;
  duration: number;
  priority: TaskPriority;
  reason?: string;
}

export interface ClassificationResult {
  category: string;
  duration: number;
  priority: TaskPriority;
}

export interface ProductivityAnalysis {
  summary: string;
  tips: string[];
}

const buildSuggestionPrompt = (availableMinutes: number, tasks: Task[]) => `待ち時間: ${availableMinutes}分

既存タスク:
${tasks
  .map((t) => `- ${t.title} (${t.duration}分, 優先度: ${t.priority})`)
  .join('\n')}

この待ち時間で実行すべき最適なタスクを提案してください。

重要な制約：
- 提案するタスクの所要時間の合計が、待ち時間（${availableMinutes}分）にできるだけ近くなるようにしてください
- 待ち時間を最大限活用できるように、複数のタスクを組み合わせてください
- 合計時間が待ち時間を超えないようにしてください

JSON配列で、title/duration/priority/reasonのキーを持つオブジェクトを3〜5件返してください。`;

const buildClassificationPrompt = (title: string, maxDuration?: number) => {
  const durationConstraint = maxDuration
    ? `\n\n重要な制約：推定所要時間は${maxDuration}分以内にしてください。`
    : '';

  return `タスク: "${title}"

このタスクを以下の観点で分類してください：
1. 推定所要時間（分）
2. 優先度（high/medium/low）${durationConstraint}

必ずJSONで {"duration":5,"priority":"high"} の形式で返してください。`;
};

async function callGemini(prompt: string, apiKey?: string, temperature?: number): Promise<string | null> {
  if (!apiKey) return null;
  const url = `${GEMINI_ENDPOINT}/${DEFAULT_MODEL}:generateContent`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: temperature !== undefined ? {
          temperature: temperature,
        } : undefined,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error response:', errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }
    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts;
    if (!parts) return null;
    return parts.map((part: { text: string }) => part.text).join('\n');
  } catch (error) {
    console.warn('Gemini API call failed', error);
    return null;
  }
}

const fallbackSuggestions = (availableMinutes: number, tasks: Task[]): AISuggestedTask[] => {
  const candidates = tasks
    .filter((task) => !task.completed && task.duration <= availableMinutes)
    .sort((a, b) => {
      const priorityOrder: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 3)
    .map((task) => ({
      title: task.title,
      duration: task.duration,
      priority: task.priority,
      reason: '既存タスクから自動選択',
    }));

  if (candidates.length > 0) {
    return candidates;
  }

  return [
    { title: 'ストレッチ', duration: Math.min(availableMinutes, 5), priority: 'medium', reason: '短時間で集中力回復' },
    { title: '受信トレイの整理', duration: Math.min(availableMinutes, 10), priority: 'low', reason: '軽作業で頭を切り替え' },
  ];
};

const fallbackClassification = (title: string, maxDuration?: number): ClassificationResult => {
  const lower = title.toLowerCase();
  const defaultDuration = maxDuration ? Math.min(5, maxDuration) : 5;

  if (lower.includes('メール') || lower.includes('mail')) {
    return { category: 'work', duration: maxDuration ? Math.min(5, maxDuration) : 5, priority: 'medium' };
  }
  if (lower.includes('ストレッチ') || lower.includes('stretch')) {
    return { category: 'personal', duration: maxDuration ? Math.min(3, maxDuration) : 3, priority: 'low' };
  }
  // デフォルト: 中程度の優先度、待ち時間内に収める
  return { category: 'work', duration: defaultDuration, priority: 'medium' };
};

const fallbackProductivityAnalysis = (): ProductivityAnalysis => {
  const summaries = [
    'この1週間も着実にハンドルできています。短い待ち時間でも継続して使えている点がGoodです。',
    '隙間時間を上手に活用できていますね。コツコツ積み重ねる姿勢が素晴らしいです。',
    'タスク完了の習慣が定着してきていますね。このペースを維持していきましょう。',
    '待ち時間を無駄にしない工夫が見られます。効率的な時間活用ができていますよ。',
    '小さなタスクでも確実にこなしている点が評価できます。継続は力なりです。',
  ];

  const tipSets = [
    ['1〜3分タスクをもう1件追加し、直前の待ち時間にも着手できるようにしましょう。', '完了ログを週末に振り返ると改善が見つけやすいです。'],
    ['タスクの優先順位を定期的に見直してみましょう。', '5分以内で完了できるタスクのストックを増やすと良いでしょう。'],
    ['朝一番に今日の隙間時間タスクを3つ決めておくと効率的です。', 'タスク完了後に次のタスクを即座に追加する習慣をつけましょう。'],
    ['待ち時間が10分以上の場合は、より大きなタスクに挑戦してみては。', '完了したタスクを記録するだけでなく、なぜ完了できたかも振り返りましょう。'],
    ['同じ時間帯に同じ種類のタスクを配置すると、集中力が高まります。', 'タスクの所要時間を正確に見積もる練習を続けましょう。'],
  ];

  const randomIndex = Math.floor(Math.random() * summaries.length);

  return {
    summary: summaries[randomIndex],
    tips: tipSets[randomIndex],
  };
};

export async function suggestTasksWithAI(params: {
  availableMinutes: number;
  tasks: Task[];
  apiKey?: string;
}): Promise<AISuggestedTask[]> {
  const { availableMinutes, tasks, apiKey } = params;
  const prompt = buildSuggestionPrompt(availableMinutes, tasks);
  const raw = await callGemini(prompt, apiKey);
  if (!raw) {
    return fallbackSuggestions(availableMinutes, tasks);
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => ({
          title: item.title ?? 'AI提案タスク',
          duration: Number(item.duration) || availableMinutes,
          priority: item.priority ?? 'medium',
          reason: item.reason,
        }))
        .filter((item) => item.title);
    }
  } catch (error) {
    console.warn('Failed to parse Gemini suggestions', error);
  }
  return fallbackSuggestions(availableMinutes, tasks);
}

export async function classifyTaskWithAI(params: {
  title: string;
  apiKey?: string;
  maxDuration?: number;
}): Promise<ClassificationResult> {
  const { title, apiKey, maxDuration } = params;
  const prompt = buildClassificationPrompt(title, maxDuration);
  const raw = await callGemini(prompt, apiKey);
  if (!raw) {
    return fallbackClassification(title, maxDuration);
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      category: parsed.category ?? 'chore',
      duration: maxDuration ? Math.min(Number(parsed.duration) || 5, maxDuration) : Number(parsed.duration) || 5,
      priority: parsed.priority ?? 'medium',
    };
  } catch (error) {
    console.warn('Failed to parse classification result', error);
    return fallbackClassification(title, maxDuration);
  }
}

export async function analyzeProductivityWithAI(params: {
  history: { date: string; totalTime: number; completedTasks: number }[];
  apiKey?: string;
}): Promise<ProductivityAnalysis> {
  const { history, apiKey } = params;
  if (history.length === 0) {
    return fallbackProductivityAnalysis();
  }

  const now = new Date();
  const today = now.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  const timestamp = now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const totalTasks = history.reduce((sum, h) => sum + h.completedTasks, 0);
  const totalMinutes = history.reduce((sum, h) => sum + h.totalTime, 0);
  const avgTasksPerDay = (totalTasks / Math.max(history.length, 1)).toFixed(1);

  const perspectives = [
    '継続性とリズムに注目して',
    'タスクの質と効率性の観点から',
    '時間活用のパターンに着目して',
    'モチベーションと習慣化の視点で',
    '成長の軌跡を振り返りながら',
  ];
  const randomPerspective = perspectives[Math.floor(Math.random() * perspectives.length)];

  const prompt = `分析時刻: ${timestamp}
今日は${today}です。

タスク完了履歴（直近${history.length}日間）:
${history.map((h) => `${h.date}: ${h.completedTasks}件, ${h.totalTime}分`).join('\n')}

合計: ${totalTasks}件のタスク、${totalMinutes}分の活用時間
平均: 1日あたり${avgTasksPerDay}件

${randomPerspective}、この履歴から以下を分析してください：
1. 隙間時間の活用状況を50文字程度で短くまとめる（前向きで具体的に）
2. 実践的な改善のヒントを2点（具体的なアクションとして）

重要: 毎回異なる視点や表現を使い、新鮮な気づきを提供してください。
JSONで {"summary":"","tips":["",""]} の形式で返してください。`;

  console.log('[AI分析] プロンプト送信:', { timestamp, perspective: randomPerspective, hasApiKey: !!apiKey });

  const raw = await callGemini(prompt, apiKey, 1.0); // temperature=1.0で創造性を高める

  if (!raw) {
    console.warn('[AI分析] API呼び出し失敗 - フォールバックを使用');
    return fallbackProductivityAnalysis();
  }

  console.log('[AI分析] API応答受信:', raw.substring(0, 100) + '...');

  try {
    const parsed = JSON.parse(raw);
    console.log('[AI分析] パース成功:', { summary: parsed.summary?.substring(0, 30), tipsCount: parsed.tips?.length });
    return {
      summary: parsed.summary ?? fallbackProductivityAnalysis().summary,
      tips: Array.isArray(parsed.tips) && parsed.tips.length > 0 ? parsed.tips : fallbackProductivityAnalysis().tips,
    };
  } catch (error) {
    console.warn('[AI分析] パース失敗:', error, 'Raw:', raw);
    return fallbackProductivityAnalysis();
  }
}
