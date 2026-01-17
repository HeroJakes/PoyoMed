import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { addDoc, collection } from 'firebase/firestore';
import {
    Alert,
    Dimensions,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Gradients } from '../../constants/theme';
import { auth, db } from '../../firebase';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const gradients = Gradients;

    const handleComingSoon = (feature) => {
        Alert.alert('Coming Soon', `${feature} functionality will be available in a future update!`);
    };

    const handleSettingPress = (label) => {
        Alert.alert('Settings', `You selected: ${label}`);
    };

    const handleLogout = () => {
        router.replace('/login');
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
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Header Section */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
                        <TouchableOpacity
                            style={[styles.settingsBtn, { backgroundColor: 'rgba(255,255,255,0.6)', borderColor: theme.border, borderWidth: 1 }]}
                            onPress={() => handleComingSoon('App Settings')}
                        >
                            <Ionicons name="cog-outline" size={22} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    {/* User Info Card */}
                    <View style={[styles.userCard, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
                        <LinearGradient
                            colors={gradients.warm}
                            style={styles.avatarGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Ionicons name="sunny" size={40} color="#fff" />
                        </LinearGradient>
                        <View style={styles.userInfo}>
                            <Text style={[styles.userName, { color: theme.text }]}>Ivan</Text>
                            <Text style={[styles.userEmail, { color: theme.icon }]}>ivan@poyomed.com</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.editBtn, { backgroundColor: theme.primary + '15' }]}
                            onPress={() => handleComingSoon('Profile Editing')}
                        >
                            <Text style={[styles.editBtnText, { color: theme.primary }]}>Edit</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Settings Sections */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.icon }]}>Account</Text>
                        <View style={[styles.settingsGroup, { backgroundColor: 'rgba(255,255,255,0.6)', borderColor: theme.border, borderWidth: 1 }]}>
                            <SettingItem icon="person-outline" label="Personal Information" theme={theme} onPress={() => handleSettingPress('Personal Information')} />
                            <View style={[styles.divider, { backgroundColor: theme.border }]} />
                            <SettingItem icon="notifications-outline" label="Notifications" theme={theme} onPress={() => handleSettingPress('Notifications')} />
                            <View style={[styles.divider, { backgroundColor: theme.border }]} />
                            <SettingItem icon="shield-checkmark-outline" label="Security" theme={theme} onPress={() => handleSettingPress('Security')} />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.icon }]}>App Settings</Text>
                        <View style={[styles.settingsGroup, { backgroundColor: 'rgba(255,255,255,0.6)', borderColor: theme.border, borderWidth: 1 }]}>
                            <SettingItem icon="color-palette-outline" label="Theme" theme={theme} value="System" onPress={() => handleSettingPress('Theme')} />
                            <View style={[styles.divider, { backgroundColor: theme.border }]} />
                            <SettingItem icon="language-outline" label="Language" theme={theme} value="English" onPress={() => handleSettingPress('Language')} />
                            <View style={[styles.divider, { backgroundColor: theme.border }]} />
                            <SettingItem icon="help-circle-outline" label="Help & Support" theme={theme} onPress={() => handleSettingPress('Help & Support')} />
                        </View>
                    </View>

                    {/* Developer Tools */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.icon }]}>Developer Tools</Text>
                        <View style={[styles.settingsGroup, { backgroundColor: 'rgba(255,255,255,0.6)', borderColor: theme.border, borderWidth: 1 }]}>
                            <SettingItem
                                icon="code-slash-outline"
                                label="Generate Dummy Data"
                                theme={theme}
                                onPress={async () => {
                                    const user = auth.currentUser;
                                    if (!user) return;

                                    const dummyMedicines = [
                                        {
                                            name: 'Paracetamol',
                                            dosage: '500mg',
                                            frequency: 'Daily',
                                            timesPerDay: 3,
                                            times: ['08:00 AM', '02:00 PM', '08:00 PM'],
                                            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                                            stock: 20,
                                            color: '#FF6B6B',
                                            icon: 'medical',
                                            status: 'Active',
                                            createdAt: new Date().toISOString()
                                        },
                                        {
                                            name: 'Amoxicillin',
                                            dosage: '250mg',
                                            frequency: 'Daily',
                                            timesPerDay: 2,
                                            times: ['09:00 AM', '09:00 PM'],
                                            expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                                            stock: 14,
                                            color: '#4ECDC4',
                                            icon: 'flask',
                                            status: 'Expiring',
                                            createdAt: new Date().toISOString()
                                        },
                                        {
                                            name: 'Vitamin C',
                                            dosage: '1000mg',
                                            frequency: 'Daily',
                                            timesPerDay: 1,
                                            times: ['07:00 AM'],
                                            expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
                                            stock: 50,
                                            color: '#FFD93D',
                                            icon: 'nutrition',
                                            status: 'Active',
                                            createdAt: new Date().toISOString()
                                        },
                                        {
                                            name: 'Ibuprofen',
                                            dosage: '400mg',
                                            frequency: 'As Needed',
                                            timesPerDay: 0,
                                            times: [],
                                            expiryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                                            stock: 10,
                                            color: '#FF8C42',
                                            icon: 'bandage',
                                            status: 'Expired',
                                            createdAt: new Date().toISOString()
                                        },
                                        {
                                            name: 'Lisinopril',
                                            dosage: '10mg',
                                            frequency: 'Daily',
                                            timesPerDay: 1,
                                            times: ['08:00 AM'],
                                            expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
                                            stock: 5,
                                            color: '#6C5CE7',
                                            icon: 'heart',
                                            status: 'Low Stock',
                                            createdAt: new Date().toISOString()
                                        }
                                    ];

                                    try {
                                        const batchPromises = dummyMedicines.map(med =>
                                            addDoc(collection(db, 'users', user.uid, 'medicines'), med)
                                        );
                                        await Promise.all(batchPromises);
                                        Alert.alert('Success', 'Dummy data added successfully!');
                                    } catch (error) {
                                        console.error("Error adding dummy data:", error);
                                        Alert.alert('Error', 'Failed to add dummy data');
                                    }
                                }}
                            />
                        </View>
                    </View>

                    {/* Logout Button */}
                    <TouchableOpacity
                        style={[styles.logoutBtn, { borderColor: theme.danger, borderWidth: 1 }]}
                        onPress={handleLogout}
                    >
                        <Ionicons name="log-out-outline" size={20} color={theme.danger} />
                        <Text style={[styles.logoutText, { color: theme.danger }]}>Log Out</Text>
                    </TouchableOpacity>

                    <Text style={[styles.versionText, { color: theme.icon }]}>Version 1.0.0</Text>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

