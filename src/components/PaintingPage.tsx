import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExploreWorldTab from './ExploreWorldTab';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';

export default function PaintingPage() {
  const [hasSecondaryPageOpen, setHasSecondaryPageOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-page)' }}>
      <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto relative min-h-screen flex flex-col">
        {/* Value proposition header */}
        <div className="px-5 pt-12 pb-3 flex items-center gap-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/home-v3')}
            className="w-9 h-9 rounded-full glass flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-lg font-extrabold text-foreground">拍拍画画</h1>
            <p className="text-xs text-muted-foreground">🌍 真实世界才是最好的教材</p>
          </div>
        </div>

        <div className="flex-1">
          <ExploreWorldTab
            onSecondaryPageChange={setHasSecondaryPageOpen}
          />
        </div>
      </div>
    </div>
  );
}
