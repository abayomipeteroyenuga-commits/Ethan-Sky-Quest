const VALID_SKINS = new Set(['sky', 'sun', 'royal', 'shadow']);
const VALID_ACHIEVEMENTS = new Set([
  'first-world', 'region-master', 'warden-hunter', 'guardian-20', 'guardian-40',
  'crystal-keeper', 'skybound-legend',
  ...Array.from({ length: 8 }, (_, index) => 'region-' + index),
]);
const DAILY_MISSIONS = new Set(['crystals', 'guardian', 'finish']);
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

function safeInteger(value, fallback = 0, min = 0, max = Number.MAX_SAFE_INTEGER) {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, Math.floor(value))) : fallback;
}

function shiftDateKey(key, offset) {
  if (!DATE_KEY.test(key)) return '';
  const [year, month, day] = key.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + offset);
  return date.getFullYear() + '-' +
    String(date.getMonth() + 1).padStart(2, '0') + '-' +
    String(date.getDate()).padStart(2, '0');
}

export function weeklyTrialSpec(value = new Date()) {
  const input = value instanceof Date
    ? value.getFullYear() + '-' + String(value.getMonth() + 1).padStart(2, '0') + '-' + String(value.getDate()).padStart(2, '0')
    : typeof value === 'string' ? value : '';
  if (!DATE_KEY.test(input)) return { weekKey: '', seed: 0, worlds: [] };

  const [year, month, day] = input.split('-').map(Number);
  const monday = new Date(year, month - 1, day, 12, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const weekKey = monday.getFullYear() + '-' +
    String(monday.getMonth() + 1).padStart(2, '0') + '-' +
    String(monday.getDate()).padStart(2, '0');
  const seed = Number(weekKey.replace(/-/g, '')) >>> 0;
  const worlds = [];

  for (let index = 0; index < 3; index += 1) {
    let value = Math.imul(seed ^ Math.imul(index + 1, 0x9e3779b1), 0x85ebca6b) >>> 0;
    value ^= value >>> 16;
    value = Math.imul(value, 0xc2b2ae35) >>> 0;
    value = (value ^ (value >>> 13)) >>> 0;
    let world = value % 40;
    while (worlds.includes(world)) world = (world + 7) % 40;
    worlds.push(world);
  }

  return { weekKey, seed, worlds };
}

export function normalizeSave(value, defaults) {
  const raw = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const completed = [...new Set(
    (Array.isArray(raw.completed) ? raw.completed : [])
      .filter((world) => Number.isInteger(world) && world >= 0 && world < 40)
  )].sort((a, b) => a - b);

  const best = {};
  if (raw.best && typeof raw.best === 'object' && !Array.isArray(raw.best)) {
    for (const [key, record] of Object.entries(raw.best)) {
      const world = Number(key);
      if (!Number.isInteger(world) || world < 0 || world >= 40 || !record || typeof record !== 'object') continue;
      best[world] = {
        gems: safeInteger(record.gems, 0),
        time: Number.isFinite(record.time) && record.time >= 0 ? Math.round(record.time) : null,
        stars: safeInteger(record.stars, 0, 0, 3),
      };
    }
  }

  const ownedSkins = [...new Set([
    'sky',
    ...(Array.isArray(raw.ownedSkins) ? raw.ownedSkins.filter((skin) => VALID_SKINS.has(skin)) : []),
  ])];
  const skin = VALID_SKINS.has(raw.skin) && ownedSkins.includes(raw.skin) ? raw.skin : 'sky';

  const achievements = [...new Set(
    (Array.isArray(raw.achievements) ? raw.achievements : [])
      .filter((id) => typeof id === 'string' && VALID_ACHIEVEMENTS.has(id))
  )];

  const dailyStats = {};
  if (raw.dailyStats && typeof raw.dailyStats === 'object' && !Array.isArray(raw.dailyStats)) {
    for (const [date, stat] of Object.entries(raw.dailyStats)) {
      if (!DATE_KEY.test(date) || !stat || typeof stat !== 'object') continue;
      dailyStats[date] = {
        bestWorldGems: safeInteger(stat.bestWorldGems, 0),
        guardianDefeated: Boolean(stat.guardianDefeated),
        completedWorld: Boolean(stat.completedWorld),
        fastestWorldSeconds: Number.isFinite(stat.fastestWorldSeconds) && stat.fastestWorldSeconds >= 0
          ? Math.round(stat.fastestWorldSeconds) : null,
      };
    }
  }

  const dailyClaims = {};
  if (raw.dailyClaims && typeof raw.dailyClaims === 'object' && !Array.isArray(raw.dailyClaims)) {
    for (const [date, claims] of Object.entries(raw.dailyClaims)) {
      if (!DATE_KEY.test(date) || !Array.isArray(claims)) continue;
      dailyClaims[date] = [...new Set(claims.filter((id) => DAILY_MISSIONS.has(id)))];
    }
  }

  const dailyResults = {};
  if (raw.dailyResults && typeof raw.dailyResults === 'object' && !Array.isArray(raw.dailyResults)) {
    for (const [date, result] of Object.entries(raw.dailyResults)) {
      if (!DATE_KEY.test(date) || !result || typeof result !== 'object') continue;
      dailyResults[date] = {
        gems: safeInteger(result.gems, 0),
        time: Number.isFinite(result.time) && result.time >= 0 ? Math.round(result.time) : 0,
        stars: safeInteger(result.stars, 0, 0, 3),
        rewarded: Boolean(result.rewarded),
      };
    }
  }

  const bossRushRaw = raw.bossRush && typeof raw.bossRush === 'object' && !Array.isArray(raw.bossRush)
    ? raw.bossRush : {};
  const bossRush = {
    completedRuns: safeInteger(bossRushRaw.completedRuns, 0),
    bestTime: Number.isFinite(bossRushRaw.bestTime) && bossRushRaw.bestTime >= 0
      ? Math.round(bossRushRaw.bestTime) : null,
    bestGuardians: safeInteger(bossRushRaw.bestGuardians, 0, 0, 8),
  };

  const weeklyTrials = {};
  if (raw.weeklyTrials && typeof raw.weeklyTrials === 'object' && !Array.isArray(raw.weeklyTrials)) {
    for (const [week, record] of Object.entries(raw.weeklyTrials)) {
      if (!DATE_KEY.test(week) || !record || typeof record !== 'object') continue;
      weeklyTrials[week] = {
        completedRuns: safeInteger(record.completedRuns, 0),
        bestTime: Number.isFinite(record.bestTime) && record.bestTime >= 0
          ? Math.round(record.bestTime) : null,
        bestGems: safeInteger(record.bestGems, 0),
      };
    }
  }

  const playerName = typeof raw.playerName === 'string'
    ? raw.playerName.replace(/[<>\u0000-\u001f]/g, '').trim().slice(0, 18)
    : defaults.playerName;

  return {
    ...defaults,
    unlocked: safeInteger(raw.unlocked, defaults.unlocked, 1, 40),
    completed,
    best,
    resume: safeInteger(raw.resume, 0, 0, 39),
    crystals: safeInteger(raw.crystals, 0),
    ownedSkins,
    skin,
    achievements,
    dailyStats,
    dailyClaims,
    dailyResults,
    guardiansDefeated: safeInteger(raw.guardiansDefeated, 0),
    newGamePlus: safeInteger(raw.newGamePlus, 0, 0, 99),
    bossRush,
    weeklyTrials,
    playerName: playerName.length >= 2 ? playerName : defaults.playerName,
  };
}

export function mergeWorldBest(previous, current) {
  const old = previous && typeof previous === 'object' ? previous : {};
  const times = [old.time, current.time].filter((time) => Number.isFinite(time) && time >= 0);
  return {
    ...old,
    gems: Math.max(safeInteger(old.gems, 0), safeInteger(current.gems, 0)),
    time: times.length ? Math.min(...times.map(Math.round)) : null,
    stars: Math.max(safeInteger(old.stars, 0, 0, 3), safeInteger(current.stars, 0, 0, 3)),
  };
}

export function dailyStreakFor(results, today) {
  if (!DATE_KEY.test(today) || !results || typeof results !== 'object') return 0;
  let date = Object.prototype.hasOwnProperty.call(results, today) ? today : shiftDateKey(today, -1);
  let streak = 0;
  while (date && Object.prototype.hasOwnProperty.call(results, date)) {
    streak += 1;
    date = shiftDateKey(date, -1);
  }
  return streak;
}
