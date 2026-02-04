import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { addDoc, collection, doc, getDoc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DROP_OFF_LOCATIONS } from '../constants/dropOffLocations';
import { Colors, ThemeGradients } from '../constants/theme';
import { auth, db } from '../firebase';
import { useColorScheme } from '../hooks/use-color-scheme';

const { width } = Dimensions.get('window');

export default function RequestRecycleScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const gradients = ThemeGradients[colorScheme];

    const [medicines, setMedicines] = useState([]);
    const [locations, setLocations] = useState([]);
    const [selectedMeds, setSelectedMeds] = useState([]);
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [address, setAddress] = useState('');
    const [pickupTime, setPickupTime] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) {
            router.replace('/login');
            return;
        }

        // Fetch User Profile for Auto-fill
        const fetchProfile = async () => {
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    if (data.address) setAddress(data.address);
                    if (data.phone) setContactNumber(data.phone);
                }
            } catch (error) {
                console.error("Error fetching profile for auto-fill:", error);
            }
        };
        fetchProfile();

        // Fetch Medicines - Only those currently in the "Drop-off Bag"
        const qMeds = query(
            collection(db, 'users', user.uid, 'medicines'),
            where('status', '==', 'In Bag')
        );

        const unsubMeds = onSnapshot(qMeds, (snapshot) => {
            const meds = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMedicines(meds);
        });

        // Fetch Locations
        const qLocs = query(collection(db, 'dropOffLocations'));
        const unsubLocs = onSnapshot(qLocs, (snapshot) => {
            const locs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Fallback to constant if Firestore is empty
            const finalLocs = locs.length > 0 ? locs : DROP_OFF_LOCATIONS;
            setLocations(finalLocs);
            if (finalLocs.length > 0 && !selectedPoint) {
                setSelectedPoint(finalLocs[0].id);
            }
            setIsLoading(false);
        });

        return () => {
            unsubMeds();
            unsubLocs();
        };
    }, []);

    const toggleMedSelection = (medId) => {
        if (selectedMeds.includes(medId)) {
            setSelectedMeds(prev => prev.filter(id => id !== medId));
        } else {
            setSelectedMeds(prev => [...prev, medId]);
        }
    };

    const handleSubmit = async () => {
        if (selectedMeds.length === 0) {
            Alert.alert('Selection Required', 'Please select at least one medicine to recycle.');
            return;
        }

        if (!selectedPoint) {
            Alert.alert('Selection Required', 'Please select a collection point.');
            return;
        }

        if (!address.trim() || !pickupTime.trim() || !contactNumber.trim()) {
            Alert.alert('Missing Details', 'Please fill in all pickup details.');
            return;
        }

        setIsSubmitting(true);
        try {
            const user = auth.currentUser;
            const selectedPointData = locations.find(p => p.id === selectedPoint) || DROP_OFF_LOCATIONS.find(p => p.id === selectedPoint);

            const requestData = {
                userId: user.uid,
                medicineIds: selectedMeds,
                pointId: selectedPoint,
                pointName: selectedPointData.name,
                pickupDetails: {
                    address: address.trim(),
                    time: pickupTime.trim(),
                    contact: contactNumber.trim(),
                },
                status: 'Pending',
                requestId: `REC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                createdAt: new Date().toISOString()
            };

            await addDoc(collection(db, 'recyclingRequests'), requestData);

            // Update all selected medicines to track this request
            const updatePromises = selectedMeds.map(medId => {
                const medRef = doc(db, 'users', user.uid, 'medicines', medId);
                return updateDoc(medRef, {
                    status: 'Pending Pickup',
                    requestId: requestData.requestId,
                    requestedAt: new Date().toISOString()
                });
            });
            await Promise.all(updatePromises);

            Alert.alert(
                'Request Submitted!',
                `Your recycling pick-up request (${requestData.requestId}) has been received for ${selectedPointData.name}. Our rider will contact you soon.`,
                [{ text: 'Great!', onPress: () => router.back() }]
            );
        } catch (error) {
            console.error("Error submitting request:", error);
            Alert.alert('Error', 'Failed to submit request. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={gradients.main}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={[styles.backBtn, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="chevron-back" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Request Recycling</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Step 1: Select Medicines */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={[styles.stepDot, { backgroundColor: theme.primary }]}>
                                <Text style={styles.stepNum}>1</Text>
                            </View>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Select Medicines</Text>
                        </View>

                        {medicines.length > 0 ? (
                            medicines.map((med) => (
                                <TouchableOpacity
                                    key={med.id}
                                    style={[
                                        styles.medItem,
                                        {
                                            backgroundColor: theme.card,
                                            borderColor: selectedMeds.includes(med.id) ? theme.primary : theme.border,
                                            borderWidth: selectedMeds.includes(med.id) ? 2 : 1
                                        }
                                    ]}
                                    onPress={() => toggleMedSelection(med.id)}
                                >
                                    <View style={[styles.iconContainer, { backgroundColor: (med.color || theme.primary) + '15' }]}>
                                        <Ionicons name={med.icon || 'medical'} size={24} color={med.color || theme.primary} />
                                    </View>
                                    <View style={styles.medInfo}>
                                        <Text style={[styles.medName, { color: theme.text }]}>{med.name}</Text>
                                        <Text style={[styles.medStatus, { color: med.status === 'Expired' ? theme.danger : theme.icon }]}>
                                            {med.status} • {med.dosage}
                                        </Text>
                                    </View>
                                    <View style={[
                                        styles.checkbox,
                                        {
                                            borderColor: selectedMeds.includes(med.id) ? theme.primary : theme.border,
                                            backgroundColor: selectedMeds.includes(med.id) ? theme.primary : 'transparent'
                                        }
                                    ]}>
                                        {selectedMeds.includes(med.id) && <Ionicons name="checkmark" size={16} color="#FFF" />}
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={{ color: theme.icon }}>No medicines found to recycle.</Text>
                            </View>
                        )}
                    </View>

                    {/* Step 2: Select Collection Point */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={[styles.stepDot, { backgroundColor: theme.primary }]}>
                                <Text style={styles.stepNum}>2</Text>
                            </View>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Select Collection Point</Text>
                        </View>

                        <View style={styles.pointsGrid}>
                            {locations.map((point) => (
                                <TouchableOpacity
                                    key={point.id}
                                    style={[
                                        styles.pointCard,
                                        {
                                            backgroundColor: theme.card,
                                            borderColor: selectedPoint === point.id ? theme.primary : theme.border,
                                            borderWidth: selectedPoint === point.id ? 2 : 1
                                        }
                                    ]}
                                    onPress={() => setSelectedPoint(point.id)}
                                >
                                    <Ionicons
                                        name={point.id.includes('kl') ? 'business' : 'medical'}
                                        size={20}
                                        color={selectedPoint === point.id ? theme.primary : theme.icon}
                                    />
                                    <Text style={[styles.pointName, { color: theme.text }]} numberOfLines={1}>{point.name}</Text>
                                    {selectedPoint === point.id && (
                                        <View style={styles.selectedPointBadge}>
                                            <Ionicons name="checkmark-circle" size={16} color={theme.primary} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Step 3: Pickup Details */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={[styles.stepDot, { backgroundColor: theme.primary }]}>
                                <Text style={styles.stepNum}>3</Text>
                            </View>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Pickup Details</Text>
                        </View>

                        <View style={[styles.formContainer, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
                            <Text style={[styles.label, { color: theme.icon }]}>Pickup Address</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, { color: theme.text, borderColor: theme.border }]}
                                placeholder="Enter your full pickup address..."
                                placeholderTextColor={theme.icon + '80'}
                                multiline
                                numberOfLines={3}
                                value={address}
                                onChangeText={setAddress}
                            />

                            <Text style={[styles.label, { color: theme.icon, marginTop: 15 }]}>Preferred Time Window</Text>
                            <TextInput
                                style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                                placeholder="e.g. Tomorrow, 2pm - 4pm"
                                placeholderTextColor={theme.icon + '80'}
                                value={pickupTime}
                                onChangeText={setPickupTime}
                            />

                            <Text style={[styles.label, { color: theme.icon, marginTop: 15 }]}>Contact Number</Text>
                            <TextInput
                                style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                                placeholder="Enter phone number for rider"
                                placeholderTextColor={theme.icon + '80'}
                                keyboardType="phone-pad"
                                value={contactNumber}
                                onChangeText={setContactNumber}
                            />
                        </View>
                    </View>
                </ScrollView>

                {/* Submit Footer */}
                <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.border, borderTopWidth: 1 }]}>
                    <View style={styles.summaryInfo}>
                        <Text style={[styles.summaryLabel, { color: theme.icon }]}>Selected Items</Text>
                        <Text style={[styles.summaryValue, { color: theme.text }]}>{selectedMeds.length} Items</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.submitBtn, { opacity: selectedMeds.length === 0 || isSubmitting ? 0.6 : 1 }]}
                        onPress={handleSubmit}
                        disabled={selectedMeds.length === 0 || isSubmitting}
                    >
                        <LinearGradient
                            colors={gradients.warm}
                            style={styles.submitGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Text style={styles.submitText}>
                                {isSubmitting ? 'Submitting...' : 'Confirm Request'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 120,
    },
    section: {
        marginBottom: 30,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        gap: 12,
    },
    stepDot: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepNum: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    medItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    medInfo: {
        flex: 1,
    },
    medName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    medStatus: {
        fontSize: 13,
        marginTop: 2,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    formContainer: {
        padding: 20,
        borderRadius: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 15,
        fontSize: 15,
    },
    textArea: {
        height: 100,
        paddingTop: 12,
        textAlignVertical: 'top',
    },
    pointsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    pointCard: {
        width: (width - 50) / 2,
        padding: 15,
        borderRadius: 20,
        alignItems: 'center',
        gap: 8,
    },
    pointName: {
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    selectedPointBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        width: width,
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    summaryInfo: {
        flex: 1,
    },
    summaryLabel: {
        fontSize: 12,
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    submitBtn: {
        flex: 1.5,
        height: 56,
        borderRadius: 18,
        overflow: 'hidden',
    },
    submitGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    }
});
