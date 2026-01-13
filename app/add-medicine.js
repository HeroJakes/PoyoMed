import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
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
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const gradients = Gradients;

    const [name, setName] = useState('');
    const [dosage, setDosage] = useState('');
    const [frequency, setFrequency] = useState('Daily');
    const [timesPerDay, setTimesPerDay] = useState(1);
    const [doseTimes, setDoseTimes] = useState([new Date()]);
    const [showPicker, setShowPicker] = useState(false);
    const [activeDoseIndex, setActiveDoseIndex] = useState(0);
    const [selectedIcon, setSelectedIcon] = useState('medical');
    const [selectedColor, setSelectedColor] = useState('#FF8C42');

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
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const handleSave = () => {
        // Mock save action
        router.back();
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
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Add Medicine</Text>
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
                                placeholder="Dosage (e.g. 500mg)"
                                placeholderTextColor={theme.icon}
                                style={[styles.input, { color: theme.text }]}
                                value={dosage}
                                onChangeText={setDosage}
                            />
                        </View>
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
                                                setActiveDoseIndex(index);
                                                setShowPicker(true);
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
                                    setActiveDoseIndex(0);
                                    setShowPicker(true);
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
                                    {dosage || 'Dosage'} • {frequency} {frequency === 'Daily' ? `(${timesPerDay}x)` : ''}
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

                {/* Save Button */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.saveBtn}
                        onPress={handleSave}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={gradients.warm}
                            style={styles.saveGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Text style={styles.saveBtnText}>Save Medicine</Text>
                        </LinearGradient>
                    </TouchableOpacity>
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
});
