import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import {
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

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const gradients = ThemeGradients[colorScheme];

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);


    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Check if user exists in Firestore, if not add them (sync safety)
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (!userDoc.exists()) {
                await setDoc(doc(db, 'users', user.uid), {
                    uid: user.uid,
                    email: user.email,
                    name: user.displayName || 'User',
                    createdAt: new Date().toISOString(),
                });
            }

            router.replace('/(tabs)');
        } catch (error) {
            // console.error('Login error:', error);
            let errorMessage = 'An unexpected error occurred.';
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                errorMessage = 'Invalid email or password.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Please enter a valid email address.';
            } else {
                // For debugging: show the actual error
                errorMessage = `Error: ${error.message} (${error.code})`;
            }
            Alert.alert('Login Failed', errorMessage);
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
                        <View style={styles.header}>
                            <View style={styles.logoContainer}>
                                <Image
                                    source={require('../assets/images/logo.png')}
                                    style={styles.logoImage}
                                    resizeMode="contain"
                                />
                            </View>
                            <Text style={[styles.title, { color: theme.text }]}>Welcome Back</Text>
                            <Text style={[styles.subtitle, { color: theme.icon }]}>Sign in to continue your health journey</Text>
                        </View>

                        <View style={styles.form}>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>Email Address</Text>
                                <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
                                    <Ionicons name="mail-outline" size={20} color={theme.icon} style={styles.inputIcon} />
                                    <TextInput
                                        placeholder="Enter your email address"
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
                                        placeholder="Enter your password"
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

                            <View style={styles.optionsRow}>
                                <TouchableOpacity
                                    style={styles.rememberMe}
                                    onPress={() => setRememberMe(!rememberMe)}
                                    activeOpacity={0.7}
                                    disabled={isLoading}
                                >
                                    <View style={[
                                        styles.checkbox,
                                        { borderColor: theme.border },
                                        rememberMe && { backgroundColor: theme.primary, borderColor: theme.primary }
                                    ]}>
                                        {rememberMe && <Ionicons name="checkmark" size={12} color={theme.background} />}
                                    </View>
                                    <Text style={[styles.rememberMeText, { color: theme.icon }]}>Remember me</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.forgotPassword} disabled={isLoading}>
                                    <Text style={[styles.forgotPasswordText, { color: theme.primary }]}>Forgot password?</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={[styles.loginBtn, isLoading && { opacity: 0.7 }]}
                                onPress={handleLogin}
                                disabled={isLoading}
                            >
                                <LinearGradient
                                    colors={gradients.warm}
                                    style={styles.loginGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <Text style={styles.loginBtnText}>{isLoading ? 'Signing In...' : 'Sign In'}</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>


                        <View style={styles.footer}>
                            <Text style={[styles.footerText, { color: theme.icon }]}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => router.push('/register')} disabled={isLoading}>
                                <Text style={[styles.signUpText, { color: theme.primary }]}>Sign Up</Text>
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
        paddingTop: height * 0.08,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        marginBottom: -50,
    },
    logoImage: {
        width: 180,
        height: 180,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
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
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 30,
    },
    forgotPasswordText: {
        fontSize: 14,
        fontWeight: '600',
    },
    loginBtn: {
        height: 56,
        borderRadius: 28,
        overflow: 'hidden',
        marginTop: 10,
    },
    loginGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    optionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingHorizontal: 4,
    },
    rememberMe: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 1,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rememberMeText: {
        fontSize: 14,
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
    signUpText: {
        fontSize: 15,
        fontWeight: 'bold',
    },
});
