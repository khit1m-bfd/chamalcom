import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-sand flex flex-col items-center justify-center text-center px-4">
      <div className="mb-6">
        <span className="text-8xl">🌊</span>
      </div>
      <h1
        className="text-6xl font-bold text-primary mb-4"
        style={{ fontFamily: 'Noto Kufi Arabic, sans-serif' }}
      >
        404
      </h1>
      <p className="text-2xl font-bold text-primary mb-2" style={{ fontFamily: 'Noto Kufi Arabic, sans-serif' }}>
        هذه الصفحة غير موجودة
      </p>
      <p className="text-gray-500 mb-8 max-w-md">
        ربما تم نقل الصفحة أو حذفها أو أن الرابط غير صحيح.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <Link
          href="/"
          className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-mid transition-colors"
        >
          🏠 العودة للرئيسية
        </Link>
        <Link
          href="/appartements"
          className="bg-gold text-primary px-6 py-3 rounded-xl font-medium hover:bg-gold-dark transition-colors"
        >
          🏖️ تصفح الشقق
        </Link>
      </div>
    </main>
  );
}
