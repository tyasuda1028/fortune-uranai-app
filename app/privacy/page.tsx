'use client'

import Link from 'next/link'
import { useLang } from '@/lib/i18n-context'

const privacyContent = {
  ja: {
    title: 'プライバシーポリシー',
    updated: '最終更新日：2026年5月17日',
    backLink: '← トップに戻る',
    sections: [
      {
        heading: '1. 収集する情報',
        intro: '本サービスでは以下の情報を収集します。',
        list: ['アカウント情報（氏名・メールアドレス）', '占いに使用する情報（名前・生年月日・血液型）', '利用状況（使用回数・サブスクリプション状態）', '決済情報（Stripeにより管理、当サービスでは保持しません）'],
      },
      {
        heading: '2. 情報の利用目的',
        list: ['本サービスの提供・運営・改善', 'サブスクリプションの管理', 'お問い合わせへの対応', '利用規約違反の調査・対応'],
      },
      {
        heading: '3. 第三者への提供',
        intro: '当サービスは以下のサービスを利用しており、それぞれのプライバシーポリシーに基づき情報が処理されます。',
        linkList: [
          { label: 'Clerk', desc: '（認証管理）', href: 'https://clerk.com/privacy', linkText: 'clerk.com/privacy' },
          { label: 'Stripe', desc: '（決済処理）', href: 'https://stripe.com/jp/privacy', linkText: 'stripe.com/jp/privacy' },
          { label: 'Groq', desc: '（AI処理）', href: 'https://groq.com/privacy-policy/', linkText: 'groq.com/privacy-policy' },
          { label: 'Vercel', desc: '（ホスティング）', href: 'https://vercel.com/legal/privacy-policy', linkText: 'vercel.com/legal/privacy-policy' },
        ],
        outro: '上記以外の第三者に個人情報を提供することはありません（法令に基づく場合を除く）。',
      },
      { heading: '4. Cookieの使用', content: '本サービスはセッション管理のためにCookieを使用しています。ブラウザの設定によりCookieを無効にすることができますが、一部機能が使用できなくなる場合があります。' },
      { heading: '5. 情報の管理・保護', content: '収集した個人情報は適切な安全管理措置を講じて保護します。不正アクセス・紛失・破壊・改ざん・漏洩などのリスクに対して合理的な対策を実施します。' },
      { heading: '6. 個人情報の開示・訂正・削除', content: 'ご自身の個人情報の開示・訂正・削除を希望される場合は、下記のお問い合わせ先までご連絡ください。合理的な期間内に対応いたします。' },
      { heading: '7. お問い合わせ', contact: { name: '総合占い　安田哲也', email: 'tyasuda83101028@gmail.com' } },
    ],
  },
  en: {
    title: 'Privacy Policy',
    updated: 'Last updated: May 17, 2026',
    backLink: '← Back to Top',
    sections: [
      {
        heading: '1. Information We Collect',
        intro: 'We collect the following information.',
        list: ['Account information (name, email address)', 'Fortune reading data (name, date of birth, blood type)', 'Usage data (usage count, subscription status)', 'Payment information (managed by Stripe; we do not retain it)'],
      },
      {
        heading: '2. Purpose of Use',
        list: ['Providing, operating, and improving the service', 'Managing subscriptions', 'Responding to inquiries', 'Investigating and responding to Terms violations'],
      },
      {
        heading: '3. Third-Party Disclosure',
        intro: 'We use the following services, each of which processes information according to its own privacy policy.',
        linkList: [
          { label: 'Clerk', desc: '(Authentication)', href: 'https://clerk.com/privacy', linkText: 'clerk.com/privacy' },
          { label: 'Stripe', desc: '(Payment)', href: 'https://stripe.com/privacy', linkText: 'stripe.com/privacy' },
          { label: 'Groq', desc: '(AI Processing)', href: 'https://groq.com/privacy-policy/', linkText: 'groq.com/privacy-policy' },
          { label: 'Vercel', desc: '(Hosting)', href: 'https://vercel.com/legal/privacy-policy', linkText: 'vercel.com/legal/privacy-policy' },
        ],
        outro: 'We do not share personal information with other third parties (except as required by law).',
      },
      { heading: '4. Cookies', content: 'We use cookies for session management. You can disable cookies in your browser settings, but some features may become unavailable.' },
      { heading: '5. Information Security', content: 'We take appropriate security measures to protect collected personal information against unauthorized access, loss, destruction, alteration, and leakage.' },
      { heading: '6. Access, Correction & Deletion', content: 'If you wish to access, correct, or delete your personal information, please contact us at the address below. We will respond within a reasonable period.' },
      { heading: '7. Contact', contact: { name: 'Fortune Reading — Tetsuya Yasuda', email: 'tyasuda83101028@gmail.com' } },
    ],
  },
  'zh-TW': {
    title: '隱私權政策',
    updated: '最後更新日期：2026年5月17日',
    backLink: '← 返回首頁',
    sections: [
      {
        heading: '1. 收集的資訊',
        intro: '本服務收集以下資訊。',
        list: ['帳號資訊（姓名、電子郵件地址）', '占卜使用資訊（姓名、出生日期、血型）', '使用狀況（使用次數、訂閱狀態）', '付款資訊（由Stripe管理，本服務不保存）'],
      },
      {
        heading: '2. 資訊使用目的',
        list: ['提供、營運及改善本服務', '管理訂閱', '回應查詢', '調查及處理違反使用條款的行為'],
      },
      {
        heading: '3. 第三方提供',
        intro: '本服務使用以下服務，各服務依其隱私權政策處理資訊。',
        linkList: [
          { label: 'Clerk', desc: '（身分驗證）', href: 'https://clerk.com/privacy', linkText: 'clerk.com/privacy' },
          { label: 'Stripe', desc: '（付款處理）', href: 'https://stripe.com/privacy', linkText: 'stripe.com/privacy' },
          { label: 'Groq', desc: '（AI處理）', href: 'https://groq.com/privacy-policy/', linkText: 'groq.com/privacy-policy' },
          { label: 'Vercel', desc: '（託管）', href: 'https://vercel.com/legal/privacy-policy', linkText: 'vercel.com/legal/privacy-policy' },
        ],
        outro: '除法令要求外，本服務不會向上述以外的第三方提供個人資訊。',
      },
      { heading: '4. Cookie使用', content: '本服務使用Cookie進行工作階段管理。您可以在瀏覽器設定中停用Cookie，但部分功能可能無法使用。' },
      { heading: '5. 資訊管理與保護', content: '我們採取適當的安全管理措施保護收集到的個人資訊，防止未授權存取、遺失、毀損、竄改及洩漏等風險。' },
      { heading: '6. 個人資訊的查閱、更正及刪除', content: '如需查閱、更正或刪除您的個人資訊，請聯絡以下地址。我們將在合理期限內處理。' },
      { heading: '7. 聯絡方式', contact: { name: '運勢占卜　安田哲也', email: 'tyasuda83101028@gmail.com' } },
    ],
  },
  'zh-CN': {
    title: '隐私政策',
    updated: '最后更新日期：2026年5月17日',
    backLink: '← 返回首页',
    sections: [
      {
        heading: '1. 收集的信息',
        intro: '本服务收集以下信息。',
        list: ['账号信息（姓名、电子邮件地址）', '占卜使用信息（姓名、出生日期、血型）', '使用状况（使用次数、订阅状态）', '付款信息（由Stripe管理，本服务不保存）'],
      },
      {
        heading: '2. 信息使用目的',
        list: ['提供、运营及改善本服务', '管理订阅', '回应查询', '调查及处理违反使用条款的行为'],
      },
      {
        heading: '3. 第三方提供',
        intro: '本服务使用以下服务，各服务依其隐私政策处理信息。',
        linkList: [
          { label: 'Clerk', desc: '（身份验证）', href: 'https://clerk.com/privacy', linkText: 'clerk.com/privacy' },
          { label: 'Stripe', desc: '（付款处理）', href: 'https://stripe.com/privacy', linkText: 'stripe.com/privacy' },
          { label: 'Groq', desc: '（AI处理）', href: 'https://groq.com/privacy-policy/', linkText: 'groq.com/privacy-policy' },
          { label: 'Vercel', desc: '（托管）', href: 'https://vercel.com/legal/privacy-policy', linkText: 'vercel.com/legal/privacy-policy' },
        ],
        outro: '除法令要求外，本服务不会向上述以外的第三方提供个人信息。',
      },
      { heading: '4. Cookie使用', content: '本服务使用Cookie进行会话管理。您可以在浏览器设置中停用Cookie，但部分功能可能无法使用。' },
      { heading: '5. 信息管理与保护', content: '我们采取适当的安全管理措施保护收集到的个人信息，防止未授权访问、丢失、毁损、篡改及泄露等风险。' },
      { heading: '6. 个人信息的查阅、更正及删除', content: '如需查阅、更正或删除您的个人信息，请联系以下地址。我们将在合理期限内处理。' },
      { heading: '7. 联系方式', contact: { name: '运势占卜　安田哲也', email: 'tyasuda83101028@gmail.com' } },
    ],
  },
}

