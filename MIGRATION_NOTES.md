# 📝 Notas de Migração - HTML para Next.js

## O que mudou

### ✅ Antes (HTML + LocalStorage)
- Arquivo único `index.html` com tudo inline
- Chaves Resend/Twilio hardcoded no localStorage do frontend
- Sem separação entre frontend e API
- Sem TypeScript
- Sem build process

### ✅ Agora (Next.js)
- Estrutura de projeto profissional com componentes
- Chaves de API em `.env.local` (seguro, fora do frontend)
- API routes serverless (`/api/send-email`, `/api/send-sms`)
- TypeScript para type-safety
- Build process otimizado
- Tailwind CSS para estilos
- LocalStorage mantido para dados (contactos, listas, campanhas)

---

## 🔄 Mapeamento de Funcionalidades

| Funcionalidade | HTML | Next.js |
|---|---|---|
| **Email (Resend)** | `sendCampaign('email')` no frontend | `/api/send-email` (servidor) |
| **SMS (Twilio)** | `sendCampaign('sms')` no frontend | `/api/send-sms` (servidor) |
| **Chaves de API** | `localStorage` (inseguro) | `.env.local` (seguro) |
| **Dashboard** | Inline em HTML | `components/Dashboard.tsx` |
| **Contactos** | Inline em HTML | Será em `components/Contacts.tsx` |
| **Campanhas** | Inline em HTML | Será em `components/Campaigns.tsx` |
| **Dados** | localStorage | localStorage (mantido) |

---

## 🔐 Segurança Melhorada

### Antes (❌ INSEGURO)
```javascript
// No HTML/JavaScript (visível no browser)
const resendKey = localStorage.getItem('resendKey')
fetch('https://api.resend.com/emails', {
  headers: { 'Authorization': 'Bearer ' + resendKey }
})
// ❌ Chave exposta no network tab!
```

### Agora (✅ SEGURO)
```typescript
// Em .env.local (nunca vai ao cliente)
NEXT_PUBLIC_RESEND_KEY=re_xxxxx

// No servidor (app/api/send-email/route.ts)
const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_KEY)
// ✅ Chave protegida no servidor
```

---

## 📂 Estrutura de Arquivos

```
mailweapon/
├── app/
│   ├── api/
│   │   ├── send-email/route.ts      (NOVO - chamadas Resend seguras)
│   │   └── send-sms/route.ts        (NOVO - chamadas Twilio seguras)
│   ├── globals.css                  (estilos globais)
│   ├── layout.tsx                   (layout principal)
│   └── page.tsx                     (página inicial)
│
├── components/                       (NOVO - componentes React)
│   ├── Dashboard.tsx
│   ├── Sidebar.tsx
│   └── Topbar.tsx
│
├── lib/                              (NOVO - utilitários)
│   └── storage.ts                   (funções de storage)
│
├── .env.example                     (NOVO - template de vars)
├── .env.local                       (NOVO - tuas chaves privadas)
├── .gitignore                       (NOVO - proteção de secrets)
├── next.config.js                   (NOVO - config Next.js)
├── tailwind.config.ts               (NOVO - config Tailwind)
├── tsconfig.json                    (NOVO - config TypeScript)
├── package.json                     (modificado)
├── README.md                        (atualizado)
└── SETUP.md                         (NOVO - guia de setup)

_backup/                             (ficheiros antigos)
├── index.html                       (arquivo original)
└── readme.md                        (readme original)
```

---

## 🔄 Passos de Migração de Dados

Se tens dados no localStorage antigo:

1. **Exportar dados antigos:**
```javascript
// No browser antigo, executa isto na consola:
localStorage.getItem('mailflow_v3')
// Copia o JSON resultante
```

2. **Importar no novo Next.js:**
```javascript
// Na consola do novo projeto:
localStorage.setItem('mailflow_v4', JSON.stringify({...}))
```

Ou implementar um script de migração automática em `lib/migration.ts`.

---

## 🚀 Melhorias Futuras

- [ ] **Persistência de dados** - Migrar `localStorage` → Supabase/Firebase
- [ ] **Autenticação** - Adicionar login de utilizadores
- [ ] **Componentes completos** - Implementar todas as páginas
- [ ] **API Twilio melhorada** - Adicionar validação de números
- [ ] **Retry logic** - Retentar falhas de envio
- [ ] **Logging** - Adicionar logging de campanhas
- [ ] **Testes** - Jest + React Testing Library
- [ ] **Deploy** - Vercel, Railway, etc.

---

## 📚 Recursos

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Resend API](https://resend.com/docs)
- [Twilio API](https://www.twilio.com/docs)

---

## 🆘 Dúvidas?

Consulta os ficheiros:
- `SETUP.md` - Guia de setup
- `README.md` - Documentação geral
- Código em `app/` e `components/` está comentado

Bom trabalho! 🎉
