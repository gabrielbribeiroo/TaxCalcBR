import React, { useEffect } from 'react';

// Função auxiliar para gerar o HTML dos campos de taxa, reutilizável
const generateYieldRateHtml = (idPrefix, titleContext, showIRSelect, selicRate, ipcaRate) => {
    // Valores e placeholders padrão para campos customizados
    const defaultTaxaValue = (idPrefix === 'inflacao') ? '0.5' : ''; 
    const defaultTaxaPlaceholder = (idPrefix === 'inflacao') ? 'Ex: 0.5 (mensal)' : 'Ex: 10.5 (anual)';

    return `
        <fieldset class="form-section yield-rate-inputs">
            <legend class="section-title">Configuração da Taxa ${titleContext}</legend>
            <div class="form-group">
                <label for="${idPrefix}TipoTaxa">Tipo de Taxa:</label>
                <select id="${idPrefix}TipoTaxa" class="tipo-taxa-select">
                    <option value="custom-anual">Anual (Personalizada)</option>
                    <option value="custom-mensal">Mensal (Personalizada)</option>
                    ${idPrefix !== 'inflacao' ? `
                    <option value="selic">SELIC (${selicRate !== null ? selicRate.toFixed(2) : '...'}%)</option>
                    <option value="ipca">IPCA (${ipcaRate !== null ? ipcaRate.toFixed(2) : '...'}%)</option>
                    <option value="cdi">CDI (${selicRate !== null ? (selicRate - 0.1).toFixed(2) : '...'}%)</option>
                    <option value="indice-percentual">Índice + Percentual (%)</option>
                    ` : ''}
                </select>
            </div>
            <div class="form-group" id="${idPrefix}IndiceBaseGroup" style="display: none;">
                <label for="${idPrefix}IndiceBase">Índice Base:</label>
                <select id="${idPrefix}IndiceBase">
                    <option value="cdi">CDI</option>
                    <option value="selic">SELIC</option>
                    <option value="ipca">IPCA</option>
                </select>
            </div>
            <div class="form-group">
                <label for="${idPrefix}ValorTaxa">Valor da Taxa (%):</label>
                <input type="number" id="${idPrefix}ValorTaxa" class="valor-taxa-input" step="0.01" min="0" placeholder="${defaultTaxaPlaceholder}" value="${defaultTaxaValue}">
                <small id="${idPrefix}TaxaInfoText" class="taxa-info-text"></small>
            </div>
            ${showIRSelect ? `
            <div class="form-group" id="${idPrefix}ConsiderarIRGroup">
                <label for="${idPrefix}ConsiderarIR">Considerar Imposto de Renda (IR) sobre o rendimento?</label>
                <select id="${idPrefix}ConsiderarIR">
                    <option value="N">Não</option>
                    <option value="S">Sim</option>
                </select>
                <small>O IR é aplicado sobre o rendimento bruto, conforme tabela regressiva de renda fixa.</small>
            </div>
            ` : ''}
        </fieldset>
    `;
};

// Configura os listeners para os campos de seleção e valor de taxa dinâmica
const setupYieldRateListeners = (idPrefix, selicRate, ipcaRate) => {
    const tipoTaxaSelect = document.getElementById(`${idPrefix}TipoTaxa`);
    const valorTaxaInput = document.getElementById(`${idPrefix}ValorTaxa`);
    const taxaInfoText = document.getElementById(`${idPrefix}TaxaInfoText`);
    const indiceBaseGroup = document.getElementById(`${idPrefix}IndiceBaseGroup`);
    const indiceBaseSelect = document.getElementById(`${idPrefix}IndiceBase`);

    if (!tipoTaxaSelect || !valorTaxaInput || !taxaInfoText) return;

    const updateTaxaFields = () => {
        const selectedTaxaType = tipoTaxaSelect.value;
        taxaInfoText.textContent = '';
        valorTaxaInput.readOnly = false;
        indiceBaseGroup.style.display = 'none';

        switch (selectedTaxaType) {
            case 'selic':
                valorTaxaInput.value = selicRate !== null ? selicRate.toFixed(2) : '';
                valorTaxaInput.readOnly = true;
                taxaInfoText.textContent = `SELIC atual: ${selicRate !== null ? selicRate.toFixed(2) : 'Carregando...'}% ao ano.`;
                break;
            case 'ipca':
                valorTaxaInput.value = ipcaRate !== null ? ipcaRate.toFixed(2) : '';
                valorTaxaInput.readOnly = true;
                taxaInfoText.textContent = `IPCA acumulado (12 meses): ${ipcaRate !== null ? ipcaRate.toFixed(2) : 'Carregando...'}%.`;
                break;
            case 'cdi':
                const cdiRate = selicRate !== null ? (selicRate - 0.1) : null;
                valorTaxaInput.value = cdiRate !== null ? cdiRate.toFixed(2) : '';
                valorTaxaInput.readOnly = true;
                taxaInfoText.textContent = `CDI estimado: ${cdiRate !== null ? cdiRate.toFixed(2) : 'Carregando...'}% ao ano (SELIC - 0.1%).`;
                break;
            case 'indice-percentual':
                indiceBaseGroup.style.display = 'block';
                valorTaxaInput.placeholder = "Ex: 100 (para 100% do índice)";
                taxaInfoText.textContent = "Informe a porcentagem do índice base.";
                if (indiceBaseSelect) {
                    indiceBaseSelect.addEventListener('change', updateTaxaInfoForIndicePercentual);
                    updateTaxaInfoForIndicePercentual();
                }
                break;
            case 'custom-mensal':
                valorTaxaInput.placeholder = "Ex: 0.5 (mensal)";
                taxaInfoText.textContent = "Insira a taxa mensal em %.";
                valorTaxaInput.value = '';
                break;
            case 'custom-anual':
            default:
                valorTaxaInput.placeholder = "Ex: 10.5 (anual)";
                taxaInfoText.textContent = "Insira a taxa anual em %.";
                valorTaxaInput.value = '';
                break;
        }
    };

    const updateTaxaInfoForIndicePercentual = () => {
        const selectedIndiceBase = indiceBaseSelect.value;
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
            taxaInfoText.textContent = `Índice ${baseName} atual: ${baseRate.toFixed(2)}%. Informe a porcentagem que o seu rendimento corresponde a ele.`;
        } else {
            taxaInfoText.textContent = `Carregando índice ${baseName}...`;
        }
    };

    tipoTaxaSelect.addEventListener('change', updateTaxaFields);
    tipoTaxaSelect.dispatchEvent(new Event('change'));
};

