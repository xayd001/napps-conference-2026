import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';

// --- STAKEHOLDERS ---
export const subscribeStakeholders = (callback) => {
  return onSnapshot(collection(db, 'stakeholders'), (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(items);
  });
};

export const getStakeholders = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'stakeholders'));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching stakeholders:', error);
    return [];
  }
};

export const addStakeholder = async (data) => {
  return await addDoc(collection(db, 'stakeholders'), {
    ...data,
    createdAt: serverTimestamp()
  });
};

export const updateStakeholder = async (id, updatedData) => {
  try {
    const docRef = doc(db, 'stakeholders', id);
    await updateDoc(docRef, {
      ...updatedData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating stakeholder:', error);
    throw error;
  }
};

// --- PROTOCOL LOGS ---
export const subscribeProtocolLogs = (callback) => {
  return onSnapshot(collection(db, 'protocol_logs'), (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(items);
  });
};

export const updateProtocolLog = async (logId, data) => {
  const ref = doc(db, 'protocol_logs', logId);
  return await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

// --- SECURITY SCANNER ---
export const verifyQRToken = async (qrToken) => {
  const q = query(collection(db, 'stakeholders'), where('qrCodeToken', '==', qrToken));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return null;
  const docData = snapshot.docs[0];
  return { id: docData.id, ...docData.data() };
};

export const logAccessScan = async (stakeholderId, scannerId) => {
  return await addDoc(collection(db, 'access_logs'), {
    stakeholderId,
    scannedBy: scannerId,
    timestamp: serverTimestamp()
  });
};

// --- SPONSORSHIPS & PARTNERS ---
export const subscribeSponsorships = (callback) => {
  return onSnapshot(collection(db, 'sponsorships'), (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(items);
  });
};

export const getPartners = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'partners'));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching partners:', error);
    return [];
  }
};