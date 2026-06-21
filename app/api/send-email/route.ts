import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.RESEND_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'RESEND_KEY não está configurada no servidor' },
        { status: 500 }
      )
    }

    const resend = new Resend(apiKey)

    const { to, subject, html, from } = await request.json()

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      )
    }

    const response = await resend.emails.send({
      from: from || process.env.RESEND_FROM || 'onboarding@resend.dev',
      to,
      subject,
      html,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Email error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}