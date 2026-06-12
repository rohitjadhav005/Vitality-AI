import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import apiClient from '../../api/client';

export default function PredictionScreen() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    Sleep_Hours: '',
    Stress_Level: '',
    Exercise_Duration_min: '',
    Water_Intake_L: '',
    Screen_Time_hr: '',
    Mood_Score: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ Energy_Score: number, Productivity_Score: number } | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validate
    const values = Object.values(formData);
    if (values.some(v => v === '')) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const payload = {
        Sleep_Hours: parseFloat(formData.Sleep_Hours),
        Stress_Level: parseFloat(formData.Stress_Level),
        Exercise_Duration_min: parseFloat(formData.Exercise_Duration_min),
        Water_Intake_L: parseFloat(formData.Water_Intake_L),
        Screen_Time_hr: parseFloat(formData.Screen_Time_hr),
        Mood_Score: parseFloat(formData.Mood_Score),
      };

      const res = await apiClient.post('/predict', payload);
      setResult(res.data);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Prediction failed. Please try again.';
      Alert.alert('Prediction Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.title}>New Prediction</Text>
        <Text style={styles.subtitle}>Enter your daily metrics to predict your energy and productivity.</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sleep Hours (0-24)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 7.5"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={formData.Sleep_Hours}
              onChangeText={(text) => handleInputChange('Sleep_Hours', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Stress Level (1-10)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 4"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={formData.Stress_Level}
              onChangeText={(text) => handleInputChange('Stress_Level', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Exercise Duration (mins)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 45"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={formData.Exercise_Duration_min}
              onChangeText={(text) => handleInputChange('Exercise_Duration_min', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Water Intake (Litres)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2.5"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={formData.Water_Intake_L}
              onChangeText={(text) => handleInputChange('Water_Intake_L', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Screen Time (Hours)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 6"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={formData.Screen_Time_hr}
              onChangeText={(text) => handleInputChange('Screen_Time_hr', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mood Score (1-10)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 8"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={formData.Mood_Score}
              onChangeText={(text) => handleInputChange('Mood_Score', text)}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Predict</Text>}
          </TouchableOpacity>
        </View>

        {result && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Prediction Results</Text>
            <View style={styles.resultRow}>
              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>Energy</Text>
                <Text style={styles.resultValue}>{result.Energy_Score}</Text>
              </View>
              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>Productivity</Text>
                <Text style={styles.resultValue}>{result.Productivity_Score}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={() => {
                setResult(null);
                setFormData({
                  Sleep_Hours: '',
                  Stress_Level: '',
                  Exercise_Duration_min: '',
                  Water_Intake_L: '',
                  Screen_Time_hr: '',
                  Mood_Score: '',
                });
                router.push('/(tabs)');
              }}
            >
              <Text style={styles.secondaryButtonText}>Go to Dashboard</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a1a1aa',
    marginBottom: 24,
  },
  form: {
    backgroundColor: '#18181b',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#a1a1aa',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#27272a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    marginTop: 24,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    alignItems: 'center',
  },
  resultTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 16,
  },
  resultCard: {
    alignItems: 'center',
  },
  resultLabel: {
    color: '#a1a1aa',
    fontSize: 14,
    marginBottom: 4,
  },
  resultValue: {
    color: '#ef4444',
    fontSize: 40,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#27272a',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