const DynamicInputs = ({ selectedOption, onInputChange, selicRate, ipcaRate, onJurosToggle, isJurosVisible }) => {
    // Efeito para re-renderizar e configurar listeners quando a opção muda
    useEffect(() => {
        const inputContainer = document.getElementById('input-container');
        inputContainer.innerHTML = ''; // Limpa o conteúdo antes de renderizar

        let yieldPrefix = ''; // Para guardar o prefixo da taxa (rendimento, inflacao, investimento)
        let showYieldSection = false; // Flag para decidir se a seção de taxa deve ser mostrada

        let htmlContent = '';

        switch (selectedOption) {
            case "1": // Rendimento vs Parcelas
                htmlContent = `
                    <div class="form-group"><label for="valorTotal">Valor total da compra (R$):</label><input type="number" id="valorTotal" step="0.01" required></div>
                    <div class="form-group"><label for="parcelas">Número de parcelas:</label><input type="number" id="parcelas" min="1" required></div>
                    <div class="form-group"><label for="descontoVista">Porcentagem de desconto à vista (se houver):</label><input type="number" id="descontoVista" step="0.01" value="0"></div>
                    <div class="form-group"><label for="temJurosParcelado">Há juros em pagar parcelado?</label><select id="temJurosParcelado"><option value="N">Não</option><option value="S">Sim</option></select></div>
                    <div id="jurosParceladoFields" style="display:none;"><div class="form-group"><label for="tipoJurosParcelado">Tipo de juros:</label><select id="tipoJurosParcelado"><option value="simples">Simples</option><option value="composto">Compostos</option></select></div><div class="form-group"><label for="taxaJurosParcelado">Taxa de juros mensal (%):</label><input type="number" id="taxaJurosParcelado" step="0.01"></div></div>
                    ${generateYieldRateHtml('rendimento', 'do Rendimento', true, selicRate, ipcaRate)}
                `;
                yieldPrefix = 'rendimento';
                showYieldSection = true;
                break;
            case "2": // À vista vs Parcelas
                htmlContent = `
                    <div class="form-group"><label for="valorVista">Valor da compra à vista (R$):</label><input type="number" id="valorVista" step="0.01" required></div>
                    <div class="form-group"><label for="parcelas">Número de parcelas:</label><input type="number" id="parcelas" min="1" required></div>
                    <div class="form-group"><label for="valorParcela">Valor de cada parcela (R$):</label><input type="number" id="valorParcela" step="0.01" required></div>
                    ${generateYieldRateHtml('rendimento', 'do Rendimento', true, selicRate, ipcaRate)}
                `;
                yieldPrefix = 'rendimento';
                showYieldSection = true;
                break;
            case "3": // Entrada + Parcelas vs. À Vista
                htmlContent = `
                    <div class="form-group"><label for="entrada">Valor da entrada (R$):</label><input type="number" id="entrada" step="0.01" required></div>
                    <div class="form-group"><label for="parcelas">Número de parcelas:</label><input type="number" id="parcelas" min="1" required></div>
                    <div class="form-group"><label for="valorParcela">Valor de cada parcela (R$):</label><input type="number" id="valorParcela" step="0.01" required></div>
                    <div class="form-group"><label for="valorVista">Valor da compra à vista (R$):</label><input type="number" id="valorVista" step="0.01" required></div>
                    ${generateYieldRateHtml('rendimento', 'do Rendimento', true, selicRate, ipcaRate)}
                `;
                yieldPrefix = 'rendimento';
                showYieldSection = true;
                break;
            case "4": // Comparar duas opções de parcelamento
                htmlContent = `
                    <h3>Primeira opção:</h3>
                    <div class="form-group"><label for="parcelas1">Número de parcelas:</label><input type="number" id="parcelas1" min="1" required></div>
                    <div class="form-group"><label for="valorParcela1">Valor de cada parcela (R$):</label><input type="number" id="valorParcela1" step="0.01" required></div>
                    <h3>Segunda opção:</h3>
                    <div class="form-group"><label for="parcelas2">Número de parcelas:</label><input type="number" id="parcelas2" min="1" required></div>
                    <div class="form-group"><label for="valorParcela2">Valor de cada parcela (R$):</label><input type="number" id="valorParcela2" step="0.01" required></div>
                `;
                break;
            case "5": // Impacto do atraso nas parcelas
                htmlContent = `
                    <div class="form-group"><label for="valorParcelaOriginal">Valor da parcela original (R$):</label><input type="number" id="valorParcelaOriginal" step="0.01" required></div>
                    <div class="form-group"><label for="diasAtraso">Dias de atraso:</label><input type="number" id="diasAtraso" required></div>
                    <div class="form-group"><label for="multa">Multa por atraso (%):</label><input type="number" id="multa" step="0.01" required></div>
                    <div class="form-group"><label for="jurosDiarios">Juros diários por atraso (%):</label><input type="number" id="jurosDiarios" step="0.01" required></div>
                `;
                break;
            case "6": // Simulação com inflação
                htmlContent = `
                    <div class="form-group"><label for="parcelas">Número de parcelas:</label><input type="number" id="parcelas" min="1" required></div>
                    <div class="form-group"><label for="valorParcela">Valor de cada parcela (R$):</label><input type="number" id="valorParcela" step="0.01" required></div>
                    ${generateYieldRateHtml('inflacao', 'da Inflação', false, selicRate, ipcaRate)}
                `;
                yieldPrefix = 'inflacao';
                showYieldSection = true;
                break;
            case "7": // Comparar com investimento alternativo
                htmlContent = `
                    <div class="form-group"><label for="valorVista">Valor da compra à vista (R$):</label><input type="number" id="valorVista" step="0.01" required></div>
                    <div class="form-group"><label for="parcelas">Número de parcelas:</label><input type="number" id="parcelas" min="1" required></div>
                    <div class="form-group"><label for="valorParcela">Valor de cada parcela (R$):</label><input type="number" id="valorParcela" step="0.01" required></div>
                    ${generateYieldRateHtml('investimento', 'do Investimento', true, selicRate, ipcaRate)}
                `;
                yieldPrefix = 'investimento';
                showYieldSection = true;
                break;
            default:
                // Exibe o placeholder quando nenhuma opção válida é selecionada
                htmlContent = '<p class="placeholder-text">Selecione uma opção acima para ver os campos.</p>';
                break;
        }

        // Define o HTML e, em seguida, configura os listeners
        inputContainer.innerHTML = htmlContent;

        // Adiciona listeners para os campos de taxa dinâmicos, se existirem
        if (showYieldSection) {
            setupYieldRateListeners(yieldPrefix, selicRate, ipcaRate);
        }

        // Re-bind listeners para todos os inputs renderizados dinamicamente
        const allInputs = inputContainer.querySelectorAll('input, select');
        allInputs.forEach(input => {
            input.addEventListener('input', onInputChange);
            // Pre-fill values from state if they exist (important on re-render)
            if (formInputs[input.id] !== undefined) {
                 if (input.type === 'checkbox') {
                    input.checked = formInputs[input.id];
                 } else {
                    input.value = formInputs[input.id];
                 }
            }
        });
        
        // Listener específico para a Opção 1 (juros parcelados)
        const temJurosSelect = document.getElementById('temJurosParcelado');
        if (temJurosSelect) {
            temJurosSelect.addEventListener('change', onJurosToggle);
            // Trigger the handler on render to set initial visibility
            temJurosSelect.dispatchEvent(new Event('change'));
        }

    }, [selectedOption, onInputChange, selicRate, ipcaRate, onJurosToggle]); // Dependências do useEffect

    return (
        <fieldset id="input-container" className="form-section dynamic-inputs">
            <legend className="section-title">Detalhes da Simulação</legend>
            {/* Conteúdo dinâmico será injetado aqui pelo useEffect */}
        </fieldset>
    );
};

export default DynamicInputs;