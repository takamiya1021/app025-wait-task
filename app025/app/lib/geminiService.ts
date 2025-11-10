import type { Task, TaskPriority } from '@/types/models';

const DEFAULT_MODEL = process.env.NEXT_PUBLIC_GEMINI_MODEL ?? 'gemini-1.5-flash-latest';
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
JSON配列で、title/duration/priority/reasonのキーを持つオブジェクトを3〜5件返してください。`;

const buildClassificationPrompt = (title: string) => `タスク: "${title}"

このタスクを以下の観点で分類してください：
1. カテゴリー（work/personal/study/chore）
2. 推定所要時間（分）
3. 優先度（high/medium/low）

必ずJSONで {"category":"","duration":5,"priority":"high"} の形式で返してください。`;

async function callGemini(prompt: string, apiKey?: string): Promise<string | null> {
  if (!apiKey) return null;
  const url = `${GEMINI_ENDPOINT}/${DEFAULT_MODEL}:generateContent?key=${apiKey}`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });
    if (!response.ok) {
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

const fallbackClassification = (title: string): ClassificationResult => {
  const lower = title.toLowerCase();
  if (lower.includes('メール') || lower.includes('mail')) {
    return { category: 'work', duration: 5, priority: 'medium' };
  }
  if (lower.includes('ストレッチ') || lower.includes('stretch')) {
    return { category: 'personal', duration: 3, priority: 'low' };
  }
  return { category: 'chore', duration: 5, priority: 'medium' };
};

const fallbackProductivityAnalysis = (): ProductivityAnalysis => ({
  summary: 'この1週間も着実にハンドルできています。短い待ち時間でも継続して使えている点がGoodです。',
  tips: ['1〜3分タスクをもう1件追加し、直前の待ち時間にも着手できるようにしましょう。', '完了ログを週末に振り返ると改善が見つけやすいです。'],
});

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
}): Promise<ClassificationResult> {
  const { title, apiKey } = params;
  const prompt = buildClassificationPrompt(title);
  const raw = await callGemini(prompt, apiKey);
  if (!raw) {
    return fallbackClassification(title);
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      category: parsed.category ?? 'chore',
      duration: Number(parsed.duration) || 5,
      priority: parsed.priority ?? 'medium',
    };
  } catch (error) {
    console.warn('Failed to parse classification result', error);
    return fallbackClassification(title);
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
  const prompt = `タスク完了履歴:
${history.map((h) => `${h.date}: ${h.completedTasks}件, ${h.totalTime}分`).join('\n')}

この履歴から以下を分析してください。
1. 隙間時間の活用状況を短くまとめる
2. 改善のヒントを箇条書きで2点。
JSONで {"summary":"","tips":["",""]} の形式で返してください。`;

  const raw = await callGemini(prompt, apiKey);
  if (!raw) {
    return fallbackProductivityAnalysis();
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      summary: parsed.summary ?? fallbackProductivityAnalysis().summary,
      tips: Array.isArray(parsed.tips) && parsed.tips.length > 0 ? parsed.tips : fallbackProductivityAnalysis().tips,
    };
  } catch (error) {
    console.warn('Failed to parse productivity analysis', error);
    return fallbackProductivityAnalysis();
  }
}
