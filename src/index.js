import "babel-polyfill";
import Chart from "chart.js";

const meteoURL = "/xml.meteoservice.ru/export/gismeteo/point/140.xml";

async function loadCurrency() {
  const response = await fetch(meteoURL);
  const xmlTest = await response.text();
  const parser = new DOMParser();
  const currencyData = parser.parseFromString(xmlTest, "text/xml");


  const Time = currencyData.getElementsByTagName("FORECAST");
  const realTemp = currencyData.getElementsByTagName("TEMPERATURE");
  const feltTemp = currencyData.getElementsByTagName("HEAT");  

  const hours = new Array();
  const realtemps = new Array();
  const felttepms = new Array();  

  for (let i = 0; i < Time.length; i++) {
     hours.push(Time[i].getAttribute("hour") + ":00");
     realtemps.push(realTemp[i].getAttribute("max"));
     felttepms.push(feltTemp[i].getAttribute("max"));
  }
  return {hours,realtemps,felttepms};
}

const buttonBuild = document.getElementById("btn");
const canvasCtx = document.getElementById("out").getContext("2d");

buttonBuild.addEventListener("click", async function() {
  const currencyData = await loadCurrency();
  const chartConfig = {
    type: "line",
    data: {
      labels: currencyData["hours"],
      datasets: [
        {
          label: "Реальная температура",
          backgroundColor: "rgba(255, 20, 20, 0.3)",
          borderColor: "rgb(180, 0, 0)",
          data: currencyData["realtemps"]
        },
        {
          label: "Ощущаемая температура",
          backgroundColor: "rgba(100, 20, 20, 0.3)",
          borderColor: "rgb(100, 100, 0)",
          data: currencyData["felttepms"]
        }
      ],
    },  
    options: {
      scales: {
        xAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Время',
          }
        }],
        yAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Температура, ℃'
          }
        }]
      }
    },

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