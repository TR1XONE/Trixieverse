import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0ea5e9',
    marginHorizontal: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  settingItem: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    backgroundColor: '#0f172a',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#64748b',
  },
  chevron: {
    color: '#475569',
  },
  profileCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  profileGradient: {
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 12,
    color: '#cbd5e1',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  editButtonText: {
    color: '#0ea5e9',
    fontSize: 12,
    fontWeight: '600',
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0ea5e9',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#cbd5e1',
  },
  dangerSection: {
    marginBottom: 32,
  },
  dangerButton: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  versionText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [analytics, setAnalytics] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Sign Out',
          onPress: () => {
            console.log('User logged out');
            // Navigate to login screen
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => {
            console.log('Account deleted');
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage your preferences</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <LinearGradient
            colors={['#0ea5e9', '#06b6d4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileGradient}
          >
            <View style={styles.profileHeader}>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>Player Name</Text>
                <Text style={styles.profileEmail}>player@email.com</Text>
              </View>
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.profileStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>2,847</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>62%</Text>
                <Text style={styles.statLabel}>Win Rate</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>324</Text>
                <Text style={styles.statLabel}>Matches</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingContent}>
              <LinearGradient
                colors={['#8b5cf6', '#6366f1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.settingIcon}
              >
                <MaterialCommunityIcons name="bell" size={20} color="#ffffff" />
              </LinearGradient>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Notifications</Text>
                <Text style={styles.settingDescription}>Match alerts & messages</Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#1e293b', true: '#0ea5e9' }}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingContent}>
              <LinearGradient
                colors={['#ec4899', '#f43f5e']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.settingIcon}
              >
                <MaterialCommunityIcons name="moon-waning-crescent" size={20} color="#ffffff" />
              </LinearGradient>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Dark Mode</Text>
                <Text style={styles.settingDescription}>Always on</Text>
              </View>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#1e293b', true: '#0ea5e9' }}
              disabled
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingContent}>
              <LinearGradient
                colors={['#10b981', '#14b8a6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.settingIcon}
              >
                <MaterialCommunityIcons name="chart-line" size={20} color="#ffffff" />
              </LinearGradient>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Analytics</Text>
                <Text style={styles.settingDescription}>Help improve TrixieVerse</Text>
              </View>
            </View>
            <Switch
              value={analytics}
              onValueChange={setAnalytics}
              trackColor={{ false: '#1e293b', true: '#0ea5e9' }}
            />
          </TouchableOpacity>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingContent}>
              <LinearGradient
                colors={['#f59e0b', '#f97316']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.settingIcon}
              >
                <MaterialCommunityIcons name="lock" size={20} color="#ffffff" />
              </LinearGradient>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Change Password</Text>
                <Text style={styles.settingDescription}>Update your security</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingContent}>
              <LinearGradient
                colors={['#3b82f6', '#0ea5e9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.settingIcon}
              >
                <MaterialCommunityIcons name="file-document" size={20} color="#ffffff" />
              </LinearGradient>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Privacy Policy</Text>
                <Text style={styles.settingDescription}>View our policies</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingContent}>
              <LinearGradient
                colors={['#6366f1', '#8b5cf6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.settingIcon}
              >
                <MaterialCommunityIcons name="information" size={20} color="#ffffff" />
              </LinearGradient>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>About</Text>
                <Text style={styles.settingDescription}>About TrixieVerse</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} style={styles.chevron} />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>

          <TouchableOpacity style={styles.dangerButton} onPress={handleLogout}>
            <Text style={styles.dangerButtonText}>Sign Out</Text>
            <MaterialCommunityIcons name="logout" size={20} color="#ef4444" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount}>
            <Text style={styles.dangerButtonText}>Delete Account</Text>
            <MaterialCommunityIcons name="delete" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>TrixieVerse v1.0.0</Text>
      </ScrollView>
    </View>
  );
}
