import {
  collection, doc, addDoc, setDoc, getDoc, getDocs,
  updateDoc, deleteDoc, query, where, orderBy,
  onSnapshot, serverTimestamp, increment,
} from 'firebase/firestore';
import { db } from './firebase';

// ── Collections ──────────────────────────────────────────────────────────────
const orgsCol = () => collection(db, 'organizations');
const oppsCol = () => collection(db, 'opportunities');
const signupsCol = () => collection(db, 'signups');

// ── Organizations ─────────────────────────────────────────────────────────────

export async function createOrg(userId, data) {
  const ref = doc(db, 'organizations', userId); // one org per user for simplicity
  await setDoc(ref, { ...data, createdBy: userId, createdAt: serverTimestamp() });
  return userId;
}

export async function getOrg(orgId) {
  const snap = await getDoc(doc(db, 'organizations', orgId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getOrgByUser(userId) {
  return getOrg(userId);
}

// ── Opportunities ─────────────────────────────────────────────────────────────

export async function createOpportunity(data) {
  const ref = await addDoc(oppsCol(), {
    ...data,
    filledSlots: 0,
    status: 'open',
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getAllOpportunities() {
  const snap = await getDocs(query(oppsCol(), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getOrgOpportunities(orgId) {
  const snap = await getDocs(query(oppsCol(), where('orgId', '==', orgId), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function listenOrgOpportunities(orgId, cb) {
  const q = query(oppsCol(), where('orgId', '==', orgId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

export async function getOpportunity(oppId) {
  const snap = await getDoc(doc(db, 'opportunities', oppId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// ── Sign-ups ──────────────────────────────────────────────────────────────────

export async function signUpForOpportunity(userId, userName, userEmail, opportunityId, orgId, orgName, oppTitle) {
  // Prevent duplicate
  const existing = await getDocs(
    query(signupsCol(), where('userId', '==', userId), where('opportunityId', '==', opportunityId))
  );
  if (!existing.empty) return existing.docs[0].id;

  const ref = await addDoc(signupsCol(), {
    userId, userName, userEmail,
    opportunityId, orgId, orgName, oppTitle,
    status: 'confirmed',
    hoursLogged: 0,
    signedUpAt: serverTimestamp(),
  });

  // Increment filled slots
  await updateDoc(doc(db, 'opportunities', opportunityId), {
    filledSlots: increment(1),
  });

  return ref.id;
}

export async function getUserSignups(userId) {
  const snap = await getDocs(
    query(signupsCol(), where('userId', '==', userId), orderBy('signedUpAt', 'desc'))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function logHours(signupId, hours) {
  await updateDoc(doc(db, 'signups', signupId), {
    hoursLogged: hours,
    status: 'completed',
  });
}

export async function cancelSignup(signupId, opportunityId) {
  await updateDoc(doc(db, 'signups', signupId), { status: 'cancelled' });
  await updateDoc(doc(db, 'opportunities', opportunityId), {
    filledSlots: increment(-1),
  });
}

export function listenOrgSignups(orgId, cb) {
  const q = query(signupsCol(), where('orgId', '==', orgId), orderBy('signedUpAt', 'desc'));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}
