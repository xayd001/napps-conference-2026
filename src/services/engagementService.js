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

const CSR_COLLECTION = 'csr_pledges';

// Subscribe to financial and material CSR pledges
export const subscribeToCSR = (callback) => {
  const q = query(collection(db, CSR_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(list);
  });
};

// Add new pledge or support entry
export const addCSRPledge = async (data) => {
  return await addDoc(collection(db, CSR_COLLECTION), {
    ...data,
    amount: parseFloat(data.amount) || 0,
    createdAt: serverTimestamp()
  });
};

// Update pledge status or details
export const updateCSRPledge = async (id, data) => {
  const docRef = doc(db, CSR_COLLECTION, id);
  return await updateDoc(docRef, {
    ...data,
    amount: parseFloat(data.amount) || 0,
    updatedAt: serverTimestamp()
  });
};

// Delete record
export const deleteCSRPledge = async (id) => {
  const docRef = doc(db, CSR_COLLECTION, id);
  return await deleteDoc(docRef);
};