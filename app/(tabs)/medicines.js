import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { collection, doc, onSnapshot, query, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    Dimensions,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    Easing,
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, ThemeGradients } from '../../constants/theme';
import { auth, db } from '../../firebase';
import { useColorScheme } from '../../hooks/use-color-scheme';

import { getNextDose } from '../../utils/medicineUtils';
import { cancelMedicationReminders } from '../../utils/notificationUtils';
import { getRiskMetadata } from '../../utils/riskClassification';

const { width, height } = Dimensions.get('window');

export default function Medicines() {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const gradients = ThemeGradients[colorScheme];
    const darkText = colorScheme === 'dark' ? '#FFF' : Colors.light.text;
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
    const [medications, setMedications] = useState([]);
    const [loading, setLoading] = useState(true);

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

    // Dynamic categories derived from user's actual medications
    const dynamicCategories = ['All', ...new Set(medications
        .map(m => m.category || 'General')
        .filter(c => c)
    )].sort((a, b) => a === 'All' ? -1 : b === 'All' ? 1 : a.localeCompare(b));

    const calculateStatus = (expiryDate, currentStatus) => {
        if (currentStatus === 'In Bag' || currentStatus === 'Recycled' || currentStatus === 'Pending Pickup') return currentStatus;
        if (!expiryDate) return 'Active';
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'Expired';
        if (diffDays <= 7) return 'Expiring';
        return 'Active';
    };

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const medicinesRef = collection(db, 'users', user.uid, 'medicines');
        let q = query(medicinesRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const meds = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    status: calculateStatus(data.expiryDate, data.status),
                    nextDose: getNextDose(data.times)
                };
            });

            // Auto-update expired meds to 'In Bag' in Firestore
            meds.forEach(async (med) => {
                if (med.expiryDate &&
                    new Date(med.expiryDate) < new Date() &&
                    med.status !== 'In Bag' &&
                    med.status !== 'Recycled') {

                    try {
                        const medRef = doc(db, 'users', user.uid, 'medicines', med.id);
                        await updateDoc(medRef, {
                            status: 'In Bag',
                            autoExpired: true,
                            updatedAt: new Date().toISOString()
                        });
                        // Cancel reminders for this item
                        await cancelMedicationReminders(med.id);
                    } catch (err) {
                        console.error("Error auto-expiring medicine:", err);
                    }
                }
            });

            setMedications(meds);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching medicines:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredMedications = medications.filter(med => {
        const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase());
        const medCategory = med.category || 'General';
        const matchesCategory = activeCategory === 'All' || medCategory === activeCategory;
        const isCurrentlyActive = med.status !== 'In Bag' && med.status !== 'Recycled' && med.status !== 'Pending Pickup';
        return matchesSearch && matchesCategory && isCurrentlyActive;
    });

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
                    <View>
                        <Text style={[styles.title, { color: darkText }]}>My Medicines</Text>
                        <Text style={[styles.subtitle, { color: theme.icon }]}>Manage your personal medicine cabinet</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                        style={[styles.notificationBtn, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}
                    >
                        <Ionicons name={viewMode === 'list' ? 'grid-outline' : 'list-outline'} size={22} color={darkText} />
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
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                                <Ionicons name="close-circle" size={20} color={theme.icon} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Categories */}
                <View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoriesScroll}
                    >
                        {dynamicCategories.map((category) => (
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

                {/* Medication List/Grid */}
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={viewMode === 'list' ? styles.listContent : styles.gridContent}>
                    {filteredMedications.length === 0 && !loading ? (
                        <Animated.View
                            entering={FadeInDown.duration(500).easing(Easing.out(Easing.exp))}
                            style={styles.emptyContainer}
                        >
                            <View style={[styles.emptyIconCircle, { backgroundColor: theme.primary + '12' }]}>
                                <Ionicons name="medical-outline" size={48} color={theme.primary + '60'} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: theme.text }]}>No medicines found</Text>
                            <Text style={[styles.emptySubtitle, { color: theme.icon }]}>
                                {searchQuery ? 'Try a different search term' : 'Add your first medicine to get started'}
                            </Text>
                            {!searchQuery && (
                                <TouchableOpacity
                                    style={[styles.emptyBtn, { backgroundColor: theme.primary }]}
                                    onPress={() => router.push('/add-medicine')}
                                >
                                    <Ionicons name="add" size={18} color="#FFF" />
                                    <Text style={styles.emptyBtnText}>Add Medicine</Text>
                                </TouchableOpacity>
                            )}
                        </Animated.View>
                    ) : (
                        <View style={viewMode === 'grid' ? styles.gridRow : null}>
                            {filteredMedications.map((med, index) => (
                                <Animated.View
                                    key={med.id}
                                    entering={FadeInDown.delay(index * 60).duration(400).easing(Easing.out(Easing.exp))}
                                    style={viewMode === 'grid' ? { width: (width - 45) / 2 } : undefined}
                                >
                                    {viewMode === 'list' ? (
                                        <MedicationCard med={med} theme={theme} darkText={darkText} router={router} />
                                    ) : (
                                        <MedicationGridCard med={med} theme={theme} darkText={darkText} router={router} />
                                    )}
                                </Animated.View>
                            ))}
                        </View>
                    )}
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
            case 'Expiring': return theme.warning;
            case 'Expired': return theme.danger;
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

                <Text style={[styles.medDosage, { color: theme.icon }]}>
                    {med.dosage ? `${med.dosage} • ` : ''}{med.category || 'General'}
                </Text>

                <View style={styles.medFooter}>
                    <View style={styles.nextDoseContainer}>
                        <Ionicons name="time-outline" size={14} color={theme.icon} />
                        <Text style={[styles.nextDoseText, { color: theme.icon }]}> Next: {med.nextDose}</Text>
                    </View>

                    {med.riskLevel && (
                        <View style={[styles.smallRiskBadge, { backgroundColor: getRiskMetadata(med.riskLevel).color + '15' }]}>
                            <Ionicons name={getRiskMetadata(med.riskLevel).icon} size={12} color={getRiskMetadata(med.riskLevel).color} />
                            <Text style={[styles.smallRiskText, { color: getRiskMetadata(med.riskLevel).color }]}>
                                {getRiskMetadata(med.riskLevel).label.split(' ')[0]}
                            </Text>
                        </View>
                    )}

                    <Ionicons name="chevron-forward" size={18} color={theme.icon} />
                </View>
            </View>
        </TouchableOpacity>
    );
}

