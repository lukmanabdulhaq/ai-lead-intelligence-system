const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const { scoreLeadWithAI } = require('../lib/ai');
const { notifyTeam } = require('../lib/notify');
const { z } = require('zod');

// ── Validation schema ──
const createLeadSchema = z.object({
  name:    z.string().max(100).optional(),
  email:   z.string().email().optional(),
  phone:   z.string().max(30).optional(),
  message: z.string().min(1).max(2000),
  source:  z.enum(['web_form', 'telegram', 'whatsapp', 'email', 'crm', 'manual']),
});

// ── GET /api/leads — list with filters ──
router.get('/', async (req, res) => {
  try {
    const { priority, source, status, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (priority) query = query.eq('priority', priority.toUpperCase());
    if (source)   query = query.eq('source', source);
    if (status)   query = query.eq('status', status);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ leads: data, total: count });
  } catch (err) {
    console.error('GET /leads error:', err);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// ── GET /api/leads/:id ──
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Lead not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
});

// ── POST /api/leads — create + AI score ──
router.post('/', async (req, res) => {
  try {
    const parsed = createLeadSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.errors });
    }

    const { name, email, phone, message, source } = parsed.data;

    // Run AI scoring
    const aiResult = await scoreLeadWithAI(message);

    // Save to Supabase
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        name, email, phone, message, source,
        ...aiResult,
        raw_payload: req.body,
      })
      .select()
      .single();

    if (error) throw error;

    // Fire notifications asynchronously (don't block response)
    notifyTeam(lead).catch(console.error);

    res.status(201).json(lead);
  } catch (err) {
    console.error('POST /leads error:', err);
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

// ── PATCH /api/leads/:id/status ──
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['new', 'contacted', 'qualified', 'closed', 'lost'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const { data, error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// ── GET /api/leads/stats/summary ──
router.get('/stats/summary', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('priority, source, status, created_at');

    if (error) throw error;

    const stats = {
      total: data.length,
      byPriority: { HIGH: 0, MEDIUM: 0, LOW: 0 },
      bySource: {},
      byStatus: {},
      today: 0,
    };

    const today = new Date().toDateString();
    for (const lead of data) {
      stats.byPriority[lead.priority] = (stats.byPriority[lead.priority] || 0) + 1;
      stats.bySource[lead.source]     = (stats.bySource[lead.source] || 0) + 1;
      stats.byStatus[lead.status]     = (stats.byStatus[lead.status] || 0) + 1;
      if (new Date(lead.created_at).toDateString() === today) stats.today++;
    }

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
