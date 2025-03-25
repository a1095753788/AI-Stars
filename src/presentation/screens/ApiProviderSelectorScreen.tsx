import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Platform,
  Image,
  ScrollView
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { useTheme } from '../theme/ThemeContext';
import { RootStackParamList } from '../../navigation';
import { getApiProviders } from '../../services/api';
import { useTranslation } from '../../i18n';

// 页面属性类型定义
type ApiProviderSelectorScreenProps = StackScreenProps<RootStackParamList, 'ApiProviderSelector'>;

// API提供商图标（简单表示，真实应用中应有自定义图标）
const getProviderIcon = (provider: string): string => {
  switch (provider) {
    case 'openai': return '🤖';
    case 'azure': return '☁️';
    case 'anthropic': return '🧠';
    case 'gemini': return '👽';
    case 'together': return '🤝';
    case 'mistral': return '🌪️';
    case 'moonshot': return '🌙';
    case 'deepseek': return '🔍';
    case 'qwen': return '🧩';
    case 'baidu': return '🐼';
    case 'xinghuo': return '💫';
    case 'minimax': return '📦';
    case 'huggingface': return '🤗';
    case 'localai': return '💻';
    default: return '🔌';
  }
};

/**
 * API提供商选择页面
 * 展示所有可用的API提供商，并允许用户选择一个
 */
const ApiProviderSelectorScreen = ({ navigation, route }: ApiProviderSelectorScreenProps) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { onSelectProvider, currentProvider } = route.params;
  const apiProviders = getApiProviders();

  // 渲染单个提供商项
  const renderProviderItem = ({ item }: { item: { value: string, label: string } }) => {
    const isSelected = currentProvider === item.value;
    
    return (
      <TouchableOpacity
        style={[
          styles.providerItem,
          { 
            backgroundColor: isSelected ? theme.colors.primary + '20' : theme.colors.card,
            borderColor: theme.colors.border
          }
        ]}
        onPress={() => {
          onSelectProvider(item.value, item.label);
          navigation.goBack();
        }}
      >
        <View style={styles.providerIconContainer}>
          <Text style={styles.providerIcon}>{getProviderIcon(item.value)}</Text>
        </View>
        
        <View style={styles.providerInfo}>
          <Text style={[styles.providerName, { color: theme.colors.text }]}>
            {item.label}
          </Text>
        </View>
        
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Text style={{ color: theme.colors.primary }}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // 按分类渲染提供商
  const renderProviderGroups = () => {
    // 国际提供商
    const international = apiProviders.filter(p => 
      ['openai', 'azure', 'anthropic', 'gemini', 'together', 'mistral', 'moonshot', 'deepseek', 'huggingface', 'localai'].includes(p.value)
    );
    
    // 中国提供商
    const chinese = apiProviders.filter(p => 
      ['qwen', 'baidu', 'xinghuo', 'minimax'].includes(p.value)
    );
    
    // 其他提供商
    const others = apiProviders.filter(p => 
      !international.some(i => i.value === p.value) && 
      !chinese.some(c => c.value === p.value)
    );
    
    return (
      <ScrollView style={styles.scrollView}>
        {/* 国际提供商 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('internationalProviders') || '国际提供商'}
          </Text>
          {international.map(provider => (
            <View key={provider.value} style={{ marginBottom: 8 }}>
              {renderProviderItem({ item: provider })}
            </View>
          ))}
        </View>
        
        {/* 中国提供商 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('chineseProviders') || '中国提供商'}
          </Text>
          {chinese.map(provider => (
            <View key={provider.value} style={{ marginBottom: 8 }}>
              {renderProviderItem({ item: provider })}
            </View>
          ))}
        </View>
        
        {/* 其他提供商 */}
        {others.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t('otherProviders') || '其他提供商'}
            </Text>
            {others.map(provider => (
              <View key={provider.value} style={{ marginBottom: 8 }}>
                {renderProviderItem({ item: provider })}
              </View>
            ))}
          </View>
        )}
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    );
  };
  
  return (
    <>
      <StatusBar
        barStyle={theme.isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.statusBarSpacer} />
        
        {/* 头部 */}
        <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>
              ←
            </Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {t('selectApiProvider') || '选择API提供商'}
          </Text>
          <View style={styles.headerRight} />
        </View>
        
        {/* 内容区域 */}
        {renderProviderGroups()}
      </SafeAreaView>
    </>
  );
};

// 样式
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBarSpacer: {
    height: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  providerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 0.5,
  },
  providerIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  providerIcon: {
    fontSize: 20,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectedIndicator: {
    width: 24,
    alignItems: 'center',
  },
  bottomPadding: {
    height: 30,
  },
});

export default ApiProviderSelectorScreen; 