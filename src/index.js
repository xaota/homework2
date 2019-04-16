import "babel-polyfill";
import Chart from "chart.js";

const currencyURL = "www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";
// const meteoURL = "/xml.meteoservice.ru/export/gismeteo/point/140.xml";

async function loadCurrency() {
  const response = await fetch(currencyURL);
  const xmlTest = await response.text();
  const parser = new DOMParser();
  const currencyData = parser.parseFromString(xmlTest, "text/xml");
  // <Cube currency="USD" rate="1.1321" />
  const rates = currencyData.querySelectorAll("Cube[currency][rate]");
  const result = Object.create(null);
  for (let i = 0; i < rates.length; i++) {
    const rateTag = rates.item(i);
    const rate = rateTag.getAttribute("rate");
    const currency = rateTag.getAttribute("currency");
    result[currency] = rate;
  }
  result["EUR"] = 1;
  // result["RANDOM"] = 1 + Math.random();
  return result;
}

function normalizeDataByCurrency(data, currency) {
  const result = Object.create(null);
  const value = data[currency];
  for (const key of Object.keys(data)) {
    result[key] = value / data[key];
  }
  return result;
}

const buttonBuild = document.getElementById("btn");
const canvasCtx = document.getElementById("out").getContext("2d");
buttonBuild.addEventListener("click", async function() {
  const currencyData = await loadCurrency();
  const normalData = normalizeDataByCurrency(currencyData, "RUB");
  const keys = Object.keys(normalData).sort((k1, k2) =>
    compare(normalData[k1], normalData[k2])
  );
  const plotData = keys.map(key => normalData[key]);

  const chartConfig = {
    type: "line",

    data: {
      labels: keys,
      datasets: [
        {
          label: "Стоимость валюты в рублях",
          backgroundColor: "rgb(255, 20, 20)",
          borderColor: "rgb(180, 0, 0)",
          data: plotData
        }
      ]
    }
  };

  if (window.chart) {
    chart.data.labels = chartConfig.data.labels;
    chart.data.datasets[0].data = chartConfig.data.datasets[0].data;
    chart.update({
      duration: 800,
      easing: "easeOutBounce"
    });
  } else {
    window.chart = new Chart(canvasCtx, chartConfig);
  }
});

function compare(a, b) {
  if (a > b) return 1;
  if (a < b) return -1;
  return 0;
}
