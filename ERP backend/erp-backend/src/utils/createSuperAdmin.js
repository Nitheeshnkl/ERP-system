const bcrypt = require('bcrypt');
const User = require('../models/User');

const createSuperAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME;

    if (!adminEmail || !adminPassword) {
      console.log('Admin environment variables not set');
      return;
    }

    const normalizedEmail = adminEmail.toLowerCase();
    const existingAdmin = await User.findOne({ email: normalizedEmail });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      await User.create({
        name: adminName || 'System Admin',
        email: normalizedEmail,
        password: hashedPassword,
        role: 'Admin',
        emailVerified: true,
      });

      console.log('Super Admin created successfully');
    } else {
      console.log('Super Admin already exists');
    }
  } catch (error) {
    console.error('Super Admin creation error:', error);
  }
};

module.exports = createSuperAdmin;
