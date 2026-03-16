const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SCORING_PROMPT = `You are a lead qualification expert. Analyze the lead message and extract structured data.

Return ONLY valid JSON with this exact shape:
{
  "intent": "BUY" | "RENT" | "INQUIRE" | "CONSULT" | "OTHER",
  "budget": string or null,
  "location": string or null,
  "timeline": string or null,
  "priority": "HIGH" | "MEDIUM" | "LOW",
  "confidence": number between 0 and 1,
  "ai_summary": string (max 120 chars, actionable recommendation for sales team)
}

Priority rules:
- HIGH: clear budget + clear timeline + strong purchase/rent intent
- MEDIUM: some specifics present but incomplete
- LOW: vague inquiry, no budget, no timeline, just browsing

Be concise and accurate. Do not include any text outside the JSON.`;

async function scoreLeadWithAI(message) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SCORING_PROMPT },
        { role: 'user', content: `Lead message: "${message}"` },
      ],
      temperature: 0.1,
      max_tokens: 300,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content);

    // Validate and sanitize
    return {
      intent:     ['BUY', 'RENT', 'INQUIRE', 'CONSULT', 'OTHER'].includes(result.intent) ? result.intent : 'OTHER',
      budget:     result.budget || null,
      location:   result.location || null,
      timeline:   result.timeline || null,
      priority:   ['HIGH', 'MEDIUM', 'LOW'].includes(result.priority) ? result.priority : 'MEDIUM',
      confidence: typeof result.confidence === 'number' ? Math.min(1, Math.max(0, result.confidence)) : 0.5,
      ai_summary: result.ai_summary ? result.ai_summary.slice(0, 120) : null,
    };

  } catch (err) {
    console.error('AI scoring error:', err.message);
    // Fallback — don't break the pipeline if AI fails
    return {
      intent:     'OTHER',
      budget:     null,
      location:   null,
      timeline:   null,
      priority:   'MEDIUM',
      confidence: 0,
      ai_summary: 'AI scoring unavailable — manual review required.',
    };
  }
}

module.exports = { scoreLeadWithAI };
