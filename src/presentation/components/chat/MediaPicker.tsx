import React, { useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { selectImageFromCamera, selectImageFromGallery } from '../../../utils/imageService';
import { selectFile } from '../../../utils/fileService';

interface MediaPickerProps {
  onImageSelected: (imageInfo: any) => void;
  onFileSelected: (fileInfo: any) => void;
  onDismiss: () => void;
  language: 'zh' | 'en';
}

/**
 * 媒体选择器组件
 * 负责处理媒体选择和文件上传
 */
const MediaPicker = ({ 
  onImageSelected, 
  onFileSelected, 
  onDismiss, 
  language 
}: MediaPickerProps) => {
  const { theme } = useTheme();
  
  // 翻译文本
  const translations = {
    zh: {
      gallery: '从相册选择',
      camera: '拍照',
      file: '选择文件',
      cancel: '取消',
      error: '发生错误',
      permissionDenied: '没有获得相机或存储权限，请在设置中允许访问。'
    },
    en: {
      gallery: 'Choose from Gallery',
      camera: 'Take Photo',
      file: 'Select File',
      cancel: 'Cancel',
      error: 'Error',
      permissionDenied: 'Permission denied for camera or storage. Please allow access in settings.'
    }
  };
  
  const t = translations[language];
  
  // 从相机选择
  const handleCameraSelect = useCallback(async () => {
    try {
      const image = await selectImageFromCamera();
      if (image) {
        onImageSelected(image);
      }
    } catch (error) {
      Alert.alert(
        t.error,
        error instanceof Error ? error.message : t.permissionDenied
      );
    } finally {
      onDismiss();
    }
  }, [onImageSelected, onDismiss, t]);
  
  // 从相册选择
  const handleGallerySelect = useCallback(async () => {
    try {
      const image = await selectImageFromGallery();
      if (image) {
        onImageSelected(image);
      }
    } catch (error) {
      Alert.alert(
        t.error,
        error instanceof Error ? error.message : t.permissionDenied
      );
    } finally {
      onDismiss();
    }
  }, [onImageSelected, onDismiss, t]);
  
  // 选择文件
  const handleFileSelect = useCallback(async () => {
    try {
      const files = await selectFile();
      if (files && files.length > 0) {
        onFileSelected(files);
      }
    } catch (error) {
      Alert.alert(
        t.error,
        error instanceof Error ? error.message : t.permissionDenied
      );
    } finally {
      onDismiss();
    }
  }, [onFileSelected, onDismiss, t]);
  
  return (
    <View style={styles.container}>
      <View 
        style={[
          styles.pickerContainer, 
          { backgroundColor: theme.dark ? theme.colors.card : '#FFF' }
        ]}
      >
        {/* 相册选择 */}
        <TouchableOpacity 
          style={styles.option} 
          onPress={handleGallerySelect}
          accessibilityRole="button"
          accessibilityLabel={t.gallery}
        >
          <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.primary}20` }]}>
            <Text style={styles.emojiIcon}>🖼️</Text>
          </View>
          <Text style={[styles.optionText, { color: theme.colors.text }]}>
            {t.gallery}
          </Text>
        </TouchableOpacity>
        
        {/* 相机选择 */}
        <TouchableOpacity 
          style={styles.option} 
          onPress={handleCameraSelect}
          accessibilityRole="button"
          accessibilityLabel={t.camera}
        >
          <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.primary}20` }]}>
            <Text style={styles.emojiIcon}>📸</Text>
          </View>
          <Text style={[styles.optionText, { color: theme.colors.text }]}>
            {t.camera}
          </Text>
        </TouchableOpacity>
        
        {/* 文件选择 */}
        <TouchableOpacity 
          style={styles.option} 
          onPress={handleFileSelect}
          accessibilityRole="button"
          accessibilityLabel={t.file}
        >
          <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.primary}20` }]}>
            <Text style={styles.emojiIcon}>📁</Text>
          </View>
          <Text style={[styles.optionText, { color: theme.colors.text }]}>
            {t.file}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* 取消按钮 */}
      <TouchableOpacity 
        style={[
          styles.cancelButton, 
          { backgroundColor: theme.dark ? theme.colors.card : '#FFF' }
        ]} 
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel={t.cancel}
      >
        <Text style={[styles.cancelText, { color: theme.colors.primary }]}>
          {t.cancel}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
  pickerContainer: {
    borderRadius: 12,
    marginBottom: 10,
    padding: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    marginLeft: 16,
  },
  cancelButton: {
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emojiIcon: {
    fontSize: 28,
  },
});

export default React.memo(MediaPicker); 