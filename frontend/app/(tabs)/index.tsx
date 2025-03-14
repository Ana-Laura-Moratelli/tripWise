import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ImageBackground } from 'react-native';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <ImageBackground source={require('@/assets/images/header-bg.png')} style={styles.headerBackground}>
        <View style={styles.header}>
          <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
          <Text style={styles.title}>Go ahead and set up your account</Text>
          <Text style={styles.subtitle}>Sign in-up to enjoy the best managing experience</Text>
        </View>
      </ImageBackground>
      
      <View style={styles.loginContainer}>
        <View style={styles.tabs}>
          <TouchableOpacity style={styles.inactiveTab}>
            <Text style={styles.inactiveTabText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.activeTab}>
            <Text style={styles.activeTabText}>Register</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput placeholder="E-mail ID" style={styles.input} />
          <TextInput placeholder="Password" style={styles.input} secureTextEntry />
        </View>
        
       
        
        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginButtonText}>Cadastrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'white',
  },
  headerBackground: {
    width: '100%',
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'flex-start',
    paddingTop: 16,
  },
  logo: {
    width: 150,
    height: 50,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  loginContainer: {
    width: '100%',
    height: '100%',
    marginTop: -40,
    backgroundColor: 'white',
    borderRadius: 40,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 40,
    borderWidth: 1, 
    borderColor: '#E2E8F0',
    padding: 5,
    width: '100%',
    justifyContent: 'center',
  },
  activeTab: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 40,
    padding: 16,
    alignItems: 'center',
  },
  inactiveTab: {
    flex: 1,
    backgroundColor: '#EEE',
    borderRadius: 40,
    padding: 16,
    alignItems: 'center',
  },
  activeTabText: {
    fontWeight: 'bold',
  },
  inactiveTabText: {
    color: '#888',
  },
  inputContainer: {
    width: '100%',
    marginVertical: 16,
  },
  input: {
    padding: 16,
    borderRadius: 40,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    color: 'black',
  },
  
  loginButton: {
    backgroundColor: '#5B2FD4',
    padding: 16,
    borderRadius: 40,
    width: '100%',
    alignItems: 'center',
    
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});