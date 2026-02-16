import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, ThemeGradients } from '../constants/theme';
import { useColorScheme } from '../hooks/use-color-scheme';
import { useMedicineForm } from '../hooks/useMedicineForm';

// Components
import { AppearanceSection } from '../components/medicine/AppearanceSection';
import { BasicInfoSection } from '../components/medicine/BasicInfoSection';
import { CategorySection } from '../components/medicine/CategorySection';
import { ScheduleSection } from '../components/medicine/ScheduleSection';

const ICONS = ['medical', 'nutrition', 'water', 'moon', 'fitness', 'thermometer', 'flask', 'bandage', 'pulse', 'heart'];
const THEME_COLORS = ['#FF8C42', '#FFB347', '#F9D423', '#82C91E', '#F06292', '#4DABF7', '#7950F2', '#BE4BDB', '#FAB005', '#FA5252'];

export default function AddMedicineScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const gradients = ThemeGradients[colorScheme];

    const isEditMode = params.mode === 'edit';
    const initialMedicine = params.medicine ? JSON.parse(params.medicine) : null;

    const { form, ui, actions } = useMedicineForm(initialMedicine, params.scannedData);

    return (
        <View style={styles.container}>
            <LinearGradient colors={gradients.main} style={StyleSheet.absoluteFill} />
            <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={[styles.backBtn, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="chevron-back" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>
                        {isEditMode ? 'Edit Medicine' : 'Add Medicine'}
                    </Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <BasicInfoSection form={form} ui={ui} actions={actions} theme={theme} />
                    <CategorySection form={form} theme={theme} />
                    <ScheduleSection form={form} actions={actions} theme={theme} />
                    <AppearanceSection form={form} theme={theme} icons={ICONS} colors={THEME_COLORS} />

                    {/* Preview Section */}
                    <View style={styles.previewSection}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Preview</Text>
                        <View style={[styles.previewCard, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
                            <View style={[styles.previewIconContainer, { backgroundColor: form.selectedColor + '15' }]}>
                                <Ionicons name={form.selectedIcon} size={24} color={form.selectedColor} />
                            </View>
                            <View style={styles.previewInfo}>
                                <Text style={[styles.previewName, { color: theme.text }]}>{form.name || 'Medicine Name'}</Text>
                                <Text style={[styles.previewDosage, { color: theme.icon }]}>
                                    {form.dosage || 'Dose Quantity'} • {form.frequency}
                                </Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                {/* Footer Actions */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.saveBtn}
                        onPress={() => actions.handleSave(isEditMode)}
                        disabled={ui.isLoading}
                    >
                        <LinearGradient colors={gradients.warm} style={styles.saveGradient}>
                            <Text style={styles.saveBtnText}>
                                {ui.isLoading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Save Medicine')}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 60 },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    backBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    previewSection: { marginTop: 10, marginBottom: 20 },
    previewCard: { flexDirection: 'row', padding: 15, borderRadius: 16, alignItems: 'center' },
    previewIconContainer: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    previewInfo: { flex: 1 },
    previewName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    previewDosage: { fontSize: 13 },
    footer: { padding: 20, paddingBottom: 30 },
    saveBtn: { height: 55, borderRadius: 28, overflow: 'hidden' },
    saveGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    saveBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
