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

const TASKS_COLLECTION = 'committee_tasks';

// Subscribe to real-time task updates
export const subscribeToTasks = (callback) => {
  const q = query(collection(db, TASKS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(list);
  });
};

// Add a new task for a sub-team
export const addTask = async (taskData) => {
  return await addDoc(collection(db, TASKS_COLLECTION), {
    ...taskData,
    status: taskData.status || 'Pending', // 'Pending' | 'In Progress' | 'Completed'
    createdAt: serverTimestamp()
  });
};

// Update task status or assignment
export const updateTask = async (id, updateData) => {
  const docRef = doc(db, TASKS_COLLECTION, id);
  return await updateDoc(docRef, {
    ...updateData,
    updatedAt: serverTimestamp()
  });
};

// Delete a task
export const deleteTask = async (id) => {
  const docRef = doc(db, TASKS_COLLECTION, id);
  return await deleteDoc(docRef);
};