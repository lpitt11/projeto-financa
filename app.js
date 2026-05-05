/* ===========================
   FINTRACK — app.js
   Lógica principal do app corrigida
=========================== */

// ===========================
// 1. CONEXÃO COM SUPABASE
// ===========================
const SUPABASE_URL = 'https://dsgeduzjhvepperoeuhe.supabase.co'; // Removi o /rest/v1/ pois a biblioteca v2 já faz isso sozinha
const SUPABASE_KEY = 'sb_publishable_G11x2M5RWNPZO1efX_-aTw_IqVTgmT0';

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===========================
// DADOS INICIAIS
// ===========================
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

let transactions = [];
let plans = [
  { id: 1, name: 'Reserva de Emergência', cat: 'Poupança',     goal: 10000, current: 4200, recur: 'monthly' },
  { id: 2, name: 'Viagem Europa 2025',    cat: 'Viagem',       goal: 15000, current: 6800, recur: 'once'    },
  { id: 3, name: 'Curso de Design',       cat: 'Educação',     goal: 2500,  current: 1800, recur: 'once'    },
];

let currentType = 'income';
let currentFilter = 'all';

// ===========================
// ATUALIZAR DASHBOARD (NOVO)
// ===========================
function updateDashboardStats() {
  let totalInc = 0;
  let totalExp = 0;

  transactions.forEach(t => {
    if (t.type === 'income') totalInc += Number(t.val);
    if (t.type === 'expense') totalExp += Number(t.val);
  });

  const balance = totalInc - totalExp;

  // Atualiza HTML
  const balAmountEl = document.querySelector('.bal-amount');
  const statIncEl = document.querySelector('.stat-val.inc');
  const statExpEl = document.querySelector('.stat-val.exp');
  const statBalEls = document.querySelectorAll('.stat-val');

  if (balAmountEl) balAmountEl.textContent = `R$ ${balance.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
  if (statIncEl) statIncEl.textContent = `R$ ${totalInc.toLocaleString('pt-BR')}`;
  if (statExpEl) statExpEl.textContent = `R$ ${totalExp.toLocaleString('pt-BR')}`;
  
  // Atualiza o Saldo Final no card pequeno
  if (statBalEls.length >= 3) {
    statBalEls[2].textContent = `R$ ${balance.toLocaleString('pt-BR')}`;
  }
}

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
// LÓGICA DO SUPABASE (CRUD)
// ===========================
async function loadTransactions() {
  const { data, error } = await db
    .from('transactions')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    showToast('Erro ao carregar transações. Verifique o console.', '#f43f5e');
    console.error(error);
  } else {
    transactions = data || [];
    renderTransactions();
  }
}

async function deleteTxn(id) {
  if(confirm('Tem certeza que deseja excluir esta transação?')) {
    const { error } = await db
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      showToast('Erro ao excluir do banco', '#f43f5e');
      console.error(error);
    } else {
      transactions = transactions.filter(t => t.id !== id);
      renderTransactions();
      showToast('Transação removida.', '#f43f5e');
    }
  }
}

async function addTxn() {
  const descText  = document.getElementById('t-desc').value.trim();
  const val   = parseFloat(document.getElementById('t-val').value);
  const cat   = document.getElementById('t-cat').value;
  const recur = document.getElementById('t-recur').value;
  const raw   = document.getElementById('t-date').value;
  const parcelasInput = document.getElementById('t-parcelas');
  const parcelas = parseInt(parcelasInput ? parcelasInput.value : 1) || 1;

  if (!descText || !val || val <= 0) {
    showToast('Preencha a descrição e um valor válido', '#f43f5e');
    return;
  }

  let transactionsToInsert = [];

  if (currentType === 'expense' && parcelas > 1) {
    const valorParcela = val / parcelas;
    let dataBase = raw ? new Date(raw + 'T12:00:00') : new Date();

    for (let i = 0; i < parcelas; i++) {
      let dataParcela = new Date(dataBase);
      dataParcela.setMonth(dataParcela.getMonth() + i); 
      
      let dia = String(dataParcela.getDate()).padStart(2, '0');
      let mes = String(dataParcela.getMonth() + 1).padStart(2, '0');
      
      transactionsToInsert.push({ 
        type: currentType, 
        description: `${descText} (${i+1}/${parcelas})`,
        val: valorParcela, 
        cat: cat, 
        recur: 'once',
        date: `${dia}/${mes}` 
      });
    }
  } else {
    const parts = raw ? raw.split('-') : [];
    const dateStr = parts.length === 3 ? `${parts[2]}/${parts[1]}` : 'Hoje';
    
    transactionsToInsert.push({ 
      type: currentType, 
      description: descText,
      val: val, 
      cat: cat, 
      recur: recur, 
      date: dateStr 
    });
  }

  const { data, error } = await db
    .from('transactions')
    .insert(transactionsToInsert)
    .select();

  if (error) {
    showToast('Erro ao salvar no banco. Veja F12.', '#f43f5e');
    console.error("ERRO DO SUPABASE:", error); 
  } else {
    transactions = [...data, ...transactions];
    transactions.sort((a,b) => b.id - a.id); 
    
    closeTxnModal();
    renderTransactions();
    showToast(parcelas > 1 ? `Adicionada em ${parcelas} parcelas!` : 'Transação adicionada com sucesso!', '#22c55e');

    document.getElementById('t-desc').value = '';
    document.getElementById('t-val').value  = '';
    if(parcelasInput) parcelasInput.value = '1';
  }
}

// ===========================
// RENDERIZAÇÃO TRANSAÇÕES
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
        <div class="txn-name">${t.description}${badge}</div> 
        <div class="txn-cat">${t.cat}</div>
      </div>
      <div class="txn-right" style="display: flex; align-items: center; gap: 12px; justify-content: flex-end;">
        <div style="text-align: right;">
          <div class="txn-amt ${cls}">${sign} R$ ${Number(t.val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
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
    recentEl.innerHTML = transactions.slice(0, 4).map(buildTransactionHTML).join('');
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

  // Atualiza os valores do painel sempre que renderizar as transações
  updateDashboardStats();
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
// MODAIS E FILTROS
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

function filt(filter, el) {
  currentFilter = filter;
  document.querySelectorAll('.fb').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderTransactions();
}

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
// PERFIL & CONFIGURAÇÕES
// ===========================
function salvarPerfil() {
  const novoNome = document.getElementById('perfil-nome').value;
  if (!novoNome) {
    showToast('O nome não pode ficar vazio!', '#f43f5e');
    return;
  }
  atualizarNomeUI(novoNome);
  localStorage.setItem('fintrack_nome', novoNome);
  showToast('Perfil atualizado com sucesso!', '#22c55e');
}

function atualizarNomeUI(nome) {
  const uNameEl = document.querySelector('.u-name');
  if(uNameEl) uNameEl.textContent = nome;
  
  const nomes = nome.trim().split(' ');
  const iniciais = nomes.length > 1 
    ? nomes[0][0] + nomes[nomes.length - 1][0] 
    : nomes[0].substring(0, 2);
    
  const avEl = document.querySelector('.av');
  if(avEl) avEl.textContent = iniciais.toUpperCase();
  
  const inputNome = document.getElementById('perfil-nome');
  if(inputNome) inputNome.value = nome;
}

function mudarTema(cor, showMsg = true) {
  document.body.classList.remove('theme-red', 'theme-yellow');
  document.querySelectorAll('.btn-theme').forEach(btn => btn.classList.remove('active'));
  
  const btnAtivo = document.getElementById(`tema-${cor}`);
  if(btnAtivo) btnAtivo.classList.add('active');

  if (cor === 'red') document.body.classList.add('theme-red');
  else if (cor === 'yellow') document.body.classList.add('theme-yellow');
  
  localStorage.setItem('fintrack_theme', cor);
  
  renderPlans();
  if(showMsg) showToast('Tema visual atualizado!', 'var(--blue)');
}

function mudarIdioma(showMsg = true) {
  const select = document.getElementById('config-idioma');
  const idiomas = { 'pt': 'Português', 'en': 'Inglês', 'es': 'Espanhol' };
  localStorage.setItem('fintrack_lang', select.value);
  if(showMsg) showToast(`Idioma alterado para ${idiomas[select.value]}.`, 'var(--blue)');
}

// ===========================
// AUTENTICAÇÃO E STARTUP
// ===========================
function doLogin() {
  localStorage.setItem('fintrack_logged', 'true'); 
  document.getElementById('login-wrap').style.display = 'none';
  document.getElementById('app').style.display = 'flex';
  loadTransactions();
}

function doLogout() {
  localStorage.removeItem('fintrack_logged'); 
  window.location.reload(); 
}

function toReg() {
  document.getElementById('lv').style.display = 'none';
  document.getElementById('rv').style.display = 'block';
}

function toLgn() {
  document.getElementById('rv').style.display = 'none';
  document.getElementById('lv').style.display = 'block';
}

// Inicializa a página
window.onload = function() {
  const savedName = localStorage.getItem('fintrack_nome') || 'João Duarte';
  atualizarNomeUI(savedName);

  const savedTheme = localStorage.getItem('fintrack_theme') || 'blue';
  mudarTema(savedTheme, false);

  const savedLang = localStorage.getItem('fintrack_lang');
  if (savedLang) {
    document.getElementById('config-idioma').value = savedLang;
  }

  const isLogged = localStorage.getItem('fintrack_logged');
  if (isLogged === 'true') {
    document.getElementById('login-wrap').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    loadTransactions();
  }
};

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