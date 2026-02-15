import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
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
import Animated, {
    Easing,
    FadeIn,
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, ThemeGradients } from '../constants/theme';
import { auth, db } from '../firebase';
import { useColorScheme } from '../hooks/use-color-scheme';

const { width, height } = Dimensions.get('window');

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

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

    // Button pulse animation
    const btnScale = useSharedValue(1);

    useEffect(() => {
        btnScale.value = withRepeat(
            withSequence(
                withTiming(1.02, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, []);

    const btnAnimStyle = useAnimatedStyle(() => ({
        transform: [{ scale: btnScale.value }],
    }));

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
            let errorMessage = 'An unexpected error occurred.';
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                errorMessage = 'Invalid email or password.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Please enter a valid email address.';
            } else {
                errorMessage = `Error: ${error.message} (${error.code})`;
            }
            Alert.alert('Login Failed', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = (provider) => {
        Alert.alert('Coming Soon', `${provider} sign-in will be available soon!`);
    };

    return (
        <View style={styles.container}>
            {/* Gradient Top Section */}
            <LinearGradient
                colors={gradients.warm}
                style={styles.topSection}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <SafeAreaView>
                    {/* Back Button */}
                    <Animated.View entering={FadeIn.duration(400)}>
                        <TouchableOpacity
                            style={styles.backBtn}
                            onPress={() => router.back()}
                            disabled={isLoading}
                        >
                            <Ionicons name="chevron-back" size={24} color="#fff" />
                            <Text style={styles.backText}>Back</Text>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Logo + Title */}
                    <Animated.View
                        entering={FadeIn.duration(600).easing(Easing.out(Easing.exp))}
                        style={styles.topContent}
                    >
                        <Image
                            source={require('../assets/images/logo.png')}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.heroTitle}>Welcome Back</Text>
                        <Text style={styles.heroSubtitle}>
                            Ready to continue your health journey?{'\n'}
                            <Text style={styles.heroSubtitleBold}>Your path is right here.</Text>
                        </Text>
                    </Animated.View>
                </SafeAreaView>
            </LinearGradient>

            {/* White Card Bottom */}
            <Animated.View
                entering={FadeInUp.delay(200).duration(500).easing(Easing.out(Easing.exp))}
                style={[styles.bottomCard, { backgroundColor: theme.background }]}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.cardContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Email Input */}
                        <Animated.View
                            entering={FadeInDown.delay(350).duration(400).easing(Easing.out(Easing.exp))}
                        >
                            <View style={[styles.inputContainer, { borderColor: theme.border }]}>
                                <TextInput
                                    placeholder="Enter email address"
                                    placeholderTextColor={theme.icon + '99'}
                                    style={[styles.input, { color: theme.text }]}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    editable={!isLoading}
                                />
                            </View>
                        </Animated.View>

                        {/* Password Input */}
                        <Animated.View
                            entering={FadeInDown.delay(450).duration(400).easing(Easing.out(Easing.exp))}
                        >
                            <View style={[styles.inputContainer, { borderColor: theme.border }]}>
                                <TextInput
                                    placeholder="Password"
                                    placeholderTextColor={theme.icon + '99'}
                                    style={[styles.input, { color: theme.text }]}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    editable={!isLoading}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    disabled={isLoading}
                                    style={styles.eyeBtn}
                                >
                                    <Ionicons
                                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color={theme.icon}
                                    />
                                </TouchableOpacity>
                            </View>
                        </Animated.View>

                        {/* Options Row */}
                        <Animated.View
                            entering={FadeInDown.delay(550).duration(400).easing(Easing.out(Easing.exp))}
                            style={styles.optionsRow}
                        >
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
                                    {rememberMe && <Ionicons name="checkmark" size={12} color="#fff" />}
                                </View>
                                <Text style={[styles.rememberMeText, { color: theme.icon }]}>Remember me</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.forgotPassword} disabled={isLoading}>
                                <Text style={[styles.forgotPasswordText, { color: theme.primary }]}>Forgot password?</Text>
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Sign In Button */}
                        <Animated.View
                            entering={FadeInDown.delay(650).duration(400).easing(Easing.out(Easing.exp))}
                        >
                            <AnimatedTouchable
                                style={[styles.loginBtn, isLoading && { opacity: 0.7 }, !isLoading && btnAnimStyle]}
                                onPress={handleLogin}
                                disabled={isLoading}
                                activeOpacity={0.85}
                            >
                                <LinearGradient
                                    colors={gradients.warm}
                                    style={styles.loginGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <Text style={styles.loginBtnText}>{isLoading ? 'Signing In...' : 'Log In'}</Text>
                                </LinearGradient>
                            </AnimatedTouchable>
                        </Animated.View>

                        {/* Social Login Divider */}
                        <Animated.View
                            entering={FadeInDown.delay(750).duration(400).easing(Easing.out(Easing.exp))}
                            style={styles.dividerRow}
                        >
                            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                            <Text style={[styles.dividerText, { color: theme.icon }]}>Sign in with</Text>
                            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                        </Animated.View>

                        {/* Social Icons */}
                        <Animated.View
                            entering={FadeInDown.delay(850).duration(400).easing(Easing.out(Easing.exp))}
                            style={styles.socialRow}
                        >
                            <TouchableOpacity
                                style={[styles.socialBtn, { borderColor: theme.border }]}
                                onPress={() => handleSocialLogin('Facebook')}
                            >
                                <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.socialBtn, { borderColor: theme.border }]}
                                onPress={() => handleSocialLogin('Google')}
                            >
                                <Ionicons name="logo-google" size={24} color="#EA4335" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.socialBtn, { borderColor: theme.border }]}
                                onPress={() => handleSocialLogin('Apple')}
                            >
                                <Ionicons name="logo-apple" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Footer */}
                        <Animated.View
                            entering={FadeInDown.delay(950).duration(400).easing(Easing.out(Easing.exp))}
                            style={styles.footer}
                        >
                            <Text style={[styles.footerText, { color: theme.icon }]}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => router.push('/register')} disabled={isLoading}>
                                <Text style={[styles.signUpText, { color: theme.primary }]}>Sign Up</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    /* ── Top gradient section ── */
    topSection: {
        paddingBottom: 50,
        paddingHorizontal: 24,
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        alignSelf: 'flex-start',
        gap: 4,
    },
    backText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    topContent: {
        alignItems: 'center',
        marginTop: 10,
    },
    logoImage: {
        width: 170,
        height: 170,
        marginBottom: -50,
    },
    heroTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    heroSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center',
        lineHeight: 20,
    },
    heroSubtitleBold: {
        fontWeight: 'bold',
        color: '#fff',
    },
    /* ── White card bottom ── */
    bottomCard: {
        flex: 1,
        marginTop: -30,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    cardContent: {
        padding: 28,
        paddingTop: 32,
    },
    /* ── Inputs ── */
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 16,
        height: 54,
        marginBottom: 16,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    eyeBtn: {
        padding: 4,
    },
    /* ── Options ── */
    optionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        paddingHorizontal: 2,
    },
    rememberMe: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 1.5,
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rememberMeText: {
        fontSize: 13,
    },
    forgotPassword: {},
    forgotPasswordText: {
        fontSize: 13,
        fontWeight: '600',
    },
    /* ── Button ── */
    loginBtn: {
        height: 54,
        borderRadius: 27,
        overflow: 'hidden',
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
    /* ── Social ── */
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 28,
        marginBottom: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        fontSize: 13,
        marginHorizontal: 14,
        fontWeight: '500',
    },
    socialRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 28,
    },
    socialBtn: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    /* ── Footer ── */
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
    },
    signUpText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});
