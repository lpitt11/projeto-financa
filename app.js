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
const defaultPlans = [
  { id: 1, name: 'Reserva de Emergência', cat: 'Poupança',     goal: 10000, current: 4200, recur: 'monthly' },
  { id: 2, name: 'Viagem Europa 2025',    cat: 'Viagem',       goal: 15000, current: 6800, recur: 'once'    },
  { id: 3, name: 'Curso de Design',       cat: 'Educação',     goal: 2500,  current: 1800, recur: 'once'    },
];

// Busca do localStorage. Se for null, usa os dados padrão.
let plans = JSON.parse(localStorage.getItem('fintrack_plans')) || defaultPlans;

// Função auxiliar para salvar os planos no localStorage sempre que houver alteração
function salvarPlanosLocais() {
  localStorage.setItem('fintrack_plans', JSON.stringify(plans));
}

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
  
  salvarPlanosLocais(); // <-- ADICIONE ESTA LINHA AQUI
  
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
  
  salvarPlanosLocais(); // <-- ADICIONE ESTA LINHA AQUI

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

// ===========================
// CHATBOT PRO (Assistente IA)
// ===========================

let isProUser = false; // Em produção, busque essa flag do banco de dados (Supabase)

// Chama esta função para liberar o chat (você pode amarrar isso ao login se for PRO)
function ativarPROFake() {
  isProUser = true;
  document.getElementById('pro-chat-btn').style.display = 'flex';
  showToast('Plano PRO Ativado! Assistente de IA liberada.', '#a855f7');
}

function toggleChat() {
  const chat = document.getElementById('pro-chat-window');
  chat.style.display = chat.style.display === 'flex' ? 'none' : 'flex';
  if (chat.style.display === 'flex') {
    document.getElementById('chat-input').focus();
  }
}

function handleChatEnter(e) {
  if (e.key === 'Enter') sendChatMessage();
}

function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;

  const chatBody = document.getElementById('chat-body');

  // 1. Renderiza a mensagem do usuário
  chatBody.innerHTML += `<div class="msg user-msg">${text}</div>`;
  input.value = '';
  chatBody.scrollTop = chatBody.scrollHeight; // Rola pro final

  // 2. Cria o indicador de "A IA está digitando..."
  const typingId = 'typing-' + Date.now();
  chatBody.innerHTML += `<div id="${typingId}" class="msg ai-msg" style="color: var(--text3); font-style: italic;">A IA está analisando...</div>`;
  chatBody.scrollTop = chatBody.scrollHeight;

  // 3. Simula a chamada para uma API real de IA com um delay
  setTimeout(() => {
    // Remove o "Digitando..."
    document.getElementById(typingId).remove();
    
    // Obtém a resposta baseada no texto
    const aiResponse = gerarRespostaIADeMentirinha(text);
    
    // Renderiza a resposta da IA
    chatBody.innerHTML += `<div class="msg ai-msg">${aiResponse}</div>`;
    chatBody.scrollTop = chatBody.scrollHeight;
  }, 1500); // 1.5 segundos de delay para parecer real
}

// Simulador de Lógica LLM (Large Language Model) para testes do Frontend
function gerarRespostaIADeMentirinha(mensagem) {
  const msgLower = mensagem.toLowerCase();
  
  if (msgLower.includes('dívida') || msgLower.includes('divida')) {
    return "Recomendo focar primeiro nas dívidas com juros mais altos, como o cartão de crédito. Quer que eu simule um plano de quitação usando o método 'Bola de Neve'?";
  } else if (msgLower.includes('investir') || msgLower.includes('investimento')) {
    return "Ótimo passo! Antes de ir para a Bolsa, você já possui sua Reserva de Emergência? Ela deve cobrir cerca de 6 meses das suas despesas mensais (que vejo no seu dashboard).";
  } else if (msgLower.includes('limite') || msgLower.includes('gasto')) {
    return "Baseado nos seus últimos gastos, a categoria 'Alimentação' costuma consumir muito. Que tal criarmos um Plano Financeiro para limitar saídas em restaurantes neste mês?";
  } else if (msgLower.includes('oi') || msgLower.includes('ola') || msgLower.includes('olá')) {
    return "Olá! Estou a postos. Você prefere falar sobre como cortar gastos esta semana ou analisar seus investimentos futuros?";
  } else {
    return "Entendi a situação. Como sua assistente PRO, posso analisar seu histórico de transações para te dar uma resposta exata. Você gostaria que eu gerasse um relatório das suas maiores saídas financeiras?";
  }
}

