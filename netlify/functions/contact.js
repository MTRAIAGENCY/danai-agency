exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { name, phone, company, message } = JSON.parse(event.body || '{}');
    if (!name || !phone) {
      return { statusCode: 400, body: JSON.stringify({ error: 'نام و شماره تماس الزامی است' }) };
    }

    const text =
      `📩 درخواست جدید از سایت DANAI\n\n` +
      `نام: ${name}\n` +
      `شماره تماس: ${phone}\n` +
      `شرکت: ${company || '-'}\n` +
      `توضیحات: ${message || '-'}`;

    const tgRes = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text })
      }
    );

    if (!tgRes.ok) throw new Error('Telegram send failed');

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    console.error('Contact function error:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: 'خطا در ارسال درخواست' }) };
  }
};
