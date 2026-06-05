# Paystack Integration Setup

## 1. Get Paystack Keys

1. Sign up at [paystack.com](https://paystack.com)
2. Get your test keys from Dashboard > Settings > API Keys

## 2. Add Environment Variables

Add to your `.env.local`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 3. Deploy Edge Function

In your terminal:
```bash
# Install Supabase CLI if not already
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy the Paystack function
supabase functions deploy paystack

# Set secrets
supabase secrets set PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
supabase secrets set PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
supabase secrets set SUPABASE_URL=your_supabase_url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 4. Run SQL Schema

In Supabase SQL Editor, run:
```sql
-- Copy contents of payments_schema.sql
```

## 5. Test Flow

1. Student applies for room → booking created
2. Go to `/student-dashboard/payments`
3. Click "Pay Now"
4. Enter test card: `4084084084084084081`, Expiry: any future date, CVV: `408`
5. Payment completes → redirects back → auto-verifies

## Test Cards (Paystack Test Mode)

| Card Number | Status |
|-------------|--------|
| 4084084084084084081 | Success |
| 506066506066506066 | Declined |

## Files Modified/Created

- `src/pages/StudentPayments.tsx` - Updated with Pay Now button
- `supabase/functions/paystack/index.ts` - New Edge Function
- `payments_schema.sql` - Database schema
- `.env.example` - Environment template
