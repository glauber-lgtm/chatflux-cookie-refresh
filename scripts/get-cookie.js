/**
 * Script para fazer login no ChatFlux e obter o cookie
 * Usado pelo GitHub Actions para renovar automaticamente
 */

const { chromium } = require('playwright');
const fs = require('fs');

const CHATFLUX_URL = 'https://alpha.chatflux.ai';
const WORKSPACE_ID = 'Dd8F3m';

async function getCookie() {
  console.log('🚀 Iniciando browser...');
  
  const browser = await chromium.launch({
    headless: true,
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  
  const page = await context.newPage();

  try {
    // 1. Ir para a página de login
    console.log('📄 Acessando página de login...');
    await page.goto(`${CHATFLUX_URL}/login`, { waitUntil: 'networkidle' });
    
    // 2. Preencher credenciais
    console.log('🔑 Preenchendo credenciais...');
    
    const email = process.env.CHATFLUX_EMAIL;
    const password = process.env.CHATFLUX_PASSWORD;
    
    if (!email || !password) {
      throw new Error('CHATFLUX_EMAIL e CHATFLUX_PASSWORD são obrigatórios!');
    }
    
    // Aguardar campos de login aparecerem
    await page.waitForSelector('input[type="email"], input[name="email"], input[placeholder*="email"]', { timeout: 10000 });
    
    // Preencher email
    const emailInput = await page.$('input[type="email"]') || 
                       await page.$('input[name="email"]') || 
                       await page.$('input[placeholder*="email"]');
    if (emailInput) {
      await emailInput.fill(email);
    }
    
    // Preencher senha
    const passwordInput = await page.$('input[type="password"]') || 
                          await page.$('input[name="password"]');
    if (passwordInput) {
      await passwordInput.fill(password);
    }
    
    // 3. Clicar no botão de login
    console.log('🔓 Fazendo login...');
    
    const loginButton = await page.$('button[type="submit"]') ||
                        await page.$('button:has-text("Login")') ||
                        await page.$('button:has-text("Entrar")') ||
                        await page.$('input[type="submit"]');
    
    if (loginButton) {
      await loginButton.click();
    }
    
    // 4. Aguardar redirecionamento após login
    console.log('⏳ Aguardando login...');
    await page.waitForURL(`**/${WORKSPACE_ID}/**`, { timeout: 30000 }).catch(() => {
      // Se não redirecionar para workspace, tentar aguardar qualquer mudança de URL
      return page.waitForNavigation({ timeout: 30000 });
    });
    
    // 5. Aguardar um pouco para cookies serem setados
    await page.waitForTimeout(3000);
    
    // 6. Obter cookies
    console.log('🍪 Obtendo cookies...');
    const cookies = await context.cookies();
    
    // Procurar o cookie de sessão
    const sessionCookie = cookies.find(c => c.name === '_chatflux_app_session');
    
    if (!sessionCookie) {
      console.log('Cookies disponíveis:', cookies.map(c => c.name));
      throw new Error('Cookie _chatflux_app_session não encontrado!');
    }
    
    // Formatar cookie
    const cookieString = `_chatflux_app_session=${sessionCookie.value}`;
    
    console.log('✅ Cookie obtido com sucesso!');
    console.log(`📏 Tamanho: ${cookieString.length} caracteres`);
    
    // Salvar em arquivo para o próximo step
    fs.writeFileSync('cookie.txt', cookieString);
    
    // Também exportar como output do GitHub Actions
    const outputFile = process.env.GITHUB_OUTPUT;
    if (outputFile) {
      fs.appendFileSync(outputFile, `cookie=${cookieString}\n`);
    }
    
    return cookieString;
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    
    // Tirar screenshot para debug
    await page.screenshot({ path: 'error-screenshot.png' });
    console.log('📸 Screenshot salvo em error-screenshot.png');
    
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
    console.error('💥 Falha:', error);
    process.exit(1);
  });

