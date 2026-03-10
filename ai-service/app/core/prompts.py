from datetime import datetime
from typing import List, Optional

# 系统提示词模板（增强版）
SYSTEM_PROMPT = """你是TouristAI的AI旅游助手，一位专业、贴心、友好的旅游规划专家。

🎯 你的核心能力：
1. 根据用户需求生成详细、实用、个性化的旅游攻略
2. 提供精准的景点、美食、住宿、交通推荐
3. 规划合理的行程安排和预算分配
4. 考虑季节、天气、交通、人流等实际因素
5. 提供当地文化、习俗、注意事项等实用信息
6. 给出多个备选方案，让用户灵活选择

✨ 你的特点：
- 专业：具备丰富的旅游知识和规划经验
- 贴心：关注用户需求，提供个性化建议
- 实用：给出具体可行的方案和预算
- 友好：用轻松愉快的语气交流，适当使用emoji

📝 输出要求：
- 使用Markdown格式，结构清晰、层次分明
- 包含具体的时间、地点、价格信息
- 提供多个选择方案供用户参考
- 语言友好、专业、易懂
- 考虑实际可行性和安全性
- 适当使用emoji增强可读性

📅 当前日期：{current_date}

⚠️ 重要提示：
- 价格信息仅供参考，建议用户出行前再次确认
- 考虑季节性因素（旺季/淡季价格差异）
- 提供备选方案以应对突发情况
- 标注重要的注意事项和安全提醒
- 尊重当地文化和习俗
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
    destination: str,
    days: int,
    budget: float,
    interests: List[str] = None,
    travel_type: str = "休闲游",
    companions: str = "独自",
    season: Optional[str] = None,
    special_requirements: Optional[str] = None
) -> str:
    """
    构建旅游攻略生成提示词（增强版）
    
    Args:
        destination: 目的地
        days: 旅行天数
        budget: 预算（元）
        interests: 兴趣偏好列表
        travel_type: 旅行类型（休闲游/深度游/探险游/亲子游）
        companions: 同行人员（独自/情侣/家庭/朋友）
        season: 出行季节（春/夏/秋/冬）
        special_requirements: 特殊要求
    
    Returns:
        完整的提示词
    """
    # 预算等级判断
    if budget < 3000:
        budget_level = "经济型"
        budget_desc = "注重性价比，推荐经济实惠的选择"
    elif budget < 8000:
        budget_level = "中等"
        budget_desc = "平衡品质与价格，推荐舒适的选择"
    else:
        budget_level = "高端"
        budget_desc = "追求品质体验，推荐优质的选择"
    
    # 兴趣标签
    interests_str = "、".join(interests) if interests else "无特殊偏好"
    
    # 构建提示词
    prompt = f"""请为以下旅行需求生成一份详细、实用的旅游攻略：

## 📋 基本信息
- 📍 **目的地**：{destination}
- ⏰ **行程天数**：{days}天
- 💰 **预算**：{budget}元（{budget_level}预算，{budget_desc}）
- 🎯 **兴趣偏好**：{interests_str}
- 🚶 **旅行类型**：{travel_type}
- 👥 **同行人员**：{companions}
"""
    
    if season:
        prompt += f"- 🌤️ **出行季节**：{season}\n"
    
    if special_requirements:
        prompt += f"- ⚠️ **特殊要求**：{special_requirements}\n"
    
    prompt += """
## 📝 攻略要求

请按照以下格式生成完整攻略：

### 🎯 行程概览
简要介绍整体行程安排、亮点和特色

### 📅 详细行程

#### Day 1: [主题]
- **上午**（09:00-12:00）：具体安排、景点介绍
- **中午**（12:00-13:30）：用餐推荐（餐厅名称、特色菜品、人均消费）
- **下午**（14:00-18:00）：具体安排、景点介绍
- **晚上**（18:00-22:00）：晚餐推荐、夜间活动
- **住宿**：酒店推荐（区域、价格区间、特色）

（后续每天类似格式，根据实际天数安排）

### 🏛️ 景点推荐
推荐3-5个必游景点，包含：
- 景点名称和简介
- 门票价格
- 开放时间
- 建议游玩时长
- 交通方式
- 游玩贴士

### 🍜 美食推荐
推荐3-5个当地特色美食和餐厅：
- 餐厅名称
- 特色菜品
- 人均消费
- 营业时间
- 地址和交通