// ===========================
// SISTEMA DE UPGRADE PRO
// ===========================

function openCheckoutModal() {
  document.getElementById('checkout-modal').classList.add('open');
}

function closeCheckoutModal() {
  document.getElementById('checkout-modal').classList.remove('open');
}

function processarPagamento() {
  const nome = document.getElementById('cc-name').value;
  const num = document.getElementById('cc-num').value;
  
  if(!nome || !num) {
    showToast('Preencha os dados do cartão', '#f43f5e');
    return;
  }

  const btn = document.getElementById('btn-pay');
  btn.innerHTML = 'Processando...';
  btn.disabled = true;
  btn.style.opacity = '0.7';

  // Simula o tempo de validação do banco (2 segundos)
  setTimeout(() => {
    // Sucesso!
    localStorage.setItem('fintrack_pro', 'true'); // Salva o status localmente
    
    closeCheckoutModal();
    btn.innerHTML = 'Pagar R$ 19,90';
    btn.disabled = false;
    btn.style.opacity = '1';
    
    // Limpa os campos
    document.getElementById('cc-name').value = '';
    document.getElementById('cc-num').value = '';
    document.getElementById('cc-val').value = '';
    document.getElementById('cc-cvv').value = '';
    
    showToast('Pagamento aprovado! Bem-vindo ao PRO ✦', '#a855f7');
    aplicarStatusPRO(); // Atualiza a interface
    
    // Mostra efeito de confete/festa na tela (simples e chamativo)
    dispararConfetes();

  }, 2000);
}

// Função que desbloqueia a interface para assinantes
function aplicarStatusPRO() {
  if (localStorage.getItem('fintrack_pro') === 'true') {
    isProUser = true; // Libera a variável global
    
    // 1. Mostra o botão do Chatbot de IA
    const chatBtn = document.getElementById('pro-chat-btn');
    if(chatBtn) chatBtn.style.display = 'flex';
    
    // 2. Muda o status na tela Meu Perfil
    const statusPerfil = document.getElementById('perfil-status');
    if(statusPerfil) {
        statusPerfil.textContent = 'PRO ✦';
        statusPerfil.style.color = '#a855f7';
    }
    
    // 3. Desbloqueia a aba de Exportação na tela "Planos"
    const lockPanel = document.querySelector('.locked-panel');
    if(lockPanel) {
        lockPanel.style.borderColor = '#a855f7';
        lockPanel.innerHTML = `
          <div class="lock-ico" style="background: rgba(168,85,247,0.15);">
            <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="#a855f7" stroke-width="2" fill="none"></path><polyline points="7 10 12 15 17 10" stroke="#a855f7" stroke-width="2" fill="none"></polyline><line x1="12" y1="15" x2="12" y2="3" stroke="#a855f7" stroke-width="2" fill="none"></line></svg>
          </div>
          <div class="lock-t" style="color: var(--text);">Relatórios PRO Desbloqueados</div>
          <button class="btn btn-p" style="margin-top:5px; background:#a855f7;" onclick="showToast('Baixando PDF... (Simulação)', '#a855f7')">Exportar PDF</button>
        `;
    }

    // 4. Altera o botão na página "Upgrade PRO" para mostrar que ele já assina
    const btnPro = document.querySelector('.btn-pro');
    if(btnPro) {
      btnPro.textContent = 'Assinatura Ativa ✦';
      btnPro.style.background = '#a855f7';
      btnPro.style.cursor = 'default';
      btnPro.onclick = null; // Remove a ação de clique
    }
  }
}

// Verifica se a pessoa já é PRO assim que ela loga/entra no sistema
document.addEventListener('DOMContentLoaded', () => {
  // Chamamos com um leve atraso para dar tempo das telas carregarem
  setTimeout(aplicarStatusPRO, 500); 
});

function dispararConfetes() {
  // Apenas um efeito divertido visual piscando a tela
  document.body.style.transition = 'background 0.5s';
  const originalBg = document.body.style.background;
  document.body.style.background = 'rgba(168, 85, 247, 0.2)';
  setTimeout(() => { document.body.style.background = originalBg; }, 600);
}

// ===========================
// CANCELAMENTO DE PLANO PRO
// ===========================

