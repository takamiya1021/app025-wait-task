import { render, screen } from '@testing-library/react';
import { AppHeader } from '@/app/components/layout/AppHeader';

describe('AppHeader', () => {
  it('タイトルとアクションボタンを表示する', () => {
    render(<AppHeader />);

    expect(screen.getByText('待ち時間をタスク完了タイムに変える相棒')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'チェックリストを見る' })).toHaveAttribute(
      'href',
      '#tasks',
    );
  });
});
