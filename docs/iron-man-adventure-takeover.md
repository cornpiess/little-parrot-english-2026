# 钢铁侠沉浸式冒险：接管与重做执行文档

> 状态：2026-08-28 接管基线  
> 当前入口：`http://localhost:8080/iron-man-first-light`  
> 目标用户：3 岁幼儿；成人控制台仅供教研、导演和开发调试  
> 结论：当前 V2 不能继续做视觉补丁，必须替换场景呈现、游戏运行和语音控制三块实现。

## 1. 用户真正要求的结果

这个案例不是“一个背景里播放七段钢铁侠动画”，而是一段能看懂、能参与、能记住的英雄冒险：

1. 故事有真正的幕与场切换。实验室、发射、太空飞行、穿越大气层、黑玻璃山谷、灯塔内部和星空复明必须是可辨认的不同空间。
2. 游戏是故事中的独立全屏场景。进入飞行后，整个儿童舞台都成为飞行游戏；目标星球从远处小点持续接近，钢铁侠在世界内领航。
3. 钢铁侠负责讲清原因、示范玩法、回应孩子和主动推进，不把“继续”交给不识字的幼儿。
4. 电脑调试支持鼠标；触摸、鼠标和可选摄像头手势进入同一输入接口。
5. 成人控制台复刻雪宝冒险控制台的能力：故事进度、当前幕、地点、目标、学习词、互动模拟、切幕、重听、摄像头和 Azure Speech 配置。
6. Azure Speech 的 Region、Speech Key 和 Voice Name 可以在控制台填写、测试和使用；Azure viseme 驱动钢铁侠类人口型。

详细的原始导演规格仍可参考 [iron-man-immersive-adventure-v2.md](./iron-man-immersive-adventure-v2.md)，但实现时以本文的现状判断、替换范围和验收条件为准。

## 2. 当前代码状态：不要误判为已经完成

### 2.1 当前已有内容

- 路由：`src/App.tsx` 的 `/iron-man-first-light`。
- 页面：`src/features/adventure-v2/IronManFirstLightStage.tsx`。
- 当前运行时：`src/features/adventure-v2/createAdventureSession.ts`。
- 当前故事数据：`src/features/adventure-v2/ironManFirstLightEpisode.ts`。
- 当前领域类型：`src/features/adventure-v2/types.ts`。
- 当前样式：`src/features/adventure-v2/IronManFirstLight.css`。
- 钢铁侠角色：`src/components/iron-man/IronManCharacter.tsx`、`Mark46Rig.tsx`、`ironManActions.ts`。
- 可复用 Azure 语音：`src/features/olaf-live/azureSpeechOutput.ts`、`characterSpeech.ts`。
- 可参考的雪宝冒险控制台：`src/pages/OlafOceanAdventure.tsx` 约 194 行之后，样式在 `src/features/olaf-live/OceanAdventure.css`。

当前相关测试是绿的，但它们只证明当前小接口和简单进度逻辑没有崩溃，不证明用户要求的沉浸效果已经实现：

```powershell
npm test -- src/features/adventure-v2/createAdventureSession.test.ts src/features/adventure-v2/IronManFirstLightStage.test.tsx
# 当前：13/13

npm test
# 当前：114/114

npm run build
# 当前可构建
```

### 2.2 工作区安全

当前仓库不是干净工作区：雪宝 Live Lab、Characters、钢铁侠、巴斯光年、旧冒险与测试存在大量尚未提交的修改和未跟踪文件，`src/features/adventure-v2/` 本身也尚未进入 Git 基线。它们都应视为用户现有成果。

接手者先运行 `git status --short` 识别范围，之后只修改本文规划的新冒险路径、明确的路由接线和必要角色/语音 seam。不要使用 `git reset --hard`、`git clean` 或批量 checkout 清理工作区；不要覆盖与本任务无关的用户修改。

### 2.3 三个已确认的架构缺陷

#### 缺陷 A：没有真正换景

当前所有“场景”都在同一个 `.iron-first-light-stage`、同一个 `.iron-first-light-camera` 和同一个 `sceneGraph()` 中渲染。`camera: 'lab' | 'flight' | 'valley'` 只是条件分支；场景没有自己的布景模块、镜头入口、出口和生命周期。

