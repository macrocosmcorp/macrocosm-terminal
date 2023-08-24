function getYearProgress() {
  const now = new Date();

  // Get date of beginning of year
  const thisYearDate = new Date(now.getFullYear(), 0, 1)

  // Get date of end of year
  const nextYear = new Date(now.getFullYear() + 1, 0, 1)

  // Get percentage of year
  return (now - thisYearDate) / (nextYear - thisYearDate);
}

function getDayProgress() {
  const now = new Date();

  // Get date of beginning of day
  const thisDayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0)
  return (now - thisDayDate) / (nextDay - thisDayDate);
}

function ex(start, end, percentage) {
  return (start + (end - start) * percentage)
}

function fmt(input, trunc = 0) {
  var n = input.toFixed(trunc)
  var parts=n.split(".");
  return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (parts[1] ? "." + parts[1] : "");
}

function fmt_pct_color(input, trunc = 0) {
  // Make decimal points grey

  return  `<span className="grey">Test</span>`;
}

function fmt_pct(input, trunc = 0) {
  return fmt(input, trunc) + "%";
}

function fmt_prct(input, trunc = 0) {
  var sign = input > 0 ? "+" : "-";
  return sign + fmt(input, trunc) + "%";
}

function fmt_prct_comp(input, trunc = 0) {
  var sign = input > 0 ? "+" : "-";
  var suffix = input > 0 ? "more" : "less";
  return sign + fmt(input, trunc) + "% " + suffix;
}

function formatData(raw) {
  const population = raw["TPopulation"].pairs.find(x => x.sex == "Both sexes" && x.variant == "Median")
  const births = raw["TBirths"].pairs.find(x => x.sex == "Both sexes" && x.variant == "Median")
  const deaths = raw["TDeaths"].pairs.find(x => x.sex == "Both sexes" && x.variant == "Median")
  const alltimepopulation = {
    thisYear: raw["AllTimePopulation"].result, 
    nextYear: raw["AllTimePopulation"].result + births.thisYear
  }
  const deceased = {
    thisYear: alltimepopulation.thisYear - population.thisYear, 
    nextYear: alltimepopulation.nextYear - population.nextYear, 
  }
  const percentAlive = {
    thisYear: population.thisYear / alltimepopulation.thisYear, 
    nextYear: population.nextYear / alltimepopulation.nextYear,
  }
  const popChange = {
    thisYear: births.thisYear - deaths.thisYear,
    nextYear: births.nextYear - deaths.nextYear,
  }
  const popRateOfChange = raw["NatChangeRT"].pairs.find(x => x.sex == "Both sexes" && x.variant == "Median")
  const popMen = raw["TPopulation"].pairs.find(x => x.sex == "Male" && x.variant == "Median")
  const popWomen = raw["TPopulation"].pairs.find(x => x.sex == "Female" && x.variant == "Median")
  const popMaleFemaleRatio = {
    thisYear: popMen.thisYear / popWomen.thisYear, 
    nextYear: popMen.nextYear / popWomen.nextYear,
  }
  const femaleBirths = raw["TBirths"].pairs.find(x => x.sex == "Female" && x.variant == "Median")
  const maleBirths = raw["TBirths"].pairs.find(x => x.sex == "Male" && x.variant == "Median")
  const sexRatioAtBirth = raw["SRB"].pairs.find(x => x.variant == "Median")
  const femaleDeaths = raw["TDeaths"].pairs.find(x => x.sex == "Female" && x.variant == "Median")
  const maleDeaths = raw["TDeaths"].pairs.find(x => x.sex == "Male" && x.variant == "Median")
  const maleLifeExpectancyBirth = raw["E0"].pairs.find(x => x.sex == "Male" && x.variant == "Median")
  const femaleLifeExpectancyBirth = raw["E0"].pairs.find(x => x.sex == "Female" && x.variant == "Median")
  const maleInfantMortality = raw["IMR"].pairs.find(x => x.sex == "Male" && x.variant == "Median")
  const femaleInfantMortality = raw["IMR"].pairs.find(x => x.sex == "Female" && x.variant == "Median")
  const maleUnder5Mortality = raw["U5MR"].pairs.find(x => x.sex == "Male" && x.variant == "Median")
  const femaleUnder5Mortality = raw["U5MR"].pairs.find(x => x.sex == "Female" && x.variant == "Median")
  const globalFertilityRate = raw["TFR5"].pairs.find(x => x.variant == "Median")
  const meanAgeOfChildbirth = raw["MAC5"].pairs.find(x => x.variant == "Median")
  // const womenUsingAnyContraception = raw["CPAnyP"].pairs.find(x => x.variant == "Median")
  const womenMarriedPop = raw["CURN15_49"].pairs.find(x => x.variant == "Median")
  const womenMarriedPercent = raw["CURP15_49"].pairs.find(x => x.variant == "Median")
  const womenMarriedPercent5YearArray = raw["CURP5Y"].pairs.filter(x => x.variant == "Median")
  const popMedianAge = raw["MedianAgePop"].pairs.find(x => x.sex == "Both sexes" && x.variant == "Median")
  const pop5YearArray = raw["PopByAge5AndSex"].pairs.filter(x => x.sex == "Both sexes" && x.variant == "Median")
  const pop5YearPercentArray = pop5YearArray.map(x => ({ ...x, thisYear: x.thisYear / population.thisYear, nextYear: x.nextYear / population.nextYear, }))
  const countryMedianData = raw["LocationPopulation"].map(x => ({...x, formattedPairs: null, ...x.formattedPairs.find(y => y.variant == "Median")}))
  const countryPopulationArray = countryMedianData.filter(x => x.type == 4)
  const regionPopulationArray = countryMedianData.filter(x => x.type == 2)
  
  return {
    population,
    alltimepopulation,
    deceased,
    percentAlive,
    births,
    deaths,
    popChange,
    popRateOfChange,
    popMen,
    popWomen,
    popMaleFemaleRatio,
    femaleBirths,
    maleBirths,
    sexRatioAtBirth,
    femaleDeaths,
    maleDeaths,
    maleLifeExpectancyBirth,
    femaleLifeExpectancyBirth,
    maleInfantMortality,
    femaleInfantMortality,
    maleUnder5Mortality,
    femaleUnder5Mortality,
    globalFertilityRate,
    meanAgeOfChildbirth,
    womenMarriedPop,
    womenMarriedPercent,
    womenMarriedPercent5YearArray,
    popMedianAge,
    pop5YearArray,
    pop5YearPercentArray,
    countryPopulationArray,
    regionPopulationArray
  }
}

module.exports = {
  getYearProgress,
  getDayProgress,
  ex,
  fmt,
  fmt_pct,
  fmt_prct,
  fmt_prct_comp,
  formatData,
}
