import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export function BasicInfoSection({ form, ui, actions, theme }) {
    const [showExpiryPicker, setShowExpiryPicker] = React.useState(false);

    // Confidence UI Logic
    const confidence = ui.confidenceScore || 100;
    const isLowConfidence = confidence < 80;

    let confidenceColor = theme.success;
    let confidenceLabel = 'High Accuracy';

    if (confidence < 60) {
        confidenceColor = theme.danger;
        confidenceLabel = 'Low Accuracy';
    } else if (confidence < 85) {
        confidenceColor = theme.warning;
        confidenceLabel = 'Medium Accuracy';
    }

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>Basic Information</Text>
                {ui.confidenceScore !== undefined && (
                    <View style={[styles.confidenceBadge, { backgroundColor: confidenceColor + '15', borderColor: confidenceColor + '30' }]}>
                        <Ionicons
                            name={isLowConfidence ? "alert-circle-outline" : "checkmark-shield-outline"}
                            size={14}
                            color={confidenceColor}
                        />
                        <Text style={[styles.confidenceText, { color: confidenceColor }]}>
                            {confidence}% {confidenceLabel}
                        </Text>
                    </View>
                )}
            </View>

            {isLowConfidence && (
                <View style={[styles.warningBanner, { backgroundColor: theme.danger + '10', borderColor: theme.danger + '20' }]}>
                    <Ionicons name="warning-outline" size={20} color={theme.danger} />
                    <Text style={[styles.warningText, { color: theme.text }]}>
                        AI is not entirely sure about these details. Please verify the name and dosage carefully.
                    </Text>
                </View>
            )}

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

            <View style={styles.expiryHeader}>
                <Text style={[styles.label, { color: theme.icon }]}>Expiry Date</Text>
                {ui.isEstimated && (
                    <View style={[styles.estimateBadge, { backgroundColor: theme.warning + '15' }]}>
                        <Text style={[styles.estimateText, { color: theme.warning }]}>Estimated</Text>
                    </View>
                )}
            </View>
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
    sectionTitle: { fontSize: 18, fontWeight: 'bold' },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15
    },
    inputContainer: { flexDirection: 'row', alignItems: 'center', height: 55, borderRadius: 12, paddingHorizontal: 15, marginBottom: 12 },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: 16 },
    label: { fontSize: 14, fontWeight: '600' },
    expiryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
        marginTop: 10
    },
    confidenceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        borderWidth: 1,
        gap: 5,
    },
    confidenceText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    warningBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 15,
        gap: 10,
    },
    warningText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
    },
    estimateBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    estimateText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    textArea: { borderRadius: 12, borderWidth: 1, padding: 15, height: 100, fontSize: 16, textAlignVertical: 'top' },
});

