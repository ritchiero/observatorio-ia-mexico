import type { Metadata } from 'next';
import Link from 'next/link';

// English mirror of /privacidad. Same structure, same version. The legal
// framework is Mexican (LFPDPPP); terms are glossed rather than replaced.

export const metadata: Metadata = {
  title: 'Privacy notice',
  description:
    'Privacy notice of Observatorio IA México: what personal data we collect when you subscribe, why, who stores it, and how to exercise your ARCO rights.',
  alternates: { canonical: '/en/privacidad', languages: { es: '/privacidad', en: '/en/privacidad' } },
};

const VERSION = '2026-09-01';
const RESPONSABLE = 'Lawgic Lessons SAPI de C.V.';
const DOMICILIO = '';
const CONTACTO = 'ricardo.rodriguez@getlawgic.com';

const H2 = 'font-sans-tech text-xs uppercase tracking-[0.2em] text-gray-400 mb-4';
const P = 'font-sans-tech text-[15px] text-gray-700 leading-relaxed';
const LI = 'flex gap-3';
const DASH = <span className="text-cyan-600 mt-0.5">—</span>;

export default function PrivacyNoticePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-50 border-b border-gray-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <p className="font-sans-tech text-[11px] uppercase tracking-[0.22em] text-cyan-700 mb-4">Privacy notice · version {VERSION}</p>
          <h1 className="font-serif-display text-4xl md:text-6xl font-light text-gray-900 leading-[1.02] tracking-tight">
            What we do with <em className="italic text-cyan-700">your data</em>.
          </h1>
          <p className="font-serif-display text-lg md:text-xl text-gray-600 mt-6 max-w-2xl leading-relaxed">
            The Observatorio only collects personal data when you subscribe to its updates. This notice explains which data, why,
            who stores it, and how you can <strong className="text-gray-900 font-medium">access, correct, delete or object</strong> at any time.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-14">

        <section>
          <h2 className={H2}>01 · Data controller</h2>
          <p className={P}>
            The controller (<em>responsable</em>) of your personal data is <strong className="text-gray-900 font-medium">{RESPONSABLE}</strong>,
            which operates <span className="text-gray-900">observatorio-ia-mexico.com</span> (the Observatorio).
            {DOMICILIO ? <> Address: {DOMICILIO}.</> : null}
            {' '}For anything related to this notice, write to{' '}
            <a href={`mailto:${CONTACTO}`} className="text-cyan-700 hover:text-cyan-800 underline underline-offset-2">{CONTACTO}</a>.
          </p>
        </section>

        <section>
          <h2 className={H2}>02 · Data we collect</h2>
          <p className={P}>Only through the subscription form, and only what you provide:</p>
          <ul className={`mt-4 space-y-2 ${P}`}>
            <li className={LI}>{DASH}<span><strong className="text-gray-900 font-medium">Name</strong>, to address you.</span></li>
            <li className={LI}>{DASH}<span><strong className="text-gray-900 font-medium">Email address</strong>, to send you updates.</span></li>
            <li className={LI}>{DASH}<span><strong className="text-gray-900 font-medium">Mobile phone</strong>, to send you alerts on WhatsApp.</span></li>
            <li className={LI}>{DASH}<span>The <strong className="text-gray-900 font-medium">date and version of the consent</strong> you gave for each channel, as a record.</span></li>
          </ul>
          <p className={`mt-4 ${P}`}>
            We do not collect sensitive data. Browsing the site, the tracker, the map or the archive requires no registration and no personal data.
          </p>
        </section>

        <section>
          <h2 className={H2}>03 · Why we use it</h2>
          <p className={P}><strong className="text-gray-900 font-medium">Primary purposes</strong> — the reason for the relationship:</p>
          <ul className={`mt-3 space-y-2 ${P}`}>
            <li className={LI}>{DASH}<span>Sending you the Observatorio&rsquo;s monthly recap by email.</span></li>
            <li className={LI}>{DASH}<span>Alerting you by email or WhatsApp when the status of an announcement, bill or case we track changes.</span></li>
            <li className={LI}>{DASH}<span>Keeping a record of your consent and handling unsubscribe or ARCO requests.</span></li>
          </ul>
          <p className={`mt-4 ${P}`}>
            <strong className="text-gray-900 font-medium">Secondary purposes</strong> — none. We do not use your data for advertising or commercial profiling, and we do not hand it to third parties for their own purposes.
          </p>
        </section>

        <section>
          <h2 className={H2}>04 · Where it is stored and who processes it on our behalf</h2>
          <p className={P}>
            Your data is stored on Google Cloud infrastructure (Firebase / Firestore) and the site is hosted on Vercel. Both act as processors
            under their own terms and security measures; they do not decide about your data or use it for their own ends. Email is delivered through a
            transactional email provider and WhatsApp alerts through the WhatsApp Business platform. Beyond these processors,
            <strong className="text-gray-900 font-medium"> we do not transfer your data to third parties</strong>, except under a duly founded request from a competent authority.
          </p>
        </section>

        <section>
          <h2 className={H2}>05 · Your rights (ARCO) and how to exercise them</h2>
          <p className={P}>
            Under Mexican law you may <strong className="text-gray-900 font-medium">access</strong> your data, <strong className="text-gray-900 font-medium">rectify</strong> it if inaccurate,
            <strong className="text-gray-900 font-medium"> cancel</strong> it and <strong className="text-gray-900 font-medium">object</strong> to its processing (the ARCO rights), and revoke the consent you gave us.
          </p>
          <ul className={`mt-4 space-y-2 ${P}`}>
            <li className={LI}>{DASH}<span>Send your request to <a href={`mailto:${CONTACTO}?subject=ARCO%20rights%20-%20Observatorio%20IA%20M%C3%A9xico`} className="text-cyan-700 hover:text-cyan-800 underline underline-offset-2">{CONTACTO}</a> with the subject “ARCO rights – Observatorio IA México”, stating which right you exercise and the email you subscribed with.</span></li>
            <li className={LI}>{DASH}<span>We will answer within <strong className="text-gray-900 font-medium">20 business days</strong>, as required by the Federal Law on the Protection of Personal Data Held by Private Parties (LFPDPPP).</span></li>
            <li className={LI}>{DASH}<span>To <strong className="text-gray-900 font-medium">unsubscribe</strong> from any channel, just ask through the same email; it takes effect immediately and does not affect prior processing.</span></li>
          </ul>
          <p className={`mt-4 ${P}`}>
            If you believe your data-protection rights have been violated, you may file a complaint with the competent Mexican data-protection authority.
          </p>
        </section>

        <section>
          <h2 className={H2}>06 · Cookies and analytics</h2>
          <p className={P}>
            The site uses one functional cookie (<code className="text-[13px] bg-gray-100 px-1.5 py-0.5 rounded">hl</code>) to remember your language, and analytics tools — Google Analytics 4, loaded through
            Google Tag Manager, and Vercel Analytics — that collect aggregate browsing data (page views, country, device type) to understand how the
            Observatorio is used. We do not link them to your subscription. You can block or delete these cookies in your browser settings or use
            the Google Analytics opt-out add-on; the site keeps working.
          </p>
        </section>

        <section>
          <h2 className={H2}>07 · Changes to this notice</h2>
          <p className={P}>
            When this notice changes, we will publish the new version on this page with its date. If the change affects the purposes or the data we
            collect, we will also notify subscribers by email. Current version: <strong className="text-gray-900 font-medium">{VERSION}</strong>.
          </p>
        </section>

        <p className="font-sans-tech text-sm text-gray-500 border-t border-gray-200 pt-6">
          This notice is part of the Observatorio&rsquo;s public governance. See also <Link href="/en/metodologia" className="text-cyan-700 hover:text-cyan-800 underline underline-offset-2">how we verify the data</Link>.
        </p>
      </div>
    </div>
  );
}
