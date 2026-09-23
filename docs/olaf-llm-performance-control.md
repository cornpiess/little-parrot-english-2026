# 雪宝 LLM 表演控制架构研究

## 结论

LLM 不应输出 SVG 关节、表情通道或逐帧动画。它只在对话事件边界输出一次紧凑的“表演意图包”；本地状态化演员模型将意图展开为察觉、判断、准备、行动、反馈和收势，并以 60 FPS 连续驱动 Rig。嘴型、重音动作和打断反应由音频与本地感知直接驱动，不经过 LLM。

这是一套多速率控制系统：

| 层级 | 典型更新频率 | 责任 | 是否消耗 LLM Token |
| --- | ---: | --- | --- |
| 剧情/关系导演 | 每个场景或目标变化 | 这一幕希望孩子感到什么 | 少量 |
| 对话回合导演 | 每个短句或语义拍 | 沟通行为、强度、可选空间倾向 | 少量 |
| 本地演员模型 | 60 FPS | 情绪惯性、动作编排、自然转场、空间约束 | 否 |
| 音频表演适配器 | 20–60 FPS | viseme、嘴型、音量、重音、停顿 | 否 |
| 本地社交反射 | 30–60 FPS | 看回孩子、眨眼、微笑回应、打断后收势 | 否 |

## 推荐控制协议

对模型只公开一个工具：

```ts
type PerformTurn = {
  goal: 'celebrate' | 'comfort' | 'invite' | 'discover'
    | 'reassure' | 'play' | 'listen';
  act: 'acknowledge' | 'ask' | 'explain' | 'encourage'
    | 'joke' | 'reveal' | 'praise' | 'wait';
  level?: 0 | 1 | 2 | 3;
  relation?: 'connect' | 'share' | 'lead' | 'give_space';
  seed?: number;
};
```

普通调用只需要：

```json
{"goal":"comfort","act":"encourage","level":1,"seed":417}
```

字段含义：

- `goal` 决定希望孩子产生的感受。
- `act` 决定这一句话在交流中做什么，而不是指定肢体动作。
- `level` 只提供粗粒度强度，避免 LLM 伪造没有意义的小数精度。
- `relation` 只在靠近、带领、分享秘密或需要给空间时覆盖默认空间关系。
- `seed` 让本地演员从同一意图生成不重复但可复现的表演。

不允许 LLM 输出 `hold_ms`、眼球坐标、手臂角度、viseme、拍手频率或逐帧轨迹。动作何时结束由真实语音结束、表演收势和用户打断事件决定。

## 为什么比“30 个状态”更先进

30 个状态可作为调试目录，但不应该成为模型的动作菜单。有限状态会让模型频繁选择同几个显眼动作；连续数值又会让模型输出看似精确、实际缺乏时间一致性的控制量。

推荐方式是“有限语义 × 连续演员状态”：LLM 选择少量稳定语义，本地演员结合上一状态、角色人格、语音能量、注视关系、场景空间和随机种子生成连续变化。无限性来自状态组合和时间演化，不来自无限扩充动作名称。

## Token 与延迟策略

1. 一句话或一个语义拍最多一次工具调用，绝不按帧调用。
2. 没有明显目标变化时不调用；本地演员延续上一意图并自然衰减。
3. 人格、儿童安全规则和工具 schema 只在会话建立时发送一次。
4. 运行时只发送事件增量，例如“孩子笑了”“孩子打断了”，不回传完整 Rig 或摄像头数值流。
5. `presence`、注视、嘴型和打断全部本地推导，不作为 LLM 工具。
6. 工具收到后立即返回极小确认值，例如 `{"ok":1}`，不要把 Rig 结果回灌给模型。
7. 长期剧情只保留结构化摘要：当前主题、孩子情绪、未完成目标和最近一句；不要每轮重复完整历史。

若每 3–8 秒产生一次语义拍，三分钟只需要约 20–60 个紧凑控制包；逐帧 30 FPS 则需要 5,400 次控制。减少调用频率远比把字段名再缩短一两个字符更重要。

## 对当前项目的具体判断

当前实现已经收敛为 `perform_turn`：LLM 做导演，本地具身导演和连续 Rig 做演员。工具可以携带 `objects`（最多两个）及 `object_action`，但模型不接触关节、坐标或锚点；物体能力校验和生命周期由本地导演控制。

Gemini 3.1 Flash Live 官方定位为低延迟原生 audio-to-audio 模型，支持 Live API 和函数调用，但不支持缓存与 Structured Outputs；函数调用当前为同步模式，因此客户端收到表演工具后应立即应用并返回确认，不能等待动画结束。[Gemini 3.1 Flash Live 模型说明](https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-live-preview) [Gemini Live 工具说明](https://ai.google.dev/gemini-api/docs/live-api/tools)

同一官方模型页明确指出 Gemini 3.1 Flash Live 不支持 affective dialogue。当前项目同时使用该模型与 `enableAffectiveDialog: true`，不能把这一开关当作情绪控制来源；角色表演必须由本地演员层和真实音频特征保证。[Gemini 3.1 Flash Live 模型说明](https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-live-preview)

NVIDIA Audio2Face-3D 的边界也印证了分层设计：它把音频转换为带时间码的 blendshape，并可检测或接收情绪，但官方说明它不负责头部运动和眼神方向。因此，即使未来接入 Audio2Face，也只能替换嘴型和部分面部层，不能取代注视导演、身体动作和空间表演系统。[NVIDIA Audio2Face-3D 架构](https://docs.nvidia.com/ace/audio2face-3d-microservice/2.0/text/architecture/audio2face-ms.html) [NVIDIA Audio2Face-3D 概览](https://docs.nvidia.com/ace/audio2face-3d-microservice/latest/text/getting-started/overview.html)

## 推荐落地顺序

1. 合并模型工具为一个 `perform_turn`。
2. 将 presence、注视、嘴型和低延迟社交反射完全移出 LLM 控制面。
3. 让 `speech_end + actor_settled` 成为唯一正常换拍条件，用户打断成为唯一强制中止条件。
4. 用现有 30 个 motif 作为本地演员的训练/测试样本，而不是 LLM 枚举。
5. 记录每次工具调用、语音时长、动作收势时间和儿童反应，建立离线评测集。
6. 数据足够后，用小型本地策略模型替换程序化演员参数生成器；LLM 协议保持不变。
