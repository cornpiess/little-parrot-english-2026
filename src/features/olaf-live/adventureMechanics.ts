export type AdventureMechanicId = 'relationship-light' | 'balance-trail' | 'rhythm-navigation' | 'scan-and-repair' | 'gravity-direction';

export interface AdventureMechanicKit {
  id: AdventureMechanicId;
  label: string;
  childRole: string;
  interaction: 'comfort' | 'route' | 'rhythm' | 'repair' | 'direction';
}

/** Mechanics are reusable play grammars; a story supplies nouns and lines only. */
export const ADVENTURE_MECHANICS: readonly AdventureMechanicKit[] = [
  { id: 'relationship-light', label: '陪伴点亮', childRole: '温柔陪伴者', interaction: 'comfort' },
  { id: 'balance-trail', label: '平衡护送', childRole: '小小守护员', interaction: 'route' },
  { id: 'rhythm-navigation', label: '节拍导航', childRole: '双人导航员', interaction: 'rhythm' },
  { id: 'scan-and-repair', label: '观察修理', childRole: '小小工程师', interaction: 'repair' },
  { id: 'gravity-direction', label: '方向指挥', childRole: '重力指挥官', interaction: 'direction' },
];

export function getAdventureMechanic(id: AdventureMechanicId | undefined): AdventureMechanicKit | undefined {
  return id ? ADVENTURE_MECHANICS.find((mechanic) => mechanic.id === id) : undefined;
}
