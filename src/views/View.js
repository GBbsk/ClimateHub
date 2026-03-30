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
        selectLoadingScrenn, selectListCity,
        selectDaysOfWeek) {

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

        this.daysOfWeek = document.querySelectorAll(selectDaysOfWeek)
    }

    bindBtnSearchCity(handler){
        this.btnSearch.addEventListener("click", handler)
    };

    bindInputSearchBarEnter(handler){
        this.searchBar.addEventListener("keydown", (e) => {
                handler(e)
        })
    };

    bindInputSearchBarTyping(handler){
        this.searchBar.addEventListener("input", (e) => {
            handler(e)
        });
    };

    bindBtnTempSwitch(handler){
        this.tempSwitch.addEventListener("change", handler)
    };

    showData(dados) {
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

    updateTime(timeString) {
        this.currentTime.textContent = timeString;
    }

    updateDayWeek(day){
        this.daysOfWeek.forEach(card => {
            card.classList.toggle('active', card.dataset.dia === day)
        })
    }

    showSymbol(symbol){
        this.symbolTemperature.forEach(item => {
            item.textContent = symbol;
        });
    };

    bindDropdownClick(handler){
        this.listCitys.addEventListener('click', (e) => {
            e.preventDefault();
        
            const item = e.target.closest('.dropdown-item');
            if (!item) return;
            
            const index = parseInt(item.dataset.index);
            
            // Chamar o handler do controller
            handler(index);
        });
    }

    // Estrutura do dropDown 
    showDropDown(data) {
    // Caso 1: Loading
        if (data === 'loading') {
            this.listCitys.innerHTML = '<li><span class="dropdown-item text-white">Buscando...</span></li>';
            this.listCitys.style.display = 'block';
            return;
        }
    
    // Caso 2: Erro
        if (data === 'error') {
            this.listCitys.innerHTML = '<li><span class="dropdown-item text-danger">Erro ao buscar</span></li>';
            this.listCitys.style.display = 'block';
            return;
        }
    
    // Caso 3: Sem resultados
        if (!data || data.length === 0) {
            this.listCitys.innerHTML = '<li><span class="dropdown-item">Nenhuma cidade encontrada</span></li>';
            this.listCitys.style.display = 'block';
            return;
        }
    
    // Caso 4: Renderizar cidades
        this.listCitys.innerHTML = '';
        
        data.forEach((cidade, index) => {
            const li = document.createElement('li');
            
            li.innerHTML = `
                <a class="dropdown-item" href="#" data-index="${index}">
                    <strong>${cidade.nome}</strong>
                    <small class="text-white opacity-75 d-block">
                        ${cidade.estado ? cidade.estado + ', ' : ''}${cidade.pais}
                    </small>
                </a>
            `;
            
            this.listCitys.appendChild(li);
        });
        
            this.listCitys.style.display = 'block';
        };
}