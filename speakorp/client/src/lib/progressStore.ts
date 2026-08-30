/**
 * Client-side progress tracking backed by localStorage.
 * Consumed by the lesson runner and the progress dashboard.
 * Robust to missing/unavailable localStorage; all read operations
 * degrade gracefully to empty state.
 */

export interface ProgressEntry {
  lessonId: number;
  week: number;
  completedAt: string; // ISO 8601 timestamp
  scores: Array<{ skillId: string; score: number }>;
}

export interface WeeklySkillScore {
  week: number;
  skillId: string;
  rollingScore: number;
}

const STORAGE_KEY = 'speakorp.progress';

/**
 * Safely read from localStorage, returning null if unavailable or corrupted.
 */
function readStorageRaw(): string | null {
  try {
    return globalThis.localStorage.getItem(STORAGE_KEY);
  } catch {
    // localStorage unavailable (private browsing, quota exceeded, etc.)
    return null;
  }
}

/**
 * Safely write to localStorage, silently failing if unavailable.
 */
function writeStorageRaw(data: string): void {
  try {
    globalThis.localStorage.setItem(STORAGE_KEY, data);
  } catch {
    // localStorage unavailable; fail silently
  }
}

/**
 * Record a completed lesson with skill scores.
 * Appends a new entry to the localStorage array (does not deduplicate).
 */
export function recordCompletion(entry: ProgressEntry): void {
  const entries = getEntries();
  entries.push(entry);
  writeStorageRaw(JSON.stringify(entries));
}

/**
 * Retrieve all recorded progress entries.
 * Returns an empty array if localStorage is missing, unavailable, or corrupted.
 */
export function getEntries(): ProgressEntry[] {
  const raw = readStorageRaw();
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    // Validate shape: should be an array of ProgressEntry objects
    if (!Array.isArray(parsed)) return [];
    return parsed as ProgressEntry[];
  } catch {
    // JSON parse failed; data is corrupted
    return [];
  }
}

/**
 * Get a deduplicated set of all completed lesson IDs.
 */
export function getCompletedLessonIds(): number[] {
  const entries = getEntries();
  return Array.from(new Set(entries.map((e) => e.lessonId)));
}

/**
 * Compute rolling average score per (week, skillId) across all entries.
 * Pure function; does not access localStorage.
 * Returns sorted by week (asc), then skillId (alphabetic).
 */
export function rollingByWeek(entries: ProgressEntry[]): WeeklySkillScore[] {
  // Group by (week, skillId)
  const groups = new Map<string, number[]>();

  for (const entry of entries) {
    for (const skillScore of entry.scores) {
      const key = `${entry.week}:${skillScore.skillId}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(skillScore.score);
    }
  }

  // Compute rolling averages and convert to result array
  const result: WeeklySkillScore[] = [];
  for (const [key, scores] of groups.entries()) {
    const [weekStr, skillId] = key.split(':');
    const week = parseInt(weekStr, 10);
    const rollingScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    result.push({ week, skillId, rollingScore });
  }

  // Sort by week, then skillId
  result.sort((a, b) => a.week - b.week || a.skillId.localeCompare(b.skillId));

  return result;
}
