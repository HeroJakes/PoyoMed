import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
    Alert,
    Dimensions,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Gradients } from '../../constants/theme';

const { width } = Dimensions.get('window');

export default function RecycleScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const gradients = Gradients;

    const handlePointPress = (point) => {
        Alert.alert(
            'Recycling Point',
            `Opening ${point.name} in Maps...\n\nAddress: ${point.address}`
        );
    };

    const handleGuidePress = (title) => {
        Alert.alert('Recycling Guide', `More information about "${title}" will be available soon!`);
    };

    const recyclingPoints = [
        {
            id: '1',
            name: 'Poyo Pharmacy',
            address: '123 Health St, Medical District',
            distance: '0.8 km',
            icon: 'medical'
        },
        {
            id: '2',
            name: 'City General Hospital',
            address: '456 Care Ave, Downtown',
            distance: '2.4 km',
            icon: 'business'
        },
        {
            id: '3',
            name: 'Eco-Med Center',
            address: '789 Green Rd, North Side',
            distance: '3.1 km',
            icon: 'leaf'
        }
    ];

    const [itemsRecycledCount, setItemsRecycledCount] = useState(12);
    const [readyForRecycle, setReadyForRecycle] = useState([
        {
            id: '1',
            name: 'Aspirin',
            status: 'Expired 2 days ago',
            color: theme.danger,
            icon: 'alert-circle'
        },
        {
            id: '2',
            name: 'Cough Syrup',
            status: 'Expiring in 3 days',
            color: theme.warning,
            icon: 'time'
        }
    ]);

    const handleRecycle = (item) => {
        Alert.alert(
            "Confirm Recycling",
            `Have you dropped off ${item.name} at a collection point?`,
            [
                {
                    text: "Not yet",
                    style: "cancel"
                },
                {
                    text: "Yes, I have",
                    onPress: () => {
                        setReadyForRecycle(prev => prev.filter(i => i.id !== item.id));
                        setItemsRecycledCount(prev => prev + 1);
                    }
                }
            ]
        );
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
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Header Section */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.text }]}>Recycle</Text>
                        <TouchableOpacity
                            style={[styles.infoBtn, { backgroundColor: 'rgba(255,255,255,0.6)', borderColor: theme.border, borderWidth: 1 }]}
                            onPress={() => handleGuidePress('General Info')}
                        >
                            <Ionicons name="information-circle-outline" size={22} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Hero Card - Recycle Tip */}
                    <LinearGradient
                        colors={gradients.warm}
                        style={styles.heroCard}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.heroContent}>
                            <View>
                                <Text style={[styles.heroTitle, { color: '#FFFFFF' }]}>Proper Disposal</Text>
                                <Text style={[styles.heroSubtitle, { color: 'rgba(255,255,255,0.9)' }]}>Never flush medicines down the toilet. It harms our water supply!</Text>
                            </View>
                            <View style={styles.heroIconContainer}>
                                <Ionicons name="leaf" size={40} color={'#FFFFFF'} />
                            </View>
                        </View>
                        <TouchableOpacity style={styles.heroButton} onPress={() => handleGuidePress('Disposal Guide')}>
                            <Text style={[styles.heroButtonText, { color: theme.text }]}>View Guide</Text>
                            <Ionicons name="arrow-forward" size={16} color={theme.primary} />
                        </TouchableOpacity>
                    </LinearGradient>

                    {/* Impact Stats */}
                    <View style={styles.statsRow}>
                        <StatItem label="Items Recycled" value={itemsRecycledCount.toString()} icon="refresh-circle" color="#82C91E" theme={theme} />
                        <StatItem label="CO2 Saved" value={(itemsRecycledCount * 0.2).toFixed(1) + "kg"} icon="cloud-done" color="#4DABF7" theme={theme} />
                    </View>

                    {/* Ready for Recycling Section */}
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Ready for Recycling</Text>
                    </View>

                    <View style={[styles.pointsContainer, { backgroundColor: 'rgba(255,255,255,0.6)', borderColor: theme.border, borderWidth: 1 }]}>
                        {readyForRecycle.length > 0 ? (
                            readyForRecycle.map((item, index) => (
                                <View key={item.id}>
                                    <RecycleItem item={item} theme={theme} onRecycle={() => handleRecycle(item)} />
                                    {index < readyForRecycle.length - 1 && (
                                        <View style={[styles.divider, { backgroundColor: theme.border }]} />
                                    )}
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="checkmark-done-circle-outline" size={48} color={theme.success} />
                                <Text style={[styles.emptyText, { color: theme.text }]}>All caught up!</Text>
                                <Text style={[styles.emptySubtext, { color: theme.icon }]}>No medications ready for recycling.</Text>
                            </View>
                        )}
                    </View>

                    {/* Nearby Recycling Points */}
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Nearby Collection Points</Text>
                        <TouchableOpacity onPress={() => handleGuidePress('Map View')}>
                            <Text style={[styles.seeAll, { color: theme.primary }]}>Map View</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.pointsContainer, { backgroundColor: 'rgba(255,255,255,0.6)', borderColor: theme.border, borderWidth: 1 }]}>
                        {recyclingPoints.map((point, index) => (
                            <View key={point.id}>
                                <RecyclingPointItem
                                    point={point}
                                    theme={theme}
                                    onPress={() => handlePointPress(point)}
                                />
                                {index < recyclingPoints.length - 1 && (
                                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                                )}
                            </View>
                        ))}
                    </View>

                    {/* Quick Guide Section */}
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Recycling Guide</Text>
                    </View>
                    <View style={styles.guideGrid}>
                        <GuideCard
                            title="Remove Info"
                            desc="Black out personal details on labels."
                            icon="person-remove"
                            theme={theme}
                            onPress={() => handleGuidePress('Remove Info')}
                        />
                        <GuideCard
                            title="Keep Original"
                            desc="Keep in original packaging if possible."
                            icon="cube"
                            theme={theme}
                            onPress={() => handleGuidePress('Keep Original')}
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

