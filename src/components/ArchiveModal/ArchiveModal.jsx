import { useState } from 'react';
import classNames from 'classnames';
import Modal from 'components/Modal';
import { getWordOfIndex, formatPuzzleDate, solutionIndex } from 'lib/words';
import { MAX_CHALLENGES } from 'constants/settings';
import styles from './ArchiveModal.module.scss';

const PUZZLES_PER_PAGE = 30;

const isSolved = (index, guesses) =>
  Boolean(guesses) && guesses.includes(getWordOfIndex(index).toUpperCase());

const getResult = (index, guesses) => {
  if (!guesses || guesses.length === 0) return '';
  if (isSolved(index, guesses)) return `${guesses.length}/${MAX_CHALLENGES}`;
  if (guesses.length === MAX_CHALLENGES) return `X/${MAX_CHALLENGES}`;
  return 'In progress';
};

const ArchiveModal = ({
  isOpen,
  onClose,
  archiveGames,
  archiveIndex,
  onSelect,
}) => {
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PUZZLES_PER_PAGE);

  // Past puzzles only - today's puzzle stays in the daily game
  const puzzles = [];
  for (let i = solutionIndex - 1; i >= 0; i--) puzzles.push(i);

  const search = query.trim().toLowerCase();
  const matches = search
    ? puzzles.filter(
        index =>
          String(index).includes(search) ||
          formatPuzzleDate(index).toLowerCase().includes(search)
      )
    : puzzles;

  const handleQueryChange = event => {
    setQuery(event.target.value);
    setVisibleCount(PUZZLES_PER_PAGE);
  };

  return (
    <Modal title="Archive" isOpen={isOpen} onClose={onClose}>
      <h3 className={styles.desc}>
        Play a previous day&apos;s puzzle. Archived games are saved separately
        and do not count towards your statistics.
      </h3>
      <input
        className={styles.search}
        type="text"
        value={query}
        onChange={handleQueryChange}
        placeholder="Search by puzzle number or date"
        aria-label="Search by puzzle number or date"
      />
      <ul className={styles.list}>
        {matches.slice(0, visibleCount).map(index => {
          const guesses = archiveGames[index];
          const solved = isSolved(index, guesses);

          return (
            <li key={index}>
              <button
                className={classNames({
                  [styles.puzzle]: true,
                  [styles.active]: index === archiveIndex,
                })}
                onClick={() => onSelect(index)}
              >
                <span className={styles.number}>#{index}</span>
                <span className={styles.date}>{formatPuzzleDate(index)}</span>
                <span
                  className={classNames({
                    [styles.result]: true,
                    [styles.solved]: solved,
                  })}
                >
                  {getResult(index, guesses)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {matches.length === 0 && (
        <h3 className={styles.desc}>No puzzles found</h3>
      )}
      {visibleCount < matches.length && (
        <button
          className={styles.more}
          onClick={() => setVisibleCount(visibleCount + PUZZLES_PER_PAGE)}
        >
          Load more
        </button>
      )}
    </Modal>
  );
};

export default ArchiveModal;
