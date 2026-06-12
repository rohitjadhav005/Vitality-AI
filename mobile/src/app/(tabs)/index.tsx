import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import apiClient from '../../api/client';

export default function DashboardScreen() {
  const [summary, setSummary] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [sumRes, insRes] = await Promise.all([
        apiClient.get('/api/dashboard/summary'),
        apiClient.get('/api/dashboard/insights')
      ]);
      setSummary(sumRes.data);
      setInsights(insRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ef4444" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ef4444" />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Your Vitality</Text>
        <Text style={styles.subtitle}>Health & Productivity Overview</Text>
      </View>

      {summary && (
        <View style={styles.cardsRow}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Energy</Text>
            <Text style={styles.cardValue}>{summary.Energy_Score}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Productivity</Text>
            <Text style={styles.cardValue}>{summary.Productivity_Score}</Text>
          </View>
        </View>
      )}

      {summary && (
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Sleep Hours</Text>
            <Text style={styles.statValue}>{summary.Sleep_Quality} hrs</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Stress Level</Text>
            <Text style={styles.statValue}>{summary.Stress_Level} / 10</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Overall Health</Text>
            <Text style={[styles.statValue, { color: summary.Overall_Health === 'Excellent' ? '#10b981' : '#f59e0b' }]}>
              {summary.Overall_Health}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.insightsContainer}>
        <Text style={styles.sectionTitle}>AI Insights</Text>
        {insights.map((insight, index) => (
          <View key={index} style={[styles.insightCard, insight.type === 'warning' ? styles.insightWarning : styles.insightPositive]}>
            <Text style={styles.insightText}>{insight.message}</Text>
          </View>
        ))}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#a1a1aa',
    marginTop: 4,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  cardLabel: {
    color: '#a1a1aa',
    fontSize: 14,
    marginBottom: 8,
  },
  cardValue: {
    color: '#ef4444',
    fontSize: 32,
    fontWeight: 'bold',
  },
  statsContainer: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statLabel: {
    color: '#a1a1aa',
    fontSize: 16,
  },
  statValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  insightsContainer: {
    marginBottom: 24,
  },
  insightCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  insightPositive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  insightWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  insightText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
});
