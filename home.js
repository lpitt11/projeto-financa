/* ===========================
   FINTRACK — home.js
   Landing Page / Home para Atrair Usuários
=========================== */

const homeStyles = `
<style>
  /* --- ANIMAÇÕES --- */
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes pulseGlow {
    0% { opacity: 0.5; transform: translateX(-50%) scale(1); }
    100% { opacity: 0.8; transform: translateX(-50%) scale(1.15); }
  }

  /* --- ESTILOS GERAIS --- */
  .home-wrap {
    background: #080808;
    color: #f5f5f5;
    font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
    position: relative;
    z-index: 1000;
  }

  /* Brilho de fundo pulsante */
  .home-wrap::before {
    content: '';
    position: absolute;
    top: -10%; left: 50%; transform: translateX(-50%);
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(43, 111, 255, 0.15) 0%, rgba(8, 8, 8, 0) 70%);
    z-index: -1;
    pointer-events: none;
    animation: pulseGlow 4s infinite alternate ease-in-out;
  }

  .home-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 8%;
    position: sticky;
    top: 0;
    background: rgba(8, 8, 8, 0.8);
    backdrop-filter: blur(12px);
    z-index: 1100;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .home-logo {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .home-nav {
    display: flex;
    gap: 15px;
  }

  /* --- BOTÕES COM EFEITOS NEON --- */
  .btn-home-login {
    background: transparent;
    color: #888;
    border: 1px solid #333;
    padding: 10px 22px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-home-login:hover {
    color: #2b6fff;
    border-color: #2b6fff;
    background: rgba(43, 111, 255, 0.1);
    box-shadow: 0 0 15px rgba(43, 111, 255, 0.3);
    transform: translateY(-2px);
  }

  .btn-home-primary {
    background: linear-gradient(135deg, #2b6fff, #1a4fd6);
    color: white;
    border: none;
    padding: 10px 22px;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(43, 111, 255, 0.3);
  }

  .btn-home-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(43, 111, 255, 0.5);
    filter: brightness(1.1);
  }

  .btn-lg {
    padding: 14px 32px;
    font-size: 16px;
  }

  /* --- HERO SECTION --- */
  .hero {
    padding: 120px 8% 80px;
    text-align: center;
    max-width: 1100px;
    margin: 0 auto;
  }

  /* Cascata de animações na entrada */
  .hero-badge { animation: fadeInUp 0.8s ease both; animation-delay: 0.1s; }
  .hero-title { animation: fadeInUp 0.8s ease both; animation-delay: 0.2s; }
  .hero-subtitle { animation: fadeInUp 0.8s ease both; animation-delay: 0.3s; }
  .hero-actions { animation: fadeInUp 0.8s ease both; animation-delay: 0.4s; }
  .hero-mockup { animation: fadeInUp 1s ease both; animation-delay: 0.5s; }

  .hero-badge {
    display: inline-block;
    padding: 6px 15px;
    background: rgba(43, 111, 255, 0.1);
    border: 1px solid rgba(43, 111, 255, 0.3);
    border-radius: 99px;
    color: #4d8fff;
    font-size: 12px;
    font-weight: 700;
    margin-bottom: 24px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .hero-title {
    font-size: clamp(40px, 8vw, 64px);
    font-weight: 800;
    letter-spacing: -2px;
    margin-bottom: 24px;
    line-height: 1.05;
  }

  .hero-title span {
    background: linear-gradient(90deg, #2b6fff, #a855f7);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 0 15px rgba(43, 111, 255, 0.3));
  }

  .hero-subtitle {
    font-size: 19px;
    color: #888;
    margin-bottom: 48px;
    max-width: 650px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.6;
  }

  .hero-actions {
    display: flex;
    gap: 20px;
    justify-content: center;
    margin-bottom: 80px;
  }

  /* Novo estilo do Mockup: Limpo, parado e responsivo ao hover */
  .hero-mockup {
    background: #0f0f0f;
    border: 1px solid #1a1a1a;
    border-radius: 24px;
    padding: 12px;
    box-shadow: 0 30px 60px -15px rgba(0,0,0,0.8), 0 0 20px rgba(43, 111, 255, 0.05);
    max-width: 900px;
    margin: 0 auto;
    transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.5s ease;
  }

  .hero-mockup:hover {
    transform: translateY(-8px);
    box-shadow: 0 40px 80px -15px rgba(0,0,0,0.9), 0 0 40px rgba(43, 111, 255, 0.15);
  }

  .mock-inner {
    background: #080808;
    height: 450px;
    border-radius: 14px;
    display: flex;
    overflow: hidden;
    position: relative;
  }

  .mock-sidebar { width: 70px; background: #0f0f0f; border-right: 1px solid #1a1a1a; }
  .mock-content { flex: 1; padding: 30px; display: flex; flex-direction: column; gap: 20px; }
  .mock-header { height: 40px; width: 40%; background: #151515; border-radius: 8px; }
  .mock-main-card { height: 120px; background: linear-gradient(135deg, #151515 0%, #1a1a1a 100%); border: 1px solid #2b6fff33; border-radius: 12px; }
  .mock-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
  .mock-item { height: 80px; background: #151515; border-radius: 10px; }

  /* --- FEATURES --- */
  .features { padding: 100px 8%; background: #080808; }
  .section-tag { color: #2b6fff; font-weight: 700; text-transform: uppercase; font-size: 13px; text-align: center; display: block; margin-bottom: 10px; }
  .section-title { text-align: center; font-size: 36px; font-weight: 800; margin-bottom: 64px; letter-spacing: -1px; }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 32px;
  }

  .feature-card {
    background: #0f0f0f;
    padding: 40px;
    border-radius: 20px;
    border: 1px solid #1a1a1a;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .feature-card:hover {
    background: #121212;
    border-color: #2b6fff;
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(43, 111, 255, 0.15);
  }

  .f-icon { 
    width: 50px; height: 50px; background: rgba(43, 111, 255, 0.1); 
    border-radius: 12px; display: flex; align-items: center; justify-content: center;
    font-size: 24px; margin-bottom: 24px; color: #2b6fff;
    transition: transform 0.3s ease;
  }

  .feature-card:hover .f-icon {
    transform: scale(1.1) rotate(5deg);
  }

  .feature-card h3 { margin-bottom: 16px; font-size: 20px; font-weight: 700; }
  .feature-card p { color: #888; line-height: 1.7; font-size: 15px; }

  /* --- FOOTER CTA --- */
  .cta-bottom {
    padding: 120px 8%;
    text-align: center;
    background: radial-gradient(circle at center, #151515 0%, #080808 100%);
  }

  .cta-bottom h2 { font-size: clamp(32px, 5vw, 48px); font-weight: 800; margin-bottom: 20px; }
  .cta-bottom p { color: #888; margin-bottom: 40px; font-size: 18px; }

  .home-footer {
    padding: 60px 8% 40px;
    border-top: 1px solid #1a1a1a;
    text-align: center;
    color: #555;
    font-size: 14px;
  }

  @media (max-width: 768px) {
    .hero { padding-top: 80px; }
    .hero-actions { flex-direction: column; }
    .mock-inner { height: 300px; }
    .mock-grid { grid-template-columns: 1fr 1fr; }
    .mock-item:last-child { display: none; }
  }
</style>
`;

