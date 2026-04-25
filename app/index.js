import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    Easing,
    FadeIn,
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';




const THEME = {
    primary: '#FF8A50', // Soft vibrant orange
    primaryDark: '#F4511E', // Darker orange for gradients/shadows
    secondary: '#FFF3E0', // Very light orange/beige
    success: '#66BB6A', // Soft green for eco
    background: ['#FFF8E1', '#FFFFFF'], // Warm Beige -> White
    text: '#37474F', // Dark Blue-Grey for contrast
    textLight: '#78909C', // Light Blue-Grey
};

const OrbitIcon = ({ icon, color, size = 50, radius = 100, duration = 10000, initialAngle = 0 }) => {
    const angle = useSharedValue(initialAngle);

    useEffect(() => {
        angle.value = withRepeat(
            withTiming(initialAngle + 360, {
                duration: duration,
                easing: Easing.linear,
            }),
            -1,
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        const rad = (angle.value * Math.PI) / 180;
        return {
            transform: [
                { translateX: radius * Math.cos(rad) },
                { translateY: radius * Math.sin(rad) },
            ],
        };
    });

    return (
        <Animated.View style={[styles.orbitItemContainer, animatedStyle]}>
            <View style={[styles.orbitIconCircle, { shadowColor: color }]}>
                {/* Icons in reference are colored, inside white bubbles */}
                <Ionicons name={icon} size={24} color={color} />
            </View>
        </Animated.View>
    );
};

export default function OnboardingScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#FFF8E1', '#FFF3E0', '#FFFFFF']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.contentContainer}>

                    <View style={styles.headerRow}>
                        {/* Logo Pill */}
                        <Animated.View entering={FadeInDown.duration(600)} style={styles.logoPill}>
                            <View style={styles.logoIconBg}>
                                <Ionicons name="leaf" size={14} color="#5D4037" />
                            </View>
                            <Text style={styles.logoText}>PoyoMed</Text>
                        </Animated.View>

                        {/* Top Right Icon (from reference) */}
                        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.topRightIcon}>
                            <Ionicons name="fitness" size={20} color="#5D4037" />
                        </Animated.View>
                    </View>

                    <View style={styles.orbitContainer}>
                        {/* Center Planet - Large Orange Squircle with Pill */}
                        <Animated.View entering={FadeIn.delay(300).duration(800)} style={styles.centerPlanet}>
                            <LinearGradient
                                colors={['#FF8A50', '#F4511E']} // Orange Gradient
                                style={styles.planetGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Ionicons name="medical" size={56} color="#FFFFFF" style={{ opacity: 0.9 }} />
                                {/* Detail: Small reflection/shine */}
                                <View style={styles.planetShine} />
                            </LinearGradient>
                        </Animated.View>

                        {/* Orbiting Icons - Matching reference icons */}
                        <OrbitIcon icon="leaf" color="#66BB6A" radius={120} duration={14000} initialAngle={200} />
                        <OrbitIcon icon="thermometer" color="#EF5350" radius={120} duration={14000} initialAngle={320} />
                        <OrbitIcon icon="bandage" color="#42A5F5" radius={120} duration={14000} initialAngle={80} />
                    </View>

                    <View style={styles.bottomSection}>
                        <Animated.View entering={FadeInUp.delay(500).duration(600)}>
                            <Text style={styles.heroTitle}>Manage meds,{'\n'}save the planet</Text>
                            <Text style={styles.heroSubtitle}>
                                Smart medication tracking with AI-powered insights and eco-friendly recycling
                            </Text>
                        </Animated.View>

                        <Animated.View entering={FadeInUp.delay(700).duration(600)} style={styles.chipsContainer}>
                            <View style={styles.chipRow}>
                                <View style={styles.chip}>
                                    <Ionicons name="scan" size={18} color="#5D4037" />
                                    <Text style={styles.chipText}>Smart Scan</Text>
                                </View>
                                <View style={styles.chip}>
                                    <Ionicons name="happy" size={18} color="#5D4037" />
                                    <Text style={styles.chipText}>AI Insights</Text>
                                </View>
                            </View>
                            <View style={styles.chip}>
                                <Ionicons name="leaf" size={18} color="#66BB6A" />
                                <Text style={[styles.chipText, { color: '#37474F' }]}>Eco Impact</Text>
                            </View>
                        </Animated.View>

                        <Animated.View entering={FadeInUp.delay(900).duration(600)} style={styles.actionContainer}>
                            <TouchableOpacity
                                style={[styles.primaryBtn, { backgroundColor: '#FF7043' }]} // Vibrant Orange
                                onPress={() => router.push('/register')}
                                activeOpacity={0.9}
                            >
                                <Text style={styles.primaryBtnText}>Create Account</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.secondaryBtn} // White button
                                onPress={() => router.push('/login')}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.secondaryBtnText}>Log In</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>

                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF8E1', // Fallback
    },
    safeArea: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 10,
    },
    /* Header */
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    logoPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 24,
        shadowColor: '#F4511E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    logoIconBg: {
        marginRight: 8,
    },
    logoText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#37474F',
    },
    topRightIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#F4511E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    /* Orbit Animation */
    orbitContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // maxHeight: 380,
    },
    centerPlanet: {
        width: 120,
        height: 120,
        borderRadius: 36, // Squircle
        shadowColor: '#F4511E',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.35,
        shadowRadius: 24,
        elevation: 10,
        position: 'absolute',
        zIndex: 10,
    },
    planetGradient: {
        flex: 1,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    planetShine: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 60,
        height: 60,
        borderTopRightRadius: 36,
        backgroundColor: '#FFFFFF',
        opacity: 0.15,
        borderBottomLeftRadius: 60,
    },
    orbitItemContainer: {
        position: 'absolute',
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    orbitIconCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#A1887F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    /* Bottom Section */
    bottomSection: {
        paddingBottom: 40,
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#263238',
        marginBottom: 12,
        textAlign: 'center',
        lineHeight: 38,
        letterSpacing: -0.5,
    },
    heroSubtitle: {
        fontSize: 15,
        color: '#78909C',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 20,
        marginBottom: 28,
    },
    chipsContainer: {
        alignItems: 'center',
        gap: 12,
        marginBottom: 32,
    },
    chipRow: {
        flexDirection: 'row',
        gap: 12,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 24,
        gap: 8,
        shadowColor: '#F4511E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    chipText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#37474F',
    },
    /* Actions */
    actionContainer: {
        gap: 14,
    },
    primaryBtn: {
        height: 58,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#F4511E',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    primaryBtnText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: 'bold',
    },
    secondaryBtn: {
        height: 58,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    secondaryBtnText: {
        color: '#37474F',
        fontSize: 17,
        fontWeight: 'bold',
    },
});
