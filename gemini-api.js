// Gemini API 集成 - 获取每周新的动物小知识

// ===== 配置 =====
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "your-api-key";  // 从环境变量读取
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

// 100 个常见动物列表
const ANIMALS_100 = [
  "企鹅", "章鱼", "海獭", "树懒", "奶牛", "火烈鸟", "蜂鸟", "乌鸦", "考拉", "大象",
  "斑马", "蜗牛", "狮子", "老虎", "熊猫", "长颈鹿", "猴子", "鹦鹉", "鹰", "鲨鱼",
  "海豚", "鲸鱼", "企鹅", "北极熊", "狐狸", "松鼠", "兔子", "鹿", "羊", "牛",
  "马", "驴", "猪", "鸡", "鸭", "鹅", "火鸡", "孔雀", "蛇", "蜥蜴",
  "乌龟", "青蛙", "蟾蜍", "蜘蛛", "蝎子", "蚂蚁", "蜜蜂", "蝴蝶", "蜻蜓", "瓢虫",
  "螳螂", "甲虫", "蟑螂", "蝗虫", "蟋蟀", "金鱼", "锦鲤", "比目鱼", "河豚", "海马",
  "章鱼", "乌贼", "贝壳", "螃蟹", "虾", "龙虾", "海星", "海胆", "海参", "海绵",
  "水母", "珊瑚", "鳐鱼", "锯鳐", "剑鱼", "旗鱼", "金枪鱼", "鲶鱼", "鲈鱼", "鳟鱼",
  "鲑鱼", "鳗鱼", "泥鳅", "鲶鱼", "鲸鲨", "灰鲭鱼", "沙丁鱼", "凤尾鱼", "鳕鱼", "比目鱼",
  "狼", "豺", "豹", "猎豹", "美洲豹", "山狮", "鬣狗", "狞猫", "猞猁", "土狼"
];

// ===== 工具函数 =====

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function validateFact(fact) {
  if (!fact.animal || !fact.fact || !Array.isArray(fact.panels) || fact.panels.length !== 4) {
    return false;
  }

  for (const panel of fact.panels) {
    if (!panel.scene || !Array.isArray(panel.cast) || !panel.text) {
      return false;
    }
  }

  return true;
}

// ===== 主函数：从 Gemini 一次获取多个知识（带重试机制） =====
async function getMultipleFactsFromGemini(count = 5) {
  const selectedAnimals = [];
  for (let i = 0; i < count; i++) {
    let animal;
    do {
      animal = randomFrom(ANIMALS_100);
    } while (selectedAnimals.includes(animal));
    selectedAnimals.push(animal);
  }

  const animalsList = selectedAnimals.join("、");

  const prompt = `你是一个儿童教育专家和漫画编剧。

任务：为以下${count}种动物各创建一个有趣的4格漫画故事，包含关于该动物的小知识。
动物列表：${animalsList}

要求：
1. 每个动物一个知识：关于该动物的一个有趣、真实的小知识，100-150字左右
2. 每个动物4个漫画面板，每个面板包含：
   - scene：场景（可选值：sea, grass, forest, snow, lake, room, savanna, sunny, rain, night）
   - cast：角色数组，格式为 ["角色名 表情"]，表情可以是 normal, happy, sad, angry, surprised
   - text：该格的对话或描述（20-50字）
   - caption：可选的标题或旁白

返回格式（严格遵循，返回一个 JSON 数组）：
[
  {
    "animal": "动物名1",
    "fact": "小知识内容",
    "panels": [
      {
        "scene": "场景名",
        "cast": ["角色 表情"],
        "text": "第一格的对话",
        "caption": "标题"
      },
      ...共4个面板
    ]
  },
  ...共${count}个动物
]

重要：只返回 JSON 数组，不要有其他文本。`;

  // 重试配置：最多重试 3 次，指数退避
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`   尝试 ${attempt}/${maxRetries}...`);

      // 构建请求体（每次重试都需要重新构建，避免 Body is unusable）
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 8000,
          topP: 0.95,
          topK: 40,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE",
          },
        ],
      };

      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        const errorMsg = error.error?.message || response.statusText;

        // 检查是否是高负载错误（可以重试）
        if (errorMsg.includes("high demand") || response.status === 503) {
          lastError = new Error(`API 高负载 (503): ${errorMsg}`);

          if (attempt < maxRetries) {
            const waitTime = Math.pow(2, attempt) * 1000;
            console.log(`   ⏳ 等待 ${waitTime / 1000} 秒后重试...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
        } else {
          // 非高负载错误，直接抛出
          throw new Error(`Gemini API 错误: ${errorMsg}`);
        }
      }

      const data = await response.json();

      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error("API 返回格式异常");
      }

      const responseText = data.candidates[0].content.parts[0].text;

      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error("原始响应:", responseText);
        throw new Error("无法从 API 响应中解析 JSON 数组");
      }

      const facts = JSON.parse(jsonMatch[0]);

      if (!Array.isArray(facts)) {
        throw new Error("API 返回不是数组格式");
      }

      const validFacts = [];
      for (const fact of facts) {
        if (validateFact(fact)) {
          validFacts.push(fact);
          console.log(`   ✅ ${fact.animal}`);
        } else {
          console.warn(`   ⚠️  验证失败: ${fact.animal || '未知动物'}`);
        }
      }

      if (validFacts.length === 0) {
        throw new Error("没有通过验证的知识");
      }

      return validFacts;

    } catch (error) {
      lastError = error;

      if (attempt < maxRetries && error.message.includes("高负载")) {
        continue;
      }

      // 最后一次尝试或非重试错误
      if (attempt === maxRetries) {
        console.error(`❌ 获取知识失败: ${error.message}`);
        throw error;
      }
    }
  }

  // 不应该到达这里
  throw lastError || new Error("未知错误");
}

// ===== 导出函数 =====
export {
  getMultipleFactsFromGemini,
  ANIMALS_100,
};
