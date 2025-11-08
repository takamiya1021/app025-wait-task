import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

describe('Home page', () => {
  it('タイトルを表示する', () => {
    render(<Home />);
    expect(
      screen.getByRole('heading', { level: 1, name: '待ち時間に「今やるべきこと」を迷わない' }),
    ).toBeInTheDocument();
  });
});
