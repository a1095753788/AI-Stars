// 颜色系统
export const colors = {
  // 主要颜色
  primary: '#4A6FFF',  // 主色调：蓝色
  primaryDark: '#3A5AD9', // 深色主色调
  primaryLight: '#7B95FF', // 浅色主色调
  secondary: '#FF6B6B', // 次要颜色：红色
  accent: '#FFD166', // 强调色：黄色

  // 背景色
  background: '#FFFFFF', // 主背景色
  backgroundDark: '#F5F7FB', // 深色背景
  backgroundLight: '#FAFBFC', // 浅色背景
  cardBackground: '#FFFFFF', // 卡片背景

  // 文字颜色
  text: '#333333', // 主文字颜色
  textSecondary: '#666666', // 次要文字颜色
  textTertiary: '#999999', // 第三级文字颜色
  textInverted: '#FFFFFF', // 反色文字

  // 边框和分隔线
  border: '#E0E0E0', // 边框颜色
  divider: '#EEEEEE', // 分隔线颜色

  // 状态颜色
  success: '#4CAF50', // 成功
  error: '#F44336', // 错误
  warning: '#FFC107', // 警告
  info: '#2196F3', // 信息

  // 暗色模式
  darkPrimary: '#7B95FF',
  darkBackground: '#1A1C22',
  darkCard: '#282A36',
  darkText: '#EEEEEE',
  darkBorder: '#414558',

  // 社交媒体颜色
  facebook: '#3b5998',
  twitter: '#1DA1F2',
  instagram: '#E1306C',
  wechat: '#7BB32E',
  weibo: '#DF2029'
};

// 排版系统
export const typography = {
  // 字体家族
  fontFamily: {
    regular: 'System', // 默认系统字体
    medium: 'System',
    bold: 'System',
  },
  
  // 字体大小
  fontSizes: {
    xs: 10, // 极小文字
    s: 12,  // 小文字
    m: 14,  // 中等文字（默认）
    l: 16,  // 大文字
    xl: 18, // 特大文字
    xxl: 20, // 超大文字
    display: 24, // 展示型文字
    title: 28, // 标题
    headline: 34, // 头条
  },
  
  // 字体粗细
  fontWeights: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
  
  // 行高
  lineHeights: {
    tight: 1.2, // 紧凑
    normal: 1.5, // 正常
    loose: 1.8, // 宽松
  }
};

// 间距系统
export const spacing = {
  xs: 4,  // 极小间距
  s: 8,   // 小间距
  m: 16,  // 中等间距（基准）
  l: 24,  // 大间距
  xl: 32, // 特大间距
  xxl: 48, // 超大间距
};

// 圆角系统
export const borderRadius = {
  s: 4,   // 小圆角
  m: 8,   // 中等圆角
  l: 16,  // 大圆角
  xl: 24, // 特大圆角
  round: 999, // 圆形
};

// 阴影系统
export const shadows = {
  // 安卓阴影
  android: {
    small: {
      elevation: 2,
    },
    medium: {
      elevation: 4,
    },
    large: {
      elevation: 8,
    },
  },

  // iOS阴影
  ios: {
    small: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
    },
    medium: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
    },
    large: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
    },
  },
};

// 动画时间
export const animation = {
  short: 150,   // 短动画，用于简单交互
  medium: 300,  // 中等动画，用于标准过渡
  long: 450,    // 长动画，用于复杂过渡
};

// 尺寸系统
export const sizes = {
  icon: {
    s: 16,
    m: 24,
    l: 32,
    xl: 48,
  },
  button: {
    height: 48,
    minWidth: 120,
  },
  input: {
    height: 48,
  },
  maxContentWidth: 1200, // 内容最大宽度
};

// 响应式断点
export const breakpoints = {
  phone: 0,
  tablet: 768,
  desktop: 1024,
};

// 常用的布局生成器
export const getLayout = {
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowAround: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  column: {
    flexDirection: 'column',
  }
};

// 导出主题对象，便于使用ThemeProvider
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
  sizes,
  breakpoints,
  getLayout
};

export default theme; 