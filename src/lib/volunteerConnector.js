// Maps VolunteerConnect intake categories to VolunteerConnector keyword searches
const categoryKeywords = {
  'Help people directly': 'community support seniors food',
  'Work with animals': 'animal shelter wildlife rescue',
  'Protect the environment': 'environment conservation nature cleanup',
  'Support education': 'education tutoring mentorship youth',
};

const BASE = 'https://www.volunteerconnector.org/api/search/';
const PROXY = 'https://api.allorigins.win/raw?url=';

async function fetchWithFallback(url) {
  // Try direct first (works if they have CORS headers)
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (res.ok) return res.json();
  } catch {}
  // Fallback to CORS proxy
  const proxied = await fetch(PROXY + encodeURIComponent(url), {
    signal: AbortSignal.timeout(10000),
  });
  if (!proxied.ok) throw new Error('VolunteerConnector unavailable');
  return proxied.json();
}

/**
 * Fetch real volunteer opportunities based on intake answers.
 * Returns up to 10 results.
 */
export async function fetchOpportunities({ impact, skills = [] }) {
  const keyword = categoryKeywords[impact] || 'volunteer community';

  // Build query — use keyword search + limit
  const params = new URLSearchParams({ search: keyword, page_size: 10 });
  const url = `${BASE}?${params}`;

  const data = await fetchWithFallback(url);
  return (data.results || []).slice(0, 10);
}

/**
 * Normalise a VolunteerConnector result into a shape MatchCard understands.
 */
export function normaliseOpportunity(raw) {
  return {
    id: raw.id,
    title: raw.title || 'Volunteer Opportunity',
    description: raw.description?.replace(/<[^>]*>/g, '').trim() || '',
    orgName: raw.organization?.name || 'Local Organization',
    orgLogo: raw.organization?.logo ? `https:${raw.organization.logo}` : null,
    orgUrl: raw.organization?.url || null,
    url: raw.url || null,
    date: raw.dates || 'Flexible schedule',
    duration: raw.duration || null,
    remote: raw.remote_or_online || false,
    activities: (raw.activities || []).map((a) => a.name),
    location:
      raw.audience?.regions?.join(', ') ||
      (raw.audience?.scope === 'national' ? 'Nationwide' : 'Local'),
  };
}
