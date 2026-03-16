const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SCORING_PROMPT = `You are a lead qualification expert. Analyze the lead message and extract structured data.

Return ONLY valid JSON with this exact shape, no other text:
{
  "intent": "BUY" or "RENT" or "INQUIRE" or "CONSULT" or "OTHER",
  "budget": "string or null",
  "location": "string or null",
  "timeline": "string or null",
  "priority": "HIGH" or "MEDIUM" or "LOW",
  "confidence": 0.0 to 1.0,
  "ai_summary": "max 120 chars, actionable recommendation for sales team"
}

Priority rules:
- HIGH: clear budget + clear timeline + strong purchase/rent intent
- MEDIUM: some specifics present but incomplete
- LOW: vague inquiry, no budget, no timeline, just browsing`;

async function scoreLeadWithAI(message) {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    });

    const prompt = SCORING_PROMPT + '\n\nLead message: "' + message + '"';
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);

    return {
      intent:     ['BUY', 'RENT', 'INQUIRE', 'CONSULT', 'OTHER'].includes(parsed.intent) ? parsed.intent : 'OTHER',
      budget:     parsed.budget || null,
      location:   parsed.location || null,
      timeline:   parsed.timeline || null,
      priority:   ['HIGH', 'MEDIUM', 'LOW'].includes(parsed.priority) ? parsed.priority : 'MEDIUM',
      confidence: typeof parsed.confidence === 'number' ? Math.min(1, Math.max(0, parsed.confidence)) : 0.5,
      ai_summary: parsed.ai_summary ? parsed.ai_summary.slice(0, 120) : null,
    };

  } catch (err) {
    console.error('Gemini scoring error:', err.message);
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
