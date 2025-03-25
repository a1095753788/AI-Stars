import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { getAvailableModels } from '../../services/api';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation';
import { ApiProvider } from '../../services/api/types';

type ModelSelectorScreenRouteProp = RouteProp<RootStackParamList, 'ModelSelector'>;
type ModelSelectorScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ModelSelector'>;

type Props = {
  route: ModelSelectorScreenRouteProp;
  navigation: ModelSelectorScreenNavigationProp;
};

/**
 * 模型选择器屏幕
 * 显示当前选择的API提供商支持的模型列表
 */
const ModelSelectorScreen = ({ route, navigation }: Props) => {
  const { theme } = useTheme();
  const { provider, onSelectModel } = route.params;
  const [models, setModels] = useState<string[]>([]);

  useEffect(() => {
    // 获取当前提供商支持的模型列表
    const availableModels = getAvailableModels(provider);
    setModels(availableModels);
  }, [provider]);

  const handleSelectModel = (model: string) => {
    // 选择模型后调用回调并返回上一页
    onSelectModel(model);
    navigation.goBack();
  };

  const renderModelItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.modelItem,
        { backgroundColor: theme.colors.card }
      ]}
      onPress={() => handleSelectModel(item)}
    >
      <Text style={[styles.modelName, { color: theme.colors.text }]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} />
      
      {/* 标题栏 */}
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>
            返回
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          选择模型
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* 提供商信息 */}
      <View style={[styles.providerInfo, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.providerInfoText, { color: theme.colors.text }]}>
          当前提供商: {provider}
        </Text>
      </View>
      
      {/* 模型列表 */}
      {models.length > 0 ? (
        <FlatList
          data={models}
          renderItem={renderModelItem}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.modelList}
          ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>
            当前提供商没有可用模型
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 50,
  },
  providerInfo: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  providerInfoText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modelList: {
    padding: 16,
  },
  modelItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  modelName: {
    fontSize: 16,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    marginVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ModelSelectorScreen; 