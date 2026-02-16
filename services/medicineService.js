import {
    addDoc,
    arrayUnion,
    collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    query,
    updateDoc,
    where
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { cancelMedicationReminders, scheduleMedicationReminder } from '../utils/notificationUtils';
import { classifyMedicineRisk } from '../utils/riskClassification';
import { checkDrugInteractions } from './aiService';


export const medicineService = {
    async getActiveMedicines(uid) {
        const q = query(
            collection(db, 'users', uid, 'medicines'),
            where('status', '==', 'Active')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async saveMedicine(medicineData, isEdit = false) {
        const uid = auth.currentUser?.uid;
        if (!uid) throw new Error("User not authenticated");

        // 1. Interaction Check
        const activeMeds = await this.getActiveMedicines(uid);
        const activeNames = activeMeds
            .filter(m => m.id !== medicineData.id)
            .map(m => m.name);

        if (!medicineData.bypassInteractions && activeNames.length > 0) {
            const interaction = await checkDrugInteractions(
                medicineData.name,
                medicineData.dosage,
                activeNames
            );
            if (interaction.hasInteraction && interaction.severity === 'High') {
                return { needsConfirmation: true, interaction };
            }
        }

        // 2. Risk Classification (only on save)
        const riskLevel = await classifyMedicineRisk(medicineData.name, medicineData.category);

        // 3. Prepare Data
        const { id, bypassInteractions, ...cleanData } = medicineData;
        const finalData = {
            ...cleanData,
            riskLevel,
            updatedAt: new Date().toISOString(),
        };

        let savedMedicine;
        if (isEdit && medicineData.id) {
            const medRef = doc(db, 'users', uid, 'medicines', medicineData.id);
            await updateDoc(medRef, finalData);
            savedMedicine = { id: medicineData.id, ...finalData };
        } else {
            finalData.createdAt = new Date().toISOString();
            const docRef = await addDoc(collection(db, 'users', uid, 'medicines'), finalData);
            savedMedicine = { id: docRef.id, ...finalData };
        }

        // 4. Schedule Notification
        await scheduleMedicationReminder(savedMedicine);

        return { success: true, medicine: savedMedicine };
    },

    subscribeToMedicines(uid, callback) {
        const q = query(collection(db, 'users', uid, 'medicines'));
        return onSnapshot(q, (snapshot) => {
            const meds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(meds);
        }, (error) => {
            console.error("Subscription error:", error);
        });
    },

    async deleteMedicine(medId) {
        const uid = auth.currentUser?.uid;
        if (!uid) throw new Error("User not authenticated");

        await cancelMedicationReminders(medId);
        await deleteDoc(doc(db, 'users', uid, 'medicines', medId));
    },

    async markAsTaken(medId, nextDoseTime) {
        const uid = auth.currentUser?.uid;
        if (!uid) throw new Error("User not authenticated");

        const today = new Date().toISOString().split('T')[0];
        let takenEntry = new Date().toISOString();

        if (nextDoseTime && nextDoseTime !== 'No more doses today' && nextDoseTime !== 'No doses scheduled' && nextDoseTime !== '--') {
            takenEntry = `${today} ${nextDoseTime}`;
        }

        const medRef = doc(db, 'users', uid, 'medicines', medId);
        await updateDoc(medRef, {
            takenHistory: arrayUnion(takenEntry)
        });
    },

    async recycleMedicine(medId) {
        const uid = auth.currentUser?.uid;
        if (!uid) throw new Error("User not authenticated");

        const medRef = doc(db, 'users', uid, 'medicines', medId);
        await updateDoc(medRef, {
            status: 'In Bag',
            updatedAt: new Date().toISOString(),
            recycledAt: new Date().toISOString()
        });
        await cancelMedicationReminders(medId);
    }
};
