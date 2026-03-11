"use strict";

// Sparar variabler för karta och markör globalt
let visualMap;
let marker;

let allCountries = []; // Array för länder som används för att filtrera sökresultat

// Inväntar att DOM har laddats in
addEventListener("DOMContentLoaded", () => {
    /*const loadingIcon = document.getElementById("loadingIcon"); // Laddningsikonen "För jag vill resa!"
     loadingIcon.classList.remove("hidden"); // Visar laddningsikonen
     setTimeout(() => {
         main.classList.remove("hidden"); // Visar main när loadingikonen "laddat klart"
         footer.classList.remove("hidden"); // Visar footer när loadingikonen "laddat klart"
         loadingIcon.classList.add("hidden"); // Döljer ikonen efter 2,5 sek
     }, 2500);*/
    // Sparar variabler som finns inom DOM
    const countryInputEl = document.getElementById("country-name-input");
    const searchBtn = document.getElementById("search-button");
    const searchError = document.getElementById("country-error");
    const countriesListDisplay = document.getElementById("countriesDisplay");
    const showCountriesBtn = document.getElementById("moreCountries");
    const countriesDiv = document.getElementById("countriesDiv");
    // const countrySearch = document.getElementById("country-search");
    const hintEl = document.getElementById("hint");

    // Sätter igång en timeout som visar tipsmeddelandet efter 1.5sekund och sedan döljer det efter 6 sekunder igen.
    setTimeout(() => {
        hintEl.classList.remove("hiddenText"); // Visar tips när användaren börjar skriva i sökfältet
    }, 1500);

    setTimeout(() => {
        hintEl.classList.add("hiddenText"); // Döljer tipset
    }, 8000);

    fetchAllcountries(); // Hämtar alla länder efter att DOM laddats in

    visualMap = L.map('map').setView([51.78, -7.03], 2); // Grundvy för kartan, utzoomad
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, // Max inzoomnivå för kartan
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(visualMap); // Kartan genom Openstreetmap och leaflet

    // När användaren skriver i sökfältet för land 
    countryInputEl.addEventListener("input", async() => {
        const countryInput = countryInputEl.value.trim().toLowerCase(); // Det som användaren söker på i sökfältet, tar bort mellanslag med trim(), samt för att kunna söka med både stor- och liten första bokstav.
        searchError.innerHTML = ""; // Tar bort felmeddelande i DOM när användaren skriver i sökfältet
        const filteredCountries = allCountries.filter(country =>
            country.name.common.toLowerCase().includes(countryInput) // Filtrerar efter vad användaren söker på
        );
        showCountries(filteredCountries); // Skickar med den filtrerade listan av länder för att hämta in länderna automatiskt medan man skriver
    });
    // När användaren klickar på sök-knappen för land
    searchBtn.addEventListener("click", () => {
        let searchInput = countryInputEl.value.trim();
        if (searchInput === "") { // Felmeddelande om man inte sökar på någonting
            searchError.innerHTML = "Vänligen, fyll i ett land"; // Felmeddelande i DOM
            return;
        }
        // countrySearch.classList.add("hidden"); // Döljer diven
        console.log("Du klickade på sök");
        countriesDiv.classList.add("hidden"); // Döljer listan med alla länder
        hideSections(); // Döljer karta, väderprognos och valutakonverterare 

        const countryInput = searchInput.charAt(0).toUpperCase() + searchInput.slice(1).toLowerCase(); // Gör första bokstaven i landets namn till en versal och resten till gemener
        fetchCountry(countryInput, searchError); // Anropar funktionen för att hämta datan om landet beroende på vad användaren sökt på
    });
    // När användaren klickar på knappen för att visa alla länder
    showCountriesBtn.addEventListener("click", () => {
        const arrowIcon = document.getElementById("arrowIcon"); // Ikonen (chevron) som pilar i knappen
        if (countriesListDisplay.classList.contains("hidden")) {
            hideSections(); // Döljer element som karta, diagram
            countriesListDisplay.classList.remove("hidden"); // Visar listan med alla länder
            showCountriesBtn.firstChild.textContent = "Dölj länder";
            arrowIcon.textContent = "keyboard_arrow_up"; // Ändrar ikonen till uppåtpil
        } else { // När listan visas och användaren klickar igen på knappen, så döljs listan
            countriesListDisplay.classList.add("hidden");
            showCountriesBtn.firstChild.textContent = "Visa alla länder"; // Ändrar namn på knappen
            arrowIcon.textContent = "keyboard_arrow_down"; // Ändrar ikonen till nedåtpil
        }
    });
});
/**
 * Funktion som hämtar in alla länder som finns från Restcountries API. 
 */