`ExperienceFrame.transition` 虽然会产生 `fade-in`、`camera-dolly` 等字符串，页面也添加了 `transition-*` 类名，但 CSS 没有实现这些转场。因此用户看到的是同一块深蓝舞台替换少量元素，而不是从一幕进入另一幕。

#### 缺陷 B：飞行不是游戏

当前 `flight-approach` 只做两件事：

- 指针移动时增加 `runtime.progress`；
- 用 `0.06 + progress * 0.64` 改变星球节点的 scale。

它没有独立的游戏状态、航向、速度、星尘门、空间反馈、钢铁侠编队行为、进入动画或抵达动画。帮助计时还会直接增长进度，所以它更像一个自动过场，而不是孩子与钢铁侠共同完成的飞行。

#### 缺陷 C：控制台和语音接错了

当前钢铁侠控制台只有播放、暂停、上下幕、语速、命中区和摄像头等调试按钮；没有雪宝控制台中的地点、戏剧目标、学习词、互动模拟、Azure 配置和可读错误。

当前页面使用 `SpeechSynthesisUtterance`。Azure 的 `Speech Key`、`Region`、情绪 SSML、预加载和 viseme 都没有接入钢铁侠故事，所以用户无法填写 Azure Key。

### 2.4 可以保留与必须替换的部分

保留：

- `AdventureSession.begin/send/control/frame/dispose` 的小接口方向；儿童输入和成人命令继续分离。
- `IronManCharacter` 与 Mark 46 SVG Rig；冒险中保持 `readableCues={false}`。
- 指针归一化、显式请求摄像头权限、摄像头拒绝后仍可玩的降级原则。
- `AzureSpeechOutput` 的 SDK 调用、预加载、错误映射和 viseme 时间轴。
- 雪宝冒险控制台的信息结构和交互能力。

替换：

- `createAdventureSession.ts` 中集中式 `sceneGraph()`。
- 当前七段单台词的 `ironManFirstLightEpisode.ts`。
- 当前用一个通用舞台表现所有地点的渲染结构。
- 当前 `speakInBrowser()` 和只切换 `speaking` 动作的嘴型逻辑。
- 当前把反浩克副驾驶缩成左下角小 HUD 的呈现；飞行时应成为第一人称装甲座舱的一部分。
- 当前成人控制台 JSX；用独立控制台模块替代。

## 3. 目标领域模型

故事使用以下层级，避免把每句台词误当成一个场景：

```text
Episode
├─ Act                    戏剧阶段：出发、旅途、调查、修复、回归
│  └─ Scene               可辨认的真实空间；进入时必须完成换景
│     └─ Moment           同一空间内的台词、动作和因果变化
└─ PlayableScene          Scene 的一种；整个舞台进入游戏控制规则
```

- **Act** 回答“故事现在处于哪一段”。
- **Scene** 回答“孩子现在身处哪里”。Scene 改变时必须有新布景和可见转场。
- **Moment** 回答“这个空间里刚刚发生了什么”。Moment 改变不必重新布景。
- **PlayableScene** 不是弹窗，也不是 Scene 上附加的进度条；它让整个 Scene 进入可操作状态。

建议的蓝图最小形状：

```ts
interface EpisodeBlueprint {
  id: string;
  teaching: { words: readonly string[] };
  acts: readonly ActBlueprint[];
}

interface ActBlueprint {
  id: string;
  scenes: readonly SceneBlueprint[];
}

interface SceneBlueprint {
  id: string;
  setId: SceneSetId;
  entry: TransitionSpec;
  moments: readonly MomentBlueprint[];
  play?: PlayableSceneSpec;
  exit: SceneExit;
}
```

内容蓝图只描述戏剧事实、地点、目标和台词。坐标、SVG path、CSS 动画和碰撞规则留在各 Scene Set 与 Play Module 内。

## 4. 目标模块与接口

页面只依赖一个深 Module：

```ts
interface AdventureSession {
  begin(): void;
  send(signal: ChildSignal): void;
  control(command: DirectorCommand): void;
  frame(atMs: number): ExperienceFrame;
  dispose(): void;
}
```

建议目录：

