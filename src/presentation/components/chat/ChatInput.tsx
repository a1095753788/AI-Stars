import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Text,
  Keyboard,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface ChatInputProps {
  inputText: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onCameraPress: () => void;
  onImagePress: () => void;
  onFilePress: () => void;
  onVoicePress?: () => void;
  sending: boolean;
  uploadingImage: boolean;
  uploadingFile: boolean;
  voiceEnabled?: boolean;
  placeholder?: string;
}

/**
 * 聊天输入组件
 * 负责用户输入和操作按钮
 */
const ChatInput = ({
  inputText,
  onChangeText,
  onSend,
  onCameraPress,
  onImagePress,
  onFilePress,
  onVoicePress,
  sending,
  uploadingImage,
  uploadingFile,
  voiceEnabled = false,
  placeholder = '输入消息...',
}: ChatInputProps) => {
  const { theme } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  // 处理发送按钮点击
  const handleSend = useCallback(() => {
    if (inputText.trim() !== '' && !sending) {
      Keyboard.dismiss();
      onSend();
    }
  }, [inputText, sending, onSend]);

  // 处理附件按钮点击
  const handleAttachmentPress = useCallback(() => {
    if (!uploadingImage && !uploadingFile) {
      // 显示附件选项
      setFocused(false);
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  }, [uploadingImage, uploadingFile]);

  // 渲染输入框右侧按钮
  const renderSendButton = () => {
    if (sending) {
      return (
        <ActivityIndicator
          size="small"
          color={theme.colors.primary}
          style={styles.sendButton}
        />
      );
    }

    return (
      <TouchableOpacity
        onPress={handleSend}
        disabled={inputText.trim() === '' || sending}
        style={[
          styles.sendButton,
          {
            backgroundColor:
              inputText.trim() === '' ? theme.colors.border : theme.colors.primary,
          },
        ]}
        accessibilityLabel="发送消息"
        accessibilityRole="button"
      >
        <Text style={styles.sendButtonText}>✉️</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          borderTopColor: theme.colors.border,
          backgroundColor: theme.isDark ? '#1E1E1E' : '#F8F8F8',
        },
      ]}
    >
      <View style={styles.inputContainer}>
        {/* 附件按钮 */}
        <TouchableOpacity
          style={styles.attachButton}
          onPress={handleAttachmentPress}
          disabled={uploadingImage || uploadingFile}
          accessibilityLabel="添加附件"
          accessibilityRole="button"
        >
          <Text style={styles.attachButtonText}>📄</Text>
        </TouchableOpacity>

        {/* 文本输入框 */}
        <TextInput
          ref={inputRef}
          value={inputText}
          onChangeText={onChangeText}
          style={[
            styles.input,
            {
              backgroundColor: theme.isDark ? '#2C2C2C' : '#FFFFFF',
              color: theme.colors.text,
              borderColor: theme.colors.border,
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={`${theme.colors.text}80`}
          multiline
          maxLength={4000}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel="消息输入框"
        />

        {/* 相机按钮 */}
        <TouchableOpacity
          style={styles.cameraButton}
          onPress={onCameraPress}
          disabled={uploadingImage || uploadingFile || sending}
          accessibilityLabel="拍照"
          accessibilityRole="button"
        >
          <Text style={styles.cameraButtonText}>📸</Text>
        </TouchableOpacity>

        {/* 图片按钮 */}
        <TouchableOpacity
          style={styles.imageButton}
          onPress={onImagePress}
          disabled={uploadingImage || uploadingFile || sending}
          accessibilityLabel="选择图片"
          accessibilityRole="button"
        >
          <Text style={styles.imageButtonText}>🖼️</Text>
          {uploadingImage && (
            <ActivityIndicator
              size="small"
              color={theme.colors.primary}
              style={styles.buttonLoading}
            />
          )}
        </TouchableOpacity>

        {/* 文件按钮 */}
        <TouchableOpacity
          style={styles.fileButton}
          onPress={onFilePress}
          disabled={uploadingImage || uploadingFile || sending}
          accessibilityLabel="选择文件"
          accessibilityRole="button"
        >
          <Text style={styles.fileButtonText}>📄</Text>
          {uploadingFile && (
            <ActivityIndicator
              size="small"
              color={theme.colors.primary}
              style={styles.buttonLoading}
            />
          )}
        </TouchableOpacity>

        {/* 语音按钮 - 如果启用 */}
        {voiceEnabled && onVoicePress && (
          <TouchableOpacity
            style={styles.voiceButton}
            onPress={onVoicePress}
            disabled={sending}
            accessibilityLabel="语音输入"
            accessibilityRole="button"
          >
            <Text style={styles.voiceButtonText}>🎤</Text>
          </TouchableOpacity>
        )}

        {/* 发送按钮 */}
        {renderSendButton()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachButton: {
    padding: 8,
    marginRight: 4,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    padding: 8,
    marginLeft: 4,
  },
  imageButton: {
    padding: 8,
    marginLeft: 2,
  },
  fileButton: {
    padding: 8,
    marginLeft: 2,
  },
  voiceButton: {
    padding: 8,
    marginLeft: 2,
  },
  buttonLoading: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 14,
    height: 14,
  },
  sendButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  attachButtonText: {
    fontSize: 24,
  },
  cameraButtonText: {
    fontSize: 24,
  },
  imageButtonText: {
    fontSize: 24,
  },
  fileButtonText: {
    fontSize: 24,
  },
  voiceButtonText: {
    fontSize: 24,
  },
});

export default React.memo(ChatInput); 