function MedicationGridCard({ med, theme, darkText, router }) {
    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return theme.success;
            case 'Low Stock': return theme.warning;
            case 'Expiring': return theme.warning;
            case 'Expired': return theme.danger;
            default: return theme.icon;
        }
    };

    return (
        <TouchableOpacity
            style={[styles.gridCard, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}
            onPress={() => router.push({
                pathname: '/medicine-details',
                params: { medicine: JSON.stringify(med) }
            })}
        >
            {/* Colored accent bar at top */}
            <View style={[styles.gridAccentBar, { backgroundColor: med.color || theme.primary }]} />
            <View style={[styles.gridIconContainer, { backgroundColor: med.color + '15' }]}>
                <Ionicons name={med.icon} size={32} color={med.color} />
            </View>

            <View style={styles.gridInfo}>
                <Text style={[styles.gridName, { color: theme.text }]} numberOfLines={1}>{med.name}</Text>
                <Text style={[styles.gridDosage, { color: theme.icon }]} numberOfLines={1}>
                    {med.dosage || med.category || 'General'}
                </Text>

                <View style={[styles.gridStatusBadge, { backgroundColor: getStatusColor(med.status) + '15' }]}>
                    <Text style={[styles.gridStatusText, { color: getStatusColor(med.status) }]}>{med.status}</Text>
                </View>

                <View style={styles.gridFooter}>
                    <Ionicons name="time-outline" size={12} color={theme.icon} />
                    <Text style={[styles.gridTimeText, { color: theme.icon }]}> {med.nextDose}</Text>
                </View>

                {med.riskLevel && (
                    <View style={[styles.gridRiskBadge, { backgroundColor: getRiskMetadata(med.riskLevel).color + '15' }]}>
                        <Ionicons name={getRiskMetadata(med.riskLevel).icon} size={10} color={getRiskMetadata(med.riskLevel).color} />
                        <Text style={[styles.gridRiskText, { color: getRiskMetadata(med.riskLevel).color }]}>
                            {getRiskMetadata(med.riskLevel).label.split(' ')[0]}
                        </Text>
                    </View>
                )}
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
        paddingTop: 20,
        marginBottom: 15,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 14,
        marginTop: 2,
        fontWeight: '500',
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
        borderRadius: 25,
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
    clearButton: {
        padding: 5,
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
    gridContent: {
        paddingHorizontal: 15,
        paddingBottom: 100,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyIconCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    emptyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 24,
        gap: 6,
    },
    emptyBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    gridRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridCard: {
        width: '100%',
        padding: 15,
        paddingTop: 20,
        borderRadius: 24,
        marginBottom: 15,
        alignItems: 'center',
        overflow: 'hidden',
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
    gridAccentBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    gridIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    gridInfo: {
        alignItems: 'center',
        width: '100%',
    },
    gridName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
        textAlign: 'center',
    },
    gridDosage: {
        fontSize: 12,
        marginBottom: 8,
        textAlign: 'center',
    },
    gridStatusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginBottom: 8,
    },
    gridStatusText: {
        fontSize: 9,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    gridFooter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    gridTimeText: {
        fontSize: 11,
        fontWeight: '500',
    },
    smallRiskBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
        marginLeft: 'auto',
        marginRight: 10,
    },
    smallRiskText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    gridRiskBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        gap: 3,
        marginTop: 8,
    },
    gridRiskText: {
        fontSize: 9,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
});