async function fetchAllcountries() {
    const url = `https://restcountries.com/v3.1/all?fields=name`;
    try {
        const response = await fetch(url);
        const info = await response.json();
        allCountries = info; // Sparar länderna i den globala arrayen
        showCountries(info); // Skickar med alla länderna för att visa dem i DOM 
    } catch (error) {
        console.error("Felmeddelande vid hämtning av alla länder: ", error);
    }
}
/**
 * 
 * @param {*} info - Arrayen med alla länder som hämtas från API för att kunna visa i DOM
 */
function showCountries(info) {
    const countryListEl = document.getElementById("countrylist");
    countryListEl.innerHTML = "";
    info.forEach(country => {
        countryListEl.innerHTML += `<li>${country.name.common}</li>` // Struktur 
    });
}

/**
 * Filtrerar listan av länder beroende på vad användaren skriver i sökfältet
 */
function filterCountries() {
    const countryInputEl = document.getElementById("country-name-input").value.toLowerCase();
    const filteredCountries = allCountries.filter(country =>
        country.name.common.toLowerCase().includes(countryInputEl)
    );
    showCountries(filteredCountries); // Anropar funktionen för att hämta alla länder när de är filtrerade beroende på vad användaren sökt på
}

/**
 * Funktion för att hämta JSON-data via API beroende på vad användaren sökt för land
 * @param {string} countryInput - Sökinnehåll
 * @param {string} searchError - Felmeddelande som kan visas i DOM ifall inget land hittas vid sökningen
 * @return {void} - Returnerar inget
 */
async function fetchCountry(countryInput, searchError) {
    searchError.innerHTML = ""; // Tar bort felmeddelande i DOM innan anropet sker
    const url = `https://restcountries.com/v3.1/name/${countryInput}?fullText=false`; // URL för att hämta viss data om ett specifikt land, beroende på sökningen i sökfältet
    try {
        const response = await fetch(url);
        const data = await response.json();
        // Generera felmeddelande om namnet inte hittas.
        if (!response.ok) { // Om responsen inte hittade något land används en backup-funktion för namn på länder med svenska språket. t.ex frankrike och inte france.
            return fetchByTranslation(countryInput, searchError);
        }
        console.log(data);
        const currencyObject = data[0].currencies; // Informationen om landets valuta
        const currencyCode = Object.keys(currencyObject)[0]; // Valutakoden som landet använder
        displayCountry(data, currencyCode, countryInput); // Anropar funktion för att visa information om landet i DOM
    } catch (error) {
        console.error("Felmeddelande: ", error);
    }
};

/**
 * Skriver ut information om landet i DOM, som flagga, valuta, språk och huvudstad.
 * @param {*} data - Datan som hämtas in om specifikt land från API
 * @param {*} currencyCode - Valutakoden för landet exempelvis SEK
 * @param {*} countryInput - Sökinnehållet som användaren skrev i sökfältet för land
 * @return {void} - Returnerar inget
 */
