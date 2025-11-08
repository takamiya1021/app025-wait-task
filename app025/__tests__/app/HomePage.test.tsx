import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

describe('Home page', () => {
  it('タイトルを表示する', () => {
    render(<Home />);
    expect(
      screen.getByRole('heading', { level: 1, name: '待ち時間をタスク完了タイムに変える相棒' }),
    ).toBeInTheDocument();
  });
});