### 🏨 住宿建议
推荐2-3个不同价位的住宿选择：
- 酒店名称和类型
- 价格区间
- 位置优势
- 设施特色
- 预订建议

### 🚗 交通指南
- **如何到达**：从主要城市出发的交通方式
- **市内交通**：公交、地铁、出租车、共享单车等
- **交通卡**：是否有优惠卡、如何购买
- **交通预算**：预估交通费用

### 💰 预算明细
详细列出各项开支：
- 🚄 交通：XX元（往返+市内）
- 🏨 住宿：XX元（XX元/晚 × X晚）
- 🍜 餐饮：XX元（XX元/天 × X天）
- 🎫 门票：XX元（各景点门票）
- 🛍️ 购物：XX元（纪念品、特产）
- 💡 其他：XX元（保险、应急等）
- **总计**：XX元

### 📝 实用贴士
- 🌤️ **最佳旅行时间**：推荐月份和原因
- ⚠️ **注意事项**：安全提醒、文化禁忌
- 🎒 **必备物品**：根据季节和目的地推荐
- 📞 **紧急联系**：当地报警、医疗、使领馆电话
- 💡 **省钱技巧**：优惠信息、避坑指南

请确保攻略内容详实、实用，符合用户的预算和兴趣偏好，并提供多个备选方案。
"""
    
    return prompt

def build_followup_prompt(
    original_guide: str,
    user_feedback: str
) -> str:
    """
    构建追问优化提示词（增强版）
    用于根据用户反馈优化攻略
    
    Args:
        original_guide: 原始攻略内容
        user_feedback: 用户反馈
    
    Returns:
        优化提示词
    """
    return f"""请基于用户反馈优化以下旅游攻略：

## 📄 原始攻略
{original_guide[:1000]}...

## 💬 用户反馈
{user_feedback}

## 📝 优化要求
1. 仔细理解用户的反馈和需求
2. 针对性地调整相关部分
3. 保持攻略的整体结构和格式
4. 确保修改后的内容更符合用户期望
5. 如果用户要求增加内容，请详细补充
6. 如果用户要求删减内容，请合理精简

请输出优化后的完整攻略。
"""

def build_quick_question_prompt(
    question: str,
    context: Optional[str] = None
) -> str:
    """
    构建快速问答提示词（增强版）
    用于回答用户的具体问题
    
    Args:
        question: 用户问题
        context: 上下文信息（可选）
    
    Returns:
        问答提示词
    """
    prompt = f"""请简洁、专业地回答以下旅游相关问题：

## ❓ 用户问题
{question}
"""
    
    if context:
        prompt += f"""
## 📋 相关背景
{context}
"""
    
    prompt += """
## 📝 回答要求
- 直接回答问题，重点突出
- 提供具体、实用的信息
- 1-3段话即可，避免冗长
- 如有必要，给出多个选择
- 适当使用emoji增强可读性

请开始回答：
"""
    
    return prompt

def build_destination_intro_prompt(destination: str) -> str:
    """
    构建目的地介绍提示词
    
    Args:
        destination: 目的地名称
    
    Returns:
        介绍提示词
    """
    return f"""请简要介绍旅游目的地：{destination}

包含以下内容：
- 🌍 地理位置和气候特点
- 🏛️ 主要景点和特色
- 🍜 特色美食
- 🎭 文化特色
- 🌤️ 最佳旅行时间
- 💰 大致消费水平

请用2-3段话简洁介绍，适当使用emoji。
"""

def build_itinerary_adjustment_prompt(
    original_itinerary: str,
    adjustment_request: str
) -> str:
    """
    构建行程调整提示词
    
    Args:
        original_itinerary: 原始行程
        adjustment_request: 调整要求
    
    Returns:
        调整提示词
    """
    return f"""请调整以下旅游行程：

## 📅 原始行程
{original_itinerary}

## 🔄 调整要求
{adjustment_request}

请输出调整后的行程安排，保持格式一致。
"""

# Prompt模板版本
PROMPT_VERSION = "2.0"

# 支持的旅行类型
TRAVEL_TYPES = [
    "休闲游",
    "深度游",
    "探险游",
    "亲子游",
    "蜜月游",
    "商务游",
    "摄影游",
    "美食游",
    "文化游",
    "自驾游"
]

# 支持的同行人类型
COMPANION_TYPES = [
    "独自",
    "情侣",
    "家庭",
    "朋友",
    "团队"
]
