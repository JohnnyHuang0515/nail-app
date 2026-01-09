// Seed staff data with complete profiles, reviews, and portfolios
import prisma from '../src/lib/prisma';

async function seedStaff() {
  console.log('🌱 Seeding staff data...');

  // Create staff users if they don't exist
  const staffUsers = [
    {
      email: 'yaya@nailsalon.com',
      name: '小雅',
      role: 'STAFF' as const,
    },
    {
      email: 'kaori@nailsalon.com',
      name: '小薰',
      role: 'STAFF' as const,
    },
    {
      email: 'wendy@nailsalon.com',
      name: '小雯',
      role: 'STAFF' as const,
    },
  ];

  const createdUsers = [];
  for (const userData of staffUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    });
    createdUsers.push(user);
  }

  // Staff 1: 小雅 (Yaya)
  const staff1 = await prisma.staff.upsert({
    where: { userId: createdUsers[0].id },
    update: {},
    create: {
      userId: createdUsers[0].id,
      displayName: '小雅',
      displayNameEn: 'Yaya',
      title: 'Senior Nail Artist',
      bio: '擁有8年美甲經驗，專精於日系凝膠設計與手部護理。曾赴日本進修，擅長將流行元素融入設計中，為每位客人打造獨一無二的指尖藝術。',
      specialties: ['凝膠專家', '手部護理', '法式美甲'],
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
      portfolio: [
        'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=300&h=300&fit=crop',
      ],
      rating: 4.9,
      reviewCount: 3,
      workingHours: {
        monday: { start: '10:00', end: '20:00' },
        tuesday: { start: '10:00', end: '20:00' },
        wednesday: { start: '10:00', end: '20:00' },
        thursday: { start: '10:00', end: '20:00' },
        friday: { start: '10:00', end: '20:00' },
        saturday: { start: '10:00', end: '20:00' },
      },
      slotIntervalMins: 30,
    },
  });

  // Staff 2: 小薰 (Kaori)
  const staff2 = await prisma.staff.upsert({
    where: { userId: createdUsers[1].id },
    update: {},
    create: {
      userId: createdUsers[1].id,
      displayName: '小薰',
      displayNameEn: 'Kaori',
      title: 'Creative Director',
      bio: '專注於創意美甲設計，擅長暈染、大理石紋等藝術風格。喜歡挑戰新技法，為客人帶來驚喜。新娘美甲也是我的拿手項目！',
      specialties: ['創意設計', '暈染藝術', '新娘美甲'],
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
      portfolio: [
        'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=300&h=300&fit=crop',
      ],
      rating: 4.8,
      reviewCount: 2,
      workingHours: {
        monday: { start: '11:00', end: '21:00' },
        tuesday: { start: '11:00', end: '21:00' },
        thursday: { start: '11:00', end: '21:00' },
        friday: { start: '11:00', end: '21:00' },
        saturday: { start: '10:00', end: '20:00' },
        sunday: { start: '10:00', end: '18:00' },
      },
      slotIntervalMins: 30,
    },
  });

  // Staff 3: 小雯 (Wendy)
  const staff3 = await prisma.staff.upsert({
    where: { userId: createdUsers[2].id },
    update: {},
    create: {
      userId: createdUsers[2].id,
      displayName: '小雯',
      displayNameEn: 'Wendy',
      title: 'Nail Technician',
      bio: '溫柔細心，擅長日系可愛風格的美甲設計。同時也提供美睫服務，讓妳一次變美！新客人我會特別用心照顧喔～',
      specialties: ['日系風格', '可愛設計', '美睫'],
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
      portfolio: [
        'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=300&h=300&fit=crop',
      ],
      rating: 4.7,
      reviewCount: 2,
      workingHours: {
        tuesday: { start: '10:00', end: '19:00' },
        wednesday: { start: '10:00', end: '19:00' },
        thursday: { start: '10:00', end: '19:00' },
        friday: { start: '10:00', end: '19:00' },
        saturday: { start: '10:00', end: '20:00' },
        sunday: { start: '10:00', end: '17:00' },
      },
      slotIntervalMins: 30,
    },
  });

  console.log('✅ Created staff profiles');

  // Create reviews for Staff 1
  await prisma.review.createMany({
    data: [
      {
        staffId: staff1.id,
        author: '小美',
        rating: 5,
        comment: '超級細心！做完手好漂亮～',
      },
      {
        staffId: staff1.id,
        author: '安安',
        rating: 5,
        comment: '每次來都很滿意，推推！',
      },
      {
        staffId: staff1.id,
        author: 'Mia',
        rating: 4,
        comment: '很有耐心，會幫忙選顏色',
      },
    ],
    skipDuplicates: true,
  });

  // Create reviews for Staff 2
  await prisma.review.createMany({
    data: [
      {
        staffId: staff2.id,
        author: '婷婷',
        rating: 5,
        comment: '婚禮當天的美甲超夢幻！',
      },
      {
        staffId: staff2.id,
        author: '小玲',
        rating: 5,
        comment: '暈染做得太美了',
      },
    ],
    skipDuplicates: true,
  });

  // Create reviews for Staff 3
  await prisma.review.createMany({
    data: [
      {
        staffId: staff3.id,
        author: '小花',
        rating: 5,
        comment: '好溫柔的美甲師！',
      },
      {
        staffId: staff3.id,
        author: '珊珊',
        rating: 4,
        comment: '做得很細緻',
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Created reviews');
  console.log('✨ Staff seeding completed!');
}

seedStaff()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
