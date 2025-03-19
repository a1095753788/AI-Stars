import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  SafeAreaView
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { getChatHistory, deleteChatRecord } from '../../utils/storageService';
import { Chat } from '../../types/state';

/**
 * 主屏幕组件
 * 显示聊天历史列表，提供新建聊天和进入设置的入口
 */
const HomeScreen = ({ navigation }: any) => {
  const { theme, toggleTheme } = useTheme();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 加载聊天历史
  useEffect(() => {
    loadChatHistory();
    
    // 添加导航事件监听，从ChatScreen返回时重新加载
    const unsubscribe = navigation.addListener('focus', loadChatHistory);
    return unsubscribe;
  }, [navigation]);
  
  // 加载聊天历史记录
  const loadChatHistory = async () => {
    try {
      setLoading(true);
      const history = await getChatHistory();
      // 按更新时间排序，最新的在前面
      const sortedChats = [...history].sort((a, b) => b.updatedAt - a.updatedAt);
      setChats(sortedChats);
    } catch (error) {
      console.error('加载聊天历史失败:', error);
      Alert.alert('错误', '无法加载聊天历史');
    } finally {
      setLoading(false);
    }
  };
  
  // 创建新聊天
  const createNewChat = () => {
    navigation.navigate('Chat', { isNewChat: true });
  };
  
  // 打开已有聊天
  const openChat = (chat: Chat) => {
    navigation.navigate('Chat', { chatId: chat.id });
  };
  
  // 打开设置
  const openSettings = () => {
    navigation.navigate('Settings');
  };
  
  // 打开API配置
  const openApiConfig = () => {
    navigation.navigate('ApiConfig');
  };
  
  // 打开提示词模板
  const openPromptTemplates = () => {
    navigation.navigate('PromptTemplates');
  };
  
  // 删除聊天记录
  const confirmDeleteChat = (chat: Chat) => {
    Alert.alert(
      '确认删除',
      `确定要删除聊天 "${chat.title}" 吗？此操作无法撤销。`,
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '删除', 
          style: 'destructive', 
          onPress: async () => {
            try {
              setLoading(true);
              await deleteChatRecord(chat.id);
              await loadChatHistory();
              Alert.alert('成功', '已删除聊天记录');
            } catch (error) {
              console.error('删除聊天记录失败:', error);
              Alert.alert('错误', '删除聊天记录失败');
            } finally {
              setLoading(false);
            }
          } 
        }
      ]
    );
  };
  
  // 渲染聊天项
  const renderChatItem = ({ item }: { item: Chat }) => {
    // 计算最后更新时间的显示文本
    const lastUpdateTime = new Date(item.updatedAt);
    const now = new Date();
    
    let timeText;
    const isToday = lastUpdateTime.getDate() === now.getDate() && 
                    lastUpdateTime.getMonth() === now.getMonth() &&
                    lastUpdateTime.getFullYear() === now.getFullYear();
    
    if (isToday) {
      // 今天的显示时间
      timeText = lastUpdateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      // 非今天显示日期
      timeText = lastUpdateTime.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // 获取消息预览
    const messagePreview = item.messages.length > 0 ? 
      item.messages[item.messages.length - 1].content.substring(0, 60) : '无消息';
    
    return (
      <TouchableOpacity
        style={[styles.chatItem, { backgroundColor: theme.colors.card }]}
        onPress={() => openChat(item)}
        onLongPress={() => confirmDeleteChat(item)}
      >
        <View style={styles.chatItemContent}>
          <Text style={[styles.chatTitle, { color: theme.colors.text }]} numberOfLines={1}>
            {item.title || '新对话'}
          </Text>
          <Text style={[styles.chatPreview, { color: theme.colors.text + '99' }]} numberOfLines={2}>
            {messagePreview}
          </Text>
        </View>
        <View style={styles.chatItemMeta}>
          <Text style={[styles.chatTime, { color: theme.colors.text + '80' }]}>
            {timeText}
          </Text>
          <Text style={[styles.chatMsgCount, { color: theme.colors.text + '80' }]}>
            {item.messages.length} 条消息
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  
  // 渲染空状态
  const renderEmptyList = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.colors.text + '80' }]}>
          没有聊天记录
        </Text>
        <Text style={[styles.emptySubtext, { color: theme.colors.text + '60' }]}>
          点击下方按钮开始新的对话
        </Text>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 头部 */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>AI助手</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.headerButton, { backgroundColor: theme.colors.card }]}
            onPress={toggleTheme}
          >
            <Text style={{ color: theme.colors.text }}>
              {theme.dark ? '🌞' : '🌙'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.headerButton, { backgroundColor: theme.colors.card }]}
            onPress={openSettings}
          >
            <Text style={{ color: theme.colors.text }}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* 快捷功能区 */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={[styles.quickActionButton, { backgroundColor: theme.colors.card }]}
          onPress={openApiConfig}
        >
          <Text style={[styles.quickActionIcon, { color: theme.colors.primary }]}>🔑</Text>
          <Text style={[styles.quickActionText, { color: theme.colors.text }]}>API配置</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickActionButton, { backgroundColor: theme.colors.card }]}
          onPress={openPromptTemplates}
        >
          <Text style={[styles.quickActionIcon, { color: theme.colors.primary }]}>📝</Text>
          <Text style={[styles.quickActionText, { color: theme.colors.text }]}>提示词模板</Text>
        </TouchableOpacity>
      </View>
      
      {/* 聊天列表 */}
      <View style={styles.chatList}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={theme.colors.primary} size="large" />
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>
              加载聊天记录...
            </Text>
          </View>
        ) : (
          <FlatList
            data={chats}
            renderItem={renderChatItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={chats.length === 0 ? { flex: 1 } : undefined}
            ListEmptyComponent={renderEmptyList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      
      {/* 底部操作区 */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.newChatButton, { backgroundColor: theme.colors.primary }]}
          onPress={createNewChat}
        >
          <Text style={styles.newChatButtonText}>新建聊天</Text>
        </TouchableOpacity>
      </View>
      
      {/* 使用提示 */}
      {chats.length > 0 && (
        <View style={styles.tipContainer}>
          <Text style={[styles.tipText, { color: theme.colors.text + '70' }]}>
            提示: 长按聊天可以删除
          </Text>
        </View>
      )}
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
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  quickActionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  quickActionText: {
    fontSize: 14,
  },
  chatList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  chatItem: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  chatItemContent: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  chatPreview: {
    fontSize: 14,
  },
  chatItemMeta: {
    marginLeft: 10,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  chatTime: {
    fontSize: 12,
  },
  chatMsgCount: {
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
  },
  footer: {
    padding: 20,
  },
  newChatButton: {
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
  },
  newChatButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  tipContainer: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  tipText: {
    fontSize: 12,
  },
});

export default HomeScreen; 