```text
src/features/iron-man-adventure/
├─ createAdventureSession.ts       唯一外部 Interface
├─ domain/
│  ├─ episode.ts
│  ├─ frame.ts
│  ├─ signals.ts
│  └─ validateEpisode.ts
├─ runtime/
│  ├─ narrativeDirector.ts         Act / Scene / Moment 因果推进
│  ├─ transitionDirector.ts        双场景换景与镜头连续性
│  ├─ engagementDirector.ts        提醒、示范、共同完成
│  ├─ dialogueDirector.ts          台词序列、打断与语音生命周期
│  └─ learningDirector.ts
├─ stage/
│  ├─ AdventureSceneHost.tsx       同时持有 outgoing / incoming Scene
│  ├─ SceneSetRegistry.ts
│  └─ materials/                   光、云、星尘、水晶等可复用材料
├─ sets/
│  ├─ StarkNightLabSet.tsx
│  ├─ LaunchTunnelSet.tsx
│  ├─ DeepSpaceFlightSet.tsx
│  ├─ BlackCloudAtmosphereSet.tsx
│  ├─ BlackGlassValleySet.tsx
│  ├─ LighthouseInteriorSet.tsx
│  └─ DawnSkySet.tsx
├─ play/
│  ├─ PlayableSceneHost.tsx
│  ├─ flightApproach.ts
│  ├─ stormClearing.ts
│  ├─ lightSearch.ts
│  └─ energyRelay.ts
├─ speech/
│  ├─ AdventureSpeechDirector.ts
│  └─ ironManDelivery.ts
├─ console/
│  ├─ AdventureDirectorConsole.tsx
│  └─ AdventureVoiceSettings.tsx
└─ episodes/
   └─ first-light/
      ├─ episode.ts
      └─ dialogue.ts
```

在新路径达到验收前保留当前 `/adventure-v2` 便于对照；切换路由后删除被替代实现和测试，不在旧实现上再叠一层兼容代码。

## 5. 新版完整分幕方案

本案例建议 5 个 Act、10 个 Scene。每次 Scene 切换都必须让未读文字的孩子仅凭画面认出“我们去了另一个地方”。

| Act | Scene / 可见布景 | 关键剧情 | 交互或游戏 | 转场 |
|---|---|---|---|---|
| 出发 | 1. 斯塔克夜间实验室 | 钢铁侠收到灯塔求救信号 | 无；钢铁侠主动发现 | 全息星球亮起 |
| 出发 | 2. 装甲连接平台 | 孩子触碰钢铁侠真实掌心，反浩克副驾驶上线 | 大热区碰掌；鼠标可点 | 掌心光充满镜头 |
| 旅途 | 3. 发射隧道 | 钢铁侠起飞并带孩子离开实验室 | 短暂跟随示范 | 推进器白光擦除实验室 |
| 旅途 | 4. 深空航线 | 飞向远处黑云星，认识 `STAR` | **独立全屏飞行游戏** | 星球放大并进入大气层 |
| 旅途 | 5. 黑云大气层 | 磁光风暴阻挡路线 | **独立全屏清云游戏** | 云层贴镜遮罩后落地 |
| 调查 | 6. 黑玻璃山谷 | 看见熄灭灯塔和断裂水晶路 | 钢铁侠落地、观察、指向线索 | 镜头沿脚印移动 |
| 调查 | 7. 暗谷搜索区 | 用真实光束找到三枚核心或小星星 | **独立全屏搜索游戏** | 暖光揭示维修机器人 |
| 转折 | 8. 小星星避难处 | 发现机器人是在保护小星星，不是反派 | 三次合作清除黑云束缚，不攻击机器人 | 钢铁侠放下武器，镜头转向灯塔 |
| 修复 | 9. 灯塔内部与山谷地脉 | 钢铁侠和孩子传递 `LIGHT` | **独立全屏能量接力游戏** | 光沿地脉冲向塔顶 |
| 回归 | 10. 灯塔顶与复明星空 | 星星回家；钢铁侠与孩子击掌 | 触碰真实掌心完成 | 灯塔光扫过天空形成片尾 |

每个 Scene 至少包含：

- 唯一 `setId` 或明确共享同一空间的理由；
- 2～5 个短 Moment，不是一句长台词撑完整场；
- 进入动作、主因果、角色反应和退出动作；
- 首句在 Scene 可见后 300ms 内启动；
- 明确的无输入共同完成路径。

