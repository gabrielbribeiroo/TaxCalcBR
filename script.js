document.addEventListener('DOMContentLoaded', () => {
    const formSimulador = document.getElementById('form-simulador');
    const opcaoSelect = document.getElementById('opcao');
    const inputContainer = document.getElementById('input-container');
    const resultadoDiv = document.getElementById('resultado');
    const calcularButton = document.getElementById('calcular');

    // Função para criar um campo de entrada dinâmico
    function criarInput(labelText, id, type = 'text') {
        const formGroup = document.createElement('div');
        formGroup.classList.add('form-group');

        const label = document.createElement('label');
        label.setAttribute('for', id);
        label.textContent = labelText;

        const input = document.createElement('input');
        input.setAttribute('type', type);
        input.setAttribute('id', id);
        input.required = true;

        formGroup.appendChild(label);
        formGroup.appendChild(input);

        return formGroup;
    }

    // Atualiza os campos de entrada com base na opção selecionada
    opcaoSelect.addEventListener('change', () => {
        inputContainer.innerHTML = ''; // Limpa os campos anteriores
        resultadoDiv.innerHTML = ''; // Limpa os resultados anteriores

        if (opcaoSelect.value === '1') {
            // Opção: Rendimento x Parcelas
            inputContainer.appendChild(criarInput('Digite o valor total da compra (R$):', 'valor-total'));
            inputContainer.appendChild(criarInput('Digite o número de parcelas:', 'qnt-parcelas', 'number'));
            inputContainer.appendChild(criarInput('Digite a taxa de rendimento mensal (%):', 'taxa-rendimento', 'number'));
            inputContainer.appendChild(criarInput('Digite a porcentagem de desconto à vista (se houver):', 'desconto-vista', 'number'));
        } else if (opcaoSelect.value === '2') {
            // Opção: À vista x Parcelas
            inputContainer.appendChild(criarInput('Digite o valor da compra à vista (R$):', 'valor-vista'));
            inputContainer.appendChild(criarInput('Digite o número de parcelas:', 'qnt-parcelas', 'number'));
            inputContainer.appendChild(criarInput('Digite o valor de cada parcela (R$):', 'valor-parcela', 'number'));
            inputContainer.appendChild(criarInput('Digite a taxa de rendimento mensal (%):', 'taxa-rendimento', 'number'));
        }
    });

    // Calcula os resultados com base nas entradas fornecidas
    calcularButton.addEventListener('click', () => {
        resultadoDiv.innerHTML = ''; // Limpa os resultados anteriores

        const opcao = opcaoSelect.value;

        if (opcao === '1') {
            // Rendimento x Parcelas
            const valorTotal = parseFloat(document.getElementById('valor-total').value);
            const qntParcelas = parseInt(document.getElementById('qnt-parcelas').value);
            const taxaRendimento = parseFloat(document.getElementById('taxa-rendimento').value) / 100;
            const descontoVista = parseFloat(document.getElementById('desconto-vista').value) || 0;

            const valorVista = valorTotal * (1 - descontoVista / 100);
            const valorParcela = valorTotal / qntParcelas;
            let rendimentos = 0;

            let divida = valorTotal;
            for (let i = 1; i <= qntParcelas; i++) {
                const rendimento = divida * taxaRendimento;
                rendimentos += rendimento;
                divida -= valorParcela;
            }

            const valorParceladoEfetivo = valorTotal - rendimentos;

            resultadoDiv.innerHTML = `
                <p>Valor pagando à vista: R$ ${valorVista.toFixed(2)}</p>
                <p>Valor total parcelado: R$ ${valorTotal.toFixed(2)}</p>
                <p>Rendimentos acumulados: R$ ${rendimentos.toFixed(2)}</p>
                <p>Valor efetivo parcelado (descontados rendimentos): R$ ${valorParceladoEfetivo.toFixed(2)}</p>
                <p><strong>${valorVista < valorParceladoEfetivo ? 'Compensa pagar à vista.' : 'Compensa parcelar.'}</strong></p>
            `;
        } else if (opcao === '2') {
            // À vista x Parcelas
            const valorVista = parseFloat(document.getElementById('valor-vista').value);
            const qntParcelas = parseInt(document.getElementById('qnt-parcelas').value);
            const valorParcela = parseFloat(document.getElementById('valor-parcela').value);
            const taxaRendimento = parseFloat(document.getElementById('taxa-rendimento').value) / 100;

            const valorParcelado = qntParcelas * valorParcela;
            let rendimentos = 0;

            let divida = valorParcelado;
            for (let i = 1; i <= qntParcelas; i++) {
                const rendimento = divida * taxaRendimento;
                rendimentos += rendimento;
                divida -= valorParcela;
            }

            const valorParceladoEfetivo = valorParcelado - rendimentos;

            resultadoDiv.innerHTML = `
                <p>Valor pagando à vista: R$ ${valorVista.toFixed(2)}</p>
                <p>Valor total parcelado: R$ ${valorParcelado.toFixed(2)}</p>
                <p>Rendimentos acumulados: R$ ${rendimentos.toFixed(2)}</p>
                <p>Valor efetivo parcelado (descontados rendimentos): R$ ${valorParceladoEfetivo.toFixed(2)}</p>
                <p><strong>${valorVista < valorParceladoEfetivo ? 'Compensa pagar à vista.' : 'Compensa parcelar.'}</strong></p>
            `;
        } else {
            resultadoDiv.innerHTML = '<p>Por favor, selecione uma opção válida.</p>';
        }
    });
});
