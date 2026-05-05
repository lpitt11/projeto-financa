/* ===========================
   FINTRACK — app.js
   Lógica principal do app
=========================== */

// ===========================
// DADOS INICIAIS
// ===========================

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
const INC_DATA = [6200, 7100, 6800, 7500, 8200, 8500];
const EXP_DATA = [4100, 4800, 4300, 5200, 4600, 4270];

const ICONS = {
  'Salário':     { e: '💼', bg: 'rgba(34,197,94,0.10)'  },
  'Freelance':   { e: '💻', bg: 'rgba(43,111,255,0.10)' },
  'Moradia':     { e: '🏠', bg: 'rgba(168,85,247,0.10)' },
  'Alimentação': { e: '🍽️', bg: 'rgba(251,146,60,0.10)' },
  'Transporte':  { e: '🚗', bg: 'rgba(43,111,255,0.10)' },
  'Saúde':       { e: '💊', bg: 'rgba(244,63,94,0.10)'  },
  'Lazer':       { e: '🎮', bg: 'rgba(168,85,247,0.10)' },
  'Educação':    { e: '📚', bg: 'rgba(34,197,94,0.10)'  },
  'Outros':      { e: '📌', bg: 'rgba(85,85,85,0.15)'   },
};

const PLAN_COLORS = ['var(--blue)', '#22c55e', '#f59e0b', '#a855f7', '#f43f5e', '#14b8a6'];

// ===========================
// ESTADO DA APLICAÇÃO
// ===========================

let transactions = [
  { id: 1, type: 'income',  desc: 'Salário Maio',      val: 8500, cat: 'Salário',     recur: 'fixed', date: '01/05' },
  { id: 2, type: 'expense', desc: 'Aluguel',            val: 2200, cat: 'Moradia',     recur: 'fixed', date: '05/05' },
  { id: 3, type: 'expense', desc: 'Supermercado',       val: 480,  cat: 'Alimentação', recur: 'once',  date: '08/05' },
  { id: 4, type: 'expense', desc: 'Uber',               val: 95,   cat: 'Transporte',  recur: 'once',  date: '10/05' },
  { id: 5, type: 'expense', desc: 'Academia',           val: 120,  cat: 'Saúde',       recur: 'fixed', date: '12/05' },
  { id: 6, type: 'income',  desc: 'Freelance Design',   val: 1200, cat: 'Freelance',   recur: 'once',  date: '15/05' },
  { id: 7, type: 'expense', desc: 'Netflix + Spotify',  val: 75,   cat: 'Lazer',       recur: 'fixed', date: '18/05' },
  { id: 8, type: 'expense', desc: 'Farmácia',           val: 65,   cat: 'Saúde',       recur: 'once',  date: '20/05' },
];

let plans = [
  { id: 1, name: 'Reserva de Emergência', cat: 'Poupança',     goal: 10000, current: 4200, recur: 'monthly' },
  { id: 2, name: 'Viagem Europa 2025',    cat: 'Viagem',       goal: 15000, current: 6800, recur: 'once'    },
  { id: 3, name: 'Curso de Design',       cat: 'Educação',     goal: 2500,  current: 1800, recur: 'once'    },
  { id: 4, name: 'Investimento Mensal',   cat: 'Investimento', goal: 1500,  current: 1500, recur: 'monthly' },
];

let nextTxnId = 9;
let currentType = 'income';
let currentFilter = 'all';

// ===========================
// NAVEGAÇÃO
// ===========================

function go(screenId, navEl) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const screen = document.getElementById('s-' + screenId);
  if (screen) screen.classList.add('active');
  if (navEl) navEl.classList.add('active');

  if (screenId === 'txn')   renderTransactions();
  if (screenId === 'plans') renderPlans();
}

// ===========================
// BAR CHART
// ===========================