function openCancelModal() {
  document.getElementById('cancel-modal').classList.add('open');
}

function closeCancelModal() {
  document.getElementById('cancel-modal').classList.remove('open');
}

function processarCancelamento() {
  // 1. Remove o status PRO do armazenamento
  localStorage.removeItem('fintrack_pro');
  isProUser = false;

  // 2. Fecha o modal
  closeCancelModal();

  // 3. Feedback visual
  showToast('Sua assinatura foi cancelada.', '#f43f5e');

  // 4. Reset imediato da interface (Força o app a voltar ao estado gratuito)
  // O modo mais limpo é recarregar as funções de interface ou a página
  window.location.reload(); 
}

// ATUALIZAÇÃO DA FUNÇÃO aplicarStatusPRO (Substitua a anterior ou adicione estas linhas)
function aplicarStatusPRO() {
  const isPro = localStorage.getItem('fintrack_pro') === 'true';
  
  // Elementos do Perfil
  const statusPerfil = document.getElementById('perfil-status');
  const btnAreaPerfil = document.getElementById('perfil-btn-area');
  
  // Elemento do Menu Lateral (Sidebar)
  const statusSidebar = document.querySelector('.u-plan');
  
  // Elemento do Chat
  const chatBtn = document.getElementById('pro-chat-btn');

  // Elemento da Página de Upgrade
  const btnProUpgrade = document.querySelector('.btn-pro');

  if (isPro) {
    isProUser = true;

    // 1. Sincroniza Textos de Status
    if(statusPerfil) {
      statusPerfil.textContent = 'PRO ✦';
      statusPerfil.style.color = '#a855f7';
    }
    if(statusSidebar) {
      statusSidebar.textContent = 'Plano PRO ✦';
      statusSidebar.style.color = '#a855f7';
    }

    // 2. Chatbot e Botão de Cancelar
    if(chatBtn) chatBtn.style.display = 'flex';
    if(btnAreaPerfil) {
      btnAreaPerfil.innerHTML = `<button class="btn btn-g" style="color: var(--red); border-color: rgba(244, 63, 94, 0.2); font-size: 11px;" onclick="openCancelModal()">Cancelar Assinatura</button>`;
    }

    // 3. Página de Upgrade (Desativa o botão se já for PRO)
    if(btnProUpgrade) {
      btnProUpgrade.textContent = 'Assinatura Ativa';
      btnProUpgrade.style.background = 'var(--bg5)';
      btnProUpgrade.style.cursor = 'default';
      btnProUpgrade.onclick = null;
    }

    // 4. Desbloqueia Relatórios (Painel de Planos)
    const lockPanel = document.querySelector('.locked-panel');
    if(lockPanel) {
        lockPanel.style.borderColor = '#a855f7';
        lockPanel.innerHTML = `
          <div class="lock-ico" style="background: rgba(168,85,247,0.15);">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="#a855f7" stroke-width="2" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          </div>
          <div class="lock-t" style="color: var(--text); font-size: 12px;">Relatórios PRO Liberados</div>
          <button class="btn btn-p" style="margin-top:8px; background:#a855f7; padding: 5px 12px; font-size: 10px;" onclick="showToast('Gerando PDF...', '#a855f7')">Baixar Relatório</button>
        `;
    }

  } else {
    // ESTADO GRATUITO (Sincronização Reversa)
    isProUser = false;
    if(chatBtn) chatBtn.style.display = 'none';
    
    if(statusPerfil) {
      statusPerfil.textContent = 'Plano Gratuito';
      statusPerfil.style.color = 'var(--text)';
    }
    if(statusSidebar) {
      statusSidebar.textContent = 'Plano Gratuito';
      statusSidebar.style.color = 'var(--text3)';
    }
    if(btnAreaPerfil) {
      btnAreaPerfil.innerHTML = `<button class="btn btn-g" onclick="go('pro', document.querySelectorAll('.nav-item')[7])">Upgrade para PRO</button>`;
    }
  }
}

// ===========================
// IA SCANNER DE NOTAS FISCAIS (OCR)
// ===========================
let cameraStream = null;

