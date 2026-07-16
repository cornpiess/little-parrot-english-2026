import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, MapPin } from 'lucide-react';
import { markShippingAddress } from '@/lib/characterState';

export default function ShippingAddress() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('');
  const [address, setAddress] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = name && phone && region && address;

  const handleSubmit = () => {
    if (!canSubmit) return;
    markShippingAddress();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6"
        style={{ background: 'linear-gradient(180deg, #FFF8E1 0%, #FFFFFF 100%)' }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="text-center">
          <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'rgba(88,204,2,0.12)' }}>
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-2">地址已提交！</h2>
          <p className="text-sm text-gray-500 mb-6">我们将在 3-5 个工作日内寄出实体角色卡片</p>
          <motion.button whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/home-v3')}
            className="px-8 py-3 rounded-2xl font-bold text-white text-sm"
            style={{ background: 'linear-gradient(135deg, #58CC02, #58CC02CC)', boxShadow: '0 8px 32px rgba(88,204,2,0.4)' }}>
            返回首页
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(180deg, #FFF8E1 0%, #FFFFFF 100%)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.05)' }}>
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </motion.button>
        <h1 className="text-lg font-extrabold text-gray-900">收货地址</h1>
      </div>

      {/* Form */}
      <div className="flex-1 px-5 pb-8">
        <div className="rounded-3xl p-5 mb-4"
          style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4" style={{ color: '#FFB700' }} />
            <p className="text-sm font-bold text-gray-800">填写收货信息</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-gray-400 mb-1 block">收件人姓名</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="请输入姓名"
                className="w-full px-4 py-3 rounded-xl text-sm text-gray-800 outline-none"
                style={{ background: 'rgba(0,0,0,0.03)', border: '1.5px solid rgba(0,0,0,0.08)' }} />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-400 mb-1 block">手机号码</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="请输入手机号"
                className="w-full px-4 py-3 rounded-xl text-sm text-gray-800 outline-none"
                style={{ background: 'rgba(0,0,0,0.03)', border: '1.5px solid rgba(0,0,0,0.08)' }} />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-400 mb-1 block">省 / 市 / 区</label>
              <input type="text" value={region} onChange={e => setRegion(e.target.value)}
                placeholder="例：北京市 海淀区"
                className="w-full px-4 py-3 rounded-xl text-sm text-gray-800 outline-none"
                style={{ background: 'rgba(0,0,0,0.03)', border: '1.5px solid rgba(0,0,0,0.08)' }} />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-400 mb-1 block">详细地址</label>
              <textarea value={address} onChange={e => setAddress(e.target.value)}
                placeholder="街道、楼栋、门牌号等"
                rows={3}
                className="w-full px-4 py-3 rounded-xl text-sm text-gray-800 outline-none resize-none"
                style={{ background: 'rgba(0,0,0,0.03)', border: '1.5px solid rgba(0,0,0,0.08)' }} />
            </div>
          </div>
        </div>

        <motion.button whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full py-3.5 rounded-2xl font-bold text-sm"
          style={{
            background: canSubmit ? 'linear-gradient(135deg, #58CC02, #58CC02CC)' : 'rgba(0,0,0,0.06)',
            color: canSubmit ? 'white' : 'rgba(0,0,0,0.2)',
            boxShadow: canSubmit ? '0 8px 32px rgba(88,204,2,0.4)' : 'none',
          }}>
          确认提交
        </motion.button>
      </div>
    </div>
  );
}
