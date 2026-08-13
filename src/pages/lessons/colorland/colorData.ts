// ============================================================
// Color Land 共享颜色数据
// ============================================================

export type ColorKey = 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange';

export interface ColorDef {
  key: ColorKey;
  word: string;
  css: string;   // 主色
  light: string; // 亮部
  deep: string;  // 暗部
  emoji: string; // 大图标代表
}

export const COLORS: ColorDef[] = [
  { key: 'blue', word: 'Blue', css: '#42A5F5', light: '#90CAF9', deep: '#1E88E5', emoji: '💙' },
  { key: 'green', word: 'Green', css: '#66BB6A', light: '#A5D6A7', deep: '#43A047', emoji: '💚' },
  { key: 'red', word: 'Red', css: '#EF5350', light: '#EF9A9A', deep: '#E53935', emoji: '❤️' },
];

export const colorOf = (k: ColorKey): ColorDef => COLORS.find((c) => c.key === k)!;