import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AIPartnerTab from './AIPartnerTab';
import CompactActionSection from './CompactActionSection';
import { motion } from 'motion/react';
import { UserCircle, Wifi } from 'lucide-react';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 6) return '夜深了';
  if (hour < 11) return '早安';
  if (hour < 13) return '午安';
  if (hour < 18) return '下午好';
  if (hour < 22) return '晚上好';
  return '夜深了';
};

export default function HomePage() {
  const navigate = useNavigate();
  const [childName, setChildName] = useState('小朋友');
  const greeting = getGreeting();

  useEffect(() => {
    const stored = localStorage.getItem('child_name');
    if (stored) setChildName(stored);
  }, []);

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--gradient-page)' }}>
      <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto relative min-h-screen flex flex-col pb-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-8 pb-2 px-5 flex items-center gap-3"
        >
          <div className="flex-1">
            <h1 className="text-xl font-extrabold text-foreground">{greeting}，{childName}！</h1>
            <p className="text-xs text-muted-foreground mt-0.5">今天想和谁一起玩？</p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/activate')}
              className="w-9 h-9 rounded-full glass flex items-center justify-center relative"
              title="激活角色"
            >
              <Wifi className="w-4 h-4 text-muted-foreground" style={{ transform: 'rotate(90deg)' }} />
              <motion.div
                className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full flex items-center justify-center"
                style={{ background: '#E87040' }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-[6px] text-white font-bold">N</span>
              </motion.div>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                localStorage.removeItem('onboarding_completed');
                localStorage.removeItem('onboarding_data');
                localStorage.removeItem('child_name');
                navigate('/');
              }}
              className="w-9 h-9 rounded-full glass flex items-center justify-center"
            >
              <UserCircle className="w-5 h-5 text-muted-foreground" />
            </motion.button>
          </div>
        </motion.div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <AIPartnerTab />
        </div>
      </div>

      {/* Fixed Bottom Area */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto">
          <div
            className="px-4 pt-4 pb-8 rounded-t-3xl"
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderTop: '1px solid var(--glass-border)',
              borderLeft: '1px solid var(--glass-border)',
              borderRight: '1px solid var(--glass-border)',
              boxShadow: '0 -8px 32px hsla(0, 0%, 0%, 0.06), inset 0 1px 0 hsla(0, 0%, 100%, 0.5)',
            }}
          >
            <CompactActionSection
              onStartClass={() => navigate('/lessons')}
              onPlayPartner={() => navigate('/ai-parrot')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
