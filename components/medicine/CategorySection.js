import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const CATEGORIES = ['General', 'Painkillers', 'Antibiotics', 'Supplements', 'Vitamins', 'Chronic', 'First Aid', 'Custom'];

export function CategorySection({ form, theme }) {
    return (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Category</Text>

            <View style={styles.row}>
                {CATEGORIES.map(cat => (
                    <TouchableOpacity
                        key={cat}
                        onPress={() => form.setCategory(cat)}
                        style={[
                            styles.chip,
                            { borderColor: theme.border },
                            form.category === cat && { backgroundColor: theme.primary, borderColor: theme.primary }
                        ]}
                    >
                        <Text style={[
                            styles.chipText,
                            { color: form.category === cat ? '#fff' : theme.icon }
                        ]}>
                            {cat}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {form.category === 'Custom' && (
                <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1, marginTop: 15 }]}>
                    <TextInput
                        placeholder="Enter custom category"
                        placeholderTextColor={theme.icon}
                        style={[styles.input, { color: theme.text }]}
                        value={form.customCategory}
                        onChangeText={form.setCustomCategory}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    section: { marginBottom: 25 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    chipText: {
        fontSize: 14,
        fontWeight: '600',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 15
    },
    input: { flex: 1, fontSize: 16 },
});
