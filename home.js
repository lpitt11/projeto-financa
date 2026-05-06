/* ===========================
   FINTRACK — home.js
   Landing Page / Home - Futurista & Imersiva
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

  @keyframes moveGrid {
    0% { background-position: 0 0; }
    100% { background-position: 0 50px; }
  }

  /* --- ESTILOS GERAIS --- */
  .home-wrap {
    background: transparent; /* O fundo agora é o canvas */
    color: #f5f5f5;
    font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
    position: relative;
    z-index: 1000;
  }

  /* Brilho de fundo pulsante */
  .glow-bg {
    position: absolute;
    top: -10%; left: 50%; transform: translateX(-50%);
    width: 800px; height: 800px;
    background: radial-gradient(circle, rgba(43, 111, 255, 0.15) 0%, rgba(168, 85, 247, 0.05) 40%, rgba(8, 8, 8, 0) 70%);
    z-index: -1;
    pointer-events: none;
    animation: pulseGlow 4s infinite alternate ease-in-out;
  }

  /* Grade Holográfica no Chão */
  .cyber-grid {
    position: absolute;
    bottom: 0; left: -50%;
    width: 200%; height: 60vh;
    background-image:
      linear-gradient(rgba(43, 111, 255, 0.2) 1px, transparent 1px),
      linear-gradient(90deg, rgba(43, 111, 255, 0.2) 1px, transparent 1px);
    background-size: 50px 50px;
    transform: perspective(600px) rotateX(75deg);
    transform-origin: bottom;
    animation: moveGrid 2s linear infinite;
    z-index: -2;
    pointer-events: none;
    mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
    -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
  }

  .home-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 8%;
    position: sticky;
    top: 0;
    background: rgba(8, 8, 8, 0.6);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    z-index: 1100;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .home-logo { display: flex; align-items: center; gap: 12px; }
  .home-nav { display: flex; gap: 15px; }

  /* --- BOTÕES COM EFEITOS NEON --- */
  .btn-home-login {
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 10px 22px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(5px);
  }

  .btn-home-login:hover {
    color: #2b6fff;
    border-color: #2b6fff;
    background: rgba(43, 111, 255, 0.1);
    box-shadow: 0 0 20px rgba(43, 111, 255, 0.4);
    transform: translateY(-2px);
  }

  .btn-home-primary {
    background: linear-gradient(135deg, #2b6fff, #a855f7);
    color: white;
    border: none;
    padding: 10px 22px;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba(168, 85, 247, 0.4);
  }

  .btn-home-primary:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 8px 30px rgba(43, 111, 255, 0.6);
    filter: brightness(1.2);
  }

  .btn-lg { padding: 14px 32px; font-size: 16px; }

  /* --- HERO SECTION --- */
  .hero {
    padding: 120px 8% 80px;
    text-align: center;
    max-width: 1100px;
    margin: 0 auto;
    position: relative;
    z-index: 10;
  }

  .hero-badge { animation: fadeInUp 0.8s ease both; animation-delay: 0.1s; }
  .hero-title { animation: fadeInUp 0.8s ease both; animation-delay: 0.2s; }
  .hero-subtitle { animation: fadeInUp 0.8s ease both; animation-delay: 0.3s; }
  .hero-actions { animation: fadeInUp 0.8s ease both; animation-delay: 0.4s; }
  
  .hero-badge {
    display: inline-block;
    padding: 6px 15px;
    background: rgba(168, 85, 247, 0.15);
    border: 1px solid rgba(168, 85, 247, 0.3);
    border-radius: 99px;
    color: #d8b4fe;
    font-size: 12px;
    font-weight: 700;
    margin-bottom: 24px;
    text-transform: uppercase;
    letter-spacing: 1px;
    box-shadow: 0 0 15px rgba(168, 85, 247, 0.2);
  }

  .hero-title {
    font-size: clamp(40px, 8vw, 72px);
    font-weight: 800;
    letter-spacing: -2px;
    margin-bottom: 24px;
    line-height: 1.05;
    text-shadow: 0 10px 30px rgba(0,0,0,0.8);
  }

  .hero-title span {
    background: linear-gradient(90deg, #2b6fff, #a855f7, #f43f5e);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 0 20px rgba(168, 85, 247, 0.4));
    animation: shineText 3s linear infinite;
  }

  @keyframes shineText {
    to { background-position: 200% center; }
  }

  .hero-subtitle {
    font-size: 19px;
    color: #aaa;
    margin-bottom: 48px;
    max-width: 650px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.6;
    text-shadow: 0 2px 10px rgba(0,0,0,0.8);
  }

  .hero-actions { display: flex; gap: 20px; justify-content: center; margin-bottom: 80px; }

  /* Container para o efeito 3D do Mockup */
  .mockup-wrapper {
    perspective: 1200px;
    animation: fadeInUp 1s ease both; animation-delay: 0.5s;
  }

  .hero-mockup {
    background: rgba(15, 15, 15, 0.8);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 24px;
    padding: 12px;
    box-shadow: 0 30px 60px -15px rgba(0,0,0,0.9), 0 0 30px rgba(43, 111, 255, 0.2);
    max-width: 900px;
    margin: 0 auto;
    transition: transform 0.1s ease-out; /* Rápido para acompanhar o mouse */
    transform-style: preserve-3d;
  }

  /* Elementos internos do mockup "saltando" em 3D */
  .mock-inner {
    background: #080808;
    height: 450px;
    border-radius: 14px;
    display: flex;
    overflow: hidden;
    position: relative;
    transform: translateZ(30px); /* Pula pra fora do vidro */
  }

  .mock-sidebar { width: 70px; background: #0f0f0f; border-right: 1px solid #1a1a1a; }
  .mock-content { flex: 1; padding: 30px; display: flex; flex-direction: column; gap: 20px; }
  .mock-header { height: 40px; width: 40%; background: #151515; border-radius: 8px; }
  .mock-main-card { height: 120px; background: linear-gradient(135deg, rgba(43,111,255,0.1) 0%, rgba(168,85,247,0.05) 100%); border: 1px solid rgba(43,111,255,0.3); border-radius: 12px; box-shadow: 0 0 20px rgba(43, 111, 255, 0.1);}
  .mock-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
  .mock-item { height: 80px; background: #151515; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05);}

  /* --- FEATURES --- */
  .features { padding: 100px 8%; background: transparent; position: relative; z-index: 10; }
  .section-tag { color: #a855f7; font-weight: 800; text-transform: uppercase; font-size: 13px; text-align: center; display: block; margin-bottom: 10px; letter-spacing: 2px;}
  .section-title { text-align: center; font-size: 36px; font-weight: 800; margin-bottom: 64px; letter-spacing: -1px; text-shadow: 0 2px 10px rgba(0,0,0,0.8);}

  .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 32px; }

  .feature-card {
    background: rgba(15, 15, 15, 0.6);
    backdrop-filter: blur(10px);
    padding: 40px;
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.05);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .feature-card:hover {
    background: rgba(20, 20, 20, 0.8);
    border-color: #2b6fff;
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0,0,0,0.6), 0 0 25px rgba(43, 111, 255, 0.2);
  }

  .f-icon { 
    width: 50px; height: 50px; background: linear-gradient(135deg, rgba(43,111,255,0.2), rgba(168,85,247,0.2)); 
    border-radius: 12px; display: flex; align-items: center; justify-content: center;
    font-size: 24px; margin-bottom: 24px; color: #fff;
    transition: transform 0.3s ease;
    border: 1px solid rgba(168, 85, 247, 0.3);
  }

  .feature-card:hover .f-icon { transform: scale(1.1) rotate(5deg); box-shadow: 0 0 15px rgba(168, 85, 247, 0.5); }
  .feature-card h3 { margin-bottom: 16px; font-size: 20px; font-weight: 700; }
  .feature-card p { color: #aaa; line-height: 1.7; font-size: 15px; }

  /* --- FOOTER CTA --- */
  .cta-bottom {
    padding: 120px 8%;
    text-align: center;
    background: radial-gradient(circle at center, rgba(168, 85, 247, 0.1) 0%, transparent 70%);
    position: relative;
    z-index: 10;
  }

  .cta-bottom h2 { font-size: clamp(32px, 5vw, 48px); font-weight: 800; margin-bottom: 20px; }
  .cta-bottom p { color: #aaa; margin-bottom: 40px; font-size: 18px; }

  .home-footer {
    padding: 60px 8% 40px;
    border-top: 1px solid rgba(255,255,255,0.05);
    text-align: center;
    color: #666;
    font-size: 14px;
    position: relative;
    z-index: 10;
    background: rgba(8,8,8,0.8);
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
<canvas id="warp-canvas" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: -3; pointer-events: none; background: #040406;"></canvas>

<div id="home-landing" class="home-wrap">
  <div class="glow-bg"></div>
  <div class="cyber-grid"></div>

  <header class="home-header">
    <div class="home-logo">
      <div class="logo-mark" style="width: 30px; height: 30px; background: linear-gradient(135deg, #2b6fff, #a855f7); border-radius: 7px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);">
        <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; stroke: white; fill: none; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round;"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
      </div>
      <span class="logo-name" style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">FinTrack</span>
    </div>
    <nav class="home-nav">
      <button class="btn-home-login" onclick="showLoginFromHome()">Entrar</button>
      <button class="btn-home-primary" onclick="showRegisterFromHome()">Inicie a Viagem</button>
    </nav>
  </header>

  <main>
    <section class="hero">
      <span class="hero-badge">Sua jornada para o próximo nível</span>
      <h1 class="hero-title">Controle seu dinheiro em <span>outra dimensão</span>.</h1>
      <p class="hero-subtitle">FinTrack une design cyberpunk imersivo e IA financeira para projetar seu sucesso. Gerencie, analise e conquiste suas metas na velocidade da luz.</p>
      
      <div class="hero-actions">
        <button class="btn-home-primary btn-lg" onclick="showRegisterFromHome()">Criar minha conta gratuita</button>
        <button class="btn-home-login btn-lg" onclick="scrollToFeatures()">Explorar sistema</button>
      </div>

      <div class="mockup-wrapper">
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
      </div>
    </section>

    <section id="features" class="features">
      <span class="section-tag">Tecnologia Elite</span>
      <h2 class="section-title">O arsenal completo para suas finanças</h2>
      
      <div class="features-grid">
        <div class="feature-card">
          <div class="f-icon">📊</div>
          <h3>Dashboard Holográfico</h3>
          <p>Visão imersiva dos seus números. Entenda para onde vai o seu fluxo de caixa em instantes.</p>
        </div>
        <div class="feature-card">
          <div class="f-icon">🎯</div>
          <h3>Trajetória de Metas</h3>
          <p>Fixe seus alvos no horizonte e deixe nosso algoritmo calcular a rota mais rápida até eles.</p>
        </div>
        <div class="feature-card">
          <div class="f-icon">🌍</div>
          <h3>Radar Global</h3>
          <p>Conecte-se ao mercado mundial. Dólar, Euro e Criptomoedas atualizados em tempo real.</p>
        </div>
        <div class="feature-card">
          <div class="f-icon">🛡️</div>
          <h3>Cofre Quântico</h3>
          <p>Proteção impenetrável via Supabase. Seus dados criptografados e acessíveis apenas por você.</p>
        </div>
        <div class="feature-card">
          <div class="f-icon">🤖</div>
          <h3>IA Assistente (PRO)</h3>
          <p>Um copiloto inteligente que analisa seus padrões de consumo e sugere melhorias financeiras.</p>
        </div>
        <div class="feature-card">
          <div class="f-icon">⚡</div>
          <h3>Velocidade Warp</h3>
          <p>Navegue entre receitas e despesas sem recarregar páginas. Fluidez total focada na sua experiência.</p>
        </div>
      </div>
    </section>

    <section class="cta-bottom">
      <h2>Pronto para assumir o controle da nave?</h2>
      <p>Junte-se à elite que já automatizou sua vida financeira com o FinTrack.</p>
      <button class="btn-home-primary btn-lg" onclick="showRegisterFromHome()">Iniciar Propulsores (Grátis)</button>
    </section>
  </main>

  <footer class="home-footer">
    <div class="home-logo" style="justify-content: center; margin-bottom: 20px; opacity: 0.3;">
      <div class="logo-mark" style="width: 24px; height: 24px; background: transparent; border: 1px solid #888; border-radius: 6px; display: flex; align-items: center; justify-content: center;">
        <svg viewBox="0 0 24 24" style="width: 12px; height: 12px; stroke: #888; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
      </div>
      <span class="logo-name" style="font-size: 16px;">FinTrack</span>
    </div>
    <p>&copy; 2026 FinTrack — Gestão Financeira. Rumo ao futuro.</p>
    <p>&copy; Desenvolvido por Lucas Pitt.</p>
  </footer>
</div>
`;

// ===========================
// FUNÇÕES E INTEGRAÇÃO
// ===========================

function showLoginFromHome() {
  const home = document.getElementById('home-landing');
  // Mantemos o canvas visível para o fundo do login ficar animal!
  if(home) home.style.display = 'none';
  
  const loginContainer = document.getElementById('login-wrap');
  if(loginContainer) {
    loginContainer.style.display = 'flex';
  }
  
  if(typeof toLgn === 'function') toLgn();
}

function showRegisterFromHome() {
  const home = document.getElementById('home-landing');
  if(home) home.style.display = 'none';
  
  const loginContainer = document.getElementById('login-wrap');
  if(loginContainer) {
    loginContainer.style.display = 'flex';
  }
  
  if(typeof toReg === 'function') toReg();
}

// NOVA FUNÇÃO PARA VOLTAR
function backToHome() {
  const home = document.getElementById('home-landing');
  const loginContainer = document.getElementById('login-wrap');
  
  if(loginContainer) loginContainer.style.display = 'none';
  if(home) home.style.display = 'block';
  
  // O canvas já estará rodando no fundo
}

// ===========================
// EFEITOS FUTURISTAS (CANVAS E 3D)
// ===========================

// 1. Efeito 3D no Mockup (Parallax)
function initMockupTilt() {
  const mockup = document.querySelector('.hero-mockup');
  if(!mockup) return;
  
  document.addEventListener('mousemove', (e) => {
    // Usa clientX e clientY para não pular ao fazer scroll na página
    const xAxis = (window.innerWidth / 2 - e.clientX) / 40;
    const yAxis = (window.innerHeight / 2 - e.clientY) / 40;
    
    // Aplica a rotação 3D sem caracteres de escape incorretos
    mockup.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
  });

  // Reseta quando sai da tela
  document.addEventListener('mouseleave', () => {
    mockup.style.transform = `rotateY(0deg) rotateX(0deg)`;
  });
}

// 2. Fundo Warp Speed (Estrelas / Dados voando em sua direção)
function initWarpDrive() {
  const canvas = document.getElementById('warp-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let w, h;
  let stars = [];
  let mouseX = 0;
  let mouseY = 0;
  let baseSpeed = 1.5;
  let warpSpeed = baseSpeed;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // Cria as partículas
  for (let i = 0; i < 400; i++) {
    stars.push({
      x: Math.random() * w - w / 2,
      y: Math.random() * h - h / 2,
      z: Math.random() * w,
      pz: 0
    });
  }

  // Interação do mouse (move o centro do warp)
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - w / 2) * 0.5;
    mouseY = (e.clientY - h / 2) * 0.5;
  });

  // Interação de Scroll (Acelera quando você rola a página)
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    warpSpeed = 20; // Ativa velocidade de dobra
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      warpSpeed = baseSpeed; // Volta ao normal
    }, 150);
  });

  // Loop de animação
  function draw() {
    // Rastro para dar efeito de velocidade
    ctx.fillStyle = 'rgba(4, 4, 6, 0.4)';
    ctx.fillRect(0, 0, w, h);
    
    ctx.translate(w / 2, h / 2); // Move o Ponto 0,0 pro centro
    
    for (let s of stars) {
      s.z -= warpSpeed; // Move a estrela no eixo Z
      
      // Se passou da tela, reseta lá no fundo
      if (s.z <= 0) {
        s.x = Math.random() * w - w / 2;
        s.y = Math.random() * h - h / 2;
        s.z = w;
        s.pz = s.z;
      }
      
      // Projeção 3D para 2D com deslocamento do mouse
      let sx = (s.x / s.z) * w + mouseX * (1 - s.z / w);
      let sy = (s.y / s.z) * h + mouseY * (1 - s.z / w);
      
      let px = (s.x / s.pz) * w + mouseX * (1 - s.pz / w);
      let py = (s.y / s.pz) * h + mouseY * (1 - s.pz / w);
      
      s.pz = s.z;
      
      // Desenha a linha (rastro de luz)
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(sx, sy);
      
      // Cor baseada na proximidade (Z) sem caracteres de escape incorretos
      const opacity = 1 - s.z / w;
      ctx.strokeStyle = `rgba(${43 + opacity*100}, ${111 - opacity*20}, ${255}, ${opacity})`;
      ctx.lineWidth = opacity * 3;
      ctx.stroke();
    }
    
    ctx.translate(-w / 2, -h / 2); // Reseta
    requestAnimationFrame(draw);
  }
  
  draw();
}

// Inicializador Automático
(async function initHome() {
  // 1. Injeta o CSS da Home na página
  document.head.insertAdjacentHTML('beforeend', homeStyles);

  // 2. Aguarda um momento para garantir que o db do Supabase carregou do app.js
  setTimeout(async () => {
    try {
      if (typeof db !== 'undefined') {
        const { data: { session } } = await db.auth.getSession();
        
        // Se NÃO estiver logado, mostramos a Home e escondemos a tela de login
        if (!session) {
          const loginWrap = document.getElementById('login-wrap');
          if (loginWrap) loginWrap.style.display = 'none';
          
          document.body.insertAdjacentHTML('afterbegin', homeHTML);
          
          // Inicia os efeitos futuristas apenas se estiver na Home
          initWarpDrive();
          initMockupTilt();
        }
      }
    } catch (e) {
      console.log("Supabase verificando sessão falhou ou offline.");
    }
  }, 100);
})();