/**
 * Funções puras para cálculos financeiros.
 * Não têm dependência de React ou do DOM.
 */

/**
 * Helper para obter valor numérico de um input a partir do objeto de estado `inputs`, validando-o.
 * @param {object} inputs - O objeto de estado `formInputs`.
 * @param {string} id - O ID do campo.
 * @param {boolean} required - Se o campo é obrigatório (default: true).
 * @returns {number} O valor numérico.
 * @throws {Error} Se o campo for obrigatório e inválido/vazio.
 */
export function getNumericInputValue(inputs, id, required = true) {
    const value = inputs[id];
    if (value === undefined || value === null || value === "") {
        if (required) {
            // Tenta obter o nome do campo de forma mais robusta (fallback para ID)
            const labelElement = document.querySelector(`label[for="${id}"]`) || document.getElementById(id)?.closest('.form-group')?.querySelector('label');
            const fieldName = labelElement ? labelElement.textContent.replace(':', '').trim() : id;
            throw new Error(`O campo "${fieldName}" é obrigatório.`);
        }
        return 0; // Retorna 0 para campos opcionais vazios
    }
    const numValue = parseFloat(String(value).replace(',', '.')); // Converte o valor do estado
    if (isNaN(numValue)) {
        const labelElement = document.querySelector(`label[for="${id}"]`) || document.getElementById(id)?.closest('.form-group')?.querySelector('label');
        const fieldName = labelElement ? labelElement.textContent.replace(':', '').trim() : id;
        throw new Error(`Valor inválido para o campo "${fieldName}".`);
    }
    return numValue;
}

/**
 * Helper para obter valor inteiro de um input a partir do objeto de estado `inputs`, validando-o.
 * @param {object} inputs - O objeto de estado `formInputs`.
 * @param {string} id - O ID do campo.
 * @param {boolean} required - Se o campo é obrigatório (default: true).
 * @returns {number} O valor inteiro.
 * @throws {Error} Se o campo for obrigatório e inválido/vazio.
 */
export function getIntInputValue(inputs, id, required = true) {
    const value = inputs[id];
    if (value === undefined || value === null || value === "") {
        if (required) {
            const labelElement = document.querySelector(`label[for="${id}"]`) || document.getElementById(id)?.closest('.form-group')?.querySelector('label');
            const fieldName = labelElement ? labelElement.textContent.replace(':', '').trim() : id;
            throw new Error(`O campo "${fieldName}" é obrigatório.`);
        }
        return 0;
    }
    const intValue = parseInt(String(value), 10);
    if (isNaN(intValue)) {
        const labelElement = document.querySelector(`label[for="${id}"]`) || document.getElementById(id)?.closest('.form-group')?.querySelector('label');
        const fieldName = labelElement ? labelElement.textContent.replace(':', '').trim() : id;
        throw new Error(`Valor inválido para o campo "${fieldName}".`);
    }
    return intValue;
}

/**
 * Helper para obter o valor de um select a partir do objeto de estado `inputs`.
 * @param {object} inputs - O objeto de estado `formInputs`.
 * @param {string} id - O ID do campo select.
 * @returns {string} O valor do select.
 * @throws {Error} Se o campo não for encontrado ou estiver vazio (se for obrigatório).
 */
export function getStringSelectValue(inputs, id) {
    const value = inputs[id];
    // Em selects, geralmente não é undefined se o HTML tem default, mas é bom verificar
    if (value === undefined || value === null || value === '') {
        // Pode-se optar por lançar um erro ou retornar um valor padrão como '' ou null
        // Para selects, geralmente há um valor padrão ou a validação ocorre de outra forma.
        // Se este select for *requerido*, o getNumericInputValue ou getIntInputValue já teriam lançado erro.
        return ''; // Retorna string vazia ou um default apropriado
    }
    return String(value);
}


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
        else if (meses <= 24) aliquotaIR = 0.175; // 17.5% de IR
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
        simulacaoDetalhada += `<tr><td>${i}</td><td>${capitalInvestidoInicial.toFixed(2)}</td><td>${rendimentoMensal.toFixed(2)}</td></tr>`;
        capitalInvestidoInicial -= valor_parcela;
    }
    simulacaoDetalhada += '</tbody></table>';
    return { ganho, simulacaoDetalhada };
}

/**
 * Converte a taxa informada pelo usuário (ou selecionada automaticamente) para uma taxa mensal decimal.
 * @param {string} tipoTaxa - Tipo da taxa ('custom-anual', 'custom-mensal', 'selic', 'ipca', 'cdi', 'indice-percentual', 'inflacao').
 * @param {number | string} valorTaxaInput - O valor numérico ou string do input da taxa.
 * @param {number | null} selicAtual - Valor atual da SELIC.
 * @param {number | null} ipcaAtual - Valor atual do IPCA.
 * @param {string} [indiceBase=''] - O índice base para 'indice-percentual'.
 * @returns {number} A taxa mensal decimal convertida.
 * @throws {Error} Se o tipo de taxa for desconhecido ou valores de SELIC/IPCA não estiverem carregados.
 */
export function getConvertedMonthlyRate(tipoTaxa, valorTaxaInput, selicAtual, ipcaAtual, indiceBase = '') {
    let taxaAnualDecimal = 0;
    let taxaMensalDecimal = 0;

    const rawValue = parseFloat(valorTaxaInput);
    // Para tipos que esperam um valor numérico do usuário, validar se é NaN
    if (isNaN(rawValue) && (tipoTaxa.startsWith('custom-') || tipoTaxa === 'indice-percentual' || tipoTaxa === 'inflacao')) {
        // Tenta encontrar o label associado ao valorTaxaInput para uma mensagem mais amigável
        // Nota: Em um componente React, este `document.querySelector` seria menos ideal, mas aqui
        // ele serve para pegar o nome do campo se o erro for lançado da camada de cálculo.
        const labelElement = document.querySelector(`label[for*="ValorTaxa"]`)?.textContent.replace(':', '').trim() || "Taxa de Rendimento/Inflação";
        throw new Error(`O valor do campo "${labelElement}" não pode ser vazio para o tipo selecionado.`);
    }

    switch (tipoTaxa) {
        case 'custom-anual':
            taxaAnualDecimal = rawValue / 100;
            taxaMensalDecimal = Math.pow(1 + taxaAnualDecimal, 1/12) - 1;
            break;
        case 'custom-mensal':
            taxaMensalDecimal = rawValue / 100;
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
            taxaAnualDecimal = (rawValue / 100) * taxaBaseAnual;
            taxaMensalDecimal = Math.pow(1 + taxaAnualDecimal, 1/12) - 1;
            break;
        case 'inflacao': // Usado na Opção 6
            taxaMensalDecimal = rawValue / 100;
            break;
        default:
            throw new Error("Tipo de taxa de rendimento desconhecido.");
    }
    return taxaMensalDecimal;
}