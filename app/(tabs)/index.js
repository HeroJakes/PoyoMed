import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { collection, doc, getDoc, onSnapshot, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Gradients } from '../../constants/theme';
import { auth, db } from '../../firebase';
import { getNextDose, isNextDoseToday } from '../../utils/medicineUtils';

const { width, height } = Dimensions.get('window');

export default function Home() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const gradients = Gradients;
  const router = useRouter();

  const [userName, setUserName] = useState('User');
  const [todaysMedicines, setTodaysMedicines] = useState([]);
  const [expiringMedicines, setExpiringMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]); // Placeholder for now

  const onRefresh = async () => {
    setRefreshing(true);
    if (auth.currentUser) {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        setUserName(userDoc.data().name || 'User');
      }
    }
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Fetch User Name
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserName(userDoc.data().name || 'User');
        }
      }
    };
    fetchUserData();
  }, []);

  // Fetch Medicines and Filter
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const medicinesRef = collection(db, 'users', user.uid, 'medicines');
    const q = query(medicinesRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const meds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Filter for Today's Schedule
      const todayMeds = meds.filter(med => {
        if (med.frequency !== 'Daily') return false;
        if (med.status === 'Expired') return false;

        // Check if next dose is today
        if (!isNextDoseToday(med.times)) return false;

        // Check if THIS specific dose has been taken
        const nextDose = getNextDose(med.times);
        if (nextDose === 'No more doses today' || nextDose === 'No doses scheduled') return false;

        const todayStr = new Date().toISOString().split('T')[0];
        const expectedTakenEntry = `${todayStr} ${nextDose}`;

        if (med.takenHistory && med.takenHistory.includes(expectedTakenEntry)) {
          return false; // Already taken
        }

        return true;
      });
      setTodaysMedicines(todayMeds);

      // Filter for Expiring Soon (<= 7 days)
      const expiring = meds.filter(med => {
        if (!med.expiryDate) return false;
        const today = new Date();
        const expiry = new Date(med.expiryDate);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays >= 0;
      }).map(med => {
        const today = new Date();
        const expiry = new Date(med.expiryDate);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return { ...med, daysLeft: diffDays };
      });
      setExpiringMedicines(expiring);

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleNotification = () => {
    setShowNotifications(true);
  };

  const handleLearnMore = () => {
    Alert.alert(
      'Health Tip',
      'Drinking warm water in the morning can help stimulate your metabolism, aid digestion, and keep you hydrated throughout the day. It is a simple habit with great benefits!'
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return theme.success;
      case 'Low Stock': return theme.warning;
      case 'Expiring': return theme.warning;
      case 'Expired': return theme.danger;
      default: return theme.icon;
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) return 'Good Night,';
    if (hour < 12) return 'Good Morning,';
    if (hour < 18) return 'Good Afternoon,';
    if (hour < 21) return 'Good Evening,';
    return 'Good Night,';
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
          }
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.avatarContainer, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
                <Ionicons name="sunny" size={24} color={theme.primary} />
              </View>
              <View style={styles.headerText}>
                <Text style={[styles.greeting, { color: theme.icon }]}>{getGreeting()}</Text>
                <Text style={[styles.userName, { color: theme.text }]}>{userName}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.notificationBtn, { backgroundColor: 'rgba(255,255,255,0.6)', borderColor: theme.border, borderWidth: 1 }]}
              onPress={handleNotification}
            >
              <Ionicons name="notifications-outline" size={22} color={theme.text} />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>

          {/* Featured Insight Card */}
          <LinearGradient
            colors={gradients.warm}
            style={styles.heroCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.heroContent}>
              <View>
                <Text style={[styles.heroTitle, { color: '#FFFFFF' }]}>Daily Health Tip</Text>
                <Text style={[styles.heroSubtitle, { color: 'rgba(255,255,255,0.9)' }]}>Stay hydrated! Drinking warm water in the morning boosts metabolism.</Text>
              </View>
              <View style={styles.heroIconContainer}>
                <Ionicons name="water" size={40} color={'#FFFFFF'} />
              </View>
            </View>
            <TouchableOpacity style={styles.heroButton} onPress={handleLearnMore}>
              <Text style={[styles.heroButtonText, { color: theme.text }]}>Learn More</Text>
              <Ionicons name="arrow-forward" size={16} color={theme.primary} />
            </TouchableOpacity>
          </LinearGradient>

          {/* Horizontal Section - Today's Reminders */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Schedule</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/medicines')}>
              <Text style={[styles.seeAll, { color: theme.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
            snapToInterval={width * 0.7 + 15}
            decelerationRate="fast"
          >
            {todaysMedicines.length > 0 ? (
              todaysMedicines.map((med) => (
                <ScheduleCard
                  key={med.id}
                  medicine={med}
                  theme={theme}
                  router={router}
                />
              ))
            ) : (
              <View style={{ padding: 20, alignItems: 'center', width: width - 40 }}>
                <Text style={{ color: theme.icon }}>No medicines scheduled for today.</Text>
              </View>
            )}
          </ScrollView>

          {/* Expiring Soon Section */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Expiring Soon</Text>
          </View>

          <View style={[styles.expiringContainer, { backgroundColor: 'rgba(255,255,255,0.6)', borderColor: theme.border, borderWidth: 1 }]}>
            {expiringMedicines.length > 0 ? (
              expiringMedicines.map((med, index) => (
                <View key={med.id}>
                  <ExpiringItem
                    title={med.name}
                    days={`${med.daysLeft} days left`}
                    icon={med.icon || 'medical'}
                    color={theme.warning} // Or dynamic based on severity
                    theme={theme}
                    onRecycle={() => router.push('/(tabs)/recycle')}
                  />
                  {index < expiringMedicines.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                  )}
                </View>
              ))
            ) : (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: theme.icon }}>No medicines expiring soon.</Text>
              </View>
            )}
          </View>

          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <StatItem label="Total Medicines" value={todaysMedicines.length.toString()} icon="medical" color="#82C91E" theme={theme} />
            <StatItem label="Expiring" value={expiringMedicines.length.toString()} icon="alert-circle" color="#FF8C42" theme={theme} />
          </View>
        </ScrollView>

        {/* Notification Popup */}
        <NotificationPopup
          visible={showNotifications}
          onClose={() => setShowNotifications(false)}
          notifications={notifications}
          onClearAll={() => setNotifications([])}
          theme={theme}
          gradients={gradients}
        />
      </SafeAreaView>
    </View>
  );
}

