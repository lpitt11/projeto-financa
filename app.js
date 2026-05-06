/* ===========================
   FINTRACK — app.js
   Lógica principal do app com Cotações em Tempo Real e Supabase
=========================== */

// ===========================
// 1. CONEXÃO COM SUPABASE
// ===========================
const SUPABASE_URL = 'https://dsgeduzjhvepperoeuhe.supabase.co'; 
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

const CAT_COLORS = {
  'Moradia': 'var(--blue)',     
  'Alimentação': '#22c55e',     
  'Transporte': '#f59e0b',      
  'Lazer': '#a855f7',           
  'Saúde': '#f43f5e',           
  'Educação': '#14b8a6',        
  'Outros': '#888888'           
};

let transactions = [];
let plans = [
  { id: 1, name: 'Reserva de Emergência', cat: 'Poupança',     goal: 10000, current: 4200, recur: 'monthly' },
  { id: 2, name: 'Viagem Europa 2025',    cat: 'Viagem',       goal: 15000, current: 6800, recur: 'once'    },
  { id: 3, name: 'Curso de Design',       cat: 'Educação',     goal: 2500,  current: 1800, recur: 'once'    },
];

let currentType = 'income';
let currentFilter = 'all';

// ===========================
// ATUALIZAR DASHBOARD E GRÁFICOS
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
  if (statIncEl) statIncEl.textContent = `R$ ${totalInc.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
  if (statExpEl) statExpEl.textContent = `R$ ${totalExp.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
  
  if (statBalEls.length >= 3) {
    statBalEls[2].textContent = `R$ ${balance.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
  }

  // Atualiza os Gráficos
  renderCategoryChart(totalExp);
  renderBarChart();
}

function renderCategoryChart(totalExp) {
  const donutWrap = document.querySelector('.donut-wrap');
  if (!donutWrap) return;

  // Se não houver despesas
  if (totalExp === 0) {
    donutWrap.innerHTML = `
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="29" fill="none" stroke="var(--bg4)" stroke-width="13"/>
      </svg>
      <div class="cats" style="justify-content:center; color:var(--text3); font-size:11px;">
        Nenhuma despesa registrada.
      </div>`;
    return;
  }

  // Agrupa as despesas
  const catTotals = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    catTotals[t.cat] = (catTotals[t.cat] || 0) + Number(t.val);
  });

  // Ordena os maiores gastos
  let sortedCats = Object.keys(catTotals).map(cat => ({
    name: cat,
    val: catTotals[cat],
    pct: (catTotals[cat] / totalExp) * 100
  })).sort((a, b) => b.val - a.val);

  // Limita a 5 fatias no gráfico
  if (sortedCats.length > 5) {
    const top4 = sortedCats.slice(0, 4);
    const restVal = sortedCats.slice(4).reduce((sum, c) => sum + c.val, 0);
    top4.push({
      name: 'Outros',
      val: restVal,
      pct: (restVal / totalExp) * 100
    });
    sortedCats = top4;
  }

  // Criação do SVG e Lista
  const C = 2 * Math.PI * 29; 
  let currentOffset = 0;
  let svgCircles = '<circle cx="40" cy="40" r="29" fill="none" stroke="var(--bg4)" stroke-width="13"/>';
  let listHTML = '';

  const fallbackColors = ['var(--blue)', '#22c55e', '#f59e0b', '#a855f7', '#f43f5e'];

  sortedCats.forEach((c, i) => {
    const color = CAT_COLORS[c.name] || fallbackColors[i % fallbackColors.length];
    
    const strokeLength = (c.pct / 100) * C;
    const gap = C - strokeLength;

    svgCircles += `<circle cx="40" cy="40" r="29" fill="none" stroke="${color}" stroke-width="13" stroke-dasharray="${strokeLength} ${gap}" stroke-dashoffset="${-currentOffset}" transform="rotate(-90 40 40)"/>`;
    currentOffset += strokeLength;

    listHTML += `
      <div class="cat-row">
        <div class="cat-pip" style="background:${color}"></div>
        <div class="cat-n">${c.name}</div>
        <div class="cat-p">${Math.round(c.pct)}%</div>
      </div>`;
  });

  donutWrap.innerHTML = `
    <svg width="80" height="80" viewBox="0 0 80 80">
      ${svgCircles}
    </svg>
    <div class="cats" style="flex: 1; display: flex; flex-direction: column; gap: 7px;">
      ${listHTML}
    </div>`;
}

function renderBarChart() {
  const chartEl = document.getElementById('barchart');
  if (!chartEl) return;

  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const currentMonth = new Date().getMonth();
  const last6Months = [];

  for (let i = 5; i >= 0; i--) {
    let m = currentMonth - i;
    if (m < 0) m += 12; 
    last6Months.push({ index: m, name: monthNames[m], inc: 0, exp: 0 });
  }

  transactions.forEach(t => {
    let tMonth = currentMonth; 
    if (t.date !== 'Hoje') {
      const parts = t.date.split('/');
      if (parts.length === 2) tMonth = parseInt(parts[1], 10) - 1; 
    }

    const monthObj = last6Months.find(m => m.index === tMonth);
    if (monthObj) {
      if (t.type === 'income') monthObj.inc += Number(t.val);
      if (t.type === 'expense') monthObj.exp += Number(t.val);
    }
  });

  let maxVal = 0;
  last6Months.forEach(m => {
    if (m.inc > maxVal) maxVal = m.inc;
    if (m.exp > maxVal) maxVal = m.exp;
  });
  if (maxVal === 0) maxVal = 1; 

  chartEl.innerHTML = last6Months.map(m => {
    const heightInc = (m.inc / maxVal) * 100;
    const heightExp = (m.exp / maxVal) * 100;

    return `
      <div class="bg-grp">
        <div class="bg-bars">
          <div class="b i" style="height: ${heightInc}%" title="Receita: R$ ${m.inc.toLocaleString('pt-BR')}"></div>
          <div class="b e" style="height: ${heightExp}%" title="Despesa: R$ ${m.exp.toLocaleString('pt-BR')}"></div>
        </div>
        <div class="bg-lbl">${m.name}</div>
      </div>
    `;
  }).join('');
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

  if (screenId === 'txn')    renderTransactions();
  if (screenId === 'plans')  renderPlans();
  if (screenId === 'quotes') loadQuotes();
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

// Controle do Modal de Excluir Transação
let txnToDeleteId = null;

function deleteTxn(id) {
  txnToDeleteId = id;
  document.getElementById('confirm-modal').classList.add('open');
}

function closeConfirmModal() {
  txnToDeleteId = null;
  document.getElementById('confirm-modal').classList.remove('open');
}

async function confirmDeleteTxn() {
  if (!txnToDeleteId) return;
  
  const id = txnToDeleteId;
  closeConfirmModal();

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

  updateDashboardStats();
}

// ===========================
// PLANOS
// ===========================
let planToDeleteId = null;

function deletePlan(id) {
  planToDeleteId = id;
  const modal = document.getElementById('confirm-plan-modal');
  if (modal) {
    modal.classList.add('open');
  } else {
    console.error("Modal de deletar plano não encontrada no HTML!");
  }
}

function closeConfirmPlanModal() {
  planToDeleteId = null;
  const modal = document.getElementById('confirm-plan-modal');
  if(modal) modal.classList.remove('open');
}

function confirmDeletePlan() {
  if (!planToDeleteId) return;
  
  plans = plans.filter(p => p.id !== planToDeleteId);
  
  closeConfirmPlanModal();
  renderPlans();
  showToast('Plano removido com sucesso.', '#f43f5e');
}

function renderPlans() {
  const gridEl  = document.getElementById('pgrid');
  const progEl  = document.getElementById('gprog');
  if (!gridEl) return;

  gridEl.innerHTML = plans.map((p, i) => {
    const pct   = Math.min(100, Math.round((p.current / p.goal) * 100));
    const color = PLAN_COLORS[i % PLAN_COLORS.length];
    const badgeClass = p.recur === 'monthly' ? 'pb-m' : 'pb-o';
    const badgeText  = p.recur === 'monthly' ? 'Mensal' : 'Único';

    // O botão 'btn-del' tem um z-index para ficar acima do hover neon do card
    return `
      <div class="plan-card" style="position: relative;">
        <div class="plan-top">
          <div style="flex: 1;">
            <div class="plan-name">${p.name}</div>
            <div class="plan-cat">${p.cat}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="pbadge ${badgeClass}">${badgeText}</span>
            <button class="btn-del" onclick="deletePlan(${p.id})" style="padding: 0; margin-top: -4px; z-index: 10; position: relative;">✖</button>
          </div>
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

  plans.push({ id: Date.now(), name, cat, goal, current: 0, recur });

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
// COTAÇÕES (AWESOME API)
// ===========================
let globalRates = {};

async function loadQuotes() {
  const grid = document.getElementById('quotes-grid');
  if (!grid) return;

  grid.innerHTML = '<div class="ps" style="grid-column: 1 / -1;">Carregando cotações atualizadas...</div>';

  try {
    const resp = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL');
    const data = await resp.json();
    globalRates = data;

    grid.innerHTML = `
      ${renderQuoteCard('Dólar Americano', data.USDBRL)}
      ${renderQuoteCard('Euro', data.EURBRL)}
      ${renderQuoteCard('Bitcoin', data.BTCBRL, true)}
    `;
    
    convertCurrency(); 
  } catch (err) {
    grid.innerHTML = '<div class="ps" style="color:var(--red); grid-column: 1 / -1;">Erro ao carregar dados do mercado.</div>';
  }
}

function renderQuoteCard(title, coin, isCrypto = false) {
  const pct = parseFloat(coin.pctChange);
  const pctClass = pct >= 0 ? 'chg-up' : 'chg-dn';
  const arrow = pct >= 0 ? '↑' : '↓';
  const val = parseFloat(coin.bid).toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL',
    maximumFractionDigits: isCrypto ? 0 : 2 
  });

  return `
    <div class="stat-card">
      <div class="stat-label">${title}</div>
      <div class="stat-val">${val}</div>
      <div class="stat-change ${pctClass}">
        ${arrow} ${pct}% nas últimas 24h
      </div>
    </div>
  `;
}

