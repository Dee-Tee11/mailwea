import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

const accountSid = process.env.NEXT_PUBLIC_TWILIO_SID
const authToken = process.env.NEXT_PUBLIC_TWILIO_TOKEN

const client = twilio(accountSid, authToken)

export async function POST(request: NextRequest) {
  try {
    const { to, body, from } = await request.json()

    if (!to || !body) {
      return NextResponse.json(
        { error: 'Missing required fields: to, body' },
        { status: 400 }
      )
    }

    const message = await client.messages.create({
      body,
      from: from || process.env.NEXT_PUBLIC_TWILIO_FROM,
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
