function calcular() {
    const bairro = document.getElementById("bairro").value;
    const alimentacao = parseFloat(document.getElementById("alimentacao").value) || 0;
    const transporte = parseFloat(document.getElementById("transporte").value) || 0;
    const material = parseFloat(document.getElementById("material").value) || 0;

    let aluguel = 0;
    if (bairro === "centro") aluguel = 600;
    if (bairro === "santoAntonio") aluguel = 450;
    if (bairro === "california") aluguel = 400;

    const total = aluguel + alimentacao + transporte + material;

    document.getElementById("resultado").innerText = `Total estimado: R$ ${total}`;

    let mensagem = "";
    if (total > 1500) {
        mensagem = "⚠ Seus gastos estão altos! Considere dividir moradia ou economizar na alimentação.";
    } else if (total > 1000) {
        mensagem = "💡 Seus gastos estão moderados, mas sempre é bom buscar economizar.";
    } else {
        mensagem = "✅ Seus gastos estão controlados! Ótimo planejamento.";
    }

    document.getElementById("mensagem").innerText = mensagem;
}