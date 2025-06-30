// pages/api/mpesa/callback.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Safaricom production IPs (verify these are current)
const SAFARICOM_IPS = [
  '196.201.214.200',
  '196.201.214.206',
  '196.201.213.114',
  '196.201.214.207',
  '196.201.214.208',
  '196.201.213.44',
  '196.201.212.127',
  '196.201.212.138',
  '196.201.212.129',
  '196.201.212.136',
  '196.201.212.74',
  '196.201.212.75'
] as const

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
    return res.status(200).end();
  }

  // Set CORS headers for all responses
  Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));

  // 1. Verify the request method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // 2. Get the client IP address
  const clientIp = Array.isArray(req.headers['x-forwarded-for']) 
    ? req.headers['x-forwarded-for'][0]
    : req.headers['x-forwarded-for'] || req.socket.remoteAddress

  // 3. Validate the request originates from Safaricom (in production)
  if (process.env.NODE_ENV === 'production' && clientIp) {
    if (!SAFARICOM_IPS.includes(clientIp as typeof SAFARICOM_IPS[number])) {
      console.warn(`Unauthorized callback attempt from IP: ${clientIp}`)
      return res.status(403).json({ error: 'Unauthorized' })
    }
  }

  try {
    // 4. Parse the callback data
    const callbackData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body

    // 5. Validate required fields
    if (!callbackData?.CheckoutRequestID || !callbackData?.ResultCode) {
      throw new Error('Invalid callback data')
    }

    // 6. Determine payment status
    const isSuccess = callbackData.ResultCode === '0'
    const status = isSuccess ? 'completed' : 'failed'

    // 7. Update payment in database
    const { data, error } = await supabase
      .from('payments')
      .update({
        status,
        mpesa_receipt: callbackData.MpesaReceiptNumber || null,
        raw_response: callbackData,
        verified_at: new Date().toISOString()
      })
      .eq('transaction_id', callbackData.CheckoutRequestID)
      .select()
      .single()

    if (error) throw error

    // 8. If this is a membership payment, activate membership
    if (isSuccess && data?.membership_id) {
      await supabase
        .from('memberships')
        .update({
          status: 'active',
          activated_at: new Date().toISOString()
        })
        .eq('id', data.membership_id)
    }

    // 9. Return success response
    return res.status(200).json({
      success: true,
      message: 'Callback processed successfully'
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Callback processing error:', error)
    return res.status(500).json({ 
      error: 'Callback processing failed',
      details: errorMessage 
    })
  }
}