const homeHTML = `
<div id="home-landing" class="home-wrap">
  <header class="home-header">
    <div class="home-logo">
      <div class="logo-mark" style="width: 30px; height: 30px; background: var(--blue, #2b6fff); border-radius: 7px; display: flex; align-items: center; justify-content: center;">
        <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; stroke: white; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
      </div>
      <span class="logo-name" style="font-size: 20px; font-weight: 800;">FinTrack</span>
    </div>
    <nav class="home-nav">
      <button class="btn-home-login" onclick="showLoginFromHome()">Entrar</button>
      <button class="btn-home-primary" onclick="showRegisterFromHome()">Começar Agora</button>
    </nav>
  </header>

  <main>
    <section class="hero">
      <span class="hero-badge">A revolução na sua gestão financeira</span>
      <h1 class="hero-title">Controle seu dinheiro com <span>inteligência</span>.</h1>
      <p class="hero-subtitle">FinTrack combina simplicidade e poder para você dominar seus gastos, atingir metas e visualizar seu futuro financeiro em segundos.</p>
      
      <div class="hero-actions">
        <button class="btn-home-primary btn-lg" onclick="showRegisterFromHome()">Criar minha conta gratuita</button>
        <button class="btn-home-login btn-lg" onclick="scrollToFeatures()">Explorar recursos</button>
      </div>

      <div class="hero-mockup">
        <div class="mock-inner">
          <div class="mock-sidebar"></div>
          <div class="mock-content">
            <div class="mock-header"></div>
            <div class="mock-main-card"></div>
            <div class="mock-grid">
              <div class="mock-item"></div>
              <div class="mock-item"></div>
              <div class="mock-item"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="features" class="features">
      <span class="section-tag">Recursos Elite</span>
      <h2 class="section-title">Tudo o que você precisa em um só lugar</h2>
      
      <div class="features-grid">
        <div class="feature-card">
          <div class="f-icon">📊</div>
          <h3>Dashboard Visual</h3>
          <p>Gráficos interativos que mostram exatamente para onde seu dinheiro está indo, sem complicação.</p>
        </div>
        <div class="feature-card">
          <div class="f-icon">🎯</div>
          <h3>Metas de Sonhos</h3>
          <p>Defina metas para sua próxima viagem ou reserva de emergência e veja o progresso em tempo real.</p>
        </div>
        <div class="feature-card">
          <div class="f-icon">🌍</div>
          <h3>Moedas Globais</h3>
          <p>Fique de olho no Dólar, Euro e Bitcoin com cotações atualizadas via API diretamente no app.</p>
        </div>
        <div class="feature-card">
          <div class="f-icon">🛡️</div>
          <h3>Segurança Bancária</h3>
          <p>Autenticação segura via Supabase para garantir que seus dados financeiros sejam vistos apenas por você.</p>
        </div>
        <div class="feature-card">
          <div class="f-icon">📅</div>
          <h3>Parcelamento Inteligente</h3>
          <p>Adicione compras parceladas e o FinTrack projeta automaticamente seus gastos nos próximos meses.</p>
        </div>
        <div class="feature-card">
          <div class="f-icon">⭐</div>
          <h3>Versão PRO</h3>
          <p>Relatórios exportáveis, categorias personalizadas e suporte prioritário para quem leva finanças a sério.</p>
        </div>
      </div>
    </section>

    <section class="cta-bottom">
      <h2>Pronto para a liberdade financeira?</h2>
      <p>Junte-se a milhares de pessoas que já organizaram sua vida com o FinTrack.</p>
      <button class="btn-home-primary btn-lg" onclick="showRegisterFromHome()">Começar Grátis Agora</button>
    </section>
  </main>

  <footer class="home-footer">
    <div class="home-logo" style="justify-content: center; margin-bottom: 20px; opacity: 0.5;">
      <div class="logo-mark" style="width: 24px; height: 24px; background: transparent; border: 1px solid #888; border-radius: 6px; display: flex; align-items: center; justify-content: center;">
        <svg viewBox="0 0 24 24" style="width: 12px; height: 12px; stroke: #888; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
      </div>
      <span class="logo-name" style="font-size: 16px;">FinTrack</span>
    </div>
    <p>&copy; 2026 FinTrack — Gestão Financeira Inteligente. Feito para quem busca o topo.</p>
    <p>&copy; Desenvolvido por Lucas Pitt.</p>
  </footer>
</div>
`;

