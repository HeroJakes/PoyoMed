import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, ThemeGradients } from '../constants/theme';
import { auth, db } from '../firebase';
import { useColorScheme } from '../hooks/use-color-scheme';

const { width } = Dimensions.get('window');

export default function PersonalInfoScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const gradients = ThemeGradients[colorScheme];

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            const user = auth.currentUser;
            if (!user) {
                router.replace('/login');
                return;
            }

            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setName(data.name || '');
                    setPhone(data.phone || '');
                    setAddress(data.address || '');
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                Alert.alert('Error', 'Failed to load profile data.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleSave = async () => {
        const user = auth.currentUser;
        if (!user) return;

        if (!name.trim()) {
            Alert.alert('Required', 'Please enter your name.');
            return;
        }

        setSaving(true);
        try {
            await setDoc(doc(db, 'users', user.uid), {
                name: name.trim(),
                phone: phone.trim(),
                address: address.trim(),
                updatedAt: new Date().toISOString()
            }, { merge: true });

            Alert.alert('Success', 'Personal information updated successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error("Error saving user data:", error);
            Alert.alert('Error', 'Failed to save information.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
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
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={[styles.backBtn, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}
                            onPress={() => router.back()}
                        >
                            <Ionicons name="chevron-back" size={24} color={theme.text} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: theme.text }]}>Personal Information</Text>
                        <View style={{ width: 44 }} />
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.icon }]}>Full Name</Text>
                                <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                                    <Ionicons name="person-outline" size={20} color={theme.primary} style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, { color: theme.text }]}
                                        placeholder="Enter your full name"
                                        placeholderTextColor={theme.icon + '80'}
                                        value={name}
                                        onChangeText={setName}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.icon }]}>Phone Number</Text>
                                <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                                    <Ionicons name="call-outline" size={20} color={theme.primary} style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, { color: theme.text }]}
                                        placeholder="e.g. +60123456789"
                                        placeholderTextColor={theme.icon + '80'}
                                        keyboardType="phone-pad"
                                        value={phone}
                                        onChangeText={setPhone}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.icon }]}>Default Pickup Address</Text>
                                <View style={[styles.inputContainer, styles.textAreaContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                                    <Ionicons name="location-outline" size={20} color={theme.primary} style={[styles.inputIcon, { marginTop: 12 }]} />
                                    <TextInput
                                        style={[styles.input, styles.textArea, { color: theme.text }]}
                                        placeholder="Enter your street address, unit number, and postcode"
                                        placeholderTextColor={theme.icon + '80'}
                                        multiline
                                        numberOfLines={4}
                                        value={address}
                                        onChangeText={setAddress}
                                    />
                                </View>
                                <Text style={[styles.hint, { color: theme.icon }]}>This address will be auto-filled during recycling requests.</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.saveBtn, { opacity: saving ? 0.7 : 1 }]}
                            onPress={handleSave}
                            disabled={saving}
                        >
                            <LinearGradient
                                colors={gradients.warm}
                                style={styles.saveGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                {saving ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <>
                                        <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
                                        <Text style={styles.saveText}>Save Changes</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
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
        fontSize: 18,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 20,
    },
    card: {
        padding: 20,
        borderRadius: 25,
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 15,
        borderWidth: 1,
        height: 56,
        paddingHorizontal: 15,
    },
    textAreaContainer: {
        height: 120,
        alignItems: 'flex-start',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    textArea: {
        height: '100%',
        paddingTop: 12,
        textAlignVertical: 'top',
    },
    hint: {
        fontSize: 12,
        marginTop: 8,
        marginLeft: 4,
        fontStyle: 'italic',
    },
    saveBtn: {
        height: 56,
        borderRadius: 18,
        overflow: 'hidden',
        marginTop: 10,
    },
    saveGradient: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    saveText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
