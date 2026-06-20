#!/bin/bash
# Quick Start Script for MailFlow Next.js

echo "🚀 MailFlow Next.js - Quick Start"
echo "=================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local não existe!"
    echo ""
    echo "📋 Passos:"
    echo "1. Copia o ficheiro .env.example para .env.local:"
    echo "   cp .env.example .env.local"
    echo ""
    echo "2. Edita .env.local e preenche as chaves:"
    echo "   - NEXT_PUBLIC_RESEND_KEY (de https://resend.com/api-keys)"
    echo "   - NEXT_PUBLIC_TWILIO_SID (de https://console.twilio.com)"
    echo "   - NEXT_PUBLIC_TWILIO_TOKEN"
    echo "   - NEXT_PUBLIC_TWILIO_FROM"
    echo ""
    echo "3. Depois executa: npm run dev"
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Instalando dependências..."
    npm install
    echo ""
fi

echo "✅ Ambiente pronto!"
echo ""
echo "🌐 Iniciando servidor..."
echo "   → http://localhost:3000"
echo ""
npm run dev
