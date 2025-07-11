import React, { useEffect } from 'react';

// Função auxiliar para gerar os campos de taxa (agora retorna JSX, não HTML string)
const YieldRateInputs = ({ idPrefix, titleContext, showIRSelect, selicRate, ipcaRate, onInputChange, formInputs }) => {
    const defaultTaxaValue = (idPrefix === 'inflacao') ? '0.5' : '';
    const defaultTaxaPlaceholder = (idPrefix === 'inflacao') ? 'Ex: 0.5 (mensal)' : 'Ex: 10.5 (anual)';

    const tipoTaxaId = `${idPrefix}TipoTaxa`;
    const valorTaxaId = `${idPrefix}ValorTaxa`;
    const taxaInfoTextId = `${idPrefix}TaxaInfoText`;
    const indiceBaseGroupId = `${idPrefix}IndiceBaseGroup`;
    const indiceBaseId = `${idPrefix}IndiceBase`;
    const considerarIRId = `${idPrefix}ConsiderarIR`;

    const selectedTaxaType = formInputs[tipoTaxaId] || 'custom-anual'; // Pega o valor do estado
    const selectedIndiceBase = formInputs[indiceBaseId] || 'cdi'; // Pega o valor do estado

    let currentValorTaxa = formInputs[valorTaxaId] !== undefined ? formInputs[valorTaxaId] : defaultTaxaValue;
    let isValorTaxaReadOnly = false;
    let taxaInfoText = '';

    // Lógica para definir o valor e readOnly do input de taxa
    switch (selectedTaxaType) {
        case 'selic':
            currentValorTaxa = selicRate !== null ? selicRate.toFixed(2) : '';
            isValorTaxaReadOnly = true;
            taxaInfoText = `SELIC atual: ${selicRate !== null ? selicRate.toFixed(2) : 'Carregando...'}% ao ano.`;
            break;
        case 'ipca':
            currentValorTaxa = ipcaRate !== null ? ipcaRate.toFixed(2) : '';
            isValorTaxaReadOnly = true;
            taxaInfoText = `IPCA acumulado (12 meses): ${ipcaRate !== null ? ipcaRate.toFixed(2) : 'Carregando...'}%.`;
            break;
        case 'cdi':
            const cdiRate = selicRate !== null ? (selicRate - 0.1) : null;
            currentValorTaxa = cdiRate !== null ? cdiRate.toFixed(2) : '';
            isValorTaxaReadOnly = true;
            taxaInfoText = `CDI estimado: ${cdiRate !== null ? cdiRate.toFixed(2) : 'Carregando...'}% ao ano (SELIC - 0.1%).`;
            break;
        case 'indice-percentual':
            isValorTaxaReadOnly = false;
            // Recalcula o texto de info para índice percentual
            let baseRate = null;
            let baseName = '';
            if (selectedIndiceBase === 'selic') {
                baseRate = selicRate;
                baseName = 'SELIC';
            } else if (selectedIndiceBase === 'ipca') {
                baseRate = ipcaRate;
                baseName = 'IPCA';
            } else if (selectedIndiceBase === 'cdi') {
                baseRate = selicRate !== null ? (selicRate - 0.1) : null;
                baseName = 'CDI';
            }
            if (baseRate !== null) {
                taxaInfoText = `Índice ${baseName} atual: ${baseRate.toFixed(2)}%. Informe a porcentagem que o seu rendimento corresponde a ele.`;
            } else {
                taxaInfoText = `Carregando índice ${baseName}...`;
            }
            break;
        case 'custom-mensal':
            isValorTaxaReadOnly = false;
            taxaInfoText = "Insira a taxa mensal em %.";
            break;
        case 'custom-anual':
        default:
            isValorTaxaReadOnly = false;
            taxaInfoText = "Insira a taxa anual em %.";
            break;
    }

    // Garante que o valor do input esteja correto quando readOnly
    // Mas não sobrescreve o valor digitado pelo usuário se for uma taxa customizada
    if (isValorTaxaReadOnly && formInputs[valorTaxaId] === undefined) {
      // Apenas preenche se o usuário ainda não digitou nada
      onInputChange({ target: { id: valorTaxaId, value: currentValorTaxa, type: 'text' } });
    } else if (!isValorTaxaReadOnly && formInputs[valorTaxaId] === undefined) {
      // Para campos customizados, se não houver valor no estado, use o defaultTaxaValue
      onInputChange({ target: { id: valorTaxaId, value: defaultTaxaValue, type: 'text' } });
    }


    return (
        <fieldset className="form-section yield-rate-inputs">
            <legend className="section-title">Configuração da Taxa {titleContext}</legend>
            <div className="form-group">
                <label htmlFor={tipoTaxaId}>Tipo de Taxa:</label>
                <select id={tipoTaxaId} className="tipo-taxa-select" onChange={onInputChange} value={selectedTaxaType}>
                    <option value="custom-anual">Anual (Personalizada)</option>
                    <option value="custom-mensal">Mensal (Personalizada)</option>
                    {idPrefix !== 'inflacao' && (
                        <>
                            <option value="selic">SELIC ({selicRate !== null ? selicRate.toFixed(2) : '...'}%)</option>
                            <option value="ipca">IPCA ({ipcaRate !== null ? ipcaRate.toFixed(2) : '...'}%)</option>
                            <option value="cdi">CDI ({selicRate !== null ? (selicRate - 0.1).toFixed(2) : '...'}%)</option>
                            <option value="indice-percentual">Índice + Percentual (%)</option>
                        </>
                    )}
                </select>
            </div>
            {selectedTaxaType === 'indice-percentual' && (
                <div className="form-group" id={indiceBaseGroupId}>
                    <label htmlFor={indiceBaseId}>Índice Base:</label>
                    <select id={indiceBaseId} onChange={onInputChange} value={selectedIndiceBase}>
                        <option value="cdi">CDI</option>
                        <option value="selic">SELIC</option>
                        <option value="ipca">IPCA</option>
                    </select>
                </div>
            )}
            <div className="form-group">
                <label htmlFor={valorTaxaId}>Valor da Taxa (%):</label>
                <input
                    type="number"
                    id={valorTaxaId}
                    className="valor-taxa-input"
                    step="0.01"
                    min="0"
                    placeholder={defaultTaxaPlaceholder}
                    value={currentValorTaxa} // Usa o valor calculado/padrão
                    onChange={onInputChange}
                    readOnly={isValorTaxaReadOnly}
                    required // Adicionado required para validação
                />
                {taxaInfoText && <small className="taxa-info-text">{taxaInfoText}</small>}
            </div>
            {showIRSelect && (
                <div className="form-group" id={`${idPrefix}ConsiderarIRGroup`}>
                    <label htmlFor={considerarIRId}>Considerar Imposto de Renda (IR) sobre o rendimento?</label>
                    <select id={considerarIRId} onChange={onInputChange} value={formInputs[considerarIRId] || 'N'}>
                        <option value="N">Não</option>
                        <option value="S">Sim</option>
                    </select>
                    <small>O IR é aplicado sobre o rendimento bruto, conforme tabela regressiva de renda fixa.</small>
                </div>
            )}
        </fieldset>
    );
};

