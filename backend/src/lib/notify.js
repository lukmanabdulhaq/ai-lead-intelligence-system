// ── Telegram notification ──────────────────────────────────────

async function sendTelegramAlert(lead) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const priorityEmoji = { HIGH: '🔴', MEDIUM: '🟡', LOW: '🟢' };
  const emoji = priorityEmoji[lead.priority] || '⚪';

  const text = `
${emoji} *NEW ${lead.priority} PRIORITY LEAD*

👤 *Name:* ${lead.name || 'Unknown'}
📧 *Email:* ${lead.email || '—'}
📱 *Phone:* ${lead.phone || '—'}
🌍 *Source:* ${lead.source}

💬 *Message:*
${lead.message}

🤖 *AI Analysis:*
• Intent: ${lead.intent || '—'}
• Budget: ${lead.budget || '—'}
• Location: ${lead.location || '—'}
• Timeline: ${lead.timeline || '—'}
• Confidence: ${lead.confidence ? Math.round(lead.confidence * 100) + '%' : '—'}

📝 *Summary:* ${lead.ai_summary || '—'}

🔗 [View in dashboard](${process.env.FRONTEND_URL}/leads/${lead.id})
  `.trim();

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) console.error('Telegram error:', await res.text());
  } catch (err) {
    console.error('Telegram send failed:', err.message);
  }
}

// ── WhatsApp notification (Meta Cloud API) ─────────────────────

async function sendWhatsAppAlert(lead) {
  const token   = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const toPhone = process.env.WHATSAPP_SALES_PHONE; // e.g. 233xxxxxxxxx
  if (!token || !phoneId || !toPhone) return;

  const priorityLabel = { HIGH: '🔴 HIGH', MEDIUM: '🟡 MEDIUM', LOW: '🟢 LOW' };

  const body = `*New Lead Alert — ${priorityLabel[lead.priority] || lead.priority}*

Name: ${lead.name || 'Unknown'}
Email: ${lead.email || '—'}
Source: ${lead.source}

Message:
${lead.message}

AI Score:
• Intent: ${lead.intent || '—'}
• Budget: ${lead.budget || '—'}
• Location: ${lead.location || '—'}
• Timeline: ${lead.timeline || '—'}

${lead.ai_summary || ''}`;

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${phoneId}/messages`,
      {
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
      }
    );
    if (!res.ok) console.error('WhatsApp error:', await res.text());
  } catch (err) {
    console.error('WhatsApp send failed:', err.message);
  }
}

// ── Send all notifications for a high-priority lead ─────────────

async function notifyTeam(lead) {
  if (lead.priority !== 'HIGH') return;
  await Promise.allSettled([
    sendTelegramAlert(lead),
    sendWhatsAppAlert(lead),
  ]);
}

module.exports = { sendTelegramAlert, sendWhatsAppAlert, notifyTeam };
