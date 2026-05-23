import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_KEY;
const MODEL = 'gemini-2.0-flash';
const genAI = new GoogleGenerativeAI(API_KEY);

// ─── Coordinator CommandBar ────────────────────────────────────────────────

export async function runCoordinatorCommand(query, { org, opportunities = [], signups = [] } = {}) {
  const orgName = org?.name || 'this organization';
  const orgLocation = org?.location || '';

  const totalSlots = opportunities.reduce((s, o) => s + (o.slots || 0), 0);
  const totalFilled = opportunities.reduce((s, o) => s + (o.filledSlots || 0), 0);
  const openGaps = totalSlots - totalFilled;
  const fillRate = totalSlots ? Math.round((totalFilled / totalSlots) * 100) : 0;
  const activeVolunteers = [...new Set(signups.filter(s => s.status === 'confirmed').map(s => s.userId))].length;

  const oppsText = opportunities.length
    ? opportunities.map(o => `  • "${o.title}" — ${o.date}${o.time ? ` ${o.time}` : ''} — ${o.filledSlots || 0}/${o.slots || 0} filled`).join('\n')
    : '  (no opportunities posted yet)';

  const volunteersText = signups.length
    ? [...new Map(signups.map(s => [s.userId, s])).values()]
        .map(s => `  • ${s.userName || s.userEmail} (${s.userEmail}) — signed up for: ${s.oppTitle} — status: ${s.status}${s.hoursLogged ? ` — ${s.hoursLogged}h logged` : ''}`)
        .join('\n')
    : '  (no sign-ups yet)';

  const systemPrompt = `You are an AI operations assistant for a volunteer coordinator at ${orgName}${orgLocation ? ` in ${orgLocation}` : ''}.

Current org state:
- Active volunteers: ${activeVolunteers}
- Opportunities posted: ${opportunities.length}
- Open gaps: ${openGaps}
- Fill rate: ${fillRate}%

Opportunities:
${oppsText}

Volunteer sign-ups:
${volunteersText}

Respond with a JSON object in this exact format — no markdown fences, just raw JSON:
{
  "summary": "A concise 1-sentence headline of what you are doing",
  "actions": [
    { "icon": "⚡", "text": "action description", "status": "pending" },
    { "icon": "✓", "text": "action description", "status": "done" }
  ]
}

Use 4–6 action items. Icons: ⚡ for AI/in-progress tasks, ✓ for completed steps, 📞 for outreach, 📅 for scheduling, ⚠️ for alerts.
Status must be "done", "pending", or "alert". Be specific — use real names, shift titles, and numbers from the data above.`;

  const model = genAI.getGenerativeModel({ model: MODEL });
  const result = await model.generateContent([
    { text: systemPrompt },
    { text: `Coordinator query: "${query}"` },
  ]);
  const raw = result.response.text().trim();
  const json = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(json);
}

// ─── Volunteer Match Personalization ──────────────────────────────────────

export async function generateMatchNote({ impact, skills, motivation }) {
  const model = genAI.getGenerativeModel({ model: MODEL });

  const prompt = `A volunteer just completed an intake form. Based on their answers, write a warm, personal 2-sentence explanation for why they would be a great fit for the "Weekend Meals Coordinator" role at Sunrise Senior Center — an org that serves 200+ seniors every weekend.

Their answers:
- Impact focus: "${impact}"
- Skills they listed: ${skills.join(', ')}
- What matters to them (their own words): "${motivation || 'Not provided'}"

Rules:
- Write in second person ("you / your")
- Be specific — reference their actual words or choices naturally
- Keep it under 65 words
- Sound human and warm, not corporate
- Do NOT start with "Based on your answers" — just get right into it`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

// ─── Rank real opportunities + generate personal note (single call) ────────

export async function rankAndPersonalize({ opportunities, impact, skills, motivation }) {
  const model = genAI.getGenerativeModel({ model: MODEL });

  const oppsText = opportunities
    .map(
      (o, i) =>
        `[${i}] id=${o.id} | "${o.title}" at ${o.orgName}\n     Activities: ${o.activities?.join(', ') || 'N/A'}\n     Desc: ${o.description?.slice(0, 180) || 'N/A'}`
    )
    .join('\n\n');

  const prompt = `A volunteer completed an intake form. Rank these real opportunities from best to worst match, then write a short personal note for the top match.

Volunteer intake:
- Impact focus: "${impact}"
- Skills: ${skills.join(', ')}
- What matters to them: "${motivation || 'Not provided'}"

Opportunities:
${oppsText}

Respond with raw JSON only — no markdown fences:
{
  "rankedIndices": [0, 3, 1, 2, ...],
  "personalNote": "Warm 2-sentence personal explanation for the top match. Second person. Under 65 words. Reference their actual words. Don't start with 'Based on'."
}`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  return JSON.parse(raw);
}
