// generate-daily.mjs - 每天生成 5 个新的动物小知识

import { getMultipleFactsFromGemini } from './gemini-api.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function generateDailyFacts() {
  console.log(`\n🚀 开始生成今日动物小知识...`);
  console.log(`⏰ 时间: ${new Date().toLocaleString('zh-CN')}\n`);

  try {
    // 一次 API 调用获取 5 个新知识
    console.log(`⏳ 调用 Gemini API 获取 5 个新知识...`);
    const newFacts = await getMultipleFactsFromGemini(5);

    if (newFacts.length === 0) {
      console.log("❌ 生成失败：没有获取到任何知识");
      process.exit(1);
    }

    // 读取现有的 facts.js
    const factsPath = path.join(__dirname, 'facts.js');
    let existingContent = fs.readFileSync(factsPath, 'utf-8');

    // 提取现有的 FACTS 数组
    const match = existingContent.match(/export const FACTS = \[([\s\S]*)\];/);
    const existingFacts = match ? JSON.parse(`[${match[1]}]`) : [];

    // 合并：新的在前面，保持最多 1000 个
    const allFacts = [...newFacts, ...existingFacts].slice(0, 1000);

    // 生成新的 facts.js
    const newContent = `// 自动生成的动物小知识库（每天更新）
// 最后更新时间：${new Date().toLocaleString('zh-CN')}
// 共 ${allFacts.length} 个知识

export const FACTS = [
${allFacts.map(f => JSON.stringify(f)).join(',\n')}
];
`;

    // 写入文件
    fs.writeFileSync(factsPath, newContent);

    console.log(`\n✅ 成功生成！\n`);
    console.log(`📊 数据统计：`);
    console.log(`   新增: ${newFacts.length} 个`);
    console.log(`   库存: ${allFacts.length} 个知识`);
    console.log(`\n🎯 今日生成的动物：`);
    newFacts.forEach((fact, i) => {
      console.log(`   ${i + 1}. ${fact.animal} - ${fact.fact.substring(0, 40)}...`);
    });

    console.log(`\n📝 已更新 facts.js\n`);

  } catch (error) {
    console.error("\n❌ 生成失败！\n");
    console.error("错误信息:", error.message);

    if (error.message.includes("high demand")) {
      console.error("\n⚠️  Gemini API 现在超载");
      console.error("   请 15 分钟后再试\n");
    }

    process.exit(1);
  }
}

generateDailyFacts();