// Componente principal DynamicInputs
const DynamicInputs = ({ selectedOption, onInputChange, formInputs, selicRate, ipcaRate, onJurosToggle, isJurosVisible }) => {

    // Efeito para re-executar a lógica de setup quando as taxas ou a opção mudam
    useEffect(() => {
        let yieldPrefix = '';
        let showYieldSection = false; // Controla a visibilidade da seção de taxa
        let showIRForYield = false; // Controla se o IR aparece na seção de taxa

        // Determine prefixo e se a seção de rendimento deve ser mostrada
        if (['1', '2', '3'].includes(selectedOption)) {
            yieldPrefix = 'rendimento';
            showYieldSection = true;
            showIRForYield = true;
        } else if (selectedOption === '6') {
            yieldPrefix = 'inflacao';
            showYieldSection = true;
            showIRForYield = false; // Inflação não tem IR
        } else if (selectedOption === '7') {
            yieldPrefix = 'investimento';
            showYieldSection = true;
            showIRForYield = true;
        }

        // Configura listeners para os inputs de rendimento APÓS a renderização inicial
        if (showYieldSection) {
            // Este `useEffect` agora apenas aciona o listener. Os inputs são renderizados no JSX.
            // A função `setupYieldRateListeners` agora manipula o DOM *após* o React renderizar.
            // Para ter certeza que o DOM está pronto, pode-se usar um timeout ou garantir o fluxo.
            // No React, geralmente se faz isso re-renderizando o componente e o `value` no input
            // é controlado pelo `formInputs`.
            setTimeout(() => { // Pequeno delay para garantir que os elementos estejam no DOM
                setupYieldRateListeners(yieldPrefix, selicRate, ipcaRate);
            }, 0);
        }
    }, [selectedOption, selicRate, ipcaRate]); // Dependências do useEffect

    // Listener para o toggle de juros na Opção 1 (ainda via evento DOM direto)
    useEffect(() => {
        const temJurosSelect = document.getElementById('temJurosParcelado');
        if (temJurosSelect) {
            temJurosSelect.addEventListener('change', onJurosToggle);
            // Dispatch inicial para garantir o estado de visibilidade
            temJurosSelect.dispatchEvent(new Event('change'));
            return () => temJurosSelect.removeEventListener('change', onJurosToggle);
        }
    }, [selectedOption, onJurosToggle]);


    // Define o conteúdo JSX a ser renderizado no input-container
    let renderedInputs = null;
    let yieldInputsSection = null;

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

    switch (selectedOption) {
        case "1": // Rendimento vs Parcelas
            renderedInputs = (
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
                    {isJurosVisible && (
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
            renderedInputs = (
                <>
                    <div className="form-group"><label htmlFor="valorVista">Valor da compra à vista (R$):</label><input type="number" id="valorVista" step="0.01" required value={formInputs.valorVista || ''} onChange={onInputChange} /></div>
                    <div className="form-group"><label htmlFor="parcelas">Número de parcelas:</label><input type="number" id="parcelas" min="1" required value={formInputs.parcelas || ''} onChange={onInputChange} /></div>
                    <div className="form-group"><label htmlFor="valorParcela">Valor de cada parcela (R$):</label><input type="number" id="valorParcela" step="0.01" required value={formInputs.valorParcela || ''} onChange={onInputChange} /></div>
                    {yieldInputsSection}
                </>
            );
            break;
        case "3": // Parcelamento com entrada
            renderedInputs = (
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
            renderedInputs = (
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
            renderedInputs = (
                <>
                    <div className="form-group"><label htmlFor="valorParcelaOriginal">Valor da parcela original (R$):</label><input type="number" id="valorParcelaOriginal" step="0.01" required value={formInputs.valorParcelaOriginal || ''} onChange={onInputChange} /></div>
                    <div className="form-group"><label htmlFor="diasAtraso">Dias de atraso:</label><input type="number" id="diasAtraso" required value={formInputs.diasAtraso || ''} onChange={onInputChange} /></div>
                    <div className="form-group"><label htmlFor="multa">Multa por atraso (%):</label><input type="number" id="multa" step="0.01" required value={formInputs.multa || ''} onChange={onInputChange} /></div>
                    <div className="form-group"><label htmlFor="jurosDiarios">Juros diários por atraso (%):</label><input type="number" id="jurosDiarios" step="0.01" required value={formInputs.jurosDiarios || ''} onChange={onInputChange} /></div>
                </>
            );
            break;
        case "6": // Simulação com inflação
            renderedInputs = (
                <>
                    <div className="form-group"><label htmlFor="parcelas">Número de parcelas:</label><input type="number" id="parcelas" min="1" required value={formInputs.parcelas || ''} onChange={onInputChange} /></div>
                    <div className="form-group"><label htmlFor="valorParcela">Valor de cada parcela (R$):</label><input type="number" id="valorParcela" step="0.01" required value={formInputs.valorParcela || ''} onChange={onInputChange} /></div>
                    {yieldInputsSection}
                </>
            );
            break;
        case "7": // Comparar com investimento alternativo
            renderedInputs = (
                <>
                    <div className="form-group"><label htmlFor="valorVista">Valor da compra à vista (R$):</label><input type="number" id="valorVista" step="0.01" required value={formInputs.valorVista || ''} onChange={onInputChange} /></div>
                    <div className="form-group"><label htmlFor="parcelas">Número de parcelas:</label><input type="number" id="parcelas" min="1" required value={formInputs.parcelas || ''} onChange={onInputChange} /></div>
                    <div className="form-group"><label htmlFor="valorParcela">Valor de cada parcela (R$):</label><input type="number" id="valorParcela" step="0.01" required value={formInputs.valorParcela || ''} onChange={onInputChange} /></div>
                    {yieldInputsSection}
                </>
            );
            break;
        default:
            renderedInputs = <p className="placeholder-text">Selecione uma opção acima para ver os campos.</p>;
            break;
    }

    return (
        <fieldset id="input-container" className="form-section dynamic-inputs">
            <legend className="section-title">Detalhes da Simulação</legend>
            {renderedInputs}
        </fieldset>
    );
};

export default DynamicInputs;