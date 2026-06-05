import { UserPlus, Search, FileText, CheckCircle, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Create an account or sign in',
    desc: 'Register using your CUSTECH student email and a secure password. If you already have an account, sign in to continue.',
    note: 'Takes less than 2 minutes',
    cta: { label: 'Go to sign in', href: '/login' },
  },
  {
    number: '02',
    icon: Search,
    title: 'Browse and choose your room',
    desc: 'View available rooms across all four hostel blocks. Filter by room type (4-bed shared or single), block, and floor.',
    note: 'Allocated first-come, first-served by level',
    cta: { label: 'View hostel fees', href: '/fees' },
  },
  {
    number: '03',
    icon: FileText,
    title: 'Submit your application',
    desc: 'Complete the online form with your personal and academic details. Select your preferred room type and submit. No physical documents needed.',
    note: 'Applications reviewed within 48 hours',
    cta: { label: 'Start application', href: '/apply' },
  },
  {
    number: '04',
    icon: CheckCircle,
    title: 'Await confirmation',
    desc: 'You will see your room allocation on your dashboard once your application is reviewed. Pay the hostel fee and download your official room allocation letter.',
    note: 'Allocation letter available after payment',
    cta: null,
  },
];

const faqs = [
  {
    q: 'Who is eligible to apply?',
    a: 'All full-time CUSTECH undergraduate and postgraduate students with a valid matric number.',
  },
  {
    q: 'When does the portal open?',
    a: 'The portal opens at the start of each semester. Check the notices on the overview page for exact dates.',
  },
  {
    q: 'Can I change my room after allocation?',
    a: 'Transfer requests can be submitted within the first two weeks of a semester, subject to availability.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'Hostel fees are paid via Paystack — debit/credit card or bank transfer from any Nigerian bank.',
  },
];

export default function HowToApply() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-[#5C2200] py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-300">
            Application guide
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            How to apply
          </h1>
          <p className="mt-4 text-lg text-orange-100">
            Securing your CUSTECH hostel room is straightforward. Follow the four steps
            below to complete your application online.
          </p>
          <Link
            to="/apply"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[#5C2200] shadow hover:bg-orange-50 transition-colors"
          >
            Start application <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="relative">
            <div className="absolute left-[27px] top-12 bottom-12 w-px bg-[#e8dcd7] hidden sm:block" />
            <div className="flex flex-col">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.number} className="relative flex gap-5 sm:gap-7">
                    <div className="relative flex-shrink-0">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#5C2200] text-white shadow-lg ring-4 ring-white z-10 relative">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="flex-1 pb-8">
                      <div className="rounded-xl border border-[#e8dcd7] bg-white p-6 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <span className="text-xs font-bold uppercase tracking-widest text-[#b89080]">
                              Step {step.number}
                            </span>
                            <h2 className="mt-1 text-base font-bold text-slate-900">
                              {step.title}
                            </h2>
                          </div>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fdf7f4] px-3 py-1 text-xs font-medium text-[#5C2200] ring-1 ring-[#e8dcd7] flex-shrink-0">
                            <Clock className="h-3 w-3" />
                            {step.note}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-slate-600">{step.desc}</p>
                        {step.cta && (
                          <Link
                            to={step.cta.href}
                            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#5C2200] hover:underline"
                          >
                            {step.cta.label} <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="border-t border-[#e8dcd7] bg-[#fdf7f4] py-16">
        <div className="mx-auto max-w-3xl px-6">
          <p className="label-eyebrow">FAQs</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">Common questions</h2>
          <div className="mt-8 divide-y divide-[#e8dcd7]">
            {faqs.map((faq) => (
              <div key={faq.q} className="py-5">
                <h3 className="text-sm font-semibold text-slate-900">{faq.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{faq.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 rounded-xl border border-[#e8dcd7] bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Still have questions?</h3>
              <p className="mt-1 text-sm text-slate-500">Contact the Student Hostels Office.</p>
            </div>
            <a
              href="mailto:hostel@custech.edu.ng"
              className="flex-shrink-0 inline-flex items-center gap-2 rounded-lg bg-[#5C2200] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#7A3010] transition-colors"
            >
              Email the office
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
