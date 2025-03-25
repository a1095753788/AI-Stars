import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { mmkvStorage } from '../../services/storage';

export interface SimpleTheme {
  isDark: boolean;
  dark?: boolean;
  colors: {
    background: string;
    paper: string;
    primary: string;
    accent: string;
    text: string;
    border: string;
    button: string;
    buttonText: string;
    messageBackground: string;
    messageBubbleSent: string;
    messageBubbleReceived: string;
    messageText: string;
    sendButton: string;
    inputBackground: string;
    error: string;
    success: string;
    warning: string;
    placeholder: string;
    card: string;
    notification: string;
    primaryDark: string;
    textSecondary: string;
    textTertiary: string;
    disabled: string;
  };
  spacing: {
    xs: number;
    s: number;
    m: number;
    l: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    s: number;
    m: number;
    l: number;
    xl: number;
  };
  shadows: {
    ios: {
      small: {
        shadowColor: string;
        shadowOffset: {
          width: number;
          height: number;
        };
        shadowOpacity: number;
        shadowRadius: number;
      };
      medium: {
        shadowColor: string;
        shadowOffset: {
          width: number;
          height: number;
        };
        shadowOpacity: number;
        shadowRadius: number;
      };
      large: {
        shadowColor: string;
        shadowOffset: {
          width: number;
          height: number;
        };
        shadowOpacity: number;
        shadowRadius: number;
      };
    };
    android: {
      small: {
        elevation: number;
      };
      medium: {
        elevation: number;
      };
      large: {
        elevation: number;
      };
    };
  };
}

export const lightTheme: SimpleTheme = {
  isDark: false,
  dark: false,
  colors: {
    background: '#FFFFFF',
    paper: '#FFFFFF',
    primary: '#5E56E7',
    accent: '#6C63FF',
    text: '#1A1A1A',
    border: '#E0E0E0',
    button: '#4F46E5',
    buttonText: '#FFFFFF',
    messageBackground: '#F5F5F5',
    messageBubbleSent: '#4F46E5',
    messageBubbleReceived: '#F0F0F0',
    messageText: '#1C1C1E',
    sendButton: '#4F46E5',
    inputBackground: '#F5F5F7',
    error: '#EF4444',
    success: '#34C759',
    warning: '#FFCC00',
    placeholder: '#9A9A9A',
    card: '#F5F5F7',
    notification: '#FF3B30',
    primaryDark: '#4A43C8',
    textSecondary: '#6C6C6C',
    textTertiary: '#9A9A9A',
    disabled: '#DCDCDC',
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    s: 4,
    m: 8,
    l: 16,
    xl: 24,
  },
  shadows: {
    ios: {
      small: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
      },
      medium: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
      },
      large: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
      },
    },
    android: {
      small: {
        elevation: 2,
      },
      medium: {
        elevation: 5,
      },
      large: {
        elevation: 10,
      },
    },
  },
};

export const darkTheme: SimpleTheme = {
  isDark: true,
  dark: true,
  colors: {
    background: '#12141D',
    paper: '#171923',
    primary: '#5E56E7',
    accent: '#6C63FF',
    text: '#FFFFFF',
    border: '#333333',
    button: '#6366F1',
    buttonText: '#FFFFFF',
    messageBackground: '#111827',
    messageBubbleSent: '#6366F1',
    messageBubbleReceived: '#374151',
    messageText: '#FFFFFF',
    sendButton: '#6366F1',
    inputBackground: '#222437',
    error: '#F87171',
    success: '#30D158',
    warning: '#FFCC00',
    placeholder: '#6C6C6C',
    card: '#222437',
    notification: '#FF453A',
    primaryDark: '#4A43C8',
    textSecondary: '#AAAAAA',
    textTertiary: '#6C6C6C',
    disabled: '#444444',
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    s: 4,
    m: 8,
    l: 16,
    xl: 24,
  },
  shadows: {
    ios: {
      small: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.3,
        shadowRadius: 1.5,
      },
      medium: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.35,
        shadowRadius: 3.0,
      },
      large: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.4,
        shadowRadius: 5.0,
      },
    },
    android: {
      small: {
        elevation: 2,
      },
      medium: {
        elevation: 5,
      },
      large: {
        elevation: 10,
      },
    },
  },
};

type ThemeContextValue = {
  theme: SimpleTheme;
  toggleTheme: () => void;
  setTheme: (mode: 'light' | 'dark') => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [activeTheme, setActiveTheme] = useState<'light' | 'dark'>(systemColorScheme || 'light');
  
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = mmkvStorage.getItem('theme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
          setActiveTheme(savedTheme as 'light' | 'dark');
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      }
    };

    loadTheme();
  }, []);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      // Only update if no saved theme
      const savedTheme = mmkvStorage.getItem('theme');
      if (!savedTheme && colorScheme) {
        setActiveTheme(colorScheme as 'light' | 'dark');
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const toggleTheme = async () => {
    const newTheme = activeTheme === 'light' ? 'dark' : 'light';
    setActiveTheme(newTheme);
    try {
      mmkvStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const setTheme = async (mode: 'light' | 'dark') => {
    setActiveTheme(mode);
    try {
      mmkvStorage.setItem('theme', mode);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const theme = activeTheme === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 