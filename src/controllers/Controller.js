import { Model } from '../models/Model.js';
import { View } from '../views/View.js';
import { AuthService } from '../services/authService.js'

export class Controller {
    constructor(model, view, AuthService) {
        this.model = model;
        this.view = view;
        this.AuthService = AuthService 
        this.loadingTimeout = null;

        this.timer = null;
        this.listaDeCidades = []

        this.view.bindBtnSearchCity(this.searchCity.bind(this))
        this.view.bindInputSearchBarEnter(this.verificarEnter.bind(this))
        // this.view.bindBtnTempSwitch(this.symbolUnitCheck.bind(this))
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
        }, 1000);
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
        const { unidade } = this.symbolUnitCheck();

        try {
            this.view.showDropDown('loading');
            const response = await fetch(`/api/cidade?city=${nameCity}&units=${unidade}`);

            if (!response.ok) {
                const erro = await response.json();
                throw new Error(erro.error || 'Erro ao buscar cidade');
            }

            const data = await response.json(); 
            this.listaDeCidades = data.cidade;
            
            this.view.showDropDown(this.listaDeCidades); 

        } catch (error) {
            console.error(error);
            this.view.showDropDown('error');
        };
    };

    async searchCity(name) {
        const nameCity = this.view.searchBar.value.trim() || name;
        const { unidade } = this.symbolUnitCheck();

        if(!nameCity){
            alert ("Digite o nome de uma cidade, por favor!")
            return 
        };

        try {
            this.showLoading()

            const response = await fetch(`/api/cidade?city=${nameCity}&units=${unidade}`)

            if (!response.ok) {
                const erro = await response.json()
                throw new Error(erro.error || 'Erro ao buscar cidade');
            }

            const data = await response.json(); 

            if (data.cidade && data.cidade.length > 0) {
                this.searchClimate(data.cidade[0]);
            } else {
                alert("Cidade não encontrada.");
            }
            // console.log(`BUSCAR CIDADE ${data.cidade[0].nome}`)

        } catch (error) {
            console.error(error);
        } finally {
            this.hiddenLoading()
        }
    };

    
    async searchClimate(dados){
        
        const { simbolo, unidade } = this.symbolUnitCheck();
        
        try {
            this.showLoading()
            
            const response = await fetch("/api/clima", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...dados,
                    units: unidade
                })
            });
            
            if (!response.ok) {
                const erro = await response.json()
                throw new Error(erro.error || 'Erro ao buscar cidade');
            };

            const data = await response.json();
            
            this.model.historico.push(data)

            this.view.showData(data);
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

            const cachedLocation = localStorage.getItem('userLocation');
            const cacheTime = localStorage.getItem('userLocationTime');

            const CACHE_DURATION = 24 * 60 * 60 * 1000

            if(cachedLocation && cacheTime){
                const remainingTime = Date.now() - parseInt(cacheTime)

                if(remainingTime < CACHE_DURATION){
                    const location = JSON.parse(cachedLocation)
                    // console.log(location)
                    // console.log(`Cache expira em ${Math.round((CACHE_DURATION - remainingTime) / 1000 / 60)} minutos`)
                    await this.searchCity(location)
                    return true
                } else {
                    console.log('Cache expirado, buscando nova localização...')
                }
            }

            const req = await fetch("/geo/ip")

            if (!req.ok) {
                const erro = await req.json()
                throw new Error(erro.error || 'Erro ao obter localização')
            }

            const res = await req.json()
           
            if (res.nameCity) {
                localStorage.setItem('userLocation', JSON.stringify(res.nameCity))
                localStorage.setItem('userLocationTime', Date.now().toString())
                
                // console.log('Nova localização salva no cache:', res)

                await this.searchCity(res.nameCity)
                return true;
            } else {
                throw new Error('Cidade não encontrada na resposta')
            };

        } catch (error){
            console.error('Erro na geolocalização:', error.message)
            alert(`Ops, tivemos um problema: ${error.message}`)
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