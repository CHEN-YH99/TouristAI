from openai import AsyncOpenAI, OpenAIError
from typing import AsyncGenerator, List, Dict, Optional
import json
import logging
import asyncio
from app.core.config import settings
from app.core.prompts import get_system_prompt, build_travel_prompt

logger = logging.getLogger(__name__)

class OpenAIService:
    """
    OpenAI服务封装（增强版）
    
    功能特性：
    - 流式对话生成
    - 自动重试机制（最多3次）
    - 完善的错误处理
    - 消息数量限制（最多10条）
    - Token使用统计
    - 超时控制
    - 日志记录
    """
    
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.model = settings.openai_model
        self.max_tokens = settings.max_tokens
        self.max_retries = 3
        self.timeout = 30  # 30秒超时
        self.max_messages = 10  # 最多保留10条消息
        
    async def stream_chat(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        retry_count: int = 0
    ) -> AsyncGenerator[str, None]:
        """
        流式对话生成
        
        Args:
            messages: 对话历史消息列表
            temperature: 温度参数，控制随机性 (0-2)
            max_tokens: 最大token数
            retry_count: 当前重试次数
            
        Yields:
            SSE格式的数据流
        """
        try:
            # 构建完整的消息列表（系统提示词 + 用户消息）
            full_messages = [
                {"role": "system", "content": get_system_prompt()}
            ] + messages
            
            # 限制历史消息长度，避免超出token限制
            if len(full_messages) > self.max_messages + 1:  # +1 for system message
                logger.warning(f"消息数量超过{self.max_messages}条，已截取最后{self.max_messages}条")
                full_messages = [full_messages[0]] + full_messages[-(self.max_messages):]
            
            logger.info(f"开始流式对话 [重试: {retry_count}/{self.max_retries}]")
            logger.info(f"参数: 消息数={len(full_messages)}, 模型={self.model}, 温度={temperature}")
            
            # 创建超时任务
            async def create_stream():
                return await self.client.chat.completions.create(
                    model=self.model,
                    messages=full_messages,
                    temperature=temperature,
                    max_tokens=max_tokens or self.max_tokens,
                    stream=True,
                    timeout=self.timeout
                )
            
            # 执行请求（带超时）
            stream = await asyncio.wait_for(
                create_stream(),
                timeout=self.timeout
            )
            
            # 流式输出
            total_chars = 0
            chunk_count = 0
            
            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    total_chars += len(content)
                    chunk_count += 1
                    
                    # 返回SSE格式数据
                    yield f"data: {json.dumps({'content': content}, ensure_ascii=False)}\n\n"
            
            logger.info(f"对话完成: 总字符数={total_chars}, 数据块数={chunk_count}")
            yield "data: [DONE]\n\n"
            
        except asyncio.TimeoutError:
            error_msg = "请求超时，请稍后重试"
            logger.error(f"请求超时 [重试: {retry_count}/{self.max_retries}]")
            
            # 重试逻辑
            if retry_count < self.max_retries:
                logger.info(f"正在重试... ({retry_count + 1}/{self.max_retries})")
                await asyncio.sleep(2 ** retry_count)  # 指数退避
                async for chunk in self.stream_chat(
                    messages, temperature, max_tokens, retry_count + 1
                ):
                    yield chunk
            else:
                yield f"data: {json.dumps({'error': error_msg}, ensure_ascii=False)}\n\n"
                
        except OpenAIError as e:
            error_msg = str(e)
            logger.error(f"OpenAI API错误: {error_msg} [重试: {retry_count}/{self.max_retries}]")
            
            # 判断是否可以重试
            is_retryable = any(keyword in error_msg.lower() for keyword in [
                'timeout', 'connection', 'network', 'temporary'
            ])
            
            if is_retryable and retry_count < self.max_retries:
                logger.info(f"错误可重试，正在重试... ({retry_count + 1}/{self.max_retries})")
                await asyncio.sleep(2 ** retry_count)  # 指数退避
                async for chunk in self.stream_chat(
                    messages, temperature, max_tokens, retry_count + 1
                ):
                    yield chunk
            else:
                # 返回友好的错误信息
                if "rate_limit" in error_msg.lower():
                    error_msg = "请求过于频繁，请稍后再试"
                elif "insufficient_quota" in error_msg.lower():
                    error_msg = "API配额不足，请联系管理员"
                elif "invalid_api_key" in error_msg.lower():
                    error_msg = "API密钥无效，请联系管理员"
                elif "model_not_found" in error_msg.lower():
                    error_msg = "AI模型不可用"
                else:
                    error_msg = "AI服务暂时不可用，请稍后再试"
                
                logger.error(f"最终错误: {error_msg}")
                yield f"data: {json.dumps({'error': error_msg}, ensure_ascii=False)}\n\n"
                
        except Exception as e:
            error_msg = f"服务异常: {str(e)}"
            logger.error(f"未知错误: {error_msg}", exc_info=True)
            yield f"data: {json.dumps({'error': '服务异常，请稍后再试'}, ensure_ascii=False)}\n\n"
    
    async def generate_guide(
        self,
        destination: str,
        days: int,
        budget: float,
        interests: Optional[List[str]] = None,
        travel_type: str = "休闲游",
        companions: str = "独自",
        season: Optional[str] = None,
        special_requirements: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """
        生成旅游攻略（增强版）
        
        Args:
            destination: 目的地
            days: 旅行天数
            budget: 预算（元）
            interests: 兴趣偏好列表
            travel_type: 旅行类型（休闲游/深度游/探险游）
            companions: 同行人（独自/情侣/家庭/朋友）
            season: 出行季节
            special_requirements: 特殊要求
            
        Yields:
            SSE格式的数据流
        """
        logger.info(f"生成攻略请求: 目的地={destination}, 天数={days}, 预算={budget}")
        
        # 参数验证
        if not destination or destination.strip() == "":
            yield f"data: {json.dumps({'error': '目的地不能为空'}, ensure_ascii=False)}\n\n"
            return
            
        if days < 1 or days > 30:
            yield f"data: {json.dumps({'error': '旅行天数应在1-30天之间'}, ensure_ascii=False)}\n\n"
            return
            
        if budget < 0:
            yield f"data: {json.dumps({'error': '预算不能为负数'}, ensure_ascii=False)}\n\n"
            return
        
        # 构建提示词
        prompt = build_travel_prompt(
            destination=destination,
            days=days,
            budget=budget,
            interests=interests or [],
            travel_type=travel_type,
            companions=companions,
            season=season,
            special_requirements=special_requirements
        )
        
        # 调用流式对话
        messages = [{"role": "user", "content": prompt}]
        async for chunk in self.stream_chat(messages, temperature=0.7):
            yield chunk
    
    async def quick_question(
        self,
        question: str,
        context: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """
        快速问答
        
        Args:
            question: 用户问题
            context: 上下文信息（可选）
            
        Yields:
            SSE格式的数据流
        """
        from app.core.prompts import build_quick_question_prompt
        
        logger.info(f"快速问答: {question[:50]}...")
        
        if not question or question.strip() == "":
            yield f"data: {json.dumps({'error': '问题不能为空'}, ensure_ascii=False)}\n\n"
            return
        
        prompt = build_quick_question_prompt(question, context)
        messages = [{"role": "user", "content": prompt}]
        
        async for chunk in self.stream_chat(messages, temperature=0.5):
            yield chunk
    
    async def optimize_guide(
        self,
        original_guide: str,
        user_feedback: str
    ) -> AsyncGenerator[str, None]:
        """
        优化攻略（基于用户反馈）
        
        Args:
            original_guide: 原始攻略内容
            user_feedback: 用户反馈
            
        Yields:
            SSE格式的数据流
        """
        from app.core.prompts import build_followup_prompt
        
        logger.info(f"优化攻略: 反馈={user_feedback[:50]}...")
        
        if not original_guide or not user_feedback:
            yield f"data: {json.dumps({'error': '原始攻略和反馈不能为空'}, ensure_ascii=False)}\n\n"
            return
        
        prompt = build_followup_prompt(original_guide, user_feedback)
        messages = [{"role": "user", "content": prompt}]
        
        async for chunk in self.stream_chat(messages, temperature=0.7):
            yield chunk
    
    def get_token_estimate(self, text: str) -> int:
        """
        估算文本的token数量
        粗略估算：中文约1.5字符/token，英文约4字符/token
        
        Args:
            text: 文本内容
            
        Returns:
            估算的token数量
        """
        chinese_chars = sum(1 for c in text if '\u4e00' <= c <= '\u9fff')
        other_chars = len(text) - chinese_chars
        
        return int(chinese_chars / 1.5 + other_chars / 4)

# 单例模式
openai_service = OpenAIService()
