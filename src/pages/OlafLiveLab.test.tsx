import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import OlafLiveLab from './OlafLiveLab';

describe('Olaf Live Lab', () => {
  it('renders a usable offline preview before credentials are configured', () => {
    render(<OlafLiveLab />);

    expect(screen.getByRole('heading', { name: /雪宝 · Live Lab/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: '开始实时对话' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '打招呼' })).toBeTruthy();
    expect(screen.getByText('离线预览')).toBeTruthy();
  });
});