## 6. 真正的 Scene 切换

`AdventureSceneHost` 必须在换景时同时持有旧 Scene 和新 Scene：

```ts
interface SceneTransitionFrame {
  outgoing?: RenderedScene;
  incoming: RenderedScene;
  kind: 'light-wipe' | 'launch-wipe' | 'cloud-occlusion' | 'camera-push' | 'hard-cut';
  progress: number;
}
```

转场不是统一淡入淡出。每个转场解释空间因果：

- 实验室 → 发射隧道：钢铁侠推进器光遮住镜头。
- 发射隧道 → 深空：隧道门打开，前景框架向后退出。
- 深空 → 大气层：星球占满画面，云层进入近景。
- 大气层 → 山谷：黑云完全遮住画面，再从地面尘埃中散开。
- 山谷 → 灯塔内部：镜头沿点亮的地脉快速推进到灯塔核心。

完成标准：录制连续播放时，任意两幕截帧进行盲测，测试者能在不看文字的情况下区分地点；Scene 改变时 DOM 中 `data-scene-set` 确实改变，并能观察到 outgoing 与 incoming 的转场重叠期。

## 7. 深空飞行游戏：第一优先实现

### 7.1 进入

钢铁侠在发射隧道完成起飞动作，推进光退出后直接进入 `DeepSpaceFlightSet`。不显示“开始游戏”、说明卡或操纵杆按钮。

### 7.2 玩法

- 游戏占满儿童舞台；成人控制台可以收起，让舞台占满浏览器视口。
- 初始目标星球直径约为舞台短边的 6%，位于前方航线末端。
- 鼠标按下拖动、触摸拖动都控制第一人称航向；桌面调试也支持方向键。
- 星尘和三条航线带根据航向产生视差；不是移动一个飞船图标。
- 钢铁侠在孩子左前方编队飞行，偏航时飞到正确方向并用光迹示范。
- 航程由穿过三个星尘门和保持目标方向共同推进，不由纯计时直接增加。
- 星球随真实航程从约 6% 连续增长到约 70%；靠近时地表灯塔轮廓逐渐可辨认。
- 孩子无输入时依次发生：目标闪动 → 钢铁侠画一次航线 → 钢铁侠协助修正；共同完成仍要播放完整接近过程。

建议内部状态：

```ts
interface FlightState {
  heading: { x: number; y: number };
  targetHeading: { x: number; y: number };
  speed: number;
  distance: number;       // 1 = 远，0 = 抵达
  gatesPassed: number;    // 0..3
  alignment: number;      // 0..1
  assistLevel: 0 | 1 | 2;
}
```

完成条件必须是 `gatesPassed === 3 && distance <= threshold`。计时只能改变提示和协助，不能直接把 Scene 标记完成。

### 7.3 退出

星球达到约 70% 后不切黑。它继续占满画面，云层在近景掠过，控制规则连续切换到 `storm-clearing`。清云完成后由云层遮罩进入山谷落地。

### 7.4 验收

- 自动测试断言星球尺寸随 `distance` 单调增长，而非随 wall clock 自动增长。
- 只移动鼠标即可完成完整飞行。
- 停止输入不会瞬间跳过；协助仍播放至少一次可见领航和接近过程。
- 游戏过程中儿童舞台没有进度条、得分、按钮或弹窗。
- 1280×720 录屏中能明显看见星球从远点变成近景世界。

## 8. 成人故事控制台

以 `OlafOceanAdventure.tsx` 的 `.adventure-story-console` 为功能基线，抽成独立 `AdventureDirectorConsole`，不要复制一份巨型页面 JSX。

控制台默认在桌面右侧，支持收起；移动端以成人抽屉存在，不遮挡儿童互动。包含：

### 故事状态

- 当前 Act、Scene、Moment、地点和戏剧目标；
- 故事总进度与当前 Scene 内部进度；
- 当前台词、语音状态、角色表演意图；
- `STAR`、`LIGHT` 是否已经历“看见—听见—使用”；
- 当前互动目标、帮助级别和输入来源。

### 导演控制

