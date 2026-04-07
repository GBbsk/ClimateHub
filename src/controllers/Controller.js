import { Model } from '../models/Model.js';
import { View } from '../views/View.js';
import { CityService } from '../services/cityService.js';
import { WeatherService } from '../services/weatherService.js';
import { CacheService } from '../services/cacheService.js';
import { GeolocationService } from '../services/geoService.js';


export class Controller {
    constructor(model, view, cityService, weatherService, cacheService, geoService) {
        this.model = model;
        this.view = view;
        this.cityService = cityService;
        this.weatherService = weatherService;
        this.cacheService = cacheService;
        this.geoService = geoService

        this.loadingTimeout = null;

        this.timer = null;
        this.listaDeCidades = []

        this.view.bindBtnSearchCity(this.searchCity.bind(this))
        this.view.bindInputSearchBarEnter(this.verificarEnter.bind(this))
        this.view.bindBtnTempSwitch(this.symbolSwitchAutomatic.bind(this))

        this.view.bindInputSearchBarTyping(this.debounceSearch.bind(this))
        this.view.bindDropdownClick(this.handleCitySelect.bind(this))

    }

    async init(){
        setInterval(() => {
        this.showTime();
        }, 1000); 

        const sucesso = await this.geolocationIP()
    
        if (!sucesso) {
            console.log('Geolocalização falhou, usando São Paulo')
            await this.searchCity("São Paulo")
        }

        this.showDayOfWeek()
    };

    verificarEnter(e){
        if(e.key === "Enter"){
            e.preventDefault();
            this.searchCity();
        }
    };

    debounceSearch(){
        clearTimeout(this.timer)
        const cityName = this.view.searchBar.value.trim()

        if (cityName.length < 3) {
            this.view.listCitys.style.display = 'none';
            return;
        };

        this.timer = setTimeout(() => {
            this.searchCityAutoComplete(cityName)
        }, 500);
    };

    handleCitySelect(index) {
        const cidadeSelecionada = this.listaDeCidades[index];

        this.view.searchBar.value = cidadeSelecionada.nome;
        
        this.view.listCitys.style.display = 'none';
        
        this.searchClimate(cidadeSelecionada);
    };

    symbolUnitCheck(){
        return this.view.tempSwitch.checked 
        ? { simbolo: "°F", unidade: "imperial" } 
        : { simbolo: "°C", unidade: "metric" };
    };

    async symbolSwitchAutomatic(){
        if (this.model.historico.length > 0) {
        const ultimoBusca = this.model.historico[this.model.historico.length - 1];
        
        const nomeDaCidade = ultimoBusca.cidade.nome;
        
        await this.searchCity(nomeDaCidade);
        }
    };

    showTime(){
        const agora = new Date();

        const horaFormatada = agora.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        this.view.updateTime(horaFormatada);
    };

    showDayOfWeek(){
        const hoje = new Date().getDay();

        const dias = [
        'domingo',
        'segunda',
        'terca',
        'quarta',
        'quinta',
        'sexta',
        'sabado'
        ];

        const diaAtual = dias[hoje];

        this.view.updateDayWeek(diaAtual)
    };

    async searchCityAutoComplete(nameCity) {
        // const { unidade } = this.symbolUnitCheck();

        try {
            this.view.showDropDown('loading');
            const response = await this.cityService.buscarCidades(nameCity)

            if (!response) {
                throw new Error('Erro ao buscar cidade');
            }

            this.listaDeCidades = response.cidade;
            
            this.view.showDropDown(this.listaDeCidades); 

        } catch (error) {
            console.error(error);
            this.view.showDropDown('error');
        };
    };

    async searchCity(name) {
        const nameCity = this.view.searchBar.value.trim() || name;

        if(!nameCity){
            alert ("Digite o nome de uma cidade, por favor!")
            return 
        };

        try {
            this.showLoading()

            const citys = await this.cityService.buscarCidades(nameCity)

            if (citys.cidade && citys.cidade.length > 0) {
                this.searchClimate(citys.cidade[0]);
            } else {
                alert("Cidade não encontrada.");
            }

        } catch (error) {
            console.error(error);
        } finally {
            this.hiddenLoading()
        }
    };

    
    async searchClimate(dados){
        const { simbolo, unidade } = this.symbolUnitCheck();

        const { lat, lon, nome, pais, estado } = dados;

        const dataFULL = { lat, lon, nome, pais, estado, unidade };

        try {
            this.showLoading()
                        
            const clima = await this.weatherService.searchClimateAPI(dataFULL)
            
            this.model.adicionarHistorico(clima)

            this.view.showData(clima);
            this.view.showSymbol(simbolo);
            
        } catch (error) {
            console.error(error);
        } finally {
            this.hiddenLoading();
            this.view.searchBar.value = "";
        };
    };
    
    async geolocationIP(){
        try {
            this.showLoading()

            const cachedLocation = this.cacheService.obter('userLocation');

            if(cachedLocation){
                await this.searchCity(cachedLocation)
                return true
            }

            // console.log('Buscando nova localização...')
            const req = await this.geoService.geolocationIP()

            if (!req) {
                throw new Error(erro.error || 'Erro ao obter localização')
            }
           
            this.cacheService.salvar('userLocation', req.nameCity) // res.nameCity - se der erro           
            await this.searchCity(req.nameCity)
            return true;

        } catch (error){
            console.error('Erro na geolocalização:', error.message)
            return false;
        } finally {
            this.hiddenLoading()
        }
    };

    showLoading(){
        if (this.loadingTimeout) {
            clearTimeout(this.loadingTimeout);
        }

        this.loadingTimeout = setTimeout(() => {
            this.view.loadingScreen.classList.remove("d-none");
        }, 300);
    };

    hiddenLoading(){
        if (this.loadingTimeout) {
            clearTimeout(this.loadingTimeout);
            this.loadingTimeout = null;
        }

        this.view.loadingScreen.classList.add("d-none");
    };

}