// API服务
// 注意：实际使用需要导入axios

import { ApiConfig, ApiRequest, ApiResponse, Message } from '../types/api';
import { formatMessagesForModel } from '../utils/aiService';

/**
 * 发送请求的参数接口
 */
export interface SendMessageParams {
  messages: Message[];
  apiKey: string;
  endpoint: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * 发送消息到OpenAI API
 * @param messages 消息历史
 * @param apiConfig API配置
 * @returns API响应
 */
export const sendMessageToOpenAI = async (
  messages: Message[],
  apiConfig: ApiConfig
): Promise<ApiResponse> => {
  try {
    console.log(`发送消息到OpenAI API: ${apiConfig.endpoint}, 模型: ${apiConfig.model}`);
    
    // 实际实现中使用以下代码：
    // const formattedMessages = formatMessagesForModel(messages, 'gpt');
    //
    // const response = await axios.post(
    //   apiConfig.endpoint,
    //   {
    //     model: apiConfig.model,
    //     messages: formattedMessages,
    //     temperature: 0.7,
    //     max_tokens: 2000,
    //     top_p: 1,
    //     frequency_penalty: 0,
    //     presence_penalty: 0
    //   },
    //   {
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${apiConfig.apiKey}`
    //     }
    //   }
    // );
    //
    // return {
    //   message: response.data.choices[0].message.content
    // };
    
    // 模拟API响应
    return {
      message: '这是来自OpenAI API的模拟响应。实际集成时将返回真实的API响应。'
    };
  } catch (error: any) {
    console.error('OpenAI API请求失败:', error);
    return {
      message: '',
      error: error.response?.data?.error?.message || error.message || '未知错误'
    };
  }
};

/**
 * 发送消息到Claude API
 * @param messages 消息历史
 * @param apiConfig API配置
 * @returns API响应
 */
export const sendMessageToClaude = async (
  messages: Message[],
  apiConfig: ApiConfig
): Promise<ApiResponse> => {
  try {
    console.log(`发送消息到Claude API: ${apiConfig.endpoint}, 模型: ${apiConfig.model}`);
    
    // 实际实现中使用以下代码：
    // const formattedMessages = formatMessagesForModel(messages, 'claude');
    //
    // const response = await axios.post(
    //   apiConfig.endpoint,
    //   {
    //     model: apiConfig.model,
    //     messages: formattedMessages,
    //     max_tokens: 2000,
    //     temperature: 0.7
    //   },
    //   {
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'x-api-key': apiConfig.apiKey,
    //       'anthropic-version': '2023-06-01'
    //     }
    //   }
    // );
    //
    // return {
    //   message: response.data.content[0].text
    // };
    
    // 模拟API响应
    return {
      message: '这是来自Claude API的模拟响应。实际集成时将返回真实的API响应。'
    };
  } catch (error: any) {
    console.error('Claude API请求失败:', error);
    return {
      message: '',
      error: error.response?.data?.error?.message || error.message || '未知错误'
    };
  }
};

/**
 * 发送消息到Gemini API
 * @param messages 消息历史
 * @param apiConfig API配置
 * @returns API响应
 */
export const sendMessageToGemini = async (
  messages: Message[],
  apiConfig: ApiConfig
): Promise<ApiResponse> => {
  try {
    console.log(`发送消息到Gemini API: ${apiConfig.endpoint}, 模型: ${apiConfig.model}`);
    
    // 实际实现中使用以下代码：
    // const formattedMessages = formatMessagesForModel(messages, 'gemini');
    //
    // const response = await axios.post(
    //   `${apiConfig.endpoint}?key=${apiConfig.apiKey}`,
    //   {
    //     contents: formattedMessages,
    //     generationConfig: {
    //       temperature: 0.7,
    //       maxOutputTokens: 2000,
    //       topP: 0.95
    //     }
    //   },
    //   {
    //     headers: {
    //       'Content-Type': 'application/json'
    //     }
    //   }
    // );
    //
    // return {
    //   message: response.data.candidates[0].content.parts[0].text
    // };
    
    // 模拟API响应
    return {
      message: '这是来自Gemini API的模拟响应。实际集成时将返回真实的API响应。'
    };
  } catch (error: any) {
    console.error('Gemini API请求失败:', error);
    return {
      message: '',
      error: error.response?.data?.error?.message || error.message || '未知错误'
    };
  }
};

/**
 * 发送文本消息到API
 * @param params 请求参数
 * @returns API响应
 */
export const sendMessageToAPI = async (params: SendMessageParams): Promise<ApiResponse> => {
  // 实际应用中，这里应该调用实际的API
  // 例如：使用fetch或axios发送请求
  
  try {
    console.log('发送消息到API:', {
      endpoint: params.endpoint,
      model: params.model,
      messageCount: params.messages.length
    });
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 检查是否提供了必要的参数
    if (!params.apiKey || !params.endpoint || !params.model) {
      return {
        error: '缺少必要的API参数（API密钥、端点或模型）'
      };
    }
    
    // 模拟API响应
    const lastMessage = params.messages[params.messages.length - 1];
    
    // 根据最后一条消息内容生成模拟回复
    let response = '';
    if (lastMessage.content.includes('你好') || lastMessage.content.includes('嗨') || lastMessage.content.includes('hi')) {
      response = '你好！我是AI助手，有什么可以帮助你的？';
    } else if (lastMessage.content.includes('天气')) {
      response = '我无法获取实时天气信息，但我可以解释天气原理或帮你了解天气预报的解读方法。';
    } else if (lastMessage.content.includes('帮助') || lastMessage.content.includes('help')) {
      response = '我可以回答问题、提供信息、进行对话，甚至可以帮你写代码或者分析数据。请告诉我你需要什么帮助？';
    } else {
      response = `我收到了你的消息："${lastMessage.content}"。这是一个模拟回复，实际集成API后会返回真实的AI回复。`;
    }
    
    return {
      message: response
    };
  } catch (error) {
    console.error('API请求失败:', error);
    return {
      error: '发送消息失败，请检查网络连接或API配置'
    };
  }
};

/**
 * 发送带图片的消息到API
 * @param params 消息参数
 * @param imageBase64 图片的Base64编码
 * @returns API响应
 */
export const sendImageMessageToAPI = async (
  params: SendMessageParams,
  imageBase64: string
): Promise<ApiResponse> => {
  // 实际应用中，这里应该调用支持图片分析的API
  // 例如：使用OpenAI的vision模型或其他多模态API
  
  try {
    console.log('发送图片消息到API:', {
      endpoint: params.endpoint,
      model: params.model,
      imageSize: imageBase64.length
    });
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 检查是否提供了必要的参数
    if (!params.apiKey || !params.endpoint || !params.model) {
      return {
        error: '缺少必要的API参数（API密钥、端点或模型）'
      };
    }
    
    // 检查图片是否有效
    if (!imageBase64 || !imageBase64.startsWith('data:image')) {
      return {
        error: '无效的图片数据'
      };
    }
    
    // 模拟图片分析的API响应
    return {
      message: '我看到了这张图片。这是一个模拟回复，实际集成多模态API后将分析图片内容并给出更准确的回复。'
    };
  } catch (error) {
    console.error('图片API请求失败:', error);
    return {
      error: '发送图片失败，请检查网络连接或API配置'
    };
  }
};

/**
 * 检查API配置是否有效
 * @param apiKey API密钥
 * @param endpoint API端点
 * @returns 是否有效
 */
export const validateApiConfig = async (apiKey: string, endpoint: string): Promise<boolean> => {
  try {
    console.log('验证API配置:', { endpoint });
    
    // 模拟验证延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 简单验证
    if (!apiKey || apiKey.length < 8) {
      return false;
    }
    
    if (!endpoint || !endpoint.startsWith('http')) {
      return false;
    }
    
    // 实际应用中，这里应该尝试发送一个简单请求验证配置
    return true;
  } catch (error) {
    console.error('API配置验证失败:', error);
    return false;
  }
}; 