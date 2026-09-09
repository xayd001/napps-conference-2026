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

const PROGRAM_COLLECTION = 'program_sessions';

// Real-time listener for sessions
export const subscribeToSessions = (callback) => {
  const q = query(collection(db, PROGRAM_COLLECTION), orderBy('startTime', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(list);
  });
};

// Add new session
export const addSession = async (data) => {
  return await addDoc(collection(db, PROGRAM_COLLECTION), {
    ...data,
    createdAt: serverTimestamp()
  });
};

// Update session details or assigned speakers
export const updateSession = async (id, data) => {
  const docRef = doc(db, PROGRAM_COLLECTION, id);
  return await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

// Delete session
export const deleteSession = async (id) => {
  const docRef = doc(db, PROGRAM_COLLECTION, id);
  return await deleteDoc(docRef);
};