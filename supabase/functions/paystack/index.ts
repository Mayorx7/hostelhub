import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const PAYSTACK_SECRET = Deno.env.get('PAYSTACK_SECRET_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, amount, email, reference, userId, bookingId } = await req.json();

    // Initialize payment
    if (action === 'initialize') {
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100, // Paystack expects amount in kobo
          email,
          reference,
          callback_url: `${req.headers.get('origin')}/student-dashboard/payments`,
          metadata: { userId, bookingId },
        }),
      });

      const data = await response.json();
      
      if (!data.status) {
        throw new Error(data.message);
      }

      // Create pending payment record
      const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);
      await supabase.from('student_payments').insert({
        resident_id: userId,
        booking_id: bookingId,
        amount,
        reference,
        status: 'pending',
        description: 'Hostel accommodation fee',
      });

      return new Response(
        JSON.stringify({ authorization_url: data.data.authorization_url, reference: data.data.reference }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify payment
    if (action === 'verify') {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
        },
      });

      const data = await response.json();

      if (!data.status || data.data.status !== 'success') {
        // Update payment to failed
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);
        await supabase
          .from('student_payments')
          .update({ status: 'failed', paystack_reference: data.data?.reference })
          .eq('reference', reference);

        return new Response(
          JSON.stringify({ success: false, message: 'Payment verification failed' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Payment successful - update records
      const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);
      
      await supabase
        .from('student_payments')
        .update({
          status: 'completed',
          paystack_reference: data.data.reference,
          payment_date: new Date().toISOString(),
          metadata: {
            gateway_response: data.data.gateway_response,
            channel: data.data.channel,
            card_type: data.data.authorization?.card_type,
            last4: data.data.authorization?.last4,
            bank: data.data.authorization?.bank,
          },
        })
        .eq('reference', reference);

      // Update booking payment status
      const { data: payment } = await supabase
        .from('student_payments')
        .select('booking_id')
        .eq('reference', reference)
        .single();

      if (payment?.booking_id) {
        await supabase
          .from('bookings')
          .update({ payment_status: 'paid' })
          .eq('id', payment.booking_id);
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Payment successful' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
