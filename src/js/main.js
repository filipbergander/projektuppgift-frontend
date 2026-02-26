/*"use strict";
import '/src/sass/main.scss';



addEventListener("DOMContentLoaded", () => {

     fetchCurrencyData();


});

const ratesEl = document.getElementById("display-rates");
const UpdateEl = document.getElementById("lastUpd");



async function fetchCurrencyData() {
    const url = /*"https://v6.exchangerate-api.com/v6/b1e7b0cd61281ff6a98d18e0/latest/USD";
        try {
            const response = await fetch(url);
            const data = await response.json();
            console.log(data);
            ratesEl.innerHTML += `<p>USD/SEK: <span>${data.conversion_rates.SEK}</span></p>`;
            UpdateEl.innerHTML += `<p>Senast uppdaterat:${data.time_last_update_utc}</p>`;
        } catch (error) {
            console.error("Felmeddelande: ", error);
        }
};*/