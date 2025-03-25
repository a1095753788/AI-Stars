import React, { useState, memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';
import { useTheme } from '../presentation/theme/ThemeContext';

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    role: 'user' | 'assistant' | 'system';
    timestamp: number;
    media?: {
      type: 'image' | 'file';
      url: string;
      name?: string;
      size?: number;
    }[];
  };
  onLongPress?: () => void;
}

// 格式化文件大小
const formatFileSize = (size: number): string => {
  if (size < 1024) {
    return `${size} B`;
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  } else {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }
};

const MAX_IMAGE_WIDTH = Dimensions.get('window').width * 0.6;

const MessageBubble = memo(({ message, onLongPress }: MessageBubbleProps) => {
  const { theme } = useTheme();
  const isUser = message.role === 'user';
  const [imageLoadFailed, setImageLoadFailed] = useState<Record<string, boolean>>({});
  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({});
  const [scaleAnim] = useState(new Animated.Value(1));

  // 处理消息长按事件
  const handleLongPress = useCallback(() => {
    if (onLongPress) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true
        })
      ]).start();
      
      onLongPress();
    }
  }, [onLongPress, scaleAnim]);

  // 处理图片开始加载
  const handleImageLoadStart = useCallback((url: string) => {
    setImageLoading(prev => ({ ...prev, [url]: true }));
  }, []);

  // 处理图片加载完成
  const handleImageLoad = useCallback((url: string) => {
    setImageLoading(prev => ({ ...prev, [url]: false }));
  }, []);

  // 处理图片加载错误
  const handleImageError = useCallback((url: string) => {
    setImageLoadFailed(prev => ({ ...prev, [url]: true }));
    setImageLoading(prev => ({ ...prev, [url]: false }));
  }, []);

  // 重试加载图片
  const handleRetryImage = useCallback((url: string) => {
    setImageLoadFailed(prev => ({ ...prev, [url]: false }));
    setImageLoading(prev => ({ ...prev, [url]: true }));
  }, []);

  // 渲染媒体内容
  const renderMedia = useCallback(() => {
    if (!message.media || message.media.length === 0) return null;

    return (
      <View style={styles.mediaContainer}>
        {message.media.map((item, index) => {
          if (item.type === 'image') {
            const isLoading = imageLoading[item.url];
            const hasFailed = imageLoadFailed[item.url];

            return (
              <View key={`${item.url}-${index}`} style={styles.imageWrapper}>
                {!hasFailed ? (
                  <>
                    <Image
                      source={{ uri: item.url }}
                      style={[
                        styles.image,
                        { borderRadius: theme.borderRadius.m }
                      ]}
                      resizeMode="contain"
                      onLoadStart={() => handleImageLoadStart(item.url)}
                      onLoad={() => handleImageLoad(item.url)}
                      onError={() => handleImageError(item.url)}
                    />
                    {isLoading && (
                      <ActivityIndicator
                        style={styles.imageLoader}
                        size="small"
                        color={theme.colors.primary}
                      />
                    )}
                  </>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.imageErrorContainer,
                      { borderRadius: theme.borderRadius.m }
                    ]}
                    onPress={() => handleRetryImage(item.url)}
                  >
                    <Text style={[styles.iconText, { color: theme.colors.error }]}>⚠️</Text>
                    <Text style={[styles.imageErrorText, { color: theme.colors.error }]}>
                      加载失败
                    </Text>
                    <Text style={[styles.retryText, { color: theme.colors.primary }]}>
                      点击重试
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          } else if (item.type === 'file') {
            return (
              <TouchableOpacity
                key={`${item.url}-${index}`}
                style={[
                  styles.fileContainer,
                  {
                    backgroundColor: isUser ? 'rgba(255,255,255,0.1)' : theme.colors.paper,
                    borderRadius: theme.borderRadius.m,
                    ...theme.shadows.ios.small
                  }
                ]}
              >
                <Text style={[styles.fileIcon, { color: theme.colors.primary }]}>📄</Text>
                <View style={styles.fileInfo}>
                  <Text style={[styles.fileName, { color: theme.colors.text }]} numberOfLines={1}>
                    {item.name || '文件'}
                  </Text>
                  {item.size && (
                    <Text style={[styles.fileSize, { color: theme.colors.placeholder }]}>
                      {formatFileSize(item.size)}
                    </Text>
                  )}
                </View>
                <Text style={[styles.fileIcon, { color: theme.colors.primary }]}>⬇️</Text>
              </TouchableOpacity>
            );
          }
          return null;
        })}
      </View>
    );
  }, [message.media, imageLoading, imageLoadFailed, theme, isUser, handleImageLoad, handleImageError, handleImageLoadStart, handleRetryImage]);

  // 格式化时间戳
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Animated.View 
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      {!isUser && (
        <View 
          style={[
            styles.avatar, 
            { 
              backgroundColor: theme.colors.primary,
              ...theme.shadows.ios.small 
            }
          ]}
        >
          <Text style={styles.avatarText}>AI</Text>
        </View>
      )}
      <View 
        style={[
          styles.bubble,
          isUser 
            ? [styles.userBubble, { backgroundColor: theme.colors.messageBubbleSent }] 
            : [styles.assistantBubble, { backgroundColor: theme.colors.messageBubbleReceived }],
          { 
            borderRadius: theme.borderRadius.l,
            ...(!isUser && theme.shadows.ios.small)
          }
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onLongPress={handleLongPress}
          delayLongPress={500}
        >
          {renderMedia()}
          {message.content && (
            <Text 
              style={[
                styles.text,
                { 
                  color: isUser ? '#FFFFFF' : theme.colors.messageText,
                }
              ]}
            >
              {message.content}
            </Text>
          )}
          <Text style={[styles.timestamp, { color: isUser ? 'rgba(255,255,255,0.7)' : theme.colors.placeholder }]}>
            {formattedTime}
          </Text>
        </TouchableOpacity>
      </View>
      {isUser && (
        <View 
          style={[
            styles.avatar, 
            { 
              backgroundColor: theme.colors.accent,
              ...theme.shadows.ios.small
            }
          ]}
        >
          <Text style={styles.avatarText}>Me</Text>
        </View>
      )}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'flex-end',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  assistantContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bubble: {
    maxWidth: '75%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  mediaContainer: {
    marginBottom: 8,
  },
  imageWrapper: {
    marginBottom: 8,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: MAX_IMAGE_WIDTH,
    height: 150,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  imageLoader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -10,
    marginTop: -10,
  },
  imageErrorContainer: {
    width: MAX_IMAGE_WIDTH,
    height: 100,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  imageErrorText: {
    marginTop: 8,
    fontSize: 14,
  },
  retryText: {
    marginTop: 4,
    fontSize: 12,
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
  },
  fileIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
  },
  fileSize: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default MessageBubble; 