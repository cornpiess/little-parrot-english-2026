import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Mic, MicOff, Volume2, BookOpen, Brain, Pause } from 'lucide-react';

interface QARecord {
  id: string;
  teacherId: string;
  question: string;
  answer: string;
  answerImage?: string;
  timestamp: number;
}

const TEACHERS: Record<string, {
  name: string; color: string; icon: string; avatar: string;
  greeting: string;
  questions: { q: string; a: string; img: string }[];
}> = {
  einstein: {
    name: '爱因斯坦α', color: '#58CC02', icon: '🔬', avatar: '🧑‍🔬',
    greeting: '小朋友你好呀！我是爱因斯坦爷爷，你想知道什么秘密呢？',
    questions: [
      { q: '天空为什么是蓝色的？', a: '阳光里有好多好多颜色混在一起。蓝色的光特别调皮，它最喜欢到处乱跑，撞到空气里的小颗粒就散开啦！所以我们抬头看，满天都是蓝蓝的光在跳舞呢！', img: 'https://picsum.photos/seed/sky/400/300' },
      { q: '恐龙为什么不见了？', a: '很久很久以前，一颗超级大的陨石砰地撞到了地球上！扬起的灰尘遮住了太阳，天气变得好冷好冷，恐龙找不到吃的，就慢慢消失了。但是有些小恐龙活了下来，变成了现在的鸟类哦！', img: 'https://picsum.photos/seed/dino/400/300' },
      { q: '月亮为什么会亮？', a: '月亮自己并不会发光哦！它是反射了太阳的光。就像你拿一面镜子对着太阳，镜子会亮起来一样。月亮就是地球旁边的一面大镜子呢！', img: 'https://picsum.photos/seed/moon/400/300' },
      { q: '地球为什么是圆的？', a: '地球超级超级大！所有的东西都有一个叫引力的力量，它把所有东西都往中间拉。拉呀拉呀，最后就变成了圆圆的球形。就像你揉面团，揉着揉着就变成圆球啦！', img: 'https://picsum.photos/seed/earth/400/300' },
    ],
  },
  beethoven: {
    name: '贝多芬β', color: '#1CB0F6', icon: '🎵', avatar: '🎹',
    greeting: '嗨！我是音乐家贝多芬，你想听听音乐的秘密吗？',
    questions: [
      { q: '音乐是怎么来的？', a: '声音是物体振动产生的！你说话的时候，嗓子在振动；弹吉他的时候，琴弦在振动；敲鼓的时候，鼓面在振动。振动让空气也跟着动起来，传到耳朵里就是声音啦！', img: 'https://picsum.photos/seed/music/400/300' },
      { q: '钢琴有多少个键？', a: '标准的钢琴有88个键！其中52个白键，36个黑键。白键就像白天，黑键就像夜晚，它们一起合作，就能弹出世界上最美的音乐！', img: 'https://picsum.photos/seed/piano/400/300' },
      { q: '为什么有的歌好听？', a: '好听的歌通常有和谐的音符组合，就像好朋友在一起很开心。不和谐的音就像吵架，听起来就不舒服。但是有时候，作曲家会故意用一点点吵架的音，让音乐更有感情哦！', img: 'https://picsum.photos/seed/sing/400/300' },
    ],
  },
  deer: {
    name: '小鹿姐姐', color: '#FF6B9D', icon: '🦌', avatar: '🦌',
    greeting: '宝贝你好呀！我是小鹿姐姐，你有什么想问的吗？',
    questions: [
      { q: '为什么要分享？', a: '分享就像种下一棵小种子，它会开出快乐的花！当你把玩具分享给小朋友，他也开心，你也开心，两个人的快乐比一个人多多了。而且分享会让你交到更多好朋友哦！', img: 'https://picsum.photos/seed/share/400/300' },
      { q: '害怕的时候怎么办？', a: '每个人都会害怕，这很正常！害怕的时候，可以先做三次深呼吸，吸呼吸呼。然后告诉自己我很勇敢。也可以找爸爸妈妈或者好朋友抱一抱，有他们在就不用怕啦！', img: 'https://picsum.photos/seed/brave/400/300' },
      { q: '怎么交到新朋友？', a: '交朋友的秘诀就是：微笑，然后说你好！你还可以问我们可以一起玩吗？小朋友都喜欢友善的伙伴。记住，每个人都是独一无二的，你身上的闪光点一定会吸引到好朋友！', img: 'https://picsum.photos/seed/friend/400/300' },
    ],
  },
};

