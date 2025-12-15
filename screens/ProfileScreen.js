import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Switch } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { MOCK_USER } from '../utils/mockData';
import { useTaskStore } from '../store/taskStore';
import { requestNotificationPermissions } from '../utils/notifications';
import { COLORS } from '../constants/colors';

const ProfileScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(MOCK_USER.darkMode);

  const getCompletedTasksCount = useTaskStore(state => state.getCompletedTasksCount);
  const getProductivity = useTaskStore(state => state.getProductivity);
  const tasks = useTaskStore(state => state.tasks);

  const completedTasks = getCompletedTasksCount();
  const totalTasks = tasks.length;
  const productivity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  useEffect(() => {
    loadNotificationPreference();
  }, []);

  const loadNotificationPreference = async () => {
    try {
      const saved = await AsyncStorage.getItem('@notifications_enabled');
      if (saved !== null) {
        setNotificationsEnabled(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading notification preference:', error);
    }
  };

  const handleNotificationToggle = async (value) => {
    if (value) {
      const hasPermission = await requestNotificationPermissions();

      if (hasPermission) {
        setNotificationsEnabled(true);
        await AsyncStorage.setItem('@notifications_enabled', JSON.stringify(true));
      } else {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive task reminders.',
          [{ text: 'OK' }]
        );
        setNotificationsEnabled(false);
        await AsyncStorage.setItem('@notifications_enabled', JSON.stringify(false));
      }
    } else {
      setNotificationsEnabled(false);
      await AsyncStorage.setItem('@notifications_enabled', JSON.stringify(false));
    }
  };

  const handleLogout = () => {
    console.log('Logout pressed');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Hero */}
        <View style={styles.profileHero}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarGradient}>
              <View style={styles.avatarInner}>
                <Image
                  source={{ uri: MOCK_USER.avatar }}
                  style={styles.avatarImage}
                />
              </View>
            </View>
          </View>
          <Text style={styles.userName}>{MOCK_USER.name}</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{completedTasks}</Text>
            <Text style={styles.statLabel}>Tasks Done</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#10b981' }]}>
              {productivity}%
            </Text>
            <Text style={styles.statLabel}>Productivity</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PREFERENCES</Text>
          <View style={styles.settingsGroup}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <MaterialCommunityIcons
                    name="bell"
                    size={16}
                    color="#a1a1aa"
                  />
                </View>
                <Text style={styles.settingLabel}>Notifications</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationToggle}
                color="#6366f1"
                trackColor={{ false: '#27272a', true: '#6366f1' }}
              />
            </View>
            <View style={styles.divider} />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  profileHero: {
    alignItems: 'center',
    paddingTop: 16,
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    padding: 2,
    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
    backgroundColor: '#6366f1', // Fallback for React Native
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 46,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    opacity: 0.9,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingLeft: 4,
  },
  settingsGroup: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 14,
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
});

export default ProfileScreen;
