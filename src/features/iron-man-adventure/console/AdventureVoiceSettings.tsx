import { useState, useRef, useEffect } from 'react';
import { AzureSpeechOutput, type AzureCharacterVoiceConfig } from '@/features/olaf-live/azureSpeechOutput';

export interface VoiceConfig {
  provider: 'azure' | 'browser';
  region: string;
  subscriptionKey: string;
  voiceName: string;
}

export const DEFAULT_VOICE_CONFIG: VoiceConfig = {
  provider: 'azure',
  region: 'eastasia',
  subscriptionKey: '',
  voiceName: 'zh-CN-YunxiNeural',
};

export const PRESET_VOICES = [
  { value: 'zh-CN-YunxiNeural', label: '云希 (阳光少年 / 默认推荐)' },
  { value: 'zh-CN-YunjianNeural', label: '云健 (沉稳青年 / 钢铁侠装甲)' },
  { value: 'zh-CN-YunyangNeural', label: '云扬 (专业播报 / 贾维斯风格)' },
  { value: 'en-US-AndrewMultilingualNeural', label: 'Andrew (双语男声 / 英文模式)' },
  { value: 'en-US-BrianMultilingualNeural', label: 'Brian (多语种男声)' },
];

export interface AdventureVoiceSettingsProps {
  config: VoiceConfig;
  onChange: (next: VoiceConfig) => void;
  className?: string;
}