// ===========================
// FUNÇÕES E INTEGRAÇÃO
// ===========================

function showLoginFromHome() {
  const home = document.getElementById('home-landing');
  if(home) home.style.display = 'none';
  
  const loginContainer = document.getElementById('login-wrap');
  if(loginContainer) {
    loginContainer.style.display = 'flex'; // ATENÇÃO: Use 'flex' aqui
    loginContainer.style.alignItems = 'center';
    loginContainer.style.justifyContent = 'center';
  }
  
  if(typeof toLgn === 'function') toLgn();
}

function showRegisterFromHome() {
  const home = document.getElementById('home-landing');
  if(home) home.style.display = 'none';
  
  const loginContainer = document.getElementById('login-wrap');
  if(loginContainer) {
    loginContainer.style.display = 'flex'; // ATENÇÃO: Use 'flex' aqui
    loginContainer.style.alignItems = 'center';
    loginContainer.style.justifyContent = 'center';
  }
  
  if(typeof toReg === 'function') toReg();
}

function scrollToFeatures() {
  document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
}

// Inicializador Automático
(async function initHome() {
  // 1. Injeta o CSS da Home na página
  document.head.insertAdjacentHTML('beforeend', homeStyles);

  // 2. Aguarda um milissegundo para garantir que o db do Supabase carregou do app.js
  setTimeout(async () => {
    try {
      if (typeof db !== 'undefined') {
        const { data: { session } } = await db.auth.getSession();
        
        // Se NÃO estiver logado, mostramos a Home e escondemos a tela de login
        if (!session) {
          const loginWrap = document.getElementById('login-wrap');
          if (loginWrap) loginWrap.style.display = 'none';
          
          document.body.insertAdjacentHTML('afterbegin', homeHTML);
        }
      }
    } catch (e) {
      console.log("Supabase verificando sessão falhou ou offline.");
    }
  }, 100);
})();