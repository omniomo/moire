import { format } from 'date-fns';

type MemoLike = { date: Date | string; tags?: string[] };

/** Number of distinct calendar days with at least one memo. */
export function countDays(memos: MemoLike[]): number {
  return new Set(memos.map((m) => format(new Date(m.date), 'yyyy-MM-dd'))).size;
}