- 开始、暂停、重启；
- 上一幕、下一幕、选择 Scene；
- 重播当前台词；
- 0.5×、1×、1.5× 调试速度；
- 显示语义 anchor / 命中区；
- 模拟正确鼠标输入、模拟无输入协助、模拟麦克风拒绝；
- 临时覆写当前 Moment 台词，仅影响本次调试运行，不修改故事源文件。

### 摄像头

- 显式开启或关闭前置摄像头；
- 显示权限错误；
- 摄像头画面只在故事需要的装甲反射面/副驾驶视窗中出现；
- 摄像头不是通关条件。

儿童舞台不得包含控制台文字、按钮或“进入下一幕”。

## 9. Azure Speech 接入

### 9.1 控制台字段

`AdventureVoiceSettings` 至少提供：

- Provider：`Azure Speech` / `Browser fallback`；
- Region：默认 `eastasia`，可修改；
- Speech Key：密码输入框，只保存在当前页面内存；
- Voice Name：可填写，默认沿用项目当前配置；
- “测试声音”按钮：播放一句短测试台词；
- 状态：未配置、连接中、可用、认证失败、区域错误、额度/权限错误；
- “停止声音”按钮。

不要把 Key 写入源码、URL、日志、localStorage 或测试快照。公开部署最终应改为服务端短期令牌或代理；本地实验允许内存配置。

### 9.2 复用现有实现

复用 `AzureSpeechOutput`，不要重新手写 Azure REST 请求。提取一个与雪宝无关的通用位置或保持现有导入，先确保行为正确：

```ts
interface AdventureSpeechDirector {
  configure(config: AzureCharacterVoiceConfig): void;
  preload(cues: readonly DialogueCue[]): void;
  speak(cue: DialogueCue): void;
  cancel(): void;
}
```

生命周期映射：

- `onStart` → `narration-started`，角色进入本句的说话表演；
- `onPulse(features)` → 将 `jawOpen/mouthWide/mouthPucker` 写入钢铁侠连续表演 frame；
- `onEnd` → `narration-ended`，等待角色 reaction / settle 后推进 Moment；
- `onError` → 控制台显示可执行错误；故事可使用浏览器语音或静默字幕降级，不能卡死。

### 9.3 钢铁侠口型缺口

当前 `IronManCharacter` 可以接受 `CharacterPerformanceFrame`，但故事页面只传离散 `action`；Azure `onPulse` 没有进入 Mark 46 面部。接手者必须完成 `VoiceFeatures → CharacterPerformanceFrame → adaptPerformanceToIronMan → Mark46Rig` 链路，或为 Mark 46 增加等价的连续语音输入。

类人钢铁侠说话要求：

- 下颌开合由 viseme 控制，不按固定 90ms 正弦波抖动；
- 头部和胸腔有低幅说话节奏，手势只在重音出现；
- 同一句中不反复重启 `speaking` 动作；
- 台词结束先闭嘴，再完成目光反应和收势。

完成标准：输入有效 Key 和匹配 Region 后，“测试声音”能播放；故事首句使用 Azure；控制台显示 `speaking → ended`；至少三种 viseme 能在 Mark 46 嘴部形成可辨认但不过度的形变。输入错误 Key 时显示 Azure 认证提示且故事不会卡死。

## 10. 角色表演与台词衔接

每个 Moment 使用连续表演弧：

```text
察觉目标 → 身体预备 → 开口/动作 → 世界响应 → 看孩子 → 收势 → 下一 Moment
```

规则：

- Scene 首句在画面稳定后 300ms 内开始。
- 一句只表达一个意思；中文通常不超过 16 个字。
- 进入游戏前钢铁侠先用动作示范，不播放长玩法说明。
- 台词切换由 TTS `onEnd` 和角色 settle 共同驱动，不按固定秒数切断。
- 同一姿态至少完成 anticipation/action/reaction；不能每帧根据 `narration` 在 `listening` 与 `speaking` 之间硬切。
- 禁用 `happy`；使用 `nod`、`greeting`、`fly`、`protect`、`repulsor-blast`、`cheer` 等有明确轮廓的动作，但动作必须由表演意图编排，而不是蓝图直接指定。

## 11. 实施顺序与每步完成条件

### 步骤 1：建立红色验收测试

先写失败测试，覆盖：不同 Scene Set、转场双场景期、飞行不靠时间完成、鼠标完成飞行、Azure 配置和错误、控制台信息、儿童舞台无流程按钮。

