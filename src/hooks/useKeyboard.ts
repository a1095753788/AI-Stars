import { useState, useEffect, useCallback } from 'react';
import { 
  Keyboard, 
  KeyboardEvent, 
  Platform, 
  Dimensions, 
  EmitterSubscription, 
  LayoutAnimation,
  ScaledSize
} from 'react-native';

interface KeyboardState {
  keyboardHeight: number;
  isKeyboardVisible: boolean;
  orientation: 'portrait' | 'landscape';
  keyboardAnimationDuration: number;
}

/**
 * 键盘状态钩子，监听键盘显示状态和设备旋转
 * @returns 键盘高度、显示状态、屏幕方向和动画持续时间
 */
function useKeyboard(): KeyboardState {
  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    keyboardHeight: 0,
    isKeyboardVisible: false,
    orientation: isPortrait(Dimensions.get('window')) ? 'portrait' : 'landscape',
    keyboardAnimationDuration: 250,
  });
  
  // 判断是否为竖屏
  function isPortrait(dimensions: ScaledSize): boolean {
    return dimensions.width < dimensions.height;
  }

  // 处理键盘显示事件
  const handleKeyboardShow = useCallback((e: KeyboardEvent) => {
    // Android 和 iOS 使用不同的动画参数
    if (Platform.OS === 'android') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    
    const duration = e.duration ?? (Platform.OS === 'ios' ? 250 : 100);
    
    setKeyboardState(prev => ({
      ...prev,
      keyboardHeight: e.endCoordinates.height,
      isKeyboardVisible: true,
      keyboardAnimationDuration: duration,
    }));
  }, []);

  // 处理键盘隐藏事件
  const handleKeyboardHide = useCallback((e: KeyboardEvent) => {
    // Android 和 iOS 使用不同的动画参数
    if (Platform.OS === 'android') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    
    const duration = e.duration ?? (Platform.OS === 'ios' ? 250 : 100);
    
    setKeyboardState(prev => ({
      ...prev,
      keyboardHeight: 0,
      isKeyboardVisible: false,
      keyboardAnimationDuration: duration,
    }));
  }, []);
  
  // 处理设备方向变化
  const handleOrientationChange = useCallback(({ window }: { window: ScaledSize }) => {
    setKeyboardState(prev => ({
      ...prev,
      orientation: isPortrait(window) ? 'portrait' : 'landscape',
    }));
  }, []);

  useEffect(() => {
    // 处理 Android 软键盘模式
    if (Platform.OS === 'android') {
      // 在 Android 上，当屏幕旋转时键盘高度可能会变化，
      // 所以我们需要在可见状态下重新获取高度
      Keyboard.dismiss();
    }
    
    // 监听键盘事件
    const subscriptions: EmitterSubscription[] = [];
    
    // iOS 和 Android 使用不同的事件名称
    if (Platform.OS === 'ios') {
      subscriptions.push(
        Keyboard.addListener('keyboardWillShow', handleKeyboardShow),
        Keyboard.addListener('keyboardWillHide', handleKeyboardHide),
        // iOS 需要特殊处理键盘帧变化
        Keyboard.addListener('keyboardWillChangeFrame', handleKeyboardShow)
      );
    } else {
      subscriptions.push(
        Keyboard.addListener('keyboardDidShow', handleKeyboardShow),
        Keyboard.addListener('keyboardDidHide', handleKeyboardHide)
      );
    }

    // 监听设备旋转事件
    const dimensionsSubscription = Dimensions.addEventListener(
      'change', 
      handleOrientationChange
    );

    return () => {
      // 清理所有订阅
      subscriptions.forEach(subscription => subscription.remove());
      dimensionsSubscription.remove();
    };
  }, [handleKeyboardShow, handleKeyboardHide, handleOrientationChange]);

  return keyboardState;
}

export default useKeyboard; 