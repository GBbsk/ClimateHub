export const AuthService = {
    async searchCity(city) {
        const response = await fetch(`/api/cidade?city=${city}`);
    
        if (!response.ok) {
            throw new Error('Erro ao buscar cidade');
        }

        return response.json();
    }
};