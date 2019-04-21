import "babel-polyfill";
import Chart from "chart.js";

//const currencyURL = "www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";
 const meteoURL = "/xml.meteoservice.ru/export/gismeteo/point/140.xml";
 let timesData = [];
 let temMinData = [];
 let temMaxData = [];
 let heatMinData = [];
 let heatMaxData = [];
async function loadCurrency() {
  const response = await fetch(meteoURL);
  const xmlTest = await response.text();
  const parser = new DOMParser();
  const currencyData = parser.parseFromString(xmlTest, "text/xml");
  const hour = currencyData.querySelectorAll("FORECAST[hour]");
  const temperature = currencyData.querySelectorAll("TEMPERATURE[max][min]");
  const heat = currencyData.querySelectorAll("HEAT[max][min]");
  for (let i = 0; i < hour.length; i++) {
    const hourTag = hour.item(i);
    timesData[i] = hourTag.getAttribute("hour");
    
    const temTagData = temperature.item(i);
    temMinData[i] = temTagData.getAttribute("min");
    temMaxData[i] = temTagData.getAttribute("max");
    
    const heatTagData = heat.item(i);
    heatMinData[i] = heatTagData.getAttribute("min");
    temMaxData[i] = heatTagData.getAttribute("max");
  }
}


const buttonBuild = document.getElementById("btn");
const canvasCtx = document.getElementById("out").getContext("2d");
buttonBuild.addEventListener("click", async function() {
  const currencyData = await loadCurrency();

  const chartConfig = {
    type: "line",

    data: {
      labels: timesData,
      datasets: [
        {
          label: "температура воздуха",
          backgroundColor: "rgb(255, 20, 20, 0.5)",
          borderColor: "rgb(200, 50, 20)",
          data: temMinData, temMaxData
        },
        {
          label: "температура воздуха по ощущениям",
          backgroundColor: "rgb(0, 255, 0, 0.5)",
          borderColor: "rgb(50, 200, 20)",
          data: heatMinData, heatMaxData
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
