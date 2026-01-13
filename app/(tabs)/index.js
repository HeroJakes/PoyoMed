import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
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

export default function Home() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const gradients = Gradients;

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
            <View style={styles.headerLeft}>
              <View style={[styles.avatarContainer, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
                <Ionicons name="sunny" size={24} color={theme.primary} />
              </View>
              <View style={styles.headerText}>
                <Text style={[styles.greeting, { color: theme.icon }]}>Good Morning,</Text>
                <Text style={[styles.userName, { color: theme.text }]}>Ivan</Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.notificationBtn, { backgroundColor: 'rgba(255,255,255,0.6)', borderColor: theme.border, borderWidth: 1 }]}>
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
                <Text style={[styles.heroTitle, { color: theme.text }]}>Daily Health Tip</Text>
                <Text style={[styles.heroSubtitle, { color: theme.text + 'CC' }]}>Stay hydrated! Drinking warm water in the morning boosts metabolism.</Text>
              </View>
              <View style={styles.heroIconContainer}>
                <Ionicons name="water" size={40} color={theme.primary} />
              </View>
            </View>
            <TouchableOpacity style={styles.heroButton}>
              <Text style={[styles.heroButtonText, { color: theme.text }]}>Learn More</Text>
              <Ionicons name="arrow-forward" size={16} color={theme.primary} />
            </TouchableOpacity>
          </LinearGradient>

          {/* Horizontal Section - Today's Reminders */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Schedule</Text>
            <TouchableOpacity>
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
            <ScheduleCard
              time="08:00 AM"
              title="Vitamin C"
              subtitle="Take after breakfast"
              icon="nutrition"
              color="#FFB347"
              theme={theme}
            />
            <ScheduleCard
              time="12:30 PM"
              title="Omega 3"
              subtitle="Take with lunch"
              icon="fish"
              color="#FF8C42"
              theme={theme}
            />
            <ScheduleCard
              time="09:00 PM"
              title="Magnesium"
              subtitle="Before sleep"
              icon="moon"
              color="#F06292"
              theme={theme}
            />
          </ScrollView>

          {/* Expiring Soon Section */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Expiring Soon</Text>
          </View>

          <View style={[styles.expiringContainer, { backgroundColor: 'rgba(255,255,255,0.6)', borderColor: theme.border, borderWidth: 1 }]}>
            <ExpiringItem
              title="Paracetamol"
              days="3 days left"
              icon="alert-circle"
              color={theme.danger}
              theme={theme}
            />
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <ExpiringItem
              title="Cough Syrup"
              days="1 week left"
              icon="time"
              color={theme.warning}
              theme={theme}
            />
          </View>

          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <StatItem label="Adherence" value="92%" icon="checkmark-circle" color="#82C91E" theme={theme} />
            <StatItem label="Streak" value="12 Days" icon="flame" color="#FF8C42" theme={theme} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function ScheduleCard({ time, title, subtitle, icon, color, theme }) {
  return (
    <View style={[styles.scheduleCard, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
      <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.cardTime, { color: theme.icon }]}>{time}</Text>
      <Text style={[styles.cardTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.cardSubtitle, { color: theme.icon }]} numberOfLines={1}>{subtitle}</Text>
    </View>
  );
}

function ExpiringItem({ title, days, icon, color, theme }) {
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
      <TouchableOpacity style={[styles.recycleBtn, { backgroundColor: theme.pastelOrange }]}>
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
});
