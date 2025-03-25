import { useCallback, useState } from 'react';

/**
 * UI状态钩子
 * 管理HomeScreen中的UI状态
 */
const useUIState = () => {
  // 输入框状态
  const [inputText, setInputText] = useState('');
  
  // 错误状态
  const [error, setError] = useState<string | null>(null);
  
  // 模态框状态
  const [isModalVisible, setModalVisible] = useState(false);
  const [isImagePickerVisible, setImagePickerVisible] = useState(false);
  
  // 滚动状态
  const [autoscrollEnabled, setAutoscrollEnabled] = useState(true);
  
  // 媒体选择状态
  const [selectedImage, setSelectedImage] = useState<any>(null);
  
  // 显示错误信息
  const showError = useCallback((message: string) => {
    setError(message);
    
    // 3秒后自动清除错误
    setTimeout(() => {
      setError(null);
    }, 3000);
  }, []);
  
  // 处理输入框改变
  const handleInputChange = useCallback((text: string) => {
    setInputText(text);
  }, []);
  
  // 切换模态框可见性
  const toggleModal = useCallback(() => {
    setModalVisible(prev => !prev);
  }, []);
  
  // 切换图片选择器可见性
  const toggleImagePicker = useCallback(() => {
    setImagePickerVisible(prev => !prev);
  }, []);
  
  // 切换自动滚动
  const toggleAutoscroll = useCallback(() => {
    setAutoscrollEnabled(prev => !prev);
  }, []);
  
  // 清除选择的图片
  const clearSelectedImage = useCallback(() => {
    setSelectedImage(null);
  }, []);
  
  // 设置选择的图片
  const handleImageSelected = useCallback((imageInfo: any) => {
    setSelectedImage(imageInfo);
    setImagePickerVisible(false); // 选择后关闭选择器
  }, []);
  
  return {
    // 状态
    inputText,
    error,
    isModalVisible,
    isImagePickerVisible,
    autoscrollEnabled,
    selectedImage,
    
    // 设置函数
    setInputText,
    setError,
    setModalVisible,
    setImagePickerVisible,
    setAutoscrollEnabled,
    setSelectedImage,
    
    // 处理函数
    showError,
    handleInputChange,
    toggleModal,
    toggleImagePicker,
    toggleAutoscroll,
    clearSelectedImage,
    handleImageSelected
  };
};

export default useUIState; 