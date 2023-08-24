#!/usr/bin/env node

const axios = require('axios');
const clear = require('clear');
const { saveToCache, readFromCache } = require('./cacheUtils');
const { formatData, getYearProgress, fmt, ex, fmt_prct } = require('./helpers'); // We'll move your utility functions to a helper file.

const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // Cache for 7 days

async function fetchAllData() {
  const cachedData = readFromCache();
  
  if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
    return cachedData.data;
  }

  const year = new Date().getFullYear();
  const projections_large = await axios.get("https://macrocosm.fyi/v0/projections-large");
  const all_time_humans = await axios.get(`https://macrocosm.fyi/v1/all-time-human-population/${year}`);
  const population_per_location = await axios.get("https://macrocosm.fyi/v1/UN/all-population-data");
  
  const result = {
    ...projections_large.data,
    AllTimePopulation: all_time_humans.data,
    LocationPopulation: population_per_location.data
  };

  saveToCache(result);

  return result;
}


async function displayStats() {
  const rawData = await fetchAllData();
  const projections = formatData(rawData);
  const yearProgress = getYearProgress();

  clear();
  console.log(`Last Updated: ${new Date().toLocaleTimeString()}`);
  console.log(`Total World Population: ${fmt(ex(projections.population.thisYear, projections.population.nextYear, yearProgress), 2)} people.`);
  console.log(`Total Deceased Population: ${fmt(ex(projections.deceased.thisYear, projections.deceased.nextYear, yearProgress), 2)} people.`);
  console.log(`All-Time World Population: ${fmt(ex(projections.alltimepopulation.thisYear, projections.alltimepopulation.nextYear, yearProgress), 2)} people.`);
  console.log(`Percent of Total Humans Alive Today: ${fmt_prct(ex(projections.percentAlive.thisYear, projections.percentAlive.nextYear, yearProgress) * 100, 10)} of all humans who ever lived are alive today.`);
}

setInterval(displayStats, 50);  // Updates every 5 seconds
