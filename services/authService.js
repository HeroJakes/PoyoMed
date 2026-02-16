import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

/**
 * Authentication Service
 * Decouples Firebase Auth from the UI layer.
 */
export const authService = {
    /**
     * Signs in a user and ensures their profile exists in Firestore.
     */
    async login(email, password) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await this.syncUserProfile(user);
        return user;
    },

    /**
     * Registers a new user and creates their Firestore profile.
     */
    async register(email, password, name) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            name: name || 'User',
            createdAt: new Date().toISOString(),
        });
        return user;
    },

    /**
     * Logs out the current user.
     */
    async logout() {
        await signOut(auth);
    },

    /**
     * Synchronizes the user profile in Firestore.
     */
    async syncUserProfile(user) {
        if (!user) return;
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                name: user.displayName || 'User',
                createdAt: new Date().toISOString(),
            });
        }
    },

    /**
     * Updates the user profile data.
     */
    async updateProfile(uid, data) {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
            ...data,
            updatedAt: new Date().toISOString(),
        });
    }
};
