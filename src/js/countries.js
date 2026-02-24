"use strict";



addEventListener("DOMContentLoaded", () => {
    const countryInput = document.getElementById("country-name");
    const searchBtn = document.getElementById("search-button");
    const searchError = document.getElementById("country-error");
    searchBtn.addEventListener("click", () => {
        countryInput.value = countryInput.value.trim();
        if (countryInput.value === "") {
            console.log("Fyll i namn");
            searchError.innerHTML = "Vänligen, fyll i ett land";
            return;
            /*alert("Vänligen, fyll i ett land")*/
        }
    });
});

async function fetchCountry() {
    const url = `https://restcountries.com/v3.1/name/${countryInput}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error("Felmeddelande: ", error);
    }
};