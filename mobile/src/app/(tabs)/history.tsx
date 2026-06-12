import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import apiClient from '../../api/client';

export default function HistoryScreen() {
  const [history, setHistory] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchHistoryAndAnalytics = async () => {
    try {
      const [histRes, analRes] = await Promise.all([
        apiClient.get('/api/history'),
        apiClient.get('/api/analytics')
      ]);
      setHistory(histRes.data);
      setAnalytics(analRes.data);
    } catch (err) {
      console.error('Failed to fetch history data', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistoryAndAnalytics();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ef4444" />
      </View>
    );
  }

  const screenWidth = Dimensions.get("window").width - 32;

  // Prepare chart data
  let chartData = null;
  if (analytics && analytics.bar && analytics.bar.length > 0) {
    // Only take the last 7 for chart clarity
    const recent = analytics.bar.slice(-7);
    chartData = {
      labels: recent.map((d: any) => d.name),
      datasets: [
        {
          data: recent.map((d: any) => d.productivity),
          color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // Red
          strokeWidth: 2
        },
        {
          data: recent.map((d: any) => d.mood),
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Blue
          strokeWidth: 2
        }
      ],
      legend: ["Productivity", "Mood (x10)"]
    };
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Analytics</Text>
      <Text style={styles.subtitle}>Track your progress over time</Text>

      {chartData && (
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData}
            width={screenWidth}
            height={220}
            chartConfig={{
              backgroundColor: '#18181b',
              backgroundGradientFrom: '#18181b',
              backgroundGradientTo: '#18181b',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(161, 161, 170, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: "4",
                strokeWidth: "2",
              }
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16
            }}
          />
        </View>
      )}

      <Text style={[styles.title, { marginTop: 24, fontSize: 24 }]}>Recent History</Text>
      <View style={styles.historyList}>
        {history.length === 0 ? (
          <Text style={styles.emptyText}>No history available yet.</Text>
        ) : (
          history.map((record, index) => (
            <View key={index} style={styles.historyItem}>
              <View>
                <Text style={styles.historyDate}>{record.date}</Text>
                <Text style={styles.historyDetails}>Sleep: {record.sleep_hours}h | Stress: {record.stress_level}/10</Text>
              </View>
              <View style={styles.scoreBadge}>
                <Text style={styles.scoreText}>{record.energy_score}</Text>
              </View>
            </View>
          ))
        )}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#a1a1aa',
    marginTop: 4,
    marginBottom: 24,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  historyList: {
    marginTop: 16,
  },
  historyItem: {
    backgroundColor: '#18181b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  historyDate: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  historyDetails: {
    color: '#a1a1aa',
    fontSize: 14,
  },
  scoreBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  scoreText: {
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyText: {
    color: '#a1a1aa',
    fontStyle: 'italic',
  },
});