async function displayCountry(data, currencyCode, countryInput) {
    const countryProfile = document.getElementById("country-card"); // Där information om landet ska skrivas ut
    const flag = data[0].flags.png; // Flagga
    const countryNameShort = data[0].altSpellings[0]; // Förkortning för landets namn
    const language = data[0].languages; // Språk
    const languageName = Object.values(language)[0]; // Värdet inom languages i arrayen från API:et 
    const capitalName = data[0].capital; // Huvudstad
    const countryName = data[0].name.common;
    const population = data[0].population; // Invånare i landet
    const populationText = population.toLocaleString("sv-SE"); // Gör om invånarantalet till en textsträng med tusentalsavgränsare

    // const [capitalLat, capitalLng] = data[0].capitalInfo.latlng; // Hämtar in koordinater för huvudstaden
    // Skapar struktur inom DOM för att visa info om landet, skickar med olika data från api
    countryProfile.innerHTML = `
    <h2 class="headline-country">${countryNameShort} | ${countryName}</h2>
    <img src="${flag}" class="flagImg" alt="${countryInput} flag" id="flag" width="150px" height="100px"> 
    <p class="textInfo">Valuta: <span class="spanInfo">${currencyCode}</span></p>
    <p class="textInfo">Språk: <span class="spanInfo">${languageName}</span></p>
    <p class="textInfo">Invånare: <span class="spanInfo">${populationText}</span></p>
    <p class="textInfo">Tidszon: <span class="spanInfo">${data[0].timezones[0]}</span></p>
    <p class="textInfo">Region: <span class="spanInfo">${data[0].continents[0]}</span></p>
    <p class="textInfo">Huvudstad: <span class="spanInfo">${capitalName}</span></p>
    <div id="weatherContainer"></div>
    <button id="countryMapBtn">Visa karta över landet</button>
    <button id="showWeatherBtn">Se väderprognos</button>
    <button id="showCurrencyBtn">Jämför valuta</button>
    `;

    // Eventlyssnare för att visa valutakonverteraren 
    const showCurrencyBtn = document.getElementById("showCurrencyBtn");
    const currencyEl = document.getElementById("currency-converter");
    currencyEl.innerHTML = "";
    showCurrencyBtn.addEventListener("click", () => {

        hideSections(); // Döljer alla sektioner  
        showCurrencyBtn.classList.add("active");
        currencyEl.classList.remove("hidden"); // Visar diagrammet med väderprognosen sedan
    });

    // Struktur inom DOM för att visa valutakonverteraren, currencyCode är valutakoden för det land som användaren sökt på
    currencyEl.innerHTML += `
    <label for="fromCurrency">Från: <img src="https://flagcdn.com/se.svg" alt="Svenska flaggan" id="swedishFlag" width="25px" height="25px"></label>
    <input type="text" id="fromCurrency" value="SEK" disabled>
    <label for="toCurrency">Till: </label>
    <input type="text" id="toCurrency" value="${currencyCode}">
    <input type="number" id="amount" placeholder="Ange belopp">
    <button id="convertBtn">Konvertera</button>
    <div id="convertResult"></div>
    `;
    // Eventlyssnare för att visa kartan över det land som användaren sökt på
    const countryMapBtn = document.getElementById("countryMapBtn");
    countryMapBtn.addEventListener("click", () => {
        const mapEl = document.getElementById("map");
        hideSections(); // Döljer element som väderprognos och valutakonverterare när man klickar på visa kartan över landet
        const [latitude, longitude] = data[0].latlng; // Koordinaterna
        showCountryMap(latitude, longitude); // Visar kartan över landet beroende på koordinaterna för landet som hämtats in från apiet
        setTimeout(() => {
            mapEl.scrollIntoView({ behavior: "smooth" }); // Scrollar ner till kartan när den väl visas  
        }, 200);
        countryMapBtn.classList.add("active"); // Lägger på klassen active för style på knappen
    });

    // Eventlyssnare för att visa det konverterade beloppet mellan SEK och valutan för landet
    const convertBtn = document.getElementById("convertBtn");
    convertBtn.addEventListener("click", async() => { // När användaren klickar på konvertera
        const convertListEl = document.getElementById("convertResult"); // Div där det konverterade beloppet ska skrivas ut
        const amount = document.getElementById("amount").value; // Beloppet
        const toCurrency = document.getElementById("toCurrency").value.toUpperCase(); // Valutakoden med enbart versaler
        // Om användaren inte skrivit något
        if (amount === "") {
            convertListEl.innerHTML = "Ange ett giltigt belopp";
            return;
        }
        const { rate, updated } = await fetchCurrencyData(toCurrency); // Hämtar in växlingskursen för SEK till den valutan som användaren sökt på och vill konvertera till i sökfältet
        // Om det inte gick att hämta växlingskursen
        if (!rate) {
            convertListEl.innerHTML = "Kunde inte hämta växlingskursen, försök igen";
            return;
        }
        // Beräknar det konverterade beloppet och skriver ut det i DOM samt när växlingskursen senast blev uppdaterad
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
 * En backup-funktion som gör ett nytt API-anrop fast med översättning till landets namn, 
 * ifall användaren exempelvis skriver landets namn på svenska istället för engelska.
 * @param {*} countryInput - Sökinnehållet som användaren skrivit i sökfältet för land
 * @param {*} searchError - Felmeddelande som kan visas i DOM ifall inget land hittas vid sökningen
 * @returns {void} - Returnerar inget
 */
async function fetchByTranslation(countryInput, searchError) {
    const url = `https://restcountries.com/v3.1/translation/${countryInput}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (!response.ok) { // Om det inte hittades något land på svenska först
            searchError.innerHTML = `Landet "${countryInput}" hittades inte, prova med namnet på Engelska.`
            countriesDiv.classList.remove("hidden"); // För att visa listan med alla länder
            return;
        }
        console.log(data); // För att se det som hämtas in
        const currency = document.getElementById("currency-converter");
        currency.innerHTML = "";
        const currencyObject = data[0].currencies; // Valutainformation
        const currencyCode = Object.keys(currencyObject)[0]; // Valutakoden
        currency.innerHTML = currencyCode;
        console.log(currencyCode); // För att se valutakoden som hämtades in
        displayCountry(data, currencyCode, countryInput); // Anropar funktionen för att visa information om landet i DOM
    } catch (error) {
        console.error("Felmeddelande: ", error);
    }
};

/**
 * Visar en karta över det land som användaren sökt på och samtidigt visar en markör över landet
 * @param {*} latitude - Koordinater för latitud som hämtas in från apiet
 * @param {*} longitude - Koordinater för longitud som hämtas in från apiet
 */
function showCountryMap(latitude, longitude) {
    hideSections(); // Dölj element som väderprognos, valutakonverterare
    const mapEl = document.getElementById("map"); // Hämtar in element från DOM
    mapEl.classList.remove("hidden"); // Visa kartan sedan
    visualMap.invalidateSize(); // Justerar kartans synliga storlek när den väl visas
    visualMap.setView([latitude, longitude], 4); // Uppdaterar kartans position efter landets koordinater, zoomar in lite på landet 
    if (marker) {
        visualMap.removeLayer(marker); // Om det redan finns en markör på kartan tas den bort innan den nya markören läggs till
    }
    marker = L.marker([latitude, longitude]).addTo(visualMap); // Markören sätts på kartan beroende på landets koordinater
}

/**
 * Hämtar in väderprognos för huvudstaden i landet som användaren sökt på, ex Stockholm
 * @param {*} capitalName - Huvudstadens namn som används i api-anropet
 * @returns {object} - Väderinformationen för huvudstaden från apiet
 */
async function getWeatherForecast(capitalName) {
    const apiKey = "3dc22c103acb482d9ee82613262602"; // Api-nyckel för apiet
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${capitalName}&days=5&aqi=no&alerts=no`; // Hela adressen för anrop
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
    const showWeatherBtn = document.getElementById("showWeatherBtn"); // Knappen för att visa väderprognosen, skapats sedan tidigare inom javascript och inte html
    const weatherContainerEl = document.getElementById("weatherContainer"); // Väderinfo som ligger efter allmänna informationen om landet
    const diagramEl = document.getElementById("weatherDiagram"); // Diagrammet där väderprognosen ska visas i
    diagramEl.innerHTML = ""; // Tömmer diagrammet innan det visas igen, ifall användaren söker på flera länder efter varandra

    // När användaren klickar på att visa väderprognosen
    showWeatherBtn.addEventListener("click", () => {
        hideSections(); // Döljer alla andra element som karta och valutakonverter
        showWeatherBtn.classList.add("active");
        diagramEl.classList.remove("hidden"); // Visar diagrammet med väderprognosen sedan
        setTimeout(() => {
            diagramEl.scrollIntoView({ behavior: "smooth" }); // Scrollar ner till kartan när den väl visas  
        }, 200);
    });
    // Skapar struktur inom containern för att visa väder med celsius samt ikon för vädret, ex soligt/molnigt
    weatherContainerEl.innerHTML += `
            <p class="textInfo"> Väder just nu i ${weatherInfo.location.name}: <span class="glowy-text">${weatherInfo.current.temp_c}°C</span></p>
            <img id="weatherIcon" src="${weatherInfo.current.condition.icon}" alt="${weatherInfo.current.condition.text} width="60px" height="60px"> 
    `
        // Rubrik med huvudstadens namn samt diagrammet
    diagramEl.innerHTML += `
            <h3>Väderprognos för ${capitalName}:</h3>
            <canvas id="myChart"></canvas>
    `
        // Väderprognos kommande dagar som ska visas i diagrammet
    const weatherDays = weatherInfo.forecast.forecastday;
    console.log(weatherDays);
    const labels = weatherDays.map(day => day.date); // Datumen
    const avgTemp = weatherDays.map(day => day.day.avgtemp_c); // Genomsnittstemperaturen 

    /* Lägsta, högsta temperatur och chansen för regn
    const lowestTemp = weatherDays.map(day => day.day.mintemp_c);
    const highestTemp = weatherDays.map(day => day.day.maxtemp_c);
    const chanceRain = weatherDays.map(day => day.day.daily_chance_of_rain); */

    // Skapa diagram som visar väderprognosen fem dagar framåt
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
            /*maintainAspectRatio: false,*/
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ' + context.parsed.y + '°C'; // Lägger till grader i tooltipen när man hoovrar, https://www.chartjs.org/docs/latest/configuration/tooltip.html
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
                            return value.toFixed(1) + '°C'; // Lägger till grader på y-axeln samt minimerar till en decimal: https://www.chartjs.org/docs/latest/axes/styling.html
                        }
                    }
                }
            }
        }
    });
}

