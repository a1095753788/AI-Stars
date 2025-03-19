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
  SafeAreaView
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { getApiConfigs, saveApiConfig, deleteApiConfig } from '../../utils/storageService';
import { ApiConfig } from '../../types/api';
import { validateApiConfig } from '../../services/apiService';

/**
 * API配置界面
 * 用于添加、编辑和管理API配置
 */
const ApiConfigScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const [configs, setConfigs] = useState<ApiConfig[]>([]);
  const [loading, setLoading] = useState(false);

  // 编辑模式状态
  const [editMode, setEditMode] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<ApiConfig | null>(null);
  
  // 表单状态
  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [model, setModel] = useState('');
  const [isActive, setIsActive] = useState(false);

  // 加载API配置
  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const apiConfigs = await getApiConfigs();
      setConfigs(apiConfigs);
    } catch (error) {
      console.error('加载API配置失败:', error);
      Alert.alert('错误', '加载API配置失败');
    } finally {
      setLoading(false);
    }
  };

  // 重置表单
  const resetForm = () => {
    setName('');
    setApiKey('');
    setEndpoint('');
    setModel('');
    setIsActive(false);
    setCurrentConfig(null);
    setEditMode(false);
  };

  // 设置表单为编辑模式
  const setFormForEdit = (config: ApiConfig) => {
    setName(config.name);
    setApiKey(config.apiKey);
    setEndpoint(config.endpoint);
    setModel(config.model);
    setIsActive(config.isActive);
    setCurrentConfig(config);
    setEditMode(true);
  };

  // 保存API配置
  const saveConfig = async () => {
    // 简单验证
    if (!name.trim()) {
      Alert.alert('错误', '请输入配置名称');
      return;
    }

    if (!apiKey.trim()) {
      Alert.alert('错误', '请输入API密钥');
      return;
    }

    if (!endpoint.trim()) {
      Alert.alert('错误', '请输入API端点');
      return;
    }

    if (!model.trim()) {
      Alert.alert('错误', '请输入模型名称');
      return;
    }

    try {
      setLoading(true);

      // 验证API配置
      const isValid = await validateApiConfig(apiKey, endpoint);
      if (!isValid) {
        Alert.alert('验证失败', '无法验证API配置，请检查API密钥和端点是否正确');
        setLoading(false);
        return;
      }

      const newConfig: ApiConfig = {
        id: currentConfig?.id || Date.now().toString(),
        name,
        apiKey,
        endpoint,
        model,
        isActive,
        createdAt: currentConfig?.createdAt || Date.now(),
        updatedAt: Date.now()
      };

      await saveApiConfig(newConfig);
      resetForm();
      await loadConfigs();

      Alert.alert('成功', editMode ? '已更新API配置' : '已添加新的API配置');
    } catch (error) {
      console.error('保存API配置失败:', error);
      Alert.alert('错误', '保存API配置失败');
    } finally {
      setLoading(false);
    }
  };

  // 删除API配置
  const confirmDeleteConfig = (config: ApiConfig) => {
    Alert.alert(
      '确认删除',
      `确定要删除 "${config.name}" API配置吗？`,
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '删除', 
          style: 'destructive', 
          onPress: async () => {
            try {
              setLoading(true);
              await deleteApiConfig(config.id);
              
              // 如果正在编辑此配置，重置表单
              if (currentConfig?.id === config.id) {
                resetForm();
              }
              
              await loadConfigs();
              Alert.alert('成功', '已删除API配置');
            } catch (error) {
              console.error('删除API配置失败:', error);
              Alert.alert('错误', '删除API配置失败');
            } finally {
              setLoading(false);
            }
          } 
        },
      ]
    );
  };

  // 渲染配置项
  const renderConfigItem = ({ item }: { item: ApiConfig }) => {
    return (
      <View style={[styles.configItem, { backgroundColor: theme.colors.card }]}>
        <View style={styles.configInfo}>
          <Text style={[styles.configName, { color: theme.colors.text }]}>
            {item.name} {item.isActive && '(活跃)'}
          </Text>
          <Text style={[styles.configModel, { color: theme.colors.text + '99' }]}>
            {item.model}
          </Text>
          <Text style={[styles.configEndpoint, { color: theme.colors.text + '80' }]} numberOfLines={1}>
            {item.endpoint}
          </Text>
        </View>
        <View style={styles.configActions}>
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: theme.colors.primary + '20' }]}
            onPress={() => setFormForEdit(item)}
          >
            <Text style={[styles.buttonText, { color: theme.colors.primary }]}>编辑</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.deleteButton, { backgroundColor: '#FF3B30' + '20' }]}
            onPress={() => confirmDeleteConfig(item)}
          >
            <Text style={[styles.buttonText, { color: '#FF3B30' }]}>删除</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        {/* 头部 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.headerButton, { color: theme.colors.primary }]}>返回</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>API配置</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView style={styles.scrollView}>
          {/* 现有配置列表 */}
          {configs.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>已有配置</Text>
              <FlatList
                data={configs}
                renderItem={renderConfigItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>
          )}

          {/* 添加/编辑表单 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {editMode ? '编辑配置' : '添加新配置'}
            </Text>
            
            <View style={[styles.formCard, { backgroundColor: theme.colors.card }]}>
              {/* 名称 */}
              <View style={styles.formItem}>
                <Text style={[styles.formLabel, { color: theme.colors.text }]}>名称</Text>
                <TextInput
                  style={[
                    styles.formInput,
                    { 
                      color: theme.colors.text,
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.border
                    }
                  ]}
                  placeholder="例如：OpenAI GPT-4"
                  placeholderTextColor={theme.colors.text + '50'}
                  value={name}
                  onChangeText={setName}
                />
              </View>
              
              {/* API密钥 */}
              <View style={styles.formItem}>
                <Text style={[styles.formLabel, { color: theme.colors.text }]}>API密钥</Text>
                <TextInput
                  style={[
                    styles.formInput,
                    { 
                      color: theme.colors.text,
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.border
                    }
                  ]}
                  placeholder="输入您的API密钥"
                  placeholderTextColor={theme.colors.text + '50'}
                  value={apiKey}
                  onChangeText={setApiKey}
                  secureTextEntry
                />
              </View>
              
              {/* 端点 */}
              <View style={styles.formItem}>
                <Text style={[styles.formLabel, { color: theme.colors.text }]}>API端点</Text>
                <TextInput
                  style={[
                    styles.formInput,
                    { 
                      color: theme.colors.text,
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.border
                    }
                  ]}
                  placeholder="例如：https://api.openai.com/v1/chat/completions"
                  placeholderTextColor={theme.colors.text + '50'}
                  value={endpoint}
                  onChangeText={setEndpoint}
                  autoCapitalize="none"
                />
              </View>
              
              {/* 模型 */}
              <View style={styles.formItem}>
                <Text style={[styles.formLabel, { color: theme.colors.text }]}>模型</Text>
                <TextInput
                  style={[
                    styles.formInput,
                    { 
                      color: theme.colors.text,
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.border
                    }
                  ]}
                  placeholder="例如：gpt-4 或 claude-3-opus-20240229"
                  placeholderTextColor={theme.colors.text + '50'}
                  value={model}
                  onChangeText={setModel}
                />
              </View>
              
              {/* 是否活跃 */}
              <View style={styles.switchItem}>
                <Text style={[styles.formLabel, { color: theme.colors.text }]}>设为活跃API</Text>
                <Switch
                  value={isActive}
                  onValueChange={setIsActive}
                  trackColor={{ false: '#767577', true: theme.colors.primary + '80' }}
                  thumbColor={isActive ? theme.colors.primary : '#f4f3f4'}
                />
              </View>
            </View>
            
            {/* 操作按钮 */}
            <View style={styles.formActions}>
              {editMode && (
                <TouchableOpacity
                  style={[styles.cancelButton, { backgroundColor: theme.colors.card }]}
                  onPress={resetForm}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>取消</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={[
                  styles.saveButton, 
                  { 
                    backgroundColor: theme.colors.primary,
                    opacity: loading ? 0.7 : 1
                  }
                ]}
                onPress={saveConfig}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? '保存中...' : (editMode ? '更新' : '保存')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* 说明信息 */}
          <View style={styles.section}>
            <View style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.infoTitle, { color: theme.colors.text }]}>支持的API</Text>
              <Text style={[styles.infoText, { color: theme.colors.text + '99' }]}>
                本应用支持多种AI服务提供商的API，包括：
              </Text>
              <View style={styles.infoList}>
                <Text style={[styles.infoListItem, { color: theme.colors.text + '99' }]}>• OpenAI (GPT-3.5, GPT-4)</Text>
                <Text style={[styles.infoListItem, { color: theme.colors.text + '99' }]}>• Anthropic (Claude)</Text>
                <Text style={[styles.infoListItem, { color: theme.colors.text + '99' }]}>• Google (Gemini)</Text>
              </View>
              <Text style={[styles.infoText, { color: theme.colors.text + '99' }]}>
                请确保您拥有正确的API密钥并使用相应的端点URL。
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
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
  section: {
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  configItem: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  configInfo: {
    marginBottom: 10,
  },
  configName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  configModel: {
    fontSize: 14,
    marginBottom: 5,
  },
  configEndpoint: {
    fontSize: 12,
  },
  configActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  deleteButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonText: {
    fontSize: 14,
  },
  formCard: {
    padding: 15,
    borderRadius: 8,
  },
  formItem: {
    marginBottom: 15,
  },
  formLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  formInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 16,
  },
  saveButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  infoCard: {
    padding: 15,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
  },
  infoList: {
    marginBottom: 8,
  },
  infoListItem: {
    fontSize: 14,
    marginBottom: 4,
  },
});

export default ApiConfigScreen; 