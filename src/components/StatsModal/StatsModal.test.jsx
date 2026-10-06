import { render, screen, fireEvent } from '@testing-library/react';
import StatsModal from './StatsModal';

const gameStats = {
  winDistribution: [0, 0, 0, 0, 0, 0],
  gamesFailed: 0,
  currentStreak: 0,
  bestStreak: 0,
  totalGames: 0,
  successRate: 0,
};

const renderModal = props =>
  render(
    <StatsModal
      isOpen={true}
      onClose={jest.fn()}
      gameStats={gameStats}
      numberOfGuessesMade={0}
      isGameWon={false}
      isGameLost={false}
      isHardMode={false}
      guesses={[]}
      showAlert={jest.fn()}
      onResetStats={jest.fn()}
      {...props}
    />
  );

test('reset statistics requires confirmation', () => {
  const onResetStats = jest.fn();
  const showAlert = jest.fn();
  renderModal({ onResetStats, showAlert });

  // Clicking reset shows the confirmation, does not reset
  fireEvent.click(screen.getByText('Reset statistics'));
  expect(
    screen.getByText('Reset all statistics? This cannot be undone.')
  ).toBeInTheDocument();
  expect(onResetStats).not.toHaveBeenCalled();

  // Cancel returns to the reset button without resetting
  fireEvent.click(screen.getByText('Cancel'));
  expect(screen.getByText('Reset statistics')).toBeInTheDocument();
  expect(onResetStats).not.toHaveBeenCalled();

  // Confirm resets and alerts
  fireEvent.click(screen.getByText('Reset statistics'));
  fireEvent.click(screen.getByText('Yes, reset'));
  expect(onResetStats).toHaveBeenCalledTimes(1);
  expect(showAlert).toHaveBeenCalledWith('Statistics reset', 'success');
  expect(screen.getByText('Reset statistics')).toBeInTheDocument();
});