function convertCurrency() {
  const from = document.getElementById('conv-from').value;
  const val = parseFloat(document.getElementById('conv-val').value) || 0;
  const resultEl = document.getElementById('conv-result');

  if (globalRates[from + 'BRL']) {
    const rate = parseFloat(globalRates[from + 'BRL'].bid);
    const total = val * rate;
    resultEl.textContent = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  } else {
    resultEl.textContent = 'R$ 0,00';
  }
}

// ===========================
// AUTENTICAÇÃO E STARTUP (SUPABASE)
// ===========================
async function registerSupabase() {
  const nome = document.getElementById('reg-nome').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-pass').value;

  if (!nome || !email || !password) {
    showToast('Preencha todos os campos.', '#f43f5e');
    return;
  }

  const { data, error } = await db.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        full_name: nome 
      }
    }
  });

  if (error) {
    showToast('Erro: ' + error.message, '#f43f5e');
  } else {
    showToast('Conta criada com sucesso! Faça seu login.', '#22c55e');
    toLgn(); 
  }
}

async function loginSupabase() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-pass').value;

  if (!email || !password) {
    showToast('Preencha e-mail e senha.', '#f43f5e');
    return;
  }

  const { data, error } = await db.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    showToast('Credenciais inválidas ou erro no login.', '#f43f5e');
  } else {
    showToast('Login realizado com sucesso!', '#22c55e');
    iniciarAppLogado(data.user);
  }
}

