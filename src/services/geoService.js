export class GeolocationService {

    async geolocationIP(){

        const cityIP = await fetch("/geo/ip")

        if (!cityIP.ok) {
            const erro = await cityIP.json()
            throw new Error(erro.error || 'Erro ao obter localização')
        }

        const nameCityIP = await cityIP.json()
        console.log(nameCityIP)

        return nameCityIP || []
    }
}