import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, ThemeGradients } from '../constants/theme';
import { auth } from '../firebase';
import { useColorScheme } from '../hooks/use-color-scheme';
import { medicineService } from '../services/medicineService';
import { getNextDose, isExpired } from '../utils/medicineUtils';
import { getRiskMetadata } from '../utils/riskClassification';



export default function MedicineDetails() {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const params = useLocalSearchParams();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const gradients = ThemeGradients[colorScheme];
    const [menuVisible, setMenuVisible] = useState(false);
    const [medicine, setMedicine] = useState(params.medicine ? JSON.parse(params.medicine) : null);

    useEffect(() => {
        if (!medicine?.id) return;
        const user = auth.currentUser;
        if (!user) return;

        const unsub = medicineService.subscribeToMedicines(user.uid, (meds) => {
            const found = meds.find(m => m.id === medicine.id);
            if (found) setMedicine(found);
        });

        return () => unsub();
    }, []);

    const handleDelete = () => {
        setMenuVisible(false);

        const executeDelete = async () => {
            try {
                await medicineService.deleteMedicine(medicine.id);
                if (Platform.OS === 'web') {
                    window.alert("Medicine deleted successfully");
                    router.replace('/(tabs)/medicines');
                } else {
                    Alert.alert("Success", "Medicine deleted successfully", [
                        { text: "OK", onPress: () => router.replace('/(tabs)/medicines') }
                    ]);
                }
            } catch (error) {
                console.error("Error deleting medicine:", error);
                if (Platform.OS === 'web') {
                    window.alert("Failed to delete medicine");
                } else {
                    Alert.alert("Error", "Failed to delete medicine");
                }
            }
        };

        if (Platform.OS === 'web') {
            const confirmed = window.confirm("Are you sure you want to delete this medicine? This action cannot be undone.");
            if (confirmed) executeDelete();
        } else {
            Alert.alert(
                "Delete Medicine",
                "Are you sure you want to delete this medicine? This action cannot be undone.",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Delete",
                        style: "destructive",
                        onPress: executeDelete
                    }
                ]
            );
        }
    };

    if (!medicine) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: theme.text }}>Medicine not found</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: theme.primary }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return theme.success;
            case 'Low Stock': return theme.warning;
            case 'Expiring': return theme.warning;
            case 'Expired': return theme.danger;
            default: return theme.icon;
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={gradients.main}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={[styles.backBtn, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}
                    >
                        <Ionicons name="chevron-back" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Medicine Details</Text>
                    <TouchableOpacity
                        onPress={() => setMenuVisible(true)}
                        style={[styles.backBtn, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}
                    >
                        <Ionicons name="ellipsis-horizontal" size={24} color={theme.text} />
                    </TouchableOpacity>

                    <Modal
                        visible={menuVisible}
                        transparent={true}
                        animationType="fade"
                        onRequestClose={() => setMenuVisible(false)}
                    >
                        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
                            <View style={styles.modalOverlay}>
                                <View style={[styles.menuContent, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
                                    <TouchableOpacity
                                        style={styles.menuItem}
                                        onPress={() => {
                                            setMenuVisible(false);
                                            router.push({
                                                pathname: '/add-medicine',
                                                params: { medicine: JSON.stringify(medicine), mode: 'edit' }
                                            });
                                        }}
                                    >
                                        <Ionicons name="create-outline" size={20} color={theme.text} />
                                        <Text style={[styles.menuText, { color: theme.text }]}>Edit Medicine</Text>
                                    </TouchableOpacity>
                                    <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />
                                    <TouchableOpacity
                                        style={styles.menuItem}
                                        onPress={handleDelete}
                                    >
                                        <Ionicons name="trash-outline" size={20} color={theme.danger} />
                                        <Text style={[styles.menuText, { color: theme.danger }]}>Delete Medicine</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Medicine Icon & Name */}
                    <View style={styles.topSection}>
                        <View style={[styles.iconContainer, { backgroundColor: medicine.color + '15' }]}>
                            <Ionicons name={medicine.icon} size={60} color={medicine.color} />
                        </View>
                        <Text style={[styles.medicineName, { color: theme.text }]}>{medicine.name}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(medicine.status) + '15' }]}>
                            <Text style={[styles.statusText, { color: getStatusColor(medicine.status) }]}>{medicine.status}</Text>
                        </View>
                    </View>


                    <View style={styles.infoGrid}>
                        <InfoCard
                            label="Dose"
                            value={medicine.dosage || 'Not specified'}
                            icon="flask-outline"
                            theme={theme}
                        />
                        <InfoCard
                            label="Frequency"
                            value={medicine.frequency}
                            icon="repeat-outline"
                            theme={theme}
                        />
                        <InfoCard
                            label="Next Dose"
                            value={getNextDose(medicine.times)}
                            icon="time-outline"
                            theme={theme}
                        />
                        <InfoCard
                            label="Times/Day"
                            value={medicine.frequency === 'Daily' ? `${medicine.timesPerDay}x` : 'N/A'}
                            icon="medical-outline"
                            theme={theme}
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Reminders</Text>
                        <View style={[styles.reminderCard, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
                            {medicine.times && medicine.times.length > 0 ? (
                                medicine.times.map((time, index) => (
                                    <View key={index} style={[styles.reminderRow, index > 0 && { marginTop: 10 }]}>
                                        <Ionicons name="notifications" size={20} color={theme.primary} />
                                        <Text style={[styles.reminderText, { color: theme.text }]}>Dose {index + 1} - {time}</Text>
                                        <Ionicons name="checkmark-circle" size={24} color={theme.success} />
                                    </View>
                                ))
                            ) : (
                                <View style={styles.reminderRow}>
                                    <Ionicons name="notifications" size={20} color={theme.primary} />
                                    <Text style={[styles.reminderText, { color: theme.text }]}>No specific times set</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {medicine.instructions && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>Usage Instructions</Text>
                                <View style={[styles.aiBadge, { backgroundColor: theme.primary + '15' }]}>
                                    <Text style={[styles.aiBadgeText, { color: theme.primary }]}>✨ AI Assisted</Text>
                                </View>
                            </View>
                            <View style={[styles.reminderCard, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
                                <Text style={[styles.instructionsText, { color: theme.text }]}>
                                    {medicine.instructions}
                                </Text>
                            </View>
                        </View>
                    )}

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Expiry Status</Text>
                        <View style={[styles.reminderCard, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
                            <View style={styles.stockRow}>
                                <View>
                                    <Text style={[styles.stockLabel, { color: theme.icon }]}>Expiry Date</Text>
                                    <Text style={[styles.stockValue, { color: theme.text }]}>
                                        {new Date(medicine.expiryDate).toLocaleDateString()}
                                    </Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={[styles.stockLabel, { color: theme.icon }]}>Status</Text>
                                    <Text style={[styles.stockValue, { color: getStatusColor(medicine.status) }]}>
                                        {medicine.status}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {medicine.riskLevel && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Safety & Disposal</Text>
                            <View style={[styles.reminderCard, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
                                {(() => {
                                    const riskMeta = getRiskMetadata(medicine.riskLevel);
                                    return (
                                        <>
                                            <View style={styles.riskHeader}>
                                                <View style={[styles.riskBadge, { backgroundColor: riskMeta.color + '15' }]}>
                                                    <Ionicons name={riskMeta.icon} size={20} color={riskMeta.color} />
                                                    <Text style={[styles.riskLabel, { color: riskMeta.color }]}>
                                                        {riskMeta.label}
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text style={[styles.riskDescription, { color: theme.icon }]}>
                                                {riskMeta.description}
                                            </Text>
                                            <View style={[styles.disposalBox, { backgroundColor: theme.background, borderColor: theme.border, borderWidth: 1 }]}>
                                                <View style={styles.disposalHeader}>
                                                    <Ionicons name="leaf-outline" size={18} color={theme.primary} />
                                                    <Text style={[styles.disposalTitle, { color: theme.text }]}>Disposal Method</Text>
                                                </View>
                                                <Text style={[styles.disposalText, { color: theme.icon }]}>
                                                    {riskMeta.disposalMethod}
                                                </Text>
                                            </View>
                                        </>
                                    );
                                })()}
                            </View>
                        </View>
                    )}
                    {(() => {
                        const nextDoseTime = getNextDose(medicine.times);
                        const today = new Date().toISOString().split('T')[0];
                        const expectedTakenEntry = `${today} ${nextDoseTime}`;
                        const isTaken = medicine.takenHistory && medicine.takenHistory.includes(expectedTakenEntry);
                        const isRecycling = medicine.status === 'In Bag' || medicine.status === 'Recycled' || medicine.status === 'Pending Pickup';

                        if (isRecycling) {
                            return (
                                <View style={[styles.takeBtn, { backgroundColor: theme.success + '15', elevation: 0, shadowOpacity: 0 }]}>
                                    <Ionicons name="leaf" size={24} color={theme.success} />
                                    <Text style={[styles.takeBtnText, { color: theme.success }]}>Added to Recycling</Text>
                                </View>
                            );
                        }

                        // Check if medicine is expired
                        if (isExpired(medicine.expiryDate)) {
                            return (
                                <TouchableOpacity
                                    style={[styles.takeBtn, { backgroundColor: theme.danger }]}
                                    onPress={async () => {
                                        try {
                                            await medicineService.recycleMedicine(medicine.id);
                                            Alert.alert("Success", "Medicine added to recycling bag!");
                                        } catch (error) {
                                            console.error("Error recycling:", error);
                                        }
                                    }}
                                >
                                    <Ionicons name="trash-outline" size={24} color="#fff" />
                                    <Text style={styles.takeBtnText}>Expired - Add to Bag</Text>
                                </TouchableOpacity>
                            );
                        }

                        return (
                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    style={[styles.takeBtn, { flex: 2, backgroundColor: isTaken ? theme.success : theme.primary, opacity: isTaken ? 0.8 : 1 }]}
                                    disabled={isTaken}
                                    onPress={async () => {
                                        try {
                                            await medicineService.markAsTaken(medicine.id, nextDoseTime);
                                            Alert.alert("Success", "Medicine marked as taken!");
                                        } catch (error) {
                                            console.error("Error marking as taken:", error);
                                            Alert.alert("Error", "Failed to mark as taken");
                                        }
                                    }}
                                >
                                    <Ionicons name={isTaken ? "checkmark-done-circle-outline" : "checkmark-circle-outline"} size={24} color="#fff" />
                                    <Text style={styles.takeBtnText}>{isTaken ? "Taken" : "Mark as Taken"}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.recycleSmallBtn, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}
                                    onPress={async () => {
                                        Alert.alert(
                                            "Recycle Medicine",
                                            "No longer need this medicine? Add it to your recycling bag.",
                                            [
                                                { text: "Cancel", style: "cancel" },
                                                {
                                                    text: "Add to Bag",
                                                    onPress: async () => {
                                                        try {
                                                            await medicineService.recycleMedicine(medicine.id);
                                                            Alert.alert("Success", "Added to recycling bag!");
                                                        } catch (error) {
                                                            console.error("Error recycling:", error);
                                                        }
                                                    }
                                                }
                                            ]
                                        );
                                    }}
                                >
                                    <Ionicons name="leaf-outline" size={24} color={theme.primary} />
                                </TouchableOpacity>
                            </View>
                        );
                    })()}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

function InfoCard({ label, value, icon, theme }) {
    return (
        <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
            <Ionicons name={icon} size={20} color={theme.primary} />
            <Text style={[styles.infoLabel, { color: theme.icon }]}>{label}</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{value}</Text>
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
        paddingTop: 10,
        marginBottom: 20,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    topSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    medicineName: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    statusBadge: {
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    infoCard: {
        width: '48%',
        padding: 15,
        borderRadius: 20,
        marginBottom: 15,
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 8,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    reminderCard: {
        padding: 20,
        borderRadius: 25,
    },
    reminderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    reminderText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        marginLeft: 12,
    },
    stockRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    stockLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
    },
    stockValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    refillBtn: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
    },
    refillText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: 60,
        paddingRight: 20,
    },
    menuContent: {
        width: 180,
        borderRadius: 15,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 10,
    },
    menuText: {
        fontSize: 15,
        fontWeight: '600',
        marginLeft: 12,
    },
    menuDivider: {
        height: 1,
        marginVertical: 4,
        marginHorizontal: 8,
    },
    takeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    recycleSmallBtn: {
        width: 56,
        height: 56,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    takeBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    riskHeader: {
        marginBottom: 12,
    },
    riskBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        alignSelf: 'flex-start',
        gap: 6,
    },
    riskLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    riskDescription: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
    },
    disposalBox: {
        padding: 16,
        borderRadius: 16,
        marginTop: 8,
    },
    disposalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    disposalTitle: {
        fontSize: 15,
        fontWeight: '600',
    },
    disposalText: {
        fontSize: 14,
        lineHeight: 22,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    aiBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    aiBadgeText: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    instructionsText: {
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '500',
    },
});