export default function AdventureVoiceSettings({
  config,
  onChange,
  className = '',
}: AdventureVoiceSettingsProps) {
  const [testStatus, setTestStatus] = useState<{
    state: 'idle' | 'testing' | 'playing' | 'success' | 'error';
    message?: string;
  }>({ state: 'idle' });

  const azureOutputRef = useRef<AzureSpeechOutput | null>(null);

  useEffect(() => {
    return () => {
      azureOutputRef.current?.cancel();
    };
  }, []);

  const handleTestVoice = () => {
    if (config.provider === 'azure') {
      if (!config.subscriptionKey.trim() || !config.region.trim()) {
        setTestStatus({
          state: 'error',
          message: '请先填写 Azure Region 与 Speech Key',
        });
        return;
      }

      setTestStatus({ state: 'testing', message: '正在请求 Azure 语音合成...' });
      azureOutputRef.current?.cancel();

      const azureConfig: AzureCharacterVoiceConfig = {
        provider: 'azure',
        region: config.region.trim(),
        subscriptionKey: config.subscriptionKey.trim(),
        voiceName: config.voiceName.trim() || 'zh-CN-YunxiNeural',
      };

      const speaker = new AzureSpeechOutput(azureConfig);
      azureOutputRef.current = speaker;

      speaker.speak(
        {
          text: '反浩克装甲连接正常，系统准备就绪，我们出发吧！',
          delivery: {
            style: 'cheerful',
            styleDegree: 1.2,
            rate: 0,
            pitch: 5,
            volume: 100,
          },
        },
        {
          onStart: () => {
            setTestStatus({ state: 'playing', message: '正在播放测试声音...' });
          },
          onPulse: () => {},
          onEnd: () => {
            setTestStatus({ state: 'success', message: 'Azure 语音测试成功！' });
          },
          onError: (errMsg) => {
            setTestStatus({ state: 'error', message: `Azure 错误: ${errMsg}` });
          },
        }
      );
    } else {
      // Browser fallback test
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        setTestStatus({ state: 'error', message: '当前浏览器不支持语音合成' });
        return;
      }
      window.speechSynthesis.cancel();
      setTestStatus({ state: 'playing', message: '正在播放浏览器原生语音...' });
      const utterance = new SpeechSynthesisUtterance('反浩克装甲连接正常，系统准备就绪！');
      utterance.lang = 'zh-CN';
      utterance.onend = () => {
        setTestStatus({ state: 'success', message: '浏览器语音测试完成' });
      };
      utterance.onerror = (e) => {
        setTestStatus({ state: 'error', message: `播放失败: ${e.error}` });
      };
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStopVoice = () => {
    azureOutputRef.current?.cancel();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setTestStatus({ state: 'idle', message: '已停止声音' });
  };

  const isTestingOrPlaying = testStatus.state === 'testing' || testStatus.state === 'playing';

  return (
    <details className={`adventure-voice-settings-panel ${className}`} data-voice-settings>
      <summary className="voice-settings-summary">
        <span>🎙️ 语音引擎与 Azure 配置</span>
        <span className={`voice-status-pill status-${testStatus.state}`}>
          {testStatus.state === 'idle' && (config.subscriptionKey ? '已配置' : '未配置 Key')}
          {testStatus.state === 'testing' && '连接中...'}
          {testStatus.state === 'playing' && '播放中...'}
          {testStatus.state === 'success' && '可用'}
          {testStatus.state === 'error' && '异常'}
        </span>
      </summary>

      <div className="voice-settings-content">
        <label className="voice-field-row">
          <span>语音引擎</span>
          <select
            value={config.provider}
            onChange={(e) => onChange({ ...config, provider: e.target.value as 'azure' | 'browser' })}
            aria-label="选择语音引擎"
          >
            <option value="azure">Azure Cognitive Services (支持情绪与口型)</option>
            <option value="browser">浏览器原生合成 (Browser Fallback)</option>
          </select>
        </label>

        {config.provider === 'azure' && (
          <>
            <label className="voice-field-row">
              <span>Region</span>
              <input
                type="text"
                value={config.region}
                placeholder="例如 eastasia 或 japaneast"
                onChange={(e) => onChange({ ...config, region: e.target.value })}
                aria-label="Azure Region"
              />
            </label>

            <label className="voice-field-row">
              <span>Speech Key</span>
              <input
                type="password"
                autoComplete="off"
                value={config.subscriptionKey}
                placeholder="仅保存在当前页面内存"
                onChange={(e) => onChange({ ...config, subscriptionKey: e.target.value })}
                aria-label="Azure Speech Key"
              />
            </label>

            <label className="voice-field-row">
              <span>Voice Name</span>
              <div className="voice-name-control">
                <select
                  value={PRESET_VOICES.some((v) => v.value === config.voiceName) ? config.voiceName : 'custom'}
                  onChange={(e) => {
                    if (e.target.value !== 'custom') {
                      onChange({ ...config, voiceName: e.target.value });
                    }
                  }}
                  aria-label="选择预设声音"
                >
                  {PRESET_VOICES.map((v) => (
                    <option key={v.value} value={v.value}>
                      {v.label}
                    </option>
                  ))}
                  <option value="custom">自定义 Voice Name...</option>
                </select>
                <input
                  type="text"
                  value={config.voiceName}
                  placeholder="zh-CN-YunxiNeural"
                  onChange={(e) => onChange({ ...config, voiceName: e.target.value })}
                  aria-label="自定义 Voice Name"
                />
              </div>
            </label>
          </>
        )}

        <div className="voice-actions-row">
          <button
            type="button"
            className="voice-test-btn"
            disabled={isTestingOrPlaying}
            onClick={handleTestVoice}
          >
            {isTestingOrPlaying ? '测试中...' : '🔊 测试声音'}
          </button>
          <button
            type="button"
            className="voice-stop-btn"
            onClick={handleStopVoice}
          >
            ⏹️ 停止声音
          </button>
        </div>

        {testStatus.message && (
          <div
            className={`voice-status-feedback status-${testStatus.state}`}
            role="status"
            aria-live="polite"
          >
            {testStatus.message}
          </div>
        )}

        <p className="voice-privacy-hint">
          * Azure Key 仅保留在浏览器运行时内存中，刷新页面即清除，不上传服务端或持久存储。
        </p>
      </div>
    </details>
  );
}
