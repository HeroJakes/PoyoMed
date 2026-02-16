import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export function BasicInfoSection({ form, ui, actions, theme }) {
    const [showExpiryPicker, setShowExpiryPicker] = React.useState(false);

    return (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Basic Information</Text>

            <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
                <Ionicons name="pencil-outline" size={20} color={theme.icon} style={styles.inputIcon} />
                <TextInput
                    placeholder="Medicine Name"
                    placeholderTextColor={theme.icon}
                    style={[styles.input, { color: theme.text }]}
                    value={form.name}
                    onChangeText={form.setName}
                />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
                <Ionicons name="flask-outline" size={20} color={theme.icon} style={styles.inputIcon} />
                <TextInput
                    placeholder="Dose Quantity (e.g. 1 pill)"
                    placeholderTextColor={theme.icon}
                    style={[styles.input, { color: theme.text }]}
                    value={form.dosage}
                    onChangeText={form.setDosage}
                />
            </View>

            <Text style={[styles.label, { color: theme.icon, marginTop: 10 }]}>Expiry Date</Text>
            <TouchableOpacity
                onPress={() => setShowExpiryPicker(!showExpiryPicker)}
                style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}
            >
                <Ionicons name="calendar-outline" size={20} color={theme.icon} style={styles.inputIcon} />
                <Text style={{ color: theme.text }}>{form.expiryDate.toLocaleDateString()}</Text>
            </TouchableOpacity>

            {showExpiryPicker && (
                <DateTimePicker
                    value={form.expiryDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, date) => {
                        setShowExpiryPicker(Platform.OS === 'ios');
                        if (date) form.setExpiryDate(date);
                    }}
                />
            )}

            <View style={styles.sectionHeader}>
                <Text style={[styles.label, { color: theme.icon }]}>Instructions</Text>
                <TouchableOpacity onPress={actions.handleGetTips} disabled={ui.isGeneratingTips}>
                    {ui.isGeneratingTips ? <ActivityIndicator size="small" /> : <Text style={{ color: theme.primary }}>✨ AI Tips</Text>}
                </TouchableOpacity>
            </View>
            <TextInput
                style={[styles.textArea, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
                value={form.instructions}
                onChangeText={form.setInstructions}
                multiline
                numberOfLines={4}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    section: { marginBottom: 25 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', height: 55, borderRadius: 12, paddingHorizontal: 15, marginBottom: 12 },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: 16 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, marginTop: 10 },
    textArea: { borderRadius: 12, borderWidth: 1, padding: 15, height: 100, fontSize: 16, textAlignVertical: 'top' },
});
