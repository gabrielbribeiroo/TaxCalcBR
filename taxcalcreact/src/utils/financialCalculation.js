/**
 * Funções puras para cálculos financeiros.
 * Não têm dependência de React ou do DOM.
 */

/**
 * Ajusta a taxa de rendimento (mensal) com base nas alíquotas de Imposto de Renda.
 * @param {number} taxaMensal - Taxa de rendimento mensal original (decimal).
 * @param {number} meses - Quantidade de meses de aplicação/parcelas (para determinar a alíquota de IR).
 * @param {string} considerarIR - 'S' para considerar IR, 'N' caso contrário.
 * @returns {number} A taxa ajustada.
 */
export function ajustarTaxaParaIR(taxaMensal, meses, considerarIR) {
    if (considerarIR === 'S') {
        let aliquotaIR = 0;
        if (meses <= 6) aliquotaIR = 0.225; // Até 180 dias
        else if (meses <= 12) aliquotaIR = 0.20; // De 181 a 360 dias
        else if (meses <= 24) aliquotaIR = 0.175; // De 361 a 720 dias
        else aliquotaIR = 0.15; // Acima de 720 dias
        return taxaMensal * (1 - aliquotaIR);
    }
    return taxaMensal;
}

/**
 * Calcula o valor total de uma dívida com juros (simples ou compostos).
 * @param {number} valorInicial - Valor principal da dívida.
 * @param {number} qntParcelas - Número de períodos de juros.
 * @param {number} jurosMensais - Taxa de juros por período (decimal).
 * @param {string} tipoJuros - 'simples' ou 'composto'.
 * @returns {number} O valor total da dívida após os juros.
 */
export function calcularValorParceladoComJuros(valorInicial, qntParcelas, jurosMensais, tipoJuros) {
    if (tipoJuros === 'simples') {
        return valorInicial * (1 + jurosMensais * qntParcelas);
    }
    return valorInicial * Math.pow((1 + jurosMensais), qntParcelas);
}

/**
 * Simula os rendimentos acumulados de um valor ao longo das parcelas.
 * @param {number} qnt_parcelas - Quantidade total de parcelas.
 * @param {number} valor_parcela - Valor de cada parcela.
 * @param {number} taxa_mensal - Taxa de rendimento mensal (decimal).
 * @returns {{ganho: number, simulacaoDetalhada: string}} Objeto com o ganho total e a tabela HTML da simulação.
 */
export function simularRendimento(qnt_parcelas, valor_parcela, taxa_mensal) {
    let ganho = 0;
    let capitalInvestidoInicial = valor_parcela * qnt_parcelas;
    let simulacaoDetalhada = '<p>Detalhes do Rendimento:</p><table><thead><tr><th>Parcela</th><th>Capital p/ Rendimento (R$)</th><th>Rendimento (R$)</th></tr></thead><tbody>';

    for (let i = 1; i <= qnt_parcelas; i++) {
        let rendimentoMensal = capitalInvestidoInicial * taxa_mensal;
        ganho += rendimentoMensal;
        simulacaoDetalhada += `<tr><td>${i}</td><td>${capitalInvestidoInicial.toFixed(2)}</td><td>${rendimentoMensal.toFixed(2)}</td></td></tr>`; // Corrigido td fechamento aqui
        capitalInvestidoInicial -= valor_parcela;
    }
    simulacaoDetalhada += '</tbody></table>';
    return { ganho, simulacaoDetalhada };
}

/**
 * Converte a taxa informada para uma taxa mensal decimal.
 * @param {string} tipoTaxa - Tipo da taxa ('custom-anual', 'custom-mensal', 'selic', 'ipca', 'cdi', 'indice-percentual').
 * @param {number} valorTaxaInput - O valor numérico da taxa (se personalizada ou percentual do índice).
 * @param {number} selicAtual - Valor atual da SELIC.
 * @param {number} ipcaAtual - Valor atual do IPCA.
 * @param {string} [indiceBase=''] - O índice base para 'indice-percentual'.
 * @returns {number} A taxa mensal decimal convertida.
 * @throws {Error} Se o tipo de taxa for desconhecido ou valores de índices não estiverem carregados.
 */
export function getConvertedMonthlyRate(tipoTaxa, valorTaxaInput, selicAtual, ipcaAtual, indiceBase = '') {
    let taxaAnualDecimal = 0;
    let taxaMensalDecimal = 0;

    switch (tipoTaxa) {
        case 'custom-anual':
            taxaAnualDecimal = valorTaxaInput / 100;
            taxaMensalDecimal = Math.pow(1 + taxaAnualDecimal, 1/12) - 1;
            break;
        case 'custom-mensal':
            taxaMensalDecimal = valorTaxaInput / 100;
            break;
        case 'selic':
            if (selicAtual === null) throw new Error("Taxa SELIC não carregada. Tente novamente.");
            taxaAnualDecimal = selicAtual / 100;
            taxaMensalDecimal = Math.pow(1 + taxaAnualDecimal, 1/12) - 1;
            break;
        case 'ipca':
            if (ipcaAtual === null) throw new Error("Taxa IPCA não carregada. Tente novamente.");
            taxaAnualDecimal = ipcaAtual / 100; // IPCA é acumulado em 12 meses, então já é uma taxa anualizada.
            taxaMensalDecimal = Math.pow(1 + taxaAnualDecimal, 1/12) - 1;
            break;
        case 'cdi':
            if (selicAtual === null) throw new Error("Taxa SELIC (para CDI) não carregada. Tente novamente.");
            taxaAnualDecimal = (selicAtual - 0.1) / 100; // CDI geralmente 0.1% abaixo da SELIC meta anual.
            taxaMensalDecimal = Math.pow(1 + taxaAnualDecimal, 1/12) - 1;
            break;
        case 'indice-percentual':
            let taxaBaseAnual = 0;
            if (indiceBase === 'selic') {
                if (selicAtual === null) throw new Error("Taxa SELIC (para % do índice) não carregada. Tente novamente.");
                taxaBaseAnual = selicAtual / 100;
            } else if (indiceBase === 'ipca') {
                if (ipcaAtual === null) throw new Error("Taxa IPCA (para % do índice) não carregada. Tente novamente.");
                taxaBaseAnual = ipcaAtual / 100;
            } else if (indiceBase === 'cdi') {
                if (selicAtual === null) throw new Error("Taxa SELIC (para CDI) não carregada. Tente novamente.");
                taxaBaseAnual = (selicAtual - 0.1) / 100;
            } else {
                throw new Error("Índice base para 'Índice + Percentual' não especificado ou inválido.");
            }
            // Calcula a taxa anual do investimento como (percentual_informado_pelo_usuario / 100) * taxa_base_anual
            taxaAnualDecimal = (valorTaxaInput / 100) * taxaBaseAnual;
            taxaMensalDecimal = Math.pow(1 + taxaAnualDecimal, 1/12) - 1;
            break;
        case 'inflacao': // Usado na Opção 6, é sempre uma taxa mensal customizada
            taxaMensalDecimal = valorTaxaInput / 100;
            break;
        default:
            throw new Error("Tipo de taxa de rendimento desconhecido.");
    }
    return taxaMensalDecimal;
}