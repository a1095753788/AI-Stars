import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ChatInputBarProps {
  darkMode: boolean;
  inputText: string;
  onChangeText: (text: string) => void;
  onSendPress: () => void;
  onAttachmentPress: () => void;
  isProcessing: boolean;
  isUploadingImage: boolean;
  selectedImage: any;
  onClearImage: () => void;
  placeholder?: string;
}

/**
 * 聊天输入栏组件
 * 负责处理用户输入和消息发送
 */
const ChatInputBar: React.FC<ChatInputBarProps> = ({
  darkMode,
  inputText,
  onChangeText,
  onSendPress,
  onAttachmentPress,
  isProcessing,
  isUploadingImage,
  selectedImage,
  onClearImage,
  placeholder = 'Type a message...'
}) => {
  // 输入框引用，用于控制焦点
  const inputRef = useRef<TextInput>(null);
  
  // 输入框焦点状态
  const [isFocused, setIsFocused] = useState(false);
  
  // 根据主题选择样式
  const containerStyle = [
    styles.container,
    darkMode ? styles.containerDark : styles.containerLight
  ];
  
  const inputStyle = [
    styles.input,
    darkMode ? styles.inputDark : styles.inputLight,
    isFocused && styles.inputFocused
  ];
  
  // 图标颜色
  const iconColor = darkMode ? '#E0E0E0' : '#424242';
  const sendIconColor = (inputText.trim().length > 0 || selectedImage) 
    ? (darkMode ? '#82B1FF' : '#2979FF') 
    : (darkMode ? '#757575' : '#BDBDBD');
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* 选择的图片预览 */}
      {selectedImage && (
        <View style={styles.imagePreviewContainer}>
          <Image 
            source={{ uri: selectedImage.uri }} 
            style={styles.imagePreview} 
          />
          <TouchableOpacity 
            style={styles.clearImageButton}
            onPress={onClearImage}
          >
            <Icon name="close-circle" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
      
      {/* 输入区域 */}
      <View style={containerStyle}>
        {/* 附件按钮 */}
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={onAttachmentPress}
          disabled={isProcessing || isUploadingImage}
        >
          <Icon 
            name="paperclip" 
            size={24} 
            color={iconColor} 
          />
        </TouchableOpacity>
        
        {/* 文本输入框 */}
        <TextInput
          ref={inputRef}
          style={inputStyle}
          placeholder={placeholder}
          placeholderTextColor={darkMode ? '#9E9E9E' : '#9E9E9E'}
          value={inputText}
          onChangeText={onChangeText}
          multiline
          maxLength={4000}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!isProcessing && !isUploadingImage}
        />
        
        {/* 发送按钮 */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onSendPress}
          disabled={
            (inputText.trim().length === 0 && !selectedImage) || 
            isProcessing || 
            isUploadingImage
          }
        >
          {isProcessing || isUploadingImage ? (
            <ActivityIndicator size="small" color={darkMode ? '#82B1FF' : '#2979FF'} />
          ) : (
            <Icon 
              name="send" 
              size={24} 
              color={sendIconColor} 
            />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
  },
  containerLight: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E0E0E0',
  },
  containerDark: {
    backgroundColor: '#1E1E1E',
    borderTopColor: '#424242',
  },
  iconButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: 36,
    maxHeight: 120,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 8,
    fontSize: 16,
  },
  inputLight: {
    backgroundColor: '#F5F5F5',
    color: '#212121',
  },
  inputDark: {
    backgroundColor: '#333333',
    color: '#FFFFFF',
  },
  inputFocused: {
    borderWidth: 1,
    borderColor: '#2979FF',
  },
  imagePreviewContainer: {
    margin: 8,
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  clearImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
});

export default ChatInputBar; 