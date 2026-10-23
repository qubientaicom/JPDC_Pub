import { BarChart2, BookOpen, Code, FileText, Globe, MessageSquare, Mic2, PenTool, Timer, TrendingUp, type LucideIcon } from 'lucide-react';
import type { AssistantDetail } from '../components/AssistantInfoModal';
import type { DraftJson } from '../views/AssistantBuilderView';

export type ScopeBadge = '비공개' | '지정자' | '부서' | '본부' | '전사';
export type AssistantStatusBadge = '임시저장' | '공식' | '승인완료' | '버전 갱신중' | '승인 대기' | '승인불가';
export interface MyAssistant {
  id?: string;
  name: string; desc: string; icon: LucideIcon; author: string;
  version?: string; statusBadge?: AssistantStatusBadge; scope: ScopeBadge;
  commentCount?: number; createdAt: string; updatedAt: string; isDraft?: boolean;
  isDeleted?: boolean;
  draft?: DraftJson;
  stats?: {
    dialogueCount: number; messageCount: number; category?: string;
    rating?: number; ratingCount?: number;
    ratingDistribution?: AssistantDetail['ratingDistribution'];
    likes?: number; dislikes?: number;
    comments: { author: string; text: string; ts: string }[];
  };
  _isNew?: boolean;
}

const STORAGE_KEY = 'jpdc-ai-my-assistants';
const ICONS: Record<string, LucideIcon> = { BarChart2, BookOpen, Code, FileText, Globe, MessageSquare, Mic2, PenTool, Timer, TrendingUp };

export const assistantId = (a: MyAssistant) => a.id ?? `seed:${a.name}`;

export function loadMyAssistants(fallback: MyAssistant[]): MyAssistant[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const data = JSON.parse(raw);
    if (!Array.isArray(data) || !data.every(a =>
      a && typeof a.name === 'string' && typeof a.desc === 'string' &&
      typeof a.author === 'string' && typeof a.scope === 'string' &&
      typeof a.createdAt === 'string' && typeof a.updatedAt === 'string'
    )) throw new Error('비서 저장 데이터 형식이 올바르지 않습니다.');
    return data.map(({ iconKey, ...a }) => ({ ...a, icon: ICONS[iconKey] ?? FileText, _isNew: false }));
  } catch (error) {
    console.error('저장된 내 비서를 불러오지 못했습니다.', error);
    return fallback;
  }
}

/** Persist first: a storage failure must not appear to have completed a deletion. */
export function saveMyAssistants(list: MyAssistant[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.map(({ icon, _isNew, ...a }) => ({
    ...a,
    iconKey: Object.keys(ICONS).find(key => ICONS[key] === icon) ?? 'FileText',
  }))));
}

export function markAssistantDeleted(list: MyAssistant[], id: string, date: string): MyAssistant[] {
  return list.map(a => assistantId(a) === id ? { ...a, isDeleted: true, updatedAt: date } : a);
}