/**
 * Döljer alla länder, karta, väderprognos med diagram och valuta i början när användaren söker på ett land.
 */
function hideSections() {
    // Alla element som ligger inom diven showArea.
    const mapEl = document.getElementById("map");
    const diagramEl = document.getElementById("weatherDiagram");
    const currencyEl = document.getElementById("currency-converter");
    const countriesListDisplay = document.getElementById("countriesDisplay");
    const countryMapBtn = document.getElementById("countryMapBtn");
    const showWeatherBtn = document.getElementById("showWeatherBtn");
    const showCurrencyBtn = document.getElementById("showCurrencyBtn");
    // Lägger på hidden på alla element för att inte visa dem i början
    mapEl.classList.add("hidden");
    diagramEl.classList.add("hidden");
    currencyEl.classList.add("hidden");
    countriesListDisplay.classList.add("hidden");
    if (countryMapBtn && showWeatherBtn && showCurrencyBtn) {
        countryMapBtn.classList.remove("active");
        showWeatherBtn.classList.remove("active");
        showCurrencyBtn.classList.remove("active");
    }
}

/**
 * En funktion för att hämta in växelkurser från API, Exchangerate-API, med svenska valutan som bas.
 * Sparar växelkurser i localstorage för att återanvända och returnerar sedan växelkursen för landet som användaren sökt på i sökfältet.
 * @param {*} currencyCode - Valutakoden för det land som användaren sökt på, ex EUR
 * @returns {rate: number, updated: string} - Ett objekt med:
 * - rate: Växelkurser som nummer med SEK som bas för det land som användaren söker på. Ex 1 SEK = 0.11 USD
 * - updated: När växelkurserna senaste blev uppdaterad som en textsträng, ex "Tisdag 10/3"
 */
