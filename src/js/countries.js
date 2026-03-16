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
  let visualMap;
  let marker;
  let myIcon;

  let allCountries = []; // Global Array för länder som används för att filtrera sökresultat

  // Inväntar att DOM har laddats in
  addEventListener("DOMContentLoaded", () => {

      // Sparar variabler som finns inom DOM
      const countryInputEl = document.getElementById("country-name-input");
      const searchBtn = document.getElementById("search-button");
      const searchError = document.getElementById("country-error");
      const countriesListDisplay = document.getElementById("countriesDisplay");
      const showCountriesBtn = document.getElementById("moreCountries");
      const countriesDiv = document.getElementById("countriesDiv");
      const countrySection = document.getElementById("country-section");
      const countrySearch = document.getElementById("country-search");
      const countryCard = document.getElementById("country-card");

      // Lägger till rubrik
      const headline = document.getElementById("headline")
      headline.textContent = "Vilket land vill du resa till?"; // Huvudrubrik
      countrySection.prepend(headline); // Lägger till huvudrubriken först inom sektionselementet

      // Skapar tipsmeddelande och lägger till efter rubriken och i diven
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

      // Skapar div för att sortera bland kategorier
      const divDropDown = document.createElement("div");
      divDropDown.id = "dropdownMenu";
      divDropDown.className = "hidden";

      // Struktur inom DOM för att sortera och filtrera länder, efter regioner
      divDropDown.innerHTML += `
        <p class="sortCountries">Sortera: <span id="sortHint">Namn</span></p>
        <label for="region-to-select">Regioner:
        <select id="region-to-select">
        <option value="Alla">Alla</option>
        </select></label>
        `;

      // Lägger till dropdownmenyn till DOM efter knappen för att visa länder
      showCountriesBtn.insertAdjacentElement("afterend", divDropDown);

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

      fetchAllcountries(); // Hämtar alla länder efter att DOM laddats in


      // Eventlyssnare när användaren klickar på "Enter-tangenten", initierar sökningen av land
      countryInputEl.addEventListener("keydown", event => {
          if (event.key === "Enter") { // Om man skriver i sökfältet för land och trycker på enter
              event.preventDefault();
              searchBtn.click(); // Simulerar klick på sökknappen
              countryInputEl.blur(); // Tar bort fokuset från sökfältet och sökförslag
          }
      });

      /*
      // Olika kartor som jag kan använda på hemsidan
      /* const darkmodeTile = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
           maxZoom: 19,
           attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
       });  
       const jawgStreetsTile = L.tileLayer(`https://tile.jawg.io/jawg-streets/{z}/{x}/{y}{r}.png?access-token=${jawgToken}`, {
           maxZoom: 19,
           attribution: '© <a href="https://www.jawg.io" target="_blank">Jawg Maps</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
       });

        const stadiaTile = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
            maxZoom: 19
        });

        const voyagerTile = L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
            maxZoom: 19,
        }); */



      // Olika karter som går att använda, jawg har en token som jag sparat som en variabel.
      const jawgToken = "6aUCDcns9wnFKVGcqzrnXSypntTzjgqY7YYoAsMa71MbVgHGNZ6wRokX3739muDB";
      const jawgDarkTile = L.tileLayer(`https://tile.jawg.io/jawg-dark/{z}/{x}/{y}{r}.png?access-token=${jawgToken}`, {
          maxZoom: 19,
          attribution: '© <a href="https://www.jawg.io" target="_blank">Jawg Maps</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
      });

      const jawgLagoonTile = L.tileLayer(`https://tile.jawg.io/jawg-lagoon/{z}/{x}/{y}{r}.png?access-token=${jawgToken}`, {
          maxZoom: 19,
          attribution: '© <a href="https://www.jawg.io" target="_blank">Jawg Maps</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
      });

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
              jawgLagoonTile.addTo(visualMap);
          }
      });

      // Hämtar in ikonen
      myIcon = L.icon({
          iconUrl: "/images/travelMarker.svg", // Inhämtad svg som liknar flygplan
          className: 'my-marker-icon', // En klass för att styla in scss, animation och färger
          iconSize: [30, 30],
          iconAnchor: [15, 30]
      });


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
          let searchInput = countryInputEl.value.trim(); // tar bort mellanslag
          if (searchInput === "") { // Felmeddelande om man inte sökar på någonting
              searchError.innerHTML = "Vänligen, fyll i ett land"; // Felmeddelande i DOM
              return;
          }
          countryCard.innerHTML = ""; // Tar bort allt från landsprofilen
          countryCard.classList.remove("show"); // Tar bort klassen show för att dölja informationen om
          const countryInput = searchInput.charAt(0).toUpperCase() + searchInput.slice(1).toLowerCase(); // Gör första bokstaven i landets namn till en versal och resten till gemener


          showLoadingIcon(); // Laddningsikon som går igång och visas efter man klickat på sök
          countrySection.classList.add("hidden");
          countriesDiv.classList.add("hidden"); // Döljer listan med alla länder
          hideSections(); // Döljer karta, väderprognos och valutakonverterare 
          countriesListDisplay.classList.add("hidden");
          divDropDown.classList.add("hidden");
          showCountriesBtn.firstChild.textContent = "Visa alla länder"; // Ändrar namn på knappen
          arrowIcon.textContent = "keyboard_arrow_down"; // Ändrar ikonen till nedåtpil
          // Timeout
          setTimeout(() => {
              fetchCountry(countryInput, searchError); // Anropar funktionen för att hämta datan om landet beroende på vad användaren sökt på
              //main.classList.remove("hidden");
              countryCard.classList.add("show"); // Lägger på klassen show för att visa elementet
              countryCard.scrollIntoView({ behavior: "smooth" }); // Scrollar ner information om landet/profil-kortet
          }, 1350);
      });

      // När användaren klickar på knappen för att visa alla länder
      showCountriesBtn.addEventListener("click", () => {
          const arrowIcon = document.getElementById("arrowIcon"); // Ikonen (chevron) som pilar i knappen
          if (countriesListDisplay.classList.contains("hidden")) {
              hideSections(); // Döljer element som karta, diagram
              countriesListDisplay.classList.remove("hidden"); // Visar listan med alla länder
              divDropDown.classList.remove("hidden");
              showCountriesBtn.firstChild.textContent = "Dölj länder"; // Ändrar namn på knappen
              arrowIcon.textContent = "keyboard_arrow_up"; // Ändrar ikonen till uppåtpil
          } else { // När listan visas och användaren klickar igen på knappen, så döljs listan
              countriesListDisplay.classList.add("hidden");
              divDropDown.classList.add("hidden");
              showCountriesBtn.firstChild.textContent = "Visa alla länder";
              arrowIcon.textContent = "keyboard_arrow_down"; // Ändrar ikonen till nedåtpil
          }
      });
  });
  /**
   * Funktion som hämtar in alla länder som finns från Restcountries API med namn, flagga och region. 
   */
  async function fetchAllcountries() {
      const url = `https://restcountries.com/v3.1/all?fields=name,flags,region`;
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
      countryListEl.innerHTML = ""; // Tömmer listan innan den fylls på igen
      info.forEach(country => { // Struktur
          countryListEl.innerHTML += `
        <li class="countriesflag">
            <img src="${country.flags.svg}" alt="${country.name.common} flagga" width="18px" height="12px" loading="lazy">
            <span class="country-name">${country.name.common}</span>
        </li>`
      });
      // När man klickar på ett land i listan av länder så skrivs det namnet in i sökfältet och fokuset hamnar sedan där
      const countryNameEl = document.querySelectorAll(".country-name");
      const countryInputEl = document.getElementById("country-name-input");
      countryNameEl.forEach(country => {
          country.addEventListener("click", () => {
              countryInputEl.value = country.innerHTML;
              countryInputEl.focus(); // Fokus 
          });
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
                <svg xmlns="http://www.w3.org/2000/svg" id="changeCurrencyBtn" height="24px" viewBox="0 -960 960 960" width="20px" fill="#1f1f1f"><path d="M280-120 80-320l200-200 57 56-104 104h607v80H233l104 104-57 56Zm400-320-57-56 104-104H120v-80h607L623-784l57-56 200 200-200 200Z"/></svg>
            <div class="toCurrency"> 
                    <label for="toCurrency">Till: <img src="${flagSvg}" class="flag" id="toFlag" alt="${countryName} flaggan" width="24px" height="20px"></label>
                    <input type="text" id="toCurrency" value="${currencyCode}">
            </div>
        </div>
                    <label for="amount">Belopp att konvertera</label>
                    <input type="number" id="amount" placeholder="Ange belopp" step="any" max="99999999">
                    <button id="convertBtn">Konvertera</button>
            <div id="convertResult"></div>
    </form>
        `;

      const inputAmountEl = document.getElementById("amount"); // Inputfältet för att skriva in beloppet 
      inputAmountEl.addEventListener("input", () => {
          inputAmountEl.innerHTML = inputAmountEl.value.replace(",", "."); // Om användaren skriver med kommatecken görs det om till punkt
          const maxLength = 8;
          if (inputAmountEl.value.length > maxLength) {
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
          fromFlag.src = `https://flagcdn.com/${fromCurrency.slice(0, 2).toLowerCase()}.svg`;
          if (fromCurrency === "") {
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
      const changeCurrencyBtn = document.getElementById("changeCurrencyBtn"); //
      changeCurrencyBtn.addEventListener("click", () => {
          const fromCurrencyInp = document.getElementById("fromCurrency");
          const toCurrencyInp = document.getElementById("toCurrency");
          const toFlag = document.getElementById("toFlag");
          const fromFlag = document.getElementById("fromFlag");

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

          // Beräknar det konverterade beloppet och skriver ut det i DOM samt när växlingskursen senast blev uppdaterad
          convertListEl.innerHTML = `
        <p class="money">${amount} ${fromCurrency} <span class="moneyError">=</span> ${convertedAmount.toFixed(2)} i ${toCurrency}</p>
        <p>Senast uppdaterad kurs: <span class="updateDate">${updated}<span></p>
        <p> Ny uppdatering av kurs: <span class="updateDate">${nextUpdate}<span></p>
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
   * @returns {rate: number, updated: string} - Ett objekt med:
   * - rate: Växelkurser som nummer med SEK som bas för det land som användaren söker på. Ex 1 SEK = 0.11 USD
   * - updated: När växelkurserna senaste blev uppdaterad som en textsträng, ex "Tisdag 10/3"
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
          //console.log("Svarsresultat:", data);
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
          diagramEl.style.display = "flex";
          diagramEl.style.flexDirection = "column";
          diagramEl.style.alignItems = "center";

          setTimeout(() => {
              diagramEl.scrollIntoView({ behavior: "smooth" }); // Scrollar ner till kartan när den väl visas  
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
              datasets: [{
                      label: 'Temperatur genomsnitt',
                      data: avgTemp,
                      backgroundColor: ["#ff9900"],
                      hoverBackgroundColor: "#fff",
                      borderColor: "#ffa600",
                      borderWidth: 2,
                      order: 1,
                  }, {
                      label: 'Min-temp',
                      data: lowestTemp,
                      backgroundColor: ["#0019fc"],
                      hoverBackgroundColor: "#fff",
                      borderColor: "#0026ff94",
                      borderWidth: 2,
                      order: 2,
                  },
                  {
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
              datasets: [{
                  label: 'Chans för regn',
                  data: chanceRain,
                  backgroundColor: ["#0066ff"],
                  hoverBackgroundColor: "#0066ff77",
                  order: 1,
                  borderColor: "#000000",
                  barThickness: 30,
              }, {
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

  /**
   * För att generera profilkortet för land långsamt
   */
  function slowDisplay() {
      const countryProfile = document.getElementById("country-card");
      countryProfile.classList.add("show");
  }

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

  /**
   * Döljer laddningsikonen
   */
  function hideLoadingIcon() {
      const loadingIcon = document.getElementById("loadingIcon");
      loadingIcon.classList.add("hidden");
  }
  /**
   * Sorterar länder i ordningen A-Ö
   */
  function sortCountries() {
      const selectedRegion = document.getElementById("region-to-select").value;
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
   * Sorterar länder i ordningen Ö-A, reverse
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