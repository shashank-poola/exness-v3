import { useRouter } from 'expo-router';
import ThemedText from '@/src/components/common/ThemedText';
import { useAuth } from '@/src/context/auth-context';
import { authService } from '@/src/services/auth.service';
import { logger } from '@/src/services/logger.service';
import { ThemeColor } from '@/src/constants/theme';
import React, { useMemo, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignUpScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isValidEmail = (val: string) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(val);
  const isValidPassword = (val: string) => val.length >= 6 && val.length <= 20;

  const isFormValid = useMemo(
    () => isValidEmail(email) && isValidPassword(password),
    [email, password]
  );

  const handleSubmit = async () => {
    setEmailError('');
    setPasswordError('');
    setError('');

    if (!email) setEmailError('Email is required');
    if (!password) setPasswordError('Password is required');
    if (email && !isValidEmail(email)) setEmailError('Enter a valid email');
    if (password && !isValidPassword(password))
      setPasswordError('Password must be 6-20 characters');

    if (!email || !password || !isValidEmail(email) || !isValidPassword(password))
      return;

    setLoading(true);
    try {
      const result = await authService(email, password, false); // false = signup
      if (result.success && result.data) {
        login(result.data.user, result.data.token);
      } else {
        setError(result.error ?? 'Sign up failed');
        setPassword('');
      }
    } catch (err) {
      logger.error('handleSubmit', 'Error signing up', err);
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText size="xxl" style={styles.title}>
        Sign Up
      </ThemedText>

      <View style={styles.form}>
        <TextInput
          style={[styles.input, !!emailError && styles.inputError]}
          placeholder="Email"
          placeholderTextColor={ThemeColor.text.tertiary}
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            if (emailError) setEmailError('');
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={64}
        />
        {!!emailError && (
          <ThemedText size="sm" style={styles.errorText}>{emailError}</ThemedText>
        )}

        <View style={styles.passwordWrapper}>
          <TextInput
            style={[styles.input, styles.passwordInput, !!passwordError && styles.inputError]}
            placeholder="Password"
            placeholderTextColor={ThemeColor.text.tertiary}
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              if (passwordError) setPasswordError('');
            }}
            secureTextEntry={!showPassword}
            maxLength={20}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword((s) => !s)}>
            <ThemedText size="sm" style={styles.eyeText}>
              {showPassword ? 'Hide' : 'Show'}
            </ThemedText>
          </TouchableOpacity>
        </View>
        {!!passwordError && (
          <ThemedText size="sm" style={styles.errorText}>{passwordError}</ThemedText>
        )}

        {!!error && (
          <ThemedText size="sm" style={styles.errorText}>{error}</ThemedText>
        )}

        <TouchableOpacity
          style={[styles.submitButton, (loading || !isFormValid) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading || !isFormValid}
        >
          <ThemedText size="button" style={styles.submitButtonText}>
            {loading ? 'Loading...' : 'Sign Up'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.toggleButton} onPress={() => router.push('/(auth)/signin')}>
        <ThemedText size="sm">
          Already have an account? Sign In
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ThemeColor.background.app,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    gap: 12,
    marginBottom: 24,
  },
  input: {
    backgroundColor: ThemeColor.background.card,
    borderColor: ThemeColor.text.tertiary,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: ThemeColor.text.primary,
  },
  inputError: {
    borderColor: ThemeColor.status.error,
  },
  errorText: {
    color: ThemeColor.status.error,
  },
  passwordWrapper: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 64,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 8,
  },
  eyeText: {
    color: ThemeColor.text.secondary,
  },
  submitButton: {
    backgroundColor: ThemeColor.button.background,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: ThemeColor.background.app,
  },
  toggleButton: {
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
});