export class CityService {
    /**
     * Busca cidades que correspondem ao nome
     * 
     * @param {string} nome - Nome da cidade
     * @returns {Promise<Array>} - Lista de cidades
     */
    async buscarCidades(nome) {
        const response = await fetch(`/api/cidade?city=${nome}`);
    
        if (!response.ok) {
            const erro = await response.json();
            throw new Error(erro.error || 'Erro ao buscar cidade');
        }
        
        const data = await response.json();
        return data || [];
    }
}