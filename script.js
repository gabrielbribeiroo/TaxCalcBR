document.addEventListener("DOMContentLoaded", () => {
    const comparisonType = document.getElementById("comparisonType");
    const formContainer = document.getElementById("formContainer");
    const resultContainer = document.getElementById("resultContainer");
    const submitButton = document.getElementById("submitButton");

    comparisonType.addEventListener("change", () => {
        const selectedOption = comparisonType.value;
        renderForm(selectedOption);
    });

    submitButton.addEventListener("click", () => {
        const selectedOption = comparisonType.value;
        const formData = getFormData();
        let result;

        if (selectedOption === "1") {
            result = calculateInvestmentComparison(formData);
        } else if (selectedOption === "2") {
            result = calculateCashVsInstallment(formData);
        }

        displayResult(result);
    });

    function renderForm(option) {
        if (option === "1") {
            formContainer.innerHTML = `
                <label for="rateType">Escolha a taxa de rendimento:</label>
                <select id="rateType">
                    <option value="monthly">Mensal</option>
                    <option value="annual">Anual</option>
                </select>
                <label for="interestRate">Taxa de rendimento (%):</label>
                <input type="number" id="interestRate" placeholder="Ex: 5.5" />
                <label for="totalAmount">Valor total da compra:</label>
                <input type="number" id="totalAmount" placeholder="Ex: 1000.00" />
                <label for="installments">Número de parcelas:</label>
                <input type="number" id="installments" placeholder="Ex: 12" />
                <label for="discount">Desconto para pagamento à vista (%):</label>
                <input type="number" id="discount" placeholder="Ex: 10" />
                <label for="interestOnInstallment">Juros no parcelamento (%):</label>
                <input type="number" id="interestOnInstallment" placeholder="Ex: 2" />
            `;
        } else if (option === "2") {
            formContainer.innerHTML = `
                <label for="cashValue">Valor à vista:</label>
                <input type="number" id="cashValue" placeholder="Ex: 1000.00" />
                <label for="installmentCount">Número de parcelas:</label>
                <input type="number" id="installmentCount" placeholder="Ex: 12" />
                <label for="installmentValue">Valor de cada parcela:</label>
                <input type="number" id="installmentValue" placeholder="Ex: 100.00" />
                <label for="investmentRate">Taxa de rendimento (%):</label>
                <input type="number" id="investmentRate" placeholder="Ex: 5" />
            `;
        }
    }

    function getFormData() {
        const formData = {};
        document.querySelectorAll("#formContainer input, #formContainer select").forEach(input => {
            formData[input.id] = parseFloat(input.value) || 0;
        });
        return formData;
    }

    function calculateInvestmentComparison(data) {
        const { rateType, interestRate, totalAmount, installments, discount, interestOnInstallment } = data;

        // Converte taxa de rendimento anual para mensal, se necessário
        const monthlyRate = rateType === "annual"
            ? Math.pow(1 + interestRate / 100, 1 / 12) - 1
            : interestRate / 100;

        // Aplica imposto de renda baseado no número de parcelas
        let adjustedRate = monthlyRate;
        if (installments <= 6) adjustedRate *= 0.775;
        else if (installments <= 12) adjustedRate *= 0.80;
        else if (installments <= 24) adjustedRate *= 0.825;
        else adjustedRate *= 0.85;

        // Calcula desconto à vista
        const cashPrice = totalAmount * (1 - discount / 100);

        // Calcula acréscimo no parcelamento
        const installmentPrice = totalAmount * (1 + interestOnInstallment / 100);

        // Simula rendimentos
        let gain = 0;
        let remainingDebt = installmentPrice;
        for (let i = 0; i < installments; i++) {
            const interestGain = remainingDebt * adjustedRate;
            gain += interestGain;
            remainingDebt -= installmentPrice / installments;
        }

        const finalInstallmentCost = installmentPrice - gain;

        // Resultados detalhados
        return `
            <p>Valor pagando à vista: R$${cashPrice.toFixed(2)}</p>
            <p>Rendimentos acumulados com o parcelamento: R$${gain.toFixed(2)}</p>
            <p>Valor pago parcelando (descontados os rendimentos): R$${finalInstallmentCost.toFixed(2)}</p>
            <p>${cashPrice < finalInstallmentCost
                ? "Compensa pagar à vista."
                : "Compensa parcelar."}</p>
        `;
    }

    function calculateCashVsInstallment(data) {
        const { cashValue, installmentCount, installmentValue, investmentRate } = data;

        const totalInstallment = installmentCount * installmentValue;
        const monthlyRate = investmentRate / 100;

        // Aplica imposto de renda baseado no número de parcelas
        let adjustedRate = monthlyRate;
        if (installmentCount <= 6) adjustedRate *= 0.775;
        else if (installmentCount <= 12) adjustedRate *= 0.80;
        else if (installmentCount <= 24) adjustedRate *= 0.825;
        else adjustedRate *= 0.85;

        // Simula rendimentos
        let gain = 0;
        let remainingDebt = totalInstallment;
        for (let i = 0; i < installmentCount; i++) {
            const interestGain = remainingDebt * adjustedRate;
            gain += interestGain;
            remainingDebt -= installmentValue;
        }

        const finalCost = totalInstallment - gain;

        // Resultados detalhados
        return `
            <p>Valor pagando à vista: R$${cashValue.toFixed(2)}</p>
            <p>Valor pagando parcelado: R$${totalInstallment.toFixed(2)}</p>
            <p>Taxa de juros compostos por parcelar: ${(adjustedRate * 100).toFixed(2)}%</p>
            <p>Rendimentos acumulados com o parcelamento: R$${gain.toFixed(2)}</p>
            <p>Valor pago parcelando (descontados os rendimentos): R$${finalCost.toFixed(2)}</p>
            <p>${cashValue < finalCost
                ? "Compensa pagar à vista."
                : "Compensa parcelar."}</p>
        `;
    }

    function displayResult(result) {
        resultContainer.style.display = "block";
        resultContainer.innerHTML = result;
    }
});