async function openScanner() {
  const container = document.getElementById('scanner-container');
  const video = document.getElementById('camera-stream');
  const btn = document.getElementById('btn-open-scanner');
  
  if (container.style.display === 'block') {
    closeScanner(); // Se já estiver aberto, ele fecha
    return;
  }

  container.style.display = 'block';
  btn.style.borderColor = '#a855f7';
  btn.style.color = '#a855f7';
  btn.innerHTML = 'Cancelando inicialização da câmera...';

  try {
    // Pede permissão e abre a câmera traseira (environment) do celular/PC
    cameraStream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' } 
    });
    video.srcObject = cameraStream;
    btn.innerHTML = 'Câmera Ativa. Posicione o recibo.';
  } catch (err) {
    showToast('Acesso à câmera negado ou indisponível.', '#f43f5e');
    closeScanner();
  }
}

function closeScanner() {
  const container = document.getElementById('scanner-container');
  const btn = document.getElementById('btn-open-scanner');
  const status = document.getElementById('ocr-status');
  
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop()); // Desliga o led da webcam
    cameraStream = null;
  }
  
  if(container) container.style.display = 'none';
  if(status) status.textContent = '';
  
  if(btn) {
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" style="margin-right: 5px; vertical-align: middle;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg> Escanear Nota Fiscal (IA)';
    btn.style.borderColor = '';
    btn.style.color = '';
  }
}

async function captureAndRead() {
  const video = document.getElementById('camera-stream');
  const canvas = document.getElementById('snapshot-canvas');
  const status = document.getElementById('ocr-status');
  const laser = document.getElementById('scan-laser');
  
  if (!cameraStream) return;

  // 1. Tira uma "foto" do vídeo e joga no Canvas invisível
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  // 2. Inicia os efeitos visuais
  laser.style.display = 'block';
  status.textContent = "Processamento Quântico IA ativado... Lendo pixels.";
  
  try {
    // 3. Chama a biblioteca Tesseract.js para ler o canvas (em português)
    const { data: { text } } = await Tesseract.recognize(canvas, 'por');
    
    console.log("Texto Bruto da IA:", text); // Para você ver no F12 depois

    // 4. Lógica Inteligente para caçar preços (Ex: 15,90 ou 1.250,00)
    const matches = text.match(/\d+[.,]\d{2}/g);
    let maiorValorEncontrado = 0;
    
    if (matches) {
      // Procura o maior número no recibo (Geralmente é o TOTAL)
      matches.forEach(m => {
        // Converte "1.250,90" ou "1250.90" para float do Javascript
        let valConvertido = parseFloat(m.replace(/\./g, '').replace(',', '.'));
        if (valConvertido > maiorValorEncontrado) {
          maiorValorEncontrado = valConvertido;
        }
      });
    }
    
    // 5. Preenche os formulários automaticamente
    document.getElementById('t-desc').value = "Recibo Lido por IA";
    
    if (maiorValorEncontrado > 0) {
      document.getElementById('t-val').value = maiorValorEncontrado;
      showToast('Sucesso! O valor total foi extraído.', '#22c55e');
      setT('expense'); // Define automaticamente como despesa
    } else {
      showToast('IA não encontrou valores nítidos. Preencha manualmente.', '#f59e0b');
    }
    
  } catch (e) {
    console.error(e);
    showToast('Falha na rede neural de leitura.', '#f43f5e');
  } finally {
    laser.style.display = 'none';
    closeScanner();
  }
}

// ATENÇÃO: Adicione isso dentro da sua função closeTxnModal() existente no app.js
// Para garantir que a câmera desligue se a pessoa fechar a janela no meio:
const oldCloseTxn = closeTxnModal;
closeTxnModal = function() {
  closeScanner();
  oldCloseTxn();
};

// ===========================
// SISTEMA DE ORÇAMENTOS E ALERTAS
// ===========================

// Carrega os limites salvos
let budgets = JSON.parse(localStorage.getItem('fintrack_budgets')) || [
  { id: 999, cat: 'Alimentação', limit: 800 }
];

function salvarBudgets() {
  localStorage.setItem('fintrack_budgets', JSON.stringify(budgets));
}

// Calcula o gasto total do mês por categoria
function calcSpend(cat) {
  let total = 0;
  transactions.filter(t => t.type === 'expense' && t.cat === cat).forEach(t => {
    total += Number(t.val);
  });
  return total;
}

