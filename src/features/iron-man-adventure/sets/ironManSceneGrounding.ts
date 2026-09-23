import type { IronManAction } from '@/components/iron-man/ironManActions';

export interface SceneActorGrounding {
  // 3D 舞台空间定点 (Spatial Stage Anchor)
  x: number; // 0..1 (X轴位置: 0%左侧 ~ 100%右侧)
  y: number; // 0..1 (Y轴地面立足点: 0%顶部 ~ 100%底部)
  elevation?: number; // 悬浮/飞行高度 (像素)
  scale: number;
  action: IronManAction;
  description: string;

  // 环境光影融合 (Environmental Lighting & Contact Shadow)
  lightingFilter?: string;
  shadow: {
    rx: number;
    ry: number;
    opacity: number;
  };

  // 镜头焦段配置 (Cinematic Camera Target Anchor)
  autoCamera: {
    zoom: number;
    targetX?: number; // 焦段中心 X% (默认为角色胸口)
    targetY?: number; // 焦段中心 Y% (默认为角色胸口)
    shotName: string;
    shotType: 'wide' | 'medium' | 'close';
  };
}

export const SCENE_ACTOR_GROUNDINGS: Record<number, SceneActorGrounding> = {
  0: {
    x: 0.32,
    y: 0.88,
    scale: 0.68,
    action: 'thinking',
    description: '站在斯塔克实验台左侧，凝视并分析全息地球仪',
    lightingFilter: 'drop-shadow(0 0 16px rgba(56, 189, 248, 0.4)) drop-shadow(0 15px 25px rgba(0, 0, 0, 0.7))',
    shadow: { rx: 55, ry: 14, opacity: 0.65 },
    autoCamera: { zoom: 1.35, shotName: '中景 · 实验室全息分析', shotType: 'medium' },
  },
  1: {
    x: 0.50,
    y: 0.88,
    scale: 0.74,
    action: 'greeting',
    description: '站在方舟反应堆地台正中央，右手掌心向前伸出邀请击掌',
    lightingFilter: 'drop-shadow(0 0 24px rgba(250, 204, 21, 0.45)) drop-shadow(0 15px 25px rgba(0, 0, 0, 0.8))',
    shadow: { rx: 65, ry: 16, opacity: 0.75 },
    autoCamera: { zoom: 1.75, shotName: '特写 · 反应堆掌心连接', shotType: 'close' },
  },
  2: {
    x: 0.44,
    y: 0.74,
    elevation: 35,
    scale: 0.64,
    action: 'fly',
    description: '在发射管道轴线上前倾起飞，脚底推进器喷火加速冲向星空',
    lightingFilter: 'drop-shadow(0 0 20px rgba(56, 189, 248, 0.5)) drop-shadow(0 20px 30px rgba(0, 0, 0, 0.5))',
    shadow: { rx: 35, ry: 10, opacity: 0.3 },
    autoCamera: { zoom: 1.05, shotName: '全景 · 发射管道全速冲刺', shotType: 'wide' },
  },
  3: {
    x: 0.48,
    y: 0.76,
    elevation: 40,
    scale: 0.62,
    action: 'fly',
    description: '翱翔在金色星尘航线上，正穿过五角星门',
    lightingFilter: 'drop-shadow(0 0 22px rgba(245, 158, 11, 0.5)) drop-shadow(0 0 15px rgba(168, 85, 247, 0.4))',
    shadow: { rx: 30, ry: 8, opacity: 0.25 },
    autoCamera: { zoom: 1.0, shotName: '全景 · 浩瀚深空星门巡航', shotType: 'wide' },
  },
  4: {
    x: 0.64,
    y: 0.72,
    elevation: 25,
    scale: 0.68,
    action: 'repulsor-blast',
    description: '悬停在雷暴云右侧，掌心光束充能准备推开风暴',
    lightingFilter: 'drop-shadow(0 0 26px rgba(192, 132, 252, 0.6)) drop-shadow(0 0 15px rgba(56, 189, 248, 0.4))',
    shadow: { rx: 40, ry: 10, opacity: 0.35 },
    autoCamera: { zoom: 1.35, shotName: '中景 · 迎击黑云暴风雨', shotType: 'medium' },
  },
  5: {
    x: 0.28,
    y: 0.90,
    scale: 0.68,
    action: 'nod',
    description: '降落在黑曜石崖边，低头发现地面延伸的发光小脚印',
    lightingFilter: 'drop-shadow(0 0 16px rgba(56, 189, 248, 0.35)) drop-shadow(0 15px 25px rgba(0, 0, 0, 0.75))',
    shadow: { rx: 55, ry: 14, opacity: 0.7 },
    autoCamera: { zoom: 1.05, shotName: '全景 · 降落黑玻璃山谷', shotType: 'wide' },
  },
  6: {
    x: 0.68,
    y: 0.84,
    scale: 0.70,
    action: 'unibeam',
    description: '在幽暗洞穴中用胸口方舟光束照亮发光蘑菇与晶石',
    lightingFilter: 'drop-shadow(0 0 28px rgba(56, 189, 248, 0.6)) drop-shadow(0 15px 25px rgba(0, 0, 0, 0.8))',
    shadow: { rx: 55, ry: 14, opacity: 0.7 },
    autoCamera: { zoom: 1.7, shotName: '特写 · 洞穴晶石探照搜索', shotType: 'close' },
  },
  7: {
    x: 0.34,
    y: 0.90,
    scale: 0.66,
    action: 'happy',
    description: '温柔地半蹲在小星星暖床旁，守护正在睡觉的小星星',
    lightingFilter: 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.5)) drop-shadow(0 15px 25px rgba(0, 0, 0, 0.7))',
    shadow: { rx: 50, ry: 13, opacity: 0.65 },
    autoCamera: { zoom: 1.85, shotName: '特写 · 莫莫避难所暖心守护', shotType: 'close' },
  },
  8: {
    x: 0.50,
    y: 0.80,
    scale: 0.70,
    action: 'repulsor-blast',
    description: '站在中央总控晶体基座前，双手传导能量激活三段地脉',
    lightingFilter: 'drop-shadow(0 0 25px rgba(250, 204, 21, 0.55)) drop-shadow(0 0 20px rgba(56, 189, 248, 0.4))',
    shadow: { rx: 55, ry: 14, opacity: 0.7 },
    autoCamera: { zoom: 1.35, shotName: '中景 · 灯塔能量网络充能', shotType: 'medium' },
  },
  9: {
    x: 0.36,
    y: 0.84,
    scale: 0.72,
    action: 'cheer',
    description: '在灯塔顶端观景台迎着晨曦朝阳，举起手臂击掌欢呼',
    lightingFilter: 'drop-shadow(0 0 28px rgba(254, 240, 138, 0.6)) drop-shadow(0 15px 25px rgba(0, 0, 0, 0.75))',
    shadow: { rx: 58, ry: 15, opacity: 0.7 },
    autoCamera: { zoom: 1.35, shotName: '中景 · 破晓晨曦胜利击掌', shotType: 'medium' },
  },
};