const STORAGE_KEY = 'why_qa_knowledge_base';

function loadKB(): QARecord[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function saveKB(records: QARecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

/* ===== Speech helpers ===== */
function speak(text: string, lang = 'zh-CN'): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) { resolve(); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.85;
    u.pitch = 1.1;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

function startRecognition(lang = 'zh-CN'): Promise<string> {
  return new Promise((resolve, reject) => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { reject(new Error('no speech recognition')); return; }
    const r = new SR();
    r.lang = lang;
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onresult = (e: any) => resolve(e.results[0][0].transcript);
    r.onerror = (e: any) => reject(e);
    r.onend = () => {};
    r.start();
  });
}

export default function WhyPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const teacherId = params.get('teacher') || 'einstein';
  const teacher = TEACHERS[teacherId] || TEACHERS.einstein;

  const [kb, setKb] = useState<QARecord[]>(loadKB);
  const [phase, setPhase] = useState<'greeting' | 'picking' | 'listening' | 'answering' | 'done'>('greeting');
  const [currentQA, setCurrentQA] = useState<{ q: string; a: string; img: string } | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showKB, setShowKB] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(false);
  const greetingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { saveKB(kb); }, [kb]);

  // Greeting on mount — teacher introduces itself with voice
  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsSpeaking(true);
      setMouthOpen(true);
      await speak(teacher.greeting);
      setMouthOpen(false);
      setIsSpeaking(false);
      setPhase('picking');
    }, 600);
    return () => { clearTimeout(timer); window.speechSynthesis?.cancel(); };
  }, [teacherId]);

  // Mouth animation while speaking
  useEffect(() => {
    if (!isSpeaking) { setMouthOpen(false); return; }
    const interval = setInterval(() => setMouthOpen(v => !v), 300);
    return () => clearInterval(interval);
  }, [isSpeaking]);

  const handleQuestionPick = useCallback(async (item: { q: string; a: string; img: string }) => {
    setCurrentQA(item);
    setPhase('answering');
    setIsSpeaking(true);
    setMouthOpen(true);
    // Save to KB
    setKb(prev => [{ id: Date.now().toString(), teacherId, question: item.q, answer: item.a, answerImage: item.img, timestamp: Date.now() }, ...prev]);
    await speak(item.a);
    setMouthOpen(false);
    setIsSpeaking(false);
    setPhase('done');
  }, [teacherId]);

  const handleVoiceAsk = useCallback(async () => {
    if (isListening) return;
    setIsListening(true);
    setPhase('listening');
    try {
      const transcript = await startRecognition();
      setIsListening(false);
      // Find matching question
      const matched = teacher.questions.find(item =>
        item.q.includes(transcript.slice(0, 4)) || transcript.includes(item.q.slice(0, 4))
      );
      if (matched) {
        handleQuestionPick(matched);
      } else {
        // No match — teacher responds generically
        const genericAnswer = `嗯，这是个好问题！"${transcript}"让我想想……小朋友真聪明！这个问题需要我们一起去探索答案哦。`;
        setCurrentQA({ q: transcript, a: genericAnswer, img: teacher.questions[0].img });
        setPhase('answering');
        setIsSpeaking(true);
        setMouthOpen(true);
        setKb(prev => [{ id: Date.now().toString(), teacherId, question: transcript, answer: genericAnswer, answerImage: teacher.questions[0].img, timestamp: Date.now() }, ...prev]);
        await speak(genericAnswer);
        setMouthOpen(false);
        setIsSpeaking(false);
        setPhase('done');
      }
    } catch {
      setIsListening(false);
      setPhase('picking');
    }
  }, [isListening, teacher, teacherId, handleQuestionPick]);

  const handleNext = () => {
    setCurrentQA(null);
    setPhase('picking');
  };

  const handleStopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setMouthOpen(false);
  };

  const teacherKB = kb.filter(r => r.teacherId === teacherId);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0a12', color: '#fff', overflow: 'hidden', position: 'relative' }}>

      {/* Background glow */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse 80% 50% at 50% 30%, ${teacher.color}15 0%, transparent 70%)` }} />

      {/* Header */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12, padding: '48px 20px 8px', zIndex: 10, position: 'relative' }}>
        <motion.button whileTap={{ scale: 0.85 }} onClick={() => navigate('/home-v3')}
          style={{ width: 40, height: 40, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer' }}>
          <ChevronLeft style={{ width: 20, height: 20, color: '#fff' }} />
        </motion.button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 17, fontWeight: 800, color: '#fff', margin: 0 }}>{teacher.icon} 十万个为什么</h1>
        </div>
        <motion.button whileTap={{ scale: 0.85 }} onClick={() => setShowKB(!showKB)}
          style={{ height: 36, padding: '0 12px', borderRadius: 18, display: 'flex', alignItems: 'center', gap: 6, background: showKB ? `${teacher.color}30` : 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer' }}>
          <BookOpen style={{ width: 16, height: 16, color: showKB ? teacher.color : 'rgba(255,255,255,0.6)' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: showKB ? teacher.color : 'rgba(255,255,255,0.6)' }}>
            知识库 {teacherKB.length > 0 ? `(${teacherKB.length})` : ''}
          </span>
        </motion.button>
      </motion.div>

      {/* Main area */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 10 }}>
        <AnimatePresence mode="wait">
          {showKB ? (
            /* ===== Knowledge Base ===== */
            <motion.div key="kb" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }} style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 20px' }}>
              {teacherKB.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Brain style={{ width: 48, height: 48, color: `${teacher.color}60`, marginBottom: 16 }} />
                  <p style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>还没有知识</p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>问一些问题吧，答案会保存在这里</p>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 700, marginBottom: 12 }}>共 {teacherKB.length} 条知识</p>
                  {teacherKB.map((r) => (
                    <div key={r.id} style={{ borderRadius: 16, padding: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', marginBottom: 12 }}>
                      {r.answerImage && (
                        <div style={{ borderRadius: 12, overflow: 'hidden', height: 120, marginBottom: 10 }}>
                          <img src={r.answerImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                        </div>
                      )}
                      <p style={{ fontSize: 15, fontWeight: 700, color: teacher.color, margin: 0, marginBottom: 6 }}>{r.question}</p>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, margin: 0 }}>{r.answer}</p>
                      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 8 }}>
                        {new Date(r.timestamp).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            /* ===== Main Q&A Flow ===== */
            <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              exit={{ opacity: 0 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

              {/* Teacher avatar area */}
              <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
                <motion.div animate={{ scale: isSpeaking ? [1, 1.05, 1] : 1 }}
                  transition={{ duration: 0.8, repeat: isSpeaking ? Infinity : 0 }}
                  style={{ width: 80, height: 80, borderRadius: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `linear-gradient(135deg, ${teacher.color}30, ${teacher.color}10)`,
                    border: `3px solid ${isSpeaking ? teacher.color : 'rgba(255,255,255,0.15)'}`,
                    boxShadow: isSpeaking ? `0 0 30px ${teacher.color}30` : 'none',
                    fontSize: 36, transition: 'border-color 0.3s, box-shadow 0.3s' }}>
                  {teacher.avatar}
                </motion.div>
                {/* Mouth indicator */}
                <div style={{ width: 12, height: 12, borderRadius: 6, marginTop: -6, position: 'relative', zIndex: 5,
                  background: mouthOpen ? teacher.color : 'rgba(255,255,255,0.15)',
                  transition: 'background 0.15s' }} />
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                  {phase === 'greeting' && '正在说话...'}
                  {phase === 'picking' && '选一个问题问问吧'}
                  {phase === 'listening' && '我在听你说...'}
                  {phase === 'answering' && '正在回答...'}
                  {phase === 'done' && '说完啦！再选一个吧'}
                </p>
              </div>

              {/* Content area */}
              <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 16px' }}>
                <AnimatePresence mode="wait">
                  {phase === 'picking' || phase === 'greeting' ? (
                    /* ===== Question Cards — big, visual, tappable ===== */
                    <motion.div key="pick" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, paddingBottom: 100 }}>
                      {teacher.questions.map((item, i) => (
                        <motion.button key={i}
                          whileTap={{ scale: 0.93 }}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08 }}
                          onClick={() => handleQuestionPick(item)}
                          style={{ borderRadius: 20, overflow: 'hidden', border: 'none', cursor: 'pointer', padding: 0, background: 'none', textAlign: 'left' }}>
                          <div style={{ position: 'relative', width: '100%', paddingBottom: '110%' }}>
                            <img src={item.img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: 20 }} loading="lazy" />
                            <div style={{ position: 'absolute', inset: 0, borderRadius: 20,
                              background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.75) 100%)' }} />
                            <p style={{ position: 'absolute', bottom: 12, left: 12, right: 12, fontSize: 14, fontWeight: 700, color: '#fff', margin: 0,
                              textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                              {item.q}
                            </p>
                          </div>
                        </motion.button>
                      ))}
                    </motion.div>
                  ) : phase === 'listening' ? (
                    /* ===== Listening state ===== */
                    <motion.div key="listen" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', paddingBottom: 100 }}>
                      <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        style={{ width: 100, height: 100, borderRadius: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: `${teacher.color}20`, border: `3px solid ${teacher.color}` }}>
                        <Mic style={{ width: 40, height: 40, color: teacher.color }} />
                      </motion.div>
                      <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginTop: 20 }}>听你说...</p>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>大声说出你的问题吧！</p>
                    </motion.div>
                  ) : phase === 'answering' || phase === 'done' ? (
                    /* ===== Answer card — image + text, read aloud ===== */
                    <motion.div key="answer" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -30 }}
                      style={{ paddingBottom: 100 }}>
                      {currentQA && (
                        <div style={{ borderRadius: 20, overflow: 'hidden', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                          {currentQA.img && (
                            <div style={{ width: '100%', height: 180, overflow: 'hidden' }}>
                              <img src={currentQA.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                            </div>
                          )}
                          <div style={{ padding: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                              <span style={{ fontSize: 20 }}>{teacher.avatar}</span>
                              <span style={{ fontSize: 13, fontWeight: 700, color: teacher.color }}>{teacher.name}</span>
                            </div>
                            <p style={{ fontSize: 16, fontWeight: 700, color: teacher.color, marginBottom: 12 }}>{currentQA.q}</p>
                            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 1.8, margin: 0 }}>{currentQA.a}</p>
                          </div>
                          {phase === 'done' && (
                            <motion.button whileTap={{ scale: 0.95 }}
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                              onClick={handleNext}
                              style={{ width: 'calc(100% - 32px)', margin: '0 16px 16px', padding: '14px 0', borderRadius: 16, fontSize: 16, fontWeight: 700,
                                background: teacher.color, color: '#fff', border: 'none', cursor: 'pointer' }}>
                              再问一个
                            </motion.button>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              {/* Bottom — mic button */}
              {phase === 'picking' && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 20px 32px',
                  background: 'linear-gradient(transparent, #0a0a12 40%)', display: 'flex', justifyContent: 'center', zIndex: 20 }}>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={handleVoiceAsk}
                    style={{ width: 72, height: 72, borderRadius: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: `linear-gradient(135deg, ${teacher.color}, ${teacher.color}CC)`,
                      boxShadow: `0 8px 32px ${teacher.color}50`, border: 'none', cursor: 'pointer' }}>
                    <Mic style={{ width: 28, height: 28, color: '#fff' }} />
                  </motion.button>
                  <p style={{ position: 'absolute', bottom: 12, fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                    按住说话
                  </p>
                </div>
              )}

              {/* Stop button while speaking */}
              {isSpeaking && (
                <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleStopSpeaking}
                  style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
                    width: 56, height: 56, borderRadius: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.2)', cursor: 'pointer', zIndex: 30 }}>
                  <Pause style={{ width: 20, height: 20, color: '#fff' }} />
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
