// Seed services data
import prisma from '../src/lib/prisma';

const services = [
    // 基礎保養
    { name: '基礎手部保養', category: '基礎保養', description: '包含手部去角質、滋潤保濕、基礎指甲修剪', durationMinutes: 45, price: 500 },
    { name: '基礎足部保養', category: '基礎保養', description: '包含足部去角質、滋潤保濕、基礎指甲修剪', durationMinutes: 60, price: 600 },
    { name: '手部深層護理', category: '基礎保養', description: '深層清潔+按摩+保濕面膜', durationMinutes: 75, price: 800 },

    // 凝膠指甲
    { name: '單色凝膠指甲', category: '凝膠指甲', description: '純色凝膠指甲上色，持久不掉色', durationMinutes: 90, price: 1200 },
    { name: '漸層凝膠指甲', category: '凝膠指甲', description: '漸層色凝膠指甲，自然優雅', durationMinutes: 120, price: 1500 },
    { name: '光療凝膠延甲', category: '凝膠指甲', description: '使用光療凝膠延長指甲', durationMinutes: 150, price: 2000 },

    // 造型彩繪
    { name: '簡約線條彩繪', category: '造型彩繪', description: '1-2個手指簡約線條或圖案', durationMinutes: 30, price: 300 },
    { name: '精緻花卉彩繪', category: '造型彩繪', description: '手繪精緻花卉圖案', durationMinutes: 60, price: 800 },
    { name: '全手繪藝術設計', category: '造型彩繪', description: '客製化全手繪藝術指甲', durationMinutes: 120, price: 1800 },

    // 特殊服務
    { name: '指甲修補', category: '特殊服務', description: '單指指甲修補或卸除', durationMinutes: 20, price: 200 },
    { name: '凝膠卸除', category: '特殊服務', description: '完整凝膠指甲卸除+基礎保養', durationMinutes: 45, price: 400 },
    { name: '問題指甲處理', category: '特殊服務', description: '針對問題指甲的特殊護理', durationMinutes: 60, price: 800 },
];

async function seed() {
    console.log('🌱 Seeding services...');

    for (const service of services) {
        await prisma.service.create({
            data: service,
        });
        console.log(`✅ Created: ${service.name}`);
    }

    console.log('✨ Seeding completed!');
    await prisma.$disconnect();
    process.exit(0);
}

seed().catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
});