function StatItem({ label, value, icon, color, theme }) {
    return (
        <View style={[styles.statItem, { backgroundColor: 'rgba(255,255,255,0.6)', borderColor: theme.border, borderWidth: 1 }]}>
            <View style={styles.statHeader}>
                <Ionicons name={icon} size={18} color={color} />
                <Text style={[styles.statLabel, { color: theme.icon }]}>{label}</Text>
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
        </View>
    );
}

function RecyclingPointItem({ point, theme, onPress }) {
    return (
        <TouchableOpacity style={styles.pointItem} onPress={onPress}>
            <View style={styles.pointLeft}>
                <View style={[styles.pointIconContainer, { backgroundColor: theme.primary + '15' }]}>
                    <Ionicons name={point.icon} size={20} color={theme.primary} />
                </View>
                <View style={styles.pointText}>
                    <Text style={[styles.pointName, { color: theme.text }]}>{point.name}</Text>
                    <Text style={[styles.pointAddress, { color: theme.icon }]} numberOfLines={1}>{point.address}</Text>
                </View>
            </View>
            <View style={styles.pointRight}>
                <Text style={[styles.pointDistance, { color: theme.primary }]}>{point.distance}</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.icon} />
            </View>
        </TouchableOpacity>
    );
}

function RecycleItem({ item, theme, onRecycle }) {
    return (
        <View style={styles.pointItem}>
            <View style={styles.pointLeft}>
                <View style={[styles.pointIconContainer, { backgroundColor: item.color + '15' }]}>
                    <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <View style={styles.pointText}>
                    <Text style={[styles.pointName, { color: theme.text }]}>{item.name}</Text>
                    <Text style={[styles.pointAddress, { color: item.color }]}>{item.status}</Text>
                </View>
            </View>
            <TouchableOpacity
                style={[styles.recycleBtn, { backgroundColor: theme.primary }]}
                onPress={onRecycle}
            >
                <Text style={styles.recycleBtnText}>Recycle</Text>
            </TouchableOpacity>
        </View>
    );
}

function GuideCard({ title, desc, icon, theme, onPress }) {
    return (
        <TouchableOpacity
            style={[styles.guideCard, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}
            onPress={onPress}
        >
            <View style={[styles.guideIconContainer, { backgroundColor: theme.primary + '15' }]}>
                <Ionicons name={icon} size={24} color={theme.primary} />
            </View>
            <Text style={[styles.guideTitle, { color: theme.text }]}>{title}</Text>
            <Text style={[styles.guideDesc, { color: theme.icon }]}>{desc}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 120,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    infoBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroCard: {
        padding: 24,
        borderRadius: 30,
        marginBottom: 30,
        ...Platform.select({
            ios: {
                shadowColor: '#FF8C42',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 15,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    heroContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    heroTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 14,
        lineHeight: 20,
        width: width * 0.55,
    },
    heroIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroButton: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
    heroButtonText: {
        fontWeight: 'bold',
        marginRight: 6,
        fontSize: 14,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    statItem: {
        width: (width - 55) / 2,
        padding: 20,
        borderRadius: 25,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 6,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    seeAll: {
        fontSize: 14,
        fontWeight: '600',
    },
    pointsContainer: {
        borderRadius: 25,
        padding: 10,
        marginBottom: 30,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    pointItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
    },
    pointLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    pointIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    pointText: {
        flex: 1,
    },
    pointName: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    pointAddress: {
        fontSize: 12,
    },
    pointRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pointDistance: {
        fontSize: 12,
        fontWeight: 'bold',
        marginRight: 8,
    },
    divider: {
        height: 1,
        marginHorizontal: 12,
    },
    guideGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    guideCard: {
        width: (width - 55) / 2,
        padding: 20,
        borderRadius: 25,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    guideIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    guideTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    guideDesc: {
        fontSize: 12,
        lineHeight: 18,
    },
    recycleBtn: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 10,
    },
    recycleBtnText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyContainer: {
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 12,
        marginBottom: 4,
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: 'center',
    },
});
