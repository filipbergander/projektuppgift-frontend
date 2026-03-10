"use strict";

let visualMap;
let marker;

addEventListener("DOMContentLoaded", () => {
    const countryInputEl = document.getElementById("country-name");
    const searchBtn = document.getElementById("search-button");
    const searchError = document.getElementById("country-error");

    visualMap = L.map('map').setView([51.78, -7.03], 2); // Grundvy för kartan, utzoomad

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(visualMap); // Kartan genom Openstreetmap och leaflet
    searchBtn.addEventListener("click", () => {
        let searchInput = countryInputEl.value.trim();
        if (searchInput === "") { // Felmeddelande om man inte sökar på någonting
            console.log("Fyll i namn");
            searchError.innerHTML = "Vänligen, fyll i ett land"; // Felmeddelande i DOM
            return;
        }
        hideSections();
        const countryInput = searchInput.charAt(0).toUpperCase() + searchInput.slice(1).toLowerCase(); // Gör första bokstaven i landets namn till en versal
        fetchCountry(countryInput, searchError); // Anropar funktionen för att hämta datan om landet beroende på vad användaren sökt på
    });
});

/**
 * Funktion för att hämta JSON-data via API beroende på vad användaren sökt för land
 * @param {string} countryInput 
 * @param {string} searchError 
 */
async function fetchCountry(countryInput, searchError) {
    searchError.innerHTML = ""; // Tar bort felmeddelande i DOM innan anropet sker

    const url = `https://restcountries.com/v3.1/name/${countryInput}?fullText=false`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        // Generera felmeddelande om namnet inte hittas.
        if (!response.ok) { // Om responsen inte hittade något land används en backup-funktion för till exempel namn på länder med svenska språket.
            return fetchByTranslation(countryInput, searchError);
        }
        console.log(data);
        const currencyObject = data[0].currencies;
        const currencyCode = Object.keys(currencyObject)[0];
        console.log(currencyCode);
        displayCountry(data, currencyCode, countryInput);
    } catch (error) {
        console.error("Felmeddelande: ", error);
    }
};
/**
 * Skriver ut information om landet i DOM, som flagga, valuta, språk och huvudstad.
 * @param {*} data 
 * @param {*} currencyCode 
 * @param {*} countryInput 
 */
async function displayCountry(data, currencyCode, countryInput) {
    const countryProfile = document.getElementById("country-card");
    const flag = data[0].flags.png; // Flagga
    const countryName = data[0].altSpellings[0]; // Förkortning för landets namn
    const language = data[0].languages; // Språk
    const languageName = Object.values(language)[0]; // Värdet inom languages i arrayen från API:et 
    const capitalName = data[0].capital; // Huvudstad

    // const [capitalLat, capitalLng] = data[0].capitalInfo.latlng; // Hämtar in koordinater för huvudstaden
    // Skapar struktur inom DOM för att visa info om landet
    countryProfile.innerHTML = `
    <h3>${countryName} - ${countryInput}</h3>
    <img src="${flag}" alt="${countryInput} flag" id="flag" width="150px" height="100px"> 
    <p>Valuta: <span>${currencyCode}</span></p>
    <p>Språk: <span>${languageName}</span></p>
    <p>Tidszon: <span>${data[0].timezones[0]}</span></p>
    <p>Huvudstad: <span>${capitalName}</span></p>
    <div id="weatherContainer"></div>
    <button id="countryMapBtn">Visa karta över landet</button>
    <button id="showWeatherBtn">Se väderprognos</button>
    <button id="showCurrencyBtn">Jämför valuta</button>
    `;

    const showCurrencyBtn = document.getElementById("showCurrencyBtn");
    const currencyEl = document.getElementById("currency-converter");
    currencyEl.innerHTML = "";
    showCurrencyBtn.addEventListener("click", () => {
        hideSections(); // Döljer alla sektioner
        currencyEl.classList.remove("hidden"); // Visar diagrammet med väderprognosen sedan
        console.log("Klickade på visa valuta-knappen");
    });


    currencyEl.innerHTML += `
    <label for="fromCurrency">Från:</label>
    <input type="text" id="fromCurrency" value="SEK" disabled>
    <label for="toCurrency">Till:</label>
    <input type="text" id="toCurrency" value="${currencyCode}">
    <input type="number" id="amount" placeholder="Ange belopp" autofocus>
    <button id="convertBtn">Konvertera</button>
    <div id="convertResult"></div>
    `;
    //<div id="display-rates">Se valutor:</div>
    const countryMapBtn = document.getElementById("countryMapBtn");
    countryMapBtn.addEventListener("click", () => {
        hideSections(); // Dölj alla sektioner
        const [latitude, longitude] = data[0].latlng;
        showCountryMap(latitude, longitude);
    });
    const convertBtn = document.getElementById("convertBtn");
    convertBtn.addEventListener("click", async() => { // När användaren klickar på konvertera
        const convertListEl = document.getElementById("convertResult");
        const amount = document.getElementById("amount").value;
        const toCurrency = document.getElementById("toCurrency").value.toUpperCase();

        if (amount === "") {
            convertListEl.innerHTML = "Ange ett giltigt belopp";
            return;
        }
        const { rate, updated } = await fetchCurrencyData(toCurrency); // Hämtar in växlingskursen för SEK till den valutan som användaren sökt på och vill konvertera till i sökfältet
        if (!rate) {
            convertListEl.innerHTML = "Kunde inte hämta växlingskursen, försök snart igen";
            return;
        }

        const convertedAmount = amount * rate;
        console.log(convertedAmount);
        convertListEl.innerHTML = `
        <p>${amount} SEK = ${convertedAmount.toFixed(2)} i ${toCurrency}</p>
        <p>Senast uppdaterad kurs: ${updated}</p>
        `;
    });



    const weatherInfo = await getWeatherForecast(capitalName); // Väntar på att få väderinformationen
    displayWeather(weatherInfo, capitalName); // Skickar med väderinformation och huvudstadens namn
    fetchCurrencyData(currencyCode); // Funktionen för att hämta valuta anropas med landets valutakod
};

