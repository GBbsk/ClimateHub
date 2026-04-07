import { Validators } from '../utils/validators.js';

export class Model {
    constructor() {
        this.historico = []
    }

     adicionarHistorico(dados) {
        this.historico.push({
            ...dados,
            timestamp: Date.now(),
        });
        
        // Limita histórico
        if (this.historico.length >  10) {
            this.historico.shift();
        }
        
        this.cidadeAtual = dados;
    };

    obterUltimaConsulta() {
        return this.historico[this.historico.length - 1] || null;
    };

    limparHistorico() {
        this.historico = [];
        this.cidadeAtual = null;
    };
}