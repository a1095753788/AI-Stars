import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation';
import { useTheme, lightTheme } from '../theme/ThemeContext';
import { getChatHistory, deleteChat } from '../../utils/storageService';
import { Chat } from '../../types/state';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useTranslation } from '../../i18n';

type HistoryScreenProps = StackScreenProps<RootStackParamList, 'History'>;

const HistoryScreen = ({ navigation }: HistoryScreenProps) => {
  const { theme = lightTheme } = useTheme() || { theme: lightTheme };
  const language = useSelector((state: RootState) => state.settings.language);
  const { t } = useTranslation();
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 安全获取翻译文本
  const safeTranslate = (key: string, fallback: string): string => {
    const result = t(key);
    return typeof result === 'string' ? result : fallback;
  };
  
  // 加载聊天历史
  useEffect(() => {
    loadChats();
  }, []);
  
  const loadChats = async () => {
    setLoading(true);
    try {
      const savedChats = await getChatHistory();
      setChats(savedChats.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error('Failed to load chats:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 打开聊天
  const openChat = (chatId: string) => {
    navigation.navigate('Chat', { chatId });
  };
  
  // 确认删除聊天记录
  const confirmDeleteChat = (chat: Chat) => {
    Alert.alert(
      safeTranslate('history.confirmDelete', '确认删除'),
      safeTranslate('history.confirmDeleteMsg', '确定要删除该聊天记录吗？此操作不可撤销。'),
      [
        { 
          text: safeTranslate('common.cancel', '取消'), 
          style: 'cancel' 
        },
        {
          text: safeTranslate('common.delete', '删除'),
          style: 'destructive',
          onPress: () => handleDeleteChat(chat.id)
        }
      ]
    );
  };
  
  // 处理删除聊天记录
  const handleDeleteChat = async (chatId: string) => {
    try {
      await deleteChat(chatId);
      // 更新本地状态，无需重新获取
      setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
    } catch (error) {
      console.error('Failed to delete chat:', error);
      Alert.alert(
        safeTranslate('common.error', '错误'),
        safeTranslate('history.deleteError', '删除聊天记录失败')
      );
    }
  };
  
  // 渲染聊天项
  const renderChatItem = ({ item }: { item: Chat }) => {
    // 计算最后更新时间的显示文本
    const lastUpdateTime = new Date(item.timestamp);
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
    const messagePreview = item.messages && item.messages.length > 0 ? 
      item.messages[item.messages.length - 1].content.substring(0, 60) : 
      safeTranslate('history.noMessage', '无消息');
    
    return (
      <TouchableOpacity
        style={[styles.chatItem, { backgroundColor: theme.colors.card }]}
        onPress={() => openChat(item.id)}
        onLongPress={() => confirmDeleteChat(item)}
      >
        <View style={styles.chatItemContent}>
          <Text style={[styles.chatTitle, { color: theme.colors.text }]} numberOfLines={1}>
            {item.title || safeTranslate('history.newChat', '新对话')}
          </Text>
          <Text style={[styles.chatPreview, { color: theme.colors.text + 'AA' }]} numberOfLines={2}>
            {messagePreview}
          </Text>
        </View>
        <View style={styles.chatItemMeta}>
          <Text style={styles.chatTime}>
            {timeText}
          </Text>
          <Text style={styles.chatMsgCount}>
            {item.messages ? item.messages.length : 0} {safeTranslate('history.messages', '条消息')}
          </Text>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => confirmDeleteChat(item)}
          >
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
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
        {/* 头部 */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.primary }]}>
            {safeTranslate('history.title', '历史记录')}
          </Text>
          <TouchableOpacity 
            style={styles.clearAllButton}
            onPress={() => {
              if (chats.length > 0) {
                Alert.alert(
                  safeTranslate('history.clearAll', '清除全部'),
                  safeTranslate('history.confirmClearAll', '确定要清除所有聊天记录吗？此操作不可撤销。'),
                  [
                    { 
                      text: safeTranslate('common.cancel', '取消'), 
                      style: 'cancel' 
                    },
                    {
                      text: safeTranslate('common.clearAll', '清除全部'),
                      style: 'destructive',
                      onPress: async () => {
                        try {
                          // 删除所有聊天记录
                          for (const chat of chats) {
                            await deleteChat(chat.id);
                          }
                          setChats([]);
                        } catch (error) {
                          console.error('Failed to clear all chats:', error);
                          Alert.alert(
                            safeTranslate('common.error', '错误'),
                            safeTranslate('history.clearError', '清除聊天记录失败')
                          );
                        }
                      }
                    }
                  ]
                );
              }
            }}
          >
            <Text style={[styles.clearAllText, { color: theme.colors.error }]}>
              {safeTranslate('history.clearAll', '清除全部')}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* 聊天列表 */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>
              {safeTranslate('common.loading', '加载中...')}
            </Text>
          </View>
        ) : (
          <FlatList
            data={chats}
            renderItem={renderChatItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={chats.length === 0 ? styles.emptyListContainer : styles.listContainer}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: theme.colors.text + '99' }]}>
                  {safeTranslate('history.noHistory', '暂无历史记录')}
                </Text>
              </View>
            )}
          />
        )}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 22,
  },
  clearAllButton: {
    padding: 8,
  },
  clearAllText: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  chatItem: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  chatItemContent: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  chatPreview: {
    fontSize: 14,
  },
  chatItemMeta: {
    marginLeft: 12,
    alignItems: 'flex-end',
  },
  chatTime: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  chatMsgCount: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  deleteButton: {
    padding: 4,
  },
  deleteIcon: {
    fontSize: 16,
  }
});

export default HistoryScreen; 