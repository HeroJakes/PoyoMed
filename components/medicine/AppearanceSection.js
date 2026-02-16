import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function AppearanceSection({ form, theme, icons, colors }) {
    return (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>

            <Text style={[styles.label, { color: theme.icon }]}>Icon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
                {icons.map(icon => (
                    <TouchableOpacity
                        key={icon}
                        onPress={() => form.setSelectedIcon(icon)}
                        style={[styles.iconBtn, { borderColor: form.selectedIcon === icon ? theme.primary : theme.border }]}
                    >
                        <Ionicons name={icon} size={24} color={form.selectedIcon === icon ? theme.primary : theme.icon} />
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <Text style={[styles.label, { color: theme.icon }]}>Color</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {colors.map(color => (
                    <TouchableOpacity
                        key={color}
                        onPress={() => form.setSelectedColor(color)}
                        style={[styles.colorBtn, { backgroundColor: color, borderColor: form.selectedColor === color ? theme.text : 'transparent' }]}
                    />
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    section: { marginBottom: 25 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    iconBtn: { width: 50, height: 50, borderRadius: 12, borderWidth: 2, marginRight: 10, justifyContent: 'center', alignItems: 'center' },
    colorBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, marginRight: 12 },
});
