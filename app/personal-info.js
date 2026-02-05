import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
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
    const [photoURL, setPhotoURL] = useState(null);
    const [uploading, setUploading] = useState(false);

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
                    setPhotoURL(data.photoURL || null);
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

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please grant gallery permissions to change your profile picture.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.3, // Lower quality for Firestore storage
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
            saveImageAsBase64(result.assets[0].base64, result.assets[0].uri);
        }
    };

    const saveImageAsBase64 = async (base64Data, uri) => {
        const user = auth.currentUser;
        if (!user) return;

        setUploading(true);
        try {
            const formattedBase64 = `data:image/jpeg;base64,${base64Data}`;

            // Update Firestore immediately
            await setDoc(doc(db, 'users', user.uid), {
                photoURL: formattedBase64,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            setPhotoURL(formattedBase64);
            console.log("Profile picture saved to Firestore as Base64");
        } catch (error) {
            console.error("Error saving image:", error);
            Alert.alert('Save Failed', 'There was an error saving your profile picture to the database.');
        } finally {
            setUploading(false);
        }
    };

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
                        <View style={styles.avatarContainer}>
                            <TouchableOpacity onPress={pickImage} disabled={uploading} style={styles.avatarOpacity}>
                                <View style={[styles.avatarWrapper, { borderColor: theme.border, borderWidth: 1 }]}>
                                    {photoURL ? (
                                        <>
                                            <View style={styles.avatarImageWrapper}>
                                                <Image
                                                    source={{ uri: photoURL }}
                                                    style={styles.avatarStyle}
                                                />
                                                {uploading && (
                                                    <View style={[StyleSheet.absoluteFill, styles.uploadOverlay]}>
                                                        <ActivityIndicator size="large" color={theme.primary} />
                                                    </View>
                                                )}
                                            </View>
                                            <View style={styles.cameraBadge}>
                                                <Ionicons name="camera" size={16} color="#FFF" />
                                            </View>
                                        </>
                                    ) : (
                                        <>
                                            <View style={[styles.avatarPlaceholder, { backgroundColor: theme.card }]}>
                                                {uploading ? (
                                                    <ActivityIndicator size="large" color={theme.primary} />
                                                ) : (
                                                    <Ionicons name="person" size={50} color={theme.icon} />
                                                )}
                                            </View>
                                            <View style={styles.cameraBadge}>
                                                <Ionicons name="camera" size={16} color="#FFF" />
                                            </View>
                                        </>
                                    )}
                                </View>
                            </TouchableOpacity>
                            <Text style={[styles.avatarHint, { color: theme.icon }]}>Tap to change profile picture</Text>
                        </View>

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
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarWrapper: {
        width: 120,
        height: 120,
        borderRadius: 60,
        padding: 5,
        backgroundColor: '#FFF',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.1,
                shadowRadius: 15,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 55,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarStyle: {
        width: '100%',
        height: '100%',
        borderRadius: 55,
    },
    avatarImageWrapper: {
        width: '100%',
        height: '100%',
        borderRadius: 55,
        overflow: 'hidden',
    },
    uploadOverlay: {
        backgroundColor: 'rgba(255,255,255,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraBadge: {
        position: 'absolute',
        zIndex: 999,
        bottom: 0,
        right: 0,
        backgroundColor: '#FF8C42',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFF',
    },
    uploadLoader: {
        position: 'absolute',
        zIndex: 1,
        alignSelf: 'center',
        top: '40%',
    },
    avatarHint: {
        fontSize: 12,
        marginTop: 10,
        fontWeight: '600',
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
