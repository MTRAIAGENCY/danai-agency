const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// شخصیت و دستورالعمل مشاور هوشمند DANAI — هر چه اینجا بنویسید، رفتار چت‌بات را تغییر می‌دهد
const SYSTEM_PROMPT = `تو "مشاور هوشمند DANAI" هستی، دستیار یک آژانس اتوماسیون هوش مصنوعی.
به زبان فارسی، دوستانه، کوتاه و حرفه‌ای پاسخ بده.
خدمات DANAI: ایجنت‌های هوش مصنوعی، چت‌بات‌های هوشمند، اتوماسیون کسب‌وکار، اتوماسیون تلگرام و اینستاگرام، اتصال هوش مصنوعی به اسناد (Knowledge Base) و اتصال API.
اگر کاربر درباره قیمت دقیق پرسید، بگو که برای برآورد دقیق باید فرم «تماس با ما» را پر کند.
همیشه در پایان پاسخ، کاربر را به سمت پر کردن فرم تماس یا انتخاب یکی از خدمات هدایت کن.`;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { message, history = [] } = JSON.parse(event.body || '{}');
    if (!message || !message.trim()) {
      return { statusCode: 400, body: JSON.stringify({ error: 'پیام خالی است' }) };
    }

    // history از سمت فرانت‌اند به شکل [{role:'user'|'ai', text:'...'}] می‌آید
    const messages = [
      ...history.map(h => ({
        role: h.role === 'ai' ? 'assistant' : 'user',
        content: h.text
      })),
      { role: 'user', content: message }
    ];

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-5',   // برای هزینه‌ی کمتر: 'claude-haiku-4-5-20251001'
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages
    });

    const reply = response.content.find(b => b.type === 'text')?.text
      || 'متاسفانه در حال حاضر پاسخی دریافت نشد.';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply })
    };
  } catch (err) {
    console.error('Chat function error:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: 'خطا در ارتباط با هوش مصنوعی' }) };
  }
};
