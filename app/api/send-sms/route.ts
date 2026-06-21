import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

export async function POST(request: NextRequest) {
  try {
    const accountSid = process.env.TWILIO_SID
    const authToken = process.env.TWILIO_TOKEN

    if (!accountSid || !authToken) {
      return NextResponse.json(
        { error: 'TWILIO_SID ou TWILIO_TOKEN não estão configurados no servidor' },
        { status: 500 }
      )
    }

    const client = twilio(accountSid, authToken)

    const { to, body, from } = await request.json()

    if (!to || !body) {
      return NextResponse.json(
        { error: 'Missing required fields: to, body' },
        { status: 400 }
      )
    }

    const message = await client.messages.create({
      body,
      from: from || process.env.TWILIO_FROM,
      to,
    })

    return NextResponse.json({ sid: message.sid })
  } catch (error) {
    console.error('SMS error:', error)
    return NextResponse.json(
      { error: 'Failed to send SMS' },
      { status: 500 }
    )
  }
}