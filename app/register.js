import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Gradients } from '../constants/theme';
import { auth, db } from '../firebase';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const gradients = Gradients;

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);


    const handleRegister = async () => {
        if (!email || !password || !name) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password should be at least 6 characters');
            return;
        }

        setIsLoading(true);
        try {
            // 1. Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Save user data to Firestore
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                name: name,
                email: email,
                createdAt: new Date().toISOString(),
            });

            Alert.alert('Success', 'Account created successfully!');
            router.replace('/(tabs)');
        } catch (error) {
            // console.error('Registration error:', error);
            let errorMessage = 'An unexpected error occurred.';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'This email is already in use.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Please enter a valid email address.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'The password is too weak.';
            }
            Alert.alert('Registration Failed', errorMessage);
        } finally {
            setIsLoading(false);
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
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} disabled={isLoading}>
                            <Ionicons name="chevron-back" size={24} color={theme.text} />
                        </TouchableOpacity>

                        <View style={styles.header}>
                            <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>
                            <Text style={[styles.subtitle, { color: theme.icon }]}>Join PoyoMed and start managing your health better</Text>
                        </View>

                        <View style={styles.form}>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>Full Name</Text>
                                <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
                                    <Ionicons name="person-outline" size={20} color={theme.icon} style={styles.inputIcon} />
                                    <TextInput
                                        placeholder="Enter your full name"
                                        placeholderTextColor={theme.icon}
                                        style={[styles.input, { color: theme.text }]}
                                        value={name}
                                        onChangeText={setName}
                                        editable={!isLoading}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>Email</Text>
                                <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
                                    <Ionicons name="mail-outline" size={20} color={theme.icon} style={styles.inputIcon} />
                                    <TextInput
                                        placeholder="Enter your email"
                                        placeholderTextColor={theme.icon}
                                        style={[styles.input, { color: theme.text }]}
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        editable={!isLoading}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>Password</Text>
                                <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
                                    <Ionicons name="lock-closed-outline" size={20} color={theme.icon} style={styles.inputIcon} />
                                    <TextInput
                                        placeholder="Create a password"
                                        placeholderTextColor={theme.icon}
                                        style={[styles.input, { color: theme.text }]}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        editable={!isLoading}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} disabled={isLoading}>
                                        <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={theme.icon} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.registerBtn, isLoading && { opacity: 0.7 }]}
                                onPress={handleRegister}
                                disabled={isLoading}
                            >
                                <LinearGradient
                                    colors={gradients.warm}
                                    style={styles.registerGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <Text style={styles.registerBtnText}>{isLoading ? 'Creating Account...' : 'Sign Up'}</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.footer}>
                            <Text style={[styles.footerText, { color: theme.icon }]}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => router.push('/login')} disabled={isLoading}>
                                <Text style={[styles.signInText, { color: theme.primary }]}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
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
    scrollContent: {
        padding: 24,
        paddingTop: 20,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    header: {
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        lineHeight: 24,
    },
    form: {
        marginBottom: 30,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 56,
        borderRadius: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    registerBtn: {
        height: 56,
        borderRadius: 28,
        overflow: 'hidden',
        marginTop: 10,
    },
    registerGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    footerText: {
        fontSize: 15,
    },
    signInText: {
        fontSize: 15,
        fontWeight: 'bold',
    },
});
