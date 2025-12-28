export type BlockCategory = 'focus' | 'admin' | 'social' | 'play' | 'rest';

export type BlockStatus = 'planned' | 'completed' | 'distracted';

export interface TimeBlock {
  id: string;
  startTime: string; // HH:mm format
  endTime: string;
  title: string;
  category: BlockCategory;
  status: BlockStatus;
}

export interface Priority {
  id: string;
  domain: 'you' | 'relationships' | 'work';
  name: string;
  weight: number; // 1-5
}

export interface UserProfile {
  hasCompletedOnboarding: boolean;
  priorities: Priority[];
  lastPriorityAudit: string | null;
}

export interface Template {
  id: string;
  name: string;
  blocks: Omit<TimeBlock, 'id' | 'status'>[];
}

export const CATEGORY_LABELS: Record<BlockCategory, string> = {
  focus: 'Deep Focus',
  admin: 'Admin',
  social: 'Social',
  play: 'Play & Rest',
  rest: 'Sleep/Buffer'
};

export const CATEGORY_ICONS: Record<BlockCategory, string> = {
  focus: 'Brain',
  admin: 'ClipboardList',
  social: 'Heart',
  play: 'Gamepad2',
  rest: 'Moon'
};
