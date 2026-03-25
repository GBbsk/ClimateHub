export class View {
    constructor(
        selectSearchBar, selectCurrentTime,
        selectDisplayNameCity, selectCurrentClimate,
        selectThermalSensation, selectThermalSensationTemperature,
        selectCurrentTemperature, selectSymbolTemperature,
        selectHumidityValue, selectWindValue,
        selectVisibilityValue, selectPressureValue, 
        selectSunriseDisplay, selectSunsetDisplay, 
        selectTempUnitSwitch, selectBtnSearch, 
        selectLoadingScrenn, selectListCity) {

        this.searchBar = document.querySelector(selectSearchBar)
        this.currentTime = document.querySelector(selectCurrentTime)

        this.displayNameCity = document.querySelector(selectDisplayNameCity)
        this.currentClimate = document.querySelector(selectCurrentClimate)
        this.thermalSensation = document.querySelector(selectThermalSensation)
        this.thermalSensationTemperature = document.querySelector(selectThermalSensationTemperature)
        this.currentTemperature = document.querySelector(selectCurrentTemperature)

        this.symbolTemperature = document.querySelectorAll(selectSymbolTemperature)
        this.humidityValue = document.querySelector(selectHumidityValue)
        this.windValue = document.querySelector(selectWindValue)
        this.visibilityValue = document.querySelector(selectVisibilityValue)
        this.pressureValue = document.querySelector(selectPressureValue)

        this.sunriseDisplay = document.querySelector(selectSunriseDisplay)
        this.sunsetDisplay = document.querySelector(selectSunsetDisplay)

        this.tempSwitch = document.querySelector(selectTempUnitSwitch)
        this.btnSearch = document.querySelector(selectBtnSearch)

        this.loadingScreen = document.querySelector(selectLoadingScrenn)
        this.listCitys = document.querySelector(selectListCity)
    }

    bindBtnBuscarCidade(handler){
        this.btnSearch.addEventListener("click", handler)
    };

    bindInputBuscarCity(handler){
        this.searchBar.addEventListener("keydown", (e) => {
                handler(e)
        })
    };

    bindInputBuscarCityInput(handler){
        this.searchBar.addEventListener("input", (e) => {
            handler(e)
        });
    };

    bindBtnTempSwitch(handler){
        this.tempSwitch.addEventListener("change", handler)
    };

    exibirInfos(dados) {
        const { cidade, clima } = dados;
        
        this.displayNameCity.textContent = `${cidade.nome}, ${cidade.pais}`;
        this.currentTemperature.textContent = `${clima.temperatura}`;
        this.thermalSensationTemperature.textContent = `${clima.sensacaoTermica}`;
        this.currentClimate.textContent = `${clima.climaAtual}`;

        this.humidityValue.textContent = `${clima.humidade}%`;

        this.windValue.textContent = `${clima.vento} Km/h`;
        this.visibilityValue.textContent = `${clima.visibilidade} Km`;
        this.pressureValue.textContent = `${clima.pressao} hPa`

        this.sunriseDisplay.textContent = `${clima.nascerDoSol}`;
        this.sunsetDisplay.textContent = `${clima.porDoSol}`;
    };

    exibirSymbols(symbol){
        this.symbolTemperature.forEach(item => {
            item.textContent = symbol;
        });
    };



}