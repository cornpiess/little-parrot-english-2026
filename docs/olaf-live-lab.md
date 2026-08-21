# 雪宝 Live Lab

打开 `/olaf-live-lab` 可进入独立实验页面。即使没有模型凭证，页面也能用“手动导演”按钮预览连续 SVG 表演。

## 本地实时语音

开发环境可以临时设置 `VITE_GEMINI_API_KEY`（只适合个人实验），然后启动前端。部署到 Netlify 时，建议设置服务端变量 `GEMINI_API_KEY`，页面会请求 `/api/gemini-token` 获取一次性短期令牌，浏览器不会收到长期 API Key。

需要在浏览器中授权麦克风；“开启注视”会启用本地 Face/Hand Landmarker，鼠标移动始终作为无摄像头时的注视降级。摄像头画面不发送给模型，只有低频的注视、微笑和挥手语义事件会进入实时会话。

## 代码边界

- `performanceEngine.ts`：连续情绪、姿态、注视、口型和一次性手势的混合。
- `geminiLive.ts`：Gemini Live 原生 WebSocket、工具调用、实时 PCM 音频。
- `audioAnalyzer.ts`：麦克风采集、音频能量/重音分析和 PCM 播放队列。
- `localPerception.ts`：本地 Face/Hand Landmarker 与降级处理。
- `OlafLiveCharacter.tsx`：分层 SVG 绑定，不依赖现有离散雪宝状态机。

实时后端只应改变高层表演意图；逐帧动画始终在浏览器本地运行。