/**
 * En backup-funktion som gör ett nytt API-anrop fast med översättning till landets namnm, 
 * ifall användaren exempelvis skriver landets namn på svenska istället för engelska.
 * @param {*} countryInput 
 * @param {*} searchError
 * @returns 
 */
async function fetchByTranslation(countryInput, searchError) {
    const url = `https://restcountries.com/v3.1/translation/${countryInput}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (!response.ok) {
            searchError.innerHTML = `Landet "${countryInput}" hittades inte, prova med namnet på Engelska.`
            return;
        }
        console.log(data);
        const currency = document.getElementById("currency-converter");
        currency.innerHTML = "";
        const currencyObject = data[0].currencies;
        const currencyCode = Object.keys(currencyObject)[0];
        currency.innerHTML = currencyCode;
        console.log(currencyCode);
        displayCountry(data, currencyCode, countryInput);
    } catch (error) {
        console.error("Felmeddelande: ", error);
    }
};


/**
 * Visar en karta över det land som användaren sökt på och samtidigt visar en markör över landet
 * @param {*} latitude 
 * @param {*} longitude 
 */
function showCountryMap(latitude, longitude) {
    hideSections(); // Dölj alla sektioner i början
    const mapEl = document.getElementById("map");
    mapEl.classList.remove("hidden"); // Visa kartan sedan
    visualMap.invalidateSize(); // Justerar kartans synliga storlek när den väl visas
    visualMap.setView([latitude, longitude], 4); // Uppdaterar kartans position efter landets koordinater
    if (marker) {
        visualMap.removeLayer(marker); // Om det redan finns en markör på kartan tas den bort innan den nya markören läggs till
    }
    marker = L.marker([latitude, longitude]).addTo(visualMap); // Markören sätts på kartan beroende på landets koordinater

}

/**
 * Hämtar in väderprognos för huvudstaden i landet som användaren sökt på
 * @param {*} capitalName 
 * @returns 
 */
async function getWeatherForecast(capitalName) {
    const apiKey = "3dc22c103acb482d9ee82613262602";
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${capitalName}&days=5&aqi=no&alerts=no`;
    try {
        const response = await fetch(url)
        const data = await response.json();
        console.log("Svarsresultat:", data);
        return data;
    } catch (error) {
        console.error("Felmeddelande från hämtning av väder: ", error);
    }
}
/**
 * Visar väder för huvudstaden i det land som användaren sökt på, anropar funktionen för att visa diagram för väderprognos
 * @param {*} weatherInfo - Hämtar in väderinformation från API:et
 * @param {*} capitalName - Huvudstadens namn som används för att visa i DOM vilken stad väderprognosen gäller för
 */
