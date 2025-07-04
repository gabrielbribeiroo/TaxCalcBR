import React, { useState, useEffect } from 'react';
import DynamicInputs from './DynamicInputs';
import * as Calc from '../utils/financialCalculations'; // Importa todas as funções de cálculo

const CalculatorForm = ({ selectedOption, onOptionChange, selicRate, ipcaRate, setResults }) => {
    // Estado interno para os inputs do formulário
    const [formInputs, setFormInputs] = useState({});
    const [isJurosVisible, setIsJurosVisible] = useState(false);

    // Limpa o estado dos inputs quando a opção principal muda
    useEffect(() => {
        setFormInputs({});
    }, [selectedOption]);

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

    // --- Funções de Cálculo Traduzidas para React ---
    // Elas leem do estado do formulário e usam as funções do módulo `financialCalculations`.

    function calculateOption1(inputs, selicRate, ipcaRate) {
        const valorTotal = parseFloat(inputs.valorTotal);
        const parcelas = parseInt(inputs.parcelas);
        const descontoVista = parseFloat(inputs.descontoVista) / 100 || 0;
        const temJurosParcelado = inputs.temJurosParcelado === 'S';
        const tipoTaxa = inputs.rendimentoTipoTaxa;
        const valorTaxa = parseFloat(inputs.rendimentoValorTaxa);
        const considerarIR = inputs.rendimentoConsiderarIR === 'S';
        
        let valorVista = valorTotal * (1 - descontoVista);
        let valorParceladoComJuros = valorTotal;

        if (temJurosParcelado) {
            const tipoJurosParcelado = inputs.tipoJurosParcelado;
            const taxaJurosParcelado = parseFloat(inputs.taxaJurosParcelado) / 100;
            valorParceladoComJuros = Calc.calcularValorParceladoComJuros(valorTotal, parcelas, taxaJurosParcelado, tipoJurosParcelado);
        }

        const valorParcela = valorParceladoComJuros / parcelas;
        const taxaRendimentoAjustada = Calc.ajustarTaxaParaIR(
            Calc.getConvertedMonthlyRate(tipoTaxa, valorTaxa, selicRate, ipcaRate, inputs.rendimentoIndiceBase),
            parcelas,
            considerarIR ? 'S' : 'N'
        );

        const { ganho: rendimentosAcumulados, simulacaoDetalhada } = Calc.simularRendimento(parcelas, valorParcela, taxaRendimentoAjustada);
        const valorEfetivoParcelado = valorParceladoComJuros - rendimentosAcumulados;

        return `
            <h3>[1] Rendimento vs. Parcelas:</h3>
            <p>Valor total da compra: R$ ${valorTotal.toFixed(2)}</p>
            <p>Valor pagando à vista (com desconto): R$ ${valorVista.toFixed(2)}</p>
            <p>Valor pagando parcelado (com juros, se houver): R$ ${valorParceladoComJuros.toFixed(2)}</p>
            <p>Taxa de rendimento utilizada (após IR${considerarIR ? ' SIM' : ' NÃO'}): ${(taxaRendimentoAjustada * 100).toFixed(4)}% ao mês</p>
            <p>Rendimentos acumulados (se investir o que não foi gasto à vista): R$ ${rendimentosAcumulados.toFixed(2)}</p>
            <p>Valor efetivo pago parcelando (descontando rendimentos): R$ ${valorEfetivoParcelado.toFixed(2)}</p>
            ${simulacaoDetalhada}
            <strong>${valorVista < valorEfetivoParcelado ? "Compensa pagar à vista." : "Compensa parcelar."}</strong>
        `;
    }

    function calculateOption2(inputs, selicRate, ipcaRate) {
        const valorVista = parseFloat(inputs.valorVista);
        const parcelas = parseInt(inputs.parcelas);
        const valorParcela = parseFloat(inputs.valorParcela);
        const tipoTaxa = inputs.rendimentoTipoTaxa;
        const valorTaxa = parseFloat(inputs.rendimentoValorTaxa);
        const considerarIR = inputs.rendimentoConsiderarIR === 'S';
        
        const totalParcelado = parcelas * valorParcela;
        const taxaRendimentoAjustada = Calc.ajustarTaxaParaIR(
            Calc.getConvertedMonthlyRate(tipoTaxa, valorTaxa, selicRate, ipcaRate, inputs.rendimentoIndiceBase),
            parcelas,
            considerarIR ? 'S' : 'N'
        );
        const { ganho: rendimentosAcumulados, simulacaoDetalhada } = Calc.simularRendimento(parcelas, valorParcela, taxaRendimentoAjustada);
        const valorEfetivoParcelado = totalParcelado - rendimentosAcumulados;

        return `
            <h3>[2] À Vista vs. Parcelas:</h3>
            <p>Valor pagando à vista: R$ ${valorVista.toFixed(2)}</p>
            <p>Valor pagando parcelado: R$ ${totalParcelado.toFixed(2)}</p>
            <p>Taxa de rendimento utilizada (após IR${considerarIR ? ' SIM' : ' NÃO'}): ${(taxaRendimentoAjustada * 100).toFixed(4)}% ao mês</p>
            <p>Rendimentos acumulados (se investir o que não foi gasto à vista): R$ ${rendimentosAcumulados.toFixed(2)}</p>
            <p>Valor efetivo pago parcelando (descontando rendimentos): R$ ${valorEfetivoParcelado.toFixed(2)}</p>
            ${simulacaoDetalhada}
            <strong>${valorVista < valorEfetivoParcelado ? "Compensa pagar à vista." : "Compensa parcelar."}</strong>
        `;
    }
    
    function calculateOption3(inputs, selicRate, ipcaRate) {
        const entrada = parseFloat(inputs.entrada);
        const parcelas = parseInt(inputs.parcelas);
        const valorParcela = parseFloat(inputs.valorParcela);
        const valorVista = parseFloat(inputs.valorVista);
        const totalParcelado = entrada + parcelas * valorParcela;
        const tipoTaxa = inputs.rendimentoTipoTaxa;
        const valorTaxa = parseFloat(inputs.rendimentoValorTaxa);
        const considerarIR = inputs.rendimentoConsiderarIR === 'S';
        
        const taxaRendimentoAjustada = Calc.ajustarTaxaParaIR(
            Calc.getConvertedMonthlyRate(tipoTaxa, valorTaxa, selicRate, ipcaRate, inputs.rendimentoIndiceBase),
            parcelas,
            considerarIR ? 'S' : 'N'
        );
        
        let saldoInvestimento = valorVista;
        let rendimentoTotalAcumulado = 0;
        let tabelaDetalhada = '<p>Detalhes do Investimento (se o valor à vista fosse investido):</p><table><thead><tr><th>Mês</th><th>Saldo Inicial (R$)</th><th>Rendimento Mês (R$)</th><th>Valor Pago Mês (R$)</th><th>Saldo Final (R$)</th></tr></thead><tbody>';

        for (let i = 1; i <= parcelas; i++) {
            const rendimentoMes = saldoInvestimento * taxaRendimentoAjustada;
            const saldoInicialMes = saldoInvestimento;
            
            saldoInvestimento += rendimentoMes;
            rendimentoTotalAcumulado += rendimentoMes;
            
            let valorPagoNoMes = valorParcela;
            if (i === 1) {
                valorPagoNoMes += entrada;
            }
            saldoInvestimento -= valorPagoNoMes;

            tabelaDetalhada += `<tr><td>${i}</td><td>${saldoInicialMes.toFixed(2)}</td><td>${rendimentoMes.toFixed(2)}</td><td>${valorPagoNoMes.toFixed(2)}</td><td>${saldoInvestimento.toFixed(2)}</td></tr>`;
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
            <p>Taxa de rendimento utilizada (após IR${considerarIR ? ' SIM' : ' NÃO'}): ${(taxaRendimentoAjustada * 100).toFixed(4)}% ao mês</p>
            <p>Rendimento total gerado pelo investimento do valor à vista: R$ ${rendimentoTotalAcumulado.toFixed(2)}</p>
            <p>Saldo final do investimento (após pagar entrada e parcelas): R$ ${saldoInvestimento.toFixed(2)}</p>
            <p>Custo efetivo do parcelamento com entrada (considerando rendimentos): R$ ${valorEfetivoParceladoComEntrada.toFixed(2)}</p>
            ${tabelaDetalhada}
            <strong>${saldoInvestimento >= 0 ? "Compensa parcelar com entrada e investir o valor à vista." : "Compensa pagar à vista."}</strong>
        `;
    }

    function calculateOption4(inputs) {
        const parcelas1 = parseInt(inputs.parcelas1);
        const valorParcela1 = parseFloat(inputs.valorParcela1);
        const parcelas2 = parseInt(inputs.parcelas2);
        const valorParcela2 = parseFloat(inputs.valorParcela2);
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
        const valorParcelaOriginal = parseFloat(inputs.valorParcelaOriginal);
        const diasAtraso = parseInt(inputs.diasAtraso);
        const multa = parseFloat(inputs.multa) / 100;
        const jurosDiarios = parseFloat(inputs.jurosDiarios) / 100;
        const valorCorrigido = valorParcelaOriginal * (1 + multa + jurosDiarios * diasAtraso);
        return `
            <h3>[5] Impacto de Atrasos em Parcelas:</h3>
            <p>Valor com atraso: R$ ${valorCorrigido.toFixed(2)}</p>
        `;
    }
    
    function calculateOption6(inputs, selicRate, ipcaRate) {
        const parcelas = parseInt(inputs.parcelas);
        const valorParcela = parseFloat(inputs.valorParcela);
        const tipoTaxa = inputs.inflacaoTipoTaxa;
        const valorTaxa = parseFloat(inputs.inflacaoValorTaxa);
        
        const inflacaoMensalAjustada = Calc.getConvertedMonthlyRate(tipoTaxa, valorTaxa, selicRate, ipcaRate, inputs.inflacaoIndiceBase);
        
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
        const valorVista = parseFloat(inputs.valorVista);
        const parcelas = parseInt(inputs.parcelas);
        const valorParcela = parseFloat(inputs.valorParcela);
        const tipoTaxa = inputs.investimentoTipoTaxa;
        const valorTaxa = parseFloat(inputs.investimentoValorTaxa);
        const considerarIR = inputs.investimentoConsiderarIR === 'S';
        
        const taxaInvestimentoAjustada = Calc.ajustarTaxaParaIR(
            Calc.getConvertedMonthlyRate(tipoTaxa, valorTaxa, selicRate, ipcaRate, inputs.investimentoIndiceBase),
            parcelas,
            considerarIR ? 'S' : 'N'
        );

        let saldoInvestimento = valorVista;
        let tabelaDetalhada = '<p>Detalhes do Investimento:</p><table><thead><tr><th>Mês</th><th>Saldo Inicial (R$)</th><th>Rendimento (R$)</th><th>Parcela Paga (R$)</th><th>Saldo Final (R$)</th></tr></thead><tbody>';

        for (let i = 1; i <= parcelas; i++) {
            const rendimento = saldoInvestimento * taxaInvestimentoAjustada;
            const saldoInicialMes = saldoInvestimento;
            saldoInvestimento += rendimento;
            saldoInvestimento -= valorParcela;
            tabelaDetalhada += `<tr><td>${i}</td><td>${saldoInicialMes.toFixed(2)}</td><td>${rendimento.toFixed(2)}</td><td>${valorParcela.toFixed(2)}</td><td>${saldoInvestimento.toFixed(2)}</td></tr>`;
        }
        tabelaDetalhada += '</tbody></table>';

        return `
            <h3>[7] Comparar com Investimento Alternativo:</h3>
            <p>Valor da compra à vista: R$ ${valorVista.toFixed(2)}</p>
            <p>Valor de cada parcela: R$ ${valorParcela.toFixed(2)}</p>
            <p>Número de parcelas: ${parcelas}</p>
            <p>Taxa de investimento utilizada (após IR${considerarIR ? ' SIM' : ' NÃO'}): ${(taxaInvestimentoAjustada * 100).toFixed(4)}% ao mês</p>
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