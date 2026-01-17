import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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
import { askGemini } from '../../services/aiService';

const { width, height } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

export default function CameraScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState('back');
    const [flash, setFlash] = useState('off');
    const [isScanning, setIsScanning] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisStep, setAnalysisStep] = useState(0);
    const cameraRef = useRef(null);
    const router = useRouter();

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

    const handleCapture = async () => {
        if (!cameraRef.current || isScanning || isAnalyzing) return;

        try {
            setIsAnalyzing(true);
            setAnalysisStep(0);

            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.5,
                base64: true,
            });

            // Simulate steps for better UX
            setAnalysisStep(1); // Detecting name
            await new Promise(resolve => setTimeout(resolve, 800));

            setAnalysisStep(2); // Reading dosage

            const prompt = `Extract medication information from this image. Return ONLY a JSON object with these keys: name, dosage, frequency, timesPerDay, expiry, isEstimated, instructions.

Logic for extraction:
- name: The brand or generic name of the medicine. Normalize and correct any obvious misspellings (e.g., if the text says "fver", return "Fever").
- dosage: Look for phrases like 'Take [X] [unit]' (e.g., 'Take 1 pill' or 'Take 2 tablets'). Use the quantity and unit as the dosage.
- frequency: One of 'Daily', 'Weekly', 'Monthly', 'As Needed'.
- timesPerDay: Look for phrases like '[X] times daily', '[X] times a day', or '[X]x daily'. Return ONLY the number (e.g., 2).
- expiry: 
    IMPORTANT - Be very careful to distinguish between dates:
    
    1. EXPIRY DATE (use this if found):
       - Look for labels: "Expiry Date", "EXP", "Expiry", "Use Before", "Best Before"
       - In Malay: "Tarikh Luput", "Luput"
       - In Chinese: "有效期", "到期日"
       - This is the ACTUAL expiry date - use it directly
    
    2. DISPENSED/ISSUED DATE (NOT expiry):
       - Look for labels: "Date", "Dispensed Date", "Issued Date", "Date Dispensed"
       - In Malay: "Tarikh", "Tarikh Dikeluarkan"
       - In Chinese: "日期", "配药日期"
       - If ONLY this date is found (no expiry date), estimate expiry:
         * Add 1 year for tablets/capsules
         * Add 6 months for liquids/syrups
    
    3. Return the date in YYYY-MM-DD format.
    
- isEstimated: Boolean. True if the expiry was estimated from a dispensed date, false if a clear expiry date was found.
- instructions: Any other usage notes (e.g., 'After food').

If a field is not found, use an empty string (or 1 for timesPerDay, false for isEstimated).`;

            const responseText = await askGemini([
                prompt,
                {
                    inlineData: {
                        data: photo.base64,
                        mimeType: "image/jpeg",
                    },
                },
            ]);

            setAnalysisStep(3); // Analyzing frequency
            await new Promise(resolve => setTimeout(resolve, 500));

            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

            // Navigate to Add Medicine with pre-filled data
            router.push({
                pathname: '/add-medicine',
                params: {
                    scannedData: JSON.stringify(result)
                }
            });
        } catch (error) {
            console.error("Capture Error:", error);
            Alert.alert("Error", "Failed to extract information from the image. Please try again.");
        } finally {
            setIsAnalyzing(false);
            setAnalysisStep(0);
        }
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.5,
                base64: true,
            });

            if (!result.canceled && result.assets[0].base64) {
                setIsAnalyzing(true);
                setAnalysisStep(0);

                // Simulate steps
                setAnalysisStep(1);
                await new Promise(resolve => setTimeout(resolve, 600));
                setAnalysisStep(2);

                const prompt = `Extract medication information from this image. Return ONLY a JSON object with these keys: name, dosage, frequency, timesPerDay, expiry, isEstimated, instructions.

Logic for extraction:
- name: The brand or generic name of the medicine. Normalize and correct any obvious misspellings (e.g., if the text says "fver", return "Fever").
- dosage: Look for phrases like 'Take [X] [unit]' (e.g., 'Take 1 pill' or 'Take 2 tablets'). Use the quantity and unit as the dosage.
- frequency: One of 'Daily', 'Weekly', 'Monthly', 'As Needed'.
- timesPerDay: Look for phrases like '[X] times daily', '[X] times a day', or '[X]x daily'. Return ONLY the number (e.g., 2).
- expiry: 
    IMPORTANT - Be very careful to distinguish between dates:
    
    1. EXPIRY DATE (use this if found):
       - Look for labels: "Expiry Date", "EXP", "Expiry", "Use Before", "Best Before"
       - In Malay: "Tarikh Luput", "Luput"
       - In Chinese: "有效期", "到期日"
       - This is the ACTUAL expiry date - use it directly
    
    2. DISPENSED/ISSUED DATE (NOT expiry):
       - Look for labels: "Date", "Dispensed Date", "Issued Date", "Date Dispensed"
       - In Malay: "Tarikh", "Tarikh Dikeluarkan"
       - In Chinese: "日期", "配药日期"
       - If ONLY this date is found (no expiry date), estimate expiry:
         * Add 1 year for tablets/capsules
         * Add 6 months for liquids/syrups
    
    3. Return the date in YYYY-MM-DD format.
    
- isEstimated: Boolean. True if the expiry was estimated from a dispensed date, false if a clear expiry date was found.
- instructions: Any other usage notes (e.g., 'After food').

If a field is not found, use an empty string (or 1 for timesPerDay, false for isEstimated).`;

                const responseText = await askGemini([
                    prompt,
                    {
                        inlineData: {
                            data: result.assets[0].base64,
                            mimeType: "image/jpeg",
                        },
                    },
                ]);

                setAnalysisStep(3);
                await new Promise(resolve => setTimeout(resolve, 400));

                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                const aiResult = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

                router.push({
                    pathname: '/add-medicine',
                    params: {
                        scannedData: JSON.stringify(aiResult)
                    }
                });
            }
        } catch (error) {
            console.error("Pick Image Error:", error);
            Alert.alert("Error", "Failed to process the selected image.");
        } finally {
            setIsAnalyzing(false);
            setAnalysisStep(0);
        }
    };

    return (
        <View style={styles.container}>
            <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                facing={facing}
                enableTorch={flash === 'on'}
            />

            {/* Scanning Overlay */}
            <View style={styles.overlay} pointerEvents="none">
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
                    <TouchableOpacity
                        style={styles.galleryButton}
                        onPress={pickImage}
                        disabled={isScanning || isAnalyzing}
                    >
                        <Ionicons name="images-outline" size={24} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.captureButton}
                        onPress={handleCapture}
                        disabled={isScanning || isAnalyzing}
                    >
                        <LinearGradient
                            colors={gradients.warm}
                            style={styles.captureGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            {isScanning || isAnalyzing ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <View style={styles.captureInner} />
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.galleryButton}
                        onPress={() => {
                            Alert.alert(
                                "How to Scan",
                                "• Align the medicine label within the frame.\n\n• The AI will detect the name, dosage, and expiry date.\n\n• For hospital meds without an expiry date, the AI will use the 'Dispensed Date' to estimate a safe expiry.\n\n• If a medicine is expired, we'll help you recycle it safely!",
                                [{ text: "Got it!" }]
                            );
                        }}
                    >
                        <Ionicons name="help-circle-outline" size={26} color="#fff" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <AnalysisOverlay visible={isAnalyzing} step={analysisStep} theme={theme} />
        </View>
    );
}

