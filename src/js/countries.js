"use strict";

let visualMap;
let marker;

addEventListener("DOMContentLoaded", () => {
    const countryInputEl = document.getElementById("country-name");
    const searchBtn = document.getElementById("search-button");
    const searchError = document.getElementById("country-error");
    visualMap = L.map('map').setView([51.78, -7.03], 2); // Grundvy

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(visualMap);

    searchBtn.addEventListener("click", () => {
        let searchInput = countryInputEl.value.trim();
        if (searchInput === "") { // Felmeddelande om man inte sökar på någonting
            console.log("Fyll i namn");
            searchError.innerHTML = "Vänligen, fyll i ett land";
            return;
        }
        const countryInput = searchInput.charAt(0).toUpperCase() + searchInput.slice(1).toLowerCase(); // Gör första bokstaven i landets namn till en versal
        fetchCountry(countryInput, searchError);
        showCountryMap();
        searchInput.innerHTML = ""; // Tömmer sökfältet efter sökning

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
        if (!response.ok) {
            fetchByTranslation(countryInput);
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
 * Skriver ut information om landet i DOM, som flagga, valuta, språk och huvudstad.
 * @param {*} data 
 * @param {*} currencyCode 
 * @param {*} countryInput 
 */
function displayCountry(data, currencyCode, countryInput) {
    const countryProfile = document.getElementById("country-card");
    const flag = data[0].flags.png;
    const countryName = data[0].altSpellings[0];
    const language = data[0].languages;
    const languageName = Object.values(language)[0];
    console.log(languageName);
    const capitalName = data[0].capital;

    countryProfile.innerHTML = `
    <h3>${countryName} - ${countryInput}</h3>
    <img src="${flag}" alt="${countryInput} flag" id="flag" width="150px" height="100px"> 
    <p>Valuta: <span>${currencyCode}</span></p>
    <p>Språk: <span>${languageName}</span></p>
    <p>Huvudstad: <span>${capitalName}</span></p>
    <button id="countryMap-btn">Visa kartan över landet</button>
    `;

    const countryMapBtn = document.getElementById("countryMap-btn");
    countryMapBtn.addEventListener("click", () => {
        /*const countryArea = data[0].maps.openStreetMaps;*/ // För att visa kartan på en länk
        const countryCoordinates = data[0].latlng;
        let latitude = countryCoordinates[0];
        let longitude = countryCoordinates[1];
        showCountryMap(latitude, longitude);
    });
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
 * 
 * @param {*} latitude 
 * @param {*} longitude 
 */
async function showCountryMap(latitude, longitude) {
    let mapEl = document.getElementById("map");
    mapEl.classList.add("show");
    visualMap.invalidateSize(); // Justerar kartans synliga storlek när den väl visas
    visualMap.setView([latitude, longitude], 4); // Uppdaterar kartans position efter landets koordinater
    if (marker) {
        visualMap.removeLayer(marker);
    }
    marker = L.marker([latitude, longitude]).addTo(visualMap);
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