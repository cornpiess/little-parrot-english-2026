import type { AdventureEntityFrame } from './adventureRuntime';
import { useId } from 'react';

function EnergyCore() {
  const uid = useId().replace(/:/g, '');
  return <svg className="entity-svg entity-energy-core" viewBox="0 0 120 120" aria-label="彩虹能源核心"><defs><radialGradient id={`${uid}-energy-core-gradient`}><stop stopColor="#fff"/><stop offset=".35" stopColor="#ffe66d"/><stop offset="1" stopColor="#f43f5e" stopOpacity=".2" /></radialGradient></defs><circle cx="60" cy="60" r="43" fill={`url(#${uid}-energy-core-gradient)`} stroke="#fff" strokeWidth="3"/><path d="M67 12 36 67h24l-7 41 31-56H60Z" fill="#fff8b5" opacity=".9"/><circle cx="60" cy="60" r="52" fill="none" stroke="#8de5ff" strokeDasharray="5 7" strokeWidth="2" /></svg>;
}

function Magnet() {
  return <svg className="entity-svg entity-magnet" viewBox="0 0 140 110" aria-label="磁铁"><path d="M25 18v39a45 45 0 0 0 90 0V18H88v39a18 18 0 0 1-36 0V18Z" fill="#e8eef8" stroke="#172033" strokeWidth="5"/><path d="M25 18h27v25H25Zm63 0h27v25H88Z" fill="#ef476f" stroke="#172033" strokeWidth="4"/><path d="M40 88q30 16 60 0" fill="none" stroke="#ffd166" strokeWidth="4" strokeDasharray="5 6" /></svg>;
}

function GravityBox() {
  return <svg className="entity-svg entity-gravity-box" viewBox="0 0 150 130" aria-label="重力盒"><path d="m18 38 57-25 57 25-57 27Z" fill="#a7f3d0" stroke="#103b43" strokeWidth="5"/><path d="M18 38v57l57 27V65Zm114 0v57l-57 27V65Z" fill="#4ade80" stroke="#103b43" strokeWidth="5"/><circle cx="75" cy="57" r="14" fill="#fff" stroke="#103b43" strokeWidth="4"/><path d="M75 47v20m-10-10h20" stroke="#103b43" strokeWidth="4" strokeLinecap="round" /></svg>;
}

function Football() {
  return <svg className="entity-svg entity-football" viewBox="0 0 120 120" aria-label="足球"><circle cx="60" cy="60" r="48" fill="#f8fafc" stroke="#172033" strokeWidth="5"/><path d="m60 29 18 13-7 22H49l-7-22Z" fill="#172033"/><path d="m49 64-18 14m46-14 18 14M42 42 27 31m51 11 15-11M60 29V14" fill="none" stroke="#172033" strokeWidth="5" strokeLinecap="round"/></svg>;
}

function Apple() {
  return <svg className="entity-svg entity-apple" viewBox="0 0 120 120" aria-label="苹果"><path d="M60 39c-13-18-40-7-40 21 0 29 20 48 40 48s40-19 40-48c0-28-27-39-40-21Z" fill="#ef476f" stroke="#7f1d1d" strokeWidth="4"/><path d="M60 38c-2-16 6-24 19-28" fill="none" stroke="#713f12" strokeWidth="6" strokeLinecap="round"/><path d="M66 18q20-14 31 1-17 10-31-1Z" fill="#63e6be" stroke="#14532d" strokeWidth="3"/></svg>;
}

function Fish() {
  return <svg className="entity-svg entity-fish" viewBox="0 0 150 90" aria-label="小鱼"><path d="M22 45Q58 8 105 35L132 18v54l-27-17Q58 82 22 45Z" fill="#63d8e8" stroke="#0b5268" strokeWidth="4"/><circle cx="91" cy="38" r="5" fill="#062c43"/><path d="M57 28q18 17 0 34M76 24q18 21 0 42" fill="none" stroke="#d8fbff" strokeWidth="4" opacity=".8"/></svg>;
}

function Egg() {
  return <svg className="entity-svg entity-egg" viewBox="0 0 120 140" aria-label="恐龙蛋"><path d="M60 10C30 12 16 57 21 91c5 31 22 42 39 42s34-11 39-42C104 57 90 12 60 10Z" fill="#c4b5fd" stroke="#4c1d95" strokeWidth="4"/><path d="M42 67q18-18 36 0t0 35q-18 15-36 0t0-35Z" fill="#fde68a" opacity=".8"/><circle cx="46" cy="43" r="5" fill="#fff" opacity=".8"/></svg>;
}

function Dinosaur() {
  return <svg className="entity-svg entity-dinosaur" viewBox="0 0 180 130" aria-label="恐龙"><path d="M18 103q8-54 58-58 19-32 57-18l30 20-16 20-27-7q-14 27-36 39l-8 19H57l-4-16-20 12Z" fill="#8ad17b" stroke="#1c553b" strokeWidth="5"/><circle cx="126" cy="39" r="5" fill="#173b32"/><path d="M54 58 36 32m26 30L53 26m33 33L82 33" stroke="#4f9f62" strokeWidth="8" strokeLinecap="round"/></svg>;
}

function Star() {
  return <svg className="entity-svg entity-star" viewBox="0 0 120 120" aria-label="星星"><path d="m60 8 14 34 38 3-29 24 9 37-32-20-32 20 9-37L8 45l38-3Z" fill="#ffe66d" stroke="#a66a1f" strokeWidth="4"/></svg>;
}

function Satellite() {
  return <svg className="entity-svg entity-satellite" viewBox="0 0 160 120" aria-label="星光灯塔"><path d="M54 60h52v34H54Z" fill="#dbeafe" stroke="#1e3a8a" strokeWidth="4"/><path d="M67 60V36h26v24M80 36V16" fill="none" stroke="#8de5ff" strokeWidth="5"/><path d="M54 68 16 45v31l38 6Zm52 0 38-23v31l-38 6Z" fill="#a78bfa" stroke="#312e81" strokeWidth="4"/><circle cx="80" cy="77" r="8" fill="#ffe66d"/></svg>;
}

function Footprints() {
  return <svg className="entity-svg entity-footprints" viewBox="0 0 150 100" aria-label="脚印"><g fill="#ffd18a" stroke="#6b4426" strokeWidth="3"><path d="M31 77q-19-9-10-29l10-22q5-10 14-5t5 15l-3 14 10 16q8 15-6 21Z"/><path d="M104 77q-19-9-10-29l10-22q5-10 14-5t5 15l-3 14 10 16q8 15-6 21Z"/></g></svg>;
}

export default function AdventureEntityVisual({ entity }: { entity: AdventureEntityFrame }) {
  const visual = entity.visual ?? entity.concept;
  if (visual === 'energy-core') return <EnergyCore />;
  if (visual === 'magnet') return <Magnet />;
  if (visual === 'gravity-box') return <GravityBox />;
  if (visual === 'football') return <Football />;
  if (visual === 'apple') return <Apple />;
  if (visual === 'fish') return <Fish />;
  if (visual === 'egg') return <Egg />;
  if (visual === 'dinosaur') return <Dinosaur />;
  if (visual === 'star') return <Star />;
  if (visual === 'satellite') return <Satellite />;
  if (visual === 'footprints') return <Footprints />;
  return <span>{entity.emoji}</span>;
}
