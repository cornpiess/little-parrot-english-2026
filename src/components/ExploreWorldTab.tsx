import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Paintbrush, ArrowLeft, X, Check, RotateCcw, Palette, Download, ZoomIn } from 'lucide-react';
import AICharacter from './AICharacter';

interface ExploreWorldTabProps {
  onSecondaryPageChange: (isOpen: boolean) => void;
  showBackButton?: boolean;
  onBack?: () => void;
  drawingOnly?: boolean;
}

interface WordCard {
  id: string;
  word: string;
  emoji: string;
  meaning: string;
}

interface Drawing {
  id: string;
  title: string;
  emoji: string;
  description: string;
  color: string;
}

const sampleWordCards: WordCard[] = [
  { id: '1', word: 'Flower', emoji: '🌸', meaning: 'A beautiful plant that blooms with colorful petals. 花朵是植物开出的美丽花瓣。' },
  { id: '2', word: 'Dog', emoji: '🐶', meaning: 'A loyal animal and best friend of humans. 狗是人类最忠诚的朋友。' },
  { id: '3', word: 'Rainbow', emoji: '🌈', meaning: 'A colorful arc in the sky after rain. 雨后天空中出现的七彩弧线。' },
  { id: '4', word: 'Star', emoji: '⭐', meaning: 'A bright point of light in the night sky. 夜空中闪闪发光的光点。' },
  { id: '5', word: 'Apple', emoji: '🍎', meaning: 'A round fruit that can be red, green or yellow. 一种圆形水果，可以是红色、绿色或黄色。' },
];

const sampleDrawings: Drawing[] = [
  { id: '1', title: '我的花园', emoji: '🌷', description: 'A beautiful garden with colorful flowers, green grass and a bright sunshine.', color: '#FF6B6B' },
  { id: '2', title: '快乐的猫', emoji: '🐱', description: 'A happy cat playing with a ball of yarn under a warm window.', color: '#FFD93D' },
  { id: '3', title: '星空', emoji: '🌙', description: 'A peaceful night sky full of twinkling stars and a crescent moon.', color: '#4D96FF' },
];

const coloringTemplates = [
  { id: 'banana', name: '香蕉', emoji: '🍌', paths: [
    'M4 16C6 6 18 6 20 16', // upper curve
    'M4 16C6 10 18 10 20 16', // lower curve
    'M20 16c1-1 2-2 1.5-3', // stem
    'M4 16c-1 1-1.5 2-1 3', // tip
  ]},
  { id: 'elephant', name: '大象', emoji: '🐘', paths: [
    'M7 13a5 5 0 0110 0 5 5 0 01-10 0z', // body
    'M5 10a3.5 3.5 0 110-7 3.5 3.5 0 010 7z', // head
    'M2.5 9C1 11 1.5 14 2.5 16', // trunk
    'M3 7a2 3 0 01-2.5 0.5 2 3 0 012.5-0.5z', // ear
    'M8 17v4M10 17v4', // front legs
    'M14 17v4M16 17v4', // back legs
    'M17 12c1-1 2-0.5 1.8 0.5', // tail
    'M4.2 7.5a0.5 0.5 0 100 1 0.5 0.5 0 000-1z', // eye
  ]},
  { id: 'butterfly', name: '蝴蝶', emoji: '🦋', paths: [
    'M12 7c-2.5-4-8-4.5-9-1s1 7 4 9l5 3', // left wing
    'M12 7c2.5-4 8-4.5 9-1s-1 7-4 9l-5 3', // right wing
    'M12 7v11', // body
    'M10 5c-1-2 0-3 2-3s3 1 2 3', // left antenna
    'M14 5c1-2 0-3-2-3s-3 1-2 3', // right antenna
    'M6 9a1 1 0 100 2 1 1 0 000-2z', // left wing dot
    'M18 9a1 1 0 100 2 1 1 0 000-2z', // right wing dot
  ]},
];

const paletteColors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#9B59B6', '#FF8C42', '#2EC4B6', '#FF69B4'];
const brushSizes = [4, 8, 14, 22];

