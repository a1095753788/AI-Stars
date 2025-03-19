import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  SafeAreaView
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { getSettings, saveSettings } from '../../utils/storageService';
import { getApiConfigs } from '../../utils/storageService';
import { ApiConfig } from '../../types/api';
import { isTTSAvailable } from '../../utils/voiceService';

/**
 * 设置屏幕组件
 * 管理应用设置，如主题、多文件和语音等
 */
const SettingsScreen = ({ navigation }: any) => {
  const { theme, toggleTheme } = useTheme();
  
  // 设置状态
  const [useSystemTheme, setUseSystemTheme] = useState(false);
  const [allowMultipleFiles, setAllowMultipleFiles] = useState(false);
  const [enableVoice, setEnableVoice] = useState(true);
  const [loading, setLoading] = useState(false);
  const [ttsAvailable, setTtsAvailable] = useState(true);
  const [apiConfigs, setApiConfigs] = useState<ApiConfig[]>([]);
  const [activeApiConfig, setActiveApiConfig] = useState<ApiConfig | null>(null);

  // 加载设置
  useEffect(() => {
    loadSettings();
  }, []);
  
  // 加载用户设置
  const loadSettings = async () => {
    try {
      setLoading(true);
      const settings = await getSettings();
      
      if (settings) {
        setUseSystemTheme(settings.useSystemTheme);
        setAllowMultipleFiles(settings.allowMultipleFiles);
        setEnableVoice(settings.enableVoice);
      }
      
      // 检查设备是否支持TTS
      const available = await isTTSAvailable();
      setTtsAvailable(available);
      
      // 加载API配置
      const configs = await getApiConfigs();
      if (configs && configs.length > 0) {
        setApiConfigs(configs);
        const active = configs.find(config => config.isActive);
        if (active) {
          setActiveApiConfig(active);
        }
      }
    } catch (error) {
      console.error('加载设置失败:', error);
      Alert.alert('错误', '加载设置失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 保存设置
  const saveUserSettings = async () => {
    try {
      setLoading(true);
      
      const settings = {
        themeMode: theme.dark ? 'dark' : 'light',
        useSystemTheme,
        allowMultipleFiles,
        enableVoice
      };
      
      await saveSettings(settings);
      Alert.alert('成功', '设置已保存');
    } catch (error) {
      console.error('保存设置失败:', error);
      Alert.alert('错误', '保存设置失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 处理系统主题切换
  const handleSystemThemeToggle = (value: boolean) => {
    setUseSystemTheme(value);
  };
  
  // 处理多文件切换
  const handleMultipleFilesToggle = (value: boolean) => {
    setAllowMultipleFiles(value);
  };
  
  // 处理语音功能切换
  const handleVoiceToggle = (value: boolean) => {
    if (!ttsAvailable && value) {
      Alert.alert('不支持', '您的设备不支持文本转语音功能');
      return;
    }
    
    setEnableVoice(value);
  };
  
  // 打开API配置
  const navigateToApiConfig = () => {
    navigation.navigate('ApiConfig');
  };
  
  // 打开提示词模板
  const navigateToPromptTemplates = () => {
    navigation.navigate('PromptTemplates');
  };
  
  // 手动切换主题
  const handleToggleTheme = () => {
    toggleTheme();
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 头部 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.headerButton, { color: theme.colors.primary }]}>返回</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>设置</Text>
        <View style={{ width: 50 }} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* 外观设置 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>外观</Text>
          
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            {/* 主题切换 */}
            <TouchableOpacity 
              style={styles.settingRow}
              onPress={handleToggleTheme}
              disabled={useSystemTheme}
            >
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                  深色模式
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.text + '99' }]}>
                  {useSystemTheme ? '跟随系统' : '手动控制应用主题'}
                </Text>
              </View>
              
              <Switch
                value={theme.dark}
                onValueChange={handleToggleTheme}
                disabled={useSystemTheme}
                trackColor={{ false: '#767577', true: theme.colors.primary + '80' }}
                thumbColor={theme.dark ? theme.colors.primary : '#f4f3f4'}
              />
            </TouchableOpacity>
            
            {/* 系统主题 */}
            <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                  跟随系统
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.text + '99' }]}>
                  自动根据系统主题切换
                </Text>
              </View>
              
              <Switch
                value={useSystemTheme}
                onValueChange={handleSystemThemeToggle}
                trackColor={{ false: '#767577', true: theme.colors.primary + '80' }}
                thumbColor={useSystemTheme ? theme.colors.primary : '#f4f3f4'}
              />
            </View>
          </View>
        </View>
        
        {/* 聊天设置 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>聊天</Text>
          
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            {/* 允许多文件 */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                  允许多文件/图片
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.text + '99' }]}>
                  允许在一个对话中上传多个文件或图片
                </Text>
              </View>
              
              <Switch
                value={allowMultipleFiles}
                onValueChange={handleMultipleFilesToggle}
                trackColor={{ false: '#767577', true: theme.colors.primary + '80' }}
                thumbColor={allowMultipleFiles ? theme.colors.primary : '#f4f3f4'}
              />
            </View>
            
            {/* 启用语音 */}
            <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                  启用语音
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.text + '99' }]}>
                  允许AI回复朗读出声
                </Text>
              </View>
              
              <Switch
                value={enableVoice}
                onValueChange={handleVoiceToggle}
                trackColor={{ false: '#767577', true: theme.colors.primary + '80' }}
                thumbColor={enableVoice ? theme.colors.primary : '#f4f3f4'}
                disabled={!ttsAvailable}
              />
            </View>
          </View>
        </View>
        
        {/* 高级设置 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>高级设置</Text>
          
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            {/* API配置 */}
            <TouchableOpacity style={styles.settingRow} onPress={navigateToApiConfig}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                  API配置
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.text + '99' }]}>
                  管理AI服务提供商和API密钥
                </Text>
              </View>
              
              <Text style={{ color: theme.colors.primary }}>
                {'＞'}
              </Text>
            </TouchableOpacity>
            
            {/* 提示词模板 */}
            <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />
            
            <TouchableOpacity style={styles.settingRow} onPress={navigateToPromptTemplates}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                  提示词模板
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.text + '99' }]}>
                  管理常用提示词
                </Text>
              </View>
              
              <Text style={{ color: theme.colors.primary }}>
                {'＞'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* 保存按钮 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.saveButton, 
              { 
                backgroundColor: theme.colors.primary,
                opacity: loading ? 0.7 : 1
              }
            ]}
            onPress={saveUserSettings}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? '保存中...' : '保存设置'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* 关于 */}
        <View style={styles.section}>
          <View style={[styles.aboutCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.aboutTitle, { color: theme.colors.text }]}>
              关于AI助手
            </Text>
            <Text style={[styles.aboutVersion, { color: theme.colors.text + '99' }]}>
              版本 1.0.0
            </Text>
            <Text style={[styles.aboutDescription, { color: theme.colors.text + '90' }]}>
              AI助手是一款支持多模态的AI对话工具，提供文本、图片和文件处理功能，
              支持语音朗读，可自定义API配置和提示词模板。
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerButton: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  card: {
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  settingInfo: {
    flex: 1,
    marginRight: 10,
  },
  settingTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  separator: {
    height: 1,
    marginHorizontal: 15,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  saveButton: {
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  aboutCard: {
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  aboutVersion: {
    fontSize: 14,
    marginBottom: 12,
  },
  aboutDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SettingsScreen; 