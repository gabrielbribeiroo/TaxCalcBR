// Mostrar ou ocultar campos adicionais
document.getElementById("descontoVista").addEventListener("input", (e) => {
  const campoDesconto = document.getElementById("campoDesconto");
  campoDesconto.style.display = e.target.value.toUpperCase() === "S" ? "block" : "none";
});

document.getElementById("jurosParcelado").addEventListener("input", (e) => {
  const campoJuros = document.getElementById("campoJuros");
  campoJuros.style.display = e.target.value.toUpperCase() === "S" ? "block" : "none";
});

// Função de cálculo
document.getElementById("calcular").addEventListener("click", () => {
  // Captura os valores
  const taxaAnual = parseFloat(document.getElementById("taxaAnual").value.replace(",", ".")) / 100;
  const valorInicial = parseFloat(document.getElementById("valorInicial").value.replace(",", "."));
  const descontoVista = document.getElementById("descontoVista").value.toUpperCase();
  const percentualDesconto = parseFloat(document.getElementById("percentualDesconto").value || 0);
  const jurosParcelado = document.getElementById("jurosParcelado").value.toUpperCase();
  const percentualJuros = parseFloat(document.getElementById("percentualJuros").value || 0);
  const parcelas = parseInt(document.getElementById("parcelas").value);

  // Validação de entradas
  if (isNaN(taxaAnual) || isNaN(valorInicial) || isNaN(parcelas)) {
      alert("Por favor, insira valores numéricos válidos.");
      return;
  }

  // Cálculo da taxa mensal
  const taxaMensal = (1 + taxaAnual) ** (1 / 12) - 1;

  // Cálculo do valor à vista
  let valorVista = valorInicial;
  if (descontoVista === "S") {
      valorVista -= valorInicial * (percentualDesconto / 100);
  }

  // Cálculo do valor parcelado
  let valorParcelado = valorInicial;
  if (jurosParcelado === "S") {
      valorParcelado += valorInicial * (percentualJuros / 100);
  }

  const valorParcela = valorParcelado / parcelas;

  // Simulação dos rendimentos
  let ganho = 0;
  let total = valorParcelado;
  for (let i = 0; i < parcelas; i++) {
      const rendimento = total * taxaMensal;
      ganho += rendimento;
      total -= valorParcela;
  }

  const valorFinalParcelado = valorParcelado - ganho;

  // Decisão
  const decisao = valorVista < valorFinalParcelado
      ? "Compensa pagar à vista."
      : "Compensa parcelar.";

  // Exibição dos resultados
  document.getElementById("resultados").style.display = "block";
  document.getElementById("resultadoVista").innerText = `Valor pagando à vista: R$${valorVista.toFixed(2)}`;
  document.getElementById("rendimentoAcumulado").innerText = `Rendimentos acumulados com o parcelamento: R$${ganho.toFixed(2)}`;
  document.getElementById("resultadoParcelado").innerText = `Valor pago parcelando (descontados os rendimentos): R$${valorFinalParcelado.toFixed(2)}`;
  document.getElementById("decisao").innerText = decisao;
});