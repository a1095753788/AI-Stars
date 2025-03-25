/**
 * 全局模块声明
 * 为项目中使用的没有类型定义的模块提供声明
 */

// 声明mediaUtils模块
declare module './mediaUtils';

// 声明providers目录下的各个服务模块
declare module './providers/openaiMediaService';
declare module './providers/claudeMediaService';
declare module './providers/geminiMediaService';
declare module './providers/mistralMediaService';
declare module './providers/qwenMediaService';

// 兼容性声明，解决相对路径导入问题
declare module 'src/utils/mediaUtils';
declare module 'src/utils/providers/openaiMediaService';
declare module 'src/utils/providers/claudeMediaService';
declare module 'src/utils/providers/geminiMediaService';
declare module 'src/utils/providers/mistralMediaService';
declare module 'src/utils/providers/qwenMediaService';

// 如果需要，可以在这里添加更多模块声明 