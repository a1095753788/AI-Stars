/**
 * 预设提示词数据
 */

export interface Prompt {
  id: string;
  text: string;
  category: 'general' | 'creative' | 'professional' | 'technical';
}

export const prompts: Prompt[] = [
  // 通用类
  {
    id: 'general-1',
    text: '介绍一下人工智能的发展历史',
    category: 'general'
  },
  {
    id: 'general-2',
    text: '请推荐五本经典科幻小说',
    category: 'general'
  },
  {
    id: 'general-3',
    text: '帮我规划一周的健康饮食',
    category: 'general'
  },
  {
    id: 'general-4',
    text: '解释量子计算的基本原理',
    category: 'general'
  },
  {
    id: 'general-5',
    text: '分析当前全球气候变化的主要原因',
    category: 'general'
  },
  
  // 创意类
  {
    id: 'creative-1',
    text: '写一篇关于未来城市的短篇故事',
    category: 'creative'
  },
  {
    id: 'creative-2',
    text: '为我的摄影工作室起一个创意名字',
    category: 'creative'
  },
  {
    id: 'creative-3',
    text: '设计一个环保主题的活动方案',
    category: 'creative'
  },
  {
    id: 'creative-4',
    text: '写一首关于春天的短诗',
    category: 'creative'
  },
  
  // 专业类
  {
    id: 'professional-1',
    text: '撰写一份项目管理计划书模板',
    category: 'professional'
  },
  {
    id: 'professional-2',
    text: '帮我准备一份面试自我介绍',
    category: 'professional'
  },
  {
    id: 'professional-3',
    text: '分析电子商务行业的最新趋势',
    category: 'professional'
  },
  
  // 技术类
  {
    id: 'technical-1',
    text: '解释React Native中的状态管理方法',
    category: 'technical'
  },
  {
    id: 'technical-2',
    text: '编写一个简单的Python爬虫示例',
    category: 'technical'
  },
  {
    id: 'technical-3',
    text: '如何优化移动应用的性能',
    category: 'technical'
  }
];

export const getPromptsByCategory = (category: Prompt['category']): Prompt[] => {
  return prompts.filter(prompt => prompt.category === category);
};

export const getAllCategories = (): Array<{id: Prompt['category'], name: string}> => {
  return [
    { id: 'general', name: '通用' },
    { id: 'creative', name: '创意' },
    { id: 'professional', name: '专业' },
    { id: 'technical', name: '技术' }
  ];
};

export default prompts; 