import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { getPromptTemplates, savePromptTemplate, deletePromptTemplate } from '../../utils/storageService';
import { PromptTemplate } from '../../utils/storageService';

/**
 * 提示词模板界面
 * 用于管理常用提示词模板
 */
const PromptTemplatesScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<PromptTemplate | null>(null);
  
  // 表单状态
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  // 加载提示词模板
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const promptTemplates = await getPromptTemplates();
      setTemplates(promptTemplates);
    } catch (error) {
      console.error('加载提示词模板失败:', error);
      Alert.alert('错误', '加载提示词模板失败');
    } finally {
      setLoading(false);
    }
  };

  // 重置表单
  const resetForm = () => {
    setName('');
    setContent('');
    setCurrentTemplate(null);
    setEditMode(false);
  };

  // 设置表单为编辑模式
  const setFormForEdit = (template: PromptTemplate) => {
    setName(template.name);
    setContent(template.content);
    setCurrentTemplate(template);
    setEditMode(true);
  };

  // 保存提示词模板
  const saveTemplate = async () => {
    // 简单验证
    if (!name.trim()) {
      Alert.alert('错误', '请输入模板名称');
      return;
    }

    if (!content.trim()) {
      Alert.alert('错误', '请输入模板内容');
      return;
    }

    try {
      setLoading(true);

      const newTemplate: PromptTemplate = {
        id: currentTemplate?.id || Date.now().toString(),
        name,
        content,
        createdAt: currentTemplate?.createdAt || Date.now(),
        updatedAt: Date.now()
      };

      await savePromptTemplate(newTemplate);
      resetForm();
      await loadTemplates();

      Alert.alert('成功', editMode ? '已更新提示词模板' : '已添加新的提示词模板');
    } catch (error) {
      console.error('保存提示词模板失败:', error);
      Alert.alert('错误', '保存提示词模板失败');
    } finally {
      setLoading(false);
    }
  };

  // 删除提示词模板
  const confirmDeleteTemplate = (template: PromptTemplate) => {
    Alert.alert(
      '确认删除',
      `确定要删除 "${template.name}" 提示词模板吗？`,
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '删除', 
          style: 'destructive', 
          onPress: async () => {
            try {
              setLoading(true);
              await deletePromptTemplate(template.id);
              
              // 如果正在编辑此模板，重置表单
              if (currentTemplate?.id === template.id) {
                resetForm();
              }
              
              await loadTemplates();
              Alert.alert('成功', '已删除提示词模板');
            } catch (error) {
              console.error('删除提示词模板失败:', error);
              Alert.alert('错误', '删除提示词模板失败');
            } finally {
              setLoading(false);
            }
          } 
        },
      ]
    );
  };

  // 使用提示词模板
  const useTemplate = (template: PromptTemplate) => {
    navigation.navigate('Chat', { promptTemplate: template });
  };

  // 渲染模板项
  const renderTemplateItem = ({ item }: { item: PromptTemplate }) => {
    return (
      <View style={[styles.templateItem, { backgroundColor: theme.colors.card }]}>
        <View style={styles.templateHeader}>
          <Text style={[styles.templateName, { color: theme.colors.text }]}>
            {item.name}
          </Text>
          <View style={styles.templateActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.useButton, { backgroundColor: theme.colors.primary + '20' }]}
              onPress={() => useTemplate(item)}
            >
              <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>使用</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.editButton, { backgroundColor: theme.colors.primary + '20' }]}
              onPress={() => setFormForEdit(item)}
            >
              <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>编辑</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton, { backgroundColor: '#FF3B30' + '20' }]}
              onPress={() => confirmDeleteTemplate(item)}
            >
              <Text style={[styles.actionButtonText, { color: '#FF3B30' }]}>删除</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text 
          style={[styles.templateContent, { color: theme.colors.text + '99' }]}
          numberOfLines={3}
          ellipsizeMode="tail"
        >
          {item.content}
        </Text>
      </View>
    );
  };

  // 示例模板
  const exampleTemplates = [
    {
      name: '代码解释',
      content: '请解释以下代码的功能，并提供可能的改进方案：\n\n```\n// 在这里粘贴代码\n```'
    },
    {
      name: '内容总结',
      content: '请用简洁的语言总结以下内容的要点：\n\n'
    },
    {
      name: '翻译成英文',
      content: '请将以下中文内容翻译成英文：\n\n'
    }
  ];

  // 添加示例模板
  const addExampleTemplate = (example: { name: string, content: string }) => {
    setName(example.name);
    setContent(example.content);
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
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>提示词模板</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView style={styles.scrollView}>
          {/* 现有模板列表 */}
          {templates.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>已有模板</Text>
              <FlatList
                data={templates}
                renderItem={renderTemplateItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>
          )}

          {/* 添加/编辑表单 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {editMode ? '编辑模板' : '添加新模板'}
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
                  placeholder="输入提示词模板名称"
                  placeholderTextColor={theme.colors.text + '50'}
                  value={name}
                  onChangeText={setName}
                />
              </View>
              
              {/* 内容 */}
              <View style={styles.formItem}>
                <Text style={[styles.formLabel, { color: theme.colors.text }]}>内容</Text>
                <TextInput
                  style={[
                    styles.formTextarea,
                    { 
                      color: theme.colors.text,
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.border
                    }
                  ]}
                  placeholder="输入提示词模板内容"
                  placeholderTextColor={theme.colors.text + '50'}
                  value={content}
                  onChangeText={setContent}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
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
                onPress={saveTemplate}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? '保存中...' : (editMode ? '更新' : '保存')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* 示例模板 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>示例模板</Text>
            <View style={[styles.examplesCard, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.examplesInfo, { color: theme.colors.text + '99' }]}>
                点击以下示例模板快速添加常用提示词
              </Text>
              
              <View style={styles.examplesList}>
                {exampleTemplates.map((example, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.exampleItem, { borderColor: theme.colors.border }]}
                    onPress={() => addExampleTemplate(example)}
                  >
                    <Text style={[styles.exampleName, { color: theme.colors.text }]}>
                      {example.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
          
          {/* 说明 */}
          <View style={styles.section}>
            <View style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.infoTitle, { color: theme.colors.text }]}>什么是提示词模板？</Text>
              <Text style={[styles.infoText, { color: theme.colors.text + '99' }]}>
                提示词模板是预设好的AI指令，可以帮助您更快地获得想要的回答。
                使用良好的提示词模板可以大大提高AI回答的质量和相关性。
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
  templateItem: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  templateActions: {
    flexDirection: 'row',
  },
  actionButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginLeft: 5,
  },
  useButton: {},
  editButton: {},
  deleteButton: {},
  actionButtonText: {
    fontSize: 12,
  },
  templateContent: {
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
  formTextarea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 120,
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
  examplesCard: {
    padding: 15,
    borderRadius: 8,
  },
  examplesInfo: {
    fontSize: 14,
    marginBottom: 10,
  },
  examplesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  exampleItem: {
    marginRight: 10,
    marginBottom: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  exampleName: {
    fontSize: 14,
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
  },
});

export default PromptTemplatesScreen; 