function buildBarChart() {
  const el = document.getElementById('barchart');
  if (!el) return;

  const max = Math.max(...INC_DATA, ...EXP_DATA);

  el.innerHTML = MONTHS.map((m, i) => {
    const ih = Math.round((INC_DATA[i] / max) * 78);
    const eh = Math.round((EXP_DATA[i] / max) * 78);
    return `
      <div class="bg-grp">
        <div class="bg-bars">
          <div class="b i" style="height:${ih}px" title="Receita: R$${INC_DATA[i].toLocaleString('pt-BR')}"></div>
          <div class="b e" style="height:${eh}px" title="Despesa: R$${EXP_DATA[i].toLocaleString('pt-BR')}"></div>
        </div>
        <div class="bg-lbl">${m}</div>
      </div>`;
  }).join('');
}

// ===========================
// TRANSAÇÕES
// ===========================

function buildTransactionHTML(t) {
  const ic   = ICONS[t.cat] || ICONS['Outros'];
  const sign = t.type === 'income' ? '+' : '-';
  const cls  = t.type === 'income' ? 'p' : 'n';
  const badge = t.recur === 'fixed' ? '<span class="fix-badge">Fixa</span>' : '';

  return `
    <div class="txn-row">
      <div class="txn-ico" style="background:${ic.bg}">${ic.e}</div>
      <div class="txn-info">
        <div class="txn-name">${t.desc}${badge}</div>
        <div class="txn-cat">${t.cat}</div>
      </div>
      <div class="txn-right" style="display: flex; align-items: center; gap: 12px; justify-content: flex-end;">
        <div style="text-align: right;">
          <div class="txn-amt ${cls}">${sign} R$ ${t.val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <div class="txn-dt">${t.date}</div>
        </div>
        <button class="btn-del" onclick="deleteTxn(${t.id})" title="Excluir transação">✖</button>
      </div>
    </div>`;
}

function renderTransactions() {
  const recentEl = document.getElementById('recent');
  const allEl    = document.getElementById('all-txn');

  const filtered = transactions.filter(t => {
    if (currentFilter === 'all')     return true;
    if (currentFilter === 'income')  return t.type === 'income';
    if (currentFilter === 'expense') return t.type === 'expense';
    if (currentFilter === 'fixed')   return t.recur === 'fixed';
    if (currentFilter === 'once')    return t.recur === 'once';
    return true;
  });

  if (recentEl) {
    recentEl.innerHTML = transactions.slice(-4).map(buildTransactionHTML).join('');
  }

  if (allEl) {
    if (filtered.length === 0) {
      allEl.innerHTML = `
        <div class="empty">
          <div class="empty-ico">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </div>
          <div class="empty-t">Nenhuma transação encontrada</div>
          <div class="empty-s">Tente outro filtro ou adicione uma nova transação</div>
        </div>`;
    } else {
      allEl.innerHTML = filtered.map(buildTransactionHTML).join('');
    }
  }
}

function deleteTxn(id) {
  if(confirm('Tem certeza que deseja excluir esta transação?')) {
    transactions = transactions.filter(t => t.id !== id);
    renderTransactions();
    showToast('Transação removida.', '#f43f5e');
  }
}

// ===========================
// PLANOS
// ===========================

