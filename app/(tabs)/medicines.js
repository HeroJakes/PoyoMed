import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Dimensions,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Gradients } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

export default function Medicines() {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const gradients = Gradients;
    const darkText = Colors.light.text;
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Animation values
    const menuAnim = useSharedValue(0);
    const overlayOpacity = useSharedValue(0);

    const toggleMenu = () => {
        const toValue = isMenuOpen ? 0 : 1;
        const config = {
            duration: 250,
            easing: Easing.bezier(0.33, 1, 0.68, 1),
        };
        menuAnim.value = withTiming(toValue, config);
        overlayOpacity.value = withTiming(toValue ? 1 : 0, { duration: 250 });
        setIsMenuOpen(!isMenuOpen);
    };

    const categories = ['All', 'Daily', 'Weekly', 'As Needed', 'Supplements'];

    const medications = [
        {
            id: '1',
            name: 'Vitamin C',
            dosage: '500mg',
            frequency: 'Once daily',
            nextDose: '08:00 AM',
            status: 'Active',
            color: '#FFB347',
            icon: 'nutrition'
        },
        {
            id: '2',
            name: 'Omega 3',
            dosage: '1000mg',
            frequency: 'Twice daily',
            nextDose: '12:30 PM',
            status: 'Low Stock',
            color: '#FF8C42',
            icon: 'fish'
        },
        {
            id: '3',
            name: 'Paracetamol',
            dosage: '500mg',
            frequency: 'As needed',
            nextDose: '--',
            status: 'Expiring',
            color: theme.danger,
            icon: 'medical'
        },
        {
            id: '4',
            name: 'Magnesium',
            dosage: '250mg',
            frequency: 'Before sleep',
            nextDose: '09:00 PM',
            status: 'Active',
            color: '#F06292',
            icon: 'moon'
        }
    ];

    const overlayStyle = useAnimatedStyle(() => ({
        opacity: overlayOpacity.value,
        display: overlayOpacity.value > 0 ? 'flex' : 'none',
    }));

    const scanOptionStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: menuAnim.value * -70 },
            { scale: menuAnim.value }
        ],
        opacity: menuAnim.value,
    }));

    const manualOptionStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: menuAnim.value * -130 },
            { scale: menuAnim.value }
        ],
        opacity: menuAnim.value,
    }));

    const fabIconStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: (menuAnim.value * 45) + 'deg' }],
    }));

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={gradients.main}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: darkText }]}>My Medicines</Text>
                    <TouchableOpacity style={[styles.notificationBtn, { backgroundColor: 'rgba(255,255,255,0.6)', borderColor: theme.border, borderWidth: 1 }]}>
                        <Ionicons name="filter-outline" size={22} color={darkText} />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
                        <Ionicons name="search-outline" size={20} color={theme.icon} style={styles.searchIcon} />
                        <TextInput
                            placeholder="Search medicines..."
                            placeholderTextColor={theme.icon}
                            style={[styles.searchInput, { color: theme.text }]}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                {/* Categories */}
                <View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoriesScroll}
                    >
                        {categories.map((category) => (
                            <TouchableOpacity
                                key={category}
                                onPress={() => setActiveCategory(category)}
                                style={[
                                    styles.categoryChip,
                                    activeCategory === category
                                        ? { backgroundColor: theme.primary }
                                        : { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }
                                ]}
                            >
                                <Text style={[
                                    styles.categoryText,
                                    activeCategory === category ? { color: '#fff' } : { color: theme.text }
                                ]}>
                                    {category}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Medication List */}
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
                    {medications.map((med) => (
                        <MedicationCard key={med.id} med={med} theme={theme} darkText={darkText} router={router} />
                    ))}
                </ScrollView>
            </SafeAreaView>

            {/* Menu Overlay */}
            {isMenuOpen && (
                <Pressable
                    style={[StyleSheet.absoluteFill, styles.overlayBg]}
                    onPress={toggleMenu}
                >
                    <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.3)' }, overlayStyle]} />
                </Pressable>
            )}

            {/* Speed Dial Options */}
            <View style={styles.fabContainer}>
                <Animated.View style={[styles.optionContainer, manualOptionStyle]}>
                    <Text style={[styles.optionLabel, { color: '#fff' }]}>Add Manually</Text>
                    <TouchableOpacity
                        style={[styles.optionButton, { backgroundColor: theme.card }]}
                        onPress={() => {
                            toggleMenu();
                            router.push('/add-medicine');
                        }}
                    >
                        <Ionicons name="create-outline" size={24} color={theme.primary} />
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View style={[styles.optionContainer, scanOptionStyle]}>
                    <Text style={[styles.optionLabel, { color: '#fff' }]}>Scan Medicine</Text>
                    <TouchableOpacity
                        style={[styles.optionButton, { backgroundColor: theme.card }]}
                        onPress={() => {
                            toggleMenu();
                            router.push('/camera');
                        }}
                    >
                        <Ionicons name="camera-outline" size={24} color={theme.primary} />
                    </TouchableOpacity>
                </Animated.View>

                {/* Main FAB */}
                <TouchableOpacity
                    style={styles.fab}
                    onPress={toggleMenu}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={gradients.warm}
                        style={styles.fabGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Animated.View style={fabIconStyle}>
                            <Ionicons name="add" size={32} color="#fff" />
                        </Animated.View>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

function MedicationCard({ med, theme, darkText, router }) {
    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return theme.success;
            case 'Low Stock': return theme.warning;
            case 'Expiring': return theme.danger;
            default: return theme.icon;
        }
    };

    return (
        <TouchableOpacity
            style={[styles.medCard, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}
            onPress={() => router.push({
                pathname: '/medicine-details',
                params: { medicine: JSON.stringify(med) }
            })}
        >
            <View style={[styles.medIconContainer, { backgroundColor: med.color + '15' }]}>
                <Ionicons name={med.icon} size={24} color={med.color} />
            </View>

            <View style={styles.medInfo}>
                <View style={styles.medHeader}>
                    <Text style={[styles.medName, { color: theme.text }]}>{med.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(med.status) + '15' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(med.status) }]}>{med.status}</Text>
                    </View>
                </View>

                <Text style={[styles.medDosage, { color: theme.icon }]}>{med.dosage} • {med.frequency}</Text>

                <View style={styles.medFooter}>
                    <View style={styles.nextDoseContainer}>
                        <Ionicons name="time-outline" size={14} color={theme.icon} />
                        <Text style={[styles.nextDoseText, { color: theme.icon }]}> Next: {med.nextDose}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={theme.icon} />
                </View>
            </View>
        </TouchableOpacity>
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
        paddingTop: 10,
        marginBottom: 15,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    notificationBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        height: 50,
        borderRadius: 15,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 5,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    categoriesScroll: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    categoryChip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 10,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 5,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    medCard: {
        flexDirection: 'row',
        padding: 15,
        borderRadius: 25,
        marginBottom: 15,
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    medIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    medInfo: {
        flex: 1,
    },
    medHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    medName: {
        fontSize: 17,
        fontWeight: 'bold',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    medDosage: {
        fontSize: 13,
        marginBottom: 10,
    },
    medFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    nextDoseContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    nextDoseText: {
        fontSize: 12,
        fontWeight: '500',
    },
    overlayBg: {
        zIndex: 10,
    },
    fabContainer: {
        position: 'absolute',
        bottom: 110,
        right: 20,
        alignItems: 'center',
        zIndex: 20,
    },
    optionContainer: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        right: 0,
        width: 200,
        justifyContent: 'flex-end',
    },
    optionLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        marginRight: 15,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        overflow: 'hidden',
    },
    optionButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    fab: {
        width: 64,
        height: 64,
        borderRadius: 32,
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
    fabGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
