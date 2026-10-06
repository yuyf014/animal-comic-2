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

// 场景列表
const SCENES = ["sea", "grass", "forest", "snow", "lake", "room", "savanna", "sunny", "rain", "night"];

// 表情列表
const EXPRESSIONS = ["normal", "happy", "sad", "angry", "surprised"];

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

// ===== 主函数：从 Gemini 获取新知识 =====
async function getNewFactFromGemini() {
  const animalName = randomFrom(ANIMALS_100);

  const prompt = `你是一个儿童教育专家和漫画编剧。

任务：为名叫"${animalName}"的动物创建一个有趣的4格漫画故事，包含关于这个动物的小知识。

要求：
1. 知识（fact）：关于${animalName}的一个有趣、真实的小知识，100-150字左右
2. 4个漫画面板，每个面板包含：
   - scene：场景（可选值：sea, grass, forest, snow, lake, room, savanna, sunny, rain, night）
   - cast：角色数组，格式为 ["角色名 表情"]，表情可以是 normal, happy, sad, angry, surprised
   - text：该格的对话或描述（20-50字）
   - caption：可选的标题或旁白

返回格式（严格遵循）：
{
  "animal": "${animalName}",
  "fact": "小知识内容",
  "panels": [
    {
      "scene": "场景名",
      "cast": ["${animalName.toLowerCase()} happy"],
      "text": "第一格的对话",
      "caption": "标题"
    },
    {
      "scene": "场景名",
      "cast": ["${animalName.toLowerCase()} normal"],
      "text": "第二格的对话",
      "caption": ""
    },
    {
      "scene": "场景名",
      "cast": ["${animalName.toLowerCase()} surprised"],
      "text": "第三格的对话",
      "caption": ""
    },
    {
      "scene": "场景名",
      "cast": ["${animalName.toLowerCase()} happy"],
      "text": "第四格的对话",
      "caption": ""
    }
  ]
}

重要：只返回 JSON，不要有其他文本。`;

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
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
          maxOutputTokens: 1500,
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
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API 错误: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error("API 返回格式异常");
    }

    const responseText = data.candidates[0].content.parts[0].text;

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("原始响应:", responseText);
      throw new Error("无法从 API 响应中解析 JSON");
    }

    const fact = JSON.parse(jsonMatch[0]);

    if (!validateFact(fact)) {
      console.error("验证失败的知识:", fact);
      throw new Error("返回的知识格式不符合要求");
    }

    console.log(`✅ 成功获取: ${fact.animal}`);
    return fact;
  } catch (error) {
    console.error("❌ 获取知识失败:", error.message);
    throw error;
  }
}

// ===== 批量生成函数 =====
async function generateWeeklyFacts(count = 5) {
  console.log(`🚀 开始生成 ${count} 个新知识...`);

  const newFacts = [];
  const errors = [];

  for (let i = 0; i < count; i++) {
    try {
      console.log(`⏳ 生成第 ${i + 1}/${count} 个...`);
      const fact = await getNewFactFromGemini();
      newFacts.push(fact);

      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      errors.push(`第 ${i + 1} 个: ${error.message}`);
    }
  }

  console.log(`\n✅ 生成完成！`);
  console.log(`   成功: ${newFacts.length} 个`);
  if (errors.length > 0) {
    console.log(`   失败: ${errors.length} 个`);
    errors.forEach(e => console.log(`     - ${e}`));
  }

  return newFacts;
}

// ===== 导出函数 =====
export {
  getNewFactFromGemini,
  generateWeeklyFacts,
  ANIMALS_100,
};
