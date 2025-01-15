// Referências aos elementos HTML
const selectOpcao = document.getElementById("opcao");
const calcularBtn = document.getElementById("calcular");
const resultadoDiv = document.getElementById("resultado");
const inputContainer = document.getElementById("input-container");

// Limpa os inputs e a área de resultados
function limparCampos() {
    inputContainer.innerHTML = "";
    resultadoDiv.innerHTML = "";
}

// Cria dinamicamente campos de entrada de acordo com a opção escolhida
function criarCamposParaOpcao(opcao) {
    limparCampos();

    if (opcao === "1") {
        inputContainer.innerHTML = `
            <label>Digite o valor total da compra (R$): <input type="number" id="valorTotal" step="0.01" required></label>
            <label>Digite o número de parcelas: <input type="number" id="parcelas" min="1" required></label>
            <label>Digite a taxa de rendimento mensal (%): <input type="number" id="taxaRendimento" step="0.01" required></label>
            <label>Digite a porcentagem de desconto à vista (se houver): <input type="number" id="descontoVista" step="0.01"></label>
            <label>Deseja considerar imposto de renda sobre os rendimentos? (S/N): 
                <select id="considerarIR">
                    <option value="N">Não</option>
                    <option value="S">Sim</option>
                </select>
            </label>
        `;
    } else if (opcao === "2") {
        inputContainer.innerHTML = `
            <label>Digite o valor da compra à vista (R$): <input type="number" id="valorVista" step="0.01" required></label>
            <label>Digite o número de parcelas: <input type="number" id="parcelas" min="1" required></label>
            <label>Digite o valor de cada parcela (R$): <input type="number" id="valorParcela" step="0.01" required></label>
            <label>Digite a taxa de rendimento mensal (%): <input type="number" id="taxaRendimento" step="0.01" required></label>
        `;
    }
}

// Adiciona evento para atualizar os campos de entrada ao selecionar uma opção
selectOpcao.addEventListener("change", () => {
    const opcao = selectOpcao.value;
    criarCamposParaOpcao(opcao);
});

// Função para descer a tela automaticamente
function descerTela() {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
    });
}

// Função para ajustar a taxa de rendimento considerando o IR
function ajustarTaxaParaIR(taxa, qntParcelas, considerarIR) {
    if (considerarIR === "S") {
        if (qntParcelas <= 6) {
            return taxa * 0.775;
        } else if (qntParcelas <= 12) {
            return taxa * 0.80;
        } else if (qntParcelas <= 24) {
            return taxa * 0.825;
        } else {
            return taxa * 0.85;
        }
    }
    return taxa;
}

// Adiciona evento ao botão "Calcular"
calcularBtn.addEventListener("click", () => {
    const opcao = selectOpcao.value;
    resultadoDiv.innerHTML = ""; // Limpa resultados anteriores

    if (opcao === "0") {
        resultadoDiv.innerHTML = `<p class="error">Por favor, selecione uma opção válida.</p>`;
        descerTela();
        return;
    }

    // Coleta os valores inseridos pelo usuário
    const valorTotal = parseFloat(document.getElementById("valorTotal")?.value || 0);
    const valorVista = parseFloat(document.getElementById("valorVista")?.value || 0);
    const parcelas = parseInt(document.getElementById("parcelas")?.value || 0);
    const taxaRendimento = parseFloat(document.getElementById("taxaRendimento")?.value || 0) / 100;
    const descontoVista = parseFloat(document.getElementById("descontoVista")?.value || 0) / 100;
    const considerarIR = document.getElementById("considerarIR")?.value || "N";
    const valorParcela = parseFloat(document.getElementById("valorParcela")?.value || 0);

    let resultado = "";

    if (opcao === "1") {
        if (!valorTotal || !parcelas || !taxaRendimento) {
            resultadoDiv.innerHTML = `<p class="error">Por favor, preencha todos os campos necessários.</p>`;
            descerTela();
            return;
        }

        let taxaAjustada = ajustarTaxaParaIR(taxaRendimento, parcelas, considerarIR);
        let valorVistaFinal = valorTotal * (1 - descontoVista);

        const temJuros = prompt("Há juros em pagar parcelado? [S/N]").trim().toUpperCase();
        let valorParceladoTotal = valorTotal;

        if (temJuros === "S") {
            const tipoJuros = prompt("Escolha o tipo de juros:\n1 - Simples\n2 - Compostos").trim();

            if (tipoJuros === "1") {
                const jurosSimples = parseFloat(prompt("Qual a porcentagem de juros em pagar parcelado?")) / 100;
                valorParceladoTotal = valorTotal * (1 + jurosSimples);
            } else if (tipoJuros === "2") {
                const jurosMensais = parseFloat(prompt("Qual a porcentagem de juros ao mês (a.m.)?")) / 100;
                valorParceladoTotal = valorTotal * (1 + jurosMensais) ** parcelas;
            }
        }

        const rendimento = ((valorParceladoTotal / parcelas) * parcelas * taxaAjustada);
        const valorFinalParcelado = valorParceladoTotal - rendimento;

        resultado = `
            <p>Valor total à vista (com desconto): R$ ${valorVistaFinal.toFixed(2)}</p>
            <p>Valor total parcelado: R$ ${valorParceladoTotal.toFixed(2)}</p>
            <p>Rendimentos acumulados: R$ ${rendimento.toFixed(2)}</p>
            <p>Valor pago parcelado (com rendimento): R$ ${valorFinalParcelado.toFixed(2)}</p>
        `;

        if (valorVistaFinal < valorFinalParcelado) {
            resultado += `<p>Compensa pagar à vista.</p>`;
        } else {
            resultado += `<p>Compensa parcelar.</p>`;
        }
    } else if (opcao === "2") {
        if (!valorVista || !parcelas || !valorParcela || !taxaRendimento) {
            resultadoDiv.innerHTML = `<p class="error">Por favor, preencha todos os campos necessários.</p>`;
            descerTela();
            return;
        }

        const valorTotalParcelado = parcelas * valorParcela;
        let taxaAjustada = ajustarTaxaParaIR(taxaRendimento, parcelas, considerarIR);
        const rendimento = ((valorParcela * parcelas) * taxaAjustada);
        const valorFinalParcelado = valorTotalParcelado - rendimento;

        resultado = `
            <p>Valor pagando à vista: R$ ${valorVista.toFixed(2)}</p>
            <p>Valor total parcelado: R$ ${valorTotalParcelado.toFixed(2)}</p>
            <p>Rendimentos acumulados: R$ ${rendimento.toFixed(2)}</p>
            <p>Valor pago parcelando (descontados os rendimentos): R$ ${valorFinalParcelado.toFixed(2)}</p>
        `;

        if (valorVista < valorFinalParcelado) {
            resultado += `<p>Compensa pagar à vista.</p>`;
        } else {
            resultado += `<p>Compensa parcelar.</p>`;
        }
    }

    resultadoDiv.innerHTML = resultado;
    descerTela();
});