export default function ExploreWorldTab({ onSecondaryPageChange, showBackButton, onBack, drawingOnly }: ExploreWorldTabProps) {
  const [mode, setMode] = useState<'main' | 'camera' | 'drawing'>(drawingOnly ? 'drawing' : 'main');
  const [cameraStep, setCameraStep] = useState<'capture' | 'preview' | 'card'>('capture');
  const [capturedObject, setCapturedObject] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof coloringTemplates[0] | null>(null);
  const [selectedColor, setSelectedColor] = useState(paletteColors[0]);
  const [brushSize, setBrushSize] = useState(brushSizes[1]);
  const [drawingStep, setDrawingStep] = useState<'select' | 'canvas' | 'result'>('select');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  const [selectedWordCard, setSelectedWordCard] = useState<WordCard | null>(null);
  const [selectedDrawing, setSelectedDrawing] = useState<Drawing | null>(null);

  useEffect(() => {
    if (drawingStep === 'canvas' && selectedTemplate && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, rect.width, rect.height);
      const size = Math.min(rect.width, rect.height) * 0.6;
      const offsetX = (rect.width - size) / 2;
      const offsetY = (rect.height - size) / 2;
      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(size / 24, size / 24);
      selectedTemplate.paths.forEach((p) => {
        const path2d = new Path2D(p);
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 24 / size * 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke(path2d);
      });
      ctx.restore();
    }
  }, [drawingStep, selectedTemplate]);

  const getCanvasPos = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  }, []);

  const startDraw = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    lastPosRef.current = getCanvasPos(e);
  }, [getCanvasPos]);

  const draw = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const pos = getCanvasPos(e);
    if (!ctx || !pos || !lastPosRef.current) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    ctx.scale(1 / dpr, 1 / dpr);
    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x * dpr, lastPosRef.current.y * dpr);
    ctx.lineTo(pos.x * dpr, pos.y * dpr);
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = brushSize * dpr;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.restore();
    lastPosRef.current = pos;
  }, [isDrawing, selectedColor, brushSize, getCanvasPos]);

  const endDraw = useCallback(() => {
    setIsDrawing(false);
    lastPosRef.current = null;
  }, []);

  const goBack = () => {
    if (mode === 'camera') {
      if (cameraStep !== 'capture') { setCameraStep('capture'); setCapturedObject(null); } else { setMode('main'); onSecondaryPageChange(false); }
    } else if (mode === 'drawing') {
      if (drawingStep === 'result') setDrawingStep('canvas');
      else if (drawingStep === 'canvas') { setDrawingStep('select'); setSelectedTemplate(null); }
      else if (drawingOnly) { onBack?.(); }
      else { setMode('main'); onSecondaryPageChange(false); }
    } else {
      onBack?.();
    }
  };

  const handleCapture = () => {
    const objects = [
      { word: 'Apple', emoji: '🍎', meaning: 'A round fruit that is red, green or yellow. 苹果是一种圆形水果。' },
      { word: 'Book', emoji: '📚', meaning: 'Pages bound together for reading. 书本是装订在一起用于阅读的纸页。' },
      { word: 'Cup', emoji: '☕', meaning: 'A small container for drinking. 杯子是用来喝水的小容器。' },
      { word: 'Pencil', emoji: '✏️', meaning: 'A tool for writing and drawing. 铅笔是用来写字和画画的工具。' },
      { word: 'Chair', emoji: '🪑', meaning: 'A piece of furniture for sitting. 椅子是用来坐的家具。' },
    ];
    setCapturedObject(JSON.stringify(objects[Math.floor(Math.random() * objects.length)]));
    setCameraStep('preview');
  };

  const handleSaveCard = () => {
    setCameraStep('card');
    setTimeout(() => { setCameraStep('capture'); setCapturedObject(null); }, 2000);
  };

  // If drawingOnly, skip main view and go straight to drawing
  const showMain = !drawingOnly;

  return (
    <div className="px-4 py-6 space-y-5">
      <AnimatePresence mode="wait">
        {mode === 'main' && showMain && (
          <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
            {/* Only drawing mode card - no camera */}
            <div className="grid grid-cols-1 gap-4">
              <motion.button whileTap={{ scale: 0.95 }}
                onClick={() => { setMode('drawing'); onSecondaryPageChange(true); setDrawingStep('select'); }}
                className="rounded-3xl p-5 text-center space-y-3 glass"
                style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(168, 85, 247, 0.04))' }}>
                <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-500/15 flex items-center justify-center">
                  <Paintbrush className="w-7 h-7 text-purple-500" />
                </div>
                <p className="font-bold text-sm text-foreground">创意画画</p>
                <p className="text-[11px] text-muted-foreground">画一画，说英语</p>
              </motion.button>
            </div>

            {/* Recent Works */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-foreground">最近作品</h3>

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">📸 单词卡片</p>
                <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                  {sampleWordCards.map((card) => (
                    <motion.div key={card.id} whileTap={{ scale: 0.95 }} onClick={() => setSelectedWordCard(card)}
                      className="min-w-[72px] w-[72px] rounded-2xl p-2.5 flex flex-col items-center gap-1.5 cursor-pointer glass flex-shrink-0"
                      style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(59,130,246,0.12)' }}>
                      <span className="text-2xl">{card.emoji}</span>
                      <span className="text-[11px] font-bold text-foreground">{card.word}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">🎨 画作</p>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {sampleDrawings.map((drawing) => (
                    <motion.div key={drawing.id} whileTap={{ scale: 0.95 }} onClick={() => setSelectedDrawing(drawing)}
                      className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer glass"
                      style={{ background: `linear-gradient(135deg, ${drawing.color}18, ${drawing.color}08)`, border: `1px solid ${drawing.color}25` }}>
                      <span className="text-3xl">{drawing.emoji}</span>
                      <span className="text-[11px] font-bold text-foreground">{drawing.title}</span>
                    </motion.div>
                  ))}
                  <motion.div whileTap={{ scale: 0.95 }}
                    onClick={() => { setMode('drawing'); onSecondaryPageChange(true); setDrawingStep('select'); }}
                    className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 border-2 border-dashed border-border cursor-pointer">
                    <span className="text-2xl text-muted-foreground">+</span>
                    <span className="text-[10px] text-muted-foreground">新画作</span>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Camera Mode - only available in non-drawingOnly */}
        {mode === 'camera' && !drawingOnly && (
          <motion.div key="camera" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {cameraStep === 'capture' && (
              <div className="space-y-4">
                <div className="aspect-[3/4] rounded-3xl overflow-hidden flex items-center justify-center relative"
                  style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', border: '2px solid rgba(255,255,255,0.1)' }}>
                  <div className="absolute inset-4 border-2 border-white/20 rounded-2xl" />
                  <div className="text-center space-y-3">
                    <Camera className="w-12 h-12 text-white/40 mx-auto" />
                    <p className="text-white/50 text-sm">对准物体拍照</p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <motion.button whileTap={{ scale: 0.9 }} onClick={handleCapture}
                    className="w-16 h-16 rounded-full bg-white flex items-center justify-center"
                    style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
                    <div className="w-13 h-13 rounded-full border-4 border-blue-400" />
                  </motion.button>
                </div>
              </div>
            )}

            {cameraStep === 'preview' && capturedObject && (() => {
              const obj = JSON.parse(capturedObject);
              return (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-4">
                  <div className="rounded-3xl p-6 text-center space-y-4 glass" style={{ background: 'rgba(255,255,255,0.8)' }}>
                    <p className="text-sm text-muted-foreground">AI 识别结果</p>
                    <div className="text-6xl">{obj.emoji}</div>
                    <h3 className="text-3xl font-bold text-foreground">{obj.word}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{obj.meaning}</p>
                  </div>
                  <div className="flex gap-3">
                    <motion.button whileTap={{ scale: 0.95 }}
                      onClick={() => { setCameraStep('capture'); setCapturedObject(null); }}
                      className="flex-1 py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 glass">
                      <RotateCcw className="w-4 h-4" /> 重拍
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={handleSaveCard}
                      className="flex-1 py-3 rounded-2xl font-semibold text-white text-sm flex items-center justify-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)' }}>
                      <Check className="w-4 h-4" /> 保存卡片
                    </motion.button>
                  </div>
                </motion.div>
              );
            })()}

            {cameraStep === 'card' && capturedObject && (() => {
              const obj = JSON.parse(capturedObject);
              return (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-3">
                  <div className="text-5xl">✅</div>
                  <h3 className="text-xl font-bold text-foreground">已保存到单词卡片！</h3>
                  <div className="mx-auto w-32 aspect-[3/4] rounded-2xl flex flex-col items-center justify-center gap-2 glass"
                    style={{ border: '2px solid rgba(59, 130, 246, 0.3)', boxShadow: '0 8px 30px rgba(59, 130, 246, 0.15)' }}>
                    <span className="text-4xl">{obj.emoji}</span>
                    <span className="text-lg font-bold text-foreground">{obj.word}</span>
                  </div>
                </motion.div>
              );
            })()}
          </motion.div>
        )}

        {/* Drawing Mode */}
        {mode === 'drawing' && (
          <motion.div key="drawing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {drawingStep === 'select' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">选择一个简笔画开始创作</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {coloringTemplates.map((tmpl) => (
                    <motion.button key={tmpl.id} whileTap={{ scale: 0.95 }}
                      onClick={() => { setSelectedTemplate(tmpl); setDrawingStep('canvas'); }}
                      className="aspect-square rounded-3xl flex flex-col items-center justify-center gap-3 glass cursor-pointer">
                      <svg viewBox="0 0 24 24" className="w-16 h-16" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        {tmpl.paths.map((p, i) => <path key={i} d={p} />)}
                      </svg>
                      <span className="text-sm font-medium text-muted-foreground">{tmpl.emoji} {tmpl.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {drawingStep === 'canvas' && selectedTemplate && (
              <div className="space-y-3">
                <div className="rounded-3xl overflow-hidden glass" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                  <canvas
                    ref={canvasRef}
                    className="w-full aspect-square touch-none cursor-crosshair"
                    style={{ display: 'block' }}
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={endDraw}
                    onMouseLeave={endDraw}
                    onTouchStart={startDraw}
                    onTouchMove={draw}
                    onTouchEnd={endDraw}
                  />
                </div>

                <div className="flex items-center gap-2 justify-center">
                  {brushSizes.map((size) => (
                    <button key={size} onClick={() => setBrushSize(size)}
                      className={`rounded-full transition-all ${brushSize === size ? 'ring-2 ring-offset-2 ring-purple-400' : ''}`}
                      style={{ width: size + 16, height: size + 16, background: selectedColor }} />
                  ))}
                </div>

                <div className="rounded-2xl p-3 glass">
                  <div className="flex items-center gap-2 mb-2">
                    <Palette className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-medium">选择颜色</span>
                  </div>
                  <div className="flex gap-2 justify-center">
                    {paletteColors.map((color) => (
                      <button key={color} onClick={() => setSelectedColor(color)}
                        className="w-8 h-8 rounded-full transition-all"
                        style={{
                          background: color,
                          border: selectedColor === color ? '3px solid white' : '2px solid transparent',
                          boxShadow: selectedColor === color ? `0 0 0 2px ${color}, 0 2px 8px ${color}40` : 'none',
                          transform: selectedColor === color ? 'scale(1.15)' : 'scale(1)',
                        }} />
                    ))}
                  </div>
                </div>

                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setDrawingStep('result')}
                  className="w-full py-3.5 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)', boxShadow: '0 8px 24px rgba(168, 85, 247, 0.3)' }}>
                  ✨ AI 生成精美画作
                </motion.button>
              </div>
            )}

            {drawingStep === 'result' && selectedTemplate && (() => {
              const artworkDescriptions: Record<string, string> = {
                fish: 'A cute little fish swimming happily in the blue ocean! 🐟',
                house: 'A cozy little house with a warm chimney and garden! 🏠',
                butterfly: 'A colorful butterfly dancing in the spring breeze! 🦋',
              };
              const desc = artworkDescriptions[selectedTemplate.id] || `A beautiful ${selectedTemplate.name} artwork!`;
              return (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-4">
                  {/* Artwork display */}
                  <div className="rounded-3xl overflow-hidden relative aspect-square"
                    style={{ background: `linear-gradient(145deg, ${selectedColor}15, #FFF8F0, ${selectedColor}08)`, border: `2px solid ${selectedColor}20`, boxShadow: `0 12px 40px ${selectedColor}15` }}>
                    <div className="w-full h-full flex flex-col items-center justify-center p-6">
                      <motion.svg viewBox="0 0 24 24" className="w-3/5 h-3/5"
                        fill={selectedColor} stroke={selectedColor} strokeWidth="0.3"
                        initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', damping: 12, delay: 0.2 }}>
                        {selectedTemplate.paths.map((p, i) => <path key={i} d={p} />)}
                      </motion.svg>
                      <motion.p className="text-lg font-extrabold mt-3" style={{ color: selectedColor }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                        {selectedTemplate.emoji} {selectedTemplate.name}
                      </motion.p>
                    </div>
                  </div>

                  {/* Parrot describes the artwork */}
                  <motion.div className="flex items-center gap-3"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <AICharacter state="speaking" size={0.3} />
                    <div className="flex-1 glass rounded-2xl rounded-tl-sm px-3 py-2.5"
                      style={{ background: 'rgba(255,255,255,0.8)' }}>
                      <p className="text-xs font-medium text-foreground leading-relaxed">{desc}</p>
                    </div>
                  </motion.div>

                  {/* Action buttons with icons for kids */}
                  <div className="flex gap-3">
                    <motion.button whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        // Pick a different template
                        const others = coloringTemplates.filter(t => t.id !== selectedTemplate.id);
                        const next = others[Math.floor(Math.random() * others.length)];
                        setSelectedTemplate(next);
                        setDrawingStep('canvas');
                      }}
                      className="flex-1 py-4 rounded-2xl font-bold text-sm flex flex-col items-center justify-center gap-1.5 glass"
                      style={{ background: 'rgba(255,255,255,0.7)' }}>
                      <span className="text-2xl">🎨</span>
                      <span>继续画画</span>
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (drawingOnly) { onBack?.(); }
                        else { setMode('main'); setDrawingStep('select'); setSelectedTemplate(null); onSecondaryPageChange(false); }
                      }}
                      className="flex-1 py-4 rounded-2xl font-bold text-white text-sm flex flex-col items-center justify-center gap-1.5"
                      style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)', boxShadow: '0 6px 20px rgba(168,85,247,0.3)' }}>
                      <span className="text-2xl">✅</span>
                      <span>画好啦</span>
                    </motion.button>
                  </div>
                </motion.div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Word Card Modal */}
      <AnimatePresence>
        {selectedWordCard && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedWordCard(null)}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 30 }}
              className="relative rounded-3xl p-8 text-center space-y-4 max-w-xs w-full glass"
              style={{ background: 'rgba(255,255,255,0.92)' }}
              onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setSelectedWordCard(null)} className="absolute top-4 right-4">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
              <span className="text-6xl block">{selectedWordCard.emoji}</span>
              <h3 className="text-3xl font-bold text-foreground">{selectedWordCard.word}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{selectedWordCard.meaning}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drawing Detail Modal */}
      <AnimatePresence>
        {selectedDrawing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedDrawing(null)}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 30 }}
              className="relative rounded-3xl p-8 text-center space-y-4 max-w-xs w-full glass"
              style={{ background: 'rgba(255,255,255,0.92)' }}
              onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setSelectedDrawing(null)} className="absolute top-4 right-4">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
              <span className="text-6xl block">{selectedDrawing.emoji}</span>
              <h3 className="text-2xl font-bold text-foreground">{selectedDrawing.title}</h3>
              <div className="rounded-2xl p-4" style={{ background: `${selectedDrawing.color}10`, border: `1px solid ${selectedDrawing.color}20` }}>
                <p className="text-xs font-semibold text-muted-foreground mb-1">English Description</p>
                <p className="text-sm text-foreground leading-relaxed italic">{selectedDrawing.description}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
