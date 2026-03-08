from openai import AsyncOpenAI
from typing import AsyncGenerator, List, Dict, Optional
import json
import logging
from app.core.config import settings
from app.core.prompts import get_system_prompt

logger = logging.getLogger(__name__)

class OpenAIService:
    """
    OpenAI服务封装
    处理与OpenAI API的交互，支持流式输出
    """
    
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.model = settings.openai_model
        self.max_tokens = settings.max_tokens
        
    async def stream_chat(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: Optional[int] = None
    ) -> AsyncGenerator[str, None]:
        """
        流式对话生成
        
        Args:
            messages: 对话历史消息列表
            temperature: 温度参数，控制随机性 (0-2)
            max_tokens: 最大token数
            
        Yields:
            SSE格式的数据流
        """
        try:
            # 构建完整的消息列表（系统提示词 + 用户消息）
            full_messages = [
                {"role": "system", "content": get_system_prompt()}
            ] + messages
            
            # 限制历史消息长度，避免超出token限制
            if len(full_messages) > 10:
                full_messages = [full_messages[0]] + full_messages[-9:]
            
            logger.info(f"开始流式对话，消息数: {len(full_messages)}, 模型: {self.model}")
            
            # 调用OpenAI API
            stream = await self.client.chat.completions.create(
                model=self.model,
                messages=full_messages,
                temperature=temperature,
                max_tokens=max_tokens or self.max_tokens,
                stream=True
            )
            
            # 流式输出
            total_tokens = 0
            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    total_tokens += len(content)
                    
                    # 返回SSE格式数据
                    yield f"data: {json.dumps({'content': content}, ensure_ascii=False)}\n\n"
            
            logger.info(f"对话完成，总字符数: {total_tokens}")
            yield "data: [DONE]\n\n"
            
        except Exception as e:
            error_msg = str(e)
            logger.error(f"OpenAI API错误: {error_msg}")
            
            # 返回友好的错误信息
            if "rate_limit" in error_msg.lower():
                error_msg = "请求过于频繁，请稍后再试"
            elif "insufficient_quota" in error_msg.lower():
                error_msg = "API配额不足，请联系管理员"
            elif "invalid_api_key" in error_msg.lower():
                error_msg = "API密钥无效"
            else:
                error_msg = "AI服务暂时不可用，请稍后再试"
            
            yield f"data: {json.dumps({'error': error_msg}, ensure_ascii=False)}\n\n"
    
    async def generate_guide(
        self,
        destination: str,
        days: int,
        budget: float,
        interests: List[str] = None
    ) -> AsyncGenerator[str, None]:
        """
        生成旅游攻略
        
        Args:
            destination: 目的地
            days: 旅行天数
            budget: 预算
            interests: 兴趣偏好列表
            
        Yields:
            SSE格式的数据流
        """
        from app.core.prompts import build_travel_prompt
        
        # 构建提示词
        prompt = build_travel_prompt(
            destination=destination,
            days=days,
            budget=budget,
            interests=interests
        )
        
        # 调用流式对话
        messages = [{"role": "user", "content": prompt}]
        async for chunk in self.stream_chat(messages, temperature=0.7):
            yield chunk

# 单例模式
openai_service = OpenAIService()
