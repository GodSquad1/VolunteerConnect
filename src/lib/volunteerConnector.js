import { getOrgsByImpact } from '../data/localOrgs';

/**
 * Returns up to 10 real local org opportunities filtered by intake impact.
 * Shape matches what rankAndPersonalize + MatchCard expect.
 */
export function fetchOpportunities({ impact }) {
  const orgs = getOrgsByImpact(impact).slice(0, 10);
  return Promise.resolve(orgs.map(normaliseOrg));
}

export function normaliseOrg(org) {
  return {
    id: org.id,
    title: `Volunteer at ${org.name}`,
    description: org.description,
    orgName: org.name,
    orgLogo: null,
    orgUrl: null,
    url: null,
    date: 'Flexible schedule',
    duration: null,
    remote: false,
    activities: org.activities,
    location: org.location,
    address: org.address,
  };
}

// Keep old name as alias so existing imports don't break
export { normaliseOrg as normaliseOpportunity };
