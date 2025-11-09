import { render, screen } from '@testing-library/react';
import { PopupWindow } from '@/app/components/popup/PopupWindow';

describe('PopupWindow', () => {
  it('portal経由でDOMに描画される', () => {
    render(
      <PopupWindow isOpen ariaLabel="テストポップアップ">
        <p>portal content</p>
      </PopupWindow>,
    );

    expect(screen.getByLabelText('テストポップアップ')).toBeInTheDocument();
    expect(screen.getByText('portal content')).toBeInTheDocument();
  });
});
