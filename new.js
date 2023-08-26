"use strict";

const blessed = require("blessed");
const contrib = require("blessed-contrib");

const screen = blessed.screen();

const grid = new contrib.grid({ rows: 12, cols: 12, screen });

const initializeWidgets = () => {
  const donut = initializeDonut();
  const gauge = initializeGauge();
  const gaugeTwo = initializeGaugeTwo();
  const sparkline = initializeSparkline();
  //... initialize other widgets

  var gauge_percent = 0;
  setInterval(function () {
    gauge.setData([gauge_percent, 100 - gauge_percent]);
    gauge_percent++;
    if (gauge_percent >= 100) gauge_percent = 0;
  }, 200);

  var gauge_percent_two = 0;
  setInterval(function () {
    gauge_two.setData(gauge_percent_two);
    gauge_percent_two++;
    if (gauge_percent_two >= 100) gauge_percent_two = 0;
  }, 200);

  //set dummy data on bar chart
  function fillBar() {
    var arr = [];
    for (var i = 0; i < servers.length; i++) {
      arr.push(Math.round(Math.random() * 10));
    }
    bar.setData({ titles: servers, data: arr });
  }
  fillBar();
  setInterval(fillBar, 2000);

  //... other dummy data and events

  return { donut, gauge, gaugeTwo, sparkline /* ... other widgets */ };
};

const initializeDonut = () => {
  return grid.set(8, 8, 4, 2, contrib.donut, {
    label: "Percent Donut",
    radius: 16,
    arcWidth: 4,
    yPadding: 2,
    data: [{ label: "Storage", percent: 87 }],
  });
};

const initializeGauge = () => {
  return grid.set(8, 10, 2, 2, contrib.gauge, { label: "Storage", percent: [80, 20] });
};

const initializeGaugeTwo = () => {
  return grid.set(2, 9, 2, 3, contrib.gauge, { label: "Deployment Progress", percent: 80 });
};

const initializeSparkline = () => {
  return grid.set(10, 10, 2, 2, contrib.sparkline, {
    label: "Throughput (bits/sec)",
    tags: true,
    style: { fg: "blue", titleFg: "white" },
  });
};

const initializeBar = () => {
  return grid.set(4, 6, 4, 3, contrib.bar, { label: "Server Utilization (%)", barWidth: 4, barSpacing: 6, xOffset: 2, maxHeight: 9 });
};

const initializeTable = () => {
  return grid.set(4, 9, 4, 3, contrib.table, { keys: true, fg: "green", label: "Active Processes", columnSpacing: 1, columnWidth: [24, 10, 10] });
};

const initializeLCD = () => {
  return grid.set(0, 9, 2, 3, contrib.lcd, {
    label: "LCD Test",
    segmentWidth: 0.06,
    segmentInterval: 0.11,
    strokeWidth: 0.1,
    elements: 5,
    display: 3210,
    elementSpacing: 4,
    elementPadding: 2,
  });
};

const setupDummyData = () => {
  // Code for setting up dummy data
};

const setLineData = (data, line) => {
  line.setData(data);
};

const main = () => {
  const { donut, gauge, gaugeTwo, sparkline } = initializeWidgets();

  // Code to update your widgets with real or dummy data
  // Example: setLineData(data, transactionsLine);

  screen.key(["escape", "q", "C-c"], function (ch, key) {
    return process.exit(0);
  });

  screen.on("resize", function () {
    donut.emit("attach");
    gauge.emit("attach");
    gauge_two.emit("attach");
    sparkline.emit("attach");
    bar.emit("attach");
    table.emit("attach");
    lcdLineOne.emit("attach");
    errorsLine.emit("attach");
    transactionsLine.emit("attach");
    map.emit("attach");
    log.emit("attach");
  });

  screen.render();
};

main();
