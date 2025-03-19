/**
 * 语音播放状态
 */
interface VoiceState {
  isPlaying: boolean;
  text: string | null;
  progress: number;
  isPaused: boolean;
}

// 当前语音状态
let voiceState: VoiceState = {
  isPlaying: false,
  text: null,
  progress: 0,
  isPaused: false
};

// 模拟的定时器ID
let progressTimer: NodeJS.Timeout | null = null;

/**
 * 朗读文本
 * 这是一个模拟实现，实际应用中需要使用平台特定的TTS库
 * 例如 react-native-tts
 * @param text 要朗读的文本
 * @returns 语音播放状态
 */
export const speakText = (text: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    try {
      // 如果已经在播放，先停止
      if (voiceState.isPlaying) {
        stopSpeaking();
      }
      
      // 更新状态
      voiceState = {
        isPlaying: true,
        text: text,
        progress: 0,
        isPaused: false
      };
      
      // 模拟播放进度更新
      progressTimer = setInterval(() => {
        if (voiceState.isPlaying && !voiceState.isPaused) {
          voiceState.progress += 0.05;
          
          // 播放完成
          if (voiceState.progress >= 1) {
            stopSpeaking();
            resolve(true);
          }
        }
      }, 100);
      
      // 模拟成功
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * 停止播放
 * @returns 停止结果
 */
export const stopSpeaking = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // 清除定时器
    if (progressTimer) {
      clearInterval(progressTimer);
      progressTimer = null;
    }
    
    // 重置状态
    voiceState = {
      isPlaying: false,
      text: null,
      progress: 0,
      isPaused: false
    };
    
    resolve(true);
  });
};

/**
 * 暂停播放
 * @returns 暂停结果
 */
export const pauseSpeaking = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (voiceState.isPlaying && !voiceState.isPaused) {
      voiceState.isPaused = true;
      resolve(true);
    } else {
      resolve(false);
    }
  });
};

/**
 * 恢复播放
 * @returns 恢复结果
 */
export const resumeSpeaking = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (voiceState.isPlaying && voiceState.isPaused) {
      voiceState.isPaused = false;
      resolve(true);
    } else {
      resolve(false);
    }
  });
};

/**
 * 获取当前语音状态
 * @returns 语音状态
 */
export const getVoiceState = (): VoiceState => {
  return { ...voiceState };
};

/**
 * 检查设备是否支持TTS
 * 这是一个模拟实现
 * @returns 是否支持TTS
 */
export const checkTTSAvailability = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // 模拟检查TTS可用性
    // 95%的概率支持TTS
    setTimeout(() => {
      resolve(Math.random() < 0.95);
    }, 500);
  });
}; 