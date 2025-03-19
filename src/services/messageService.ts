import { Message } from '../types/state';

/**
 * 发送消息参数接口
 */
interface SendMessageParams {
  messages: Message[];
  apiConfig: {
    apiKey: string;
    endpoint: string;
    model: string;
  };
}

/**
 * 消息响应接口
 */
interface MessageResponse {
  content: string;
  error?: string;
}

/**
 * 将消息历史转换为API请求格式
 * @param messages 消息历史
 * @returns 转换后的消息历史
 */
const formatMessagesForAPI = (messages: Message[]) => {
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));
};

/**
 * 发送消息到AI API
 * @param params 发送消息参数
 * @returns 消息响应
 */
export const sendMessage = async (params: SendMessageParams): Promise<MessageResponse> => {
  const { messages, apiConfig } = params;
  
  try {
    // 开发阶段使用模拟响应
    if (process.env.NODE_ENV === 'development') {
      return mockSendMessage(messages);
    }
    
    // 将消息转换为API需要的格式
    const formattedMessages = formatMessagesForAPI(messages);
    
    // 检查API配置
    if (!apiConfig.apiKey) {
      throw new Error('API密钥未配置');
    }
    
    // 准备请求参数
    const requestBody = {
      model: apiConfig.model,
      messages: formattedMessages,
      temperature: 0.7
    };
    
    // 发送请求
    const response = await fetch(apiConfig.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiConfig.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    
    // 检查响应
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || '请求失败');
    }
    
    // 解析响应
    const data = await response.json();
    
    return {
      content: data.choices[0].message.content
    };
  } catch (error) {
    console.error('发送消息失败:', error);
    return {
      content: '',
      error: error instanceof Error ? error.message : '发送消息失败'
    };
  }
};

/**
 * 模拟发送消息(开发阶段使用)
 * @param messages 消息历史
 * @returns 模拟的消息响应
 */
const mockSendMessage = async (messages: Message[]): Promise<MessageResponse> => {
  return new Promise(resolve => {
    setTimeout(() => {
      // 获取最后一条用户消息
      const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
      
      if (!lastUserMessage) {
        resolve({
          content: '我没有收到任何消息。请告诉我您想了解什么？'
        });
        return;
      }
      
      const content = lastUserMessage.content;
      
      // 根据用户消息内容生成不同的回复
      if (content.includes('你好') || content.includes('嗨') || content.includes('hi') || content.includes('hello')) {
        resolve({
          content: '你好！我是AI助手，很高兴为你服务。请问有什么我可以帮助你的吗？'
        });
      } else if (content.includes('时间') || content.includes('日期')) {
        const now = new Date();
        resolve({
          content: `现在的时间是 ${now.toLocaleTimeString()}, 日期是 ${now.toLocaleDateString()}`
        });
      } else if (content.includes('功能') || content.includes('能做什么')) {
        resolve({
          content: '我可以回答问题、提供信息、讨论各种话题、生成创意内容等。我还支持图片和文件处理，以及语音朗读功能。'
        });
      } else if (content.includes('图片')) {
        resolve({
          content: '我看到你提到了图片。您可以使用左下角的图片上传按钮来发送图片，我会尽力描述或分析图片内容。'
        });
      } else if (content.includes('文件')) {
        resolve({
          content: '关于文件，您可以使用左下角的文件上传按钮来发送文件，我会尽力处理文件内容。'
        });
      } else {
        // 默认回复
        const responses = [
          `我理解你说的是关于"${content.substring(0, 20)}${content.length > 20 ? '...' : ''}"的内容。在实际应用中，我会根据你的问题提供详细回答。`,
          '这是一个模拟回复。在实际应用中，我会连接到AI API并提供更详细、准确的回答。',
          '谢谢你的提问！这是开发阶段的模拟回复。实际部署时，我会通过API连接到强大的AI模型来回答问题。',
          '我注意到了你的问题。这是一个模拟环境，所以我提供的是预设回复。实际应用中会有更智能的响应。'
        ];
        
        const randomIndex = Math.floor(Math.random() * responses.length);
        resolve({
          content: responses[randomIndex]
        });
      }
    }, 1000); // 模拟网络延迟
  });
};

/**
 * 处理图片消息
 * @param base64Image Base64编码的图片
 * @param prompt 提示词
 * @param apiConfig API配置
 * @returns 消息响应
 */
export const processImageMessage = async (
  base64Image: string, 
  prompt: string, 
  apiConfig: any
): Promise<MessageResponse> => {
  // 开发阶段使用模拟响应
  if (true) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          content: '我收到了您的图片。这是一个模拟回复，实际部署时，我会分析图片内容并提供相关回复。'
        });
      }, 1500);
    });
  }
  
  // 实际实现会调用支持图像分析的API
  // 此处省略实际API调用代码
};

/**
 * 处理文件消息
 * @param fileInfo 文件信息
 * @param prompt 提示词
 * @param apiConfig API配置
 * @returns 消息响应
 */
export const processFileMessage = async (
  fileInfo: { uri: string; name: string; type: string; }, 
  prompt: string, 
  apiConfig: any
): Promise<MessageResponse> => {
  // 开发阶段使用模拟响应
  if (true) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          content: `我收到了您的文件 "${fileInfo.name}"。这是一个模拟回复，实际部署时，我会分析文件内容并提供相关回复。`
        });
      }, 1500);
    });
  }
  
  // 实际实现会调用支持文件分析的API
  // 此处省略实际API调用代码
}; 