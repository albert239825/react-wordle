import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingModal from './SettingModal';

const renderModal = props =>
  render(
    <SettingModal
      isOpen
      onClose={() => {}}
      isHardMode={false}
      isDarkMode={false}
      isReducedMotion={false}
      setIsHardMode={() => {}}
      setIsDarkMode={() => {}}
      setIsReducedMotion={() => {}}
      {...props}
    />
  );

test('renders the reduced motion toggle reflecting its state', () => {
  renderModal({ isReducedMotion: true });
  expect(screen.getByText('Reduced Motion')).toBeInTheDocument();
  expect(
    screen.getByRole('checkbox', { name: 'Reduced Motion' })
  ).toBeChecked();
});

test('toggling reduced motion calls its handler only', () => {
  const setIsReducedMotion = jest.fn();
  const setIsDarkMode = jest.fn();
  renderModal({ setIsReducedMotion, setIsDarkMode });
  userEvent.click(screen.getByRole('checkbox', { name: 'Reduced Motion' }));
  expect(setIsReducedMotion).toHaveBeenCalledTimes(1);
  expect(setIsDarkMode).not.toHaveBeenCalled();
});
