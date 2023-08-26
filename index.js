#!/usr/bin/env node

const axios = require("axios");
const blessed = require("blessed");
const { saveToCache, readFromCache } = require("./core/cacheUtils");
const { formatData, getYearProgress, fmt, ex, fmt_prct, fmt_pct } = require("./core/helpers");

const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // Cache for 7 days

// Create a blessed screen
const screen = blessed.screen({
  smartCSR: true,
});

// Create a text box to display the stats
const box = blessed.text({
  top: "center",
  left: "center",
  width: "90%",
  height: "90%",
  tags: true,
  content: "Fetching data...",
});

screen.append(box);

// Quit on `q`, or `Control-C` when focused
screen.key(["q", "C-c"], function (ch, key) {
  return process.exit(0);
});

screen.key(["right", "left"], function (ch, key) {
  pageNum = (pageNum + 1) % 2;
});

async function fetchAllData() {
  const cachedData = readFromCache();

  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    return cachedData.data;
  }

  const year = new Date().getFullYear();
  const projections_large = await axios.get("https://data.macrocosm.so/api/v0/projections-large");
  const all_time_humans = await axios.get(`https://data.macrocosm.so/api/v1/all-time-human-population/${year}`);
  const population_per_location = await axios.get("https://data.macrocosm.so/api/v1/UN/all-population-data");
  const global_energy = await axios.get(`https://data.macrocosm.so/api/v1/energy/projection/${year}`);

  const result = {
    ...projections_large.data,
    AllTimePopulation: all_time_humans.data,
    LocationPopulation: population_per_location.data,
    GlobalEnergy: global_energy.data,
  };

  saveToCache(result);

  return result;
}

let pageNum = 0;