function renderPlans() {
  const gridEl  = document.getElementById('pgrid');
  const progEl  = document.getElementById('gprog');
  if (!gridEl) return;

  gridEl.innerHTML = plans.map((p, i) => {
    const pct   = Math.min(100, Math.round((p.current / p.goal) * 100));
    const color = PLAN_COLORS[i % PLAN_COLORS.length];
    const badgeClass = p.recur === 'monthly' ? 'pb-m' : 'pb-o';
    const badgeText  = p.recur === 'monthly' ? 'Mensal' : 'Único';

    return `
      <div class="plan-card">
        <div class="plan-top">
          <div>
            <div class="plan-name">${p.name}</div>
            <div class="plan-cat">${p.cat}</div>
          </div>
          <span class="pbadge ${badgeClass}">${badgeText}</span>
        </div>
        <div class="pl-row">
          <span>Progresso</span>
          <span>R$ ${p.current.toLocaleString('pt-BR')} / R$ ${p.goal.toLocaleString('pt-BR')}</span>
        </div>
        <div class="pbar">
          <div class="pbar-f" style="width:${pct}%; background:${color}"></div>
        </div>
        <div class="pct-txt" style="color:${color}">${pct}% concluído</div>
      </div>`;
  }).join('');

  if (progEl) {
    progEl.innerHTML = plans.map((p, i) => {
      const pct   = Math.min(100, Math.round((p.current / p.goal) * 100));
      const color = PLAN_COLORS[i % PLAN_COLORS.length];
      return `
        <div>
          <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:4px">
            <span style="color:var(--text2)">${p.name}</span>
            <span style="color:${color}; font-weight:700">${pct}%</span>
          </div>
          <div style="height:3px; background:var(--bg5); border-radius:99px; overflow:hidden">
            <div style="width:${pct}%; height:100%; background:${color}; border-radius:99px"></div>
          </div>
        </div>`;
    }).join('');
  }
}

// ===========================
// MODAL: TRANSAÇÃO
// ===========================

function openTxnModal() {
  document.getElementById('txn-modal').classList.add('open');
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('t-date').value = today;
  setT('income'); 
}

function closeTxnModal() {
  document.getElementById('txn-modal').classList.remove('open');
}

function setT(type) {
  currentType = type;
  document.getElementById('tb-inc').classList.toggle('active', type === 'income');
  document.getElementById('tb-exp').classList.toggle('active', type === 'expense');
  
  const rowParcelas = document.getElementById('row-parcelas');
  if(rowParcelas) {
    rowParcelas.style.display = type === 'expense' ? 'grid' : 'none';
  }
}

function addTxn() {
  const desc  = document.getElementById('t-desc').value.trim();
  const val   = parseFloat(document.getElementById('t-val').value);
  const cat   = document.getElementById('t-cat').value;
  const recur = document.getElementById('t-recur').value;
  const raw   = document.getElementById('t-date').value;
  const parcelasInput = document.getElementById('t-parcelas');
  const parcelas = parseInt(parcelasInput ? parcelasInput.value : 1) || 1;

  if (!desc || !val || val <= 0) {
    showToast('Preencha a descrição e um valor válido', '#f43f5e');
    return;
  }

  if (currentType === 'expense' && parcelas > 1) {
    const valorParcela = val / parcelas;
    let dataBase = raw ? new Date(raw + 'T12:00:00') : new Date();

    for (let i = 0; i < parcelas; i++) {
      let dataParcela = new Date(dataBase);
      dataParcela.setMonth(dataParcela.getMonth() + i); 
      
      let dia = String(dataParcela.getDate()).padStart(2, '0');
      let mes = String(dataParcela.getMonth() + 1).padStart(2, '0');
      
      transactions.push({ 
        id: nextTxnId++, 
        type: currentType, 
        desc: `${desc} (${i+1}/${parcelas})`, 
        val: valorParcela, 
        cat, 
        recur: 'once',
        date: `${dia}/${mes}` 
      });
    }
  } else {
    const parts = raw ? raw.split('-') : [];
    const dateStr = parts.length === 3 ? `${parts[2]}/${parts[1]}` : 'Hoje';
    transactions.push({ id: nextTxnId++, type: currentType, desc, val, cat, recur, date: dateStr });
  }

  closeTxnModal();
  renderTransactions();
  showToast(parcelas > 1 ? `Adicionada em ${parcelas} parcelas!` : 'Transação adicionada com sucesso!', '#22c55e');

  document.getElementById('t-desc').value = '';
  document.getElementById('t-val').value  = '';
  if(parcelasInput) parcelasInput.value = '1';
}

// ===========================
// MODAL: PLANO
// ===========================

function openPlanModal() {
  document.getElementById('plan-modal').classList.add('open');
}

