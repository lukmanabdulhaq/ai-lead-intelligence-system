async function sendTelegramAlert(lead) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const priorityEmoji = { HIGH: '🔴', MEDIUM: '🟡', LOW: '🟢' };
  const emoji = priorityEmoji[lead.priority] || '⚪';

  const text = [
    `${emoji} NEW ${lead.priority} PRIORITY LEAD`,
    ``,
    `👤 Name: ${lead.name || 'Unknown'}`,
    `📧 Email: ${lead.email || '—'}`,
    `📱 Phone: ${lead.phone || '—'}`,
    `🌍 Source: ${lead.source}`,
    ``,
    `💬 Message: ${lead.message}`,
    ``,
    `🤖 AI Analysis:`,
    `   Intent: ${lead.intent || '—'}`,
    `   Budget: ${lead.budget || '—'}`,
    `   Location: ${lead.location || '—'}`,
    `   Timeline: ${lead.timeline || '—'}`,
    `   Confidence: ${lead.confidence ? Math.round(lead.confidence * 100) + '%' : '—'}`,
    ``,
    `📝 ${lead.ai_summary || '—'}`,
  ].join('\n');

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    if (!res.ok) console.error('Telegram error:', await res.text());
    else console.log('✅ Telegram notification sent!');
  } catch (err) {
    console.error('Telegram send failed:', err.message);
  }
}

async function sendWhatsAppAlert(lead) {
  const token   = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const toPhone = process.env.WHATSAPP_SALES_PHONE;
  if (!token || !phoneId || !toPhone) return;

  const priorityLabel = { HIGH: '🔴 HIGH', MEDIUM: '🟡 MEDIUM', LOW: '🟢 LOW' };

  const body = [
    `New Lead Alert - ${priorityLabel[lead.priority] || lead.priority}`,
    ``,
    `Name: ${lead.name || 'Unknown'}`,
    `Email: ${lead.email || '—'}`,
    `Source: ${lead.source}`,
    ``,
    `Message: ${lead.message}`,
    ``,
    `AI Score:`,
    `Intent: ${lead.intent || '—'}`,
    `Budget: ${lead.budget || '—'}`,
    `Location: ${lead.location || '—'}`,
    `Timeline: ${lead.timeline || '—'}`,
    ``,
    `${lead.ai_summary || ''}`,
  ].join('\n');

  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: toPhone,
        type: 'text',
        text: { body },
      }),
    });
    if (!res.ok) console.error('WhatsApp error:', await res.text());
    else console.log('✅ WhatsApp notification sent!');
  } catch (err) {
    console.error('WhatsApp send failed:', err.message);
  }
}

async function notifyTeam(lead) {
  if (lead.priority !== 'HIGH') return;
  await Promise.allSettled([
    sendTelegramAlert(lead),
    sendWhatsAppAlert(lead),
  ]);
}

module.exports = { sendTelegramAlert, sendWhatsAppAlert, notifyTeam };
