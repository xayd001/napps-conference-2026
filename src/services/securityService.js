import { db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';

// Search stakeholder or delegate by unique QR token
export const verifyQRToken = async (qrToken) => {
  const q = query(collection(db, 'stakeholders'), where('qrCodeToken', '==', qrToken));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return { success: false, message: 'Invalid or unregistered QR code token.' };
  }

  const userDoc = snapshot.docs[0];
  const userData = { id: userDoc.id, ...userDoc.data() };

  return { success: true, user: userData };
};

// Log successful gate entry
export const logGateCheckIn = async (stakeholderId, gateName = 'Main Entrance Gate') => {
  // Update stakeholder check-in status
  const docRef = doc(db, 'stakeholders', stakeholderId);
  await updateDoc(docRef, {
    checkedIn: true,
    lastCheckInTime: serverTimestamp()
  });

  // Record audit log entry
  return await addDoc(collection(db, 'gate_checkins'), {
    stakeholderId,
    gateName,
    timestamp: serverTimestamp()
  });
};