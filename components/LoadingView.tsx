'use client'

export default function LoadingView() {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      <span className="crystal-ball mb-6">🔮</span>
      <h2 className="text-2xl font-semibold text-purple-200 mb-3">占い中です...</h2>
      <p className="text-slate-400 text-sm text-center leading-relaxed">
        複数の占術を組み合わせて<br />
        あなたの運勢を鑑定しています
      </p>
      <div className="flex gap-2 mt-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-purple-400"
            style={{
              animation: `twinkle 1.2s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
