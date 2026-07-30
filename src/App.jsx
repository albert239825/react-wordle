import { useState, useEffect, useRef } from 'react';
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
  getWordOfIndex,
  formatPuzzleDate,
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
  const [stats, setStats] = useLocalStorage('gameStats', {
    winDistribution: Array.from(new Array(MAX_CHALLENGES), () => 0),
    gamesFailed: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalGames: 0,
    successRate: 0,
  });
  const [archiveGames, setArchiveGames] = useLocalStorage('archiveGames', {});
  const [currentGuess, setCurrentGuess] = useState('');
  const [dailyGuesses, setDailyGuesses] = useState(() => {
    if (boardState.solutionIndex !== solutionIndex) return [];
    return boardState.guesses;
  });
  // Index of the archived puzzle being played, null while playing today's
  const [archiveIndex, setArchiveIndex] = useState(null);
  const [archiveGuesses, setArchiveGuesses] = useState([]);
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
  const playedIndex = useRef(archiveIndex);

  const isArchive = archiveIndex !== null;
  const activeSolution = isArchive ? getWordOfIndex(archiveIndex) : solution;
  const guesses = isArchive ? archiveGuesses : dailyGuesses;
  const setGuesses = isArchive ? setArchiveGuesses : setDailyGuesses;

  // Show welcome modal
  useEffect(() => {
    if (!boardState.solutionIndex)
      setTimeout(() => setIsInfoModalOpen(true), 1000);
    // eslint-disable-next-line
  }, []);

  // Save boardState to localStorage
  useEffect(() => {
    setBoardState({
      guesses: dailyGuesses,
      solutionIndex,
    });
    // eslint-disable-next-line
  }, [dailyGuesses]);

  // Save archived games to localStorage, keeping them out of the daily board
  useEffect(() => {
    if (!isArchive) return;
    setArchiveGames({ ...archiveGames, [archiveIndex]: archiveGuesses });
    // eslint-disable-next-line
  }, [archiveGuesses, archiveIndex]);

  // Check game winning or losing
  useEffect(() => {
    const hasSwitchedPuzzle = playedIndex.current !== archiveIndex;
    playedIndex.current = archiveIndex;

    const isWon = guesses.includes(activeSolution.toUpperCase());
    const isLost = !isWon && guesses.length === MAX_CHALLENGES;

    setIsGameWon(isWon);
    setIsGameLost(isLost);

    // Only announce the result of a guess, not of a restored board
    if (hasSwitchedPuzzle || (!isWon && !isLost)) return;

    if (isWon) {
      setTimeout(() => showAlert('Well done', 'success'), ALERT_DELAY);
    } else {
      setTimeout(
        () => showAlert(`The word was ${activeSolution}`, 'error', true),
        ALERT_DELAY
      );
    }

    if (!isArchive)
      setTimeout(() => setIsStatsModalOpen(true), ALERT_DELAY + 1000);
    // eslint-disable-next-line
  }, [guesses, archiveIndex]);

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

  const handleSelectArchive = index => {
    setArchiveIndex(index);
    setArchiveGuesses(archiveGames[index] ?? []);
    setCurrentGuess('');
    setIsArchiveModalOpen(false);
  };

  const handleReturnToDaily = () => {
    setArchiveIndex(null);
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
        guesses,
        activeSolution
      );
      if (firstMissingReveal) {
        setIsJiggling(true);
        return showAlert(firstMissingReveal, 'error');
      }
    }

    // Archived games never affect the daily statistics
    if (!isArchive) {
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
        setIsInfoModalOpen={setIsInfoModalOpen}
        setIsStatsModalOpen={setIsStatsModalOpen}
        setIsSettingsModalOpen={setIsSettingsModalOpen}
        setIsArchiveModalOpen={setIsArchiveModalOpen}
      />
      <Alert />
      {isArchive && (
        <div className={styles.archiveBanner}>
          <span>
            Archive #{archiveIndex} &middot; {formatPuzzleDate(archiveIndex)}
          </span>
          <button onClick={handleReturnToDaily}>Back to today</button>
        </div>
      )}
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
      />
      <StatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        gameStats={stats}
        numberOfGuessesMade={isArchive ? 0 : guesses.length}
        isGameWon={!isArchive && isGameWon}
        isGameLost={!isArchive && isGameLost}
        isHardMode={isHardMode}
        guesses={dailyGuesses}
        showAlert={showAlert}
      />
      <ArchiveModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        archiveGames={archiveGames}
        archiveIndex={archiveIndex}
        onSelect={handleSelectArchive}
      />
    </div>
  );
}

export default App;
