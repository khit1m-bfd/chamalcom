import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../config/logger';

const transporter = nodemailer.createTransport({
  host: env.MAIL_HOST,
  port: env.MAIL_PORT,
  secure: env.MAIL_PORT === 465,
  auth: env.MAIL_USER && env.MAIL_PASS
    ? { user: env.MAIL_USER, pass: env.MAIL_PASS }
    : undefined,
});

async function sendMail(to: string, subject: string, html: string): Promise<void> {
  if (!env.MAIL_USER || !env.MAIL_PASS) {
    logger.warn('Mail non envoyé — MAIL_USER/MAIL_PASS non configurés', { to, subject });
    return;
  }
  try {
    await transporter.sendMail({ from: env.MAIL_FROM, to, subject, html });
    logger.info('Email envoyé', { to, subject });
  } catch (err) {
    logger.error('Erreur envoi email', { to, subject, err });
  }
}

// ─── Templates ────────────────────────────────────────────────────────────────
function baseTemplate(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: 'Cairo', Arial, sans-serif; background: #F5F0E8; margin: 0; padding: 20px; direction: rtl; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(10,61,107,0.1); }
    .header { background: linear-gradient(135deg, #0A3D6B, #1A5CA8); padding: 32px; text-align: center; }
    .header h1 { color: #E8B84B; margin: 0; font-size: 24px; }
    .header p { color: rgba(255,255,255,0.8); margin: 8px 0 0; }
    .body { padding: 32px; color: #0A3D6B; line-height: 1.8; }
    .highlight { background: #F5F0E8; border-right: 4px solid #E8B84B; padding: 16px; border-radius: 8px; margin: 20px 0; }
    .btn { display: inline-block; background: #E8B84B; color: #0A3D6B; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0; }
    .footer { background: #0A3D6B; color: rgba(255,255,255,0.6); text-align: center; padding: 20px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>شمال كوم</h1>
      <p>منصة الإيجار السياحي — واد لاو</p>
    </div>
    <div class="body">${body}</div>
    <div class="footer">
      <p>© 2025 ChamalCom — Oued Laou, Tanger-Tétouan-Al Hoceima, Maroc</p>
      <p>هذا البريد تلقائي، لا تُرد عليه مباشرة</p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendConfirmationReservation(opts: {
  to: string;
  clientPrenom: string;
  appartementTitre: string;
  dateArrivee: string;
  dateDepart: string;
  nbNuits: number;
  prixTotal: number;
  reservationId: number;
}): Promise<void> {
  const body = `
    <h2>مرحباً ${opts.clientPrenom}!</h2>
    <p>تم تأكيد حجزك بنجاح. إليك تفاصيل إقامتك:</p>
    <div class="highlight">
      <p><strong>🏠 الشقة:</strong> ${opts.appartementTitre}</p>
      <p><strong>📅 تاريخ الوصول:</strong> ${opts.dateArrivee}</p>
      <p><strong>📅 تاريخ المغادرة:</strong> ${opts.dateDepart}</p>
      <p><strong>🌙 عدد الليالي:</strong> ${opts.nbNuits}</p>
      <p><strong>💰 المبلغ الإجمالي:</strong> ${opts.prixTotal} درهم</p>
    </div>
    <a href="${env.FRONTEND_URL}/ar/reservation/${opts.reservationId}" class="btn">عرض تفاصيل الحجز</a>
    <p>نتمنى لك إقامة طيبة! 🌊</p>
  `;
  await sendMail(opts.to, 'تأكيد الحجز — شمال كوم', baseTemplate('تأكيد الحجز', body));
}

export async function sendAnnulationReservation(opts: {
  to: string;
  clientPrenom: string;
  appartementTitre: string;
  motif?: string;
}): Promise<void> {
  const body = `
    <h2>مرحباً ${opts.clientPrenom}</h2>
    <p>نأسف لإبلاغك بأن حجزك في شقة <strong>${opts.appartementTitre}</strong> قد تم إلغاؤه.</p>
    ${opts.motif ? `<div class="highlight"><p><strong>السبب:</strong> ${opts.motif}</p></div>` : ''}
    <p>يمكنك البحث عن شقق أخرى متاحة عبر منصتنا.</p>
    <a href="${env.FRONTEND_URL}/ar/appartements" class="btn">استعرض الشقق المتاحة</a>
  `;
  await sendMail(opts.to, 'إلغاء الحجز — شمال كوم', baseTemplate('إلغاء الحجز', body));
}

export async function sendDemandeReservation(opts: {
  to: string;
  proprietairePrenom: string;
  clientNom: string;
  appartementTitre: string;
  dateArrivee: string;
  dateDepart: string;
  nbPersonnes: number;
  reservationId: number;
}): Promise<void> {
  const body = `
    <h2>مرحباً ${opts.proprietairePrenom}</h2>
    <p>لديك طلب حجز جديد لشقتك <strong>${opts.appartementTitre}</strong>:</p>
    <div class="highlight">
      <p><strong>👤 العميل:</strong> ${opts.clientNom}</p>
      <p><strong>📅 من:</strong> ${opts.dateArrivee}</p>
      <p><strong>📅 إلى:</strong> ${opts.dateDepart}</p>
      <p><strong>👥 عدد الأشخاص:</strong> ${opts.nbPersonnes}</p>
    </div>
    <p>⚠️ يرجى الرد خلال 24 ساعة وإلا سيتم إلغاء الطلب تلقائياً.</p>
    <a href="${env.FRONTEND_URL}/ar/dashboard/proprietaire" class="btn">مراجعة الطلب</a>
  `;
  await sendMail(opts.to, 'طلب حجز جديد — شمال كوم', baseTemplate('طلب حجز جديد', body));
}

export async function sendRappelAvis(opts: {
  to: string;
  clientPrenom: string;
  appartementTitre: string;
  reservationId: number;
}): Promise<void> {
  const body = `
    <h2>مرحباً ${opts.clientPrenom}</h2>
    <p>نأمل أن إقامتك في <strong>${opts.appartementTitre}</strong> كانت ممتعة!</p>
    <p>يسعدنا معرفة رأيك — تقييمك يساعدنا في تحسين الخدمة.</p>
    <a href="${env.FRONTEND_URL}/ar/dashboard/client" class="btn">اكتب تقييمك الآن</a>
  `;
  await sendMail(opts.to, 'شاركنا تجربتك — شمال كوم', baseTemplate('تقييم إقامتك', body));
}

export async function sendVerificationProprietaire(opts: {
  to: string;
  proprietairePrenom: string;
  statut: 'verifie' | 'refuse';
  motif?: string;
}): Promise<void> {
  const estVerifie = opts.statut === 'verifie';
  const body = `
    <h2>مرحباً ${opts.proprietairePrenom}</h2>
    ${estVerifie
      ? '<p>🎉 تهانينا! تم التحقق من حسابك بنجاح. يمكنك الآن إضافة شققك ونشر إعلاناتك.</p>'
      : `<p>نأسف لإبلاغك بأن طلب التحقق من حسابك قد رُفض.</p>${opts.motif ? `<div class="highlight"><p><strong>السبب:</strong> ${opts.motif}</p></div>` : ''}<p>يمكنك التواصل مع الدعم لمزيد من المعلومات.</p>`
    }
    <a href="${env.FRONTEND_URL}/ar/dashboard/proprietaire" class="btn">الذهاب إلى لوحة التحكم</a>
  `;
  const sujet = estVerifie ? '✅ تم التحقق من حسابك' : '❌ رفض طلب التحقق';
  await sendMail(opts.to, `${sujet} — شمال كوم`, baseTemplate(sujet, body));
}
