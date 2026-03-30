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
        this.view.bindBtnTempSwitch(this.symbolUnitCheck.bind(this))

        this.view.bindInputSearchBarTyping(this.debounceSearch.bind(this))
        this.view.bindDropdownClick(this.handleCitySelect.bind(this))

    }

    async init(){
        setInterval(() => {
        this.showTime();
        }, 1000); 
        this.searchCity("Remanso")

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
        
        this.buscarClima(cidadeSelecionada);
    };

    symbolUnitCheck(){
        const imperial = { simbolo: "°F", unidade: "imperial" };
        const metric = {simbolo: "°C", unidade: "metric"};
        if(this.view.tempSwitch.checked){
           return imperial;
        } else {
            return metric;
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
                this.buscarClima(data.cidade[0]);
            } else {
                alert("Cidade não encontrada.");
            }
            console.log(`BUSCAR CIDADE ${data.cidade[0].nome}`)


        } catch (error) {
            console.error(error);
        };
        this.hiddenLoading()
    };

    async buscarClima(dados){
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

            this.view.showData(data);
            this.view.showSymbol(simbolo);

        } catch (error) {
            console.error(error);
        } finally {
            this.hiddenLoading();
            this.view.searchBar.value = "";
        };
    };

    showLoading(){
        this.loadingTimeout = setTimeout(() => {
            this.view.loadingScreen.classList.remove("d-none");
        }, 300);
    };

    hiddenLoading(){
        clearTimeout(this.loadingTimeout)
         this.view.loadingScreen.classList.add("d-none");
    };

}