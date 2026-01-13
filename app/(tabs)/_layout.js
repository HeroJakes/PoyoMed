import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';

function CustomTabBar({ state, descriptors, navigation }) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const [layouts, setLayouts] = useState({});
  const translateX = useSharedValue(0);
  const pillWidth = useSharedValue(0);

  const onTabLayout = (name, event) => {
    const { x, width } = event.nativeEvent.layout;
    setLayouts(prev => ({ ...prev, [name]: { x, width } }));
  };

  useEffect(() => {
    const activeRouteName = state.routes[state.index].name;
    const layout = layouts[activeRouteName];
    if (layout) {
      const config = {
        duration: 500,
        easing: Easing.bezier(0.33, 1, 0.68, 1), // Smooth OutQuart easing
      };
      translateX.value = withTiming(layout.x, config);
      pillWidth.value = withTiming(layout.width, config);
    }
  }, [state.index, layouts]);

  const animatedPillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: pillWidth.value,
  }));

  return (
    <View style={styles.tabBarContainer}>
      <View style={[styles.tabBar, { backgroundColor: 'rgba(255, 255, 255, 0.85)', borderColor: theme.border }]}>
        {/* Sliding Pill Background */}
        <Animated.View style={[styles.slidingPill, animatedPillStyle]} />

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title !== undefined ? options.title : route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const getIcon = (name, focused) => {
            let iconName = 'home-outline';
            if (name === 'index') iconName = focused ? 'home' : 'home-outline';
            else if (name === 'medicines') iconName = focused ? 'medical' : 'medical-outline';
            else if (name === 'camera') iconName = focused ? 'camera' : 'camera-outline';
            else if (name === 'recycle') iconName = focused ? 'leaf' : 'leaf-outline';
            else if (name === 'profile') iconName = focused ? 'person' : 'person-outline';

            return <Ionicons name={iconName} size={20} color={focused ? '#fff' : theme.icon} />;
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              onLayout={(event) => onTabLayout(route.name, event)}
              style={[
                styles.tabItem,
                isFocused && { flex: 2.5 } // Keep the flex logic for layout
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                {getIcon(route.name, isFocused)}
                {isFocused && (
                  <Text style={styles.activeTabLabel}>{label}</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home' }}
      />
      <Tabs.Screen
        name="medicines"
        options={{ title: 'Medicine' }}
      />
      <Tabs.Screen
        name="camera"
        options={{ title: 'Scan' }}
      />
      <Tabs.Screen
        name="recycle"
        options={{ title: 'Recycle' }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile' }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 30,
    left: 15,
    right: 15,
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    height: 65,
    borderRadius: 35,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  slidingPill: {
    position: 'absolute',
    height: 45,
    backgroundColor: '#2D2D2D',
    borderRadius: 25,
    left: 0, // Use 0 so translateX aligns perfectly with onLayout x
  },
  tabItem: {
    flex: 1,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    zIndex: 1,
  },
  activeTabLabel: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 6,
  },
});
