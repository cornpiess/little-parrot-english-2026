import { IronManCharacter } from '@/components/iron-man';
import StarkNightLabSet from './StarkNightLabSet';
import ArmorPlatformSet from './ArmorPlatformSet';
import LaunchTunnelSet from './LaunchTunnelSet';
import DeepSpaceFlightSet from './DeepSpaceFlightSet';
import BlackCloudAtmosphereSet from './BlackCloudAtmosphereSet';
import BlackGlassValleySet from './BlackGlassValleySet';
import DarkValleySearchSet from './DarkValleySearchSet';
import StarShelterSet from './StarShelterSet';
import LighthouseVeinsSet from './LighthouseVeinsSet';
import DawnSkyLighthouseSet from './DawnSkyLighthouseSet';
import { calculateCinematicCamera, SCENE_ACTOR_GROUNDINGS } from './ironManSceneGrounding';
import './SceneSets.css';

export interface SceneSetMeta {
  id: string;
  act: string;
  title: string;
  location: string;
  objective: string;
  component: React.ComponentType;
}

export const SCENE_SETS_REGISTRY: SceneSetMeta[] = [
  {
    id: 'signal-lab',
    act: '出发',
    title: '1. 斯塔克夜间实验室',
    location: '斯塔克实验室',
    objective: '收到黑云星的求救信号，观察全息星球',
    component: StarkNightLabSet,
  },
  {
    id: 'armor-platform',
    act: '出发',
    title: '2. 装甲连接平台',
    location: '整备舱',
    objective: '触碰钢铁侠掌心，建立副驾驶光能连接',
    component: ArmorPlatformSet,
  },
  {
    id: 'launch-tunnel',
    act: '旅途',
    title: '3. 发射隧道',
    location: '地下发射管道',
    objective: '全速推进，跟随钢铁侠冲向太空',
    component: LaunchTunnelSet,
  },
  {
    id: 'deep-space-flight',
    act: '旅途',
    title: '4. 深空航线',
    location: '深空轨道',
    objective: '飞越星尘门，认识并追随 STAR',
    component: DeepSpaceFlightSet,
  },
  {
    id: 'black-cloud-storm',
    act: '旅途',
    title: '5. 黑云大气层',
    location: '黑云星大气圈',
    objective: '合作扫开磁光风暴云层，安全降落',
    component: BlackCloudAtmosphereSet,
  },
  {
    id: 'glass-valley',
    act: '调查',
    title: '6. 黑玻璃山谷',
    location: '黑玻璃峡谷',
    objective: '观察熄灭的灯塔，发现地面神秘脚印',
    component: BlackGlassValleySet,
  },
  {
    id: 'dark-valley-search',
    act: '调查',
    title: '7. 暗谷搜索区',
    location: '暗谷洞穴',
    objective: '用光束搜索岩洞，寻找并呼唤 STAR',
    component: DarkValleySearchSet,
  },
  {
    id: 'star-shelter',
    act: '转折',
    title: '8. 小星星避难处',
    location: '温暖岩穹',
    objective: '发现莫莫在保护小星星，理解真相',
    component: StarShelterSet,
  },
  {
    id: 'lighthouse-veins',
    act: '修复',
    title: '9. 灯塔内部与地脉',
    location: '灯塔峡谷枢纽',
    objective: '传递 LIGHT，接力唤醒三段地脉',
    component: LighthouseVeinsSet,
  },
  {
    id: 'dawn-sky-peak',
    act: '回归',
    title: '10. 晨曦复明星空',
    location: '灯塔顶端',
    objective: '灯塔光束横扫天空，星光回家，英雄击掌',
    component: DawnSkyLighthouseSet,
  },
];

export type CameraShotType = 'wide' | 'medium' | 'close' | 'auto';

import type { IronManAction } from '@/components/iron-man';

export interface SceneSetHostProps {
  sceneIndex: number;
  showIronMan?: boolean;
  cameraShot?: CameraShotType;
  showSpatialGrid?: boolean;
  onLandingConfirm?: () => void;
  onPalmTouch?: () => void;
  isSuitLinked?: boolean;
  flightProgress?: number;
  actorAction?: IronManAction;
  className?: string;
}

