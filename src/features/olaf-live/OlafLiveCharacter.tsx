import { useEffect, useState } from 'react';
import type { PerformanceFrame } from './types';

interface OlafLiveCharacterProps {
  frame: PerformanceFrame;
  size?: number;
  className?: string;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export default function OlafLiveCharacter({ frame, size = 1, className }: OlafLiveCharacterProps) {
  const [blink, setBlink] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        setBlink(1);
        setTimeout(() => setBlink(0), 120);
        schedule();
      }, 2600 + Math.random() * 2600);
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  const { face, pose, gaze, emotion } = frame;
  const idleBreath = frame.mode === 'idle' ? Math.sin(frame.clockMs / 720) * 2.2 : 0;
  const bodyBounce = pose.bodyBounce * (frame.mode === 'idle' ? 4 : 11) + idleBreath;
  const bodyLean = pose.bodyLean * 10;
  const headTurn = pose.headTurn * 28;
  const headTilt = pose.headTilt * 22;
  const pupilX = clamp(gaze.x * 8, -8, 8);
  const pupilY = clamp(gaze.y * 7, -7, 7);
  const eyeScaleY = Math.max(0.08, 1 - Math.max(blink, face.blink) * 0.92);
  const smile = clamp(face.smile, 0, 1);
  const mouthOpen = clamp(face.mouthOpen, 0, 1);
  const cheekOpacity = clamp(face.cheekRaise * 0.85, 0, 0.85);
  const brow = -face.browRaise * 10;
  const snowOpacity = 0.92 + emotion.valence * 0.04;

  return (
    <div className={className} style={{ transform: `scale(${size})`, transformOrigin: 'center bottom' }}>
      <svg viewBox="0 0 800 900" width="320" height="360" role="img" aria-label="雪宝实时表演角色" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="olaf-live-snow" cx="38%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#fff" stopOpacity={snowOpacity} />
            <stop offset="66%" stopColor="#dff3ff" stopOpacity={snowOpacity} />
            <stop offset="100%" stopColor="#92bddb" />
          </radialGradient>
          <radialGradient id="olaf-live-coal" cx="30%" cy="25%" r="75%">
            <stop offset="0%" stopColor="#5d6672" />
            <stop offset="75%" stopColor="#172333" />
            <stop offset="100%" stopColor="#070d17" />
          </radialGradient>
          <linearGradient id="olaf-live-twig" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9a5a22" />
            <stop offset="100%" stopColor="#3c1e0d" />
          </linearGradient>
          <linearGradient id="olaf-live-carrot" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffc258" />
            <stop offset="70%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#b9380b" />
          </linearGradient>
          <filter id="olaf-live-shadow" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="13" />
          </filter>
          <filter id="olaf-live-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>

        <ellipse cx="400" cy="817" rx="180" ry="24" fill="#10223a" opacity="0.34" filter="url(#olaf-live-shadow)" />
        <g transform={`translate(${bodyLean} ${bodyBounce}) rotate(${bodyLean * 0.3} 400 760)`}>
          <ellipse cx="290" cy="780" rx="35" ry="30" fill="url(#olaf-live-snow)" stroke="#8baec5" strokeWidth="2" />
          <ellipse cx="510" cy="780" rx="35" ry="30" fill="url(#olaf-live-snow)" stroke="#8baec5" strokeWidth="2" />
          <ellipse cx="400" cy="700" rx="160" ry="120" fill="url(#olaf-live-snow)" stroke="#8baec5" strokeWidth="2" />
          <ellipse cx="385" cy="660" rx="15" ry="12" fill="url(#olaf-live-coal)" />

          <g transform={`rotate(${pose.leftArm * -30} 170 410)`}>
            <line x1="310" y1="490" x2="170" y2="410" stroke="url(#olaf-live-twig)" strokeWidth="12" strokeLinecap="round" />
            <line x1="170" y1="410" x2="130" y2="420" stroke="url(#olaf-live-twig)" strokeWidth="12" strokeLinecap="round" />
            <line x1="170" y1="410" x2="140" y2="370" stroke="url(#olaf-live-twig)" strokeWidth="12" strokeLinecap="round" />
            <line x1="170" y1="410" x2="155" y2="450" stroke="url(#olaf-live-twig)" strokeWidth="12" strokeLinecap="round" />
          </g>
          <g transform={`rotate(${pose.rightArm * 30} 630 400)`}>
            <line x1="490" y1="490" x2="630" y2="400" stroke="url(#olaf-live-twig)" strokeWidth="12" strokeLinecap="round" />
            <line x1="630" y1="400" x2="670" y2="380" stroke="url(#olaf-live-twig)" strokeWidth="12" strokeLinecap="round" />
            <line x1="630" y1="400" x2="650" y2="440" stroke="url(#olaf-live-twig)" strokeWidth="12" strokeLinecap="round" />
            <line x1="630" y1="400" x2="610" y2="360" stroke="url(#olaf-live-twig)" strokeWidth="12" strokeLinecap="round" />
          </g>

          <ellipse cx="400" cy="500" rx="110" ry="90" fill="url(#olaf-live-snow)" stroke="#8baec5" strokeWidth="2" />
          <ellipse cx="385" cy="455" rx="10" ry="10" fill="url(#olaf-live-coal)" />
          <ellipse cx="385" cy="525" rx="10" ry="8" fill="url(#olaf-live-coal)" />

          <g transform={`translate(${headTurn * 0.5} ${-bodyBounce * 0.25}) rotate(${headTilt} 400 300)`}>
            <path d="M315 260C270 200 310 110 400 110s130 90 85 150c-20 35-10 95-35 115-30 30-70 30-100 0-25-20-15-80-35-115Z" fill="url(#olaf-live-snow)" stroke="#8baec5" strokeWidth="2.5" />
            <g stroke="url(#olaf-live-twig)" strokeWidth="8" strokeLinecap="round">
              <line x1="400" y1="115" x2="360" y2="40" /><line x1="400" y1="115" x2="405" y2="25" /><line x1="400" y1="115" x2="435" y2="45" />
            </g>

            {[360, 440].map((cx) => (
              <g key={cx}>
                <ellipse cx={cx} cy="205" rx={22} ry="26" fill="#fff" stroke="#172333" strokeWidth="2" transform={`translate(0 205) scale(1 ${eyeScaleY}) translate(0 -205)`} />
                <ellipse cx={cx + pupilX} cy={205 + pupilY} rx="10" ry="12" fill="#050b14" transform={`translate(0 205) scale(1 ${eyeScaleY}) translate(0 -205)`} />
                <circle cx={cx - 3 + pupilX} cy={200 + pupilY} r="3.5" fill="#fff" opacity={eyeScaleY} />
              </g>
            ))}
            <path d="M335 175Q360 170 380 180" fill="none" stroke="#4a2610" strokeWidth="7" strokeLinecap="round" transform={`translate(0 ${brow})`} />
            <path d="M465 175Q440 170 420 180" fill="none" stroke="#4a2610" strokeWidth="7" strokeLinecap="round" transform={`translate(0 ${brow})`} />

            <path d="M395 240Q400 220 410 240l80 20q20 10 0 20l-85-10Z" fill="url(#olaf-live-carrot)" stroke="#ea580c" strokeWidth="1.5" />
            <g stroke="#9a3412" strokeWidth="2" strokeLinecap="round"><line x1="420" y1="248" x2="415" y2="264" /><line x1="440" y1="252" x2="435" y2="268" /><line x1="460" y1="257" x2="455" y2="273" /></g>

            <ellipse cx="330" cy="265" rx="23" ry="11" fill="#fb7185" opacity={cheekOpacity} />
            <ellipse cx="470" cy="265" rx="23" ry="11" fill="#fb7185" opacity={cheekOpacity} />
            <g transform={`translate(400 345) scale(${1 + smile * 0.1} ${0.35 + mouthOpen * 0.8}) translate(-400 -345)`}>
              <path d="M340 310C340 310 400 315 460 310c10 55-130 55-120 0Z" fill="#0d1726" stroke="#172333" strokeWidth="2" />
              <path d="M370 345c0 0 30-20 60 0-20 20-40 20-60 0Z" fill="#fda4af" />
              <path d="M385 311h30l-3 17c0 4-24 4-24 0Z" fill="#fff" />
            </g>
          </g>
        </g>

        {frame.activeGesture === 'celebrate' && <circle cx="400" cy="390" r="165" fill="none" stroke="#a5f3fc" strokeWidth="5" opacity="0.35" filter="url(#olaf-live-glow)" />}
      </svg>
    </div>
  );
}
