import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import AICharacter, { getCharacterName } from "@/components/AICharacter";

type ParrotState = 'speaking' | 'listening' | 'thinking';

interface ChatMsg {
  role: 'parrot' | 'parent';
  text: string;
}

const LANGUAGES = [
  { code: 'zh', flag: '🇨🇳', label: '中文' },
  { code: 'en', flag: '🇺🇸', label: 'English' },
  { code: 'ja', flag: '🇯🇵', label: '日本語' },
  { code: 'ko', flag: '🇰🇷', label: '한국어' },
  { code: 'es', flag: '🇪🇸', label: 'Español' },
  { code: 'fr', flag: '🇫🇷', label: 'Français' },
];

const TARGET_LANGUAGES = [
  { code: 'en', flag: '🇺🇸', label: 'English 英语', available: true },
  { code: 'ja', flag: '🇯🇵', label: '日本語 日语', available: false },
  { code: 'ko', flag: '🇰🇷', label: '한국어 韩语', available: false },
  { code: 'es', flag: '🇪🇸', label: 'Español 西班牙语', available: false },
];

const YEARS = Array.from({ length: 12 }, (_, i) => 2025 - i);

type StepKey = 'welcome' | 'nativeLang' | 'targetLang' | 'gender' | 'birthday' | 'name' | 'handoff' | 'done';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<StepKey>('welcome');
  const [parrotState, setParrotState] = useState<ParrotState>('speaking');
  const [showInput, setShowInput] = useState(false);
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [nameInput, setNameInput] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<Record<string, any>>({});
  const t1Ref = useRef<ReturnType<typeof setTimeout>>();
  const t2Ref = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const completed = localStorage.getItem('onboarding_completed');
    if (completed === 'true') {
      navigate('/home-v3', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (chatRef.current) {
      setTimeout(() => {
        chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  }, [chat, showInput]);

  useEffect(() => {
    const messages: Record<StepKey, string> = {
      welcome: `您好！我是${getCharacterName()}AI 🦜\n我将作为孩子的AI学习伙伴，先帮您做一些简单设置吧！`,
      nativeLang: '请问小朋友平时说什么语言呢？🌍',
      targetLang: '很好！那想让小朋友学习什么语言呢？🎯',
      gender: '小朋友是男宝还是女宝呀？',
      birthday: '小朋友是哪年出生的呢？🎂',
      name: '最后一步！给小朋友取一个好听的英文名吧！✨\n直接输入就好～',
      handoff: `设置完成！现在请把手机交给小朋友吧 📱\n${getCharacterName()}会先和宝贝玩个小游戏，测试一下英语基础～`,
      done: '',
    };

    if (step === 'done') return;

    setParrotState('thinking');
    setShowInput(false);

    const t1 = setTimeout(() => {
      setParrotState('speaking');
      setChat(prev => [...prev, { role: 'parrot', text: messages[step] }]);

      const t2 = setTimeout(() => {
        setShowInput(true);
        setParrotState('listening');
      }, 2000);

      t2Ref.current = t2;
    }, 1500);

    t1Ref.current = t1;

    return () => {
      clearTimeout(t1Ref.current);
      clearTimeout(t2Ref.current);
    };
  }, [step]);

  const respond = useCallback((text: string, nextStep: StepKey, newData?: Record<string, any>) => {
    setChat(prev => [...prev, { role: 'parent', text }]);
    setShowInput(false);

    if (newData) {
      setData(prev => ({ ...prev, ...newData }));
      if (newData.childName) localStorage.setItem('child_name', newData.childName);
    }

    if (nextStep === 'done') {
      setParrotState('speaking');
      setChat(prev => [...prev, { role: 'parrot', text: `太棒了！设置完成 🎉\n${getCharacterName()}准备好陪小朋友学习啦！` }]);
      setData(prev => {
        const allData = { ...prev, ...newData };
        localStorage.setItem('onboarding_completed', 'true');
        localStorage.setItem('onboarding_data', JSON.stringify(allData));
        return prev;
      });
      setTimeout(() => navigate('/home-v3', { replace: true }), 2200);
      return;
    }

    setTimeout(() => setStep(nextStep), 500);
  }, [navigate]);

  const renderInput = () => {
    switch (step) {
      case 'welcome':
        return (
          <div className="flex flex-wrap gap-2 justify-center">
            <OptionBtn label="开始设置 👋" onClick={() => respond('开始设置 👋', 'nativeLang')} />
          </div>
        );

      case 'nativeLang':
        return (
          <div className="grid grid-cols-3 gap-2">
            {LANGUAGES.map(l => (
              <OptionBtn key={l.code} label={`${l.flag} ${l.label}`}
                onClick={() => respond(`${l.flag} ${l.label}`, 'targetLang', { nativeLanguage: l.code })} />
            ))}
          </div>
        );

      case 'targetLang':
        return (
          <div className="flex flex-col gap-2">
            {TARGET_LANGUAGES.map(l => (
              <OptionBtn key={l.code} label={`${l.flag} ${l.label}${!l.available ? ' (即将上线)' : ''}`}
                disabled={!l.available}
                onClick={() => respond(`${l.flag} ${l.label}`, 'gender', { targetLanguage: l.code })} />
            ))}
          </div>
        );

      case 'gender':
        return (
          <div className="flex gap-3 justify-center">
            <OptionBtn label="👦 男宝" onClick={() => respond('👦 男宝', 'birthday', { gender: 'boy' })} wide />
            <OptionBtn label="👧 女宝" onClick={() => respond('👧 女宝', 'birthday', { gender: 'girl' })} wide />
          </div>
        );

      case 'birthday':
        return (
          <div className="grid grid-cols-4 gap-2">
            {YEARS.map(y => (
              <OptionBtn key={y} label={`${y}年`}
                onClick={() => respond(`${y}年出生`, 'name', { birthYear: y })} />
            ))}
          </div>
        );

      case 'name':
        return (
          <div className="flex gap-3">
            <input
              type="text"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && nameInput.trim() && respond(nameInput.trim(), 'handoff', { childName: nameInput.trim() })}
              placeholder="输入名字…"
              autoFocus
              className="flex-1 px-4 py-3 rounded-2xl text-sm font-medium outline-none"
              style={{
                background: 'rgba(255,255,255,0.85)',
                border: '1.5px solid hsla(199, 92%, 54%, 0.3)',
              }}
            />
            <motion.button whileTap={{ scale: 0.9 }}
              onClick={() => nameInput.trim() && respond(nameInput.trim(), 'handoff', { childName: nameInput.trim() })}
              className="px-5 py-3 rounded-2xl text-white text-sm font-bold"
              style={{
                background: 'linear-gradient(135deg, hsla(199, 92%, 54%, 0.9), hsla(199, 82%, 48%, 0.9))',
              }}>
              确定
            </motion.button>
          </div>
        );

      case 'handoff':
        return (
          <div className="flex flex-col items-center gap-3">
            <OptionBtn label="✅ 已交给小朋友了" onClick={() => {
              setData(prev => {
                const allData = { ...prev };
                localStorage.setItem('onboarding_completed', 'true');
                localStorage.setItem('onboarding_data', JSON.stringify(allData));
                return prev;
              });
              navigate('/initial-assessment', { replace: true });
            }} wide />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col relative overflow-hidden"
      style={{
        background: 'radial-gradient(circle at 50% 30%, hsla(199, 92%, 54%, 0.08) 0%, transparent 60%), radial-gradient(circle at 30% 80%, hsla(275, 62%, 60%, 0.06) 0%, transparent 50%), hsl(var(--background))',
      }}>

      <div className="flex flex-col items-center pt-10 pb-3 flex-shrink-0 relative z-10"
        style={{
          background: 'linear-gradient(180deg, hsl(var(--background)) 60%, transparent 100%)',
        }}>
        <AICharacter state={parrotState} size={0.8} />
        <span className="text-[11px] text-muted-foreground mt-1.5 font-medium transition-opacity duration-300">
          {parrotState === 'speaking' ? `${getCharacterName()}在说…` : parrotState === 'thinking' ? '思考中…' : '等您回答…'}
        </span>
      </div>

      <div ref={chatRef} className="flex-1 overflow-y-auto px-5 pb-3 space-y-2.5">
        <AnimatePresence>
          {chat.map((msg, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25 }}
              className={`flex ${msg.role === 'parent' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm font-medium leading-relaxed whitespace-pre-line ${
                msg.role === 'parent' ? 'rounded-br-sm text-white' : 'rounded-bl-sm text-foreground'
              }`}
                style={{
                  background: msg.role === 'parent'
                    ? 'linear-gradient(135deg, hsla(199, 92%, 54%, 0.9), hsla(199, 82%, 48%, 0.9))'
                    : 'rgba(255,255,255,0.8)',
                  boxShadow: '0 2px 10px hsla(0,0%,0%,0.05)',
                }}>
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {showInput && (
          <motion.div key={`input-${step}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="px-5 pb-8 pt-3 flex-shrink-0"
            style={{ background: 'linear-gradient(180deg, transparent 0%, hsl(var(--background)) 30%)' }}>
            {renderInput()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OptionBtn({ label, onClick, disabled, wide }: { label: string; onClick: () => void; disabled?: boolean; wide?: boolean }) {
  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.95 }}
      onClick={disabled ? undefined : onClick}
      className={`px-4 py-2.5 rounded-2xl text-sm font-semibold ${wide ? 'flex-1' : ''} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
      style={{
        background: 'rgba(255,255,255,0.85)',
        border: '1.5px solid hsla(199, 92%, 54%, 0.18)',
        boxShadow: '0 2px 8px hsla(0,0%,0%,0.03)',
        color: 'hsl(var(--foreground))',
      }}>
      {label}
    </motion.button>
  );
}
