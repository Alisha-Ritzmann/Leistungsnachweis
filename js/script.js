// Data Wasser
async function loadHydroData() {
  const url = "https://api.existenz.ch/apiv1/hydro/latest?locations=2018";

  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error("Hydro API Fehler:", error);
    return false;
  }
}

// Data Wetter
async function loadWeatherData() {
  const latitude = 47.48;
  const longitude = 8.29;

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,rain,weather_code`;

  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error("Wetter API Fehler:", error);
    return false;
  }
}

function updateMesszeit(hydroData) {
  const messzeitElement = document.querySelector("#messzeit");

  if (!messzeitElement) return;

  const timestamp = hydroData.payload[0].timestamp;
  const datum = new Date(timestamp * 1000);

  const formatiertesDatum = datum.toLocaleDateString("de-CH");
  const formatierteZeit = datum.toLocaleTimeString("de-CH", {
    hour: "2-digit",
    minute: "2-digit"
  });

  messzeitElement.textContent =
    `Stand der Messung: ${formatiertesDatum}, ${formatierteZeit}`;
}

function updateSchwimmtypen(wassertemperatur) {
  const schwimmtypCards = document.querySelectorAll(".schwimmtyp-card");

  schwimmtypCards.forEach(card => {
    const type = card.dataset.type;
    const resultText = card.querySelector(".result-text");

    if (!resultText) return;

    if (type === "kalt") {
      if (wassertemperatur < 18) {
        resultText.textContent =
          `Die Wassertemperaturen von ${wassertemperatur.toFixed(1)}° sind heute perfekt für dich zum Schwimmen.`;
      } else {
        resultText.textContent =
          `Die Wassertemperaturen von ${wassertemperatur.toFixed(1)}° sind heute etwas warm für dich.`;
      }
    }

    if (type === "erfrischung") {
      if (wassertemperatur >= 18 && wassertemperatur <= 22) {
        resultText.textContent =
          `Die Wassertemperaturen von ${wassertemperatur.toFixed(1)}° sind heute perfekt für dich zum Schwimmen.`;
      } else if (wassertemperatur < 18) {
        resultText.textContent =
          `Die Wassertemperaturen von ${wassertemperatur.toFixed(1)}° sind heute etwas kalt für dich.`;
      } else {
        resultText.textContent =
          `Die Wassertemperaturen von ${wassertemperatur.toFixed(1)}° sind heute etwas warm für dich.`;
      }
    }

    if (type === "warm") {
      if (wassertemperatur > 22) {
        resultText.textContent =
          `Die Wassertemperaturen von ${wassertemperatur.toFixed(1)}° sind heute perfekt für dich zum Schwimmen.`;
      } else {
        resultText.textContent =
          `Die Wassertemperaturen von ${wassertemperatur.toFixed(1)}° sind heute etwas kalt für dich.`;
      }
    }
  });
}

async function showData() {
  const hydroData = await loadHydroData();
  const weatherData = await loadWeatherData();

  if (weatherData) {
    const lufttemperatur = weatherData.current.temperature_2m;

    document.querySelector("#lufttemperatur").textContent =
      `${lufttemperatur.toFixed(1)} °C`;

    document.querySelector("#box-lufttemperatur").textContent =
      `${lufttemperatur.toFixed(1)} °C`;
  }

  if (hydroData) {
    const wassertemperatur = hydroData.payload.find(item => item.par === "temperature");
    const wasserabfluss = hydroData.payload.find(item => item.par === "flow");

    document.querySelector("#wassertemperatur").textContent =
      `${wassertemperatur.val.toFixed(1)} °C`;

    document.querySelector("#wasserabfluss").textContent =
      `${wasserabfluss.val.toFixed(2)} m³/s`;

    document.querySelector("#box-wassertemperatur-wert").textContent =
      `${wassertemperatur.val.toFixed(1)} °C`;

    document.querySelector("#box-wasserabfluss-wert").textContent =
      `${wasserabfluss.val.toFixed(2)} m³/s`;

    updateMesszeit(hydroData);
    updateSchwimmtypen(wassertemperatur.val);
  }
}

function setupInfoBoxen() {
  const punkte = document.querySelectorAll(".punkt");
  const boxen = document.querySelectorAll(".info-box");
  const closeButtons = document.querySelectorAll(".close-box");

  punkte.forEach(punkt => {
    punkt.addEventListener("click", () => {
      const boxId = punkt.dataset.box;

      boxen.forEach(box => {
        box.classList.remove("aktiv");
      });

      document.querySelector(`#${boxId}`).classList.add("aktiv");
    });
  });

  closeButtons.forEach(button => {
    button.addEventListener("click", () => {
      button.parentElement.classList.remove("aktiv");
    });
  });
}

function setupSchwimmtypCards() {
  const schwimmtypCards = document.querySelectorAll(".schwimmtyp-card");

  schwimmtypCards.forEach(card => {
    card.addEventListener("click", async () => {
      await showData();
      card.classList.toggle("aktiv");
    });

    card.addEventListener("keydown", async event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();

        await showData();
        card.classList.toggle("aktiv");
      }
    });
  });
}

showData();
setupInfoBoxen();
setupSchwimmtypCards();