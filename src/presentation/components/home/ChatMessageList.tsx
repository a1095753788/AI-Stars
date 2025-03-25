import React, { useRef, useCallback, useEffect } from 'react';
import { 
  FlatList, 
  View, 
  StyleSheet, 
  Text,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useSelector } from 'react-redux';
import { Message } from '../../../types/state';
import ChatMessageItem from './ChatMessageItem';

interface ChatMessageListProps {
  messages: Message[];
  flatListRef: React.RefObject<FlatList>;
  autoscrollEnabled: boolean;
  language: 'zh' | 'en';
}

/**
 * 聊天消息列表组件
 * 负责渲染和管理聊天消息的滚动
 */
const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  flatListRef,
  autoscrollEnabled,
  language
}) => {
  // 主题模式
  const darkMode = useSelector((state: any) => state.settings.darkMode);
  
  // 消息列表项渲染
  const renderItem = useCallback(({ item }: { item: Message }) => (
    <ChatMessageItem 
      message={item} 
      darkMode={darkMode} 
      language={language} 
    />
  ), [darkMode, language]);
  
  // 空消息列表渲染
  const renderEmptyList = useCallback(() => (
    <View style={[styles.emptyContainer, darkMode && styles.emptyContainerDark]}>
      <Text style={[styles.emptyText, darkMode && styles.emptyTextDark]}>
        {language === 'zh' ? '开始一个新的聊天吧！' : 'Start a new chat!'}
      </Text>
    </View>
  ), [darkMode, language]);
  
  // 用于生成列表项的key
  const keyExtractor = useCallback((item: Message) => item.id, []);
  
  // 当消息列表更新时，自动滚动到底部
  useEffect(() => {
    if (messages.length > 0 && autoscrollEnabled && flatListRef.current) {
      // 使用setTimeout确保视图已完全渲染
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, autoscrollEnabled]);
  
  // 加载状态指示符
  const renderFooter = useCallback(() => {
    const isLoading = messages.length > 0 && 
                      messages[messages.length - 1].isLoading;
    
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="small" 
            color={darkMode ? "#FFFFFF" : "#000000"} 
          />
        </View>
      );
    }
    
    return null;
  }, [messages, darkMode]);
  
  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={[styles.container, darkMode && styles.containerDark]}
      contentContainerStyle={styles.contentContainer}
      ListEmptyComponent={renderEmptyList}
      ListFooterComponent={renderFooter}
      initialNumToRender={15}
      maxToRenderPerBatch={10}
      windowSize={10}
      removeClippedSubviews={true}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  containerDark: {
    backgroundColor: '#1A1A1A',
  },
  contentContainer: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyContainerDark: {
    backgroundColor: '#1A1A1A',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyTextDark: {
    color: '#AAA',
  },
  loadingContainer: {
    padding: 10,
    alignItems: 'center',
  },
});

export default ChatMessageList; 