import { Model } from '../models/Model.js';
import { View } from '../views/View.js';
import { AuthService } from '../services/authService.js'

export class Controller {
    constructor(model, view, AuthService) {
        this.model = model;
        this.view = view;
        this.AuthService = AuthService 
        this.loadingTimeout = null;

        this.view.bindBtnBuscarCidade(this.buscarCidade.bind(this))
        this.view.bindInputBuscarCity(this.verificarEnter.bind(this))
        this.view.bindBtnTempSwitch(this.symbolUnitCheck.bind(this))

    }

    async iniciar(){
        setInterval(() => {
        this.exibirHora();
        }, 1000); 
        this.buscarCidade("Remanso")
    };

    verificarEnter(e){
        if(e.key === "Enter"){
            e.preventDefault();
            this.buscarCidade();
        }
    };

    symbolUnitCheck(){
        const dados = { simbolo: "°F", unidade: "imperial" };
        const dados2 = {simbolo: "°C", unidade: "metric"};
        if(this.view.tempSwitch.checked){
           return dados
        } else {
            return dados2
        }
    };

    exibirHora(){
        const agora = new Date();

        this.view.currentTime.textContent = agora.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    async buscarCidade(name) {
        const nameCity = this.view.searchBar.value.trim() || name;
        const { simbolo, unidade } = this.symbolUnitCheck();

        if(!nameCity){
            alert ("Digite o nome de uma cidade, por favor!")
            return 
        };

        try {
            this.showLoading()
            const response = await fetch(`/api/cidade?city=${nameCity}?&units=${unidade}`)

            if (!response.ok) {
                const erro = await response.json()
                throw new Error(erro.error || 'Erro ao buscar cidade');
            }

            const data = await response.json(); 
            // console.log(data)
            
            this.view.exibirInfos(data);
            this.view.exibirSymbols(simbolo);

        } catch (error) {
            console.error(error);
        } finally {
            this.hiddenLoading();
            this.view.searchBar.value = "";
        }
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