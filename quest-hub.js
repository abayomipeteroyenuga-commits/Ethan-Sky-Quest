(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));
  let lastSignature = '';
  let feedbackTimer;

  function feedback(message) {
    const node = $('hub-feedback');
    if (!node) return;
    node.textContent = message;
    node.classList.add('visible');
    clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => node.classList.remove('visible'), 2600);
  }

  function scrollToGame() {
    document.querySelector('.game')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function rankFor(completed) {
    if (completed >= 40) return 'Skybound Legend';
    if (completed >= 20) return 'Champion';
    if (completed >= 10) return 'Trailblazer';
    if (completed >= 3) return 'Wayfinder';
    return 'Rookie';
  }

  function render() {
    const api = window.ETHAN_QUEST;
    if (!api || typeof api.state !== 'function') return;
    const state = api.state();
    if (!state) return;

    const signature = JSON.stringify([
      state.crystals, state.completed, state.unlocked, state.guardiansDefeated,
      state.daily, state.missions, state.skins, state.achievements,
      state.regions, state.playerName, state.resume
    ]);
    if (signature === lastSignature) return;
    lastSignature = signature;

    $('hub-crystals').textContent = Number(state.crystals || 0).toLocaleString();
    $('hub-completed').textContent = state.completed + ' / 40';
    $('hub-unlocked').textContent = state.unlocked + (state.unlocked === 1 ? ' world unlocked' : ' worlds unlocked');
    $('hub-rank').textContent = rankFor(state.completed);
    $('hub-guardians').textContent = state.guardiansDefeated || 0;

    const playerName = $('player-name');
    if (document.activeElement !== playerName) playerName.value = state.playerName || 'Sky Explorer';

    $('resume-world').textContent = state.resumeName || 'First Flight';
    $('resume-region').textContent = (state.regions?.[Math.floor(state.resume / 5)]?.name || 'Sky Gardens').toUpperCase();
    $('resume-description').textContent = state.completed + ' worlds cleared. ' + (40 - state.completed) + ' more to explore.';
    $('journey-progress-bar').style.width = (state.completed / 40 * 100) + '%';
    $('journey-progress-label').textContent = state.completed + ' of 40 worlds complete';
    $('journey-percent').textContent = Math.round(state.completed / 40 * 100) + '%';

    const daily = state.daily || {};
    $('daily-title').textContent = 'World ' + String((daily.world || 0) + 1).padStart(2, '0') + ': ' + (daily.worldName || 'Daily Sky Trial');
    $('daily-description').textContent = 'A fresh route through ' + (daily.region || 'the skies') + '. Collect at least ' + (daily.goal || 18) + ' crystals and defeat the Guardian.';
    $('daily-date').textContent = 'TODAY · ' + (daily.date || '');
    $('daily-record').textContent = daily.best
      ? 'Your best: ' + daily.best.gems + ' crystals · ' + daily.best.time + ' sec'
      : 'No personal record yet';

    const missions = state.missions || [];
    $('mission-count').textContent = missions.filter(item => item.claimed).length + ' / 3 claimed';
    $('mission-list').innerHTML = missions.map(item => {
      const percent = Math.min(100, item.goal ? item.progress / item.goal * 100 : 0);
      const symbol = item.id === 'crystals' ? '◆' : item.id === 'guardian' ? '⚔' : '✦';
      const buttonText = item.claimed ? 'Claimed' : item.ready ? 'Claim' : 'In progress';
      return '<div class="mission-row">' +
        '<div class="mission-symbol">' + symbol + '</div>' +
        '<div class="mission-copy"><strong>' + esc(item.name) + '</strong><small>' + esc(item.description) + '</small>' +
        '<div class="mission-meter"><span style="width:' + percent + '%"></span></div>' +
        '<small>' + item.progress + ' / ' + item.goal + ' · +' + item.reward + ' crystals</small></div>' +
        '<button class="claim-button" data-claim="' + esc(item.id) + '" ' + (!item.ready || item.claimed ? 'disabled' : '') + '>' + buttonText + '</button></div>';
    }).join('');

    $('skin-list').innerHTML = (state.skins || []).map(item =>
      '<div class="skin-option ' + (item.equipped ? 'equipped' : '') + '">' +
      '<div class="skin-preview skin-' + esc(item.id) + '">✦</div>' +
      '<div class="skin-copy"><strong>' + esc(item.name) + '</strong><small>' + esc(item.description) + '</small>' +
      '<small>' + (item.owned ? 'Unlocked' : item.price + ' crystals') + '</small></div>' +
      '<button data-skin="' + esc(item.id) + '" ' + (item.equipped ? 'disabled' : '') + '>' +
      (item.equipped ? 'Equipped' : item.owned ? 'Equip' : 'Unlock') + '</button></div>'
    ).join('');

    $('region-list').innerHTML = (state.regions || []).map(region =>
      '<div class="region-row"><div class="region-name">' + esc(region.name) + '</div>' +
      '<div class="region-meter"><span style="width:' + (region.completed / region.total * 100) + '%"></span></div>' +
      '<div class="region-status">' + region.completed + '/' + region.total + '</div>' +
      '<div class="region-stars">' + region.worlds.map(world =>
        world.stars ? '★'.repeat(world.stars) : world.unlocked ? '○' : '·'
      ).join(' ') + '</div></div>'
    ).join('');

    const achievements = state.achievements || [];
    $('achievement-count').textContent = achievements.filter(item => item.unlocked).length + ' / ' + achievements.length;
    $('achievement-list').innerHTML = achievements.map(item =>
      '<div class="achievement-row ' + (item.unlocked ? 'unlocked' : 'locked') + '">' +
      '<span class="achievement-icon">' + (item.unlocked ? '✦' : '◇') + '</span>' +
      '<div><strong>' + esc(item.name) + '</strong><small>' + esc(item.description) + '</small></div>' +
      '<b>' + (item.unlocked ? 'UNLOCKED' : '+' + item.reward + ' ◆') + '</b></div>'
    ).join('');
  }

  function refresh() {
    lastSignature = '';
    render();
  }

  document.addEventListener('ethan-quest-update', render);
  $('continue-adventure').addEventListener('click', () => {
    window.ETHAN_QUEST.continue();
    scrollToGame();
  });
  $('open-world-map').addEventListener('click', () => {
    window.ETHAN_QUEST.openWorlds();
    scrollToGame();
  });
  $('region-world-map').addEventListener('click', () => {
    window.ETHAN_QUEST.openWorlds();
    scrollToGame();
  });
  $('start-daily').addEventListener('click', () => {
    window.ETHAN_QUEST.startDaily();
    scrollToGame();
  });
  $('daily-shortcut').addEventListener('click', () => {
    window.ETHAN_QUEST.startDaily();
    scrollToGame();
  });
  $('hub-shortcut').addEventListener('click', () => {
    $('quest-hub').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('save-player-name').addEventListener('click', () => {
    feedback(window.ETHAN_QUEST.savePlayerName($('player-name').value).message);
  });
  $('player-name').addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      $('save-player-name').click();
    }
  });
  $('mission-list').addEventListener('click', event => {
    const button = event.target.closest('[data-claim]');
    if (!button) return;
    const result = window.ETHAN_QUEST.claimDailyMission(button.dataset.claim);
    feedback(result.message);
    refresh();
  });
  $('skin-list').addEventListener('click', event => {
    const button = event.target.closest('[data-skin]');
    if (!button) return;
    const result = window.ETHAN_QUEST.buySkin(button.dataset.skin);
    feedback(result.message);
    refresh();
  });
  render();
})();
