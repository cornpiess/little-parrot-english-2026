# Iron Man SVG 形象与长肢体动作调研

调研日期：2026-08-27

## 结论

GitHub 上能找到 Iron Man 的 SVG 或 CSS 动画示例，但本次没有找到同时满足以下条件的现成方案：**非 Q 版、完整全身、可拆分关节、许可证覆盖美术素材、能直接塞入离线单文件 HTML**。

因此，建议自行绘制一个非 Q 版、成年类人比例的装甲角色；动画架构参考开源项目的骨架层级、局部关节旋转和两骨骼 IK，但不直接复制许可不明的 Iron Man 美术，也不引入重型运行时。

最适合当前 `characters.html` 的方案是：

- 一个 SVG 同时承担静态与动态版本；静态版渲染 neutral 帧，动态版给同一套关节写入姿态。
- 用嵌套 `<g>` 形成 `pelvis → torso → chest → neck → head`、`shoulder → upperArm → forearm → hand`、`hip → thigh → shin → foot` 的父子链。
- 每段几何以近端关节为局部 `(0, 0)`，动作数据只存局部角度和根节点位移；不要给散落的绝对路径分别做 CSS 旋转。
- 用原生 JavaScript 插值 SVG `transform`，保持单文件、离线和零依赖。

## GitHub Iron Man 素材核查