export default function SceneSetHost({
  sceneIndex,
  showIronMan = false,
  cameraShot = 'auto',
  showSpatialGrid = false,
  onLandingConfirm,
  onPalmTouch,
  isSuitLinked = false,
  flightProgress,
  actorAction,
  className = '',
}: SceneSetHostProps) {
  const safeIndex = Math.max(0, Math.min(SCENE_SETS_REGISTRY.length - 1, sceneIndex));
  const currentSet = SCENE_SETS_REGISTRY[safeIndex] || SCENE_SETS_REGISTRY[0];
  const SetComponent = currentSet.component as any;
  const grounding = SCENE_ACTOR_GROUNDINGS[safeIndex] || SCENE_ACTOR_GROUNDINGS[0];

  // Dynamic Actor-Targeted Camera Transformation
  const camera = calculateCinematicCamera(grounding, cameraShot, showIronMan);

  return (
    <div
      className={`iron-scene-set-host ${className}`}
      data-scene-set-host={currentSet.id}
      data-scene-index={safeIndex}
      data-camera-shot={cameraShot}
      data-show-ironman={String(showIronMan)}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'hidden' }}
    >
      <div
        className="iron-scene-camera-container"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          transform: `translate3d(${camera.offsetX}%, ${camera.offsetY}%, 0) scale(${camera.zoom})`,
          transition: 'transform 0.85s cubic-bezier(0.2, 0.8, 0.2, 1)',
          transformOrigin: 'center center',
        }}
      >
        <SetComponent
          onLandingConfirm={onLandingConfirm}
          onPalmTouch={onPalmTouch}
          isSuitLinked={isSuitLinked}
          progress={flightProgress}
        />

        {/* 3D Spatial Grid & Anchor Coordinates (When Debug/Spatial Mode Enabled) */}
        {showSpatialGrid && (
          <div className="spatial-stage-grid" aria-hidden="true">
            {/* Ground Horizon Guide */}
            <div className="grid-horizon-line" style={{ top: `${grounding.y * 100}%` }}>
              <span>地面地平线 (Y: {Math.round(grounding.y * 100)}%)</span>
            </div>
            {/* Target Actor Crosshair */}
            <div
              className="grid-actor-crosshair"
              style={{ left: `${grounding.x * 100}%`, top: `${grounding.y * 100}%` }}
            >
              <div className="crosshair-marker" />
              <span className="crosshair-coords">
                X:{Math.round(grounding.x * 100)}% Y:{Math.round(grounding.y * 100)}% [Scale:{grounding.scale}]
              </span>
            </div>
          </div>
        )}

        {/* Grounded Iron Man Character with Physical Contact Shadow & Lighting Filter */}
        {showIronMan && (
          <div
            className="iron-man-grounded-actor"
            data-grounded-actor="iron-man"
            data-actor-action={actorAction ?? grounding.action}
            style={{
              position: 'absolute',
              left: `${grounding.x * 100}%`,
              top: `${grounding.y * 100}%`,
              transform: `translate(-50%, -100%) translateY(-${grounding.elevation ?? 0}px)`,
              zIndex: 15,
              pointerEvents: 'none',
              overflow: 'visible',
              filter: grounding.lightingFilter || 'drop-shadow(0 15px 25px rgba(0, 0, 0, 0.7))',
              transition: 'left 0.75s ease, top 0.75s ease, transform 0.75s ease, filter 0.6s ease',
            }}
          >
            {/* Real Physical Contact Shadow on Ground Plane */}
            <div
              className="ground-contact-shadow"
              style={{
                position: 'absolute',
                left: '50%',
                bottom: `-${(grounding.elevation ?? 0) * 0.7}px`,
                transform: 'translateX(-50%)',
                width: grounding.shadow.rx * 2,
                height: grounding.shadow.ry * 2,
                borderRadius: '50%',
                background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 72%)',
                opacity: grounding.shadow.opacity,
                filter: 'blur(3px)',
                pointerEvents: 'none',
              }}
            />

            <IronManCharacter action={actorAction ?? grounding.action} size={grounding.scale} readableCues={false} />
          </div>
        )}
      </div>
    </div>
  );
}
