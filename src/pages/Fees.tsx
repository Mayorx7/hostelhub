import { CheckCircle2, ArrowRight, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';

const plans = [
  {
    name: '4-Bed Shared',
    subtitle: 'Standard accommodation',
    price: '₦45,000',
    period: 'per session',
    description: 'Affordable shared room with three other students. Available in all four blocks.',
    features: [
      '4 students per room',
      'Shared wardrobe & study space',
      'Common bathroom per floor',
      'Available in Blocks A, B, C & D',
      'Wi-Fi & power backup included',
    ],
    available: true,
    badge: 'Most popular',
    badgeBg: '#5C2200',
    highlight: true,
  },
  {
    name: 'Single Room',
    subtitle: 'Private accommodation',
    price: '₦85,000',
    period: 'per session',
    description: 'Private single-occupancy room with dedicated study space. Available in Blocks C & D.',
    features: [
      'Private room, 1 student',
      'Personal wardrobe & desk',
      'Shared bathroom per floor',
      'Available in Blocks C & D',
      'Wi-Fi & power backup included',
    ],
    available: true,
    badge: 'Limited rooms',
    badgeBg: '#2563eb',
    highlight: false,
  },
  {
    name: 'Premium Single',
    subtitle: 'Enhanced private room',
    price: '₦110,000',
    period: 'per session',
    description: 'Premium private room in Block D with enhanced furnishing and en-suite bathroom.',
    features: [
      'Private room, 1 student',
      'En-suite bathroom',
      'Enhanced furniture & fittings',
      'Block D only',
      'Wi-Fi & power backup included',
    ],
    available: false,
    badge: 'Currently full',
    badgeBg: '#6b7280',
    highlight: false,
  },
];

const notes = [
  'All fees cover a full academic session (two semesters).',
  'Payment is processed via Paystack — card or bank transfer accepted.',
  'Fees must be paid within 72 hours of allocation to confirm your room.',
  'Refunds are not available after the first week of occupancy.',
];

export default function Fees() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-[#5C2200] py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-300">
            Pricing
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Hostel fees
          </h1>
          <p className="mt-4 text-lg text-orange-100">
            Transparent pricing for all room types. All fees cover a full academic session.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-6 sm:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border shadow-sm transition-shadow hover:shadow-md ${
                  plan.highlight
                    ? 'border-[#5C2200] ring-2 ring-[#5C2200]/20'
                    : 'border-[#e8dcd7]'
                } bg-white`}
              >
                {/* Badge */}
                <span
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-bold text-white whitespace-nowrap"
                  style={{ background: plan.badgeBg }}
                >
                  {plan.badge}
                </span>

                <div className="flex flex-col flex-1 p-6 pt-8">
                  <h2 className="text-base font-bold text-slate-900">{plan.name}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{plan.subtitle}</p>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">{plan.description}</p>

                  {/* Price */}
                  <div className="mt-5 flex items-baseline gap-1.5">
                    <span className="text-4xl font-extrabold text-[#5C2200]">{plan.price}</span>
                    <span className="text-xs text-slate-400">{plan.period}</span>
                  </div>

                  {/* Features */}
                  <ul className="mt-5 flex flex-col gap-2.5 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle2 className="h-4 w-4 text-[#5C2200] flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="mt-6">
                    {plan.available ? (
                      <Link
                        to="/apply"
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#5C2200] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#7A3010] transition-colors"
                      >
                        Apply for this room <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="w-full rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-400 cursor-not-allowed"
                      >
                        Currently unavailable
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notes */}
      <section className="border-t border-[#e8dcd7] bg-[#fdf7f4] py-14">
        <div className="mx-auto max-w-3xl px-6">
          <div className="flex items-start gap-3 rounded-xl border border-[#e8dcd7] bg-white p-6 shadow-sm">
            <Info className="h-5 w-5 text-[#5C2200] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Payment notes</h3>
              <ul className="mt-3 flex flex-col gap-2">
                {notes.map((note) => (
                  <li key={note} className="text-sm text-slate-600 leading-relaxed">
                    · {note}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Have a question about pricing?{' '}
              <a href="mailto:hostel@custech.edu.ng" className="font-semibold text-[#5C2200] hover:underline">
                Contact the hostels office
              </a>
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
