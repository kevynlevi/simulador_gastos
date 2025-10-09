// Elementos da calculadora
const cidadeSelect = document.getElementById('cidade');
const faculdadeSelect = document.getElementById('faculdade');
const bairroSelect = document.getElementById('bairro');
const aluguelInput = document.getElementById('aluguel');
const transporteInput = document.getElementById('transporte');
const alimentacaoInput = document.getElementById('alimentacao');
const materiaisInput = document.getElementById('materiais');
const usaRuCheckbox = document.getElementById('usaRu');
const ruOptionsDiv = document.getElementById('ru-options');
const ruLabel = document.getElementById('ru-label');

const totalValue = document.getElementById('totalValue');
const statusText = document.getElementById('statusText');
const alertMessage = document.getElementById('alertMessage');

// Custos fixos do Requisito
const CUSTOS = {
    TRANSPORTE_ITABUNA: 150, // R$150/mês
    TRANSPORTE_ILHEUS_OUTROS: 176, // R$160-176/mês -> usando o máximo
    ALIMENTACAO_PADRAO: 300, // Padrão R$300/mês
    ALIMENTACAO_UNEX: 350, // UNEX R$350/mês
    CUSTO_RU: 44, // R.U. R$44/mês
    TRANSPORTE_SALOBRINHO: 0, // Salobrinho R$0
};

// Dados de Bairros por Cidade (RF01, RF03)
const BAIRROS_POR_CIDADE = {
    Itabuna: ['Centro', 'Santo Antônio', 'São Caetano', 'Nova Itabuna', 'Ferradas'],
    Ilhéus: ['Salobrinho', 'Centro', 'Pontal', 'Barra', 'Teotônio Vilela', 'Nelson Costa'],
};

// Função de formatação para exibição (outputs)
function formatBRL(n) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n || 0);
}

// Função para obter o número puro (para cálculo) de um input formatado (texto)
const parseCurrency = (input) => {
    if (!input || input.disabled) return 0;

    // Remove R$, pontos (milhares) e substitui vírgula por ponto (decimal) para conversão
    const value = input.value.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
    return parseFloat(value) || 0;
};


// Função para formatar inputs de valor (Aluguel, Materiais) em tempo real
function formatCurrencyInput(event) {
    let input = event.target;
    let value = input.value.replace(/\D/g, ''); // 1. Remove todos os não-dígitos

    if (!value) {
        input.value = '';
        calcular();
        return;
    }

    // 2. Converte para float (centavos)
    let floatValue = parseFloat(value) / 100;

    // 3. Formata para o padrão BRL (R$ X.XXX,XX)
    const formattedValue = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(floatValue);

    // 4. CORREÇÃO: Mantém o símbolo "R$" para o campo de input
    input.value = formattedValue.trim();

    calcular();
}

// Lógica de habilitação dos campos de Cidade, Aluguel e Materiais
function handleFaculdadeChange() {
    const faculdade = faculdadeSelect.value;

    // Garante que Cidade, Bairro, Aluguel e Materiais comecem desabilitados
    cidadeSelect.disabled = true;
    bairroSelect.disabled = true;
    aluguelInput.disabled = true;
    materiaisInput.disabled = true;

    if (faculdade) {
        // Habilita Cidade, Aluguel e Materiais
        cidadeSelect.disabled = false;
        aluguelInput.disabled = false;
        materiaisInput.disabled = false;

        if (faculdade === 'UNEX') {
            // Regra UNEX: Força Itabuna e desabilita a mudança de cidade
            cidadeSelect.value = 'Itabuna';
            cidadeSelect.disabled = true;

            // Força o evento 'input' para popular os bairros e recalcular
            cidadeSelect.dispatchEvent(new Event('input'));

        } else if (cidadeSelect.value === 'Itabuna' && faculdade !== 'UNEX') {
            // Limpa o campo se a cidade foi forçada antes (UNEX)
            cidadeSelect.value = '';
            cidadeSelect.disabled = false;
        }

    } else {
        // Nenhuma faculdade selecionada, limpa a cidade e recalcula
        cidadeSelect.value = '';
    }

    calcular();
}

// 1. Lógica de População de Bairros (RF01, RF03)
function popularBairros() {
    const cidade = cidadeSelect.value;
    bairroSelect.innerHTML = '<option value="">Selecione o bairro</option>';
    bairroSelect.disabled = true;

    if (cidade) {
        const bairros = BAIRROS_POR_CIDADE[cidade];
        bairros.forEach(b => {
            const option = document.createElement('option');
            option.value = b;
            option.textContent = b;
            bairroSelect.appendChild(option);
        });
        bairroSelect.disabled = false;
    }
}

