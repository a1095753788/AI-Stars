import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { getApiConfigs, saveApiConfig, deleteApiConfig, saveActiveApiConfig } from '../../utils/storageService';
import { ApiProvider, getApiProviders, getDefaultEndpoint, checkApiConfigValidity } from '../../services/api';
import { ApiConfig } from '../../types/state';
import { useTranslation } from '../../i18n';

/**
 * API配置界面
 * 用于添加、编辑和管理API配置
 */
const ApiConfigScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [apiConfigs, setApiConfigs] = useState<ApiConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // 安全获取翻译文本，避免对象错误
  const safeTranslate = (key: string, fallback: string): string => {
    const result = t(key);
    return typeof result === 'string' ? result : fallback;
  };
  
  // 表单状态
  const [configName, setConfigName] = useState('');
  const [configProvider, setConfigProvider] = useState<ApiProvider>('openai');
  const [configApiKey, setConfigApiKey] = useState('');
  const [configEndpoint, setConfigEndpoint] = useState('');
  const [configModel, setConfigModel] = useState('');
  const [configIsActive, setConfigIsActive] = useState(false);
  
  // API提供商列表
  const apiProviders = getApiProviders();
  
  // 显示提供商选择器
  const [showProviderSelector, setShowProviderSelector] = useState(false);
  
  // 加载配置
  useEffect(() => {
    loadConfigs();
  }, []);
  
  // 当提供商变化时，更新默认端点
  useEffect(() => {
    if (!isEditing || editingId === null) {
      setConfigEndpoint(getDefaultEndpoint(configProvider));
    }
  }, [configProvider, isEditing, editingId]);
  
  // 加载API配置
  const loadConfigs = async () => {
    try {
      setLoading(true);
      const configs = await getApiConfigs();
      if (configs && configs.length > 0) {
        setApiConfigs(configs);
      } else {
        setApiConfigs([]);
      }
    } catch (error) {
      console.error('加载API配置失败:', error);
      Alert.alert('错误', '加载API配置失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 重置表单
  const resetForm = () => {
    setConfigName('');
    setConfigProvider('openai');
    setConfigApiKey('');
    setConfigEndpoint(getDefaultEndpoint('openai'));
    setConfigModel('');
    setConfigIsActive(false);
    setIsEditing(false);
    setEditingId(null);
  };
  
  // 设置表单为编辑模式
  const setFormForEdit = (config: ApiConfig) => {
    setConfigName(config.name);
    setConfigProvider(config.provider || 'openai');
    setConfigApiKey(config.apiKey);
    setConfigEndpoint(config.endpoint);
    setConfigModel(config.model);
    setConfigIsActive(config.isActive);
    setIsEditing(true);
    setEditingId(config.id);
  };
  
  // 保存配置
  const saveConfig = async () => {
    try {
      // 验证表单
      if (!configName.trim()) {
        Alert.alert('错误', '请输入配置名称');
        return;
      }
      
      if (!configApiKey.trim()) {
        Alert.alert('错误', '请输入API密钥');
        return;
      }
      
      if (!configEndpoint.trim()) {
        Alert.alert('错误', '请输入API端点');
        return;
      }
      
      if (!configModel.trim()) {
        Alert.alert('错误', '请输入模型名称');
        return;
      }
      
      setLoading(true);
      
      if (isEditing && editingId) {
        // 更新配置
        const updatedConfig: ApiConfig = {
          id: editingId,
          name: configName,
          provider: configProvider,
          apiKey: configApiKey,
          endpoint: configEndpoint,
          model: configModel,
          isActive: configIsActive,
          createdAt: apiConfigs.find(c => c.id === editingId)?.createdAt || Date.now(),
          updatedAt: Date.now()
        };
        
        await saveApiConfig(updatedConfig);
        
        // 如果设为活跃，更新其他配置
        if (configIsActive) {
          await saveActiveApiConfig(editingId);
        }
      } else {
        // 添加配置
        const newConfig: ApiConfig = {
          id: Date.now().toString(),
          name: configName,
          provider: configProvider,
          apiKey: configApiKey,
          endpoint: configEndpoint,
          model: configModel,
          isActive: configIsActive,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        
        await saveApiConfig(newConfig);
        
        // 如果设为活跃，更新其他配置
        if (configIsActive) {
          await saveActiveApiConfig(newConfig.id);
        }
      }
      
      // 重新加载配置
      await loadConfigs();
      
      // 重置表单
      resetForm();
      
      Alert.alert('成功', isEditing ? '配置已更新' : '配置已添加');
    } catch (error) {
      console.error('保存API配置失败:', error);
      Alert.alert('错误', '保存API配置失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 确认删除配置
  const confirmDeleteConfig = (config: ApiConfig) => {
    Alert.alert(
      '确认删除',
      `确定要删除API配置 "${config.name}" 吗？此操作无法撤销。`,
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '删除', 
          style: 'destructive', 
          onPress: async () => {
            try {
              setLoading(true);
              await deleteApiConfig(config.id);
              await loadConfigs();
              Alert.alert('成功', '已删除API配置');
            } catch (error) {
              console.error('删除API配置失败:', error);
              Alert.alert('错误', '删除API配置失败');
            } finally {
              setLoading(false);
            }
          } 
        }
      ]
    );
  };
  
  // 设置为活跃配置
  const setActiveConfig = async (configId: string) => {
    try {
      setLoading(true);
      await saveActiveApiConfig(configId);
      await loadConfigs();
    } catch (error) {
      console.error('设置活跃配置失败:', error);
      Alert.alert('错误', '设置活跃配置失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 渲染API配置项
  const renderConfigItem = ({ item }: { item: ApiConfig }) => {
    // 获取提供商名称
    const providerLabel = apiProviders.find(p => p.value === (item.provider || 'openai'))?.label || 'OpenAI';
    
    return (
      <View style={[styles.configItem, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity
          style={styles.configItemContent}
          onPress={() => setFormForEdit(item)}
          onLongPress={() => confirmDeleteConfig(item)}
        >
          <View style={styles.configHeader}>
            <Text style={[styles.configName, { color: theme.colors.text }]}>
              {item.name}
            </Text>
            {item.isActive && (
              <View style={[styles.activeTag, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.activeTagText}>活跃</Text>
              </View>
            )}
          </View>
          
          <Text style={[styles.configProvider, { color: theme.colors.text + '99' }]}>
            提供商: {providerLabel}
          </Text>
          
          <Text style={[styles.configModel, { color: theme.colors.text + '99' }]}>
            模型: {item.model}
          </Text>
          
          <Text style={[styles.configApiKey, { color: theme.colors.text + '99' }]}>
            API密钥: {item.apiKey.substring(0, 3)}...{item.apiKey.substring(item.apiKey.length - 4)}
          </Text>
        </TouchableOpacity>
        
        {!item.isActive && (
          <TouchableOpacity
            style={[styles.setActiveButton, { backgroundColor: theme.colors.primary + '20' }]}
            onPress={() => setActiveConfig(item.id)}
          >
            <Text style={{ color: theme.colors.primary }}>设为活跃</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };
  
  // 渲染提供商选择项
  const renderProviderItem = ({ item }: { item: { value: ApiProvider, label: string } }) => {
    return (
      <TouchableOpacity
        style={[
          styles.providerItem,
          { 
            backgroundColor: configProvider === item.value ? 
              theme.colors.primary + '20' : 
              'transparent',
            borderBottomWidth: item.value !== apiProviders[apiProviders.length-1].value ? 0.5 : 0,
            borderBottomColor: theme.colors.border + '50'
          }
        ]}
        onPress={() => {
          setConfigProvider(item.value);
          setShowProviderSelector(false);
        }}
      >
        <Text style={[
          styles.providerLabel, 
          { 
            color: configProvider === item.value ? 
              theme.colors.primary : 
              theme.colors.text 
          }
        ]}>
          {item.label}
        </Text>
        
        {configProvider === item.value && (
          <Text style={{ color: theme.colors.primary }}>✓</Text>
        )}
      </TouchableOpacity>
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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>
              ←
            </Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {safeTranslate('apiConfig', 'API配置')}
          </Text>
          <View style={styles.headerRight} />
        </View>
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={true}
          scrollEnabled={true}
          keyboardShouldPersistTaps="handled"
        >
          {/* 配置列表 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              已保存的API配置
            </Text>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={theme.colors.primary} size="small" />
                <Text style={[styles.loadingText, { color: theme.colors.text }]}>
                  加载中...
                </Text>
              </View>
            ) : apiConfigs.length === 0 ? (
              <View style={[styles.emptyContainer, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.emptyText, { color: theme.colors.text + '99' }]}>
                  暂无API配置
                </Text>
                <Text style={[styles.emptyDescription, { color: theme.colors.text + '70' }]}>
                  请使用下方表单添加API配置
                </Text>
              </View>
            ) : (
              apiConfigs.map(config => (
                <View key={config.id} style={{ marginBottom: 10 }}>
                  {renderConfigItem({ item: config })}
                </View>
              ))
            )}
          </View>
          
          {/* 添加/编辑表单 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {isEditing ? '编辑API配置' : '添加新的API配置'}
            </Text>
            
            <View style={[styles.formContainer, { backgroundColor: theme.colors.card }]}>
              {/* 配置名称 */}
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  配置名称
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: theme.colors.background,
                      color: theme.colors.text
                    }
                  ]}
                  placeholder="例如: OpenAI GPT-4"
                  placeholderTextColor={theme.colors.text + '50'}
                  value={configName}
                  onChangeText={setConfigName}
                />
              </View>
              
              {/* API提供商 */}
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  API提供商
                </Text>
                <TouchableOpacity
                  style={[
                    styles.input,
                    styles.providerSelector,
                    { 
                      backgroundColor: theme.colors.background,
                    }
                  ]}
                  onPress={() => {
                    navigation.navigate('ApiProviderSelector', {
                      currentProvider: configProvider,
                      onSelectProvider: (provider: string, label: string) => {
                        setConfigProvider(provider as ApiProvider);
                        setConfigEndpoint(getDefaultEndpoint(provider as ApiProvider));
                      }
                    });
                  }}
                >
                  <Text style={{ color: theme.colors.text }}>
                    {apiProviders.find(p => p.value === configProvider)?.label || '选择API提供商'}
                  </Text>
                  <Text style={{ color: theme.colors.text }}>▼</Text>
                </TouchableOpacity>
              </View>
              
              {/* API密钥 */}
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  API密钥
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: theme.colors.background,
                      color: theme.colors.text
                    }
                  ]}
                  placeholder="输入您的API密钥"
                  placeholderTextColor={theme.colors.text + '50'}
                  value={configApiKey}
                  onChangeText={setConfigApiKey}
                  secureTextEntry
                />
              </View>
              
              {/* 端点 */}
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  API端点URL
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: theme.colors.background,
                      color: theme.colors.text
                    }
                  ]}
                  placeholder="API端点URL"
                  placeholderTextColor={theme.colors.text + '50'}
                  value={configEndpoint}
                  onChangeText={setConfigEndpoint}
                />
              </View>
              
              {/* 模型 */}
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  模型
                </Text>
                <View style={styles.modelInputContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      { 
                        backgroundColor: theme.colors.inputBackground || theme.colors.background,
                        color: theme.colors.text,
                        flex: 1
                      }
                    ]}
                    placeholder="例如：gpt-3.5-turbo"
                    placeholderTextColor="#999"
                    value={configModel}
                    onChangeText={setConfigModel}
                  />
                  <TouchableOpacity 
                    style={[
                      styles.getModelsButton, 
                      { 
                        backgroundColor: theme.colors.primary,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        marginLeft: 12
                      }
                    ]}
                    onPress={() => {
                      if (configProvider) {
                        navigation.navigate('ModelSelector', {
                          provider: configProvider,
                          onSelectModel: (model: string) => {
                            setConfigModel(model);
                          }
                        });
                      } else {
                        Alert.alert('错误', '请先选择API提供商');
                      }
                    }}
                  >
                    <Text style={[styles.getModelsButtonText, { fontSize: 16 }]}>获取模型</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* 活跃状态 */}
              <View style={styles.formGroup}>
                <View style={styles.switchContainer}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>
                    设为活跃配置
                  </Text>
                  <Switch
                    value={configIsActive}
                    onValueChange={setConfigIsActive}
                    trackColor={{ false: '#767577', true: theme.colors.primary + '80' }}
                    thumbColor={configIsActive ? theme.colors.primary : '#f4f3f4'}
                  />
                </View>
                <Text style={[styles.helperText, { color: theme.colors.text + '70' }]}>
                  活跃配置将用于所有AI请求
                </Text>
              </View>
              
              {/* 按钮组 */}
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.cancelButton,
                    { 
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.border
                    }
                  ]}
                  onPress={resetForm}
                  disabled={loading}
                >
                  <Text style={{ color: theme.colors.text }}>
                    {isEditing ? '取消' : '重置'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.saveButton,
                    { 
                      backgroundColor: theme.colors.primary,
                      opacity: loading ? 0.7 : 1
                    }
                  ]}
                  onPress={saveConfig}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.saveButtonText}>
                      {isEditing ? '更新' : '保存'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          {/* 帮助信息 */}
          <View style={styles.section}>
            <View style={[styles.infoContainer, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
                支持的API说明
              </Text>
              <Text style={[styles.infoContent, { color: theme.colors.text + '99' }]}>
                本应用支持以下AI服务提供商:
              </Text>
              <View style={styles.infoList}>
                <Text style={[styles.infoItem, { color: theme.colors.text + '90' }]}>
                  • <Text style={{ fontWeight: 'bold' }}>OpenAI</Text>: 原生OpenAI API
                </Text>
                <Text style={[styles.infoItem, { color: theme.colors.text + '90' }]}>
                  • <Text style={{ fontWeight: 'bold' }}>Azure OpenAI</Text>: 微软Azure上的OpenAI服务
                </Text>
                <Text style={[styles.infoItem, { color: theme.colors.text + '90' }]}>
                  • <Text style={{ fontWeight: 'bold' }}>Together AI</Text>: 与OpenAI API完全兼容
                </Text>
                <Text style={[styles.infoItem, { color: theme.colors.text + '90' }]}>
                  • <Text style={{ fontWeight: 'bold' }}>LocalAI</Text>: 本地运行的兼容OpenAI的API
                </Text>
                <Text style={[styles.infoItem, { color: theme.colors.text + '90' }]}>
                  • <Text style={{ fontWeight: 'bold' }}>Hugging Face</Text>: TGI服务，兼容OpenAI API格式
                </Text>
                <Text style={[styles.infoItem, { color: theme.colors.text + '90' }]}>
                  • <Text style={{ fontWeight: 'bold' }}>Anthropic</Text>: Claude模型，部分兼容OpenAI API
                </Text>
                <Text style={[styles.infoItem, { color: theme.colors.text + '90' }]}>
                  • <Text style={{ fontWeight: 'bold' }}>Google Gemini</Text>: Google提供的AI服务
                </Text>
                <Text style={[styles.infoItem, { color: theme.colors.text + '90' }]}>
                  • <Text style={{ fontWeight: 'bold' }}>DeepSeek AI</Text>: DeepSeek-V3模型，兼容OpenAI API
                </Text>
                <Text style={[styles.infoItem, { color: theme.colors.text + '90' }]}>
                  • <Text style={{ fontWeight: 'bold' }}>阿里云通义千问</Text>: 阿里云提供的大语言模型
                </Text>
                <Text style={[styles.infoItem, { color: theme.colors.text + '90' }]}>
                  • <Text style={{ fontWeight: 'bold' }}>自定义OpenAI兼容</Text>: 使用自定义的兼容OpenAI的API
                </Text>
              </View>
              <Text style={[styles.infoNote, { color: theme.colors.text + '80' }]}>
                提示: 长按配置项可以删除。点击配置项可以编辑。
              </Text>
            </View>
          </View>
          
          {/* 底部间距 */}
          <View style={styles.bottomPadding} />
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
  scrollViewContent: {
    paddingBottom: 30,
  },
  bottomPadding: {
    height: 50,
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 10,
  },
  emptyContainer: {
    marginHorizontal: 20,
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
  configItem: {
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  configItemContent: {
    padding: 15,
  },
  configHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  configName: {
    fontSize: 16,
    fontWeight: '500',
  },
  activeTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activeTagText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  configProvider: {
    fontSize: 14,
    marginBottom: 4,
  },
  configModel: {
    fontSize: 14,
    marginBottom: 4,
  },
  configApiKey: {
    fontSize: 14,
  },
  setActiveButton: {
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  formContainer: {
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 12,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  helperText: {
    fontSize: 14,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: '45%',
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  infoContainer: {
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 12,
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoContent: {
    fontSize: 14,
    marginBottom: 10,
  },
  infoList: {
    marginBottom: 10,
  },
  infoItem: {
    fontSize: 14,
    marginBottom: 6,
    lineHeight: 20,
  },
  infoNote: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  providerSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  providerDropdownContainer: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 250,
    zIndex: 1000,
    overflow: 'hidden',
  },
  providerDropdown: {
    width: '100%',
    maxHeight: 250,
  },
  providerItem: {
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  providerLabel: {
    fontSize: 14,
  },
  modelInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  getModelsButton: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  getModelsButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
});

export default ApiConfigScreen; 