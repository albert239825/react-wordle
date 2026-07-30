import { useState, useEffect } from 'react';
import Header from 'components/Header';
import Grid from 'components/Grid';
import Keyboard from 'components/Keyboard';
import Alert from 'components/Alert';
import InfoModal from 'components/InfoModal';
import SettingModal from 'components/SettingModal';
import StatsModal from 'components/StatsModal';
import useLocalStorage from 'hooks/useLocalStorage';
import useAlert from 'hooks/useAlert';
import {
  solution,
  solutionIndex,
  isWordValid,
  findFirstUnusedReveal,
  addStatsForCompletedGame,
  getRandomWord,
} from 'lib/words';
import {
  ALERT_DELAY,
  MAX_CHALLENGES,
  MAX_WORD_LENGTH,
} from 'constants/settings';
import styles from './App.module.scss';
import 'styles/_transitionStyles.scss';

function App() {
  const [boardState, setBoardState] = useLocalStorage('boardState', {
    guesses: [],
    solutionIndex: '',
  });
  const [theme, setTheme] = useLocalStorage('theme', 'dark');
  const [hardMode, setHardMode] = useLocalStorage('hard-mode', false);
  const [practiceMode, setPracticeMode] = useLocalStorage(
    'practice-mode',
    false
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
  const [practiceSolution, setPracticeSolution] = useState(getRandomWord);
  const [practiceGuesses, setPracticeGuesses] = useState([]);
  const [isJiggling, setIsJiggling] = useState(false);
  const [isGameWon, setIsGameWon] = useState(false);
  const [isGameLost, setIsGameLost] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isHardMode, setIsHardMode] = useState(hardMode);
  const [isDarkMode, setIsDarkMode] = useState(theme === 'dark');
  const [isPracticeMode, setIsPracticeMode] = useState(practiceMode);
  const { showAlert } = useAlert();

  // Practice mode plays random words, kept out of the daily state and stats
  const activeSolution = isPracticeMode ? practiceSolution : solution;
  const activeGuesses = isPracticeMode ? practiceGuesses : guesses;
  const setActiveGuesses = isPracticeMode ? setPracticeGuesses : setGuesses;

  // Show welcome modal
  useEffect(() => {
    if (!boardState.solutionIndex)
      setTimeout(() => setIsInfoModalOpen(true), 1000);
    // eslint-disable-next-line
  }, []);

  // Save boardState to localStorage
  useEffect(() => {
    setBoardState({
      guesses,
      solutionIndex,
    });
    // eslint-disable-next-line
  }, [guesses]);

  // Check game winning or losing
  useEffect(() => {
    if (activeGuesses.includes(activeSolution.toUpperCase())) {
      setIsGameWon(true);
      setTimeout(() => showAlert('Well done', 'success'), ALERT_DELAY);
      if (!isPracticeMode)
        setTimeout(() => setIsStatsModalOpen(true), ALERT_DELAY + 1000);
    } else if (activeGuesses.length === MAX_CHALLENGES) {
      setIsGameLost(true);
      setTimeout(
        () => showAlert(`The word was ${activeSolution}`, 'error', true),
        ALERT_DELAY
      );
      if (!isPracticeMode)
        setTimeout(() => setIsStatsModalOpen(true), ALERT_DELAY + 1000);
    } else {
      setIsGameWon(false);
      setIsGameLost(false);
    }
    // eslint-disable-next-line
  }, [activeGuesses, activeSolution]);

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

  const handlePracticeMode = () => {
    setIsPracticeMode(!isPracticeMode);
    setPracticeMode(!isPracticeMode);
    setCurrentGuess('');
    if (!isPracticeMode) handleNewPracticeGame();
  };

  const handleNewPracticeGame = () => {
    setPracticeSolution(getRandomWord());
    setPracticeGuesses([]);
    setCurrentGuess('');
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
        activeGuesses,
        activeSolution
      );
      if (firstMissingReveal) {
        setIsJiggling(true);
        return showAlert(firstMissingReveal, 'error');
      }
    }

    if (!isPracticeMode) {
      if (currentGuess === activeSolution.toUpperCase()) {
        setStats(addStatsForCompletedGame(stats, activeGuesses.length));
      } else if (activeGuesses.length + 1 === MAX_CHALLENGES) {
        setStats(addStatsForCompletedGame(stats, activeGuesses.length + 1));
      }
    }

    setActiveGuesses([...activeGuesses, currentGuess]);
    setCurrentGuess('');
  };

  return (
    <div className={styles.container}>
      <Header
        setIsInfoModalOpen={setIsInfoModalOpen}
        setIsStatsModalOpen={setIsStatsModalOpen}
        setIsSettingsModalOpen={setIsSettingsModalOpen}
        isPracticeMode={isPracticeMode}
        onNewPracticeGame={handleNewPracticeGame}
      />
      <Alert />
      <Grid
        currentGuess={currentGuess}
        guesses={activeGuesses}
        solution={activeSolution}
        isJiggling={isJiggling}
        setIsJiggling={setIsJiggling}
      />
      <Keyboard
        onEnter={handleEnter}
        onDelete={handleDelete}
        onKeyDown={handleKeyDown}
        guesses={activeGuesses}
        solution={activeSolution}
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
        isPracticeMode={isPracticeMode}
        setIsHardMode={handleHardMode}
        setIsDarkMode={handleDarkMode}
        setIsPracticeMode={handlePracticeMode}
      />
      <StatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        gameStats={stats}
        numberOfGuessesMade={isPracticeMode ? 0 : guesses.length}
        isGameWon={!isPracticeMode && isGameWon}
        isGameLost={!isPracticeMode && isGameLost}
        isHardMode={isHardMode}
        guesses={guesses}
        showAlert={showAlert}
      />
    </div>
  );
}

export default App;
