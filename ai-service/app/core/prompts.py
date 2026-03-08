from datetime import datetime
from typing import List, Optional

# 系统提示词模板
SYSTEM_PROMPT = """你是一个专业的旅游规划助手，名字叫"TouristAI"。

你的职责：
1. 根据用户需求生成详细、实用的旅游攻略
2. 提供个性化的景点、美食、住宿推荐
3. 规划合理的行程安排和预算分配
4. 考虑季节、天气、交通等实际因素
5. 提供当地文化、注意事项等实用信息

输出要求：
- 使用Markdown格式，结构清晰
- 包含具体的时间、地点、价格信息
- 提供多个选择方案供用户参考
- 语言友好、专业、易懂
- 考虑实际可行性和安全性

当前日期：{current_date}

注意事项：
- 价格信息仅供参考，建议用户出行前再次确认
- 考虑季节性因素（旺季/淡季）
- 提供备选方案
- 标注重要的注意事项
"""

def get_system_prompt() -> str:
    """
    获取系统提示词
    自动填充当前日期
    
    Returns:
        格式化后的系统提示词
    """
    return SYSTEM_PROMPT.format(
        current_date=datetime.now().strftime("%Y年%m月%d日")
    )

def build_travel_prompt(
    destination: str = None, 
    days: int = None, 
    budget: float = None,
    interests: List[str] = None,
    travel_type: str = None,
    companions: str = None
) -> str:
    """
    构建旅游攻略生成提示词
    
    Args:
        destination: 目的地
        days: 旅行天数
        budget: 预算（元）
        interests: 兴趣偏好列表
        travel_type: 旅行类型（休闲/深度/冒险等）
        companions: 同行人员（独自/情侣/家庭/朋友）
    
    Returns:
        完整的提示词
    """
    parts = ["请为以下旅行需求生成详细攻略：\n"]
    
    # 基本信息
    if destination:
        parts.append(f"📍 目的地：{destination}")
    if days:
        parts.append(f"⏰ 旅行天数：{days}天")
    if budget:
        parts.append(f"💰 预算：{budget}元")
    
    # 偏好信息
    if interests:
        parts.append(f"❤️ 兴趣偏好：{', '.join(interests)}")
    if travel_type:
        parts.append(f"🎯 旅行类型：{travel_type}")
    if companions:
        parts.append(f"👥 同行人员：{companions}")
    
    # 攻略要求
    parts.append("\n请生成包含以下内容的完整攻略：")
    parts.append("1. 📋 行程概览")
    parts.append("2. 📅 每日详细安排（时间、地点、活动）")
    parts.append("3. 🏛️ 推荐景点（含门票、开放时间、游玩时长）")
    parts.append("4. 🍜 美食推荐（特色菜品、人均消费）")
    parts.append("5. 🏨 住宿建议（区域选择、价格区间）")
    parts.append("6. 🚗 交通方案（城际交通、市内交通）")
    parts.append("7. 💵 预算明细（分项预算、总计）")
    parts.append("8. ⚠️ 注意事项（天气、安全、文化禁忌等）")
    
    return "\n".join(parts)

def build_followup_prompt(
    original_guide: str,
    user_feedback: str
) -> str:
    """
    构建追问优化提示词
    用于根据用户反馈优化攻略
    
    Args:
        original_guide: 原始攻略内容
        user_feedback: 用户反馈
    
    Returns:
        优化提示词
    """
    return f"""基于以下原始攻略和用户反馈，请优化攻略内容：

原始攻略：
{original_guide[:500]}...

用户反馈：
{user_feedback}

请根据用户反馈调整攻略，保持其他部分不变。
"""

def build_quick_question_prompt(question: str, context: str = None) -> str:
    """
    构建快速问答提示词
    用于回答用户的具体问题
    
    Args:
        question: 用户问题
        context: 上下文信息（可选）
    
    Returns:
        问答提示词
    """
    if context:
        return f"""基于以下上下文，回答用户问题：

上下文：
{context}

用户问题：
{question}

请简洁明了地回答，提供实用信息。
"""
    else:
        return f"""请回答以下旅游相关问题：

{question}

请提供专业、实用的建议。
"""
