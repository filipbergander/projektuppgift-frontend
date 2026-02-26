/*"use strict";
import '/src/sass/main.scss';



addEventListener("DOMContentLoaded", () => {
    //fetchCurrencyData();
});
const currencyEl = document.getElementById("currency-converter");
const ratesEl = document.getElementById("display-rates");
const UpdateEl = document.getElementById("lastUpd");

async function getCurrenciesRates() {
    const savedCurrencies = `Valutor`
    const savedData = localStorage.getItem(savedCurrencies);

    const day = 86400000; // Millisekunder en dag

    if (savedData) { // Om savedData finns sparat
        const parsedData = JSON.parse(savedData);
        /*if(Date.now())
            }
        }


        /*
        async function fetchCurrencyData() {
            const url = `https://restcountries.com/v3.1/all?fields=currencies`;
            try {
                const response = await fetch(url);
                const data = await response.json();
                console.log(data);
                //makeCurrencyList(data);
            } catch (error) {
                console.error("Felmeddelande från hämtning av valutor: ", error);
            }
        }



        /*
        function makeCurrencyList(data) {
            const currencyEl = document.getElementById("currency-converter");

            const 

            const currencyObject = data[0].currencies;

            const currencyCode = Object.keys(data.currencies)[0];

            const currencyName = data.currencies[currencyCode].name;

            console.log(currencyCode, currencyName);

            data.forEach(currency => {
                currencyEl.innerHTML += `
        <p> ${currencyName} - ${currencyCode} </p>
        `;
            });
        }
        /*
        function fetchCurrencyData(data) {
            const currencyEl = document.getElementById("currency-converter");

            data.forEach(object => {
                console.log(object.currencies);
                currencyEl.innerHTML = object.currencies;
            });
        }


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
        }; */