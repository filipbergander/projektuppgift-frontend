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
    const countryName = data[0].altSpellings[0]; // Alternativt namn som kan användas
    const language = data[0].languages; // Språk
    const languageName = Object.values(language)[0]; // Värdet inom languages i arrayen från API:et 
    console.log(languageName);
    const capitalName = data[0].capital; // Huvudstad

    const [capitalLat, capitalLng] = data[0].capitalInfo.latlng; // Hämtar in koordinater för huvudstaden
    // Skapar struktur inom DOM för att visa info om landet
    countryProfile.innerHTML = `
    <h3>${countryName} - ${countryInput}</h3>
    <img src="${flag}" alt="${countryInput} flag" id="flag" width="150px" height="100px"> 
    <p>Valuta: <span>${currencyCode}</span></p>
    <p>Språk: <span>${languageName}</span></p>
    <p>Huvudstad: <span>${capitalName}</span></p>
    <div id="weatherContainer">
    </div>
    <button id="countryMap-btn">Visa karta över landet</button>
    `;

    const countryMapBtn = document.getElementById("countryMap-btn");
    countryMapBtn.addEventListener("click", () => {
        const [latitude, longitude] = data[0].latlng;

        showCountryMap(latitude, longitude);
    });
    const weatherInfo = await getWeatherForecast(capitalName);
    displayWeather(weatherInfo);
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
    let mapEl = document.getElementById("map");
    mapEl.classList.add("show");
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
    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${capitalName}&aqi=no`;
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
 * @param {*} weatherInfo 
 */
function displayWeather(weatherInfo) {
    // Container som ligger efter allmänna informationen om landet
    const weatherContainerEl = document.getElementById("weatherContainer");
    // Skapar struktur inom containern för att visa väder
    weatherContainerEl.innerHTML += `
            <p> Väder just nu i ${weatherInfo.location.name}: <span>${weatherInfo.current.temp_c}°C</span></p>
            <img id="weatherIcon" src="${weatherInfo.current.condition.icon}" alt="${weatherInfo.current.condition.text} width="60px" height="60px"> 
            <div id="weatherDiagram"><h3>Se väderprognos:</h3>
            <canvas id="myChart"></canvas>
             </div>
    `
    weatherChart(); // Anropar funktionen för att visa diagrammet över väderprognosen för huvudstaden
}

/**
 * Skapar ett diagram som visar väderprognosen för huvudstaden som användaren sökt på för kommande dagar
 */
function weatherChart() {
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
}


/* 


function addMarker(latitude, longitude) {

    visualMap.setView([latitude, longitude], 8);

}

visualMap = L.map('map').setView([latitude, longitude], 4);

 L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
     maxZoom: 19,
     attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
 }).addTo(visualMap);   
  if (visualMap !== null) { // Tar bort kartan från DOM om den redan visas
        visualMap.remove();
        visualMap = null;
        visualMap.classList.remove("show");
    }
    document.getElementById("map").classList.add("show");*/
/*const countryArea = data[0].maps.openStreetMaps;*/ // För att visa kartan på en länk