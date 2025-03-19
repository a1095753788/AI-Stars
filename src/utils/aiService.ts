// AI 服务工具
import { ApiRequest, ApiResponse, Message } from '../types/api';

/**
 * 发送消息到AI服务
 * @param request API请求参数
 * @returns 返回API响应
 */
export const sendMessageToAI = async (request: ApiRequest): Promise<ApiResponse> => {
  try {
    // 这里是模拟API调用，实际实现需要使用axios等库发送请求
    console.log('发送消息到AI服务:', request);
    
    // 模拟响应
    return {
      message: '这是AI的回复消息。当实际集成API时，这里将返回真实的AI响应。'
    };
  } catch (error) {
    console.error('发送消息到AI服务失败:', error);
    return {
      message: '',
      error: `发送消息失败: ${error instanceof Error ? error.message : '未知错误'}`
    };
  }
};

/**
 * 格式化消息以发送到不同的AI服务
 * @param messages 消息历史
 * @param model AI模型名称
 * @returns 格式化后的消息
 */
export const formatMessagesForModel = (messages: Message[], model: string): any => {
  // 根据不同的模型格式化消息
  switch (model.toLowerCase()) {
    case 'gpt':
      return messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
    case 'claude':
      // Claude可能有不同的格式要求
      return messages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }));
    case 'gemini':
      // Gemini可能有不同的格式要求
      return messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));
    // 其他模型的格式化...
    default:
      return messages;
  }
}; 