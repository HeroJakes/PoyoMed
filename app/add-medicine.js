import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
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
import { checkDrugInteractions, getMedicineTips } from '../services/aiService';
import { scheduleMedicationReminder } from '../utils/notificationUtils';
import { classifyMedicineRisk } from '../utils/riskClassification';

const { width } = Dimensions.get('window');

const ICONS = [
    'medical', 'nutrition', 'water', 'moon', 'fitness',
    'thermometer', 'flask', 'bandage', 'pulse', 'heart'
];

const THEME_COLORS = [
    '#FF8C42', '#FFB347', '#F9D423', '#82C91E', '#F06292',
    '#4DABF7', '#7950F2', '#BE4BDB', '#FAB005', '#FA5252'
];

export default function AddMedicine() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const gradients = Gradients;
    const isEditMode = params.mode === 'edit';
    const initialMedicine = params.medicine ? JSON.parse(params.medicine) : null;

    const [name, setName] = useState(initialMedicine?.name || '');
    const [dosage, setDosage] = useState(initialMedicine?.dosage || '');
    const [frequency, setFrequency] = useState(initialMedicine?.frequency || 'Daily');
    const [timesPerDay, setTimesPerDay] = useState(initialMedicine?.timesPerDay || 1);
    const [doseTimes, setDoseTimes] = useState([new Date()]);
    const [showPicker, setShowPicker] = useState(false);
    const [activeDoseIndex, setActiveDoseIndex] = useState(0);
    const [selectedIcon, setSelectedIcon] = useState(initialMedicine?.icon || 'medical');
    const [selectedColor, setSelectedColor] = useState(initialMedicine?.color || '#FF8C42');
    const [expiryDate, setExpiryDate] = useState(initialMedicine?.expiryDate ? new Date(initialMedicine.expiryDate) : new Date());
    const [showExpiryPicker, setShowExpiryPicker] = useState(false);
    const [isEstimated, setIsEstimated] = useState(false);
    const [instructions, setInstructions] = useState(initialMedicine?.instructions || '');
    const [isGeneratingTips, setIsGeneratingTips] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (initialMedicine && initialMedicine.times) {
            // Convert time strings back to Date objects if they exist
            const times = initialMedicine.times.map(t => {
                const [time, modifier] = t.split(' ');
                let [hours, minutes] = time.split(':');
                hours = parseInt(hours);
                if (modifier === 'PM' && hours < 12) hours += 12;
                if (modifier === 'AM' && hours === 12) hours = 0;
                const d = new Date();
                d.setHours(hours, parseInt(minutes));
                return d;
            });
            setDoseTimes(times);
            setTimesPerDay(times.length);
        }

        // Handle scanned data from AI
        if (params.scannedData) {
            try {
                const data = JSON.parse(params.scannedData);
                if (data.name) setName(data.name);
                if (data.dosage) setDosage(data.dosage);
                if (data.frequency) {
                    const freq = data.frequency.charAt(0).toUpperCase() + data.frequency.slice(1).toLowerCase();
                    if (frequencies.includes(freq)) {
                        setFrequency(freq);
                    }
                }
                if (data.timesPerDay && !isNaN(data.timesPerDay)) {
                    handleTimesChange(parseInt(data.timesPerDay));
                }
                if (data.expiry) {
                    // Try to parse expiry date if it's a valid date string
                    const parsedDate = new Date(data.expiry);
                    if (!isNaN(parsedDate.getTime())) {
                        setExpiryDate(parsedDate);

                        // Check if expired
                        if (parsedDate < new Date()) {
                            Alert.alert(
                                "Medicine Expired",
                                "This medicine appears to have expired. Would you like to add it to your recycling list instead?",
                                [
                                    { text: "No, keep adding", style: "cancel" },
                                    {
                                        text: "Yes, Recycle",
                                        onPress: () => {
                                            handleRecycle({
                                                name: data.name,
                                                dosage: data.dosage,
                                                icon: data.icon || 'medical',
                                                color: data.color || '#FF8C42',
                                                expiryDate: parsedDate.toISOString()
                                            });
                                        }
                                    }
                                ]
                            );
                        }
                    }
                }
                if (data.isEstimated) setIsEstimated(true);
                if (data.instructions) setInstructions(data.instructions);
            } catch (e) {
                console.error("Error parsing scanned data:", e);
            }
        }
    }, [params.scannedData]);

    const frequencies = ['Daily', 'Weekly', 'Monthly', 'As Needed'];
    const timesOptions = [1, 2, 3, 4];

    const handleTimesChange = (num) => {
        setTimesPerDay(num);
        const newTimes = [...doseTimes];
        if (num > doseTimes.length) {
            for (let i = doseTimes.length; i < num; i++) {
                newTimes.push(new Date());
            }
        } else {
            newTimes.splice(num);
        }
        setDoseTimes(newTimes);
    };

    const onTimeChange = (event, selectedDate) => {
        setShowPicker(Platform.OS === 'ios');
        if (selectedDate) {
            const newTimes = [...doseTimes];
            newTimes[activeDoseIndex] = selectedDate;
            setDoseTimes(newTimes);
        }
    };

    const formatTime = (date) => {
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const strMinutes = minutes < 10 ? '0' + minutes : minutes;
        return `${hours}:${strMinutes} ${ampm}`;
    };

    const handleGetTips = async () => {
        if (!name.trim()) {
            Alert.alert('Identify Medicine', 'Please enter a medicine name first so I can give you tips!');
            return;
        }

        setIsGeneratingTips(true);
        try {
            const tips = await getMedicineTips(name.trim(), instructions);
            setInstructions(tips);
        } catch (error) {
            console.error("Error getting tips:", error);
            Alert.alert("Error", "Could not get AI tips at this moment.");
        } finally {
            setIsGeneratingTips(false);
        }
    };

    const handleRecycle = async (overrideData = null) => {
        const medicineName = overrideData?.name || name;
        const medicineDosage = overrideData?.dosage || dosage;

        if (!medicineName.trim()) {
            Alert.alert('Error', 'Please enter the medicine name');
            return;
        }

        setIsLoading(true);
        try {
            const user = auth.currentUser;
            if (!user) {
                Alert.alert('Error', 'You must be logged in to recycle medicines');
                return;
            }

            // Interaction Check
            const activeMedsSnap = await getDocs(query(collection(db, 'users', user.uid, 'medicines'), where('status', '==', 'Active')));
            const activeMedNames = activeMedsSnap.docs.map(doc => doc.data().name);

            if (activeMedNames.length > 0) {
                const interaction = await checkDrugInteractions(medicineName, medicineDosage, activeMedNames);
                if (interaction.hasInteraction && interaction.severity === 'High') {
                    const proceed = await new Promise(resolve => {
                        Alert.alert(
                            '⚠️ Interaction Warning',
                            `${interaction.warningMessage}\n\nReason: ${interaction.reason}\n\nThis is an AI-generated warning. Do you still want to proceed with recycling this medicine into your bag?`,
                            [
                                { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
                                { text: 'Proceed Anyway', onPress: () => resolve(true), style: 'destructive' }
                            ]
                        );
                    });
                    if (!proceed) {
                        setIsLoading(false);
                        return;
                    }
                }
            }

            const medicineData = {
                name: medicineName.trim(),
                dosage: medicineDosage.trim(),
                frequency: overrideData?.frequency || frequency,
                timesPerDay: 0,
                times: [],
                nextDose: '--',
                icon: overrideData?.icon || selectedIcon,
                color: overrideData?.color || selectedColor,
                expiryDate: overrideData?.expiryDate || expiryDate.toISOString(),
                instructions: overrideData?.instructions || instructions.trim(),
                status: 'In Bag',
                userId: user.uid,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                recycledAt: new Date().toISOString()
            };

            await addDoc(collection(db, 'users', user.uid, 'medicines'), medicineData);

            Alert.alert(
                'Added to Bag!',
                `${medicineName} has been added to your recycling bag.`,
                [{ text: 'View Bag', onPress: () => router.replace('/') }]
            );
        } catch (error) {
            console.error('Error recycling medicine:', error);
            Alert.alert('Error', 'Failed to add to recycling bag.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter the medicine name');
            return;
        }
        if (!dosage.trim()) {
            Alert.alert('Error', 'Please enter the dosage');
            return;
        }

        setIsLoading(true);
        try {
            const user = auth.currentUser;
            if (!user) {
                Alert.alert('Error', 'You must be logged in to add medicines');
                return;
            }

            // Interaction Check
            const activeMedsSnap = await getDocs(query(collection(db, 'users', user.uid, 'medicines'), where('status', '==', 'Active')));
            const activeMedNames = activeMedsSnap.docs.map(doc => doc.data().name);

            if (activeMedNames.length > 0) {
                const interaction = await checkDrugInteractions(name.trim(), dosage.trim(), activeMedNames);
                if (interaction.hasInteraction && interaction.severity === 'High') {
                    const proceed = await new Promise(resolve => {
                        Alert.alert(
                            '⚠️ Interaction Warning',
                            `${interaction.warningMessage}\n\nReason: ${interaction.reason}\n\nThis is an AI-generated warning. Do you still want to add this medicine and take it alongside your current prescriptions?`,
                            [
                                { text: 'No, Cancel', onPress: () => resolve(false), style: 'cancel' },
                                { text: 'Proceed Anyway', onPress: () => resolve(true), style: 'destructive' }
                            ]
                        );
                    });
                    if (!proceed) {
                        setIsLoading(false);
                        return;
                    }
                }
            }

            // Classify medicine risk using AI
            const riskLevel = await classifyMedicineRisk(name.trim(), dosage.trim());

            const medicineData = {
                name: name.trim(),
                dosage: dosage.trim(),
                frequency,
                timesPerDay: frequency === 'Daily' ? timesPerDay : 1,
                times: frequency === 'Daily' ? doseTimes.map(t => formatTime(t)) : [],
                nextDose: frequency === 'Daily' ? formatTime(doseTimes[0]) : '--', // Simple logic for now
                icon: selectedIcon,
                color: selectedColor,
                expiryDate: expiryDate.toISOString(),
                instructions: instructions.trim(),
                status: 'Active', // Default status
                riskLevel: riskLevel, // AI-classified risk level
                userId: user.uid,
                updatedAt: new Date().toISOString(),
            };

            if (isEditMode && initialMedicine?.id) {
                await updateDoc(doc(db, 'users', user.uid, 'medicines', initialMedicine.id), medicineData);
                // Schedule reminder
                await scheduleMedicationReminder({ id: initialMedicine.id, ...medicineData });
                Alert.alert('Success', 'Medicine updated successfully');
            } else {
                medicineData.createdAt = new Date().toISOString();
                const docRef = await addDoc(collection(db, 'users', user.uid, 'medicines'), medicineData);
                // Schedule reminder
                await scheduleMedicationReminder({ id: docRef.id, ...medicineData });
                Alert.alert('Success', 'Medicine added successfully');
            }

            router.back();
        } catch (error) {
            console.error('Error saving medicine:', error);
            Alert.alert('Error', 'Failed to save medicine. Please try again.');
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
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={[styles.backBtn, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="chevron-back" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>{isEditMode ? 'Edit Medicine' : 'Add Medicine'}</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Basic Info Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Basic Information</Text>
                        <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
                            <Ionicons name="pencil-outline" size={20} color={theme.icon} style={styles.inputIcon} />
                            <TextInput
                                placeholder="Medicine Name"
                                placeholderTextColor={theme.icon}
                                style={[styles.input, { color: theme.text }]}
                                value={name}
                                onChangeText={setName}
                            />
                        </View>
                        <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
                            <Ionicons name="flask-outline" size={20} color={theme.icon} style={styles.inputIcon} />
                            <TextInput
                                placeholder="Dose Quantity (e.g. 1 pill)"
                                placeholderTextColor={theme.icon}
                                style={[styles.input, { color: theme.text }]}
                                value={dosage}
                                onChangeText={setDosage}
                            />
                        </View>

                        <Text style={[styles.label, { color: theme.icon, marginTop: 10 }]}>Expiry Date</Text>
                        <TouchableOpacity
                            onPress={() => setShowExpiryPicker(!showExpiryPicker)}
                            style={[
                                styles.inputContainer,
                                {
                                    backgroundColor: theme.card,
                                    borderColor: showExpiryPicker ? theme.primary : theme.border,
                                    borderWidth: showExpiryPicker ? 2 : 1
                                }
                            ]}
                        >
                            <Ionicons
                                name="calendar-outline"
                                size={20}
                                color={showExpiryPicker ? theme.primary : theme.icon}
                                style={styles.inputIcon}
                            />
                            <Text style={[styles.inputText, { color: theme.text }]}>
                                {expiryDate.toLocaleDateString()}
                            </Text>
                        </TouchableOpacity>

                        {showExpiryPicker && (
                            <DateTimePicker
                                value={expiryDate}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={(event, selectedDate) => {
                                    setShowExpiryPicker(Platform.OS === 'ios');
                                    if (selectedDate) setExpiryDate(selectedDate);
                                }}
                                minimumDate={new Date(2000, 0, 1)} // Allow past dates for detection
                                textColor={theme.text}
                            />
                        )}
                        {isEstimated && (
                            <View style={styles.estimatedContainer}>
                                <Ionicons name="information-circle" size={16} color={theme.warning} />
                                <Text style={[styles.estimatedText, { color: theme.icon }]}>
                                    Expiry date estimated from dispensed date
                                </Text>
                            </View>
                        )}

                        <View style={[styles.sectionHeader, { marginTop: 25 }]}>
                            <Text style={[styles.label, { color: theme.icon, marginBottom: 0 }]}>Usage Instructions</Text>
                            <TouchableOpacity
                                style={[styles.aiTipsBtn, { backgroundColor: theme.primary + '15' }]}
                                onPress={handleGetTips}
                                disabled={isGeneratingTips}
                            >
                                {isGeneratingTips ? (
                                    <ActivityIndicator size="small" color={theme.primary} />
                                ) : (
                                    <>
                                        <Text style={[styles.aiTipsText, { color: theme.primary }]}>✨ Get AI Tips</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.textAreaContainer, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
                            <TextInput
                                placeholder="e.g. Take after food, avoid dairy, or click for AI tips..."
                                placeholderTextColor={theme.icon}
                                style={[styles.textArea, { color: theme.text }]}
                                value={instructions}
                                onChangeText={setInstructions}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>
                        <Text style={[styles.disclaimerText, { color: theme.icon }]}>
                            AI tips are for guidance only. Always prioritize doctor's advice.
                        </Text>
                    </View>

                    {/* Schedule Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Schedule</Text>

                        <Text style={[styles.label, { color: theme.icon }]}>Frequency</Text>
                        <View style={styles.frequencyRow}>
                            {frequencies.map((f) => (
                                <TouchableOpacity
                                    key={f}
                                    onPress={() => setFrequency(f)}
                                    style={[
                                        styles.frequencyChip,
                                        frequency === f
                                            ? { backgroundColor: theme.primary }
                                            : { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }
                                    ]}
                                >
                                    <Text style={[
                                        styles.frequencyText,
                                        frequency === f ? { color: '#fff' } : { color: theme.text }
                                    ]}>
                                        {f}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {frequency === 'Daily' && (
                            <>
                                <Text style={[styles.label, { color: theme.icon }]}>Times per day</Text>
                                <View style={styles.frequencyRow}>
                                    {timesOptions.map((num) => (
                                        <TouchableOpacity
                                            key={num}
                                            onPress={() => handleTimesChange(num)}
                                            style={[
                                                styles.frequencyChip,
                                                timesPerDay === num
                                                    ? { backgroundColor: theme.primary }
                                                    : { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }
                                            ]}
                                        >
                                            <Text style={[
                                                styles.frequencyText,
                                                timesPerDay === num ? { color: '#fff' } : { color: theme.text }
                                            ]}>
                                                {num}x
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={[styles.label, { color: theme.icon }]}>Dose Times</Text>
                                {doseTimes.map((t, index) => {
                                    const isActive = showPicker && activeDoseIndex === index;
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => {
                                                if (showPicker && activeDoseIndex === index) {
                                                    setShowPicker(false);
                                                } else {
                                                    setActiveDoseIndex(index);
                                                    setShowPicker(true);
                                                }
                                            }}
                                            style={[
                                                styles.inputContainer,
                                                {
                                                    backgroundColor: theme.card,
                                                    borderColor: isActive ? theme.primary : theme.border,
                                                    borderWidth: isActive ? 2 : 1
                                                }
                                            ]}
                                        >
                                            <Ionicons
                                                name="time-outline"
                                                size={20}
                                                color={isActive ? theme.primary : theme.icon}
                                                style={styles.inputIcon}
                                            />
                                            <Text style={[styles.inputText, { color: theme.text }]}>
                                                {formatTime(t)}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </>
                        )}

                        {frequency !== 'Daily' && (
                            <TouchableOpacity
                                onPress={() => {
                                    if (showPicker && activeDoseIndex === 0) {
                                        setShowPicker(false);
                                    } else {
                                        setActiveDoseIndex(0);
                                        setShowPicker(true);
                                    }
                                }}
                                style={[
                                    styles.inputContainer,
                                    {
                                        backgroundColor: theme.card,
                                        borderColor: showPicker ? theme.primary : theme.border,
                                        borderWidth: showPicker ? 2 : 1
                                    }
                                ]}
                            >
                                <Ionicons
                                    name="time-outline"
                                    size={20}
                                    color={showPicker ? theme.primary : theme.icon}
                                    style={styles.inputIcon}
                                />
                                <Text style={[styles.inputText, { color: theme.text }]}>
                                    {formatTime(doseTimes[0])}
                                </Text>
                            </TouchableOpacity>
                        )}

                        {showPicker && (
                            <DateTimePicker
                                value={doseTimes[activeDoseIndex]}
                                mode="time"
                                is24Hour={false}
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={onTimeChange}
                                textColor={theme.text}
                            />
                        )}
                    </View>

                    {/* Appearance Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>

                        <Text style={[styles.label, { color: theme.icon }]}>Select Icon</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconList}>
                            {ICONS.map((icon) => (
                                <TouchableOpacity
                                    key={icon}
                                    onPress={() => setSelectedIcon(icon)}
                                    style={[
                                        styles.iconItem,
                                        { backgroundColor: theme.card, borderColor: selectedIcon === icon ? theme.primary : theme.border, borderWidth: selectedIcon === icon ? 2 : 1 }
                                    ]}
                                >
                                    <Ionicons name={icon} size={24} color={selectedIcon === icon ? theme.primary : theme.icon} />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Text style={[styles.label, { color: theme.icon }]}>Select Theme Color</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorList}>
                            {THEME_COLORS.map((color) => (
                                <TouchableOpacity
                                    key={color}
                                    onPress={() => setSelectedColor(color)}
                                    style={[
                                        styles.colorItem,
                                        { backgroundColor: color, borderColor: selectedColor === color ? theme.text : 'transparent', borderWidth: 2 }
                                    ]}
                                />
                            ))}
                        </ScrollView>
                    </View>

                    {/* Preview Card */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Preview</Text>
                        <View style={[styles.previewCard, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
                            <View style={[styles.previewIconContainer, { backgroundColor: selectedColor + '15' }]}>
                                <Ionicons name={selectedIcon} size={24} color={selectedColor} />
                            </View>
                            <View style={styles.previewInfo}>
                                <Text style={[styles.previewName, { color: theme.text }]}>{name || 'Medicine Name'}</Text>
                                <Text style={[styles.previewDosage, { color: theme.icon }]}>
                                    {dosage || 'Dose Quantity'} • {frequency} {frequency === 'Daily' ? `(${timesPerDay}x)` : ''}
                                </Text>
                                <View style={styles.previewFooter}>
                                    <Ionicons name="time-outline" size={14} color={theme.icon} />
                                    <Text style={[styles.previewTime, { color: theme.icon }]}>
                                        {frequency === 'Daily'
                                            ? ` Times: ${doseTimes.map(t => formatTime(t)).join(', ')}`
                                            : ` Next: ${formatTime(doseTimes[0])}`}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                {/* Save & Recycle Buttons */}
                <View style={styles.footer}>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.recycleBtn, { borderColor: theme.border, borderWidth: 1, opacity: isLoading ? 0.6 : 1 }]}
                            onPress={() => {
                                Alert.alert(
                                    "Recycle Medicine",
                                    "This will add this medicine to your recycling bag for safe disposal. Proceed?",
                                    [
                                        { text: "Cancel", style: "cancel" },
                                        { text: "Recycle", onPress: () => handleRecycle() }
                                    ]
                                );
                            }}
                            disabled={isLoading}
                        >
                            <Ionicons name="refresh-outline" size={20} color={theme.text} />
                            <Text style={[styles.recycleBtnText, { color: theme.text }]}>Recycle</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.saveBtn}
                            onPress={handleSave}
                            activeOpacity={0.8}
                            disabled={isLoading}
                        >
                            <LinearGradient
                                colors={gradients.warm}
                                style={styles.saveGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Text style={styles.saveBtnText}>
                                    {isLoading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Save Medicine')}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
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
        fontSize: 20,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 55,
        borderRadius: 15,
        paddingHorizontal: 15,
        marginBottom: 15,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    inputText: {
        fontSize: 16,
    },
    frequencyRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 15,
    },
    frequencyChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        marginRight: 10,
        marginBottom: 10,
    },
    frequencyText: {
        fontSize: 14,
        fontWeight: '600',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
    },
    iconList: {
        marginBottom: 20,
    },
    iconItem: {
        width: 50,
        height: 50,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    colorList: {
        marginBottom: 10,
    },
    colorItem: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    previewCard: {
        flexDirection: 'row',
        padding: 15,
        borderRadius: 25,
        alignItems: 'center',
    },
    previewIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    previewInfo: {
        flex: 1,
    },
    previewName: {
        fontSize: 17,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    previewDosage: {
        fontSize: 13,
        marginBottom: 8,
    },
    previewFooter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    previewTime: {
        fontSize: 12,
        fontWeight: '500',
    },
    footer: {
        padding: 20,
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },
    saveBtn: {
        flex: 2,
        height: 60,
        borderRadius: 20,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#FF8C42',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    saveGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    recycleBtn: {
        flex: 1,
        height: 60,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    recycleBtnText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    estimatedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
        paddingHorizontal: 4,
    },
    estimatedText: {
        fontSize: 12,
        fontStyle: 'italic',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    aiTipsBtn: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    aiTipsText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    textAreaContainer: {
        borderRadius: 15,
        padding: 12,
        minHeight: 100,
    },
    textArea: {
        fontSize: 15,
        lineHeight: 22,
    },
    disclaimerText: {
        fontSize: 11,
        fontStyle: 'italic',
        marginTop: 8,
        textAlign: 'right',
    },
});
