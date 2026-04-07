export class CacheService {
    /**
     * @param {number} ttl - Tempo de vida em milissegundos (padrão: 24h)
     */
    constructor(ttl = 24 * 60 * 60 * 1000) {
        this.ttl = ttl; // 24 horas em ms
    }
    
    /**
     * Salva um valor no cache com timestamp
     * 
     * @param {string} chave - Identificador único
     * @param {*} valor - Valor a salvar (qualquer tipo)
     * @returns {boolean} true se salvou, false se falhou
     */
    salvar(chave, valor) {
        try {
            const item = {
                valor: valor,
                timestamp: Date.now(),
                data: new Date().toLocaleString("pt-br"),
            };
            
            localStorage.setItem(chave, JSON.stringify(item));
            return true;
            
        } catch (error) {
            console.error('Erro ao salvar no cache:', error);
            return false;
        }
    }
    
    /**
     * Busca um valor do cache (se não expirou)
     * 
     * @param {string} chave - Identificador único
     * @returns {*|null} O valor salvo ou null se expirou/não existe
     */
    obter(chave) {
        try {
            const itemString = localStorage.getItem(chave);
            
            // Não existe
            if (!itemString) {
                return null;
            }
            
            const item = JSON.parse(itemString);
            
            // Calcula idade do cache
            const idade = Date.now() - item.timestamp;
            
            // Expirou?
            if (idade > this.ttl) {
                this.remover(chave); // Remove cache expirado
                return null;
            }
            
            // Ainda válido!
            return item.valor;
            
        } catch (error) {
            console.error('Erro ao obter do cache:', error);
            return null;
        }
    }
    
    /**
     * Remove um item do cache
     * 
     * @param {string} chave - Identificador único
     */
    remover(chave) {
        try {
            localStorage.removeItem(chave);
        } catch (error) {
            console.error('Erro ao remover do cache:', error);
        }
    }
    
    /**
     * Limpa todo o cache
     */
    limpar() {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Erro ao limpar cache:', error);
        }
    }
}