function closePlanModal() {
  document.getElementById('plan-modal').classList.remove('open');
}

function addPlan() {
  const name  = document.getElementById('p-name').value.trim();
  const goal  = parseFloat(document.getElementById('p-goal').value);
  const cat   = document.getElementById('p-cat').value;
  const recur = document.getElementById('p-recur').value;

  if (!name || !goal || goal <= 0) {
    showToast('Preencha o nome e uma meta válida', '#f43f5e');
    return;
  }

  plans.push({ id: plans.length + 1, name, cat, goal, current: 0, recur });

  closePlanModal();
  renderPlans();
  showToast('Plano criado com sucesso!', '#22c55e');

  document.getElementById('p-name').value = '';
  document.getElementById('p-goal').value = '';
}

// ===========================
// FILTROS
// ===========================

function filt(filter, el) {
  currentFilter = filter;
  document.querySelectorAll('.fb').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderTransactions();
}

// ===========================
// TOAST
// ===========================

function showToast(msg, color) {
  const toast = document.getElementById('toast');
  const dot   = document.getElementById('tdot');
  const text  = document.getElementById('tmsg');

  dot.style.background = color;
  text.textContent = msg;
  toast.classList.add('show');

  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===========================
// PERFIL DO USUÁRIO
// ===========================

function salvarPerfil() {
  const novoNome = document.getElementById('perfil-nome').value;
  
  if (!novoNome) {
    showToast('O nome não pode ficar vazio!', '#f43f5e');
    return;
  }
  
  document.querySelector('.u-name').textContent = novoNome;
  
  const nomes = novoNome.trim().split(' ');
  const iniciais = nomes.length > 1 
    ? nomes[0][0] + nomes[nomes.length - 1][0] 
    : nomes[0].substring(0, 2);
  
  document.querySelector('.av').textContent = iniciais.toUpperCase();
  
  showToast('Perfil atualizado com sucesso!', '#22c55e');
}

// ===========================
// CONFIGURAÇÕES (TEMA E IDIOMA)
// ===========================

function mudarTema(cor) {
  // Remove classes atuais
  document.body.classList.remove('theme-red', 'theme-yellow');
  
  // Tira estado 'active' de todos os botões de cor
  document.querySelectorAll('.btn-theme').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`tema-${cor}`).classList.add('active');

  // Adiciona a classe do novo tema (se não for azul/padrão)
  if (cor === 'red') {
    document.body.classList.add('theme-red');
  } else if (cor === 'yellow') {
    document.body.classList.add('theme-yellow');
  }
  
  // Atualiza os componentes gráficos que dependem da cor em JS
  renderPlans();
  
  showToast('Tema visual atualizado!', 'var(--blue)');
}

function mudarIdioma() {
  const select = document.getElementById('config-idioma');
  const idiomas = {
    'pt': 'Português',
    'en': 'Inglês',
    'es': 'Espanhol'
  };
  
  // Como as strings estão hardcoded no HTML, informamos que o app "salvou" a preferência.
  showToast(`Idioma alterado para ${idiomas[select.value]}. (Simulação)`, 'var(--blue)');
}

// ===========================
// AUTENTICAÇÃO
// ===========================

function doLogin() {
  document.getElementById('login-wrap').style.display = 'none';
  document.getElementById('app').style.display = 'flex';
  buildBarChart();
  renderTransactions();
}

function toReg() {
  document.getElementById('lv').style.display = 'none';
  document.getElementById('rv').style.display = 'block';
}

function toLgn() {
  document.getElementById('rv').style.display = 'none';
  document.getElementById('lv').style.display = 'block';
}

// ===========================
// EVENTOS - FECHAR MODAIS
// ===========================

document.getElementById('txn-modal').addEventListener('click', function (e) {
  if (e.target === this) closeTxnModal();
});

document.getElementById('plan-modal').addEventListener('click', function (e) {
  if (e.target === this) closePlanModal();
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    closeTxnModal();
    closePlanModal();
  }
});