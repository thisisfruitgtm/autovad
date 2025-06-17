import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { makeRedirectUri } from 'expo-auth-session';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { ArrowLeft, Copy } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';

export default function DebugOAuthScreen() {
  // Generate all possible redirect URIs
  const devRedirect = makeRedirectUri({
    scheme: 'exp',
    path: 'auth/callback'
  });

  const prodRedirect = makeRedirectUri({ 
    scheme: 'autovad',
    path: 'auth/callback'
  });

  const autoRedirect = makeRedirectUri({
    path: 'auth/callback'
  });

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    alert('Copiat în clipboard!');
  };

  const DebugRow = ({ label, value, copyable = false }: { label: string; value: string; copyable?: boolean }) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label}:</Text>
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{value}</Text>
        {copyable && (
          <TouchableOpacity onPress={() => copyToClipboard(value)} style={styles.copyButton}>
            <Copy size={16} color="#F97316" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>OAuth Debug Info</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Environment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌍 Environment</Text>
          <DebugRow label="NODE_ENV" value={process.env.NODE_ENV || 'undefined'} />
          <DebugRow label="__DEV__" value={__DEV__ ? 'true' : 'false'} />
          <DebugRow label="Expo Version" value={Constants.expoVersion || 'N/A'} />
        </View>

        {/* App Config */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 App Configuration</Text>
          <DebugRow label="App Scheme" value={Constants.expoConfig?.scheme || 'N/A'} />
          <DebugRow label="App Slug" value={Constants.expoConfig?.slug || 'N/A'} />
          <DebugRow label="Bundle ID (iOS)" value={Constants.expoConfig?.ios?.bundleIdentifier || 'N/A'} />
          <DebugRow label="Package (Android)" value={Constants.expoConfig?.android?.package || 'N/A'} />
        </View>

        {/* Redirect URIs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔗 Generated Redirect URIs</Text>
          <DebugRow label="Development (exp)" value={devRedirect} copyable />
          <DebugRow label="Production (custom)" value={prodRedirect} copyable />
          <DebugRow label="Auto-detected" value={autoRedirect} copyable />
        </View>

        {/* Environment Variables */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔐 Environment Variables</Text>
          <DebugRow 
            label="SUPABASE_URL" 
            value={process.env.EXPO_PUBLIC_SUPABASE_URL ? 'Set ✓' : 'Not set ✗'} 
          />
          <DebugRow 
            label="SUPABASE_ANON_KEY" 
            value={process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'Set ✓' : 'Not set ✗'} 
          />
          {process.env.EXPO_PUBLIC_SUPABASE_URL && (
            <DebugRow 
              label="Supabase Callback" 
              value={`${process.env.EXPO_PUBLIC_SUPABASE_URL}/auth/v1/callback`} 
              copyable 
            />
          )}
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Configuration Checklist</Text>
          <View style={styles.instructions}>
            <Text style={styles.instructionTitle}>1. Supabase Dashboard URLs:</Text>
            <Text style={styles.instructionText}>Add these to Auth → URL Configuration:</Text>
            <TouchableOpacity onPress={() => copyToClipboard(devRedirect)}>
              <Text style={styles.copyableText}>{devRedirect}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => copyToClipboard(prodRedirect)}>
              <Text style={styles.copyableText}>{prodRedirect}</Text>
            </TouchableOpacity>
            
            <Text style={styles.instructionTitle}>2. Google Cloud Console:</Text>
            <Text style={styles.instructionText}>Add this to Authorized redirect URIs:</Text>
            {process.env.EXPO_PUBLIC_SUPABASE_URL && (
              <TouchableOpacity onPress={() => copyToClipboard(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/auth/v1/callback`)}>
                <Text style={styles.copyableText}>{`${process.env.EXPO_PUBLIC_SUPABASE_URL}/auth/v1/callback`}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#F97316',
    marginBottom: 16,
  },
  row: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#888',
    marginBottom: 4,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  value: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#fff',
    flex: 1,
    marginRight: 8,
  },
  copyButton: {
    padding: 8,
  },
  instructions: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  instructionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888',
    marginBottom: 8,
  },
  copyableText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#F97316',
    backgroundColor: '#2a1a0a',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
}); 