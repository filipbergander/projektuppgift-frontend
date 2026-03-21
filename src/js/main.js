  /**
   * @file Projektuppgift - Frontend-baserad webbutveckling<br>
   * 
   * Denna applikation, TravelBuddy, hämtar in data från olika API:er och visar länder samt sökfunktion för att hitta information om ett specifikt land.<br>
   * 
   * Syftet med applikationen är att det ska vara en reseguide där man skriver in till vilket land man vill resa till.<br>
   * 
   * Användaren ser en landprofil med information om landet och temperatur just nu för huvudstaden. Det går att se landet på en karta, väderprognos framöver och valutakonverterare för landets valuta mot SEK.<br>
   * 
   * Projektet är byggt med Vite och dokumenterat med JSDoc.<br>
   */

  "use strict";
  import '/src/sass/main.scss';

  // Sparar variabler för karta och markör globalt
  let visualMap = false; // Används för att kontrollera om kartan visas eller inte
  let marker;
  let myIcon;

  let allCountries = []; // Global Array för länder som används för att filtrera sökresultat

  // Inväntar att DOM har laddats in
  addEventListener("DOMContentLoaded", () => {

      // Sparar variabler som finns inom DOM
      const countryInputEl = document.getElementById("country-name-input");
      const searchBtn = document.getElementById("search-button");
      const searchError = document.getElementById("country-error");
      const showCountriesBtn = document.getElementById("moreCountries");

      createTipsMsg(); // Anropar funktionen för att skapa och visa ett tipsmeddelande för användaren när sidan laddas in
      createDivDropDown(); // Anropar funktionen för att skapa dropdownmenyn för att sortera och filtrera länder
      fetchAllcountries(); // Hämtar alla länder efter att DOM laddats in

      let listCountries = true; // Boolean som används för att skifta mellan true/false för att sortera
      const sortEl = document.getElementById("sortHint");

      // Eventlyssnare när man klickar på sortera efter land, två funktioner en som sorterar A-Ö och en som sorterar reverse
      sortEl.addEventListener("click", () => {
          if (listCountries) { // När listcountries är true så sorteras länderna i ordningen A-Ö
              sortCountries();
          } else { // När listcountries inte är true så sorteras länderna i ordningen Ö-A
              sortCountriesBackwards();
          }
          listCountries = !listCountries; // Ändrar värdet mellan true/false mellan klickningarna på knappen
      });
      // Eventlyssnare när användaren klickar på "Enter-tangenten", initierar sökningen av land
      countryInputEl.addEventListener("keydown", event => {
          if (event.key === "Enter") { // Om man skriver i sökfältet för land och trycker på enter
              event.preventDefault();
              searchBtn.click(); // Simulerar klick på sökknappen
              countryInputEl.blur(); // Tar bort fokuset från sökfältet och sökförslag
          }
      });

      // Lyssnar på ändringar i select-elementet för regioner
      document.getElementById("region-to-select").addEventListener("change", () => {
          const selectedRegion = document.getElementById("region-to-select").value;
          if (selectedRegion === "Alla") { // Har man klickat i alla så visas alla länder
              showCountries(allCountries); // Visar alla länder
          } else { // Filtrerar länderna beroende på region som man klickat i
              const filteredRegions = allCountries.filter(country => country.region === selectedRegion);
              showCountries(filteredRegions); // Visar länderna efter filtreringen
          }
      });

      // När användaren skriver i sökfältet för land 
      countryInputEl.addEventListener("input", () => {
          const value = countryInputEl.value.trim().toLowerCase(); // Det som användaren söker på i sökfältet, tar bort mellanslag med trim(), samt för att kunna söka med både stor- och liten första bokstav.
          searchError.innerHTML = ""; // Tar bort felmeddelande i DOM när användaren skriver i sökfältet
          filterCountries(value); // Anropar funktionen med sökinnehållet 
      });

      // När användaren klickar på sök-knappen för land körs funktionen searchLand
      searchBtn.addEventListener("click", searchLand);

      // När använder klickar på knappen för att visa alla länder så körs funktionen showListAllCountries
      showCountriesBtn.addEventListener("click", showListAllCountries);
  });

  /**
   * Funktion som hämtar in alla länder som finns från Restcountries API med namn, flagga och region samt cca2 kod som används för flaggor
   */
  async function fetchAllcountries() {
      const url = `https://restcountries.com/v3.1/all?fields=name,region,cca2`;
      try {
          const response = await fetch(url);
          const info = await response.json();
          allCountries = info; // Sparar länderna i den globala arrayen
          showCountries(info); // Skickar med alla länderna för att visa dem i DOM 
          let regions = [];
          // Alla regioner för land som finns i arrayen från apiet
          info.forEach(region => {
              if (!regions.includes(region.region)) {
                  regions.push(region.region);
              }
          });
          // Skriver ut regionerna för land i DOM till det tidigare skapade select-elementet
          const regionsSelectEl = document.getElementById("region-to-select");
          regions.forEach(region => {
              regionsSelectEl.innerHTML += `
                <option value="${region}">${region}</option>
                `
          });
          // Felmeddelande
      } catch (error) {
          console.error("Felmeddelande vid hämtning av alla länder: ", error);
      }
  }
  /**
   * Genererar en lista av länder inom DOM, flagga och namn. Händelselyssnare när man klickar på ett land, namnet fylls då i till sökfältet.
   * @param {*} info - Arrayen med alla länder som hämtas från API för att kunna visa i DOM
   */
  function showCountries(info) {
      const countryListEl = document.getElementById("countrylist");
      countryListEl.innerHTML = ""; // Tömmer listan innan den fylls på igen

      // Laddat ned flaggor som ligger i mappen images/flags där filnamnet är landets kod, se för Sverige exempelvis
      info.forEach(country => { // Struktur
          const code = country.cca2.toLowerCase(); // Landets kod i små bokstäver för att hämta in rätt flagga från mappen
          countryListEl.innerHTML += `
                  <li class="countriesflag">
                <img src="/images/flags/${code}.svg" alt="${country.name.common} flagga" width="18px" loading="lazy" height="12px"></img>  
            <span class="country-name">${country.name.common}</span>
        </li>`
      });
      // När man klickar på ett land i listan av länder så skrivs det namnet in i sökfältet och fokuset hamnar sedan där
      const countryNameEl = document.querySelectorAll(".country-name"); // Alla länders namn
      const countryInputEl = document.getElementById("country-name-input"); // Sökfältet
      countryNameEl.forEach(country => {
          country.addEventListener("click", () => {
              countryInputEl.value = country.innerHTML;
              countryInputEl.focus(); // Fokus 
          });
      });
  }

  /**
   * Filtrerar listan av länder beroende på vad användaren skrivet för land i sökfältet.
   */
  function filterCountries(searchValue) {
      const filteredCountries = allCountries.filter(country =>
          country.name.common.toLowerCase().includes(searchValue)
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
              console.warn(`Landet "${countryInput}" hittades inte, försöker med översättning`)
              return fetchByTranslation(countryInput, searchError);
          }
          const currencyObject = data[0].currencies; // Informationen om landets valuta
          const currencyCode = Object.keys(currencyObject)[0]; // Valutakoden som landet använder
          displayCountry(data, currencyCode, countryInput); // Skickar med data och anropar funktionen för att visa information om landet i DOM
      } catch (error) {
          console.error("Felmeddelande: ", error);
      }
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
              console.warn(`Landet "${countryInput}" hittades inte med översättning`)
              searchError.innerHTML = `Landet "${countryInput}" hittades inte, prova med namnet på Engelska.` // Felmeddelande i DOM
              countriesDiv.classList.remove("hidden"); // För att visa listan med alla länder
              const countryCard = document.getElementById("country-card"); // landprofilen
              countryCard.classList.remove("show"); // Tar bort klassen show för att dölja informationen om landet
              countryCard.innerHTML = ""; // Tömmer hela landprofilen
              return;
          }
          const currency = document.getElementById("currency-converter");
          currency.innerHTML = "";
          const currencyObject = data[0].currencies; // Valutainformation
          const currencyCode = Object.keys(currencyObject)[0]; // Valutakoden
          currency.innerHTML = currencyCode;
          displayCountry(data, currencyCode, countryInput); // Anropar funktionen för att visa information om landet i DOM
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
      const flag = data[0].flags.png; // Flagga png
      const flagSvg = data[0].flags.svg; // Flagga svg
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
    <button id="countryMapBtn" aria-label="Visa en karta över landet">Visa karta över landet<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="m600-120-240-84-186 72q-20 8-37-4.5T120-170v-560q0-13 7.5-23t20.5-15l212-72 240 84 186-72q20-8 37 4.5t17 33.5v560q0 13-7.5 23T812-192l-212 72Zm-40-98v-468l-160-56v468l160 56Zm80 0 120-40v-474l-120 46v468Zm-440-10 120-46v-468l-120 40v474Zm440-458v468-468Zm-320-56v468-468Z"/></svg></button>
    <button id="showWeatherBtn" aria-label="Visa väderprognos">Se väderprognos<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M260-160q-91 0-155.5-63T40-377q0-78 47-139t123-78q25-92 100-149t170-57q117 0 198.5 81.5T760-520q69 8 114.5 59.5T920-340q0 75-52.5 127.5T740-160H260Zm0-80h480q42 0 71-29t29-71q0-42-29-71t-71-29h-60v-80q0-83-58.5-141.5T480-720q-83 0-141.5 58.5T280-520h-20q-58 0-99 41t-41 99q0 58 41 99t99 41Zm220-240Z"/></svg></button>
    <button id="showCurrencyBtn" aria-label="Visa valutakonverterare">Jämför valuta<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M480-40q-112 0-206-51T120-227v107H40v-240h240v80h-99q48 72 126.5 116T480-120q75 0 140.5-28.5t114-77q48.5-48.5 77-114T840-480h80q0 91-34.5 171T791-169q-60 60-140 94.5T480-40Zm-36-160v-52q-47-11-76.5-40.5T324-370l66-26q12 41 37.5 61.5T486-314q33 0 56.5-15.5T566-378q0-29-24.5-47T454-466q-59-21-86.5-50T340-592q0-41 28.5-74.5T446-710v-50h70v50q36 3 65.5 29t40.5 61l-64 26q-8-23-26-38.5T482-648q-35 0-53.5 15T410-592q0 26 23 41t83 35q72 26 96 61t24 77q0 29-10 51t-26.5 37.5Q583-274 561-264.5T514-250v50h-70ZM40-480q0-91 34.5-171T169-791q60-60 140-94.5T480-920q112 0 206 51t154 136v-107h80v240H680v-80h99q-48-72-126.5-116T480-840q-75 0-140.5 28.5t-114 77q-48.5 48.5-77 114T120-480H40Z"/></svg></button>
    `;

      // Eventlyssnare för att visa valutakonverteraren 
      const showCurrencyBtn = document.getElementById("showCurrencyBtn");
      const currencyEl = document.getElementById("currency-converter");
      currencyEl.innerHTML = "";
      showCurrencyBtn.addEventListener("click", () => {
          hideSections(); // Döljer alla sektioner  
          showCurrencyBtn.classList.add("active");
          currencyEl.classList.remove("hidden"); // Visar diagrammet med väderprognosen sedan
          setTimeout(() => {
              currencyEl.scrollIntoView({ behavior: "smooth" }); // Scrollar ner till konverteraren när den väl visas/200 ms
          }, 200);
      });

      // Struktur inom DOM för att visa valutakonverteraren, currencyCode är valutakoden för det land som användaren sökt på
      currencyEl.innerHTML += `
    <form id="currencyForm">
        <h3>Jämför och konvertera valutor</h3>
        <div class="fromToCurrency">
            <div class="fromCurrency"> 
                <label for="fromCurrency">Från: <img src="https://flagcdn.com/se.svg" class="flag" alt="Svenska flaggan" id="fromFlag" width="24px" height="20px"></label>
                <input type="text" id="fromCurrency" value="SEK" disabled>
            </div>
                <button type="button" aria-label="Ändra valutorna" id="changeCurrencyIcon"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="20px" fill="#1f1f1f"><path d="M280-120 80-320l200-200 57 56-104 104h607v80H233l104 104-57 56Zm400-320-57-56 104-104H120v-80h607L623-784l57-56 200 200-200 200Z"/></svg>
                </button> 
            <div class="toCurrency">
                    <label for="toCurrency">Till: <img src="${flagSvg}" class="flag" id="toFlag" alt="${countryName} flaggan" width="24px" height="20px"></label>
                    <input type="text" id="toCurrency" value="${currencyCode}">
            </div>
        </div>
                    <label for="amount">Belopp att konvertera</label>
                    <input type="number" id="amount" placeholder="Ange belopp" step="any" max="99999999">
                    <button id="convertBtn" aria-label="Konvertera valutorna">Konvertera<svg xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 -960 960 960" width="22px" fill="#1f1f1f"><path d="M482-160q-134 0-228-93t-94-227v-7l-64 64-56-56 160-160 160 160-56 56-64-64v7q0 100 70.5 170T482-240q26 0 51-6t49-18l60 60q-38 22-78 33t-82 11Zm278-161L600-481l56-56 64 64v-7q0-100-70.5-170T478-720q-26 0-51 6t-49 18l-60-60q38-22 78-33t82-11q134 0 228 93t94 227v7l64-64 56 56-160 160Z"/></svg></button>
            <div id="convertResult"></div>
    </form>
        `;

      const inputAmountEl = document.getElementById("amount"); // Inputfältet för att skriva in beloppet 
      inputAmountEl.addEventListener("input", () => {
          inputAmountEl.innerHTML = inputAmountEl.value.replace(",", "."); // Om användaren skriver med kommatecken görs det om till punkt
          const maxLength = 8; // Max antal tecken 
          if (inputAmountEl.value.length > maxLength) { // Jämför
              inputAmountEl.value = inputAmountEl.value.slice(0, maxLength);
          }
      });

      const currencyForm = document.getElementById("currencyForm");
      // Om fokuset ligger på inputfältet för att konvertera belopp i valutakonverteraren, så klickas konvertera-knappen
      currencyForm.addEventListener("submit", event => {
          event.preventDefault();
          convertBtn.click(); // Klick
          inputAmountEl.blur(); // Tar bort fokuset sedan
      });

      const fromCurrInp = document.getElementById("fromCurrency");
      const toCurrInp = document.getElementById("toCurrency");

      // Ändrar flaggan för valutan beroende på vilken valuta som angivits i från-inputen
      fromCurrInp.addEventListener("input", () => {
          const fromCurrency = fromCurrInp.value.toUpperCase();
          const fromFlag = document.getElementById("fromFlag");
          fromFlag.src = `https://flagcdn.com/${fromCurrency.slice(0, 2).toLowerCase()}.svg`; // Ändrar flagga efter valutakoden
          if (fromCurrency === "") { // Om inget har skrivits in inom valuta-inputen
              fromFlag.src = "";
              fromFlag.alt = "";
          }
      });

      // Ändrar flaggan för valutan beroende på vilken valuta som angivits i till-inputen
      toCurrInp.addEventListener("input", () => {
          const toCurrency = toCurrInp.value.toUpperCase();
          const toFlag = document.getElementById("toFlag");
          toFlag.src = `https://flagcdn.com/${toCurrency.slice(0, 2).toLowerCase()}.svg`;
          if (toCurrency === "") {
              toFlag.src = "";
              toFlag.alt = "";
          }
      });

      // När man klickar på ändra valuta-ikonen byts flaggornas bild genom src, alt-texten till bilderna samt valutavärdet inom input
      const changeCurrencyIcon = document.getElementById("changeCurrencyIcon"); //Ikon för att byta plats på valutorna i konverteraren
      let rotate = 0;

      changeCurrencyIcon.addEventListener("click", () => {
          const fromCurrencyInp = document.getElementById("fromCurrency");
          const toCurrencyInp = document.getElementById("toCurrency");
          const toFlag = document.getElementById("toFlag");
          const fromFlag = document.getElementById("fromFlag");
          rotate += 180; // Roterar med 180 grader vid varje klick
          changeCurrencyIcon.style.transform = `rotate(${rotate}deg)`; // Ikonen roteras ett halvt varv när man klickar på knappen

          const changeCurrency = fromCurrencyInp.value; // Ändrar valutan
          fromCurrencyInp.value = toCurrencyInp.value;
          toCurrencyInp.value = changeCurrency;

          const flagSrc = fromFlag.src // Ändrar flaggan
          fromFlag.src = toFlag.src;
          toFlag.src = flagSrc;

          const altSrc = fromFlag.alt; // Ändrar alt-text
          fromFlag.alt = toFlag.alt;
          toFlag.alt = altSrc;

          // Om valutan i inputen är SEK så inaktiveras inputfältet
          fromCurrencyInp.disabled = fromCurrencyInp.value.toUpperCase() === "SEK";
          toCurrencyInp.disabled = toCurrencyInp.value.toUpperCase() === "SEK";

      });

      // Eventlyssnare för att visa kartan över det land som användaren sökt på
      const countryMapBtn = document.getElementById("countryMapBtn");
      countryMapBtn.addEventListener("click", () => {
          createMap();
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

          const fromCurrency = document.getElementById("fromCurrency").value.toUpperCase(); // Valutakoden med enbart versaler
          const toCurrency = document.getElementById("toCurrency").value.toUpperCase(); // Valutakoden med enbart versaler

          // Om användaren inte skrivit in något belopp genereras ett felmeddelande i DOM
          if (!amount) {
              convertListEl.innerHTML = `<p id="currency-error">Ange ett giltigt belopp</p>`; // Felmeddelande
              return;
          }

          // Använder SEK som bas för valutakonverteraren, det som hämtas in från funktionen fetchCurrencyData
          let currencyConvert;
          if (fromCurrency === "SEK") {
              currencyConvert = toCurrency; // Jämför med till-valutan, SEK mot USD exempelvis
          } else {
              currencyConvert = fromCurrency; // Jämför med från-valutan USD mot SEK
          }

          // Hämtar in växlingskursen för SEK till den valutan som användaren sökt på och vill konvertera till i sökfältet
          // Genom destructuring plockas värdena ut från objektet som blir returnerade av funktionen 
          const { rate, updated, nextUpdate } = await fetchCurrencyData(currencyConvert);

          // Om det inte gick att hämta växlingskursen
          if (!rate) {
              convertListEl.innerHTML = `<p id="convertError">Kunde inte hämta valutan, försök igen</p>`;
              return;
          }

          let convertedAmount;
          // Om det inte är svenska som finns i från inputen så ändras valutakonverteraren
          if (fromCurrency === "SEK") {
              convertedAmount = amount * rate; // Multiplicerar beloppet
          } else if (toCurrency === "SEK") {
              convertedAmount = amount / rate; // Dividerar beloppet
          }

          const swedishFormat = convertedAmount.toLocaleString("sv-SE", { maximumFractionDigits: 2 }); // Gör om det konverterade beloppet svenskt format, max två decimaler
          // Beräknar det konverterade beloppet och skriver ut det i DOM samt när växlingskursen senast blev uppdaterad
          convertListEl.innerHTML = `
        <p class="money">${amount} ${fromCurrency} <span class="moneyError">=</span> ${swedishFormat} i ${toCurrency}</p>
        <p class="updateText">Senast uppdaterad kurs: <span class="updateDate">${updated}<span></p>
        <p class="updateText"> Ny uppdatering av kurs: <span class="updateDate">${nextUpdate}<span></p>
        `;
          setTimeout(() => {
              convertListEl.scrollIntoView({ behavior: "smooth" }); // Scrollar ner till det konverterade meddelandet när det visas med en delay på 200 ms
          }, 200);
      });

      const weatherInfo = await getWeatherForecast(capitalName); // Väntar på att få väderinformationen
      displayWeather(weatherInfo, capitalName); // Skickar med väderinformation och huvudstadens namn
      fetchCurrencyData(currencyCode); // Funktionen för att hämta valuta anropas med landets valutakod
  };

  /**
   * En funktion för att hämta in växelkurser från API, Exchangerate-API, med svenska valutan som bas.
   * Sparar växelkurser i localstorage för att återanvända och returnerar sedan växelkursen för landet som användaren sökt på i sökfältet.
   * @param {*} currencyCode - Valutakoden för det land som användaren sökt på, ex EUR
   * @returns {{rate: number, updated: string, nextUpdate: string}} - Ett objekt med:
   * - rate: Växelkurser som nummer med SEK som bas för det land som användaren söker på. Ex 1 SEK = 0.11 USD
   * - updated: När växelkurserna senaste blev uppdaterad som en textsträng, ex "Tisdag 10/3"
   * - nextUpdate: När växelkurserna kommer uppdateras nästa gång som en textsträng, ex "Onsdag 11/3"
   */
  async function fetchCurrencyData(currencyCode) {
      // Om det finns sparat i localstorage så hämtas valutorna där istället för att göra ett till och nytt API-anrop
      const storedCurrency = localStorage.getItem("currenciesSaved");
      if (storedCurrency) {
          const parsedCurrency = JSON.parse(storedCurrency); // Gör om till objekt
          const nowInUnixTime = Math.floor(Date.now() / 1000) // Nuvarande tid i sekunder. Date.now ger millisekunder därför dela med 1000
          if (nowInUnixTime < parsedCurrency.expires) { // Om tiden nu är mindre än tid för uppdatering så returneras de sparade valutorna från localstorage
              return { // Returnerar växelkursen för valutan och när den uppdaterades senast och när nästa uppdatering sker
                  rate: parsedCurrency.rates[currencyCode],
                  updated: parsedCurrency.updated,
                  nextUpdate: parsedCurrency.nextUpdate
              };
          } else { // Tar bort från localstorage och gör nytt api-anrop
              localStorage.removeItem("currenciesSaved");
          }
      }
      // Annars om inte valutorna finns lagrade i localstorage görs ett nytt api-anrop
      // URL för att anropa API med key och hämta växelkursen där SEK är bas
      const url = "https://v6.exchangerate-api.com/v6/b1e7b0cd61281ff6a98d18e0/latest/SEK";
      try {
          const response = await fetch(url);
          const data = await response.json();
          const rates = data.conversion_rates; // Alla växelkurser med SEK som bas
          const searchRate = rates[currencyCode]; // Växelkursen som användaren sökt på
          // Utskrift när kursen var senast uppdaterad till DOM
          const updCurrency = data.time_last_update_utc; // När växlingskursen senast var uppdaterad, utskrift i DOM
          const weekdays = ["Söndag", "Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag"]; // Veckodagar på svenska
          let day = new Date(updCurrency); // till ett datumobjekt
          const date = day.getUTCDate(); // Datum
          const month = day.getUTCMonth() + 1; // Månad
          const dayOfWeek = weekdays[day.getUTCDay()]; // Vilken veckodag det är när växlingskursen senast var uppdaterad, utskrift i DOM 
          const datePrint = `${dayOfWeek} ${date}/${month}`; // Utskriftsformat

          const nextUpdate = data.time_next_update_unix
          let nextUpdDay = new Date(nextUpdate * 1000);
          const nextDate = nextUpdDay.getUTCDate();
          const UpdMonth = nextUpdDay.getUTCMonth() + 1; // Månad
          const UpdDayOfWeek = weekdays[nextUpdDay.getUTCDay()]; // Vilken veckodag det är när växlingskursen senast var uppdaterad, utskrift i DOM 
          const nextUpdateDay = `${UpdDayOfWeek} ${nextDate}/${UpdMonth}`; // Utskriftsformat
          // Sparar växelkurserna och datum för senaste uppdatering i localstorage
          localStorage.setItem("currenciesSaved", JSON.stringify({
              rates: rates,
              updated: datePrint,
              nextUpdate: nextUpdateDay,
              expires: data.time_next_update_unix // Tid när APIet kommer uppdateras igen i unix med sekunder, då går tidigare uppdatering ut också = expires
          }));
          // Returnerar växelkursen för valutan som användaren sökt på och när den senast uppdaterades, allt som ett objekt
          return {
              rate: searchRate,
              updated: datePrint,
              nextUpdate: nextUpdateDay
          };
      } catch (error) {
          console.error("Felmeddelande: ", error); // Felmeddelande
      }
  };
  /**
   * Visar en karta över det land som användaren sökt på och samtidigt visar en markör över landet
   * @param {*} latitude - Koordinater för latitud som hämtas in från apiet
   * @param {*} longitude - Koordinater för longitud som hämtas in från apiet
   */
  function showCountryMap(latitude, longitude, countryInput) {
      createMap(); // Anropar funktionen för att skapa kartan
      hideSections(); // Dölj element som väderprognos, valutakonverterare
      const mapEl = document.getElementById("map"); // Hämtar in element från DOM
      mapEl.classList.remove("hidden"); // Visa kartan sedan
      visualMap.invalidateSize(); // Justerar kartans synliga storlek när den väl visas
      visualMap.setView([latitude, longitude], 4); // Uppdaterar kartans position efter landets koordinater, zoomar in lite på landet 
      if (marker) {
          visualMap.removeLayer(marker); // Om det redan finns en markör på kartan tas den bort innan den nya markören läggs till
      }
      marker = L.marker([latitude, longitude], { icon: myIcon, content: countryInput }).addTo(visualMap); // Markören sätts på kartan beroende på landets koordinater
      // marker.bindTooltip(`${countryInput}`).openTooltip(); // Tooltip med landets namn
  }
  /**
   * Funktion för att skapa en karta genom leaflet, openstreetmap samt Jawgmaps. 
   * Olika kartlager används från jawgmaps beroende på om användaren valt mörkt/ljust tema.
   */
  function createMap() {
      if (visualMap) return; // Om kartan redan skapats så behöver ingen ny skapas
      visualMap = true; // När kartan skapats sätts den till true för att inte behöva skapa en till varje gång man klickar på visa karta över ett land

      // Olika karter som går att använda, 
      const jawgToken = "6aUCDcns9wnFKVGcqzrnXSypntTzjgqY7YYoAsMa71MbVgHGNZ6wRokX3739muDB"; // Token sparad i variabel
      // Mörkare lager från jawg
      const jawgDarkTile = L.tileLayer(`https://tile.jawg.io/jawg-dark/{z}/{x}/{y}{r}.png?access-token=${jawgToken}`, {
          maxZoom: 19,
          attribution: '© <a href="https://www.jawg.io" target="_blank">Jawg Maps</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
      });
      // Ett ljusare kartlager från jawg
      const jawgLagoonTile = L.tileLayer(`https://tile.jawg.io/jawg-lagoon/{z}/{x}/{y}{r}.png?access-token=${jawgToken}`, {
          maxZoom: 19,
          attribution: '© <a href="https://www.jawg.io" target="_blank">Jawg Maps</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
      });
      // Vanliga lagret från openstreetmap, behöver ingen token
      /*const normalTile = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      });*/

      // Skapar kartan
      visualMap = L.map('map').setView([51.78, -7.03], 2); // Grundvy för kartan, utzoomad

      // För att ändra kartans lager om användaren befinner sig i mörkt eller ljust läge
      const darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches; // Om användaren har valt mörk tema
      if (darkMode) { // Använder mörk karta
          visualMap.removeLayer(jawgLagoonTile);
          jawgDarkTile.addTo(visualMap);
      } else { // Använder ljus karta
          visualMap.removeLayer(jawgDarkTile);
          jawgLagoonTile.addTo(visualMap);
      }

      // Lyssnar även på om man ändrar tema live, då ändras kartan också till rätt tema, ljust eller mörkt
      const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
      darkModeQuery.addEventListener("change", event => {
          const darkMode = event.matches;
          if (darkMode) { // Använder mörk karta
              visualMap.removeLayer(jawgLagoonTile);
              jawgDarkTile.addTo(visualMap);
          } else { // Använder ljus karta
              visualMap.removeLayer(jawgDarkTile);
              normalTile.addTo(visualMap);
          }
      });

      // Hämtar in ikonen
      myIcon = L.icon({
          iconUrl: "/images/travelMarker.svg", // Inhämtad svg som liknar flygplan
          className: 'my-marker-icon', // En klass för att styla in scss, animation och färger
          iconSize: [30, 30],
          iconAnchor: [15, 30]
      });
  }


  /**
   * Hämtar in väderprognos för huvudstaden i landet som användaren sökt på, ex Stockholm
   * @param {*} capitalName - Huvudstadens namn som används i api-anropet
   * @returns {object} - Väderinformationen för huvudstaden från apiet
   */
  async function getWeatherForecast(capitalName) {
      const apiKey = "3dc22c103acb482d9ee82613262602"; // Api-nyckel för apiet
      const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${capitalName}&days=3&aqi=no&alerts=no`; // Hela adressen för anrop
      try {
          const response = await fetch(url)
          const data = await response.json();
          if (!response.ok) { // Felmeddelande i konsoll och DOM om det inte går att hämta väderprognos
              console.warn(`Kunde inte hämta väderprognos för ${capitalName}`) // Felmeddelande som en varning i konsolen för landet

              const weatherContainerEl = document.getElementById("weatherContainer"); // Felmeddelande i DOM
              weatherContainerEl.innerHTML = `<p id="weather-error">Kunde inte hämta väderprognos för ${capitalName}.</p>`;
          }
          return data;
      } catch (error) { // Felmeddelandet
          console.error("Felmeddelande från hämtning av väder: ", error);
      }
  }
  /**
   * Visar väder för huvudstaden i det land som användaren sökt på. 
   * Anropar funktionen för att visa diagram för väderprognos
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
          diagramEl.style.display = "flex";
          diagramEl.style.flexDirection = "column";
          diagramEl.style.alignItems = "center";

          setTimeout(() => {
              diagramEl.scrollIntoView({ behavior: "smooth" }); // Scrollar ner till kartan när den väl visas som smooth, 0.2 sek delay  
          }, 200);
      });

      // Skapar struktur inom containern för att visa väder med celsius samt ikon för vädret, ex soligt/molnigt
      weatherContainerEl.innerHTML += `
            <p class="textInfo"> Väder just nu i ${weatherInfo.location.name}: <span class="glowy-text">${weatherInfo.current.temp_c}°C</span></p>
            <img id="weatherIcon" src="${weatherInfo.current.condition.icon}" alt="${weatherInfo.current.condition.text} width="60px" height="60px">`


      // Rubrik med huvudstadens namn samt diagrammet
      diagramEl.innerHTML += `
            <h3>Väderprognos för ${capitalName}</h3>
            <canvas id="myChart"></canvas>
            <canvas id="chartRainSnow"></canvas>`

      // Väderprognos kommande dagar som ska visas i diagrammet
      const weatherDays = weatherInfo.forecast.forecastday;
      const labels = weatherDays.map(day => day.date); // Datumen
      const avgTemp = weatherDays.map(day => day.day.avgtemp_c); // Genomsnittstemperaturen 

      // Lägsta, högsta temperatur och chansen för regn
      const lowestTemp = weatherDays.map(day => day.day.mintemp_c);
      const highestTemp = weatherDays.map(day => day.day.maxtemp_c);
      const chanceRain = weatherDays.map(day => day.day.daily_chance_of_rain);
      const chanceSnow = weatherDays.map(day => day.day.daily_chance_of_snow);

      // Skapa diagram som visar väderprognosen med temperatur tre dagar framåt
      const ctx = document.getElementById("myChart");
      new Chart(ctx, {
          type: 'line',
          data: {
              labels: labels,
              datasets: [{ // Genomsnittstemperatur
                      label: 'Temperatur genomsnitt',
                      data: avgTemp,
                      backgroundColor: ["#ff9900"],
                      hoverBackgroundColor: "#fff",
                      borderColor: "#ffa600",
                      borderWidth: 2,
                      order: 1,
                  }, { // Lägsta temp
                      label: 'Min-temp',
                      data: lowestTemp,
                      backgroundColor: ["#0019fc"],
                      hoverBackgroundColor: "#fff",
                      borderColor: "#0066ff",
                      borderWidth: 2,
                      order: 2,
                  },
                  { // Högsta temp
                      label: 'Max-temp',
                      data: highestTemp,
                      backgroundColor: ["#ff0000"],
                      hoverBackgroundColor: "#fff",
                      borderColor: "#f80000",
                      borderWidth: 2,
                      order: 3,
                  }
              ]
          },
          options: {
              responsive: true,
              maintainAspectRatio: false, // Responsiv
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
      }); // Skapar ett till diagram för att visa nederbörd tre dagar framöver
      const ctxRainSnow = document.getElementById("chartRainSnow");
      new Chart(ctxRainSnow, {
          type: 'bar',
          data: {
              labels: labels,
              datasets: [{ // Stapel för chans till regn
                  label: 'Chans för regn',
                  data: chanceRain,
                  backgroundColor: ["#0066ff"],
                  hoverBackgroundColor: "#0066ff77",
                  order: 1,
                  borderColor: "#000000",
                  barThickness: 30,
              }, { // Stapel för chans till snö
                  label: 'Chans för snö',
                  data: chanceSnow,
                  backgroundColor: ["#ffffff"],
                  hoverBackgroundColor: "#d3d3d38e",
                  order: 2,
                  borderColor: "#000000",
                  borderWidth: 2,
                  barThickness: 30,
              }]
          },
          options: {
              responsive: true,
              maintainAspectRatio: false, // Responsiv
              plugins: {
                  tooltip: {
                      callbacks: {
                          label: function(context) {
                              let label = context.dataset.label || '';
                              if (label) {
                                  label += ': ' + context.parsed.y + '%'; // Lägger till procent för nederbörd i tooltipen när man hoovrar, https://www.chartjs.org/docs/latest/configuration/tooltip.html
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
                              return value.toFixed(1) + '%'; // Lägger till procent för nederbörd på y-axeln samt minimerar till en decimal: https://www.chartjs.org/docs/latest/axes/styling.html
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
      diagramEl.style.display = "none"; // För att dölja diagrammet
      currencyEl.classList.add("hidden");
      countriesListDisplay.classList.add("hidden");
      if (countryMapBtn && showWeatherBtn && showCurrencyBtn) {
          countryMapBtn.classList.remove("active");
          showWeatherBtn.classList.remove("active");
          showCurrencyBtn.classList.remove("active");
      }
  }

  /*
   För att generera profilkortet för land långsamt
  
  function slowDisplay() {
      const countryProfile = document.getElementById("country-card");
      countryProfile.classList.add("show");
  } */

  /**
   * För att visa laddningsikon och overlay samt dölja huvudinnehållet i main
   */
  function showLoadingIcon() {
      const loadingIcon = document.getElementById("loadingIcon");
      const loadingOverlay = document.getElementById("loadingOverlay");
      const countrySection = document.getElementById("country-section");

      loadingOverlay.classList.remove("hidden");
      loadingIcon.classList.remove("hidden");
      setTimeout(() => {
          countrySection.classList.remove("hidden"); // Visar innehållet med sökfält när loadingikonen "laddat klart"
          loadingIcon.classList.add("hidden"); // Döljer ikonen efter väntetiden
          loadingOverlay.classList.add("hidden")
      }, 1515);
  }

  /*
Döljer laddningsikonen
   
  function hideLoadingIcon() {
      const loadingIcon = document.getElementById("loadingIcon");
      loadingIcon.classList.add("hidden");
  } */


  /**
   * Sorterar länder i ordningen A-Ö, justerar efter region, om användaren valt en specifik
   */
  function sortCountries() {
      const selectedRegion = document.getElementById("region-to-select").value; // 
      if (selectedRegion === "Alla") {
          const sortCountries = allCountries.sort((a, b) => a.name.common.localeCompare(b.name.common));
          showCountries(sortCountries);
      } else {
          const filteredCountries = allCountries.filter(country => country.region === selectedRegion);
          const sortCountries = filteredCountries.sort((a, b) => a.name.common.localeCompare(b.name.common));
          showCountries(sortCountries);
      }
  }
  /**
   * Sorterar länder i ordningen Ö-A, reverse och justerar efter region om användaren valt en specifik
   */
  function sortCountriesBackwards() {
      const selectedRegion = document.getElementById("region-to-select").value;
      if (selectedRegion === "Alla") {
          const sortCountries = allCountries.sort((a, b) => b.name.common.localeCompare(a.name.common));
          showCountries(sortCountries);
      } else {
          const filteredCountries = allCountries.filter(country => country.region === selectedRegion);
          const sortCountries = filteredCountries.sort((a, b) => b.name.common.localeCompare(a.name.common));
          showCountries(sortCountries);
      }
  }

  /**
   * Hämtar in landet som användaren sökt på i sökfältet,.
   * Visar en laddningsikon och genererar sedan ett profilkort med info om det land som användaren sök på.
   * @returns - Felmeddelande om användaren lämnat sökfältet blankt vid sökning
   */
  function searchLand() {
      const countryInputEl = document.getElementById("country-name-input"); // Inputfält där användaren skriver in landets namn
      const countryCard = document.getElementById("country-card"); // landprofilen
      const searchError = document.getElementById("country-error"); // Felmeddelande som kan visas i DOM
      const countriesDiv = document.getElementById("countriesDiv"); // Listan med alla länder
      const countrySection = document.getElementById("country-section");
      const countriesListDisplay = document.getElementById("countriesDisplay"); // Div där listan med alla länder ligger
      const divDropDown = document.getElementById("dropdownMenu");
      const showCountriesBtn = document.getElementById("moreCountries"); // Knappen för att visa alla länder

      const searchInput = countryInputEl.value.trim(); // tar bort mellanslag
      if (searchInput === "") { // Felmeddelande om man inte sökar på någonting
          searchError.innerHTML = "Vänligen, fyll i ett land"; // Felmeddelande i DOM
          return;
      }

      const countryInput = searchInput.charAt(0).toUpperCase() + searchInput.slice(1).toLowerCase(); // Gör första bokstaven i landets namn till en versal och resten till gemener

      countryCard.innerHTML = ""; // Tar bort allt från landsprofilen
      countryCard.classList.remove("show"); // Tar bort klassen show för att dölja informationen om

      showLoadingIcon(); // Laddningsikon som går igång och visas efter man klickat på sök
      countrySection.classList.add("hidden");
      countriesDiv.classList.add("hidden"); // Döljer listan med alla länder
      hideSections(); // Döljer karta, väderprognos och valutakonverterare 
      countriesListDisplay.classList.add("hidden");
      divDropDown.classList.add("hidden");
      showCountriesBtn.firstChild.textContent = "Visa alla länder"; // Ändrar namn på knappen
      // Timeout
      setTimeout(() => {
          fetchCountry(countryInput, searchError); // Anropar funktionen för att hämta datan om landet beroende på vad användaren sökt på
          //main.classList.remove("hidden");
          countryCard.classList.add("show"); // Lägger på klassen show för att visa elementet
          countryCard.scrollIntoView({ behavior: "smooth" }); // Scrollar ner information om landet/profil-kortet
      }, 1350);
  }

  /**
   * Visar eller döljer listan av länder när man söker på land.
   */
  function showListAllCountries() {
      const countriesListDisplay = document.getElementById("countriesDisplay"); // Div där listan med alla länder ligger
      const showCountriesBtn = document.getElementById("moreCountries"); // Knappen för att visa alla länder
      const divDropDown = document.getElementById("dropdownMenu"); // Sortera och filtrera listan elementen
      const arrowIcon = document.getElementById("arrowIcon"); // Ikonen (chevron) som pilar i knappen

      if (countriesListDisplay.classList.contains("hidden")) {
          hideSections(); // Döljer element som karta, diagram
          countriesListDisplay.classList.remove("hidden"); // Visar listan med alla länder
          divDropDown.classList.remove("hidden");
          showCountriesBtn.firstChild.textContent = "Dölj länder"; // Ändrar namn på knappen
          arrowIcon.style.transform = "rotate(180deg)"; // Ändrar ikonen till uppåtpil
      } else { // När listan visas och användaren klickar igen på knappen för att söka land så döljs listan
          countriesListDisplay.classList.add("hidden");
          divDropDown.classList.add("hidden");
          showCountriesBtn.firstChild.textContent = "Visa alla länder";
          arrowIcon.style.transform = "rotate(0deg)"; // Ändrar ikonen till nedåtpil
      }
  };

  /**
   * Skapar ett "tipsmeddelande" ovanför sökfältet till land för användaren. 
   */
  function createTipsMsg() {
      // Skapar tipsmeddelande och lägger till efter rubriken och i diven
      const countrySearch = document.getElementById("country-search");
      const tipMessage = document.createElement("p");
      tipMessage.id = "hint";
      tipMessage.classList.add("hiddenText");
      tipMessage.textContent = "Sök både svenska och engelska namn";
      countrySearch.prepend(tipMessage);
      const hintEl = document.getElementById("hint");

      // Sätter igång en timeout som visar tipsmeddelandet och sedan döljer det igen.
      setTimeout(() => {
          hintEl.classList.remove("hiddenText"); // Visar tipset efter 3 sek
      }, 3000);

      setTimeout(() => {
          hintEl.classList.add("hiddenText"); // Döljer tipset
      }, 11000);
  }

  /**
   * Skapar en meny med knapp för att sortera samt filtrera länder i listan. 
   */
  function createDivDropDown() {
      // Skapar div för att sortera bland kategorier
      const showCountriesBtn = document.getElementById("moreCountries"); // Knappen som man kan klicka på för att visa länderna
      const divDropDown = document.createElement("div"); // Skapar div
      divDropDown.id = "dropdownMenu"; // Ger div ett id
      divDropDown.className = "hidden"; // Dold i början

      // Struktur inom DOM för att sortera och filtrera länder, efter regioner
      divDropDown.innerHTML += `
        <p class="sortCountries">Sortera: <button id="sortHint" role="button" aria-label="Sortera länder efter namn" tabindex="0">Namn</button></p>
        <label for="region-to-select">Regioner:
        <select id="region-to-select">
        <option value="Alla">Alla</option>
        </select></label>
        `;
      // Lägger till dropdownmenyn till DOM efter knappen för att visa länder
      showCountriesBtn.insertAdjacentElement("afterend", divDropDown);
  };