| 候选 | 实际内容 | 许可证核查 | 结论 |
|---|---|---|---|
| [OmkarThawakar/ironman-svg-sketch](https://github.com/OmkarThawakar/ironman-svg-sketch) | 单个头盔线稿；动画只是路径描边和填充闪烁。可直接查看其 [ironman.html](https://github.com/OmkarThawakar/ironman-svg-sketch/blob/master/ironman.html)。 | 仓库根目录只有 `.DS_Store` 和 `ironman.html`，没有 `LICENSE`。 | 不是全身、不能关节驱动，且许可不明确；不采用。 |
| [withaarzoo/Iron-man](https://github.com/withaarzoo/Iron-man) | 将头盔、胸甲、左右手臂和左右腿作为外部图片拼装；[index.html](https://github.com/withaarzoo/Iron-man/blob/main/index.html) 指向 CodePen 的 S3 SVG 文件。 | README 声称 MIT，但仓库根目录没有 `LICENSE`；外链美术也不在仓库内，无法由该仓库的代码声明证明授权。 | 结构只有整条手臂/腿，没有肘、膝关节，不适合长肢体动作；不复制素材。 |
| [JordyYeoman/Ironman-Card-SVGAnimation](https://github.com/JordyYeoman/Ironman-Card-SVGAnimation) | Anime.js 驱动的 Iron Man 主题卡片动画。 | 仓库没有可核验的 `LICENSE`。 | 是卡片表现，不是全身人物骨架；不采用。 |
| [ProGrammer-070 的 Iron Man Animation gist](https://gist.github.com/ProGrammer-070/b2b403990d40524dcbe381e37b7ffdfc) | 与上述拼装方案相同，使用外链部件做“穿甲/起飞”。 | gist 页面只显示笼统的 “License”，没有覆盖外链 SVG 的明确许可证文件。 | 可以说明“部件分层”思路，但不足以作为可复用美术来源。 |

这里的关键区别是：仓库代码采用开源许可证，不自动证明外部 Iron Man 图片也采用同一许可证；“公开可访问”也不等于“开源素材”。即使最终只在本地使用，这些候选的技术质量仍不满足完整人形动作的要求，所以自行绘制反而更直接。

## 可采用的开源骨架与动作方案

### 1. TouchFree Puppet 2D：嵌套关节与相对角

[TouchFree Puppet 2D](https://github.com/BigSkyInteractive/touchfree-puppet-2d) 的 [puppet.js](https://github.com/BigSkyInteractive/touchfree-puppet-2d/blob/main/puppet.js#L173-L191) 展示了适合本项目的基本数学：先平移到肩/髋，再旋转上臂/大腿；继续平移到肘/膝，再用相对父段的角度旋转前臂/小腿。其 [LICENSE](https://github.com/BigSkyInteractive/touchfree-puppet-2d/blob/main/LICENSE) 为 MIT。

这正好解决长肢体角色最容易出现的两个问题：

- 肘或膝旋转时，下游的手或脚会自然跟随，不会“脱节”。
- 动画只需插值十几个局部自由度，不需要重算或形变装甲路径。

### 2. Pose Animator：骨架与美术分离

[Pose Animator](https://github.com/yemount/pose-animator#animate-your-own-design) 要求输入 SVG 将命名关节点放在 `skeleton` 组、把插画路径放在 `illustration` 组，说明“骨架数据”和“可见美术”应分离。项目采用 [Apache-2.0](https://github.com/yemount/pose-animator/blob/master/LICENSE)。

它依赖 TensorFlow.js、实时人体姿态和路径变形，对当前“点击动作按钮播放预设动画”的离线页面过重。因此只参考其关节命名与骨架/美术分层，不引入整套运行时。

### 3. spine_anim_mcp：长腿步态、跳跃和脚底锁定

[spine_anim_mcp](https://github.com/K-ulucay/spine_anim_mcp) 提供了类人骨架及程序化动作生成；[generators.py](https://github.com/K-ulucay/spine_anim_mcp/blob/main/src/spine_anim_mcp/anim/generators.py) 包含走、跑、跳和攻击的分阶段动作，[ik.py](https://github.com/K-ulucay/spine_anim_mcp/blob/main/src/spine_anim_mcp/anim/ik.py) 包含两段肢体 IK。仓库采用 [MIT](https://github.com/K-ulucay/spine_anim_mcp/blob/main/LICENSE)。

可迁移到普通 JavaScript 的核心规律：

- walk：左右腿反相摆动，手臂与对侧腿配合，根节点有双倍频率的轻微上下起伏。
- run：增大髋、膝、肩、肘摆幅，身体前倾，腾空阶段比 walk 明显。
- jump：下蹲蓄力 → 起跳伸展 → 顶点收腿/展臂 → 落地屈膝 → 回弹站稳。
- punch：预备回拉 → 髋部启动 → 躯干转动 → 肩带动上臂 → 肘伸直 → 随动 → 回收。
- 支撑脚用两骨骼 IK 锁定在地面；摆动脚走抬起的弧线。否则长腿角色会明显“滑冰”。

### 4. SVG 的变换原点与层级规则

MDN 的 GitHub 源文档指出 SVG 元素的 `transform-origin` 默认是 `0 0`，并说明 CSS 属性会覆盖同名 SVG presentation attribute；若需要相对元素包围盒，则要配合 `transform-box: fill-box`。来源：[mdn/content 的 transform-origin 文档](https://github.com/mdn/content/blob/main/files/en-us/web/svg/reference/attribute/transform-origin/index.md)。

本项目更稳妥的做法不是依赖浏览器推算 `transform-origin`，而是把每段肢体的近端关节直接画在局部 `(0, 0)`，再对整个 `<g>` 使用 `translate(jointX jointY) rotate(angle)`。这样 SVG 属性和 CSS 变换不会互相覆盖，也避免不同浏览器对包围盒原点的差异。

## 推荐的 Iron Man SVG rig

```text
ironman-root (x, y, rotation, scale)
└─ pelvis
   ├─ torso
   │  ├─ chest + arc-reactor
   │  ├─ neck → head + eyes
   │  ├─ left-shoulder → upper-arm → forearm → hand + palm-repulsor
   │  └─ right-shoulder → upper-arm → forearm → hand + palm-repulsor
   ├─ left-hip → thigh → shin → foot + boot-thruster
   └─ right-hip → thigh → shin → foot + boot-thruster
```

绘制要求：

- 比例采用约 7.5–8 头身，肩宽约 2.5–3 个头宽，手垂下接近大腿中段；避免大头、短手、短腿的 Q 版特征。
- 上臂与前臂、大腿与小腿必须是独立图层；手、脚也独立，才能表现掌心炮、飞行和落地。
- 每个关节处让上下装甲片重叠约一个关节盖宽度，并在肘、膝、髋、腋下添加深色柔性连接层，防止弯曲时露出背景缝隙。
- 胸甲和骨盆尽量保持刚体；动作感主要来自骨盆位移、躯干反向补偿、肩/髋旋转和四肢关节。
- 需要表现手脚朝向镜头时，可对局部肢段使用轻微 `scaleY` 做缩短透视，但不要变形整个人。
- 手臂跨到胸前或转到身后时，要按动作阶段切换 z-order；单一固定层级会让“挥手、敬礼、出拳”看起来穿模。

## 动作设计建议

| 动作 | 长肢体实现重点 |
|---|---|
| static / neutral | 同一 rig 的 neutral 帧；骨盆居中、膝微松、肘微弯、脚底齐平。 |
| idle | 胸腔轻微呼吸，重心缓慢在两脚间转移，头部小幅扫描；避免整个人机械地上下漂。 |
| dance | 骨盆左右移动和旋转、肩线反向摆动；双臂至少经过肩和肘两级屈伸，双腿交替屈膝/点地。不能只做全身 bob。 |
| walk | 支撑脚锁地，另一脚走抬起弧线；骨盆略下沉，肩髋反向，手臂与对侧腿同相。 |
| run | 身体前倾、步幅和膝抬高更大，加入短暂腾空；手肘保持较明显弯曲。 |
| wave | 上臂抬到肩以上，肘弯曲；前臂围绕肘摆动，手掌再做小幅独立旋转。 |
| salute | 肩先外展，肘折叠，手靠近额角；收势时按相反顺序回到 neutral。 |
| punch | 髋、胸、肩、肘依次发力；非出拳侧手臂回收保持平衡，根节点轻微前移后回弹。 |
| jump / land | 下蹲时髋膝踝同时屈曲；起跳时三关节依次伸展；落地必须屈膝吸收，不能整条腿直挺挺上下移动。 |
| fly / hover | fly 使用 15–30° 全身前倾、腿向后收、手臂姿态明确；hover 较直立，以小幅姿态修正稳定身体。掌心和脚底推进器作为独立光效，不参与骨骼角度。 |

## 动画数据与渲染建议

每个动作由一组关键帧组成，不把 CSS 类散落到单个路径上：

```js
{
  t: 0.5,
  root: { x: 0, y: -8, rotate: -4 },
  torso: 6,
  head: -2,
  leftUpperArm: -48,
  leftForearm: -62,
  leftHand: 12,
  leftThigh: 18,
  leftShin: -34,
  leftFoot: 10
}
```

建议以 `requestAnimationFrame` 读取相邻关键帧，使用 ease-in-out 或分段 cubic easing 插值，再统一写入各关节 `<g>` 的 `transform`。动作切换时从“当前实际姿态”混合到新动作首帧，避免点击按钮时四肢瞬移。

视觉特效（眼睛、胸口反应堆、掌心炮、脚底推进器）应与骨架动画分轨：骨骼轨只负责姿态，光效轨负责 opacity、scale、blur 和粒子。这样静态版能关闭所有循环，动态版也能按动作启用需要的光效。

## 最终选型

1. 自行绘制非 Q 版全身装甲 SVG，不使用上述许可不清的 Iron Man 美术。
2. 使用 TouchFree Puppet 2D 证明有效的嵌套局部关节结构。
3. 用 spine_anim_mcp 的步态、跳跃、攻击和两骨骼 IK 数学改写成少量原生 JavaScript。
4. 静态和动态复用同一 SVG rig，静态只是暂停在 neutral 姿态。
5. 保持单文件 HTML，不引入 Pose Animator、Spine、TensorFlow.js 或远程 CDN。
