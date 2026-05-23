import { GoogleGenerativeAI } from '@google/generative-ai';
import { org, shifts, volunteers, activityFeed } from '../data/mockData';

const API_KEY = 'AIzaSyB3rgeda4rIvkPOJbn2vHmFT7Wr58XanzE';
const genAI = new GoogleGenerativeAI(API_KEY);

// ─── Coordinator CommandBar ────────────────────────────────────────────────

const COORDINATOR_SYSTEM = `You are an AI operations assistant for a volunteer coordinator at ${org.name} in ${org.location}.

Current org state:
- Active volunteers: ${org.activeVolunteers}
- Shifts this week: ${org.shiftsThisWeek}
- Open gaps: ${org.openGaps}
- Fill rate: ${org.fillRate}%

Upcoming shifts:
${shifts.map((s) => `  • ${s.name} (${s.date}, ${s.time}) — ${s.filled}/${s.capacity} filled, status: ${s.status}`).join('\n')}

Volunteer roster (top 6):
${volunteers.map((v) => `  • ${v.name} — skills: ${v.skills.join(', ')}, reliability: ${v.reliabilityScore}%`).join('\n')}

Recent activity:
${activityFeed.slice(0, 5).map((a) => `  • ${a.text}`).join('\n')}

Respond with a JSON object in this exact format — no markdown fences, just raw JSON:
{
  "summary": "A concise 1-sentence headline of what you're doing",
  "actions": [
    { "icon": "⚡", "text": "action description", "status": "pending" },
    { "icon": "✓", "text": "action description", "status": "done" }
  ]
}

Use 4–7 action items. Use ⚡ for in-progress/AI tasks, ✓ for completed steps, 📞 for outreach, 📅 for scheduling.
Status must be "done", "pending", or "alert". Be specific — mention actual volunteer names, shift names, and times from context above.`;

export async function runCoordinatorCommand(query) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await model.generateContent([
    { text: COORDINATOR_SYSTEM },
    { text: `Coordinator query: "${query}"` },
  ]);
  const raw = result.response.text().trim();
  // Strip markdown fences if the model adds them anyway
  const json = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(json);
}

// ─── Volunteer Match Personalization ──────────────────────────────────────

export async function generateMatchNote({ impact, skills, motivation }) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

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
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

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
