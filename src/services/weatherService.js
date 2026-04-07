export class WeatherService {

    async searchClimateAPI(dados){
        // const { lat, lon, nome, pais, estado, unidade } = dados;

        const weather = await fetch('/api/clima', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ...dados,
            })
        })

        if (!weather.ok) {
            const erro = await weather.json()
            throw new Error(erro.error || 'Erro ao buscar cidade');
        };

        const data = await weather.json();
        return data || []
    }
}