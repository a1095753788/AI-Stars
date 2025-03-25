import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  Platform
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation';
import { useTheme, lightTheme } from '../theme/ThemeContext';
import { useTranslation } from '../../i18n';
import { useDispatch } from 'react-redux';
import { setLanguage as setAppLanguage } from '../../store/slices/settingsSlice';
import { 
  saveSettings, 
  getSettings, 
  getApiConfigs, 
  getActiveApiConfig 
} from '../../utils/storageService';
import { ApiConfig, Settings } from '../../types/state';

type SettingsScreenProps = StackScreenProps<RootStackParamList, 'Settings'>;

const SettingsScreen = ({ navigation }: SettingsScreenProps) => {
  const { theme = lightTheme, toggleTheme } = useTheme() || { theme: lightTheme, toggleTheme: () => {} };
  const { t, language, changeLanguage } = useTranslation();
  const dispatch = useDispatch();
  
  // 网络状态
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isCheckingNetwork, setIsCheckingNetwork] = useState(false);
  
  // 安全获取翻译文本
  const safeTranslate = (key: string, fallback: string): string => {
    try {
      // 分割嵌套键，如'settings.title'变成['settings', 'title']
      const keyParts = key.split('.');
      
      // 从翻译对象中获取值
      let result = keyParts.reduce((obj: any, k) => {
        return obj && obj[k] !== undefined ? obj[k] : undefined;
      }, t);
      
      // 如果结果是字符串，直接返回
      if (typeof result === 'string') {
        return result;
      }
      
      // 如果结果是对象，使用JSON.stringify转换并发出警告
      if (typeof result === 'object' && result !== null) {
        console.warn(`翻译键 "${key}" 返回了对象而非字符串，请检查翻译文件或使用嵌套键 (例如 'about.title' 而不是 'about')`);
        return fallback;
      }
      
      // 尝试直接通过t函数获取结果
      const directResult = t(key);
      if (typeof directResult === 'string' && directResult !== key) {
        return directResult;
      }
      
      // 如果无法获取有效结果，返回备用值
      return fallback;
    } catch (error) {
      console.error(`翻译错误 (键: ${key}):`, error);
      return fallback;
    }
  };
  
  // 状态管理
  const [useSystemTheme, setUseSystemTheme] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'zh' | 'en'>(language as 'zh' | 'en');
  const [isLoading, setIsLoading] = useState(false);
  const [apiConfigs, setApiConfigs] = useState<ApiConfig[]>([]);
  const [activeApiConfigId, setActiveApiConfigId] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  
  // 初始化加载
  useEffect(() => {
    loadData();
    checkNetworkConnectivity();
    
    // 定期检查网络连接
    const intervalId = setInterval(() => {
      checkNetworkConnectivity();
    }, 30000); // 每30秒检查一次
    
    // 清理定时器
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  // 检查网络连接状态 (使用fetch API代替NetInfo)
  const checkNetworkConnectivity = async () => {
    setIsCheckingNetwork(true);
    try {
      // 使用Promise.race实现超时
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );
      const fetchPromise = fetch('https://8.8.8.8', { method: 'HEAD' });
      
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      setIsConnected(true);
    } catch (error) {
      console.error('网络连接检查失败:', error);
      setIsConnected(false);
    } finally {
      setIsCheckingNetwork(false);
    }
  };
  
  // 加载所有数据
  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadSettings(),
        loadApiConfigs()
      ]);
    } catch (error) {
      console.error('加载设置数据失败:', error);
      Alert.alert(
        safeTranslate('error', '错误'),
        safeTranslate('loadSettingsError', '加载设置失败')
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  // 加载设置
  const loadSettings = async () => {
    try {
      const savedSettings = await getSettings();
      setSettings(savedSettings);
      setUseSystemTheme(savedSettings.theme === 'system');
    } catch (error) {
      console.error('加载设置详情失败:', error);
      throw error;
    }
  };
  
  // 加载API配置
  const loadApiConfigs = async () => {
    try {
      const configs = await getApiConfigs();
      setApiConfigs(configs);
      
      const activeConfigId = await getActiveApiConfig();
      setActiveApiConfigId(activeConfigId);
    } catch (error) {
      console.error('加载API配置失败:', error);
      throw error;
    }
  };
  
  // 切换主题
  const handleToggleTheme = () => {
    toggleTheme();
  };
  
  // 切换系统主题
  const toggleUseSystemTheme = () => {
    setUseSystemTheme(!useSystemTheme);
    if (settings) {
      const themeValue = !useSystemTheme ? 'system' : (theme.isDark ? 'dark' : 'light') as 'light' | 'dark' | 'system';
      const updatedSettings: Settings = { 
        ...settings, 
        theme: themeValue 
      };
      setSettings(updatedSettings);
      saveSettings(updatedSettings);
    }
  };
  
  // 切换语言
  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'zh' ? 'en' : 'zh';
    setCurrentLanguage(newLanguage);
    
    // 更改应用语言
    changeLanguage(newLanguage);
    
    // 更新Redux状态
    dispatch(setAppLanguage(newLanguage));
    
    // 保存到存储
    if (settings) {
      const updatedSettings: Settings = { 
        ...settings, 
        language: newLanguage 
      };
      setSettings(updatedSettings);
      
      // 确保使用异步函数保存设置
      (async () => {
        try {
          await saveSettings(updatedSettings);
          console.log('语言设置已保存:', newLanguage);
        } catch (error) {
          console.error('保存语言设置失败:', error);
        }
      })();
    }
  };
  
  // 导航到API配置
  const navigateToApiConfig = () => {
    navigation.navigate('ApiConfig');
  };
  
  // 导航到提示词模板
  const navigateToPromptTemplates = () => {
    navigation.navigate('PromptTemplates');
  };
  
  // 渲染网络状态
  const renderNetworkStatus = () => {
    let statusColor = theme.colors.warning;
    let statusText = safeTranslate('common.checking', '检查中...');
    
    if (isConnected === true) {
      statusColor = theme.colors.success;
      statusText = safeTranslate('common.connected', '网络连接正常');
    } else if (isConnected === false) {
      statusColor = theme.colors.error;
      statusText = safeTranslate('common.disconnected', '网络连接断开');
    }
    
    return (
      <View style={styles.networkStatusContainer}>
        <View style={styles.networkStatusTextContainer}>
          <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
          <Text style={[styles.networkStatusText, { color: theme.colors.text }]}>
            {statusText}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={checkNetworkConnectivity}
          disabled={isCheckingNetwork}
        >
          {isCheckingNetwork ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Text style={[styles.refreshButtonText, { color: theme.colors.primary }]}>
              {safeTranslate('common.refresh', '刷新')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };
  
  // 渲染API配置卡片
  const renderApiConfigCard = () => {
    const activeConfig = activeApiConfigId ? 
      apiConfigs.find(config => config.id === activeApiConfigId) : 
      apiConfigs.find(config => config.isActive);
    
    return (
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={navigateToApiConfig}
        >
          <View style={styles.settingMainContent}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
              {safeTranslate('settings.apiConfig', 'API配置')}
            </Text>
            <Text style={[styles.settingDescription, { color: theme.colors.text + '80' }]}>
              {activeConfig ? 
                `${safeTranslate('settings.currentUsing', '当前使用')}: ${activeConfig.name} (${activeConfig.provider})` : 
                safeTranslate('settings.noApiConfig', '未设置API配置')}
            </Text>
          </View>
          <Text style={{ color: theme.colors.primary }}>
            &gt;
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // 渲染提示词模板卡片
  const renderPromptTemplatesCard = () => {
    return (
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={navigateToPromptTemplates}
        >
          <View style={styles.settingMainContent}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
              {safeTranslate('settings.promptTemplates', '提示词模板')}
            </Text>
            <Text style={[styles.settingDescription, { color: theme.colors.text + '80' }]}>
              {safeTranslate('settings.managePromptTemplates', '管理常用提示词模板')}
            </Text>
          </View>
          <Text style={{ color: theme.colors.primary }}>
            &gt;
          </Text>
        </TouchableOpacity>
      </View>
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
        
        {/* 头部导航栏 */}
        <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>
              ←
            </Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {safeTranslate('settings.title', '设置')}
          </Text>
          <View style={styles.headerRight} />
        </View>
        
        {/* 内容区域 */}
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* 网络状态 */}
          {renderNetworkStatus()}
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.text }]}>
                {safeTranslate('settings.loading', '加载设置中...')}
              </Text>
            </View>
          ) : (
            <>
              {/* API设置 */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  {safeTranslate('settings.apiSettings', 'API设置')}
                </Text>
                {renderApiConfigCard()}
                
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                  onPress={navigateToApiConfig}
                >
                  <Text style={styles.actionButtonText}>
                    {safeTranslate('settings.manageApiConfig', '管理API配置')}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {/* 提示词模板 */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  {safeTranslate('settings.promptTemplates', '提示词模板')}
                </Text>
                {renderPromptTemplatesCard()}
              </View>
              
              {/* 外观设置 */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  {safeTranslate('settings.appearance', '外观')}
                </Text>
                
                <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
                  <View style={styles.settingItem}>
                    <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                      {safeTranslate('settings.darkMode', '深色模式')}
                    </Text>
                    <Switch
                      value={theme.isDark}
                      onValueChange={handleToggleTheme}
                      trackColor={{ false: '#767577', true: theme.colors.primary }}
                      thumbColor={'#f4f3f4'}
                      disabled={useSystemTheme}
                    />
                  </View>
                  
                  <View style={styles.settingItem}>
                    <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                      {safeTranslate('settings.followSystem', '跟随系统')}
                    </Text>
                    <Switch
                      value={useSystemTheme}
                      onValueChange={toggleUseSystemTheme}
                      trackColor={{ false: '#767577', true: theme.colors.primary }}
                      thumbColor={'#f4f3f4'}
                    />
                  </View>
                </View>
              </View>
              
              {/* 语言设置 */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  {safeTranslate('settings.language', '语言')}
                </Text>
                
                <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
                  <TouchableOpacity 
                    style={styles.languageItem}
                    onPress={toggleLanguage}
                  >
                    <Text style={[styles.languageText, { color: theme.colors.text }]}>
                      {currentLanguage === 'zh' ? '中文' : 'English'}
                    </Text>
                    <Text style={[styles.checkmark, { color: theme.colors.primary }]}>
                      ✓
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* 关于 */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  {safeTranslate('about.title', '关于AI助手')}
                </Text>
                
                <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
                  <View style={styles.aboutItem}>
                    <Text style={[styles.versionLabel, { color: theme.colors.text }]}>
                      {safeTranslate('about.version', '版本')}
                    </Text>
                    <Text style={[styles.versionText, { color: theme.colors.text }]}>
                      1.0.0
                    </Text>
                  </View>
                  
                  <View style={styles.aboutItem}>
                    <Text style={[styles.appDescription, { color: theme.colors.text + '80' }]}>
                      {safeTranslate('about.description', 'AI助手是一款支持多模态的AI对话工具，提供文本和图片处理功能，轻量简洁的界面设计让您的使用体验更加流畅。')}
                    </Text>
                  </View>
                </View>
              </View>
              
              {/* 底部留白 */}
              <View style={styles.bottomPadding} />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBarSpacer: {
    height: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  networkStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    margin: 16,
    marginBottom: 0,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  networkStatusTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  networkStatusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 4,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  settingMainContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 4,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  languageText: {
    fontSize: 16,
  },
  checkmark: {
    fontSize: 16,
  },
  aboutItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  versionLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  versionText: {
    fontSize: 18,
    fontWeight: '600',
  },
  appDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
  },
  actionButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  bottomPadding: {
    height: 40,
  }
});

export default SettingsScreen; 