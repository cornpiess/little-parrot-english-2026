import { useEffect, useRef, useState } from 'react';

interface OlafCharacterProps {
  size?: number;
}

export default function OlafCharacter({ size = 1 }: OlafCharacterProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [blinkState, setBlinkState] = useState(1);
  const [headRot, setHeadRot] = useState(0);
  const [pupilX, setPupilX] = useState(0);
  const [pupilY, setPupilY] = useState(0);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setBlinkState(0.1);
        setTimeout(() => setBlinkState(1), 150);
      }
    }, 3000);
    return () => clearInterval(blinkInterval);
  }, []);

  useEffect(() => {
    const headInterval = setInterval(() => {
      setHeadRot((Math.random() - 0.5) * 6);
      setPupilX((Math.random() - 0.5) * 4);
      setPupilY((Math.random() - 0.5) * 3);
    }, 2000);
    return () => clearInterval(headInterval);
  }, []);

  return (
    <div style={{ transform: `scale(${size})`, transformOrigin: 'center bottom' }}>
      <svg
        ref={svgRef}
        viewBox="0 0 800 900"
        width="200"
        height="225"
      >
        <defs>
          <radialGradient id="olaf-snowball" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="65%" stopColor="#e2f1f9" />
            <stop offset="100%" stopColor="#9fc2d9" />
          </radialGradient>
          <radialGradient id="olaf-carrot" cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffb03a" />
            <stop offset="70%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#c2410c" />
          </radialGradient>
          <radialGradient id="olaf-coal" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#52525b" />
            <stop offset="75%" stopColor="#18181b" />
            <stop offset="100%" stopColor="#09090b" />
          </radialGradient>
          <linearGradient id="olaf-twig" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#78350f" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>
          <filter id="olaf-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
        </defs>

        {/* Shadow */}
        <ellipse cx="400" cy="800" rx="180" ry="22" fill="#030712" filter="url(#olaf-shadow)" opacity="0.6"/>

        {/* Bottom snowball */}
        <g>
          <ellipse cx="290" cy="780" rx="35" ry="30" fill="url(#olaf-snowball)" stroke="#94a3b8" strokeWidth="2"/>
          <ellipse cx="510" cy="780" rx="35" ry="30" fill="url(#olaf-snowball)" stroke="#94a3b8" strokeWidth="2"/>
          <ellipse cx="400" cy="700" rx="160" ry="120" fill="url(#olaf-snowball)" stroke="#94a3b8" strokeWidth="2"/>
          <ellipse cx="385" cy="660" rx="15" ry="12" fill="url(#olaf-coal)"/>
        </g>

        {/* Middle snowball */}
        <g>
          <line x1="310" y1="490" x2="170" y2="410" stroke="url(#olaf-twig)" strokeWidth="12" strokeLinecap="round"/>
          <line x1="170" y1="410" x2="130" y2="420" stroke="url(#olaf-twig)" strokeWidth="12" strokeLinecap="round"/>
          <line x1="170" y1="410" x2="140" y2="370" stroke="url(#olaf-twig)" strokeWidth="12" strokeLinecap="round"/>
          <line x1="170" y1="410" x2="155" y2="450" stroke="url(#olaf-twig)" strokeWidth="12" strokeLinecap="round"/>
          <line x1="490" y1="490" x2="630" y2="400" stroke="url(#olaf-twig)" strokeWidth="12" strokeLinecap="round"/>
          <line x1="630" y1="400" x2="670" y2="380" stroke="url(#olaf-twig)" strokeWidth="12" strokeLinecap="round"/>
          <line x1="630" y1="400" x2="650" y2="440" stroke="url(#olaf-twig)" strokeWidth="12" strokeLinecap="round"/>
          <line x1="630" y1="400" x2="610" y2="360" stroke="url(#olaf-twig)" strokeWidth="12" strokeLinecap="round"/>
          <ellipse cx="400" cy="500" rx="110" ry="90" fill="url(#olaf-snowball)" stroke="#94a3b8" strokeWidth="2"/>
          <ellipse cx="385" cy="455" rx="10" ry="10" fill="url(#olaf-coal)"/>
          <ellipse cx="385" cy="525" rx="10" ry="8" fill="url(#olaf-coal)"/>
        </g>

        {/* Head */}
        <g style={{
          transform: `rotate(${headRot}deg)`,
          transformOrigin: '400px 320px',
          transition: 'transform 0.5s ease'
        }}>
          <path d="M 315 260 C 270 200, 310 110, 400 110 C 490 110, 530 200, 485 260 C 465 295, 475 355, 450 375 C 420 405, 380 405, 350 375 C 325 355, 335 295, 315 260 Z"
            fill="url(#olaf-snowball)" stroke="#94a3b8" strokeWidth="2.5"/>
          
          {/* Hair */}
          <line x1="400" y1="115" x2="360" y2="40" stroke="url(#olaf-twig)" strokeWidth="8" strokeLinecap="round"/>
          <line x1="400" y1="115" x2="405" y2="25" stroke="url(#olaf-twig)" strokeWidth="8" strokeLinecap="round"/>
          <line x1="400" y1="115" x2="435" y2="45" stroke="url(#olaf-twig)" strokeWidth="8" strokeLinecap="round"/>

          {/* Eyes */}
          <g style={{ transform: `scaleY(${blinkState})`, transformOrigin: '360px 205px', transition: 'transform 0.1s' }}>
            <ellipse cx="360" cy="205" rx="22" ry="26" fill="#ffffff" stroke="#1e293b" strokeWidth="2"/>
            <g style={{ transform: `translate(${pupilX}px, ${pupilY}px)` }}>
              <ellipse cx="360" cy="205" rx="10" ry="12" fill="#000000"/>
              <circle cx="357" cy="200" r="3.5" fill="#ffffff"/>
            </g>
          </g>
          <g style={{ transform: `scaleY(${blinkState})`, transformOrigin: '440px 205px', transition: 'transform 0.1s' }}>
            <ellipse cx="440" cy="205" rx="22" ry="26" fill="#ffffff" stroke="#1e293b" strokeWidth="2"/>
            <g style={{ transform: `translate(${pupilX}px, ${pupilY}px)` }}>
              <ellipse cx="440" cy="205" rx="10" ry="12" fill="#000000"/>
              <circle cx="437" cy="200" r="3.5" fill="#ffffff"/>
            </g>
          </g>

          {/* Eyebrows */}
          <path d="M 335 175 Q 360 170, 380 180" fill="none" stroke="#451a03" strokeWidth="7" strokeLinecap="round"/>
          <path d="M 465 175 Q 440 170, 420 180" fill="none" stroke="#451a03" strokeWidth="7" strokeLinecap="round"/>

          {/* Carrot nose */}
          <g>
            <path d="M 395 240 Q 400 220, 410 240 L 490 260 Q 500 270, 480 280 L 395 270 Z"
              fill="url(#olaf-carrot)" stroke="#ea580c" strokeWidth="1.5" strokeLinejoin="round"/>
            <line x1="420" y1="248" x2="415" y2="264" stroke="#9a3412" strokeWidth="2" strokeLinecap="round"/>
            <line x1="440" y1="252" x2="435" y2="268" stroke="#9a3412" strokeWidth="2" strokeLinecap="round"/>
            <line x1="460" y1="257" x2="455" y2="273" stroke="#9a3412" strokeWidth="2" strokeLinecap="round"/>
          </g>

          {/* Mouth */}
          <g>
            <path d="M 340 310 C 340 310, 400 315, 460 310 C 470 365, 330 365, 340 310 Z" fill="#0f172a" stroke="#1e293b" strokeWidth="2"/>
            <path d="M 370 345 C 370 345, 400 325, 430 345 C 410 365, 390 365, 370 345 Z" fill="#fda4af"/>
            <path d="M 385 311 L 415 311 L 412 328 C 412 332, 388 332, 388 328 Z" fill="#ffffff"/>
          </g>
        </g>
      </svg>
    </div>
  );
}
