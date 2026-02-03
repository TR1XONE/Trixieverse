import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  scrollView: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#0ea5e9',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#e2e8f0',
    fontSize: 16,
    marginBottom: 12,
  },
  inputFocused: {
    borderColor: '#0ea5e9',
  },
  loginButton: {
    borderRadius: 8,
    paddingVertical: 14,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  signupText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  signupLink: {
    color: '#0ea5e9',
    fontWeight: '600',
  },
  demoButton: {
    marginTop: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#0ea5e9',
    borderRadius: 8,
    alignItems: 'center',
  },
  demoButtonText: {
    color: '#0ea5e9',
    fontWeight: '600',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#1e293b',
    marginVertical: 24,
  },
  dividerText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 12,
    marginBottom: 24,
  },
});

interface LoginScreenProps {
  navigation?: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // API call to backend
      const response = await fetch('https://api.trixieverse.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        // Store token and navigate
        console.log('Login successful:', data);
        // navigation?.replace('Main');
      } else {
        Alert.alert('Error', 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to login. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    // Skip auth for demo
    console.log('Demo login');
    // navigation?.replace('Main');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>TrixieVerse</Text>
          <Text style={styles.tagline}>Your coach that actually gets you</Text>
        </View>

        {/* Login Form */}
        <View style={styles.formSection}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, emailFocused && styles.inputFocused]}
            placeholder="your@email.com"
            placeholderTextColor="#475569"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            editable={!loading}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={[styles.input, passwordFocused && styles.inputFocused]}
            placeholder="••••••••"
            placeholderTextColor="#475569"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            editable={!loading}
          />

          <LinearGradient
            colors={['#0ea5e9', '#06b6d4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.loginButton}
          >
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              style={{ width: '100%', alignItems: 'center' }}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </LinearGradient>

          <Text style={styles.signupText}>
            Don't have an account?{' '}
            <Text style={styles.signupLink}>Create one</Text>
          </Text>
        </View>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.demoButton} onPress={handleDemoLogin} disabled={loading}>
          <Text style={styles.demoButtonText}>Try Demo</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
