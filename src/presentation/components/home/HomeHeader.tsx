import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// 针对MaterialCommunityIcons的类型定义问题，直接导入整个库
import * as Icons from 'react-native-vector-icons/MaterialCommunityIcons';
// 将Icons作为任意类型使用
const Icon = Icons.default;

interface HomeHeaderProps {
  darkMode: boolean;
  title: string;
  onNewChat: () => void;
  onSettingsPress: () => void;
}

/**
 * 首页标题栏组件
 * 负责显示应用标题和操作按钮
 */
const HomeHeader: React.FC<HomeHeaderProps> = ({
  darkMode,
  title,
  onNewChat,
  onSettingsPress
}) => {
  const navigation = useNavigation();
  
  const containerStyle = [
    styles.container,
    darkMode ? styles.containerDark : styles.containerLight,
    Platform.OS === 'ios' && styles.containerIOS
  ];
  
  const titleStyle = [
    styles.title,
    darkMode ? styles.titleDark : styles.titleLight
  ];
  
  const iconColor = darkMode ? '#FFFFFF' : '#000000';
  
  return (
    <View style={containerStyle}>
      <StatusBar
        barStyle={darkMode ? 'light-content' : 'dark-content'}
        backgroundColor={darkMode ? '#121212' : '#FFFFFF'}
      />
      
      {/* 标题 */}
      <Text style={titleStyle}>{title}</Text>
      
      {/* 操作按钮 */}
      <View style={styles.actionsContainer}>
        {/* 新建聊天按钮 */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onNewChat}
        >
          <Icon name="plus" size={24} color={iconColor} />
        </TouchableOpacity>
        
        {/* 设置按钮 */}
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={onSettingsPress}
        >
          <Icon name="cog" size={24} color={iconColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 56,
    width: '100%',
    borderBottomWidth: 1,
  },
  containerLight: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E0E0E0',
  },
  containerDark: {
    backgroundColor: '#121212',
    borderBottomColor: '#333333',
  },
  containerIOS: {
    paddingTop: 44, // 适配iOS刘海屏
    height: 88,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  titleLight: {
    color: '#212121',
  },
  titleDark: {
    color: '#FFFFFF',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default HomeHeader; 