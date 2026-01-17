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

// Local Eco Gradient
const ECO_GRADIENT = Gradients.warm;
const WATER_GRADIENT = Gradients.sunny;

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
            icon: 'medical',
            hours: '8:00 AM - 10:00 PM',
            badge: 'Fast Service'
        },
        {
            id: '2',
            name: 'City General Hospital',
            address: '456 Care Ave, Downtown',
            distance: '2.4 km',
            icon: 'business',
            hours: '24 Hours',
            badge: 'Official'
        },
        {
            id: '3',
            name: 'Eco-Med Center',
            address: '789 Green Rd, North Side',
            distance: '3.1 km',
            icon: 'leaf',
            hours: '9:00 AM - 6:00 PM',
            badge: 'Eco-Friendly'
        }
    ];

    const [itemsRecycledCount, setItemsRecycledCount] = useState(12);
    const [readyForRecycle, setReadyForRecycle] = useState([
        {
            id: '1',
            name: 'Aspirin',
            status: 'Expired 2 days ago',
            color: theme.danger,
            icon: 'alert-circle',
            risk: 'Medium'
        },
        {
            id: '2',
            name: 'Cough Syrup',
            status: 'Expiring in 3 days',
            color: theme.warning,
            icon: 'time',
            risk: 'Low'
        }
    ]);

    const handleRecycle = (item) => {
        Alert.alert(
            "Confirm Bag Drop-off",
            `Have you dropped off ${item.name} in the collection box?`,
            [
                { text: "Not yet", style: "cancel" },
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
                        <View>
                            <Text style={[styles.title, { color: theme.text }]}>My Eco Impact</Text>
                            <Text style={[styles.subtitle, { color: theme.icon }]}>Saving lives & the planet</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.profileBtn, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}
                        >
                            <Ionicons name="leaf" size={24} color={theme.primary} />
                        </TouchableOpacity>
                    </View>

                    {/* Impact Dashboard */}
                    <View style={styles.dashboardContainer}>
                        <LinearGradient
                            colors={ECO_GRADIENT}
                            style={styles.impactCard}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.impactStatsRow}>
                                <View style={styles.impactStatLarge}>
                                    <Text style={styles.impactValueLarge}>{itemsRecycledCount}</Text>
                                    <Text style={styles.impactLabelLarge}>Meds Saved</Text>
                                </View>
                                <View style={styles.impactDivider} />
                                <View style={styles.impactStatLarge}>
                                    <Text style={styles.impactValueLarge}>{(itemsRecycledCount * 0.2).toFixed(1)}kg</Text>
                                    <Text style={styles.impactLabelLarge}>CO2 Reduced</Text>
                                </View>
                            </View>

                            <View style={styles.progressContainer}>
                                <View style={styles.progressHeader}>
                                    <Text style={styles.progressText}>Level 3: Eco Warrior</Text>
                                    <Text style={styles.progressSubtext}>80% to Master</Text>
                                </View>
                                <View style={styles.progressBarBg}>
                                    <View style={[styles.progressBarFill, { width: '80%' }]} />
                                </View>
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Drop-off Bag Section */}
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>My Drop-off Bag</Text>
                        <View style={styles.badgeCount}>
                            <Text style={styles.badgeText}>{readyForRecycle.length}</Text>
                        </View>
                    </View>

                    <View style={styles.bagContainer}>
                        {readyForRecycle.length > 0 ? (
                            readyForRecycle.map((item) => (
                                <View key={item.id} style={[styles.bagItem, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
                                    <View style={[styles.bagIconBox, { backgroundColor: item.color + '15' }]}>
                                        <Ionicons name={item.icon} size={24} color={item.color} />
                                    </View>
                                    <View style={styles.bagContent}>
                                        <Text style={[styles.bagName, { color: theme.text }]}>{item.name}</Text>
                                        <Text style={[styles.bagStatus, { color: item.color }]}>{item.status}</Text>
                                        <View style={[styles.riskTag, { backgroundColor: theme.background }]}>
                                            <Text style={[styles.riskTagText, { color: theme.icon }]}>{item.risk} Risk</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        style={[styles.dropOffBtn, { backgroundColor: theme.primary }]}
                                        onPress={() => handleRecycle(item)}
                                    >
                                        <Text style={styles.dropOffBtnText}>Drop off</Text>
                                    </TouchableOpacity>
                                </View>
                            ))
                        ) : (
                            <View style={[styles.emptyBag, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
                                <Ionicons name="bag-check" size={48} color={theme.success + '40'} />
                                <Text style={[styles.emptyBagText, { color: theme.text }]}>Your bag is empty!</Text>
                                <Text style={[styles.emptyBagSubtext, { color: theme.icon }]}>Check your medicine cabinet for expired items.</Text>
                            </View>
                        )}
                    </View>

                    {/* Collection Points Map Preview Style */}
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Find a Point</Text>
                        <TouchableOpacity onPress={() => handleGuidePress('Map View')}>
                            <Text style={[styles.seeAll, { color: theme.primary }]}>Open Map</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.pointsList}>
                        {recyclingPoints.map((point) => (
                            <TouchableOpacity
                                key={point.id}
                                style={[styles.pointCard, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}
                                onPress={() => handlePointPress(point)}
                            >
                                <View style={styles.pointCardHeader}>
                                    <View style={[styles.pointIconSmall, { backgroundColor: theme.primary + '15' }]}>
                                        <Ionicons name={point.icon} size={20} color={theme.primary} />
                                    </View>
                                    <View style={styles.pointInfo}>
                                        <Text style={[styles.pointName, { color: theme.text }]}>{point.name}</Text>
                                        <Text style={[styles.pointDist, { color: theme.primary }]}>{point.distance} away</Text>
                                    </View>
                                    <View style={[styles.pointTag, { backgroundColor: theme.background }]}>
                                        <Text style={[styles.pointTagText, { color: theme.primary }]}>{point.badge}</Text>
                                    </View>
                                </View>
                                <View style={styles.pointCardFooter}>
                                    <View style={styles.pointDetail}>
                                        <Ionicons name="time-outline" size={14} color={theme.icon} />
                                        <Text style={[styles.pointDetailText, { color: theme.icon }]}>{point.hours}</Text>
                                    </View>
                                    <Ionicons name="navigate-circle" size={28} color={theme.primary} />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Edu Tips Horizontal */}
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Eco Tips</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tipsRow}>
                        <TipCard
                            title="No Flushing!"
                            desc="Meds in water harm fish & ecosystems."
                            icon="water"
                            color={WATER_GRADIENT}
                            onPress={() => handleGuidePress('Water Protection')}
                        />
                        <TipCard
                            title="Remove Info"
                            desc="Protect your privacy on labels."
                            icon="shield-checkmark"
                            color={ECO_GRADIENT}
                            onPress={() => handleGuidePress('Privacy')}
                        />
                        <TipCard
                            title="Original Pack"
                            desc="Keep meds in their original boxes."
                            icon="cube"
                            color={['#FAB005', '#F59F00']}
                            onPress={() => handleGuidePress('Packaging')}
                        />
                    </ScrollView>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

function TipCard({ title, desc, icon, color, onPress }) {
    return (
        <TouchableOpacity onPress={onPress}>
            <LinearGradient colors={color} style={styles.tipCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Ionicons name={icon} size={28} color="#FFF" style={styles.tipIcon} />
                <Text style={styles.tipTitle}>{title}</Text>
                <Text style={styles.tipDesc} numberOfLines={2}>{desc}</Text>
            </LinearGradient>
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
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
        marginTop: 2,
    },
    profileBtn: {
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
                shadowRadius: 10,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    dashboardContainer: {
        marginBottom: 30,
    },
    impactCard: {
        padding: 24,
        borderRadius: 30,
        ...Platform.select({
            ios: {
                shadowColor: '#FF8C42',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    impactStatsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: 24,
    },
    impactStatLarge: {
        alignItems: 'center',
    },
    impactValueLarge: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFF',
    },
    impactLabelLarge: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
        fontWeight: '600',
    },
    impactDivider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    progressContainer: {
        backgroundColor: 'rgba(0,0,0,0.1)',
        padding: 16,
        borderRadius: 20,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    progressText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    progressSubtext: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 11,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#FFF',
        borderRadius: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 10,
    },
    badgeCount: {
        backgroundColor: '#FF8C42',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    bagContainer: {
        marginBottom: 30,
    },
    bagItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 24,
        marginBottom: 12,
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
    bagIconBox: {
        width: 52,
        height: 52,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    bagContent: {
        flex: 1,
    },
    bagName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    bagStatus: {
        fontSize: 12,
        marginTop: 2,
        fontWeight: '600',
    },
    riskTag: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        marginTop: 6,
    },
    riskTagText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    dropOffBtn: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    dropOffBtnText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyBag: {
        padding: 40,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderStyle: 'dashed',
    },
    emptyBagText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
    },
    emptyBagSubtext: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 20,
    },
    seeAll: {
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 'auto',
    },
    pointsList: {
        marginBottom: 30,
    },
    pointCard: {
        padding: 16,
        borderRadius: 24,
        marginBottom: 12,
    },
    pointCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    pointIconSmall: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    pointInfo: {
        flex: 1,
    },
    pointName: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    pointDist: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 1,
    },
    pointTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    pointTagText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    pointCardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.03)',
    },
    pointDetail: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pointDetailText: {
        fontSize: 12,
        marginLeft: 6,
    },
    tipsRow: {
        paddingRight: 20,
    },
    tipCard: {
        width: width * 0.4,
        padding: 16,
        borderRadius: 24,
        marginRight: 12,
    },
    tipIcon: {
        marginBottom: 12,
    },
    tipTitle: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    tipDesc: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 11,
        lineHeight: 16,
    },
});