export default function PrivacyPage() {
  const { lang } = useLang()
  const content = privacyContent[lang] ?? privacyContent.ja

  return (
    <main className="min-h-screen bg-[#0f0a1e] text-slate-300">
      <div className="max-w-2xl mx-auto px-5 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm mb-8 transition-colors">
          {content.backLink}
        </Link>

        <h1 className="text-2xl font-bold text-white mb-2">{content.title}</h1>
        <p className="text-xs text-slate-500 mb-10">{content.updated}</p>

        <div className="space-y-8 text-sm leading-relaxed">
          {content.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-base font-semibold text-purple-300 mb-3">{section.heading}</h2>
              {'intro' in section && section.intro && (
                <p className="mb-2">{section.intro}</p>
              )}
              {'list' in section && section.list && (
                <ul className="space-y-2 list-disc list-inside text-slate-400">
                  {section.list.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
              {'linkList' in section && section.linkList && (
                <ul className="space-y-2 list-disc list-inside text-slate-400">
                  {section.linkList.map((item) => (
                    <li key={item.label}>
                      <strong className="text-slate-300">{item.label}</strong>{item.desc}：
                      <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-purple-400 underline">{item.linkText}</a>
                    </li>
                  ))}
                </ul>
              )}
              {'outro' in section && section.outro && (
                <p className="mt-3">{section.outro}</p>
              )}
              {'content' in section && section.content && (
                <p>{section.content}</p>
              )}
              {'contact' in section && section.contact && (
                <div className="bg-white/5 rounded-xl p-4 text-slate-400">
                  <p>{section.contact.name}</p>
                  <p>Email：<a href={`mailto:${section.contact.email}`} className="text-purple-400 underline">{section.contact.email}</a></p>
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
