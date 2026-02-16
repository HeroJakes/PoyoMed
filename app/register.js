import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
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
import { useColorScheme } from '../hooks/use-color-scheme';
import { authService } from '../services/authService';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function RegisterScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const gradients = ThemeGradients[colorScheme];

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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
            await authService.register(email, password, name);
            Alert.alert('Success', 'Account created successfully!');
            router.replace('/(tabs)');
        } catch (error) {
            console.error(error);
            Alert.alert('Registration Failed', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = (provider) => {
        Alert.alert('Coming Soon', `${provider} sign-up will be available soon!`);
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={gradients.warm}
                style={styles.topSection}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <SafeAreaView>
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

                    <Animated.View
                        entering={FadeIn.duration(600).easing(Easing.out(Easing.exp))}
                        style={styles.topContent}
                    >
                        <Image
                            source={require('../assets/images/logo.png')}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.heroTitle}>Create Your Account</Text>
                        <Text style={styles.heroSubtitle}>
                            We're here to help you manage{'\n'}your health. <Text style={styles.heroSubtitleBold}>Are you ready?</Text>
                        </Text>
                    </Animated.View>
                </SafeAreaView>
            </LinearGradient>

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
                        {/* Full Name Input */}
                        <Animated.View
                            entering={FadeInDown.delay(350).duration(400).easing(Easing.out(Easing.exp))}
                        >
                            <View style={[styles.inputContainer, { borderColor: theme.border }]}>
                                <TextInput
                                    placeholder="Enter full name"
                                    placeholderTextColor={theme.icon + '99'}
                                    style={[styles.input, { color: theme.text }]}
                                    value={name}
                                    onChangeText={setName}
                                    editable={!isLoading}
                                />
                            </View>
                        </Animated.View>

                        {/* Email Input */}
                        <Animated.View
                            entering={FadeInDown.delay(450).duration(400).easing(Easing.out(Easing.exp))}
                        >
                            <View style={[styles.inputContainer, { borderColor: theme.border }]}>
                                <TextInput
                                    placeholder="Enter email"
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
                            entering={FadeInDown.delay(550).duration(400).easing(Easing.out(Easing.exp))}
                        >
                            <View style={[styles.inputContainer, { borderColor: theme.border }]}>
                                <TextInput
                                    placeholder="Enter password"
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

                        {/* Forgot Password */}
                        <Animated.View
                            entering={FadeInDown.delay(600).duration(400).easing(Easing.out(Easing.exp))}
                            style={styles.forgotRow}
                        >
                            <TouchableOpacity disabled={isLoading}>
                                <Text style={[styles.forgotPasswordText, { color: theme.primary }]}>Forgot password?</Text>
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Get Started Button */}
                        <Animated.View
                            entering={FadeInDown.delay(700).duration(400).easing(Easing.out(Easing.exp))}
                        >
                            <AnimatedTouchable
                                style={[styles.registerBtn, isLoading && { opacity: 0.7 }, !isLoading && btnAnimStyle]}
                                onPress={handleRegister}
                                disabled={isLoading}
                                activeOpacity={0.85}
                            >
                                <LinearGradient
                                    colors={gradients.warm}
                                    style={styles.registerGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <Text style={styles.registerBtnText}>{isLoading ? 'Creating Account...' : 'Get Started'}</Text>
                                </LinearGradient>
                            </AnimatedTouchable>
                        </Animated.View>

                        {/* Social Login Divider */}
                        <Animated.View
                            entering={FadeInDown.delay(800).duration(400).easing(Easing.out(Easing.exp))}
                            style={styles.dividerRow}
                        >
                            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                            <Text style={[styles.dividerText, { color: theme.icon }]}>Sign up with</Text>
                            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                        </Animated.View>

                        {/* Social Icons */}
                        <Animated.View
                            entering={FadeInDown.delay(900).duration(400).easing(Easing.out(Easing.exp))}
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
                            entering={FadeInDown.delay(1000).duration(400).easing(Easing.out(Easing.exp))}
                            style={styles.footer}
                        >
                            <Text style={[styles.footerText, { color: theme.icon }]}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => router.push('/login')} disabled={isLoading}>
                                <Text style={[styles.signInText, { color: theme.primary }]}>Log In</Text>
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
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
        textAlign: 'center',
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
    /* ── Forgot password ── */
    forgotRow: {
        alignItems: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        fontSize: 13,
        fontWeight: '600',
    },
    /* ── Button ── */
    registerBtn: {
        height: 54,
        borderRadius: 27,
        overflow: 'hidden',
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
    signInText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});
