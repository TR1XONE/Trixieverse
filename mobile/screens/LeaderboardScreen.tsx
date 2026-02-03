import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../services/api';

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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    backgroundColor: '#0f172a',
  },
  filterButtonActive: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  leaderboardCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    backgroundColor: '#0f172a',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rankText: {
    fontWeight: 'bold',
    color: '#ffffff',
    fontSize: 14,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 4,
  },
  playerRank: {
    fontSize: 12,
    color: '#94a3b8',
  },
  stats: {
    alignItems: 'flex-end',
  },
  rating: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0ea5e9',
    marginBottom: 2,
  },
  winRate: {
    fontSize: 12,
    color: '#64748b',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0ea5e9',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

interface Player {
  id: string;
  rank: number;
  name: string;
  rating: number;
  division: string;
  winRate: number;
  matches: number;
}

export default function LeaderboardScreen() {
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('global');
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    fetchLeaderboard();
  }, [activeFilter]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // Mock data - replace with API call
      const mockPlayers: Player[] = [
        { id: '1', rank: 1, name: 'Shadow', rating: 2847, division: 'Diamond I', winRate: 62, matches: 324 },
        { id: '2', rank: 2, name: 'Nova', rating: 2756, division: 'Diamond I', winRate: 60, matches: 287 },
        { id: '3', rank: 3, name: 'Phoenix', rating: 2645, division: 'Diamond II', winRate: 58, matches: 256 },
        { id: '4', rank: 4, name: 'Blaze', rating: 2534, division: 'Diamond II', winRate: 57, matches: 234 },
        { id: '5', rank: 5, name: 'Echo', rating: 2423, division: 'Emerald I', winRate: 55, matches: 198 },
        { id: '6', rank: 6, name: 'Cyber', rating: 2312, division: 'Emerald I', winRate: 54, matches: 176 },
        { id: '7', rank: 7, name: 'Vortex', rating: 2201, division: 'Emerald II', winRate: 53, matches: 154 },
        { id: '8', rank: 8, name: 'Nexus', rating: 2098, division: 'Emerald II', winRate: 51, matches: 142 },
      ];

      setPlayers(mockPlayers);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#fbbf24'; // Gold
    if (rank === 2) return '#c0c0c0'; // Silver
    if (rank === 3) return '#cd7f32'; // Bronze
    return '#0ea5e9'; // Cyan for others
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '👑';
    if (rank <= 3) return '⭐';
    return rank.toString();
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
          <Text style={styles.title}>Leaderboard</Text>
          <Text style={styles.subtitle}>See where you rank</Text>
        </View>

        {/* Filters */}
        <View style={styles.filterContainer}>
          {['global', 'friends', 'region'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterButton, activeFilter === filter && styles.filterButtonActive]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  activeFilter === filter && styles.filterButtonTextActive,
                ]}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Player List */}
        {players.length > 0 ? (
          <>
            <Text style={styles.sectionHeader}>Top Players</Text>
            {players.map((player) => (
              <TouchableOpacity key={player.id} style={styles.leaderboardCard}>
                <LinearGradient
                  colors={[getRankColor(player.rank), '#1e293b']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.rankBadge}
                >
                  <Text style={styles.rankText}>
                    {player.rank <= 3 ? getRankIcon(player.rank) : player.rank}
                  </Text>
                </LinearGradient>

                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>{player.name}</Text>
                  <Text style={styles.playerRank}>{player.division}</Text>
                </View>

                <View style={styles.stats}>
                  <Text style={styles.rating}>{player.rating}</Text>
                  <Text style={styles.winRate}>{player.winRate}% WR • {player.matches}M</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No players found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
