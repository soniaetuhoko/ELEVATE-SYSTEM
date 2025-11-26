const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const createAdmin = async () => {
  try {
    // Check if admin exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@admin.com' }
    });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@admin.com',
        name: 'System Administrator',
        password: hashedPassword,
        role: 'admin'
      }
    });
    
    console.log('✅ Admin user created successfully');
    console.log('📧 Email: admin@admin.com');
    console.log('🔑 Password: admin123');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    await prisma.$disconnect();
  }
};

createAdmin();