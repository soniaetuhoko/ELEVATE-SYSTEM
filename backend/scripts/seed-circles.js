const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedCircles() {
  try {
    console.log('Seeding circles...');

    // Create sample circles
    const circles = [
      {
        name: 'React Developers',
        description: 'A community for React developers to share knowledge, discuss best practices, and collaborate on projects.',
        category: 'Technical'
      },
      {
        name: 'UI/UX Design Hub',
        description: 'Connect with designers, share your work, get feedback, and learn about the latest design trends.',
        category: 'Technical'
      },
      {
        name: 'Entrepreneurship Network',
        description: 'For aspiring entrepreneurs to discuss business ideas, share experiences, and find potential co-founders.',
        category: 'Business'
      },
      {
        name: 'Leadership & Communication',
        description: 'Develop your leadership skills and improve communication through discussions and peer feedback.',
        category: 'SoftSkills'
      },
      {
        name: 'Data Science & AI',
        description: 'Explore data science, machine learning, and AI topics with fellow data enthusiasts.',
        category: 'Technical'
      },
      {
        name: 'Career Development',
        description: 'Share career advice, interview tips, and professional development strategies.',
        category: 'SoftSkills'
      }
    ];

    for (const circle of circles) {
      const created = await prisma.circle.create({
        data: circle
      });
      console.log(`Created circle: ${created.name}`);
    }

    console.log('Circles seeded successfully!');
  } catch (error) {
    console.error('Error seeding circles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCircles();