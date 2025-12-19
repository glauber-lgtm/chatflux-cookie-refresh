/**
 * Script para fazer login no ChatFlux e obter o cookie
 * Usado pelo GitHub Actions para renovar automaticamente
 */

const { chromium } = require('playwright');
const fs = require('fs');

const LOGIN_URL = 'https://alpha.chatflux.ai/app/sign_in';

async function getCookie() {
  console.log('🚀 Iniciando o navegador...');
  
  const browser = await chromium.launch({
    headless: true,
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  });
  
  const page = await context.newPage();

  try {
    const email = process.env.CHATFLUX_EMAIL;
    const password = process.env.CHATFLUX_PASSWORD;
    
    if (!email || !password) {
      throw new Error('CHATFLUX_EMAIL e CHATFLUX_PASSWORD são obrigatórios!');
    }
    
    console.log('📧 Email configurado:', email.substring(0, 3) + '***' + email.substring(email.indexOf('@')));

    // 1. Ir para a página de login
    console.log('📄 Acessando página de login...');
    await page.goto(LOGIN_URL, { waitUntil: 'networkidle' });
    console.log('✅ Página carregada. URL:', page.url());
    
    // 2. Preencher EMAIL (login em 2 etapas)
    console.log('🔑Preenchendo credenciais...');
    console.log('   Preenchendo email...');
    await page.waitForSelector('#email_field', { timeout: 15000 });
    await page.fill('#email_field', email);
    
    // Clicar no botão para avançar
    console.log('   Avançando para próxima etapa...');
    await page.click('input.btn-primary');
    
    // 3. Aguardar campo de senha aparecer
    console.log('   Aguardando campo de senha...');
    await page.waitForSelector('input[type="password"]', { state: 'visible', timeout: 15000 });
    console.log('   ✅ Campo de senha visível!');
    
    // 4. Preencher SENHA
    console.log('   Preenchendo senha...');
    await page.fill('input[type="password"]', password);
    
    // 5. Submeter login
    console.log('🔓 Fazendo login...');
    await page.click('input.btn-primary');
    
    // 6. Aguardar login completar
    console.log('⏳ Aguardando login...');
    await page.waitForTimeout(5000);
    
    const currentUrl = page.url();
    console.log('📍 URL após login:', currentUrl);
    
    // Verificar se ainda está na página de login
    if (currentUrl.includes('sign_in') || currentUrl.includes('login')) {
      await page.screenshot({ path: 'error-screenshot.png' });
      console.log('📸 Captura de tela salva em error-screenshot.png');
      throw new Error('Login falhou - ainda na página de login');
    }
    
    // 7. Obter cookies
    console.log('🍪 Obtendo cookies...');
    const cookies = await context.cookies();
    
    // Formatar como string
    const cookieString = cookies
      .map(c => `${c.name}=${c.value}`)
      .join('; ');
    
    // Verificar cookies importantes
    const sessionCookie = cookies.find(c => c.name === '_chatflux_app_session');
    if (!sessionCookie) {
      console.log('⚠️ Cookies disponíveis:', cookies.map(c => c.name).join(', '));
      throw new Error('Cookie _chatflux_app_session não encontrado!');
    }
    
    console.log('✅ Cookie obtido com sucesso!');
    console.log(`📏 Tamanho: ${cookieString.length} caracteres`);
    
    // Salvar em arquivo
    fs.writeFileSync('cookie.txt', cookieString);
    console.log('💾 Cookie salvo em cookie.txt');
    
    return cookieString;
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    
    // Tirar screenshot para debug
    try {
      await page.screenshot({ path: 'error-screenshot.png' });
      console.log('📸 Captura de tela salva em error-screenshot.png');
    } catch (e) {
      console.log('   Não foi possível salvar screenshot');
    }
    
    throw error;
    
  } finally {
    await browser.close();
  }
}

// Executar
getCookie()
  .then(() => {
    console.log('🎉 Script finalizado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Falha:', error.message);
    process.exit(1);
  });
