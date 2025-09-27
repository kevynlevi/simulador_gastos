// Lógica simples da calculadora
const transporte = document.getElementById('transporte');
const alimentacao = document.getElementById('alimentacao');
const materiais = document.getElementById('materiais');
const totalValue = document.getElementById('totalValue');
const statusText = document.getElementById('statusText');

function formatBRL(n) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n || 0);
}

function calcular() {
    const t = Number(transporte.value) || 0;
    const a = Number(alimentacao.value) || 0;
    const m = Number(materiais.value) || 0;
    const total = t + a + m;
    totalValue.textContent = formatBRL(total);

    // Regra heurística para classificação:
    // - Abaixo de R$ 800 => baixo
    // - R$ 800 a R$ 1800 => médio
    // - Acima de R$ 1800 => alto
    if (total <= 800) {
        statusText.textContent = 'Seus gastos estão baixos';
        statusText.style.color = '#2b7a3a';
    } else if (total <= 1800) {
        statusText.textContent = 'Seus gastos estão moderados';
        statusText.style.color = '#a67b00';
    } else {
        statusText.textContent = 'Seus gastos estão altos';
        statusText.style.color = '#a02b2b';
    }
}

// recalcula quando qualquer campo muda
[transporte, alimentacao, materiais].forEach(el => el.addEventListener('input', calcular));

// calcula ao carregar (mostra 0)
calcular();