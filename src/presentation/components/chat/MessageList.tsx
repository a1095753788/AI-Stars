import React, { useRef, useCallback, useEffect, memo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  InteractionManager,
  ListRenderItemInfo,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Message } from '../../../types/state';
import MessageBubble from '../../../presentation/components/chat/MessageBubble';
import { useTheme } from '../../theme/ThemeContext';

interface MessageListProps {
  messages: Message[];
  language: 'zh' | 'en';
  onImagePress?: (url: string) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
}

/**
 * 消息列表组件
 * 负责渲染聊天消息列表
 */
const MessageList = memo(({
  messages,
  language,
  onImagePress,
  refreshing = false,
  onRefresh,
  onScroll,
  ListHeaderComponent,
  ListFooterComponent,
}: MessageListProps) => {
  const { theme } = useTheme();
  const flatListRef = useRef<FlatList<Message>>(null);
  
  // 渲染单个消息
  const renderMessage = useCallback(({ item }: ListRenderItemInfo<Message>) => {
    return (
      <MessageBubble
        message={item}
        language={language}
        onImagePress={onImagePress}
      />
    );
  }, [language, onImagePress]);
  
  // 消息唯一标识
  const keyExtractor = useCallback((item: Message) => item.id, []);
  
  // 滚动到底部
  const scrollToBottom = useCallback((animated = true) => {
    if (messages.length > 0) {
      InteractionManager.runAfterInteractions(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated });
        }
      });
    }
  }, [messages.length]);
  
  // 消息变化时滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);
  
  // 优化列表渲染 - 修复参数类型
  const getItemLayout = useCallback(
    (_data: ArrayLike<Message> | null | undefined, index: number) => ({
      length: 80, // 估计的消息高度
      offset: 80 * index,
      index,
    }),
    []
  );
  
  // 渲染加载指示器
  const renderFooterLoading = useCallback(() => {
    if (ListFooterComponent) {
      return ListFooterComponent;
    }
    
    return null;
  }, [ListFooterComponent]);
  
  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.contentContainer}
        onScroll={onScroll}
        scrollEventThrottle={16}
        getItemLayout={getItemLayout}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={renderFooterLoading()}
        showsVerticalScrollIndicator={false}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={21}
        removeClippedSubviews={true}
        keyboardShouldPersistTaps="handled"
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
        accessibilityRole="list"
        accessibilityLabel={language === 'zh' ? '消息列表' : 'Message list'}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  loadingIndicator: {
    padding: 16,
  },
});

export default MessageList; 