// Renderiza os Cards de Limite na Aba "Planos"
function renderBudgets() {
  const grid = document.getElementById('budget-grid');
  if (!grid) return;

  grid.innerHTML = budgets.map(b => {
    const spent = calcSpend(b.cat);
    const pct = Math.min(100, Math.round((spent / b.limit) * 100));
    
    // Muda a cor se estourar
    let color = '#a855f7'; // Roxo padrão
    if (pct >= 80) color = '#f59e0b'; // Laranja alerta
    if (pct >= 100) color = '#f43f5e'; // Vermelho perigo

    return `
      <div class="plan-card" style="position: relative; border-color: ${pct >= 100 ? color : 'var(--border)'};">
        <div class="plan-top">
          <div style="flex: 1;">
            <div class="plan-name">${b.cat}</div>
            <div class="plan-cat">Trava de Segurança</div>
          </div>
          <button class="btn-del" onclick="deleteBudget(${b.id})" style="padding: 0; z-index: 10; position: relative;">✖</button>
        </div>
        <div class="pl-row">
          <span>Gasto Mensal</span>
          <span style="color:${color};">R$ ${spent.toLocaleString('pt-BR')} / R$ ${b.limit.toLocaleString('pt-BR')}</span>
        </div>
        <div class="pbar">
          <div class="pbar-f" style="width:${pct}%; background:${color}"></div>
        </div>
        <div class="pct-txt" style="color:${color}">${pct}% do limite atingido</div>
      </div>`;
  }).join('');
}

// Modal de Orçamentos
function openBudgetModal() { document.getElementById('budget-modal').classList.add('open'); }
function closeBudgetModal() { document.getElementById('budget-modal').classList.remove('open'); }

function addBudget() {
  const cat = document.getElementById('b-cat').value;
  const limit = parseFloat(document.getElementById('b-limit').value);

  if (!limit || limit <= 0) {
    showToast('Insira um limite de gasto válido', '#f43f5e');
    return;
  }

  budgets.push({ id: Date.now(), cat, limit });
  salvarBudgets();
  closeBudgetModal();
  renderBudgets();
  generateAlerts();
  showToast('Trava de orçamento criada!', '#a855f7');
}

function deleteBudget(id) {
  budgets = budgets.filter(b => b.id !== id);
  salvarBudgets();
  renderBudgets();
  generateAlerts();
  showToast('Orçamento removido.', '#f43f5e');
}

// Gera os pop-ups inteligentes no Dashboard
function generateAlerts() {
  const alertsArea = document.getElementById('alerts-area');
  if (!alertsArea) return;
  
  let alertsHTML = '';

  // 1. Alertas de Orçamento Estourado
  budgets.forEach(b => {
    const spent = calcSpend(b.cat);
    const pct = (spent / b.limit) * 100;
    
    if (pct >= 100) {
      alertsHTML += `<div class="alert-box danger"><div class="alert-icon">⚠️</div><div><div style="font-weight:700; color:var(--red); font-size:12px;">Limite Estourado!</div><div style="font-size:11px; color:var(--text2);">Você ultrapassou o teto de R$ ${b.limit} na categoria <b>${b.cat}</b>.</div></div></div>`;
    } else if (pct >= 80) {
      alertsHTML += `<div class="alert-box"><div class="alert-icon">⚡</div><div><div style="font-weight:700; color:#f59e0b; font-size:12px;">Alerta de Gasto</div><div style="font-size:11px; color:var(--text2);">O orçamento de <b>${b.cat}</b> já está em ${Math.round(pct)}%. Cuidado!</div></div></div>`;
    }
  });

  // 2. Lembrete de Despesas Fixas (Vencimentos)
  const fixedExpenses = transactions.filter(t => t.type === 'expense' && t.recur === 'fixed');
  if (fixedExpenses.length > 0) {
    alertsHTML += `<div class="alert-box info"><div class="alert-icon">📅</div><div><div style="font-weight:700; color:var(--blue2); font-size:12px;">Análise de Vencimentos</div><div style="font-size:11px; color:var(--text2);">O sistema detectou <b>${fixedExpenses.length} despesa(s) fixa(s)</b>. Verifique se todas já foram pagas este mês.</div></div></div>`;
  }

  alertsArea.innerHTML = alertsHTML;
}

// ATENÇÃO: Conectando os Alertas e Orçamentos com as funções que já existem
const oldUpdateDash = updateDashboardStats;
updateDashboardStats = function() {
  oldUpdateDash();
  generateAlerts(); // Sempre que o dashboard atualizar, gera os alertas
  renderBudgets();  // Atualiza as travas de orçamento também
};