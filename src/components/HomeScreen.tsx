import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Animated, 
  PanResponder,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  I18nManager,
  Modal,
  Dimensions,
  Alert,
  StatusBar,
  Image,
  ActivityIndicator
} from 'react-native';
import { Message } from '../types/api';
import theme from '../styles/theme';
import { useNavigation } from '@react-navigation/native';
import { useTheme, lightTheme } from '../presentation/theme/ThemeContext';
import Button from './Button';
import { useTranslation } from '../i18n';

// 消息组件接口
interface MessageItemProps {
  message: {
    id: string;
    content: string;
    role: 'user' | 'assistant' | 'system';
    timestamp: number;
  };
}

interface Conversation {
  id: string;
  title: string;
  preview: string;
  date: string;
  unread?: boolean;
}

const SAMPLE_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    title: 'AI Assistant',
    preview: '我可以为您提供哪些帮助？',
    date: '刚刚',
    unread: true,
  },
  {
    id: '2',
    title: '个人助理',
    preview: '好的，我已经将您的会议安排在明天下午3点。',
    date: '10分钟前',
  },
  {
    id: '3',
    title: '翻译助手',
    preview: '这段文字的中文翻译已经完成。',
    date: '昨天',
  },
  {
    id: '4',
    title: '代码助手',
    preview: '这是修复该错误的代码示例...',
    date: '2天前',
  },
];

const ConversationItem = memo(({ item, onPress }: { item: Conversation; onPress: () => void }) => {
  const { theme = lightTheme } = useTheme() || { theme: lightTheme };
  const [scaleAnim] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.itemContainer,
        {
          backgroundColor: theme.colors.paper,
          borderColor: theme.colors.border,
          borderRadius: theme.borderRadius.m,
          ...theme.shadows.ios.small,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.itemTouchable}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.avatarIcon}>💬</Text>
          </View>
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.title,
                { color: theme.colors.text },
                item.unread && { fontWeight: '700' },
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text style={[styles.date, { color: theme.colors.placeholder }]}>{item.date}</Text>
          </View>
          <Text
            style={[
              styles.preview,
              { color: item.unread ? theme.colors.text : theme.colors.placeholder },
            ]}
            numberOfLines={2}
          >
            {item.preview}
          </Text>
          {item.unread && <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const EmptyState = () => {
  const { theme = lightTheme } = useTheme() || { theme: lightTheme };
  const { t } = useTranslation();
  
  return (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconContainer, { backgroundColor: theme.colors.paper }]}>
        <Text style={styles.emptyIcon}>💬</Text>
      </View>
      <Text style={[styles.emptyText, { color: theme.colors.text }]}>
        {t('emptyChats')}
      </Text>
      <Button
        title={t('createNewChat')}
        variant="primary"
        style={styles.emptyButton}
      />
    </View>
  );
};

const HomeScreen = () => {
  const { theme = lightTheme, toggleTheme = () => {} } = useTheme() || { theme: lightTheme, toggleTheme: () => {} };
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>(SAMPLE_CONVERSATIONS);
  const { t } = useTranslation();

  useEffect(() => {
    // 模拟加载数据
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleNewChat = () => {
    // @ts-ignore
    navigation.navigate('Chat', { id: 'new' });
  };

  const handleOpenChat = (id: string) => {
    // @ts-ignore
    navigation.navigate('Chat', { id });
  };

  const renderItem = ({ item }: { item: Conversation }) => (
    <ConversationItem item={item} onPress={() => handleOpenChat(item.id)} />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {t('appName')}
        </Text>
        <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
          <Text style={[styles.iconText, { color: theme.colors.text }]}>
            {theme.isDark ? '☀️' : '🌙'}
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : conversations.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[
            styles.fab,
            {
              backgroundColor: theme.colors.primary,
              ...theme.shadows.ios.medium,
            },
          ]}
          onPress={handleNewChat}
        >
          <Text style={styles.fabIcon}>➕</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 48 : 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  themeToggle: {
    padding: 8,
  },
  iconText: {
    fontSize: 22,
  },
  listContainer: {
    padding: 16,
  },
  itemContainer: {
    marginBottom: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  itemTouchable: {
    flexDirection: 'row',
    padding: 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  date: {
    fontSize: 12,
    marginLeft: 8,
  },
  preview: {
    fontSize: 14,
    lineHeight: 20,
  },
  unreadDot: {
    position: 'absolute',
    top: 8,
    right: -8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  fabContainer: {
    position: 'absolute',
    right: 24,
    bottom: 24,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyButton: {
    marginTop: 16,
  },
});

export default HomeScreen; 