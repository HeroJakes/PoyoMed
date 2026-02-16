import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function ScheduleSection({ form, actions, theme }) {
    const [showPicker, setShowPicker] = React.useState(false);
    const [activeIdx, setActiveIdx] = React.useState(0);

    const frequencies = ['Daily', 'Weekly', 'Monthly', 'As Needed'];
    const timesOptions = [1, 2, 3, 4];

    return (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Schedule</Text>

            <View style={styles.row}>
                {frequencies.map(f => (
                    <TouchableOpacity
                        key={f}
                        onPress={() => form.setFrequency(f)}
                        style={[styles.chip, form.frequency === f && { backgroundColor: theme.primary }]}
                    >
                        <Text style={{ color: form.frequency === f ? '#fff' : theme.text }}>{f}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {form.frequency === 'Daily' && (
                <>
                    <Text style={[styles.label, { color: theme.icon, marginTop: 15 }]}>Times per day</Text>
                    <View style={styles.row}>
                        {timesOptions.map(n => (
                            <TouchableOpacity
                                key={n}
                                onPress={() => actions.handleTimesChange(n)}
                                style={[styles.chip, form.timesPerDay === n && { backgroundColor: theme.primary }]}
                            >
                                <Text style={{ color: form.timesPerDay === n ? '#fff' : theme.text }}>{n}x</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {form.doseTimes.map((time, i) => (
                        <TouchableOpacity
                            key={i}
                            onPress={() => { setActiveIdx(i); setShowPicker(true); }}
                            style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1, marginTop: 10 }]}
                        >
                            <Ionicons name="time-outline" size={20} color={theme.icon} style={styles.inputIcon} />
                            <Text style={{ color: theme.text }}>{actions.formatTime(time)}</Text>
                        </TouchableOpacity>
                    ))}
                </>
            )}

            {showPicker && (
                <DateTimePicker
                    value={form.doseTimes[activeIdx]}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, date) => {
                        setShowPicker(Platform.OS === 'ios');
                        if (date) {
                            const newTimes = [...form.doseTimes];
                            newTimes[activeIdx] = date;
                            form.setDoseTimes(newTimes);
                        }
                    }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    section: { marginBottom: 25 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    chip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ddd' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', height: 50, borderRadius: 12, paddingHorizontal: 15 },
    inputIcon: { marginRight: 10 },
});