async function displayStats() {
  const rawData = await fetchAllData();
  const projections = formatData(rawData);
  const yearProgress = getYearProgress();

  page1 = [
    `{bold}{#7900fa-fg}The Anthropocene started{/#7900fa-fg} {#7900fa-fg}1${new Date().getFullYear()}{/#7900fa-fg} {#7900fa-fg}years ago.{/#7900fa-fg}{/bold}`,
    // `{#ffe800-fg}Year Progress:{/#ffe800-fg} {bold}{#e60f00-fg}${fmt_pct(yearProgress * 100, 7)}{/#e60f00-fg}{/bold}`,
    `{#ffe800-fg}Total World Population:{/#ffe800-fg} {bold}{#e60f00-fg}${fmt(
      ex(projections.population.thisYear, projections.population.nextYear, yearProgress),
      2
    )}{/#e60f00-fg}{/bold} {#ffe800-fg}humans.{/#ffe800-fg}`,
    // `{#ffe800-fg}Total Deceased Population:{/#ffe800-fg} {bold}{#e60f00-fg}${fmt(
    //   ex(projections.deceased.thisYear, projections.deceased.nextYear, yearProgress),
    //   2
    // )}{/#e60f00-fg}{/bold} {#ffe800-fg}humans.{/#ffe800-fg}`,
    `{#ffe800-fg}All-Time World Population:{/#ffe800-fg} {bold}{#e60f00-fg}${fmt(
      ex(projections.alltimepopulation.thisYear, projections.alltimepopulation.nextYear, yearProgress),
      2
    )}{/#e60f00-fg}{/bold} {#ffe800-fg}humans.{/#ffe800-fg}`,
    `{#ffe800-fg}% of Humans Alive Today:{/#ffe800-fg} {bold}{#e60f00-fg}${fmt_prct(
      ex(projections.percentAlive.thisYear, projections.percentAlive.nextYear, yearProgress) * 100,
      10
    )}{/#e60f00-fg}{/bold} {#ffe800-fg}of all humans, ever.{/#ffe800-fg}`,
    `{#ffe800-fg}Global Energy Consumption:{/#ffe800-fg} {bold}{#e60f00-fg}${fmt(
      ex(rawData.GlobalEnergy.currentCnsmValue, rawData.GlobalEnergy.nextCnsmValue, yearProgress),
      8
    )}{/#e60f00-fg}{/bold} {#ffe800-fg}terawatt-hours.{/#ffe800-fg}`,
    `{#ffe800-fg}Global Energy Production:{/#ffe800-fg} {bold}{#e60f00-fg}${fmt(
      ex(rawData.GlobalEnergy.currentPgdisValue, rawData.GlobalEnergy.nextPgdisValue, yearProgress),
      8
    )}{/#e60f00-fg}{/bold} {#ffe800-fg}quadrillion BTU.{/#ffe800-fg}`,
  ];

  page2 = [
    `{bold}{#7900fa-fg}We have {/#7900fa-fg}{#7900fa-fg}1${
      25000 - new Date().getFullYear()
    }{/#7900fa-fg} {#7900fa-fg}years before the next ice age.{/#7900fa-fg}{/bold}`,
    `{#ffe800-fg}Year Progress:{/#ffe800-fg} {bold}{#e60f00-fg}${fmt_pct(yearProgress * 100, 7)}{/#e60f00-fg}{/bold} {#ffe800-fg}of the year.{/#ffe800-fg}`,
    `{#ffe800-fg}Humans Births:{/#ffe800-fg} {bold}{#e60f00-fg}${fmt(
      ex(0, projections.births.nextYear, yearProgress),
      2
    )}{/#e60f00-fg}{/bold} {#ffe800-fg}born this year.{/#ffe800-fg}`,
    `{#ffe800-fg}Humans Deaths:{/#ffe800-fg} {bold}{#e60f00-fg}${fmt(
      ex(0, projections.deaths.nextYear, yearProgress),
      2
    )}{/#e60f00-fg}{/bold} {#ffe800-fg}died this year.{/#ffe800-fg}`,
    `{#ffe800-fg}Energy Consumption:{/#ffe800-fg} {bold}{#e60f00-fg}${fmt(
      ex(0, rawData.GlobalEnergy.nextCnsmValue, yearProgress),
      8
    )}{/#e60f00-fg}{/bold} {#ffe800-fg}terawatt-hours spent.{/#ffe800-fg}`,
    `{#ffe800-fg}Energy Production:{/#ffe800-fg} {bold}{#e60f00-fg}${fmt(
      ex(0, rawData.GlobalEnergy.nextPgdisValue, yearProgress),
      8
    )}{/#e60f00-fg}{/bold} {#ffe800-fg}quadrillion BTU created.{/#ffe800-fg}`,
  ];

  const lines = pageNum == 0 ? page1 : page2;

  // Remove the formatting tags for proper calculation
  const strippedLines = lines.map((line) => line.replace(/{.*?}/g, ""));

  // Join the lines to create the content
  const content = lines.join("\n");

  // Calculate the width and height of the content
  const contentWidth = Math.max(...strippedLines.map((line) => line.length));
  const contentHeight = lines.length;

  // Calculate the top and left positions to center the box
  const top = Math.max(0, Math.floor((screen.height - contentHeight) / 2));
  const left = Math.max(0, Math.floor((screen.width - contentWidth) / 2));

  box.setContent(content);
  box.width = contentWidth + 4; // Added some padding
  box.height = contentHeight + 4; // Added some padding
  box.top = top;
  box.left = left;

  // Draw screen
  screen.render();
}
// Initialize
displayStats().then(() => {
  setInterval(displayStats, 100);
});

const setTerminalTitle = (title) => {
  process.stdout.write(String.fromCharCode(27) + "]0;" + title + String.fromCharCode(7));
};

function titleLoop() {
  const titles = ["My name is Ozymandias, King of Kings;", "Look on my Works, ye Mighty, and despair!", "data.macrocosm.so"];
  let i = 0;
  setInterval(() => {
    setTerminalTitle(titles[i]);
    i = (i + 1) % titles.length;
  }, 10000);
}

titleLoop();