// 2. Lógica de Cálculo de Transporte (RF04)
function calcularTransporte() {
    const cidade = cidadeSelect.value;
    const bairro = bairroSelect.value;
    let custoTransporte = 0;

    if (cidade === 'Itabuna') {
        custoTransporte = CUSTOS.TRANSPORTE_ITABUNA;
    } else if (cidade === 'Ilhéus') {
        if (bairro === 'Salobrinho') {
            custoTransporte = CUSTOS.TRANSPORTE_SALOBRINHO;
        } else {
            custoTransporte = CUSTOS.TRANSPORTE_ILHEUS_OUTROS;
        }
    }

    transporteInput.value = formatBRL(custoTransporte);
    return custoTransporte;
}

// 3. Lógica de Cálculo de Alimentação (RF05)
function calcularAlimentacao() {
    const faculdade = faculdadeSelect.value;
    const bairro = bairroSelect.value;
    const usaRu = usaRuCheckbox.checked;

    // Alimentação começa em 0 e só é calculada se a faculdade for selecionada
    let custoAlimentacao = 0;

    // Exibir/Esconder e configurar opções de R.U.
    ruOptionsDiv.style.display = 'none';

    if (faculdade) {
        // Define o padrão antes das regras do R.U.
        custoAlimentacao = CUSTOS.ALIMENTACAO_PADRAO;

        if (faculdade === 'UNEX') {
            custoAlimentacao = CUSTOS.ALIMENTACAO_UNEX;
        } else if (faculdade === 'UESC') {
            ruOptionsDiv.style.display = 'block';
            ruLabel.textContent = 'Sim, desejo usar o Restaurante Universitário (R.U.) - Custo de R$44/mês.';

            if (usaRu) {
                custoAlimentacao = CUSTOS.CUSTO_RU;
            } else {
                custoAlimentacao = CUSTOS.ALIMENTACAO_PADRAO;
            }
        }

        // Regra de exceção: Salobrinho (sobrescreve UESC/UFSB se R.U. for usado)
        if (bairro === 'Salobrinho' && faculdade !== 'UNEX') {
            ruOptionsDiv.style.display = 'block';
            ruLabel.textContent = 'Sim, desejo usar o R.U. de Salobrinho (opcional) - Custo de R$44/mês.';

            if (usaRu) {
                custoAlimentacao = CUSTOS.CUSTO_RU;
            } else {
                custoAlimentacao = CUSTOS.ALIMENTACAO_PADRAO;
            }
        }
    }

    alimentacaoInput.value = formatBRL(custoAlimentacao);
    return custoAlimentacao;
}


// 4. Cálculo Total (RF06) e Alertas (RF07)
function calcular() {
    // Lê e converte os valores de inputs formatados
    const aluguel = parseCurrency(aluguelInput);
    const materiais = parseCurrency(materiaisInput);

    const custoTransporte = calcularTransporte(); // RF04
    const custoAlimentacao = calcularAlimentacao(); // RF05

    // RF06 - Soma
    const total = aluguel + custoTransporte + custoAlimentacao + materiais;
    totalValue.textContent = formatBRL(total);

    // RF07 - Mensagens de Alerta e Recomendações
    let status = 'Aguardando dados...';
    let cor = 'var(--muted)';
    let dica = 'Selecione a faculdade para começar a estimar seus gastos.';

    if (faculdadeSelect.value) {
        if (total <= 1200) {
            status = 'Seus gastos estão baixos';
            cor = '#2b7a3a';
            dica = 'Excelente planejamento! Considere separar uma reserva de emergência.';
        } else if (total <= 2200) {
            status = 'Seus gastos estão moderados';
            cor = '#a67b00';
            dica = 'Se precisar economizar, reveja o valor do seu aluguel ou use o R.U.';
        } else {
            status = 'Seus gastos estão altos';
            cor = '#a02b2b';
            if (cidadeSelect.value === 'ilheus' && bairroSelect.value !== 'Salobrinho') {
                dica = 'ALERTA! Procure alternativas mais baratas de moradia. Morar em Salobrinho pode economizar R$176/mês no transporte.';

            } else {
                dica = 'ALERTA! Procure alternativas mais baratas de moradia e use o R.U. para economizar.';
            }
        }
    }

    statusText.textContent = status;
    statusText.style.color = cor;
    alertMessage.textContent = dica;
}

// Event Listeners:
// 1. Faculdade muda -> Lógica de Habilitação
faculdadeSelect.addEventListener('input', handleFaculdadeChange);

// 2. Cidade muda -> Popula Bairros e Recalcula
cidadeSelect.addEventListener('input', popularBairros);
cidadeSelect.addEventListener('input', calcular);

// 3. Bairro, R.U. mudam -> Recalcula custos
[bairroSelect, usaRuCheckbox].forEach(el => el.addEventListener('input', calcular));

// Aplica a formatação de moeda em tempo real e dispara o cálculo
[aluguelInput, materiaisInput].forEach(el => {
    // Adiciona evento para disparar o formatador ao digitar
    el.addEventListener('input', formatCurrencyInput);
});

// Inicialização:
handleFaculdadeChange();