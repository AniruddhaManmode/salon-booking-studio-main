import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';

// Test Firebase connection
export const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...');
    
    // Try to read from the bookings collection
    const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
    console.log('✅ Firebase connection successful!');
    console.log(`Found ${bookingsSnapshot.size} bookings in the database`);
    
    return true;
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
    console.error('Error details:', error.message);
    
    // Provide helpful error messages
    if (error.message.includes('Missing or insufficient permissions')) {
      console.log('💡 Solution: Update Firebase Firestore security rules');
      console.log('   Go to Firebase Console > Firestore Database > Rules');
      console.log('   Replace with the rules provided in firestore.rules file');
    } else if (error.message.includes('CONFIGURATION_NOT_FOUND')) {
      console.log('💡 Solution: Firebase Auth configuration issue (should be fixed now)');
    } else if (error.message.includes('project-not-found')) {
      console.log('💡 Solution: Check Firebase project ID in firebase.ts');
    }
    
    return false;
  }
};

// Auto-test on module load (only in development)
if (process.env.NODE_ENV === 'development') {
  testFirebaseConnection();
}
