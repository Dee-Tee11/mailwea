#!/usr/bin/env python3
"""
Quick Start Checklist for MailFlow Next.js
"""

CHECKLIST = """
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║                    ✅ MAILFLOW NEXT.JS - QUICK START CHECKLIST                ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝

📋 PASSOS PARA COMEÇAR:

1️⃣  SETUP INICIAL
   ☐ Ficheiro .env.local já criado (vê em: /home/deetee/Documentos/Projetos/mailweapon/)
   ☐ Dependências já instaladas (npm install ✅ feito)
   ☐ Build do projeto testado (npm run build ✅ sucesso)

2️⃣  PREENCHER VARIÁVEIS DE AMBIENTE
   Edita o ficheiro: .env.local
   
   Resend (Email):
   ☐ Vai a https://resend.com/api-keys
   ☐ Cria uma nova API Key
   ☐ Copia a chave (começa com "re_")
   ☐ Cola em .env.local: NEXT_PUBLIC_RESEND_KEY=re_...
   ☐ Preenche também: NEXT_PUBLIC_RESEND_FROM=seu@dominio.com
   
   Twilio (SMS):
   ☐ Vai a https://console.twilio.com
   ☐ Encontra Account SID (começa com "AC")
   ☐ Encontra Auth Token
   ☐ Vai a Phone Numbers para obter o teu número (+XXX...)
   ☐ Cola em .env.local os 3 valores

3️⃣  TESTAR LOCALMENTE
   ☐ Terminal aberto na pasta do projeto
   ☐ Executa: npm run dev
   ☐ Abre: http://localhost:3000
   ☐ Vê o Dashboard carregado

4️⃣  VERIFICAR CHAVES
   ☐ Clica em ⚙️ (Configurações) no menu lateral
   ☐ Vê se as chaves aparecem (devem estar preenchidas do .env.local)
   ☐ Status mostra: 🟢 Configurado (em verde)

5️⃣  PRÓXIMOS PASSOS
   ☐ Implementar componentes de Contactos
   ☐ Implementar componentes de Listas
   ☐ Implementar componentes de Campanhas
   ☐ Testar envio de emails
   ☐ Testar envio de SMS
   ☐ Migrar de localStorage → Base de Dados (opcional)

═══════════════════════════════════════════════════════════════════════════════

📁 FICHEIROS IMPORTANTES:

Editar:
→ .env.local         Aqui vai TUDO: chaves Resend, chaves Twilio

Ler (Documentação):
→ README.md          Documentação geral do projeto
→ SETUP.md           Guia passo-a-passo detalhado
→ MIGRATION_NOTES.md O que mudou do HTML para Next.js
→ CONVERSAO_SUMMARY.md Resumo completo da conversão

Código:
→ app/page.tsx                  Página principal
→ app/api/send-email/route.ts  API para enviar emails (Resend)
→ app/api/send-sms/route.ts    API para enviar SMS (Twilio)
→ components/                   Componentes React

═══════════════════════════════════════════════════════════════════════════════

🔒 SEGURANÇA - LEMBRETE IMPORTANTE:

✅ Ficheiros seguros (OK committar):
   - Tudo exceto .env.local
   - .gitignore protege automaticamente

❌ NUNCA commitar:
   - .env.local (contém chaves privadas)
   - Passwords, tokens, secrets

═══════════════════════════════════════════════════════════════════════════════

🚀 COMANDO RÁPIDO:

cd /home/deetee/Documentos/Projetos/mailweapon && npm run dev

Depois abre: http://localhost:3000

═══════════════════════════════════════════════════════════════════════════════

❓ TEM DÚVIDAS?

1. Lê SETUP.md (guia detalhado)
2. Lê README.md (documentação)
3. Verifica que .env.local está preenchido
4. Reinicia o servidor (Ctrl+C e npm run dev novamente)

═══════════════════════════════════════════════════════════════════════════════

✨ BOA SORTE! 🎉

Projeto MailFlow convertido com sucesso para Next.js!
Chaves de API seguras em .env.local ✅
Pronto para desenvolveres! 🚀
"""

if __name__ == '__main__':
    print(CHECKLIST)