/**
 * 计算以角色身体为焦点的电影运镜矩阵
 * @param grounding 角色在当前场景中的定点
 * @param shotType 运镜景别模式
 */
export function calculateCinematicCamera(
  grounding: SceneActorGrounding,
  shotType: 'wide' | 'medium' | 'close' | 'auto',
  showIronMan: boolean = true,
) {
  // 角色中心位置计算 (基于 SVG 站立点)
  const actorFootX = grounding.x * 100;
  const actorFootY = grounding.y * 100;
  const actorHeightPercent = grounding.scale * 60; // 角色在舞台上的相对高度百分比
  const actorTorsoY = actorFootY - actorHeightPercent * 0.52; // 胸口/腰部
  const actorHeadY = actorFootY - actorHeightPercent * 0.78; // 头部/胸口反应堆

  let zoom = 1.0;
  let targetCenterX = 50;
  let targetCenterY = 50;

  if (shotType === 'wide') {
    zoom = 1.0;
    targetCenterX = 50;
    targetCenterY = 50;
  } else if (shotType === 'medium') {
    // 中景 (Half-Body Shot): 以角色躯干为焦点放大至 1.35x
    zoom = 1.35;
    targetCenterX = showIronMan ? actorFootX : 50;
    targetCenterY = showIronMan ? actorTorsoY : 50;
  } else if (shotType === 'close') {
    // 特写 (Bust / Arc Reactor Shot): 以角色头顶与胸口反应堆为焦点放大至 1.85x
    zoom = 1.85;
    targetCenterX = showIronMan ? actorFootX : 50;
    targetCenterY = showIronMan ? actorHeadY : 50;
  } else {
    // 智能镜头 (Auto Shot): 使用剧本专属预设
    zoom = grounding.autoCamera.zoom;
    if (showIronMan) {
      if (grounding.autoCamera.shotType === 'close') {
        targetCenterX = grounding.autoCamera.targetX ?? actorFootX;
        targetCenterY = grounding.autoCamera.targetY ?? actorHeadY;
      } else if (grounding.autoCamera.shotType === 'medium') {
        targetCenterX = grounding.autoCamera.targetX ?? actorFootX;
        targetCenterY = grounding.autoCamera.targetY ?? actorTorsoY;
      } else {
        targetCenterX = 50;
        targetCenterY = 50;
      }
    } else {
      targetCenterX = 50;
      targetCenterY = 50;
    }
  }

  // 计算摄像机平移补偿偏移量 (使得目标点恰好落在屏幕正中)
  const offsetX = (50 - targetCenterX) * (zoom - 1);
  const offsetY = (50 - targetCenterY) * (zoom - 1);

  return {
    zoom,
    offsetX,
    offsetY,
    targetCenterX,
    targetCenterY,
  };
}
