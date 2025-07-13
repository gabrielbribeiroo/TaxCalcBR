import React, { useEffect } from 'react';
import YieldRateInputs from './YieldRateInputs'; // Importa o componente YieldRateInputs

const DynamicInputs = ({ selectedOption, onInputChange, formInputs, selicRate, ipcaRate, onJurosToggle, isJurosVisible }) => {
    
    // Efeito para o toggle de juros na Opção 1: Anexa o listener ao select e o aciona na montagem
    useEffect(() => {
        const temJurosSelect = document.getElementById('temJurosParcelado');
        if (temJurosSelect) {
            // Este listener é um pouco mais complexo porque precisa reagir a uma mudança de input
            // e também chamar o onJurosToggle do pai para controlar a visibilidade.
            const listener = (e) => {
                onInputChange(e); // Primeiro, atualiza o estado do formInputs no componente pai
                onJurosToggle(e); // Depois, dispara a função do pai para controlar a visibilidade local
            };
            temJurosSelect.addEventListener('change', listener);
            
            // Dispara o handler uma vez na montagem para definir a visibilidade inicial
            // baseado no valor atual do estado formInputs.temJurosParcelado
            listener({ target: { id: 'temJurosParcelado', value: formInputs.temJurosParcelado || 'N' } });
            
            return () => temJurosSelect.removeEventListener('change', listener);
        }
    }, [selectedOption, onInputChange, onJurosToggle, formInputs.temJurosParcelado]);


    let renderedInputsContent = null;
    let yieldInputsSection = null;

    // Lógica para determinar se a seção de YieldRateInputs deve ser mostrada
    // e com qual prefixo e contexto.
    if (['1', '2', '3', '6', '7'].includes(selectedOption)) {
        let prefix = '';
        let titleContext = '';
        let showIR = false;

        if (['1', '2', '3'].includes(selectedOption)) {
            prefix = 'rendimento';
            titleContext = 'do Rendimento';
            showIR = true;
        } else if (selectedOption === '6') {
            prefix = 'inflacao';
            titleContext = 'da Inflação';
            showIR = false;
        } else if (selectedOption === '7') {
            prefix = 'investimento';
            titleContext = 'do Investimento';
            showIR = true;
        }
        yieldInputsSection = (
            <YieldRateInputs
                idPrefix={prefix}
                titleContext={titleContext}
                showIRSelect={showIR}
                selicRate={selicRate}
                ipcaRate={ipcaRate}
                onInputChange={onInputChange}
                formInputs={formInputs}
            />
        );
    }

    // Renderiza os inputs específicos para cada opção (agora tudo é JSX controlado)
    switch (selectedOption) {
        case "1": // Rendimento vs Parcelas
            renderedInputsContent = (
                <>
                    <div className="form-group"><label htmlFor="valorTotal">Valor total da compra (R$):</label><input type="number" id="valorTotal" step="0.01" required value={formInputs.valorTotal || ''} onChange={onInputChange} /></div>
                    <div className="form-group"><label htmlFor="parcelas">Número de parcelas:</label><input type="number" id="parcelas" min="1" required value={formInputs.parcelas || ''} onChange={onInputChange} /></div>
                    <div className="form-group"><label htmlFor="descontoVista">Porcentagem de desconto à vista (se houver):</label><input type="number" id="descontoVista" step="0.01" value={formInputs.descontoVista || '0'} onChange={onInputChange} /></div>
                    <div className="form-group">
                        <label htmlFor="temJurosParcelado">Há juros em pagar parcelado?</label>
                        <select id="temJurosParcelado" onChange={onJurosToggle} value={formInputs.temJurosParcelado || 'N'}>
                            <option value="N">Não</option>
                            <option value="S">Sim</option>
                        </select>
                    </div>
                    {isJurosVisible && ( // Controlado pelo estado isJurosVisible
                        <div id="jurosParceladoFields">
                            <div className="form-group"><label htmlFor="tipoJurosParcelado">Tipo de juros:</label><select id="tipoJurosParcelado" onChange={onInputChange} value={formInputs.tipoJurosParcelado || 'simples'}><option value="simples">Simples</option><option value="composto">Compostos</option></select></div>
                            <div className="form-group"><label htmlFor="taxaJurosParcelado">Taxa de juros mensal (%):</label><input type="number" id="taxaJurosParcelado" step="0.01" value={formInputs.taxaJurosParcelado || ''} onChange={onInputChange} /></div>
                        </div>
                    )}
                    {yieldInputsSection}
                </>
            );
            break;
        case "2": // À vista vs Parcelas
            renderedInputsContent = (
                <>
                    <div className="form-group"><label htmlFor="valorVista">Valor da compra à vista (R$):</label><input type="number" id="valorVista" step="0.01" required value={formInputs.valorVista || ''} onChange={onInputChange} /></div>
                    <div className="form-group"><label htmlFor="parcelas">Número de parcelas:</label><input type="number" id="parcelas" min="1" required value={formInputs.parcelas || ''} onChange={onInputChange} /></div>
                    <div className="form-group"><label htmlFor="valorParcela">Valor de cada parcela (R$):</label><input type="number" id="valorParcela" step="0.01" required value={formInputs.valorParcela || ''} onChange={onInputChange} /></div>
                    {yieldInputsSection}
                </>
            );
            break;
        case "3": // Entrada + Parcelas vs. À Vista
            renderedInputsContent = (
                <>
                    <div className="form-group"><label htmlFor="entrada">Valor da entrada (R$):</label><input type="number" id="entrada" step="0.01" required value={formInputs.entrada || ''} onChange={onInputChange} /></div>
                    <div className="form-group"><label htmlFor="parcelas">Número de parcelas:</label><input type="number" id="parcelas" min="1" required value={formInputs.parcelas || ''} onChange={onInputChange} /></div>
                    <div className="form-group"><label htmlFor="valorParcela">Valor de cada parcela (R$):</label><input type="number" id="valorParcela" step="0.01" required value={formInputs.valorParcela || ''} onChange={onInputChange} /></div>
                    <div className="form-group"><label htmlFor="valorVista">Valor da compra à vista (R$):</label><input type="number" id="valorVista" step="0.01" required value={formInputs.valorVista || ''} onChange={onInputChange} /></div>
                    {yieldInputsSection}
                </>
            );
            break;
        case "4": // Comparar duas opções de parcelamento
            renderedInputsContent = (
                <>
                    <h3>Primeira opção:</h3>
                    <div className="form-group"><label htmlFor="parcelas1">Número de parcelas:</label><input type="number" id="parcelas1" min="1" required value={formInputs.parcelas1 || ''} onChange={onInputChange} /></div>
                    <div className="form-group"><label htmlFor="valorParcela1">Valor de cada parcela (R$):</label><input type="number" id="valorParcela1" step="0.01" required value={formInputs.valorParcela1 || ''} onChange={onInputChange} /></div>
                    <h3>Segunda opção:</h3>
                    <div className="form-group"><label htmlFor="parcelas2">Número de parcelas:</label><input type="number" id="parcelas2" min="1" required value={formInputs.parcelas2 || ''} onChange={onInputChange} /></div>
                    <div className="form-group"><label htmlFor="valorParcela2">Valor de cada parcela (R$):</label><input type="number" id="valorParcela2" step="0.01" required value={formInputs.valorParcela2 || ''} onChange={onInputChange} /></div>
                </>
            );
            break;
        case "5": // Impacto de atrasos em parcelas
            renderedInputsContent = (
                <>
                    <div className="form-group"><label htmlFor="valorParcelaOriginal">Valor da parcela original (R$):</label><input type="number" id="valorParcelaOriginal" step="0.01" required value={formInputs.valorParcelaOriginal || ''} onChange={onInputChange} /></div>
                    <div className="form-group"><label htmlFor="diasAtraso">Dias de atraso:</label><input type="number" id="diasAtraso" required value={formInputs.diasAtraso || ''} onChange={onInputChange} /></div>
                    <div className="form-group"><label htmlFor="multa">Multa por atraso (%):</label><input type="number" id="multa" step="0.01" required value={formInputs.multa || ''} onChange={onInputChange} /></div>
                    <div className="form-group"><label htmlFor="jurosDiarios">Juros diários por atraso (%):</label><input type="number" id="jurosDiarios" step="0.01" required value={formInputs.jurosDiarios || ''} onChange={onInputChange} /></div>
                </>
            );
            break;
        case "6": // Simulação com inflação
            renderedInputsContent = (
                <>
                    <div className="form-group"><label htmlFor="parcelas">Número de parcelas:</label><input type="number" id="parcelas" min="1" required value={formInputs.parcelas || ''} onChange={onInputChange} /></div>
                    <div className="form-group"><label htmlFor="valorParcela">Valor de cada parcela (R$):</label><input type="number" id="valorParcela" step="0.01" required value={formInputs.valorParcela || ''} onChange={onInputChange} /></div>
                    {yieldInputsSection}
                </>
            );
            break;
        case "7": // Comparar com investimento alternativo
            renderedInputsContent = (
                <>
                    <div className="form-group"><label htmlFor="valorVista">Valor da compra à vista (R$):</label><input type="number" id="valorVista" step="0.01" required value={formInputs.valorVista || ''} onChange={onInputChange} /></div>
                    <div className="form-group"><label htmlFor="parcelas">Número de parcelas:</label><input type="number" id="parcelas" min="1" required value={formInputs.parcelas || ''} onChange={onInputChange} /></div>
                    <div className="form-group"><label htmlFor="valorParcela">Valor de cada parcela (R$):</label><input type="number" id="valorParcela" step="0.01" required value={formInputs.valorParcela || ''} onChange={onInputChange} /></div>
                    {yieldInputsSection}
                </>
            );
            break;
        default:
            renderedInputsContent = <p className="placeholder-text">Selecione uma opção acima para ver os campos.</p>;
            break;
    }

    return (
        <fieldset id="input-container" className="form-section dynamic-inputs">
            <legend className="section-title">Detalhes da Simulação</legend>
            {renderedInputsContent}
        </fieldset>
    );
};

export default DynamicInputs;