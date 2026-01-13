import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Gradients } from '../../constants/theme';

const { width, height } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

export default function CameraScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState('back');
    const [flash, setFlash] = useState('off');
    const [isScanning, setIsScanning] = useState(true);

    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const gradients = Gradients;

    // Animation for scanning line
    const scanLineY = useSharedValue(0);

    useEffect(() => {
        if (permission?.granted) {
            scanLineY.value = 0;
            scanLineY.value = withRepeat(
                withTiming(SCAN_AREA_SIZE, {
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                }),
                -1,
                true
            );
        } else {
            scanLineY.value = 0;
        }
    }, [permission?.granted]);

    const animatedLineStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: scanLineY.value }],
    }));

    if (!permission) {
        // Camera permissions are still loading.
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <View style={styles.container}>
                <LinearGradient
                    colors={gradients.main}
                    style={StyleSheet.absoluteFill}
                />
                <SafeAreaView style={styles.permissionContainer}>
                    <View style={styles.permissionIconContainer}>
                        <Ionicons name="camera-outline" size={80} color={theme.primary} />
                    </View>
                    <Text style={[styles.permissionTitle, { color: theme.text }]}>Camera Access</Text>
                    <Text style={[styles.permissionSubtitle, { color: theme.icon }]}>
                        We need your permission to use the camera to scan your medicines.
                    </Text>
                    <TouchableOpacity
                        style={[styles.permissionButton, { backgroundColor: theme.primary }]}
                        onPress={requestPermission}
                    >
                        <Text style={styles.permissionButtonText}>Grant Permission</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </View>
        );
    }

    const toggleCameraFacing = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    };

    const toggleFlash = () => {
        setFlash(current => (current === 'off' ? 'on' : 'off'));
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFill}
                facing={facing}
                enableTorch={flash === 'on'}
            >
                {/* Scanning Overlay */}
                <View style={styles.overlay}>
                    <View style={styles.topOverlay} />
                    <View style={styles.middleRow}>
                        <View style={styles.sideOverlay} />
                        <View style={styles.scanArea}>
                            {/* Corner Borders */}
                            <View style={[styles.corner, styles.topLeft, { borderColor: theme.primary }]} />
                            <View style={[styles.corner, styles.topRight, { borderColor: theme.primary }]} />
                            <View style={[styles.corner, styles.bottomLeft, { borderColor: theme.primary }]} />
                            <View style={[styles.corner, styles.bottomRight, { borderColor: theme.primary }]} />

                            {/* Scanning Line */}
                            <Animated.View style={[styles.scanLineContainer, animatedLineStyle]}>
                                <View style={[styles.scanLine, { backgroundColor: theme.primary }]} />
                            </Animated.View>
                        </View>
                        <View style={styles.sideOverlay} />
                    </View>
                    <View style={styles.bottomOverlay}>
                        <Text style={styles.instructionText}>Align medicine label within the frame</Text>
                    </View>
                </View>

                {/* Controls */}
                <SafeAreaView style={styles.controlsContainer}>
                    <View style={styles.topControls}>
                        <TouchableOpacity style={styles.iconButton} onPress={toggleFlash}>
                            <Ionicons
                                name={flash === 'on' ? "flash" : "flash-off"}
                                size={24}
                                color="#fff"
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton} onPress={toggleCameraFacing}>
                            <Ionicons name="camera-reverse-outline" size={26} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.bottomControls}>
                        <TouchableOpacity style={styles.galleryButton}>
                            <Ionicons name="images-outline" size={24} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.captureButton}>
                            <LinearGradient
                                colors={gradients.warm}
                                style={styles.captureGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <View style={styles.captureInner} />
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.galleryButton}>
                            <Ionicons name="help-circle-outline" size={26} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    permissionIconContainer: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255, 140, 66, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    permissionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    permissionSubtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
    },
    permissionButton: {
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    permissionButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    overlay: {
        flex: 1,
    },
    topOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    middleRow: {
        flexDirection: 'row',
        height: SCAN_AREA_SIZE,
    },
    sideOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    scanArea: {
        width: SCAN_AREA_SIZE,
        height: SCAN_AREA_SIZE,
        backgroundColor: 'transparent',
        position: 'relative',
    },
    bottomOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        paddingTop: 20,
    },
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderWidth: 4,
    },
    topLeft: {
        top: 0,
        left: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderTopLeftRadius: 15,
    },
    topRight: {
        top: 0,
        right: 0,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
        borderTopRightRadius: 15,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderRightWidth: 0,
        borderTopWidth: 0,
        borderBottomLeftRadius: 15,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderBottomRightRadius: 15,
    },
    scanLineContainer: {
        position: 'absolute',
        width: '100%',
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scanLine: {
        height: 2,
        width: '100%',
    },
    instructionText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        overflow: 'hidden',
    },
    controlsContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'space-between',
        padding: 20,
    },
    topControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    bottomControls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginBottom: 85,
    },
    iconButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    galleryButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButton: {
        width: 84,
        height: 84,
        borderRadius: 42,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureGradient: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
    },
});
