import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSave, mergeWorldBest, dailyStreakFor } from './progression.mjs';

const defaults = {
  unlocked: 1, completed: [], best: {}, resume: 0, crystals: 0,
  ownedSkins: ['sky'], skin: 'sky', achievements: [],
  dailyStats: {}, dailyClaims: {}, dailyResults: {},
  guardiansDefeated: 0, playerName: 'Sky Explorer',
};

test('save normalisation clamps progression and removes duplicate or invalid worlds', () => {
  const save = normalizeSave({
    unlocked: 999, completed: [0, 0, 3, 40, -1, '2'],
    resume: 88, crystals: -20, guardiansDefeated: -4,
  }, defaults);
  assert.equal(save.unlocked, 40);
  assert.deepEqual(save.completed, [0, 3]);
  assert.equal(save.resume, 39);
  assert.equal(save.crystals, 0);
  assert.equal(save.guardiansDefeated, 0);
});

test('save normalisation rejects unowned skins and malformed records', () => {
  const save = normalizeSave({
    ownedSkins: ['sky', 'hacked-skin', 'sun', 'sun'],
    skin: 'shadow',
    best: { 0: { gems: 12, time: 90, stars: 8 }, 41: { gems: 99 } },
    playerName: '<bad>\u0000name',
  }, defaults);
  assert.deepEqual(save.ownedSkins, ['sky', 'sun']);
  assert.equal(save.skin, 'sky');
  assert.deepEqual(save.best, { 0: { gems: 12, time: 90, stars: 3 } });
  assert.equal(save.playerName, 'badname');
});

test('world best keeps the best gems, fastest time and highest star grade independently', () => {
  const record = mergeWorldBest(
    { gems: 48, time: 120, stars: 2 },
    { gems: 35, time: 98, stars: 3 },
  );
  assert.deepEqual(record, { gems: 48, time: 98, stars: 3 });
});

test('daily streak counts consecutive completed days and permits today to be unfinished', () => {
  const results = {
    '2026-11-12': { gems: 20 },
    '2026-11-13': { gems: 22 },
    '2026-11-14': { gems: 18 },
  };
  assert.equal(dailyStreakFor(results, '2026-11-14'), 3);
  assert.equal(dailyStreakFor(results, '2026-11-15'), 3);
  assert.equal(dailyStreakFor(results, '2026-11-17'), 0);
});

test('invalid daily dates do not produce a streak', () => {
  assert.equal(dailyStreakFor({ '2026-11-14': {} }, 'not-a-date'), 0);
});
