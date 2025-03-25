import { useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';

/**
 * 应用状态钩子，监听应用前后台状态
 * @returns 当前应用状态
 */
function useAppState(): AppStateStatus {
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return appState;
}

export default useAppState; 