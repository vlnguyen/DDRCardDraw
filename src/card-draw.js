import { times } from "./utils";

/**
 * @typedef {Object} DrawnChart
 * @property {string} name
 * @property {string} jacket
 * @property {string} nameTranslation
 * @property {string} artist
 * @property {string} artistTranslation
 * @property {string} bpm
 * @property {number} difficulty
 * @property {string} level
 * @property {boolean} hasShock
 * @property {string} abbreviation
 */

/**
 * @return {DrawnChart}
 */
export function getDrawnChart(currentSong, chart, difficultyKey, abbreviation) {
  return {
    name: currentSong.name,
    jacket: currentSong.jacket,
    nameTranslation: currentSong.name_translation,
    artist: currentSong.artist,
    artistTranslation: currentSong.artist_translation,
    bpm: currentSong.bpm,
    difficulty: difficultyKey,
    level: chart.difficulty,
    hasShock: parseInt(chart.shock, 10) > 0,
    abbreviation
  };
}

/**
 * Used to give each drawing an auto-incrementing id
 */
let drawingID = 0;

/**
 * @typedef {Object} Drawing
 * @property {number} id
 * @property {DrawnChart[]} charts
 * @property {Array<{ player: 1 | 2, chartIndex: number }>} bans
 * @property {Array<{ player: 1 | 2, chartIndex: number }>} protects
 * @property {Array<{ player: 1 | 2, chartIndex: number, pick: DrawnChart }>} pocketPicks
 */

/**
 * Produces a drawn set of charts given the song data and the user
 * input of the html form elements.
 * @param {Array<{}>} songs The song data (see `src/songs/`)
 * @param {FormData} configData the data gathered by all form elements on the page, indexed by `name` attribute
 * @return {Drawing}
 */
export function draw(songs, configData) {
  const numChartsToRandom = parseInt(configData.get("chartCount"), 10);
  const upperBound = parseInt(configData.get("upperBound"), 10);
  const lowerBound = parseInt(configData.get("lowerBound"), 10);
  const abbreviations = JSON.parse(configData.get("abbreviations"));
  const style = configData.get("style");
  // requested difficulties
  const difficulties = new Set(configData.getAll("difficulties"));
  // other options: usLocked, extraExclusive, removed, unlock
  const inclusions = new Set(configData.getAll("inclusions"));

  /**
   * @type {Record<string, Array<DrawnChart>>}
   */
  const validCharts = {};
  times(19, n => {
    validCharts[n.toString()] = [];
  });

  for (const currentSong of songs) {
    const charts = currentSong[style];
    // song-level filters
    if (
      (!inclusions.has("usLocked") && currentSong["us_locked"]) ||
      (!inclusions.has("extraExclusive") && currentSong["extra_exclusive"]) ||
      (!inclusions.has("removed") && currentSong["removed"]) ||
      (!inclusions.has("tempUnlock") && currentSong["temp_unlock"]) ||
      (!inclusions.has("unlock") && currentSong["unlock"]) ||
      (!inclusions.has("goldExclusive") && currentSong["gold_exclusive"])
    ) {
      continue;
    }

    for (const key in charts) {
      const chart = charts[key];

      // chart-level filters
      if (
        !chart || // no chart for difficulty
        !difficulties.has(key) || // don't want this difficulty
        (!inclusions.has("unlock") && chart["unlock"]) || // chart must be individually unlocked
        (!inclusions.has("usLocked") && chart["us_locked"]) || // chart is locked for us
        (!inclusions.has("extraExclusive") && chart["extra_exclusive"]) || // chart is extra/final exclusive
        +chart.difficulty < lowerBound || // too easy
        +chart.difficulty > upperBound // too hard
      ) {
        continue;
      }

      // add chart to deck
      validCharts[chart.difficulty].push(
        getDrawnChart(currentSong, chart, key, abbreviations[key])
      );
    }
  }

  const weighted = !!configData.get("weighted");
  const limitOutliers = !!configData.get("limitOutliers");
  /**
   * the "deck" of difficulty levels to pick from
   * @type {Array<number>}
   */
  let distribution = [];
  /**
   * Total amount of weight used, so we can determine expected outcome below
   */
  let totalWeights = 0;
  /**
   * The number of charts we can expect to draw of each level
   * @type {Record<string, number>}
   */
  const expectedDrawPerLevel = {};

  // build an array of possible levels to pick from
  for (let level = lowerBound; level <= upperBound; level++) {
    let weightAmount = 0;
    if (weighted) {
      weightAmount = parseInt(configData.get(`weight-${level}`), 10);
      expectedDrawPerLevel[level.toString()] = weightAmount;
      totalWeights += weightAmount;
    } else {
      weightAmount = validCharts[level.toString()].length;
    }
    times(weightAmount, () => distribution.push(level));
  }

  // If custom weights are used, expectedDrawsPerLevel[level] will be the maximum number
  // of cards of that level allowed in the card draw.
  // e.g. For a 5-card draw, we increase the cap by 1 at every 100%/5 = 20% threshold,
  // so a level with a weight of 15% can only show up on at most 1 card, a level with
  // a weight of 30% can only show up on at most 2 cards, etc.
  if (weighted && limitOutliers) {
    for (let level = lowerBound; level <= upperBound; level++) {
      let normalizedWeight =
        expectedDrawPerLevel[level.toString()] / totalWeights;
      expectedDrawPerLevel[level] = Math.ceil(
        normalizedWeight * numChartsToRandom
      );
    }
  }

  const drawnCharts = [];
  /**
   * Record of how many songs of each difficulty have been drawn so far
   * @type {Record<string, number>}
   */
  const difficultyCounts = {};

  while (drawnCharts.length < numChartsToRandom) {
    if (distribution.length === 0) {
      // no more songs available to pick in the requested range
      // will be returning fewer than requested number of charts
      break;
    }

    // first pick a difficulty
    const chosenDifficulty =
      distribution[Math.floor(Math.random() * distribution.length)];
    const selectableCharts = validCharts[chosenDifficulty.toString()];
    const randomIndex = Math.floor(Math.random() * selectableCharts.length);
    const randomChart = selectableCharts[randomIndex];

    if (randomChart) {
      drawnCharts.push(randomChart);
      // remove drawn chart so it cannot be re-drawn
      selectableCharts.splice(randomIndex, 1);
      if (!difficultyCounts[chosenDifficulty]) {
        difficultyCounts[chosenDifficulty] = 1;
      } else {
        difficultyCounts[chosenDifficulty]++;
      }
    }

    // check if maximum number of expected occurrences of this level of chart has been reached
    const reachedExpected =
      limitOutliers &&
      difficultyCounts[chosenDifficulty.toString()] ===
      expectedDrawPerLevel[chosenDifficulty.toString()];

    if (selectableCharts.length === 0 || reachedExpected) {
      // can't pick any more songs of this difficulty
      distribution = distribution.filter(n => n !== chosenDifficulty);
    }
  }

  drawingID += 1;
  return {
    id: drawingID,
    charts: drawnCharts,
    bans: [],
    protects: [],
    pocketPicks: []
  };
}

