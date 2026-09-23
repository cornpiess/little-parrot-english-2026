# Unified real-time character control research

Date: 2026-08-21

## Conclusion

There is no production API that currently emits speech audio, facial expression,
eye gaze, and full-body motion as a single synchronized control stream for an
arbitrary SVG character. The practical architecture is a shared performance
clock with two streaming models: a realtime speech model and a causal motion
policy. Both feed a continuous 2D rig rather than selecting animation clips.

## Production-ready building blocks

- NVIDIA Audio2Face-3D converts streaming speech into time-coded ARKit-style
  blendshape values at 30 FPS. It is the closest available learned facial
  performance driver, but the documented microservice does not provide head or
  eye motion, so gaze and body behavior still need a separate controller.
  Sources: [NVIDIA A2F overview](https://docs.nvidia.com/ace/audio2face-3d-microservice/latest/text/getting-started/overview.html),
  [NVIDIA A2F streaming output](https://docs.nvidia.com/ace/audio2face-3d-microservice/latest/text/architecture/audio2face-ms.html).
- NVIDIA ACE combines speech, intelligence, facial animation, and animation
  graph components as an avatar stack. Its legacy Animation Pipeline is
  explicitly command-based for body gestures and has been deprecated in favor
  of Tokkio; it is therefore an ecosystem, not one end-to-end performance
  model. Sources: [ACE overview](https://docs.nvidia.com/ace/overview/2025.04.28/),
  [Animation Pipeline](https://docs.nvidia.com/ace/animation-pipeline/latest/index.html).
- Gemini Live provides native realtime audio, interruption, tool use, and
  affective dialogue. These capabilities improve voice behavior but do not emit
  facial or skeletal motion coefficients. Source:
  [Gemini Live API](https://ai.google.dev/gemini-api/docs/live-api).
- OpenAI Realtime provides native speech-to-speech over WebRTC/WebSocket and
  supports realtime events/tool use, but likewise does not expose character
  motion. Source: [OpenAI Realtime API](https://platform.openai.com/docs/api-reference/realtime).
- Live2D Cubism MotionSync produces blended visemes from speech and is useful
  for a 2D rig, but it addresses mouth motion rather than whole-character
  performance. Source: [Cubism MotionSync](https://docs.live2d.com/en/cubism-editor-manual/motion-sync/).
- Rive offers vector rigs, frame-advanced state machines, blend layers, and
  runtime data binding. It is a stronger renderer/rig than hand-authored DOM SVG,
  but it is not a generative performance model. Sources:
  [Rive state machines](https://rive.app/docs/runtimes/state-machines),
  [Rive data binding](https://rive.app/docs/runtimes/web/data-binding).

## Research building block

PantoMatrix/EMAGE demonstrates unified speech-to-face-and-body generation and
outputs SMPL-X/FLAME motion. It is a useful training reference, but its published
pipeline is not a browser-ready, low-latency character service and requires
retargeting to a 2D rig. Source:
[PantoMatrix repository](https://github.com/PantoMatrix/PantoMatrix).

## Recommended architecture for Olaf

1. Use Gemini Live or OpenAI Realtime for conversational audio and interruption.
2. Feed generated audio, prosody, semantic intent, user gaze, and prior pose into
   a small causal performance model at 25-30 Hz.
3. Output a continuous vector: visemes/blendshapes, brows, eyelids, gaze, head,
   torso, arms, gesture phase, and motion energy, all with timestamps.
4. Retarget that vector into a Rive/Live2D-style 2D rig, or a substantially
   deepened SVG rig with mesh deformation and skeletal constraints.
5. Use procedural constraints only for blink scheduling, collision limits,
   damping, and safety; do not use named animation clips as the primary motion
   source.

The fastest convincing prototype is realtime speech + NVIDIA Audio2Face facial
coefficients + a small learned/procedural gaze-and-gesture policy, mapped to a
2D rig. The long-term research target is a jointly trained model that emits
audio codec tokens and motion tokens on one clock.
