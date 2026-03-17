const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SCORING_PROMPT = `You are a lead qualification expert. Analyze the lead message and return ONLY valid JSON, no other text:
{
  "intent": "BUY" or "RENT" or "INQUIRE" or "CONSULT" or "OTHER",
  "budget": "string or null",
  "location": "string or null",
  "timeline": "string or null",
  "priority": "HIGH" or "MEDIUM" or "LOW",
  "confidence": 0.0 to 1.0,
  "ai_summary": "max 120 chars, actionable recommendation for sales team"
}
Priority: HIGH = clear budget+timeline+intent. MEDIUM = some details. LOW = vague/browsing.`;

async function scoreLeadWithAI(message) {
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SCORING_PROMPT },
        { role: 'user', content: `Lead message: "${message}"` },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const parsed = JSON.parse(response.choices[0].message.content);

    return {
      intent:     ['BUY','RENT','INQUIRE','CONSULT','OTHER'].includes(parsed.intent) ? parsed.intent : 'OTHER',
      budget:     parsed.budget || null,
      location:   parsed.location || null,
      timeline:   parsed.timeline || null,
      priority:   ['HIGH','MEDIUM','LOW'].includes(parsed.priority) ? parsed.priority : 'MEDIUM',
      confidence: typeof parsed.confidence === 'number' ? Math.min(1, Math.max(0, parsed.confidence)) : 0.5,
      ai_summary: parsed.ai_summary ? parsed.ai_summary.slice(0, 120) : null,
    };

  } catch (err) {
    console.error('Groq scoring error:', err.message);
    return {
      intent: 'OTHER', budget: null, location: null, timeline: null,
      priority: 'MEDIUM', confidence: 0,
      ai_summary: 'AI scoring unavailable — manual review required.',
    };
  }
}

module.exports = { scoreLeadWithAI };