/**
 * Produces a drawn set of charts given the song data and the user
 * input of the html form elements. However, instead of drawing from
 * the entire library of songs, the only charts avaialable will be
 * those that were populated by the song pool builder.
 * @param {Array<{}>} songs The song data (see `src/songs/`)
 * @param {Array<{}>} playerPicks The song data populated by the song pool builder.
 * @param {FormData} configData the data gathered by all form elements on the page, indexed by `name` attribute
 * @return {Drawing}
 */
export function drawFromSongPool(songs, songPool, configData) {
  const numChartsToRandom = parseInt(configData.get("chartCount"), 10);
  const upperBound = parseInt(configData.get("upperBound"), 10);
  const lowerBound = parseInt(configData.get("lowerBound"), 10);
  const abbreviations = JSON.parse(configData.get("abbreviations"));
  const style = configData.get("style");
  // requested difficulties
  const difficulties = new Set(configData.getAll("difficulties"));
  // other options: usLocked, extraExclusive, removed, unlock
  const inclusions = new Set(configData.getAll("inclusions"));

  /**
   * @type {Record<string, Array<DrawnChart>>}
   */
  const validCharts = {};
  times(19, n => {
    validCharts[n.toString()] = [];
  });

  // For every set of charts submitted by players
  for (const playerPicks of songPool) {
    // For every chart that the player picked
    for (const playerPickedChart of playerPicks.charts) {
      // Find the song that the chart was selected from
      const currentSong = songs.filter(song => song.name === playerPickedChart.name && song.artist === playerPickedChart.artist)[0];

      // song-level filters
      if (
        (!inclusions.has("usLocked") && currentSong["us_locked"]) ||
        (!inclusions.has("extraExclusive") && currentSong["extra_exclusive"]) ||
        (!inclusions.has("removed") && currentSong["removed"]) ||
        (!inclusions.has("tempUnlock") && currentSong["temp_unlock"]) ||
        (!inclusions.has("unlock") && currentSong["unlock"]) ||
        (!inclusions.has("goldExclusive") && currentSong["gold_exclusive"])
      ) {
        continue;
      }

      // use the difficulty from the selected chart to pull 
      // the matching chart from the song that the chart came from
      const chartFromSong = currentSong[style][playerPickedChart.difficulty];
      // chart-level filters
      if (
        !chartFromSong || // no chart for difficulty
        !difficulties.has(playerPickedChart.difficulty) || // don't want this difficulty
        (!inclusions.has("unlock") && chartFromSong["unlock"]) || // chart must be individually unlocked
        (!inclusions.has("usLocked") && chartFromSong["us_locked"]) || // chart is locked for us
        (!inclusions.has("extraExclusive") && chartFromSong["extra_exclusive"]) || // chart is extra/final exclusive
        +chartFromSong.difficulty < lowerBound || // too easy
        +chartFromSong.difficulty > upperBound // too hard
      ) {
        continue;
      }

      // add chart to deck
      const drawnChart = getDrawnChart(
        currentSong,
        chartFromSong,
        playerPickedChart.difficulty,
        abbreviations[playerPickedChart.difficulty]
      );
      // mark the chart with the player that picked it
      drawnChart.playerName = playerPicks.playerName;
      // push the chart onto the list of valid charts
      validCharts[chartFromSong.difficulty].push(drawnChart);
    }
  }

  const weighted = !!configData.get("weighted");
  const limitOutliers = !!configData.get("limitOutliers");
  /**
   * the "deck" of difficulty levels to pick from
   * @type {Array<number>}
   */
  let distribution = [];
  /**
   * Total amount of weight used, so we can determine expected outcome below
   */
  let totalWeights = 0;
  /**
   * The number of charts we can expect to draw of each level
   * @type {Record<string, number>}
   */
  const expectedDrawPerLevel = {};

  // build an array of possible levels to pick from
  for (let level = lowerBound; level <= upperBound; level++) {
    let weightAmount = 0;
    if (weighted) {
      weightAmount = parseInt(configData.get(`weight-${level}`), 10);
      expectedDrawPerLevel[level.toString()] = weightAmount;
      totalWeights += weightAmount;
    } else {
      weightAmount = validCharts[level.toString()].length;
    }
    times(weightAmount, () => distribution.push(level));
  }

  // If custom weights are used, expectedDrawsPerLevel[level] will be the maximum number
  // of cards of that level allowed in the card draw.
  // e.g. For a 5-card draw, we increase the cap by 1 at every 100%/5 = 20% threshold,
  // so a level with a weight of 15% can only show up on at most 1 card, a level with
  // a weight of 30% can only show up on at most 2 cards, etc.
  if (weighted && limitOutliers) {
    for (let level = lowerBound; level <= upperBound; level++) {
      let normalizedWeight =
        expectedDrawPerLevel[level.toString()] / totalWeights;
      expectedDrawPerLevel[level] = Math.ceil(
        normalizedWeight * numChartsToRandom
      );
    }
  }

  const drawnCharts = [];
  /**
   * Record of how many songs of each difficulty have been drawn so far
   * @type {Record<string, number>}
   */
  const difficultyCounts = {};

  while (drawnCharts.length < numChartsToRandom) {
    if (distribution.length === 0) {
      // no more songs available to pick in the requested range
      // will be returning fewer than requested number of charts
      break;
    }

    // first pick a difficulty
    const chosenDifficulty =
      distribution[Math.floor(Math.random() * distribution.length)];
    const selectableCharts = validCharts[chosenDifficulty.toString()];
    const randomIndex = Math.floor(Math.random() * selectableCharts.length);
    const randomChart = selectableCharts[randomIndex];

    if (randomChart) {
      drawnCharts.push(randomChart);
      // remove drawn chart so it cannot be re-drawn
      selectableCharts.splice(randomIndex, 1);
      if (!difficultyCounts[chosenDifficulty]) {
        difficultyCounts[chosenDifficulty] = 1;
      } else {
        difficultyCounts[chosenDifficulty]++;
      }
    }

    // check if maximum number of expected occurrences of this level of chart has been reached
    const reachedExpected =
      limitOutliers &&
      difficultyCounts[chosenDifficulty.toString()] ===
      expectedDrawPerLevel[chosenDifficulty.toString()];

    if (selectableCharts.length === 0 || reachedExpected) {
      // can't pick any more songs of this difficulty
      distribution = distribution.filter(n => n !== chosenDifficulty);
    }
  }

  drawingID += 1;
  return {
    id: drawingID,
    charts: drawnCharts,
    bans: [],
    protects: [],
    pocketPicks: []
  };
}