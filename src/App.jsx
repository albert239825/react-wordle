import { useState, useEffect } from 'react';
import Header from 'components/Header';
import Grid from 'components/Grid';
import Keyboard from 'components/Keyboard';
import Alert from 'components/Alert';
import InfoModal from 'components/InfoModal';
import SettingModal from 'components/SettingModal';
import StatsModal from 'components/StatsModal';
import ArchiveModal from 'components/ArchiveModal';
import useLocalStorage from 'hooks/useLocalStorage';
import useAlert from 'hooks/useAlert';
import {
  solution,
  solutionIndex,
  isWordValid,
  findFirstUnusedReveal,
  addStatsForCompletedGame,
  getWordByIndex,
  getRandomSolutionIndex,
} from 'lib/words';
import {
  ALERT_DELAY,
  MAX_CHALLENGES,
  MAX_WORD_LENGTH,
  GAME_MODES,
} from 'constants/settings';
import { DEFAULT_KEYBOARD_LAYOUT } from 'constants/keyboardLayouts';
import styles from './App.module.scss';
import 'styles/_transitionStyles.scss';

function App() {
  const [boardState, setBoardState] = useLocalStorage('boardState', {
    guesses: [],
    solutionIndex: '',
  });
  const [theme, setTheme] = useLocalStorage('theme', 'dark');
  const [hardMode, setHardMode] = useLocalStorage('hard-mode', false);
  const [keyboardLayout, setKeyboardLayout] = useLocalStorage(
    'keyboard-layout',
    DEFAULT_KEYBOARD_LAYOUT
  );
  const [stats, setStats] = useLocalStorage('gameStats', {
    winDistribution: Array.from(new Array(MAX_CHALLENGES), () => 0),
    gamesFailed: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalGames: 0,
    successRate: 0,
  });
  const [currentGuess, setCurrentGuess] = useState('');
  const [guesses, setGuesses] = useState(() => {
    if (boardState.solutionIndex !== solutionIndex) return [];
    return boardState.guesses;
  });
  const [mode, setMode] = useState(GAME_MODES.DAILY);
  const [activeSolution, setActiveSolution] = useState(solution);
  const [activeSolutionIndex, setActiveSolutionIndex] = useState(solutionIndex);
  const [isJiggling, setIsJiggling] = useState(false);
  const [isGameWon, setIsGameWon] = useState(false);
  const [isGameLost, setIsGameLost] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isHardMode, setIsHardMode] = useState(hardMode);
  const [isDarkMode, setIsDarkMode] = useState(theme === 'dark');
  const { showAlert } = useAlert();

  const isDaily = mode === GAME_MODES.DAILY;

  // Show welcome modal
  useEffect(() => {
    if (!boardState.solutionIndex)
      setTimeout(() => setIsInfoModalOpen(true), 1000);
    // eslint-disable-next-line
  }, []);

  // Save boardState to localStorage (only the daily game is persisted)
  useEffect(() => {
    if (isDaily) setBoardState({ guesses, solutionIndex });
    // eslint-disable-next-line
  }, [guesses]);

  // Check game winning or losing
  useEffect(() => {
    if (guesses.includes(activeSolution.toUpperCase())) {
      setIsGameWon(true);
      setTimeout(() => showAlert('Well done', 'success'), ALERT_DELAY);
      setTimeout(() => setIsStatsModalOpen(true), ALERT_DELAY + 1000);
    } else if (guesses.length === MAX_CHALLENGES) {
      setIsGameLost(true);
      setTimeout(
        () => showAlert(`The word was ${activeSolution}`, 'error', true),
        ALERT_DELAY
      );
      setTimeout(() => setIsStatsModalOpen(true), ALERT_DELAY + 1000);
    }
    // eslint-disable-next-line
  }, [guesses]);

  useEffect(() => {
    if (isDarkMode) document.body.setAttribute('data-theme', 'dark');
    else document.body.removeAttribute('data-theme');
  }, [isDarkMode]);

  const handleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  const handleHardMode = () => {
    setIsHardMode(!isHardMode);
    setHardMode(!isHardMode);
  };

  const resetGame = (initialGuesses = []) => {
    setGuesses(initialGuesses);
    setCurrentGuess('');
    setIsGameWon(false);
    setIsGameLost(false);
  };

  const enterDailyMode = () => {
    setMode(GAME_MODES.DAILY);
    setActiveSolution(solution);
    setActiveSolutionIndex(solutionIndex);
    const restored =
      boardState.solutionIndex === solutionIndex ? boardState.guesses : [];
    resetGame(restored);
  };

  const startPractice = () => {
    const index = getRandomSolutionIndex();
    setMode(GAME_MODES.PRACTICE);
    setActiveSolution(getWordByIndex(index));
    setActiveSolutionIndex(index);
    resetGame([]);
  };

  const togglePractice = () => {
    if (mode === GAME_MODES.PRACTICE) enterDailyMode();
    else startPractice();
  };

  const playArchive = index => {
    setMode(GAME_MODES.ARCHIVE);
    setActiveSolution(getWordByIndex(index));
    setActiveSolutionIndex(index);
    resetGame([]);
    setIsArchiveModalOpen(false);
  };

  const handleKeyDown = letter =>
    currentGuess.length < MAX_WORD_LENGTH &&
    !isGameWon &&
    setCurrentGuess(currentGuess + letter);

  const handleDelete = () =>
    setCurrentGuess(currentGuess.slice(0, currentGuess.length - 1));

  const handleEnter = () => {
    if (isGameWon || isGameLost) return;

    if (currentGuess.length < MAX_WORD_LENGTH) {
      setIsJiggling(true);
      return showAlert('Not enough letters', 'error');
    }

    if (!isWordValid(currentGuess)) {
      setIsJiggling(true);
      return showAlert('Not in word list', 'error');
    }

    if (isHardMode) {
      const firstMissingReveal = findFirstUnusedReveal(
        currentGuess,
        guesses,
        activeSolution
      );
      if (firstMissingReveal) {
        setIsJiggling(true);
        return showAlert(firstMissingReveal, 'error');
      }
    }

    // Only the daily puzzle contributes to the saved statistics.
    if (isDaily) {
      if (currentGuess === activeSolution.toUpperCase()) {
        setStats(addStatsForCompletedGame(stats, guesses.length));
      } else if (guesses.length + 1 === MAX_CHALLENGES) {
        setStats(addStatsForCompletedGame(stats, guesses.length + 1));
      }
    }

    setGuesses([...guesses, currentGuess]);
    setCurrentGuess('');
  };

  return (
    <div className={styles.container}>
      <Header
        mode={mode}
        onTogglePractice={togglePractice}
        setIsInfoModalOpen={setIsInfoModalOpen}
        setIsStatsModalOpen={setIsStatsModalOpen}
        setIsSettingsModalOpen={setIsSettingsModalOpen}
        setIsArchiveModalOpen={setIsArchiveModalOpen}
      />
      {!isDaily && (
        <div className={styles.modeBanner}>
          {mode === GAME_MODES.PRACTICE
            ? 'Practice Mode'
            : `Archive #${activeSolutionIndex}`}
        </div>
      )}
      <Alert />
      <Grid
        currentGuess={currentGuess}
        guesses={guesses}
        isJiggling={isJiggling}
        setIsJiggling={setIsJiggling}
        solution={activeSolution}
      />
      <Keyboard
        onEnter={handleEnter}
        onDelete={handleDelete}
        onKeyDown={handleKeyDown}
        guesses={guesses}
        solution={activeSolution}
        layout={keyboardLayout}
      />
      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />
      <SettingModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        isHardMode={isHardMode}
        isDarkMode={isDarkMode}
        setIsHardMode={handleHardMode}
        setIsDarkMode={handleDarkMode}
        keyboardLayout={keyboardLayout}
        setKeyboardLayout={setKeyboardLayout}
      />
      <ArchiveModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        onPlay={playArchive}
      />
      <StatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        gameStats={stats}
        setStats={setStats}
        numberOfGuessesMade={guesses.length}
        isGameWon={isGameWon}
        isGameLost={isGameLost}
        isHardMode={isHardMode}
        guesses={guesses}
        showAlert={showAlert}
        mode={mode}
        solution={activeSolution}
        onNewPractice={startPractice}
      />
    </div>
  );
}

export default App;
