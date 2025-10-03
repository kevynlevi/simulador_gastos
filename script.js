// --- Elementos do DOM ---
const cidade = document.getElementById('cidade');
const bairro = document.getElementById('bairro');
const faculdade = document.getElementById('faculdade');
const outro = document.getElementById('outro');
const transporte = document.getElementById('transporte');
const transporteBox = document.getElementById('transporteBox');
const alimentacao = document.getElementById('alimentacao');
const totalValue = document.getElementById('totalValue');
const statusText = document.getElementById('statusText');
const valorMensalidade = document.getElementById('valorMensalidade');
const mensalidadeBox = document.getElementById('mensalidadeBox');
const formaMensal = document.getElementById('mensal');
const formaAvista = document.getElementById('avista');
const qtdIdas = document.getElementById('qtdIdas');
const qtdIdasBox = document.getElementById('quantidadeIdasBox');

// --- Variáveis de controle ---
let mesmaCidade = null;
let precisaTransporte = false;

// --- Funções auxiliares ---
function formatBRL(n) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(n || 0);
}

function showPopupPergunta(callback) {
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    overlay.innerHTML = `
    <div class="popup">
      <p>Você pertence à mesma cidade da faculdade?</p>
      <button id="btnSim">Sim</button>
      <button id="btnNao">Não</button>
    </div>
  `;
    document.body.appendChild(overlay);

    document.getElementById('btnSim').onclick = () => {
        document.body.removeChild(overlay);
        callback(true);
    };

    document.getElementById('btnNao').onclick = () => {
        document.body.removeChild(overlay);
        callback(false);
    };
}

function showPopupDistancia(callback) {
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    overlay.innerHTML = `
    <div class="popup">
      <p>Sua faculdade é distante o suficiente para precisar de transporte?</p>
      <button id="btnSimDistancia">Sim</button>
      <button id="btnNaoDistancia">Não</button>
    </div>
  `;
    document.body.appendChild(overlay);

    document.getElementById('btnSimDistancia').onclick = () => {
        document.body.removeChild(overlay);
        callback(true);
    };

    document.getElementById('btnNaoDistancia').onclick = () => {
        document.body.removeChild(overlay);
        callback(false);
    };
}

function resetarCampos() {
    bairro.value = '';
    outro.value = '';
    transporte.value = '';
    alimentacao.value = '';
    valorMensalidade.value = '';
    qtdIdas.value = '';

    bairro.style.display = 'none';
    outro.style.display = 'none';
    transporteBox.style.display = 'none';
    alimentacao.parentElement.style.display = 'none';
    mensalidadeBox.style.display = 'none';
    qtdIdasBox.style.display = 'none';
}

function mostrarMensalidade() {
    mensalidadeBox.style.display = 'block';
}

function mostrarAlimentacaoEMensalidade() {
    alimentacao.parentElement.style.display = 'block';
    mostrarMensalidade();
}

function calcular() {
    let aluguel = 0;

    switch (bairro.value) {
        case 'centro': aluguel = 600; break;
        case 'santoAntonio': aluguel = 450; break;
        case 'california': aluguel = 400; break;
        case 'outro':
            aluguel = Number(outro.value) || 0;
            break;
    }

    let transporteTotal = 0;
    const valorTransporte = Number(transporte.value) || 0;
    const idas = Number(qtdIdas.value) || 0;

    if (!mesmaCidade) {
        transporteTotal = valorTransporte;
    } else if (precisaTransporte) {
        transporteTotal = valorTransporte * 2 * idas;
    }

    const aliment = Number(alimentacao.value) || 0;

    let mensalidade = 0;
    const valor = Number(valorMensalidade.value) || 0;

    if (formaMensal.checked) {
        mensalidade = valor * 6;
    } else if (formaAvista.checked) {
        mensalidade = valor;
    }

    const total = aluguel + transporteTotal + aliment + mensalidade;

    totalValue.textContent = formatBRL(total);

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

// --- Eventos ---
cidade.addEventListener('change', () => {
    if (!cidade.value) return;

    resetarCampos();

    showPopupPergunta((resposta) => {
        mesmaCidade = resposta;

        if (!mesmaCidade) {
            transporteBox.style.display = 'block';

            transporte.addEventListener('input', () => {
                if (transporte.value) {
                    mostrarAlimentacaoEMensalidade();
                }
                calcular();
            });

        } else {
            bairro.style.display = 'block';
        }
    });
});

bairro.addEventListener('change', () => {
    const bairrosComValor = ['centro', 'santoAntonio', 'california'];

    if (bairrosComValor.includes(bairro.value)) {
        outro.style.display = 'none';

        showPopupDistancia((resposta) => {
            precisaTransporte = resposta;

            if (precisaTransporte) {
                transporteBox.style.display = 'block';
                qtdIdasBox.style.display = 'block';

                transporte.addEventListener('input', calcular);
                qtdIdas.addEventListener('input', calcular);
            }

            mostrarAlimentacaoEMensalidade();
            calcular();
        });

    } else if (bairro.value === 'outro') {
        outro.style.display = 'flex';
        transporteBox.style.display = 'block';
        mostrarAlimentacaoEMensalidade();
    }

    calcular();
});

// Eventos de input para recalcular sempre
[
    outro,
    transporte,
    alimentacao,
    valorMensalidade,
    qtdIdas
].forEach(el => el.addEventListener('input', calcular));

[formaMensal, formaAvista].forEach(el =>
    el.addEventListener('change', calcular)
);

// Executa ao carregar a página
calcular();
// Foco no primeiro campo