function AnalysisOverlay({ visible, step, theme }) {
    if (!visible) return null;

    const steps = [
        { id: 0, label: 'Initializing AI engine...', icon: 'flash-outline' },
        { id: 1, label: 'Detecting medicine name...', icon: 'search-outline' },
        { id: 2, label: 'Reading dosage information...', icon: 'medkit-outline' },
        { id: 3, label: 'Analyzing frequency...', icon: 'time-outline' },
    ];

    return (
        <View style={styles.analysisContainer}>
            <Animated.View
                entering={Animated.FadeIn}
                exiting={Animated.FadeOut}
                style={styles.analysisContent}
            >
                <View style={styles.analysisHeader}>
                    <View style={styles.analysisIconContainer}>
                        <Ionicons name="scan-outline" size={40} color={theme.primary} />
                    </View>
                    <Text style={[styles.analysisTitle, { color: theme.text }]}>Analyzing...</Text>
                    <Text style={[styles.analysisSubtitle, { color: theme.icon }]}>
                        AI is detecting medicine information
                    </Text>
                </View>

                <View style={styles.stepsContainer}>
                    {steps.map((item, index) => {
                        const isActive = step === item.id;
                        const isCompleted = step > item.id;

                        return (
                            <View key={item.id} style={[
                                styles.stepItem,
                                isActive && styles.stepItemActive,
                                { backgroundColor: isActive ? theme.primary + '10' : 'rgba(255,255,255,0.05)' }
                            ]}>
                                <View style={styles.stepIconLabel}>
                                    <Ionicons
                                        name={isCompleted ? "checkmark-circle" : item.icon}
                                        size={22}
                                        color={isCompleted ? "#4CAF50" : (isActive ? theme.primary : theme.icon)}
                                    />
                                    <Text style={[
                                        styles.stepLabel,
                                        { color: isActive ? theme.text : theme.icon, fontWeight: isActive ? '600' : '400' }
                                    ]}>
                                        {item.label}
                                    </Text>
                                </View>
                                {isActive && <ActivityIndicator size="small" color={theme.primary} />}
                            </View>
                        );
                    })}
                </View>
            </Animated.View>
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
    analysisContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        zIndex: 1000,
    },
    analysisContent: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 30,
        padding: 30,
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    analysisHeader: {
        alignItems: 'center',
        marginBottom: 30,
    },
    analysisIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 140, 66, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    analysisTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    analysisSubtitle: {
        fontSize: 14,
        textAlign: 'center',
    },
    stepsContainer: {
        width: '100%',
        gap: 12,
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        width: '100%',
    },
    stepItemActive: {
        borderWidth: 1,
        borderColor: 'rgba(255, 140, 66, 0.2)',
    },
    stepIconLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    stepLabel: {
        fontSize: 15,
    },
});
