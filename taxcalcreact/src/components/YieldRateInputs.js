import React, { useEffect, useState, useCallback } from 'react';
import * as Calc from '../utils/financialCalculations'; // Importar Calc aqui também

const YieldRateInputs = ({ idPrefix, titleContext, showIRSelect, selicRate, ipcaRate, onInputChange, formInputs }) => {
    const tipoTaxaId = `${idPrefix}TipoTaxa`;
    const valorTaxaId = `${idPrefix}ValorTaxa`;
    const taxaInfoTextId = `${idPrefix}TaxaInfoText`; // ID para o elemento small
    const indiceBaseGroupId = `${idPrefix}IndiceBaseGroup`;
    const indiceBaseId = `${idPrefix}IndiceBase`;
    const considerarIRId = `${idPrefix}ConsiderarIR`;

    const selectedTipoTaxa = formInputs[tipoTaxaId] || 'custom-anual'; // Valor padrão
    const selectedIndiceBase = formInputs[indiceBaseId] || 'cdi'; // Valor padrão
    
    // O valor do input é controlado pelo formInputs, sem estado local duplicado para currentInputValue
    const currentInputValueFromState = formInputs[valorTaxaId] !== undefined ? String(formInputs[valorTaxaId]) : '';

    // Estados locais para controlar readOnly e o texto de informação
    const [isValorTaxaReadOnly, setIsValorTaxaReadOnly] = useState(false);
    const [taxaInfoTextContent, setTaxaInfoTextContent] = useState('');

    // Função que recalcula o readOnly, infoText e o valor automático
    const updateDisplayLogic = useCallback(() => {
        let newIsReadOnly = false;
        let newInfoText = '';
        let automaticValueToSet = ''; // Valor que o input deveria ter se fosse automático

        switch (selectedTipoTaxa) {
            case 'selic':
                newIsReadOnly = true;
                newInfoText = `SELIC atual: ${selicRate !== null ? selicRate.toFixed(2) : 'Carregando...'}% ao ano.`;
                automaticValueToSet = selicRate !== null ? selicRate.toFixed(2) : '';
                break;
            case 'ipca':
                newIsReadOnly = true;
                newInfoText = `IPCA acumulado (12 meses): ${ipcaRate !== null ? ipcaRate.toFixed(2) : 'Carregando...'}%.`;
                automaticValueToSet = ipcaRate !== null ? ipcaRate.toFixed(2) : '';
                break;
            case 'cdi':
                const cdiRate = selicRate !== null ? (selicRate - 0.1) : null;
                newIsReadOnly = true;
                newInfoText = `CDI estimado: ${cdiRate !== null ? cdiRate.toFixed(2) : 'Carregando...'}% ao ano (SELIC - 0.1%).`;
                automaticValueToSet = cdiRate !== null ? cdiRate.toFixed(2) : '';
                break;
            case 'indice-percentual':
                newIsReadOnly = false;
                const baseRate = selectedIndiceBase === 'selic' ? selicRate :
                                 selectedIndiceBase === 'ipca' ? ipcaRate :
                                 selectedIndiceBase === 'cdi' ? (selicRate !== null ? selicRate - 0.1 : null) : null;
                const baseName = selectedIndiceBase.toUpperCase();
                
                newInfoText = `Índice ${baseName} atual: ${baseRate !== null ? baseRate.toFixed(2) : 'Carregando...'}. Informe a porcentagem que o seu rendimento corresponde a ele.`;
                break;
            case 'custom-mensal':
                newIsReadOnly = false;
                newInfoText = "Insira a taxa mensal em %.";
                break;
            case 'custom-anual':
            default:
                newIsReadOnly = false;
                newInfoText = "Insira a taxa anual em %.";
                break;
        }

        setIsValorTaxaReadOnly(newIsReadOnly);
        setTaxaInfoTextContent(newInfoText);

        // Se o campo for readOnly, e o valor atual no estado do pai for diferente do automático,
        // force a atualização do estado do pai com o valor automático.
        // Isso evita que o usuário possa digitar em um campo que deveria ser automático.
        if (newIsReadOnly && currentInputValueFromState !== automaticValueToSet) {
             onInputChange({ target: { id: valorTaxaId, value: automaticValueToSet, type: 'number' } });
        } else if (!newIsReadOnly && currentInputValueFromState === '') {
            // Para campos customizados e vazios no estado, pode-se preencher com um valor padrão inicial se houver.
            // Aqui, deixamos vazio para o usuário digitar, a menos que seja inflacao.
            const defaultInitialValue = (idPrefix === 'inflacao' ? '0.5' : '');
            if (defaultInitialValue !== '' && currentInputValueFromState !== defaultInitialValue) {
                onInputChange({ target: { id: valorTaxaId, value: defaultInitialValue, type: 'number' } });
            }
        }
        
    }, [selectedTipoTaxa, selectedIndiceBase, selicRate, ipcaRate, onInputChange, currentInputValueFromState, valorTaxaId, idPrefix]);

    // Executa a lógica de atualização sempre que as dependências mudam
    useEffect(() => {
        updateDisplayLogic();
    }, [updateDisplayLogic]); // eslint-disable-line react-hooks/exhaustive-deps


    return (
        <fieldset className="form-section yield-rate-inputs">
            <legend className="section-title">Configuração da Taxa {titleContext}</legend>
            <div className="form-group">
                <label htmlFor={tipoTaxaId}>Tipo de Taxa:</label>
                <select
                    id={tipoTaxaId}
                    className="tipo-taxa-select"
                    onChange={onInputChange}
                    value={selectedTipoTaxa}
                >
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
            {selectedTipoTaxa === 'indice-percentual' && (
                <div className="form-group">
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
                    placeholder={selectedTipoTaxa === 'inflacao' ? 'Ex: 0.5 (mensal)' : 'Ex: 10.5 (anual)'}
                    value={isValorTaxaReadOnly ? (calculatedValorTaxa || '') : currentInputValueFromState} // Usa o valor do estado pai para inputs editáveis, senão o calculado
                    onChange={onInputChange}
                    readOnly={isValorTaxaReadOnly}
                    required
                />
                {taxaInfoTextContent && <small className="taxa-info-text">{taxaInfoTextContent}</small>}
            </div>
            {showIRSelect && (
                <div className="form-group">
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

export default YieldRateInputs;