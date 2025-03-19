import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { speak, stopSpeaking, isSpeaking } from '../../../utils/voiceService';

interface VoiceButtonProps {
  text: string;
  style?: any;
}

/**
 * 语音播放按钮组件
 * 用于朗读文本内容
 */
const VoiceButton: React.FC<VoiceButtonProps> = ({ text, style }) => {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  // 当组件卸载时停止播放
  useEffect(() => {
    return () => {
      if (playing) {
        handleStop();
      }
    };
  }, [playing]);

  // 定期检查是否正在播放
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (playing) {
      intervalId = setInterval(async () => {
        const speaking = await isSpeaking();
        if (!speaking && playing) {
          setPlaying(false);
        }
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [playing]);

  const handlePlay = async () => {
    try {
      setLoading(true);

      // 如果正在播放，先停止
      if (playing) {
        await handleStop();
        return;
      }

      // 开始播放
      await speak(text);
      setPlaying(true);
    } catch (error) {
      console.error('播放语音失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    try {
      await stopSpeaking();
      setPlaying(false);
    } catch (error) {
      console.error('停止语音失败:', error);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        playing ? styles.stopButton : styles.playButton,
        style
      ]}
      onPress={handlePlay}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <Text style={styles.buttonText}>
          {playing ? '停止' : '播放'}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  playButton: {
    backgroundColor: '#007AFF',
  },
  stopButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default VoiceButton; 