function displayWeather(weatherInfo, capitalName) {

    const showWeatherBtn = document.getElementById("showWeatherBtn");
    const weatherContainerEl = document.getElementById("weatherContainer"); // Väderinfo som ligger efter allmänna informationen om landet
    const diagramEl = document.getElementById("weatherDiagram");
    diagramEl.innerHTML = ""; // Tömmer diagrammet innan det visas igen, ifall användaren söker på flera länder efter varandra

    /*weatherChart(date); // Anropar funktionen för att visa diagrammet över väderprognosen för huvudstaden*/

    showWeatherBtn.addEventListener("click", () => {
        hideSections(); // Döljer alla sektioner
        diagramEl.classList.remove("hidden"); // Visar diagrammet med väderprognosen sedan
    });
    // Skapar struktur inom containern för att visa väder
    weatherContainerEl.innerHTML += `
            <p> Väder just nu i ${weatherInfo.location.name}: <span>${weatherInfo.current.temp_c}°C</span></p>
            <img id="weatherIcon" src="${weatherInfo.current.condition.icon}" alt="${weatherInfo.current.condition.text} width="60px" height="60px"> 
    `
    diagramEl.innerHTML += `
            <h3>Väderprognos för ${capitalName}:</h3>
            <canvas id="myChart"></canvas>
    `
    const weatherDays = weatherInfo.forecast.forecastday;
    console.log(weatherDays);
    const labels = weatherDays.map(day => day.date);
    const avgTemp = weatherDays.map(day => day.day.avgtemp_c);
    const lowestTemp = weatherDays.map(day => day.day.mintemp_c);
    const highestTemp = weatherDays.map(day => day.day.maxtemp_c);
    const chanceRain = weatherDays.map(day => day.day.daily_chance_of_rain);
    // Skapa diagram som visar väderprognosen för tre dagar framåt
    const ctx = document.getElementById("myChart");
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                    label: 'Temperatur genomsnitt',
                    data: avgTemp,
                    backgroundColor: ["#eeb006"],
                    hoverBackgroundColor: "#fff",
                    borderColor: "#0575f5",
                    order: 2,
                },
                /*{
                                   type: 'line',
                                   label: 'Chans för nederbörd',
                                   data: chanceRain,
                                   backgroundColor: ["#0066ff"],
                                   hoverBackgroundColor: "#fff",
                                   order: 1,
                               }

                               /*  {
                                     label: 'Lägsta temperatur',
                                     data: lowestTemp,
                                     backgroundColor: ["#3700ff"],
                                     hoverBackgroundColor: "#fff",
                                     borderColor: "#0066ff",
                                 },
                                 {
                                     label: 'Högsta temperatur',
                                     data: highestTemp,
                                     backgroundColor: ["#ff0000"],
                                     hoverBackgroundColor: "#fff",
                                     borderColor: "#ff0000",
                                 }*/
            ]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';

                            if (label) {
                                label += ': ' + context.parsed.y + '°C'; // Lägger till grader i tooltipen, https://www.chartjs.org/docs/latest/configuration/tooltip.html
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: function(value) {
                            return value + '°C'; // Lägger till grader på y-axeln: https://www.chartjs.org/docs/latest/axes/styling.html
                        }
                    }
                }
            }
        }
    });
}

/**
 * Skapar ett diagram som visar väderprognosen för huvudstaden som användaren sökt på för kommande dagar
 */
/*function weatherChart(date) {
    const ctx = document.getElementById("myChart");
    const labels = ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    const applicants = [20, 21, 19, 22, 18, 17];
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperatur',
                data: applicants,
                backgroundColor: ["#eeb006"],
                hoverBackgroundColor: "#fff",
                borderColor: "#0066ff",
            }]
        },
        options: {
            responsive: true
        }
    });
}*/

/**
 * Döljer karta, väderprognos med diagram och valuta i början när användaren söker på ett land.
 */
function hideSections() {
    // Alla element som ligger inom diven showArea.
    const mapEl = document.getElementById("map");
    const diagramEl = document.getElementById("weatherDiagram");
    const currencyEl = document.getElementById("currency-converter");
    // Lägger på hidden på alla element för att inte visa dem i början
    mapEl.classList.add("hidden");
    diagramEl.classList.add("hidden");
    currencyEl.classList.add("hidden");
}



/**
 * En funktion för att hämta in växelkurser från API, Exchangerate-API, med svenska valutan som bas, 
 * sparar växelkurser i localstorage för att återanvända och returnerar sedan växelkursen för landet som användaren sökt på i sökfältet.
 * @param {*} currencyCode 
 * @returns 
 */
async function fetchCurrencyData(currencyCode) {
    // Om det finns sparat i localstorage så hämtas valutorna där istället för att göra ett nytt API-anrop
    const storedCurrency = localStorage.getItem("currenciesSaved");
    if (storedCurrency) {
        const parsedCurrency = JSON.parse(storedCurrency);
        return {
            rate: parsedCurrency.rates[currencyCode],
            updated: parsedCurrency.updated
        }
    }
    // URL för att anropa API och hämta växelkursen där SEK är bas
    const url = "https://v6.exchangerate-api.com/v6/b1e7b0cd61281ff6a98d18e0/latest/SEK";
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);
        const rates = data.conversion_rates; // Alla växelkurser med SEK som bas
        const searchRate = rates[currencyCode]; // Växelkursen som användaren sökt på
        console.log(searchRate);

        // Utskrift när kursen var senast uppdaterad till DOM
        const updCurrency = data.time_last_update_utc; // När växlingskursen senast var uppdaterad, utskrift i DOM
        const weekdays = ["Söndag", "Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag"];
        let day = new Date(updCurrency);
        const date = day.getUTCDate();
        const month = day.getUTCMonth() + 1;
        const dayOfWeek = weekdays[day.getUTCDay()]; // Vilken veckodag det är när växlingskursen senast var uppdaterad, utskrift i DOM 
        const datePrint = `${dayOfWeek} ${date}/${month}`; // Utskriftsformat
        // Sparar växelkurserna i localstorage om de inte redan finns där
        localStorage.setItem("currenciesSaved", JSON.stringify({
            rates: rates,
            updated: datePrint
        }));
        // Returnerar växelkursen för valutan som användaren sökt på och när den senast uppdaterades som ett objekt
        return {
            rate: searchRate,
            updated: datePrint
        };
    } catch (error) {
        console.error("Felmeddelande: ", error);
    }
};