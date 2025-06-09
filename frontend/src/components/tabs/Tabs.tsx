import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface TabsProps {
  activeTab: 'Login' | 'Register';
  setActiveTab: (tab: 'Login' | 'Register') => void; 
}

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <View style={styles.tabs}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'Login' && styles.activeTab]}
        onPress={() => setActiveTab('Login')} 
      >
        <Text style={[styles.tabText, activeTab === 'Login' && styles.activeTabText]}>Login</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'Register' && styles.activeTab]}
        onPress={() => setActiveTab('Register')} 
      >
        <Text style={[styles.tabText, activeTab === 'Register' && styles.activeTabText]}>Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 40,
    padding: 5,
    width: '100%',
    justifyContent: 'center',
  },
  tab: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 40,
    padding: 16,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  tabText: {
    color: '#888',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#000',
  },
});

export default Tabs;
