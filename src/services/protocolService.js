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

const PROTOCOL_COLLECTION = 'protocol_logs';

// Real-time listener for protocol & travel entries
export const subscribeToProtocolLogs = (callback) => {
  const q = query(collection(db, PROTOCOL_COLLECTION), orderBy('arrivalDateTime', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(list);
  });
};

// Add new travel / protocol record
export const addProtocolLog = async (data) => {
  return await addDoc(collection(db, PROTOCOL_COLLECTION), {
    ...data,
    createdAt: serverTimestamp()
  });
};

// Update travel & hotel allocation details
export const updateProtocolLog = async (id, data) => {
  const docRef = doc(db, PROTOCOL_COLLECTION, id);
  return await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

// Delete record
export const deleteProtocolLog = async (id) => {
  const docRef = doc(db, PROTOCOL_COLLECTION, id);
  return await deleteDoc(docRef);
};