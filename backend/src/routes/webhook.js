const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const { notifyTeam } = require('../lib/notify');

// ── POST /api/webhook/lead ──
// Called by n8n after AI scoring is complete
// n8n does the AI work, then POSTs the fully-scored lead here

router.post('/lead', async (req, res) => {
  try {
    const secret = req.headers['x-webhook-secret'];
    if (secret !== process.env.WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      name, email, phone, message, source,
      intent, budget, location, timeline,
      priority, confidence, ai_summary,
    } = req.body;

    if (!message || !source) {
      return res.status(400).json({ error: 'message and source are required' });
    }

    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        name, email, phone, message, source,
        intent, budget, location, timeline,
        priority: priority || 'MEDIUM',
        confidence, ai_summary,
        raw_payload: req.body,
      })
      .select()
      .single();

    if (error) throw error;

    // Notify team for high-priority leads
    notifyTeam(lead).catch(console.error);

    res.status(201).json({ success: true, lead_id: lead.id, priority: lead.priority });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;
