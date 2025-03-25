import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation';
import { useTheme, lightTheme } from '../theme/ThemeContext';
import { getPromptTemplates } from '../../utils/storageService';
import { PromptTemplate } from '../../types/state';
import { useTranslation } from '../../i18n';

type PromptSelectorScreenProps = StackScreenProps<RootStackParamList, 'PromptSelector'>;

/**
 * 提示词选择器界面
 * 仅显示提示词名称列表，点击后返回主页并将提示词内容传递到输入框
 */
const PromptSelectorScreen = ({ navigation }: PromptSelectorScreenProps) => {
  const { theme = lightTheme } = useTheme() || { theme: lightTheme };
  const { t, language } = useTranslation();
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 安全获取翻译文本
  const safeTranslate = (key: string, fallback: string): string => {
    const result = t(key);
    return typeof result === 'string' ? result : fallback;
  };

  // 加载提示词模板
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const promptTemplates = await getPromptTemplates();
      setTemplates(promptTemplates);
      
      // 如果没有提示词模板，自动导航到提示词管理页面
      if (promptTemplates.length === 0) {
        navigation.replace('PromptTemplates');
      }
    } catch (error) {
      console.error('加载提示词模板失败:', error);
      setError(language === 'zh' ? '加载提示词失败' : 'Failed to load prompts');
    } finally {
      setLoading(false);
    }
  };

  // 选择提示词
  const handleSelectPrompt = (template: PromptTemplate) => {
    // 添加更详细的日志
    console.log('选择了提示词模板:', template.name, '(ID:', template.id, ')');
    
    // 去除内容末尾的空白字符
    const cleanContent = template.content.trimEnd();
    console.log('提示词内容长度(清理后):', cleanContent.length);
    console.log('提示词内容预览:', cleanContent.substring(0, 50) + (cleanContent.length > 50 ? '...' : ''));
    
    // 确保参数正确传递
    const params = {
      templateContent: cleanContent,
      timestamp: Date.now()
    };
    
    console.log('准备导航回主页，参数:', JSON.stringify({
      contentLength: params.templateContent.length,
      timestamp: params.timestamp
    }));
    
    // 使用setTimeout确保导航在当前任务完成后执行
    setTimeout(() => {
      navigation.navigate('Home', params);
      console.log('导航已执行');
    }, 100);
  };

  // 导航到提示词管理
  const navigateToPromptTemplates = () => {
    navigation.navigate('PromptTemplates');
  };

  // 渲染提示词项
  const renderPromptItem = ({ item }: { item: PromptTemplate }) => (
    <TouchableOpacity
      style={[styles.promptItem, { backgroundColor: theme.colors.card }]}
      onPress={() => handleSelectPrompt(item)}
    >
      <Text style={[styles.promptName, { color: theme.colors.text }]} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.statusBarSpacer} />
        
        {/* 头部导航栏 */}
        <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>
              {'←'}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {safeTranslate('promptSelector.title', '选择提示词')}
          </Text>
          <TouchableOpacity onPress={navigateToPromptTemplates} style={styles.manageButton}>
            <Text style={[styles.manageButtonText, { color: theme.colors.primary }]}>
              {safeTranslate('promptSelector.manage', '管理')}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* 内容区域 */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>
              {safeTranslate('promptSelector.loading', '加载中...')}
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {error || safeTranslate('promptSelector.error', '加载提示词失败')}
            </Text>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: theme.colors.primary }]} 
              onPress={loadTemplates}
            >
              <Text style={styles.retryButtonText}>
                {safeTranslate('promptSelector.retry', '重试')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={templates}
            renderItem={renderPromptItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.promptList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                  {safeTranslate('promptSelector.empty', '没有可用的提示词模板')}
                </Text>
                <TouchableOpacity 
                  style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
                  onPress={navigateToPromptTemplates}
                >
                  <Text style={styles.addButtonText}>
                    {safeTranslate('promptSelector.addTemplate', '添加模板')}
                  </Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
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
  manageButton: {
    padding: 8,
  },
  manageButtonText: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  promptList: {
    padding: 16,
  },
  promptItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  promptName: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  addButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default PromptSelectorScreen; 