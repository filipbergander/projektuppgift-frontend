"use strict";

addEventListener("DOMContentLoaded", () => {
    const countryInput = document.getElementById("country-name");
    const searchBtn = document.getElementById("search-button");
    const searchError = document.getElementById("country-error");
    searchBtn.addEventListener("click", () => {
        const searchInput = countryInput.value.trim();
        if (searchInput === "") { // Felmeddelande om man inte sökar på någonting
            console.log("Fyll i namn");
            searchError.innerHTML = "Vänligen, fyll i ett land";
            return;
        }
        fetchCountry(searchInput, searchError);

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

function displayCountry(data, currencyCode, countryInput) {
    const countryProfile = document.getElementById("country-card");
    const flag = data[0].flags.png;
    const language = data[0].languages;
    const languageName = Object.values(language)[0];
    console.log(languageName);
    const capitalName = data[0].capital;

    countryProfile.innerHTML = `
    <img src="${flag}" alt="${countryInput} flag" id="flag" width="150px" height="100px"> 
    <p>Valuta: <span>${currencyCode}</span></p>
    <p>Språk: <span>${languageName}</span></p>
    <p>Huvudstad: <span>${capitalName}</span></p>
    <button id="countryMap">Se en karta över landet</button>
    `;
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