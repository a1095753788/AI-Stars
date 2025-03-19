import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { getFileDisplayName, getFileIcon, getReadableFileSize } from '../../../utils/fileService';

interface FileMessageBubbleProps {
  uri: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  isUser: boolean;
  style?: any;
  onPress?: () => void;
}

/**
 * 文件消息气泡组件
 * 显示文件消息，支持点击操作
 */
const FileMessageBubble: React.FC<FileMessageBubbleProps> = ({
  uri,
  fileName,
  fileSize,
  fileType = 'application/octet-stream',
  isUser,
  style,
  onPress
}) => {
  // 获取文件显示名
  const displayName = fileName || getFileDisplayName(uri);
  
  // 获取文件图标
  const fileIcon = getFileIcon(fileType);
  
  // 获取可读文件大小
  const readableSize = fileSize ? getReadableFileSize(fileSize) : '';
  
  // 点击文件处理函数
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      console.log('文件点击:', uri);
      // 实际应用中，这里可以打开文件预览或下载文件
    }
  };
  
  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <View style={[
        styles.container,
        style,
        {
          backgroundColor: isUser ? '#007AFF' : '#F0F0F0',
        }
      ]}>
        {/* 文件图标 - 实际应用中应使用图标库 */}
        <View style={styles.iconContainer}>
          <Text style={[styles.icon, { color: isUser ? '#FFFFFF' : '#000000' }]}>
            {fileIcon === 'file-pdf' ? '📄' : 
             fileIcon === 'file-word' ? '📝' : 
             fileIcon === 'file-excel' ? '📊' : 
             fileIcon === 'file-powerpoint' ? '📑' : 
             fileIcon === 'file-image' ? '🖼️' : 
             fileIcon === 'file-text' ? '📃' : 
             fileIcon === 'file-zip' ? '🗜️' : 
             fileIcon === 'file-music' ? '🎵' : 
             fileIcon === 'file-video' ? '🎬' : '📁'}
          </Text>
        </View>
        
        {/* 文件信息 */}
        <View style={styles.fileInfo}>
          <Text 
            style={[styles.fileName, { color: isUser ? '#FFFFFF' : '#000000' }]} 
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {displayName}
          </Text>
          
          {readableSize ? (
            <Text style={[styles.fileSize, { color: isUser ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.5)' }]}>
              {readableSize}
            </Text>
          ) : null}
        </View>
        
        {/* 下载/查看按钮 */}
        <View style={styles.actionContainer}>
          <Text style={[styles.actionText, { color: isUser ? '#FFFFFF' : '#007AFF' }]}>
            查看
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    maxWidth: 300,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  fileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
  },
  actionContainer: {
    marginLeft: 8,
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0, 0, 0, 0.1)',
    height: '70%',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default FileMessageBubble; 