function SettingItem({ icon, label, theme, value, onPress }) {
    return (
        <TouchableOpacity style={styles.settingItem} onPress={onPress}>
            <View style={styles.settingLeft}>
                <View style={[styles.settingIconContainer, { backgroundColor: theme.card }]}>
                    <Ionicons name={icon} size={20} color={theme.primary} />
                </View>
                <Text style={[styles.settingLabel, { color: theme.text }]}>{label}</Text>
            </View>
            <View style={styles.settingRight}>
                {value && <Text style={[styles.settingValue, { color: theme.icon }]}>{value}</Text>}
                <Ionicons name="chevron-forward" size={18} color={theme.icon} />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 120,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    settingsBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 30,
        marginBottom: 30,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.05,
                shadowRadius: 20,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    avatarGradient: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userInfo: {
        flex: 1,
        marginLeft: 15,
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
    },
    editBtn: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 12,
    },
    editBtnText: {
        fontSize: 13,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 5,
    },
    settingsGroup: {
        borderRadius: 25,
        overflow: 'hidden',
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    settingLabel: {
        fontSize: 15,
        fontWeight: '500',
    },
    settingRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingValue: {
        fontSize: 14,
        marginRight: 8,
    },
    divider: {
        height: 1,
        marginHorizontal: 16,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 20,
        marginTop: 10,
        marginBottom: 20,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    versionText: {
        textAlign: 'center',
        fontSize: 12,
        marginBottom: 20,
    },
});