async function doLogout() {
  try {
    await db.auth.signOut(); 
    localStorage.removeItem('fintrack_logged');
    localStorage.removeItem('fintrack_nome');
    window.location.href = window.location.pathname; 
  } catch (error) {
    console.error("Erro ao sair:", error);
    localStorage.clear();
    window.location.reload();
  }
}

function toReg() {
  document.getElementById('lv').style.display = 'none';
  document.getElementById('rv').style.display = 'block';
}

function toLgn() {
  document.getElementById('rv').style.display = 'none';
  document.getElementById('lv').style.display = 'block';
}

function iniciarAppLogado(user) {
  document.getElementById('login-wrap').style.display = 'none';
  document.getElementById('app').style.display = 'flex';
  
  if (user && user.user_metadata) {
    const nome = user.user_metadata.full_name || 'Usuário';
    atualizarNomeUI(nome);
    document.getElementById('perfil-email').value = user.email;
  }

  loadTransactions();
}

// INICIALIZAÇÃO DA PÁGINA
window.onload = async function() {
  const savedTheme = localStorage.getItem('fintrack_theme') || 'blue';
  mudarTema(savedTheme, false);

  const savedLang = localStorage.getItem('fintrack_lang');
  if (savedLang) {
    document.getElementById('config-idioma').value = savedLang;
  }

  const { data: { session } } = await db.auth.getSession();
  
  if (session) {
    iniciarAppLogado(session.user);
  } else {
    document.getElementById('login-wrap').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
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

document.getElementById('confirm-modal').addEventListener('click', function (e) {
  if (e.target === this) closeConfirmModal();
});

document.getElementById('confirm-plan-modal').addEventListener('click', function (e) {
  if (e.target === this) closeConfirmPlanModal();
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    closeTxnModal();
    closePlanModal();
    closeConfirmModal();
    closeConfirmPlanModal();
  }
});