async function fetchCurrencyData(currencyCode) {
    // Om det finns sparat i localstorage så hämtas valutorna där istället för att göra ett till och nytt API-anrop
    const storedCurrency = localStorage.getItem("currenciesSaved");
    if (storedCurrency) {
        const parsedCurrency = JSON.parse(storedCurrency); // Gör om till objekt
        // Returnerar växelkursen för valutan och när den uppdaterades senast
        return {
            rate: parsedCurrency.rates[currencyCode],
            updated: parsedCurrency.updated
        }
    }
    // Annars om inte valutorna finns lagrade i localstorage görs ett nytt api-anrop
    // URL för att anropa API med key och hämta växelkursen där SEK är bas
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
        const weekdays = ["Söndag", "Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag"]; // Veckodagar på svenska
        let day = new Date(updCurrency); // till ett datumobjekt
        const date = day.getUTCDate(); // Datum
        const month = day.getUTCMonth() + 1; // Månad
        const dayOfWeek = weekdays[day.getUTCDay()]; // Vilken veckodag det är när växlingskursen senast var uppdaterad, utskrift i DOM 
        const datePrint = `${dayOfWeek} ${date}/${month}`; // Utskriftsformat

        // Sparar växelkurserna och datum för senaste uppdatering i localstorage
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
        console.error("Felmeddelande: ", error); // Felmeddelande
    }
};