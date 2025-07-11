import React, { useState, useEffect } from 'react';
import DynamicInputs from './DynamicInputs';
import * as Calc from '../utils/financialCalculations'; // Importa todas as funções de cálculo

const CalculatorForm = ({ selectedOption, onOptionChange, selicRate, ipcaRate, setResults }) => {
    // Estado interno para os inputs do formulário
    const [formInputs, setFormInputs] = useState({});
    const [isJurosVisible, setIsJurosVisible] = useState(false); // Para controlar a visibilidade dos juros na Opção 1

    // Limpa o estado dos inputs quando a opção principal muda
    useEffect(() => {
        setFormInputs({});
        setIsJurosVisible(false); // Reseta a visibilidade dos juros
    }, [selectedOption]);

    // Lida com a mudança em qualquer input do formulário
    const handleInputChange = (event) => {
        const { id, value, type, checked } = event.target;
        setFormInputs(prevInputs => ({
            ...prevInputs,
            [id]: type === 'checkbox' ? checked : value,
        }));
    };
    
    // Handler para o select de juros parcelados na Opção 1
    const handleJurosToggle = (event) => {
        const hasJuros = event.target.value === 'S';
        setIsJurosVisible(hasJuros);
        // Garante que o estado do select 'temJurosParcelado' seja atualizado no formInputs
        handleInputChange(event); 
        // Garante que a taxa de juros seja limpa se a opção "Não" for selecionada
        if (!hasJuros) {
            setFormInputs(prevInputs => ({
                ...prevInputs,
                taxaJurosParcelado: ''
            }));
        }
    };

    const handleCalculate = (event) => {
        event.preventDefault(); // Impede o recarregamento da página

        if (selectedOption === '0') {
            setResults(`<p style="color: orange;">Por favor, selecione uma opção de comparação antes de calcular.</p>`);
            return;
        }

        try {
            let calculationResultHTML = '';
            // Os cálculos agora usam os valores do estado `formInputs`
            switch (selectedOption) {
                case '1':
                    calculationResultHTML = calculateOption1(formInputs, selicRate, ipcaRate);
                    break;
                case '2':
                    calculationResultHTML = calculateOption2(formInputs, selicRate, ipcaRate);
                    break;
                case '3':
                    calculationResultHTML = calculateOption3(formInputs, selicRate, ipcaRate);
                    break;
                case '4':
                    calculationResultHTML = calculateOption4(formInputs);
                    break;
                case '5':
                    calculationResultHTML = calculateOption5(formInputs);
                    break;
                case '6':
                    calculationResultHTML = calculateOption6(formInputs, selicRate, ipcaRate);
                    break;
                case '7':
                    calculationResultHTML = calculateOption7(formInputs, selicRate, ipcaRate);
                    break;
                default:
                    calculationResultHTML = `<p>Opção ${selectedOption} ainda não implementada.</p>`;
            }
            setResults(calculationResultHTML);
        } catch (error) {
            setResults(`<p style="color: red;"><strong>Erro: ${error.message}</strong></p><p style="color: red;">Verifique se todos os campos obrigatórios foram preenchidos e se os valores são válidos.</p>`);
        }
    };

    /**
     * Helper para obter a taxa de rendimento convertida e ajustada para IR,
     * lendo os valores do objeto `inputs` do formulário.
     * @param {string} prefix - O prefixo dos IDs dos campos de taxa ('rendimento', 'inflacao', 'investimento').
     * @param {object} inputs - O objeto `formInputs` do estado do componente.
     * @param {number} numMeses - O número total de meses/parcelas.
     * @param {number | null} selicRate - A taxa SELIC atual.
     * @param {number | null} ipcaRate - A taxa IPCA atual.
     * @returns {{taxaMensal: number, considerarIR: string}} Objeto com a taxa mensal ajustada e se IR foi considerado ('S' ou 'N').
     */
    function getAdjustedYieldRateFromInputs(prefix, inputs, numMeses, selicRate, ipcaRate) {
        const tipoTaxa = Calc.getStringSelectValue(inputs, `${prefix}TipoTaxa`); // Usando helper do Calc
        const valorTaxa = Calc.getNumericInputValue(inputs, `${prefix}ValorTaxa`); // Usando helper do Calc
        const considerarIR = Calc.getStringSelectValue(inputs, `${prefix}ConsiderarIR`); // Usando helper do Calc

        let indiceBase = '';
        if (tipoTaxa === 'indice-percentual') {
            indiceBase = Calc.getStringSelectValue(inputs, `${prefix}IndiceBase`); // Usando helper do Calc
        }

        let taxaMensalDecimal = Calc.getConvertedMonthlyRate(tipoTaxa, valorTaxa, selicRate, ipcaRate, indiceBase);
        taxaMensalDecimal = Calc.ajustarTaxaParaIR(taxaMensalDecimal, numMeses, considerarIR);

        return { taxaMensal: taxaMensalDecimal, considerarIR: considerarIR };
    }


    // --- Funções de Cálculo Específicas para Cada Opção ---
    // Elas usam os helpers Calc.getNumericInputValue e Calc.getIntInputValue
    // para ler os valores do `formInputs` de forma segura.

    function calculateOption1(inputs, selicRate, ipcaRate) {
        const valorTotal = Calc.getNumericInputValue(inputs, "valorTotal");
        const parcelas = Calc.getIntInputValue(inputs, "parcelas");
        // Desconto pode ser opcional, usa 0 se não preenchido
        const descontoVista = Calc.getNumericInputValue(inputs, "descontoVista", false) / 100 || 0;
        const temJurosParcelado = inputs.temJurosParcelado === 'S';
        
        let valorVista = valorTotal * (1 - descontoVista);
        let valorParceladoComJuros = valorTotal;

        if (temJurosParcelado) {
            const tipoJurosParcelado = inputs.tipoJurosParcelado;
            // Adaptação: Se a opção tem juros, taxaJurosParcelado é obrigatório
            const taxaJurosParcelado = Calc.getNumericInputValue(inputs, "taxaJurosParcelado") / 100;
            valorParceladoComJuros = Calc.calcularValorParceladoComJuros(valorTotal, parcelas, taxaJurosParcelado, tipoJurosParcelado);
        }

        const valorParcelaCalculada = valorParceladoComJuros / parcelas; // Linha corrigida para usar valorParcelaCalculada
        const { taxaMensal: taxaRendimentoAjustada, considerarIR: irConsiderado } = getAdjustedYieldRateFromInputs('rendimento', inputs, parcelas, selicRate, ipcaRate);

        const { ganho: rendimentosAcumulados, simulacaoDetalhada } = Calc.simularRendimento(parcelas, valorParcelaCalculada, taxaRendimentoAjustada);
        const valorEfetivoParcelado = valorParceladoComJuros - rendimentosAcumulados;

        return `
            <h3>[1] Rendimento vs. Parcelas:</h3>
            <p>Valor total da compra: R$ ${valorTotal.toFixed(2)}</p>
            <p>Valor pagando à vista (com desconto): R$ ${valorVista.toFixed(2)}</p>
            <p>Valor pagando parcelado (com juros, se houver): R$ ${valorParceladoComJuros.toFixed(2)}</p>
            <p>Taxa de rendimento utilizada (após IR${irConsiderado === 'S' ? ' SIM' : ' NÃO'}): ${(taxaRendimentoAjustada * 100).toFixed(4)}% ao mês</p>
            <p>Rendimentos acumulados (se investir o que não foi gasto à vista): R$ ${rendimentosAcumulados.toFixed(2)}</p>
            <p>Valor efetivo pago parcelando (descontando rendimentos): R$ ${valorEfetivoParcelado.toFixed(2)}</p>
            ${simulacaoDetalhada}
            <strong>${valorVista < valorEfetivoParcelado ? "Compensa pagar à vista." : "Compensa parcelar."}</strong>
        `;
    }

    function calculateOption2(inputs, selicRate, ipcaRate) {
        const valorVista = Calc.getNumericInputValue(inputs, "valorVista");
        const parcelas = Calc.getIntInputValue(inputs, "parcelas");
        const valorParcela = Calc.getNumericInputValue(inputs, "valorParcela");
        
        const totalParcelado = parcelas * valorParcela;
        const { taxaMensal: taxaRendimentoAjustada, considerarIR: irConsiderado } = getAdjustedYieldRateFromInputs('rendimento', inputs, parcelas, selicRate, ipcaRate);

        const { ganho: rendimentosAcumulados, simulacaoDetalhada } = Calc.simularRendimento(parcelas, valorParcela, taxaRendimentoAjustada);
        const valorEfetivoParcelado = totalParcelado - rendimentosAcumulados;

        return `
            <h3>[2] À Vista vs. Parcelas:</h3>
            <p>Valor pagando à vista: R$ ${valorVista.toFixed(2)}</p>
            <p>Valor pagando parcelado: R$ ${totalParcelado.toFixed(2)}</p>
            <p>Taxa de rendimento utilizada (após IR${irConsiderado === 'S' ? ' SIM' : ' NÃO'}): ${(taxaRendimentoAjustada * 100).toFixed(4)}% ao mês</p>
            <p>Rendimentos acumulados (se investir o que não foi gasto à vista): R$ ${rendimentosAcumulados.toFixed(2)}</p>
            <p>Valor efetivo pago parcelando (descontando rendimentos): R$ ${valorEfetivoParcelado.toFixed(2)}</p>
            ${simulacaoDetalhada}
            <strong>${valorVista < valorEfetivoParcelado ? "Compensa pagar à vista." : "Compensa parcelar."}</strong>
        `;
    }
    
    function calculateOption3(inputs, selicRate, ipcaRate) {
        const entrada = Calc.getNumericInputValue(inputs, "entrada");
        const parcelas = Calc.getIntInputValue(inputs, "parcelas");
        const valorParcela = Calc.getNumericInputValue(inputs, "valorParcela");
        const valorVista = Calc.getNumericInputValue(inputs, "valorVista");
        const totalParcelado = entrada + parcelas * valorParcela;

        const { taxaMensal: taxaRendimentoAjustada, considerarIR: irConsiderado } = getAdjustedYieldRateFromInputs('rendimento', inputs, parcelas, selicRate, ipcaRate);
        
        let saldoInvestimento = valorVista;
        let rendimentoTotalAcumulado = 0;
        let tabelaDetalhada = '<p>Detalhes do Investimento (se o valor à vista fosse investido):</p><table><thead><tr><th>Mês</th><th>Saldo Inicial (R$)</th><th>Rendimento Mês (R$)</th><th>Valor Pago Mês (R$)</th><th>Saldo Final (R$)</th></tr></thead><tbody>';

        for (let i = 1; i <= parcelas; i++) {
            const rendimentoMes = saldoInvestimento * taxaRendimentoAjustada;
            const saldoInicialMes = saldoInvestimento;
            
            saldoInvestimento += rendimentoMes;
            rendimentoTotalAcumulado += rendimentoMes;
            
            let valorPagoNoMes = valorParcela;
            if (i === 1) { // A entrada é paga no mês 1
                valorPagoNoMes += entrada;
            }
            saldoInvestimento -= valorPagoNoMes;

            tabelaDetalhada += `<tr>
                <td>${i}</td>
                <td>${saldoInicialMes.toFixed(2)}</td>
                <td>${rendimentoMes.toFixed(2)}</td>
                <td>${valorPagoNoMes.toFixed(2)}</td>
                <td>${saldoInvestimento.toFixed(2)}</td>
            </tr>`;
        }
        tabelaDetalhada += '</tbody></table>';

        const valorEfetivoParceladoComEntrada = valorVista - saldoInvestimento;


        return `
            <h3>[3] Parcelamento com Entrada vs. À Vista:</h3>
            <p>Valor da entrada: R$ ${entrada.toFixed(2)}</p>
            <p>Valor de cada parcela: R$ ${valorParcela.toFixed(2)}</p>
            <p>Número de parcelas: ${parcelas}</p>
            <p>Total nominal parcelado (entrada + parcelas): R$ ${totalParcelado.toFixed(2)}</p>
            <p>Valor da compra à vista: R$ ${valorVista.toFixed(2)}</p>
            <p>Taxa de rendimento utilizada (após IR${irConsiderado === 'S' ? ' SIM' : ' NÃO'}): ${(taxaRendimentoAjustada * 100).toFixed(4)}% ao mês</p>
            <p>Rendimento total gerado pelo investimento do valor à vista: R$ ${rendimentoTotalAcumulado.toFixed(2)}</p>
            <p>Saldo final do investimento (após pagar entrada e parcelas): R$ ${saldoInvestimento.toFixed(2)}</p>
            <p>Custo efetivo do parcelamento com entrada (considerando rendimentos): R$ ${valorEfetivoParceladoComEntrada.toFixed(2)}</p>
            ${tabelaDetalhada}
            <strong>${saldoInvestimento >= 0 ? "Compensa parcelar com entrada e investir o valor à vista." : "Compensa pagar à vista."}</strong>
        `;
    }

    function calculateOption4(inputs) {
        const parcelas1 = Calc.getIntInputValue(inputs, "parcelas1");
        const valorParcela1 = Calc.getNumericInputValue(inputs, "valorParcela1");
        const parcelas2 = Calc.getIntInputValue(inputs, "parcelas2");
        const valorParcela2 = Calc.getNumericInputValue(inputs, "valorParcela2");

        const total1 = parcelas1 * valorParcela1;
        const total2 = parcelas2 * valorParcela2;

        return `
            <h3>[4] Comparar Duas Opções de Parcelamento:</h3>
            <p>Total da primeira opção: R$ ${total1.toFixed(2)}</p>
            <p>Total da segunda opção: R$ ${total2.toFixed(2)}</p>
            <strong>${total1 < total2 ? "A primeira opção é melhor." : "A segunda opção é melhor."}</strong>
        `;
    }

    function calculateOption5(inputs) {
        const valorParcelaOriginal = Calc.getNumericInputValue(inputs, "valorParcelaOriginal");
        const diasAtraso = Calc.getIntInputValue(inputs, "diasAtraso");
        const multa = Calc.getNumericInputValue(inputs, "multa") / 100;
        const jurosDiarios = Calc.getNumericInputValue(inputs, "jurosDiarios") / 100;

        const valorCorrigido = valorParcelaOriginal * (1 + multa + jurosDiarios * diasAtraso);

        return `
            <h3>[5] Impacto de Atrasos em Parcelas:</h3>
            <p>Valor com atraso: R$ ${valorCorrigido.toFixed(2)}</p>
        `;
    }
    
    function calculateOption6(inputs, selicRate, ipcaRate) {
        const parcelas = Calc.getIntInputValue(inputs, "parcelas");
        const valorParcela = Calc.getNumericInputValue(inputs, "valorParcela");
        
        const { taxaMensal: inflacaoMensalAjustada } = getAdjustedYieldRateFromInputs('inflacao', inputs, parcelas, selicRate, ipcaRate);

        let valorTotalInflacao = 0;
        for (let i = 1; i <= parcelas; i++) {
            valorTotalInflacao += valorParcela / Math.pow(1 + inflacaoMensalAjustada, i);
        }

        return `
            <h3>[6] Simulação com Inflação:</h3>
            <p>Valor de cada parcela: R$ ${valorParcela.toFixed(2)}</p>
            <p>Número de parcelas: ${parcelas}</p>
            <p>Taxa de inflação mensal utilizada: ${(inflacaoMensalAjustada * 100).toFixed(4)}%</p>
            <p>Valor total considerando a inflação (valor presente líquido): R$ ${valorTotalInflacao.toFixed(2)}</p>
        `;
    }
    
    function calculateOption7(inputs, selicRate, ipcaRate) {
        const valorVista = Calc.getNumericInputValue(inputs, "valorVista");
        const parcelas = Calc.getIntInputValue(inputs, "parcelas");
        const valorParcela = Calc.getNumericInputValue(inputs, "valorParcela");
        
        const { taxaMensal: taxaInvestimentoAjustada, considerarIR: irConsiderado } = getAdjustedYieldRateFromInputs('investimento', inputs, parcelas, selicRate, ipcaRate);

        let saldoInvestimento = valorVista;

        let tabelaDetalhada = '<p>Detalhes do Investimento:</p><table><thead><tr><th>Mês</th><th>Saldo Inicial (R$)</th><th>Rendimento (R$)</th><th>Parcela Paga (R$)</th><th>Saldo Final (R$)</th></tr></thead><tbody>';

        for (let i = 1; i <= parcelas; i++) {
            const rendimento = saldoInvestimento * taxaInvestimentoAjustada;
            const saldoInicialMes = saldoInvestimento;
            
            saldoInvestimento += rendimento;
            saldoInvestimento -= valorParcela;

            tabelaDetalhada += `<tr>
                <td>${i}</td>
                <td>${saldoInicialMes.toFixed(2)}</td>
                <td>${rendimento.toFixed(2)}</td>
                <td>${valorParcela.toFixed(2)}</td>
                <td>${saldoInvestimento.toFixed(2)}</td>
            </tr>`;
        }
        tabelaDetalhada += '</tbody></table>';

        return `
            <h3>[7] Comparar com Investimento Alternativo:</h3>
            <p>Valor da compra à vista: R$ ${valorVista.toFixed(2)}</p>
            <p>Valor de cada parcela: R$ ${valorParcela.toFixed(2)}</p>
            <p>Número de parcelas: ${parcelas}</p>
            <p>Taxa de investimento utilizada (após IR${irConsiderado === 'S' ? ' SIM' : ' NÃO'}): ${(taxaInvestimentoAjustada * 100).toFixed(4)}% ao mês</p>
            <p>Saldo final se você investir o valor à vista e pagar em parcelas: R$ ${saldoInvestimento.toFixed(2)}</p>
            ${tabelaDetalhada}
            <strong>${saldoInvestimento > 0 ? "Investir e parcelar é vantajoso (você termina com dinheiro extra)." : "Pagar à vista é mais seguro (evita dívidas ou perdas)."}</strong>
        `;
    }

    return (
        <form id="form-simulador">
            <fieldset className="form-section">
                <legend className="section-title">Escolha sua simulação</legend>
                <div className="form-group">
                    <label htmlFor="opcao">Tipo de Comparação:</label>
                    <select id="opcao" onChange={onOptionChange} value={selectedOption} aria-describedby="opcao-description">
                        <option value="0" disabled>Selecione uma opção...</option>
                        <option value="1">Rendimento vs. Parcelas (com juros e descontos)</option>
                        <option value="2">À Vista vs. Parcelas (comparar valores)</option>
                        <option value="3">Entrada + Parcelas vs. À Vista</option>
                        <option value="4">Comparar duas opções de parcelamento</option>
                        <option value="5">Impacto do atraso nas parcelas</option>
                        <option value="6">Simulação com inflação (Valor Presente Líquido)</option>
                        <option value="7">Comparar com investimento alternativo</option>
                    </select>
                </div>
            </fieldset>

            <DynamicInputs 
                selectedOption={selectedOption} 
                onInputChange={handleInputChange} 
                formInputs={formInputs}
                selicRate={selicRate}
                ipcaRate={ipcaRate}
                onJurosToggle={handleJurosToggle}
                isJurosVisible={isJurosVisible}
            />

            <button type="button" id="calcular" onClick={handleCalculate}>Calcular</button>
        </form>
    );
};

export default CalculatorForm;