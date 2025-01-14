document.getElementById("opcao").addEventListener("change", updateInputs);
document.getElementById("calcular").addEventListener("click", calcularResultado);

function updateInputs() {
    const opcao = document.getElementById("opcao").value;
    const inputContainer = document.getElementById("input-container");
    inputContainer.innerHTML = "";

    if (opcao === "1") {
        inputContainer.innerHTML = `
            <div class="form-group">
                <label for="valor-total">Valor total da compra (R$):</label>
                <input type="number" id="valor-total" placeholder="Ex: 1000.00" required>
            </div>
            <div class="form-group">
                <label for="qtd-parcelas">Número de parcelas:</label>
                <input type="number" id="qtd-parcelas" placeholder="Ex: 12" required>
            </div>
            <div class="form-group">
                <label for="taxa-rendimento">Taxa de rendimento mensal (%):</label>
                <input type="number" id="taxa-rendimento" placeholder="Ex: 0.5" required>
            </div>
        `;
    } else if (opcao === "2") {
        inputContainer.innerHTML = `
            <div class="form-group">
                <label for="valor-vista">Valor da compra à vista (R$):</label>
                <input type="number" id="valor-vista" placeholder="Ex: 1000.00" required>
            </div>
            <div class="form-group">
                <label for="qtd-parcelas">Número de parcelas:</label>
                <input type="number" id="qtd-parcelas" placeholder="Ex: 12" required>
            </div>
            <div class="form-group">
                <label for="valor-parcela">Valor de cada parcela (R$):</label>
                <input type="number" id="valor-parcela" placeholder="Ex: 100.00" required>
            </div>
            <div class="form-group">
                <label for="taxa-rendimento">Taxa de rendimento mensal (%):</label>
                <input type="number" id="taxa-rendimento" placeholder="Ex: 0.5" required>
            </div>
        `;
    }
}

function calcularResultado() {
    const opcao = document.getElementById("opcao").value;
    const taxaMensal = parseFloat(document.getElementById("taxa-rendimento").value) / 100;

    if (opcao === "1") {
        const valorTotal = parseFloat(document.getElementById("valor-total").value);
        const qtdParcelas = parseInt(document.getElementById("qtd-parcelas").value);

        const rendimento = valorTotal * taxaMensal;
        const valorParcelado = valorTotal - rendimento;

        document.getElementById("resultado").innerHTML = `
            <p>Valor Total: R$ ${valorTotal.toFixed(2)}</p>
            <p>Rendimento: R$ ${rendimento.toFixed(2)}</p>
            <p>Valor final: R$ ${valorParcelado.toFixed(2)}</p>
        `;
    } else if (opcao === "2") {
        const valorVista = parseFloat(document.getElementById("valor-vista").value);
        const qtdParcelas = parseInt(document.getElementById("qtd-parcelas").value);
        const valorParcela = parseFloat(document.getElementById("valor-parcela").value);
        const valorParcelado = qtdParcelas * valorParcela;

        const rendimento = valorParcelado * taxaMensal;
        const valorEfetivoParcelado = valorParcelado - rendimento;

        const mensagem = valorVista < valorEfetivoParcelado
            ? "Compensa pagar à vista."
            : "Compensa parcelar.";

        document.getElementById("resultado").innerHTML = `
            <p>Valor à Vista: R$ ${valorVista.toFixed(2)}</p>
            <p>Valor Total Parcelado: R$ ${valorParcelado.toFixed(2)}</p>
            <p>Rendimento: R$ ${rendimento.toFixed(2)}</p>
            <p>${mensagem}</p>
        `;
    }
}