import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';

const STAKEHOLDERS_COLLECTION = 'stakeholders';

// Real-time listener for stakeholder registry
export const subscribeToStakeholders = (callback) => {
  const q = query(collection(db, STAKEHOLDERS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(list);
  });
};

// Add new VIP or Stakeholder
export const addStakeholder = async (data) => {
  const qrToken = `NAPPS2026_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  return await addDoc(collection(db, STAKEHOLDERS_COLLECTION), {
    ...data,
    qrCodeToken: qrToken,
    createdAt: serverTimestamp()
  });
};

// Update existing stakeholder details or pipeline status
export const updateStakeholder = async (id, data) => {
  const docRef = doc(db, STAKEHOLDERS_COLLECTION, id);
  return await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

// Delete stakeholder record
export const deleteStakeholder = async (id) => {
  const docRef = doc(db, STAKEHOLDERS_COLLECTION, id);
  return await deleteDoc(docRef);
};