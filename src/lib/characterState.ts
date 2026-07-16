const TRIAL_DURATION_MS = 20 * 60 * 1000; // 20 minutes for featured character (parrot)
const PREVIEW_DURATION_MS = 3 * 60 * 1000; // 3 minutes for other characters (personality preview)

export type CharacterStatus = 'locked' | 'trialing' | 'purchased' | 'subscribed';

export interface CharacterState {
  status: CharacterStatus;
  remainingMs: number | null;
  elapsedPercent: number;
}

function trialUsageKey(id: string) { return `char_trial_used_${id}`; }
function trialActiveKey(id: string) { return `char_trial_active_${id}`; }
function purchaseKey(id: string) { return `char_purchased_${id}`; }

/** Featured character (parrot) gets full 20min, others get 3min preview */
const FEATURED_CHARACTERS = ['parrot'];

export function getTrialDurationMs(id: string): number {
  return FEATURED_CHARACTERS.includes(id) ? TRIAL_DURATION_MS : PREVIEW_DURATION_MS;
}

/** Get accumulated learning time (ms) for this character's trial */
function getTrialUsedMs(id: string): number {
  const used = localStorage.getItem(trialUsageKey(id));
  return used ? Number(used) : 0;
}

/** Check if a trial session is currently active (user is learning) */
function isTrialActive(id: string): boolean {
  return localStorage.getItem(trialActiveKey(id)) === '1';
}

/** Check if trial has been used up (expired) — trial started but time ran out */
export function isTrialExpired(id: string): boolean {
  const purchased = localStorage.getItem(purchaseKey(id));
  if (purchased) return false;
  const usedMs = getTrialUsedMs(id);
  const hasTrialStarted = localStorage.getItem(trialUsageKey(id)) !== null;
  if (!hasTrialStarted) return false;
  return usedMs >= getTrialDurationMs(id);
}

export function getCharacterState(id: string): CharacterState {
  // Check purchase
  const purchased = localStorage.getItem(purchaseKey(id));
  if (purchased === 'subscribed') {
    return { status: 'subscribed', remainingMs: null, elapsedPercent: 0 };
  }
  if (purchased === 'true') {
    return { status: 'purchased', remainingMs: null, elapsedPercent: 0 };
  }

  // Check trial — based on accumulated learning time, not calendar time
  const usedMs = getTrialUsedMs(id);
  const hasTrialStarted = localStorage.getItem(trialUsageKey(id)) !== null || isTrialActive(id);

  if (hasTrialStarted) {
    const duration = getTrialDurationMs(id);
    const remaining = duration - usedMs;
    if (remaining > 0) {
      return {
        status: 'trialing',
        remainingMs: remaining,
        elapsedPercent: Math.min(100, (usedMs / duration) * 100),
      };
    }
    // Trial expired — keep usage data so isTrialExpired() can detect it
    // (only cleaned up when character is purchased)
    return { status: 'locked', remainingMs: null, elapsedPercent: 100 };
  }

  return { status: 'locked', remainingMs: null, elapsedPercent: 0 };
}

/** Start a trial session (user tapped "免费试用") */
export function startTrial(id: string): void {
  // Mark trial as started (first time) or resume
  if (localStorage.getItem(trialUsageKey(id)) === null) {
    localStorage.setItem(trialUsageKey(id), '0');
  }
}

/** Begin a learning session — timer starts counting */
export function beginLearningSession(id: string): void {
  localStorage.setItem(trialActiveKey(id), '1');
  localStorage.setItem(`${trialActiveKey(id)}_start`, String(Date.now()));
}

/** End a learning session — accumulate the time spent based on session start timestamp */
export function endLearningSession(id: string): void {
  const startStr = localStorage.getItem(`${trialActiveKey(id)}_start`);
  if (startStr) {
    const sessionMs = Date.now() - Number(startStr);
    const prevUsed = getTrialUsedMs(id);
    localStorage.setItem(trialUsageKey(id), String(prevUsed + sessionMs));
    localStorage.removeItem(`${trialActiveKey(id)}_start`);
  }
  localStorage.removeItem(trialActiveKey(id));
}

export function purchaseCharacter(id: string): void {
  localStorage.removeItem(trialUsageKey(id));
  localStorage.removeItem(trialActiveKey(id));
  localStorage.removeItem(`${trialActiveKey(id)}_start`);
  localStorage.setItem(purchaseKey(id), 'true');
}

export function subscribeCharacter(id: string): void {
  localStorage.removeItem(trialUsageKey(id));
  localStorage.removeItem(trialActiveKey(id));
  localStorage.removeItem(`${trialActiveKey(id)}_start`);
  localStorage.setItem(purchaseKey(id), 'subscribed');
}

