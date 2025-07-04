import { useState, useEffect } from 'react';

const useFetchRates = () => {
    const [selicRate, setSelicRate] = useState(null);
    const [ipcaRate, setIpcaRate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchSelicRate = async () => {
            const selicAnualApiUrl = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json";
            try {
                const response = await fetch(selicAnualApiUrl);
                if (!response.ok) throw new Error('Failed to fetch SELIC rate.');
                const data = await response.json();
                if (data && data.length > 0) {
                    setSelicRate(parseFloat(data[0].valor));
                } else {
                    setSelicRate(null);
                }
            } catch (err) {
                console.error("Error fetching SELIC rate:", err);
                setError(true);
            }
        };

        const fetchIpcaAnnualRate = async () => {
            const ipcaMensalApiUrl = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados/ultimos/12?formato=json";
            try {
                const response = await fetch(ipcaMensalApiUrl);
                if (!response.ok) throw new Error('Failed to fetch IPCA data.');
                const data = await response.json();

                if (data && data.length === 12) {
                    let ipcaAcumulado = 1;
                    data.forEach(item => {
                        const valorMensal = parseFloat(item.valor) / 100;
                        ipcaAcumulado *= (1 + valorMensal);
                    });
                    setIpcaRate((ipcaAcumulado - 1) * 100);
                } else {
                    setIpcaRate(null);
                }
            } catch (err) {
                console.error("Error fetching IPCA rate:", err);
                setError(true);
            }
        };

        const fetchAllRates = async () => {
            setLoading(true);
            setError(false);
            await Promise.all([fetchSelicRate(), fetchIpcaAnnualRate()]);
            setLoading(false);
        };

        fetchAllRates();
    }, []); 

    return { selicRate, ipcaRate, loading, error };
};

export default useFetchRates;