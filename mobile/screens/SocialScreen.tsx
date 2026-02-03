import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';\nimport { MaterialCommunityIcons } from '@expo/vector-icons';

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
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e2e8f0',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  activityCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    backgroundColor: '#0f172a',
    padding: 16,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
  },
  time: {
    fontSize: 12,
    color: '#64748b',
  },
  activityText: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 12,
  },
  activityStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0ea5e9',
  },
  friendCard: {
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
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 4,
  },
  friendStatus: {
    fontSize: 12,
    color: '#64748b',
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  addButtonText: {
    color: '#0ea5e9',
    fontSize: 12,
    fontWeight: '600',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#0ea5e9',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
  },
  tabTextActive: {
    color: '#0ea5e9',
  },
  badgeOnline: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    marginLeft: 8,
  },
  badgeOffline: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#64748b',
    marginLeft: 8,
  },
});

export default function SocialScreen() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('activity');
  const [activity, setActivity] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);

  useEffect(() => {
    loadSocialData();
  }, []);

  const loadSocialData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with API calls
      const mockActivity = [
        {
          id: '1',
          player: 'Shadow',
          action: 'just reached Diamond I!',
          time: '2 hours ago',
          stats: { kills: 12, deaths: 2, assists: 8 },
        },
        {
          id: '2',
          player: 'Nova',
          action: 'Won a ranked game',
          time: '4 hours ago',
          stats: { kills: 8, deaths: 1, assists: 12 },
        },
        {
          id: '3',
          player: 'Phoenix',
          action: 'Played 10 matches today',
          time: '6 hours ago',
          stats: { wins: 7, losses: 3, winrate: 70 },
        },
      ];

      const mockFriends = [
        { id: '1', name: 'Blaze', status: 'In Match', online: true, mainRole: 'ADC' },
        { id: '2', name: 'Echo', status: 'In Lobby', online: true, mainRole: 'Support' },
        { id: '3', name: 'Cyber', status: 'Offline', online: false, mainRole: 'Mid' },
      ];

      setActivity(mockActivity);
      setFriends(mockFriends);
    } catch (error) {
      console.error('Failed to load social data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loading]}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Social</Text>
          <Text style={styles.subtitle}>Connect with your community</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {['activity', 'friends'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {activity.map((item) => (
              <TouchableOpacity key={item.id} style={styles.activityCard}>
                <View style={styles.activityHeader}>
                  <Text style={styles.playerName}>{item.player}</Text>
                  <Text style={styles.time}>{item.time}</Text>
                </View>
                <Text style={styles.activityText}>{item.action}</Text>
                <View style={styles.activityStats}>
                  {item.stats.kills && (
                    <View style={styles.statItem}>
                      <MaterialCommunityIcons name="sword" size={12} color="#ef4444" />
                      <Text style={styles.statValue}>{item.stats.kills}K</Text>
                    </View>
                  )}
                  {item.stats.deaths && (
                    <View style={styles.statItem}>
                      <MaterialCommunityIcons name="skull" size={12} color="#f87171" />
                      <Text style={styles.statValue}>{item.stats.deaths}D</Text>
                    </View>
                  )}
                  {item.stats.assists && (
                    <View style={styles.statItem}>
                      <MaterialCommunityIcons name="shield" size={12} color="#60a5fa" />
                      <Text style={styles.statValue}>{item.stats.assists}A</Text>
                    </View>
                  )}
                  {item.stats.wins && (
                    <View style={styles.statItem}>
                      <MaterialCommunityIcons name="trophy" size={12} color="#fbbf24" />
                      <Text style={styles.statValue}>{item.stats.wins}W</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Friends</Text>
            {friends.map((friend) => (
              <View key={friend.id} style={styles.friendCard}>
                <View style={styles.friendInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={styles.friendName}>{friend.name}</Text>
                    <View style={friend.online ? styles.badgeOnline : styles.badgeOffline} />
                  </View>
                  <Text style={styles.friendStatus}>{friend.status} • {friend.mainRole}</Text>
                </View>
                <TouchableOpacity style={styles.addButton}>
                  <Text style={styles.addButtonText}>
                    {friend.online ? 'Join' : 'Add'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