完成条件：测试在当前实现上因上述缺口稳定失败，并明确指出缺失行为；不是因为找不到元素或测试环境报错而失败。

### 步骤 2：替换故事蓝图和 Scene Host

建立 Act / Scene / Moment，完成至少实验室、发射隧道、深空、山谷、灯塔五个差异显著的 Set，并实现 outgoing/incoming 转场。

完成条件：从实验室自动连续播放到山谷时至少发生四次可辨认换景；`data-scene-set` 与画面同时改变；没有儿童“继续”按钮。

### 步骤 3：完成独立深空飞行游戏

实现第 7 节全部规则，先只做鼠标、触摸和键盘；摄像头手势不是本步阻塞项。

完成条件：人工录屏清楚显示起飞、航向控制、三次空间经过物和星球 6%→70% 接近，然后连续进入大气层。

### 步骤 4：重建控制台

抽取 `AdventureDirectorConsole`，复刻雪宝控制台的信息与语音设置，不把它写回儿童 Stage。

完成条件：成人能够在不改代码的情况下跳转 Scene、重听、调速、模拟互动、查看目标词状态、开启摄像头和填写 Azure 配置。

### 步骤 5：接入 Azure 与 viseme

复用 `AzureSpeechOutput`，完成语音生命周期、预加载、错误降级和 Mark 46 连续口型。

完成条件：有效 Key、无 Key、错误 Key、错误 Region 四条路径都有确定结果且不锁死故事；Azure 台词和口型共用时间轴。

### 步骤 6：补齐其余场景和游戏

依次实现清云、搜索、黑云救援、能量接力和灯塔结局。每完成一个游戏先通过自身验收，再接入完整故事。

完成条件：10 个 Scene 连续可玩；每个游戏占满舞台；世界本身显示进度；无输入时钢铁侠完成可见的协作过程。

### 步骤 7：替换路由并删除旧 V2

新实现通过全部验收后，将 `/iron-man-first-light` 指向新页面，删除被替代的 `adventure-v2` 运行时、样式和过时测试。

完成条件：删除测试通过；没有新旧两套 Session 并存；全量测试和生产构建通过。

## 12. 最终验收清单

以下每项必须给出自动测试或录屏/截图证据：

1. 至少 7 个视觉上明显不同的 Scene Set，完整故事包含 10 个 Scene。
2. Scene 切换有真实空间转场，不是同一背景替换节点或统一淡入淡出。
3. 深空飞行、清云、搜索、能量接力都是独立全屏游戏场景。
4. 飞行星球从约 6% 连续增长到约 70%，孩子能用鼠标完成。
5. 游戏没有弹窗、得分、倒计时、流程按钮或儿童进度条。
6. 钢铁侠主动讲明原因、示范、回应并推进；3 岁孩子无需识字即可继续。
7. 成人控制台具备雪宝冒险控制台的信息结构、调试入口和 Azure 设置。
8. Azure Region、Speech Key、Voice Name 可填写并测试；错误信息可读。
9. Azure viseme 驱动钢铁侠嘴型，台词不会被切断，场景不会因静音或错误而锁死。
10. 触摸与鼠标共享输入逻辑；摄像头与麦克风拒绝后仍可完整体验。
11. 儿童舞台除 `STAR`、`LIGHT` 外不显示说明文字。
12. 全故事不调用 `happy`，角色动作有预备、反应和收势。
13. 1280×720、1024×768、390×844 三个视口可用；控制台可收起。
14. `npm test` 与 `npm run build` 通过。
15. 三名不知道玩法的成人仅凭画面与钢铁侠引导都能完成；随后再做真实幼儿观察。

## 13. 接手者的第一轮工作边界

第一轮不要同时做完整十幕。只交付一条可信的 tracer：

```text
实验室求救 → 掌心连接 → 发射隧道换景 → 全屏深空飞行 → 星球占满画面 → 黑云大气层
```

这条 tracer 必须同时包含：真实换景、鼠标飞行、钢铁侠领航、可收起控制台和 Azure 测试声音。它通过后再扩展山谷、搜索和灯塔。若第一条链仍像“同一舞台换皮”，应继续修正 Scene Host，而不是增加后续内容。
