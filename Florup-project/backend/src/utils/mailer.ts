import nodemailer from 'nodemailer';

export async function sendResetCodeEmail(
  to: string,
  code: string,
): Promise<{ sent: boolean; previewCode?: string }> {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user || 'noreply@florup.localhost';

  if (!host || !user || !pass) {
    console.info(`[MAIL DEV] Код сброса пароля для ${to}: ${code}`);
    return { sent: false, previewCode: code };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"Florup" <${from}>`,
    to,
    subject: 'Код для сброса пароля — Florup',
    text: `Ваш код подтверждения для смены пароля: ${code}. Код действует 15 минут.`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; background: #fff0d3; color: #503e2f; border-radius: 16px;">
        <h2>Восстановление пароля Florup</h2>
        <p>Ваш код подтверждения:</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #908e55;">${code}</p>
        <p style="font-size: 12px;">Код действует 15 минут. Если вы не запрашивали смену пароля, просто проигнорируйте это письмо.</p>
      </div>
    `,
  });

  return { sent: true };
}