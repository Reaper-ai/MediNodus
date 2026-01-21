// mobile/app/(auth)/login.tsx
import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useGlobalState } from '@/context/GlobalStateContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function LoginScreen() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, register, hapticFeedback } = useGlobalState();
  
  // --- FIX APPLIED HERE ---
  const colorScheme = useColorScheme() ?? 'light';
  // If Colors[colorScheme] is undefined, FALLBACK to Colors.light
  const theme = Colors[colorScheme] || Colors.light; 
  // ------------------------

  const handleSubmit = async () => {
    if (!email || !password || (isRegistering && !fullName)) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    hapticFeedback();

    try {
      if (isRegistering) {
        await register(email, password, fullName);
      } else {
        await login(email, password);
      }
      // Navigation is handled automatically by _layout.tsx
    } catch (error: any) {
      Alert.alert("Authentication Failed", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = [
    styles.input, 
    { 
      // Now 'theme' is guaranteed to be defined, so this won't crash
      backgroundColor: theme.cardBackground, 
      color: theme.text, 
      borderColor: theme.border 
    }
  ];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          {isRegistering ? "Create Account" : "Welcome Back"}
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          {isRegistering 
            ? "Sign up to start your health journey" 
            : "Sign in to access your health reports"}
        </ThemedText>
        
        {isRegistering && (
          <TextInput 
            style={inputStyle} 
            placeholder="Full Name" 
            placeholderTextColor={theme.icon}
            value={fullName} 
            onChangeText={setFullName}
            autoCapitalize="words"
          />
        )}

        <TextInput 
          style={inputStyle} 
          placeholder="Email Address" 
          placeholderTextColor={theme.icon}
          value={email} 
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput 
          style={inputStyle} 
          placeholder="Password" 
          placeholderTextColor={theme.icon}
          value={password} 
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.tint, opacity: isLoading ? 0.7 : 1 }]} 
          onPress={handleSubmit}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <ThemedText style={styles.buttonText}>
              {isRegistering ? "Sign Up" : "Login"}
            </ThemedText>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setIsRegistering(!isRegistering)}
          style={styles.switchButton}
        >
          <ThemedText style={{ color: theme.tint }}>
            {isRegistering 
              ? "Already have an account? Login" 
              : "Don't have an account? Sign Up"}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  content: { gap: 12 },
  title: { textAlign: 'center', marginBottom: 4 },
  subtitle: { textAlign: 'center', opacity: 0.6, marginBottom: 24 },
  input: { 
    height: 56, 
    borderWidth: 1, 
    borderRadius: 16, 
    paddingHorizontal: 20, 
    fontSize: 16 
  },
  button: { 
    height: 56, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderRadius: 28, 
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  switchButton: { alignItems: 'center', marginTop: 16, padding: 8 }
});