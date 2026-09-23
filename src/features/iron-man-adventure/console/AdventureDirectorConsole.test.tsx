import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdventureDirectorConsole, { type TargetConceptItem } from './AdventureDirectorConsole';
import { DEFAULT_VOICE_CONFIG, type VoiceConfig } from './AdventureVoiceSettings';

describe('AdventureDirectorConsole component', () => {
  const defaultProps = {
    isOpen: true,
    onToggleOpen: vi.fn(),
    currentAct: '旅途',
    sceneTitle: '深空航线',
    sceneIndex: 2,
    totalScenes: 7,
    sceneProgress: 0.45,
    phase: 'flight',
    locationName: '深空轨道',
    dramaticObjective: '穿越星尘门认识 STAR',
    currentLine: '看前方，那是 STAR！',
    actorAction: 'fly',
    helpLevel: 1,
    targetConcepts: [
      { word: 'STAR', meaning: '星星', emoji: '⭐', status: 'learned' as const },
      { word: 'LIGHT', meaning: '光', emoji: '💡', status: 'unseen' as const },
    ],
    onPlay: vi.fn(),
    onPause: vi.fn(),
    onRestart: vi.fn(),
    onPreviousScene: vi.fn(),
    onNextScene: vi.fn(),
    onSelectScene: vi.fn(),
    onReplayLine: vi.fn(),
    onSetSpeed: vi.fn(),
    currentSpeed: 1,
    isPaused: false,
    isStarted: true,
    showHitboxes: false,
    onToggleHitboxes: vi.fn(),
    cameraEnabled: false,
    onToggleCamera: vi.fn(),
    cameraError: '',
    voiceConfig: DEFAULT_VOICE_CONFIG,
    onChangeVoiceConfig: vi.fn(),
    scenesList: [
      { id: 'lab', title: '斯塔克实验室' },
      { id: 'launch', title: '发射隧道' },
      { id: 'space', title: '深空航线' },
    ],
  };

  it('renders story status, dramatic objective, current line, and target words', () => {
    render(<AdventureDirectorConsole {...defaultProps} />);

    expect(screen.getByRole('complementary', { name: '故事后台控制台' })).toBeInTheDocument();
    expect(screen.getByText('深空航线')).toBeInTheDocument();
    expect(screen.getByText(/穿越星尘门认识 STAR/)).toBeInTheDocument();
    expect(screen.getByText('看前方，那是 STAR！')).toBeInTheDocument();
    expect(screen.getByText('STAR ⭐')).toBeInTheDocument();
    expect(screen.getByText('LIGHT 💡')).toBeInTheDocument();
    expect(screen.getByText('fly')).toBeInTheDocument();
  });

  it('handles pause, play, restart, and next/prev scene callbacks', () => {
    render(<AdventureDirectorConsole {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: '暂停' }));
    expect(defaultProps.onPause).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: '重启' }));
    expect(defaultProps.onRestart).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: '上一幕' }));
    expect(defaultProps.onPreviousScene).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: '下一幕' }));
    expect(defaultProps.onNextScene).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: '重播台词' }));
    expect(defaultProps.onReplayLine).toHaveBeenCalled();
  });

  it('supports selecting a scene and setting playback speed', () => {
    render(<AdventureDirectorConsole {...defaultProps} />);

    const select = screen.getByLabelText('选择场景');
    fireEvent.change(select, { target: { value: '1' } });
    expect(defaultProps.onSelectScene).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByRole('button', { name: '1.5×' }));
    expect(defaultProps.onSetSpeed).toHaveBeenCalledWith(1.5);
  });

  it('toggles camera and displays camera error if any', () => {
    const { rerender } = render(<AdventureDirectorConsole {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: '开启副驾驶摄像头' }));
    expect(defaultProps.onToggleCamera).toHaveBeenCalled();

    rerender(<AdventureDirectorConsole {...defaultProps} cameraError="无法访问摄像头" />);
    expect(screen.getByText('无法访问摄像头')).toBeInTheDocument();
  });

  it('handles collapse and expand correctly', () => {
    const onToggle = vi.fn();
    const { rerender } = render(<AdventureDirectorConsole {...defaultProps} isOpen={true} onToggleOpen={onToggle} />);

    fireEvent.click(screen.getByRole('button', { name: '收起控制台' }));
    expect(onToggle).toHaveBeenCalled();

    rerender(<AdventureDirectorConsole {...defaultProps} isOpen={false} onToggleOpen={onToggle} />);
    expect(screen.getByRole('button', { name: '展开控制台' })).toBeInTheDocument();
    expect(screen.queryByText('深空航线')).toBeNull();
  });

  it('updates Azure voice settings', () => {
    const onChangeVoice = vi.fn();
    render(<AdventureDirectorConsole {...defaultProps} onChangeVoiceConfig={onChangeVoice} />);

    const regionInput = screen.getByLabelText('Azure Region');
    fireEvent.change(regionInput, { target: { value: 'japaneast' } });
    expect(onChangeVoice).toHaveBeenCalledWith(expect.objectContaining({ region: 'japaneast' }));

    const keyInput = screen.getByLabelText('Azure Speech Key');
    fireEvent.change(keyInput, { target: { value: 'secret-key-123' } });
    expect(onChangeVoice).toHaveBeenCalledWith(expect.objectContaining({ subscriptionKey: 'secret-key-123' }));
  });
});
