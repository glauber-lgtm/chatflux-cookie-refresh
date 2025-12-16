# 🍪 ChatFlux Cookie Refresh

Automatiza a renovação do cookie do ChatFlux a cada 1 hora usando GitHub Actions.

## 🚀 Como usar

### 1. Faça fork deste repositório

### 2. Configure os Secrets no GitHub

Vá em **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Adicione estes secrets:

| Secret | Descrição |
|--------|-----------|
| `CHATFLUX_EMAIL` | Seu email de login no ChatFlux |
| `CHATFLUX_PASSWORD` | Sua senha do ChatFlux |
| `CLOUDFLARE_API_TOKEN` | Token da API do Cloudflare |
| `CLOUDFLARE_ACCOUNT_ID` | Account ID do Cloudflare |

### 3. Ative o GitHub Actions

Vá em **Actions** e ative os workflows.

### 4. Pronto!

O workflow vai rodar automaticamente a cada 1 hora e atualizar o cookie no Cloudflare Worker.

## 🔧 Configuração

### Mudar a frequência

Edite o arquivo `.github/workflows/refresh-cookie.yml`:

```yaml
schedule:
  - cron: '0 * * * *'  # A cada 1 hora
  # - cron: '*/30 * * * *'  # A cada 30 minutos
  # - cron: '0 */4 * * *'  # A cada 4 horas
```

### Rodar manualmente

Vá em **Actions** → **Refresh ChatFlux Cookie** → **Run workflow**

## 📝 Como funciona

1. ⏰ GitHub Actions inicia a cada 1 hora
2. 🌐 Playwright abre um browser headless
3. 🔐 Faz login no ChatFlux com suas credenciais
4. 🍪 Captura o cookie de sessão
5. ☁️ Atualiza o secret no Cloudflare Worker via API
6. ✅ Cookie renovado automaticamente!

## 🔒 Segurança

- Credenciais são armazenadas como GitHub Secrets (criptografados)
- O cookie nunca aparece nos logs
- O workflow roda em ambiente isolado

## 🐛 Debug

Se o workflow falhar:

1. Vá em **Actions** e clique no workflow que falhou
2. Veja os logs de cada step
3. Se houver erro de login, verifique:
   - Credenciais estão corretas?
   - O ChatFlux mudou a página de login?
   - Há captcha ou 2FA ativado?

