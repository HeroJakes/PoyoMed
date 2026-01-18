
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { DROP_OFF_LOCATIONS } from './constants/dropOffLocations';
import { db } from './firebase';

export async function populateDropOffLocations() {
    try {
        const querySnapshot = await getDocs(collection(db, 'dropOffLocations'));
        if (querySnapshot.empty) {
            console.log('Populating dropOffLocations...');
            for (const location of DROP_OFF_LOCATIONS) {
                await setDoc(doc(db, 'dropOffLocations', location.id), location);
            }
            console.log('Successfully populated dropOffLocations');
        } else {
            console.log('dropOffLocations already populated');
        }
    } catch (error) {
        console.error('Error populating dropOffLocations:', error);
    }
}
