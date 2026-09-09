import { db } from '../firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

export const seedDatabaseSchema = async () => {
  try {
    // 1. Stakeholders Collection Entry
    await setDoc(doc(db, 'stakeholders', 'STK_001'), {
      name: 'His Royal Highness, Shehu of Borno',
      category: 'Traditional Rulers',
      organization: 'Borno Emirate Council',
      phone: '+2348000000000',
      status: 'Confirmed',
      qrCodeToken: 'TOKEN_SHEHU_2026',
      createdAt: serverTimestamp()
    });

    // 2. Protocol Logs Entry
    await setDoc(doc(db, 'protocol_logs', 'PROT_001'), {
      stakeholderId: 'STK_001',
      arrivalDatetime: '2026-10-12T09:00:00Z',
      entryPoint: 'Maiduguri Airport',
      escortRequired: true,
      vehicleAssigned: 'Toyota Prado - VIP 1',
      hotel: 'State House Guest Lodge',
      createdAt: serverTimestamp()
    });

    // 3. Program Sessions Entry
    await setDoc(doc(db, 'program_sessions', 'SES_101'), {
      title: 'Opening Ceremony & Keynote Address',
      day: 'Day 1',
      startTime: '09:00 AM',
      endTime: '11:00 AM',
      hall: 'Main Auditorium',
      speakers: ['STK_001'],
      createdAt: serverTimestamp()
    });

    // 4. Sponsorships Entry
    await setDoc(doc(db, 'sponsorships', 'SPN_001'), {
      organization: 'UNICEF / WFP Partner',
      supportType: 'CSR / Logistics',
      amountOrValue: 'Materials & Printing',
      status: 'Fulfilled',
      createdAt: serverTimestamp()
    });

    console.log('Database seeded successfully according to target schema.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};