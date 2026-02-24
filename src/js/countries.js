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
 */
async function fetchCountry(countryInput, searchError) {
    searchError.innerHTML = ""; // Tar bort felmeddelande i DOM innan anropet sker

    const url = `https://restcountries.com/v3.1/name/${countryInput}?fullText=false`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        // Generera felmeddelande om namnet inte hittas.
        if (!response.ok) {
            searchError.innerHTML = `Landet "${countryInput}" hittades inte, prova med namnet på Engelska.`
        }
        console.log(data);
        const currency = document.getElementById("currency-converter");
        currency.innerHTML = "";
        const currencyObject = data[0].currencies;
        const currencyCode = Object.keys(currencyObject)[0];
        currency.innerHTML = currencyCode;
        console.log(currencyCode);
    } catch (error) {
        console.error("Felmeddelande: ", error);
    }
};