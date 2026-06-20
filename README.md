# MailFlow — Email Marketing MVP

Uma aplicação Next.js para email marketing com integração de Resend (Email) e Twilio (SMS), com configuração segura via variáveis de ambiente.

## Características

- ✉️ Envio de emails com Resend
- 💬 Envio de SMS com Twilio
- 📊 Dashboard com estatísticas
- 👥 Gestão de contactos (Clientes/Equipa)
- 📋 Gestão de listas de distribuição
- 📧 Gestão de campanhas
- 🔐 Chaves de API configuradas via `.env.local`
- 💾 Dados persistidos no LocalStorage do navegador

## Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta Resend (para email)
- Conta Twilio (para SMS)

## Instalação

1. **Clonar/Abrir o projeto:**
```bash
cd /home/deetee/Documentos/Projetos/mailweapon
```

2. **Instalar dependências:**
```bash
npm install
```

3. **Configurar variáveis de ambiente:**

Copia o arquivo `.env.example` para `.env.local`:
```bash
cp .env.example .env.local
```

Edita `.env.local` e adiciona tuas chaves:
```env
# Resend API (para Email)
NEXT_PUBLIC_RESEND_KEY=re_your_key_here
NEXT_PUBLIC_RESEND_FROM=seu@dominio.com

# Twilio (para SMS)
NEXT_PUBLIC_TWILIO_SID=AC_seu_account_sid
NEXT_PUBLIC_TWILIO_TOKEN=seu_auth_token
NEXT_PUBLIC_TWILIO_FROM=+351XXXXXXXXX
```

## Como obter as chaves

### Resend (Email)
1. Acede a [https://resend.com/api-keys](https://resend.com/api-keys)
2. Cria uma nova API Key
3. Copia a chave e coloca no `.env.local`

### Twilio (SMS)
1. Acede a [https://console.twilio.com](https://console.twilio.com)
2. Vai a "Account" para encontrar:
   - Account SID
   - Auth Token
3. Vai a "Phone Numbers" para configurar um número (ou usa um número de teste)
4. Coloca os valores no `.env.local`

## Executar o projeto

### Desenvolvimento
```bash
npm run dev
```

A aplicação está disponível em [http://localhost:3000](http://localhost:3000)

### Build para produção
```bash
npm run build
npm run start
```

## Estrutura do Projeto

```
mailweapon/
├── app/
│   ├── api/
│   │   ├── send-email/      # Rota para enviar emails
│   │   └── send-sms/        # Rota para enviar SMS
│   ├── layout.tsx           # Layout principal
│   ├── page.tsx             # Página principal
│   └── globals.css          # Estilos globais
├── components/
│   ├── Dashboard.tsx        # Dashboard
│   ├── Sidebar.tsx          # Barra lateral
│   └── Topbar.tsx           # Barra superior
├── .env.example             # Exemplo de variáveis de ambiente
├── .env.local               # Variáveis de ambiente (não committar!)
├── package.json
├── tsconfig.json
├── next.config.js
└── tailwind.config.ts
```

## Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilos
- **Resend** - Envio de emails
- **Twilio** - Envio de SMS
- **LocalStorage** - Persistência de dados

## Dados

Os dados (contactos, campanhas, listas) são armazenados no **LocalStorage** do navegador. Isso significa:
- ✅ Funciona offline
- ✅ Sem servidor de base de dados necessário para MVP
- ⚠️ Dados são específicos do navegador/dispositivo
- ⚠️ Perdidos se limpar cache

Para persistência permanente, considere migrar para um banco de dados como Supabase, Firebase, ou PostgreSQL.

## Funcionalidades em Desenvolvimento

- [ ] Componentes de Contactos completos
- [ ] Componentes de Listas
- [ ] Componentes de Campanhas
- [ ] Página de Configurações
- [ ] Interface completa
- [ ] Testes

## Segurança

⚠️ **IMPORTANTE**: 
- NUNCA commit o arquivo `.env.local` (já está no `.gitignore`)
- As variáveis com `NEXT_PUBLIC_` são visíveis no cliente (use apenas para públicas)
- Considera usar chaves privadas para Twilio/Resend se possível

## Troubleshooting

### Erro: "NEXT_PUBLIC_RESEND_KEY is not set"
- Certifique-se de que `.env.local` existe e contém a chave
- Reinicia o servidor de desenvolvimento após adicionar variáveis

### Erro: "NEXT_PUBLIC_TWILIO_SID is not set"
- Mesma solução acima para Twilio

## Próximos Passos

1. Implementar todos os componentes da UI
2. Adicionar persistência de dados a um banco de dados
3. Implementar autenticação de utilizadores
4. Adicionar validação de emails
5. Melhorar tratamento de erros
6. Adicionar testes

## Licença

MIT