function ScheduleCard({ medicine, theme, router }) {
  return (
    <TouchableOpacity
      style={[styles.scheduleCard, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}
      onPress={() => router.push({
        pathname: '/medicine-details',
        params: { medicine: JSON.stringify(medicine) }
      })}
    >
      <View style={[styles.iconCircle, { backgroundColor: medicine.color + '20' }]}>
        <Ionicons name={medicine.icon} size={24} color={medicine.color} />
      </View>
      <Text style={[styles.cardTime, { color: theme.icon }]}>{getNextDose(medicine.times)}</Text>
      <Text style={[styles.cardTitle, { color: theme.text }]}>{medicine.name}</Text>
      <Text style={[styles.cardSubtitle, { color: theme.icon }]} numberOfLines={1}>{medicine.dosage}</Text>
    </TouchableOpacity>
  );
}

function ExpiringItem({ title, days, icon, color, theme, onRecycle }) {
  return (
    <View style={styles.expiringItem}>
      <View style={styles.expiringLeft}>
        <View style={[styles.expiringIconContainer, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <View style={styles.expiringText}>
          <Text style={[styles.expiringTitle, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.expiringDays, { color: color }]}>{days}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.recycleBtn, { backgroundColor: theme.pastelOrange }]}
        onPress={onRecycle}
      >
        <Text style={[styles.recycleText, { color: theme.primary }]}>Recycle</Text>
      </TouchableOpacity>
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

function NotificationPopup({ visible, onClose, notifications, onClearAll, theme, gradients }) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Notifications</Text>
            <View style={styles.modalHeaderBtns}>
              <TouchableOpacity onPress={onClearAll}>
                <Text style={[styles.clearAllText, { color: theme.primary }]}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeModalBtn} onPress={onClose}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {notifications.length > 0 ? (
              notifications.map((notif, index) => (
                <View key={notif.id}>
                  <View style={styles.notifItem}>
                    <View style={[styles.notifIconContainer, { backgroundColor: notif.color + '15' }]}>
                      <Ionicons name={notif.icon} size={22} color={notif.color} />
                    </View>
                    <View style={styles.notifText}>
                      <View style={styles.notifTitleRow}>
                        <Text style={[styles.notifTitle, { color: theme.text }]}>{notif.title}</Text>
                        {notif.unread && <View style={styles.unreadDot} />}
                      </View>
                      <Text style={[styles.notifMessage, { color: theme.icon }]}>{notif.message}</Text>
                      <Text style={[styles.notifTime, { color: theme.icon }]}>{notif.time}</Text>
                    </View>
                  </View>
                  {index < notifications.length - 1 && (
                    <View style={[styles.notifDivider, { backgroundColor: theme.border }]} />
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyNotif}>
                <Ionicons name="notifications-off-outline" size={48} color={theme.icon} />
                <Text style={[styles.emptyNotifText, { color: theme.icon }]}>No new notifications</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
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
  headerText: {
    marginLeft: 12,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FA5252',
    borderWidth: 1.5,
    borderColor: '#FFFBF7',
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
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
    width: width * 0.55,
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
  horizontalScroll: {
    paddingRight: 20,
    marginBottom: 30,
  },
  scheduleCard: {
    width: width * 0.45,
    padding: 20,
    borderRadius: 25,
    marginRight: 15,
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
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTime: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
  },
  expiringContainer: {
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
  expiringItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  expiringLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiringIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expiringText: {
    justifyContent: 'center',
  },
  expiringTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  expiringDays: {
    fontSize: 12,
    fontWeight: '600',
  },
  recycleBtn: {
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  recycleText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    marginHorizontal: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    maxHeight: height * 0.7,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  modalHeaderBtns: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 15,
  },
  closeModalBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifItem: {
    flexDirection: 'row',
    paddingVertical: 15,
  },
  notifIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  notifText: {
    flex: 1,
  },
  notifTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FA5252',
  },
  notifMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  notifTime: {
    fontSize: 12,
  },
  notifDivider: {
    height: 1,
  },
  emptyNotif: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyNotifText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
  },
});
