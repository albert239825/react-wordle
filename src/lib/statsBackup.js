import { solutionIndex } from 'lib/words';

export const BACKUP_VERSION = 1;

// localStorage keys included in a stats backup
const BACKUP_KEYS = ['gameStats', 'boardState'];

export const buildBackup = () => {
  const data = {};
  BACKUP_KEYS.forEach(key => {
    const item = window.localStorage.getItem(key);
    if (item !== null) {
      data[key] = JSON.parse(item);
    }
  });

  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };
};

export const downloadBackup = () => {
  const backup = buildBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `wordle-stats-backup-${solutionIndex}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const isValidGameStats = stats => {
  if (!stats || typeof stats !== 'object') return false;
  const numberFields = [
    'gamesFailed',
    'currentStreak',
    'bestStreak',
    'totalGames',
    'successRate',
  ];
  const hasNumbers = numberFields.every(
    field => typeof stats[field] === 'number'
  );
  const hasWinDistribution =
    Array.isArray(stats.winDistribution) &&
    stats.winDistribution.every(value => typeof value === 'number');

  return hasNumbers && hasWinDistribution;
};

export const parseBackup = raw => {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error('The file is not valid JSON');
  }

  // Accept either the wrapped backup shape or a bare data object
  const data = parsed && parsed.data ? parsed.data : parsed;

  if (!data || typeof data !== 'object') {
    throw new Error('The backup does not contain any data');
  }

  if (!isValidGameStats(data.gameStats)) {
    throw new Error('The backup does not contain valid statistics');
  }

  return data;
};
