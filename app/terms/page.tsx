'use client'

import Link from 'next/link'
import { useLang } from '@/lib/i18n-context'

const termsContent = {
  ja: {
    title: '利用規約',
    updated: '最終更新日：2026年5月17日',
    backLink: '← トップに戻る',
    sections: [
      {
        heading: '第1条（適用）',
        content: '本利用規約（以下「本規約」）は、総合占い（以下「当サービス」）が提供する運勢占いアプリ（以下「本サービス」）の利用条件を定めるものです。ユーザーは本規約に同意した上で本サービスをご利用ください。',
      },
      {
        heading: '第2条（利用登録）',
        content: '本サービスの一部機能はアカウント登録が必要です。登録の際は正確な情報を入力してください。虚偽の情報を登録した場合、当サービスはアカウントを削除することがあります。',
      },
      {
        heading: '第3条（料金・決済）',
        list: ['無料プランは合計5回まで利用可能です。', 'プレミアムプランは月額500円（税込）です。', '決済はStripeを通じたクレジットカード払いとなります。', '料金は毎月自動更新されます。', '月途中でのキャンセルは当月末まで利用可能で、日割り返金はありません。'],
      },
      {
        heading: '第4条（キャンセル・解約）',
        content: 'プレミアムプランはいつでも解約できます。解約後は次回更新日をもってサービスが終了します。解約手続きはサービス内のカスタマーポータルから行ってください。',
      },
      {
        heading: '第5条（禁止事項）',
        list: ['本サービスの内容を無断で複製・転載すること', '本サービスを不正に利用すること', '他のユーザーに迷惑をかける行為', '法令または公序良俗に違反する行為'],
      },
      {
        heading: '第6条（免責事項）',
        content: '本サービスが提供する占い結果はエンターテインメントを目的としたものです。占い結果に基づく判断・行動によって生じた損害について、当サービスは一切責任を負いません。',
      },
      {
        heading: '第7条（サービスの変更・停止）',
        content: '当サービスは、ユーザーへの事前通知なく、本サービスの内容を変更または停止することがあります。これによってユーザーに生じた損害について、当サービスは責任を負いません。',
      },
      {
        heading: '第8条（準拠法・管轄裁判所）',
        content: '本規約の解釈は日本法に準拠し、紛争が生じた場合は名古屋地方裁判所を第一審の専属的合意管轄裁判所とします。',
      },
    ],
  },
  en: {
    title: 'Terms of Service',
    updated: 'Last updated: May 17, 2026',
    backLink: '← Back to Top',
    sections: [
      {
        heading: 'Article 1 (Application)',
        content: 'These Terms of Service ("Terms") govern the use of the fortune reading application ("Service") provided by Fortune Reading ("We"). By using the Service, you agree to these Terms.',
      },
      {
        heading: 'Article 2 (Registration)',
        content: 'Some features require account registration. Please provide accurate information when registering. We may delete accounts with false information.',
      },
      {
        heading: 'Article 3 (Fees & Payment)',
        list: ['Free plan allows up to 5 readings total.', 'Premium plan is ¥500/month (tax included).', 'Payment is processed via Stripe credit card.', 'Fees are renewed automatically each month.', 'Cancellations mid-month remain active until month-end; no pro-rated refunds.'],
      },
      {
        heading: 'Article 4 (Cancellation)',
        content: 'You may cancel the Premium plan at any time. Service ends on the next renewal date after cancellation. Please use the Customer Portal within the service to cancel.',
      },
      {
        heading: 'Article 5 (Prohibited Activities)',
        list: ['Reproducing or republishing service content without permission', 'Unauthorized use of the service', 'Actions that inconvenience other users', 'Actions that violate laws or public order'],
      },
      {
        heading: 'Article 6 (Disclaimer)',
        content: 'Fortune reading results are provided for entertainment purposes only. We are not liable for any losses resulting from decisions made based on fortune reading results.',
      },
      {
        heading: 'Article 7 (Service Changes & Suspension)',
        content: 'We may modify or suspend the service without prior notice to users. We are not responsible for any losses caused by such changes.',
      },
      {
        heading: 'Article 8 (Governing Law & Jurisdiction)',
        content: 'These Terms are governed by Japanese law. In the event of a dispute, the Nagoya District Court shall have exclusive jurisdiction in the first instance.',
      },
    ],
  },
  'zh-TW': {
    title: '使用條款',
    updated: '最後更新日期：2026年5月17日',
    backLink: '← 返回首頁',
    sections: [
      {
        heading: '第1條（適用）',
        content: '本使用條款（以下稱「本條款」）規定了運勢占卜（以下稱「本服務」）的使用條件。使用者同意本條款後方可使用本服務。',
      },
      {
        heading: '第2條（使用者註冊）',
        content: '部分功能需要帳號註冊。請在註冊時提供正確資訊。若提供虛假資訊，本服務有權刪除該帳號。',
      },
      {
        heading: '第3條（費用・付款）',
        list: ['免費方案共可使用5次。', '高級方案每月500日圓（含稅）。', '付款透過Stripe信用卡處理。', '費用每月自動續約。', '月中取消仍可使用至月末，不提供按日退款。'],
      },
      {
        heading: '第4條（取消・退訂）',
        content: '高級方案可隨時取消。取消後服務將於下次續約日結束。請透過服務內的客戶入口網站辦理取消。',
      },
      {
        heading: '第5條（禁止事項）',
        list: ['未經授權複製或轉載本服務內容', '非法使用本服務', '對其他用戶造成困擾的行為', '違反法律或公序良俗的行為'],
      },
      {
        heading: '第6條（免責聲明）',
        content: '本服務提供的占卜結果僅供娛樂目的。本服務不對根據占卜結果做出的判斷或行動所造成的損失承擔任何責任。',
      },
      {
        heading: '第7條（服務變更・暫停）',
        content: '本服務可能在未事先通知用戶的情況下變更或暫停服務內容。本服務不對此類變更造成的損失承擔責任。',
      },
      {
        heading: '第8條（準據法・管轄法院）',
        content: '本條款依日本法律解釋，如發生糾紛，名古屋地方法院為第一審專屬合意管轄法院。',
      },
    ],
  },
  'zh-CN': {
    title: '使用条款',
    updated: '最后更新日期：2026年5月17日',
    backLink: '← 返回首页',
    sections: [
      {
        heading: '第1条（适用）',
        content: '本使用条款（以下称"本条款"）规定了运势占卜（以下称"本服务"）的使用条件。用户同意本条款后方可使用本服务。',
      },
      {
        heading: '第2条（用户注册）',
        content: '部分功能需要账号注册。请在注册时提供正确信息。若提供虚假信息，本服务有权删除该账号。',
      },
      {
        heading: '第3条（费用・付款）',
        list: ['免费方案共可使用5次。', '高级方案每月500日元（含税）。', '付款通过Stripe信用卡处理。', '费用每月自动续约。', '月中取消仍可使用至月末，不提供按日退款。'],
      },
      {
        heading: '第4条（取消・退订）',
        content: '高级方案可随时取消。取消后服务将于下次续约日结束。请通过服务内的客户门户办理取消。',
      },
      {
        heading: '第5条（禁止事项）',
        list: ['未经授权复制或转载本服务内容', '非法使用本服务', '对其他用户造成困扰的行为', '违反法律或公序良俗的行为'],
      },
      {
        heading: '第6条（免责声明）',
        content: '本服务提供的占卜结果仅供娱乐目的。本服务不对根据占卜结果做出的判断或行动所造成的损失承担任何责任。',
      },
      {
        heading: '第7条（服务变更・暂停）',
        content: '本服务可能在未事先通知用户的情况下变更或暂停服务内容。本服务不对此类变更造成的损失承担责任。',
      },
      {
        heading: '第8条（准据法・管辖法院）',
        content: '本条款依日本法律解释，如发生纠纷，名古屋地方法院为第一审专属合意管辖法院。',
      },
    ],
  },
}

export default function TermsPage() {
  const { lang } = useLang()
  const content = termsContent[lang] ?? termsContent.ja

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
              {'content' in section && section.content && (
                <p>{section.content}</p>
              )}
              {'list' in section && section.list && (
                <ul className="space-y-2 list-disc list-inside text-slate-400">
                  {section.list.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
