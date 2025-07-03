import React from 'react';

const Header = ({ selicRate, ipcaRate, loading, error }) => {
    let selicText = loading ? 'Carregando...' : selicRate !== null ? `${selicRate.toFixed(2)}%` : 'Erro ao carregar';
    let ipcaText = loading ? 'Carregando...' : ipcaRate !== null ? `${ipcaRate.toFixed(2)}%` : 'Erro ao carregar';

    if (error) {
        selicText = 'Erro';
        ipcaText = 'Erro';
    }

    return (
        <header className="header">
            <h1>TaxCalcBR: Simulador de Pagamentos e Investimentos</h1>
            <p>Selecione uma opção abaixo para começar sua análise financeira.</p>
            <div className="financial-rates-info">
                <p>Taxa SELIC atual (ao ano): <span id="selic-rate">{selicText}</span></p>
                <p>IPCA acumulado (12 meses): <span id="ipca-rate">{ipcaText}</span></p>
                <small>(Fonte: Banco Central do Brasil)</small>
            </div>
        </header>
    );
};

export default Header;