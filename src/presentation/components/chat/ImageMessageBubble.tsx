import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Modal, Text, ActivityIndicator, Dimensions } from 'react-native';
import { getImageDisplaySize } from '../../../utils/imageService';

interface ImageMessageBubbleProps {
  uri: string;
  width?: number;
  height?: number;
  isUser: boolean;
  style?: any;
}

const MAX_BUBBLE_WIDTH = 250;
const MAX_BUBBLE_HEIGHT = 200;

/**
 * 图片消息气泡组件
 * 显示图片消息，支持点击查看大图
 */
const ImageMessageBubble: React.FC<ImageMessageBubbleProps> = ({ 
  uri, 
  width = 0, 
  height = 0, 
  isUser,
  style 
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 计算图片显示尺寸，保持宽高比
  const displaySize = getImageDisplaySize(
    width || MAX_BUBBLE_WIDTH, 
    height || MAX_BUBBLE_HEIGHT, 
    MAX_BUBBLE_WIDTH, 
    MAX_BUBBLE_HEIGHT
  );

  // 计算全屏查看时的尺寸
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const fullScreenSize = getImageDisplaySize(
    width || screenWidth,
    height || screenHeight,
    screenWidth - 40, // 边距
    screenHeight - 120 // 边距
  );

  const handleImageLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setError('图片加载失败');
  };

  const openFullScreenView = () => {
    setIsModalVisible(true);
    setIsLoading(true);
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity onPress={openFullScreenView} activeOpacity={0.8}>
        <View style={[
          styles.imageBubble,
          {
            width: displaySize.width,
            height: displaySize.height,
            backgroundColor: isUser ? '#007AFF' : '#F0F0F0'
          }
        ]}>
          <Image
            source={{ uri }}
            style={[styles.image, { width: displaySize.width, height: displaySize.height }]}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={isUser ? "#FFFFFF" : "#007AFF"} />
            </View>
          )}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: isUser ? "#FFFFFF" : "#FF3B30" }]}>
                {error}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* 全屏查看模态框 */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => setIsModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.modalImageContainer}>
            <Image
              source={{ uri }}
              style={[styles.modalImage, { width: fullScreenSize.width, height: fullScreenSize.height }]}
              resizeMode="contain"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            {isLoading && (
              <View style={styles.modalLoadingContainer}>
                <ActivityIndicator size="large" color="#FFFFFF" />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: MAX_BUBBLE_WIDTH,
  },
  imageBubble: {
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    borderRadius: 10,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    padding: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    borderRadius: 5,
  },
  modalLoadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ImageMessageBubble; 