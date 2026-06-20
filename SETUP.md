# 🚀 Guia de Setup - MailFlow Next.js

## ✅ O que foi feito

Convertemos o seu projeto MailFlow HTML para **Next.js** com variáveis de ambiente para as chaves de API. Agora as chaves Resend e Twilio ficam seguras em `.env.local` e NÃO no código frontend.

## 📋 Passos para Começar

### 1️⃣ Copiar e Preencher o .env.local

O arquivo `.env.local` é onde você adiciona as chaves privadas. Ele **NÃO é commitado** (vê o `.gitignore`).

```bash
cd /home/deetee/Documentos/Projetos/mailweapon
cp .env.example .env.local
```

Edita o `.env.local`:
```env
# Resend API (para Email)
NEXT_PUBLIC_RESEND_KEY=re_seu_key_aqui
NEXT_PUBLIC_RESEND_FROM=seu@dominio.com

# Twilio (para SMS)
NEXT_PUBLIC_TWILIO_SID=AC_seu_account_sid
NEXT_PUBLIC_TWILIO_TOKEN=seu_auth_token
NEXT_PUBLIC_TWILIO_FROM=+351XXXXXXXXX
```

### 2️⃣ Obter as Chaves

#### **Resend (Email)**
1. Vai a https://resend.com/api-keys
2. Clica em "Create API Key"
3. Seleciona o domínio (ou usa `onboarding@resend.dev` para testes)
4. Copia a chave começada em `re_...`
5. Cola no `.env.local` na variável `NEXT_PUBLIC_RESEND_KEY`

#### **Twilio (SMS)**
1. Vai a https://console.twilio.com
2. Na seção **Account Info** encontras:
   - **Account SID** - começa com `AC...`
   - **Auth Token** - token privado
3. Vai a **Phone Numbers** > **Manage Numbers** para obter o teu número Twilio (começa com `+`)
4. Cola os valores no `.env.local`:
   ```env
   NEXT_PUBLIC_TWILIO_SID=AC_seu_sid
   NEXT_PUBLIC_TWILIO_TOKEN=seu_token
   NEXT_PUBLIC_TWILIO_FROM=+351912345678
   ```

### 3️⃣ Executar o Projeto

```bash
npm run dev
```

Abre http://localhost:3000 no navegador.

### 4️⃣ Primeiro Teste

1. Vai a **Configurações** (⚙️) no menu lateral
2. Cola as chaves nos respetivos campos
3. Verifica se as chaves aparecem com status ✅ verde

## 🏗️ Estrutura do Projeto

```
mailweapon/
├── app/
│   ├── api/
│   │   ├── send-email/route.ts      ← API para enviar emails
│   │   └── send-sms/route.ts        ← API para enviar SMS
│   ├── layout.tsx                   ← Layout principal
│   ├── page.tsx                     ← Página inicial
│   └── globals.css                  ← Estilos globais
├── components/
│   ├── Dashboard.tsx                ← Dashboard
│   ├── Sidebar.tsx                  ← Menu lateral
│   └── Topbar.tsx                   ← Barra superior
├── lib/
│   └── storage.ts                   ← Funções de storage (localStorage)
├── .env.example                     ← Exemplo de variáveis
├── .env.local                       ← SUAS CHAVES (não commitar!)
├── package.json
└── README.md
```

## 🔒 Segurança

⚠️ **IMPORTANTE**:
- ✅ `.env.local` está no `.gitignore` - seguro!
- ✅ Chaves de API não aparecem no código
- ✅ Nunca fazer commit do `.env.local`
- ✅ Usar `NEXT_PUBLIC_` apenas para valores públicos

## 🚀 Próximos Passos (Componentes a Implementar)

- [ ] **Contactos** - Adicionar/Editar/Eliminar contactos
- [ ] **Listas** - Gestão de listas de distribuição
- [ ] **Campanhas** - Criar e enviar campanhas
- [ ] **Importação CSV** - Importar contactos de ficheiros
- [ ] **UI Completa** - Todos os componentes visuais
- [ ] **Base de Dados** - Migrar localStorage → Supabase/Firebase (opcional)

## 💻 Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar servidor de produção
npm run start

# Linting
npm run lint
```

## 🐛 Troubleshooting

### Erro: "NEXT_PUBLIC_RESEND_KEY is not set"
- Certifica-te que criaste o `.env.local`
- Reinicia o servidor (`npm run dev`)

### Erro: "Cannot find module 'next'"
- Executa `npm install`

### Dados não aparecem
- Abre DevTools (F12) → Storage → LocalStorage
- Verifica se há dados em `mailflow_v4`

## ❓ Dúvidas

Para mais informações:
- Next.js: https://nextjs.org/docs
- Resend: https://resend.com/docs
- Twilio: https://www.twilio.com/docs

---

**Bom desenvolvimento! 🎉**
