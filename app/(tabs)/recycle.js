import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { collection, doc, getDocs, onSnapshot, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
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
import { DROP_OFF_LOCATIONS, FALLBACK_USER_LOCATION } from '../../constants/dropOffLocations';
import { Colors, Gradients } from '../../constants/theme';
import { auth, db } from '../../firebase';

const { width } = Dimensions.get('window');

// Local Eco Gradient
const ECO_GRADIENT = Gradients.warm;
const WATER_GRADIENT = Gradients.sunny;

// Haversine formula to calculate distance between two points in km
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d.toFixed(1);
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

export default function RecycleScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const gradients = Gradients;

    const [itemsRecycledCount, setItemsRecycledCount] = useState(0);
    const [readyForRecycle, setReadyForRecycle] = useState([]);
    const [locations, setLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAndPopulate = async () => {
            try {
                const q = query(collection(db, 'dropOffLocations'));
                const snapshot = await getDocs(q);
                if (snapshot.empty) {
                    console.log('Populating dropOffLocations...');
                    for (const location of DROP_OFF_LOCATIONS) {
                        await setDoc(doc(db, 'dropOffLocations', location.id), location);
                    }
                }
            } catch (error) {
                console.error('Error checking locations:', error);
            }
        };
        checkAndPopulate();
    }, []);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        // Query for items ready to be recycled
        const qReady = query(
            collection(db, 'users', user.uid, 'medicines'),
            where('status', '==', 'In Bag')
        );

        // Query for items already recycled to get the count
        const qRecycled = query(
            collection(db, 'users', user.uid, 'medicines'),
            where('status', '==', 'Recycled')
        );

        const unsubReady = onSnapshot(qReady, (snapshot) => {
            const meds = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setReadyForRecycle(meds);
            setIsLoading(false);
        });

        const unsubRecycled = onSnapshot(qRecycled, (snapshot) => {
            setItemsRecycledCount(snapshot.size);
        });

        // Query for collection points
        const qLocs = query(collection(db, 'dropOffLocations'));
        const unsubLocs = onSnapshot(qLocs, (snapshot) => {
            const locs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setLocations(locs.length > 0 ? locs : DROP_OFF_LOCATIONS);
        });

        return () => {
            unsubReady();
            unsubRecycled();
            unsubLocs();
        };
    }, []);

    const recyclingPoints = (locations.length > 0 ? locations : DROP_OFF_LOCATIONS).map(point => ({
        ...point,
        distance: `${calculateDistance(
            FALLBACK_USER_LOCATION.latitude,
            FALLBACK_USER_LOCATION.longitude,
            point.latitude,
            point.longitude
        )} km`,
        icon: point.id.includes('kl') ? 'business' : 'medical'
    })).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

    const handlePointPress = (point) => {
        const label = encodeURIComponent(point.name);
        const url = Platform.select({
            ios: `maps:0,0?q=${label}@${point.latitude},${point.longitude}`,
            android: `geo:0,0?q=${point.latitude},${point.longitude}(${label})`
        });

        Alert.alert(
            'Open Maps',
            `Do you want to navigate to ${point.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Maps', onPress: () => Linking.openURL(url) }
            ]
        );
    };

    const handleRecycle = (item) => {
        Alert.alert(
            "Confirm Bag Drop-off",
            `Have you dropped off ${item.name} in the collection box?`,
            [
                { text: "Not yet", style: "cancel" },
                {
                    text: "Yes, I have",
                    onPress: async () => {
                        try {
                            const user = auth.currentUser;
                            if (!user) return;

                            const medRef = doc(db, 'users', user.uid, 'medicines', item.id);
                            await updateDoc(medRef, {
                                status: 'Recycled',
                                recycledAt: new Date().toISOString()
                            });
                        } catch (error) {
                            console.error("Error updating medicine status:", error);
                            Alert.alert('Error', 'Failed to update medicine status. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    const getEcoLevel = (count) => {
        if (count < 5) return { title: 'Level 1: Eco Rookie', sub: `${5 - count} more to Level 2`, progress: (count / 5) * 100 };
        if (count < 15) return { title: 'Level 2: Eco Helper', sub: `${15 - count} more to Level 3`, progress: ((count - 5) / 10) * 100 };
        if (count < 30) return { title: 'Level 3: Eco Warrior', sub: `${30 - count} more to Master`, progress: ((count - 15) / 15) * 100 };
        return { title: 'Level 4: Eco Master', sub: 'Maximum Level Reached!', progress: 100 };
    };
    const handleGuidePress = (topic) => {
        Alert.alert("Eco Guide", `Learn more about ${topic} in our upcoming sustainability guide!`);
    };

    const ecoLevel = getEcoLevel(itemsRecycledCount);

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
                                    <Text style={styles.progressText}>{ecoLevel.title}</Text>
                                    <Text style={styles.progressSubtext}>{ecoLevel.sub}</Text>
                                </View>
                                <View style={styles.progressBarBg}>
                                    <View style={[styles.progressBarFill, { width: `${ecoLevel.progress}%` }]} />
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
                        <TouchableOpacity
                            style={[styles.requestBtn, { backgroundColor: theme.primary }]}
                            onPress={() => router.push('/request-recycle')}
                        >
                            <Ionicons name="paper-plane" size={14} color="#FFF" />
                            <Text style={styles.requestBtnText}>Request Pick-up</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.bagContainer}>
                        {readyForRecycle.length > 0 ? (
                            readyForRecycle.map((item) => (
                                <View key={item.id} style={[styles.bagItem, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
                                    <TouchableOpacity
                                        style={styles.bagTouchArea}
                                        onPress={() => router.push({
                                            pathname: '/medicine-details',
                                            params: {
                                                id: item.id,
                                                medicine: JSON.stringify(item)
                                            }
                                        })}
                                    >
                                        <View style={[styles.bagIconBox, { backgroundColor: (item.color || theme.primary) + '15' }]}>
                                            <Ionicons name={item.icon || 'medical'} size={24} color={item.color || theme.primary} />
                                        </View>
                                        <View style={styles.bagContent}>
                                            <Text style={[styles.bagName, { color: theme.text }]}>{item.name}</Text>
                                            <Text style={[styles.bagStatus, { color: item.status === 'Expired' ? theme.danger : theme.warning }]}>
                                                {item.status}
                                            </Text>
                                            <View style={[styles.riskTag, { backgroundColor: theme.background }]}>
                                                <Text style={[styles.riskTagText, { color: theme.icon }]}>{(item.riskLevel || 'Medium').toUpperCase()} Risk</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
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
    requestBtn: {
        marginLeft: 'auto',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6
    },
    requestBtnText: {
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
    bagTouchArea: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
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