export function formatTrialTime(ms: number | null): string {
  if (ms === null || ms <= 0) return '00:00';
  const totalSec = Math.ceil(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export const CHARACTER_STORIES: Record<string, string> = {
  einstein: '爱因斯坦从小就对世界充满好奇。他会问星星为什么会闪烁，光是怎么旅行的。让我们一起探索科学的奥秘！',
  beethoven: '贝多芬5岁就开始弹钢琴，音乐是他表达情感的方式。来，我们一起用音乐感受世界的美好！',
  deer: '小鹿姐姐是森林里最温柔的老师，她总是耐心地帮助每一个小朋友。今天她想教你认识自己的情绪。',
  parrot: '小鹦鹉来自热带雨林，它不仅会说话，还特别爱唱歌！跟它一起学英语，快乐又简单！',
  fox: '小狐狸住在一片神秘的森林里，它最喜欢探险和发现新事物。嘘！它好像发现了什么秘密...',
  olaf: '雪宝是一个来自冰雪世界的雪人，它最大的梦想就是拥有一个温暖的拥抱。来，给它一个拥抱吧！',
  allen: 'Allen来自美国加州，他热爱阳光和运动。跟他一起边玩边学，感受美式英语的魅力！',
  harry: 'Harry是一位来自英国的绅士，他最爱在下午茶时间读故事书。来，一起听他讲有趣的故事！',
  xizi: 'Xizi来自日本，她最喜欢画画和做手工。用英语画画，是不是很酷？',
  bull: 'Bull来自巴西，他是个热情的足球少年！跟他一起踢球学英语！',
  bred: 'Bred来自中东，他是个神秘的小探险家。他想带你去发现沙漠里的宝藏！',
  coco: 'Coco是一只聪明的小鹦鹉，它最擅长模仿各种声音。跟它一起学发音，你也会变成语言小天才！',
};

/* ═══════════════════════════════════════
   Emotional Bond — per character, independent
   ═══════════════════════════════════════ */

export interface BondLevel {
  level: number;       // 1-5
  exp: number;         // current exp
  nextExp: number;     // exp needed for next level
  hearts: number;      // 0-5 filled hearts display
}

const BOND_EXP_PER_LEVEL = [0, 50, 120, 220, 360]; // cumulative exp thresholds

function bondKey(id: string) { return `char_bond_${id}`; }

export function getBondLevel(id: string): BondLevel {
  const raw = localStorage.getItem(bondKey(id));
  const totalExp = raw ? Number(raw) : 0;
  let level = 1;
  for (let i = BOND_EXP_PER_LEVEL.length - 1; i >= 0; i--) {
    if (totalExp >= BOND_EXP_PER_LEVEL[i]) { level = i + 1; break; }
  }
  const clampedLevel = Math.min(level, 5);
  const currentThreshold = BOND_EXP_PER_LEVEL[clampedLevel - 1] || 0;
  const nextThreshold = BOND_EXP_PER_LEVEL[clampedLevel] || BOND_EXP_PER_LEVEL[BOND_EXP_PER_LEVEL.length - 1] + 150;
  const expInLevel = totalExp - currentThreshold;
  const expNeeded = nextThreshold - currentThreshold;
  return {
    level: clampedLevel,
    exp: expInLevel,
    nextExp: expNeeded,
    hearts: clampedLevel,
  };
}

export function addBondExp(id: string, amount: number): void {
  const raw = localStorage.getItem(bondKey(id));
  const current = raw ? Number(raw) : 0;
  localStorage.setItem(bondKey(id), String(current + amount));
}

/* ═══════════════════════════════════════
   Shared Learning Progress — global across all characters
   ═══════════════════════════════════════ */

const PROGRESS_KEY = 'shared_learning_progress';

export interface LearningProgress {
  wordsLearned: number;
  lessonsCompleted: number;
  daysActive: number;
  streakDays: number;
}

export function getLearningProgress(): LearningProgress {
  const raw = localStorage.getItem(PROGRESS_KEY);
  if (raw) return JSON.parse(raw);
  return { wordsLearned: 0, lessonsCompleted: 0, daysActive: 0, streakDays: 0 };
}

export function addLearningProgress(update: Partial<LearningProgress>): void {
  const current = getLearningProgress();
  const merged = { ...current, ...update };
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(merged));
}

export function markActiveDay(): void {
  const today = new Date().toDateString();
  const key = 'last_active_day';
  const last = localStorage.getItem(key);
  if (last !== today) {
    localStorage.setItem(key, today);
    const p = getLearningProgress();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    addLearningProgress({
      daysActive: p.daysActive + 1,
      streakDays: last === yesterday ? p.streakDays + 1 : 1,
    });
  }
}

/* ═══════════════════════════════════════
   Pricing & Subscription Logic
   ═══════════════════════════════════════ */

export type CharacterCategory = 'teacher' | 'partner';

const TEACHER_IDS = ['einstein', 'beethoven', 'deer'];

export function getCharacterCategory(id: string): CharacterCategory {
  return TEACHER_IDS.includes(id) ? 'teacher' : 'partner';
}

export function getOriginalPrice(id: string): number {
  return getCharacterCategory(id) === 'teacher' ? 79 : 49;
}

export function getPromoPrice(id: string): number {
  return getOriginalPrice(id) / 2;
}

// Auto-renew
function autoRenewKey(id: string) { return `char_autorenew_${id}`; }

export function isAutoRenew(id: string): boolean {
  return localStorage.getItem(autoRenewKey(id)) === 'true';
}

export function setAutoRenew(id: string, value: boolean): void {
  if (value) localStorage.setItem(autoRenewKey(id), 'true');
  else localStorage.removeItem(autoRenewKey(id));
}

// Physical card
function physicalCardKey(id: string) { return `char_physical_card_${id}`; }

export function hasPhysicalCard(id: string): boolean {
  return localStorage.getItem(physicalCardKey(id)) === 'true';
}

export function markPhysicalCardSent(id: string): void {
  localStorage.setItem(physicalCardKey(id), 'true');
}

// Shipping address
const SHIPPING_ADDR_KEY = 'shipping_address_filled';

export function hasShippingAddress(): boolean {
  return localStorage.getItem(SHIPPING_ADDR_KEY) === 'true';
}

export function markShippingAddress(): void {
  localStorage.setItem(SHIPPING_ADDR_KEY, 'true');
}
