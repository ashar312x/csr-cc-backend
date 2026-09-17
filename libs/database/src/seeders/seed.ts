import 'reflect-metadata';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

import * as bcrypt from 'bcryptjs';
import { Sequelize } from 'sequelize-typescript';
import { ALL_MODELS } from '../models/model';
import { User, UserRole } from '../models/user.model';
import { Category, ModuleType } from '../models/category.model';

interface DefaultCategorySeed {
  name: string;
  iconName: string;
  iconColor: string;
  eventLabel?: string;
  isSpecial?: boolean;
}

// Mirrors `defaultCategories` in csr-cc-frontend/src/lib/csrData.ts
const defaultCSRCategories: DefaultCategorySeed[] = [
  { name: 'Food Camps', iconName: 'UtensilsCrossed', iconColor: '#E67E22' },
  { name: 'Ramadan Ration', iconName: 'Package', iconColor: '#2ECC71' },
  { name: 'Eye Camps', iconName: 'Eye', iconColor: '#3498DB' },
  { name: 'Medical Camps', iconName: 'Stethoscope', iconColor: '#CC0000' },
  { name: 'PIMS Patients', iconName: 'HeartPulse', iconColor: '#9B59B6' },
];

// Mirrors `defaultCCCategories` in csr-cc-frontend/src/lib/csrData.ts
const defaultCCCategories: DefaultCategorySeed[] = [
  { name: 'Press Releases', iconName: 'FileText', iconColor: '#3498DB' },
  { name: 'Media Events', iconName: 'Megaphone', iconColor: '#E67E22' },
  { name: 'Social Media Campaigns', iconName: 'Share2', iconColor: '#2ECC71' },
  { name: 'Internal Communications', iconName: 'Users', iconColor: '#9B59B6' },
  { name: 'Brand Activations', iconName: 'Star', iconColor: '#CC0000' },
];

async function seedAdminUser(): Promise<User> {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME ?? 'Admin';

  if (!email || !password) {
    throw new Error(
      'SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set (see .env.development) to seed the admin user',
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [user] = await User.findOrCreate({
    where: { email },
    defaults: {
      name,
      email,
      passwordHash,
      role: UserRole.ADMIN,
      accessForCC: true,
      accessForCSR: true,
    },
  });

  return user;
}

// Flat trees today (no parentId in the frontend defaults) — top-level, all-leaf categories.
async function seedCategoryTree(
  categories: DefaultCategorySeed[],
  moduleType: ModuleType,
  userId: number,
): Promise<void> {
  for (const cat of categories) {
    await Category.findOrCreate({
      where: { name: cat.name, moduleType, userId, parentId: null },
      defaults: {
        name: cat.name,
        moduleType,
        userId,
        parentId: null,
        isSpecial: cat.isSpecial ?? false,
        eventLabel: cat.eventLabel ?? null,
        iconName: cat.iconName,
        iconColor: cat.iconColor,
      },
    });
  }
}

async function main(): Promise<void> {
  const sequelize = new Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    models: ALL_MODELS,
    define: { freezeTableName: true },
    logging: false,
  });

  await sequelize.authenticate();

  const admin = await seedAdminUser();
  await seedCategoryTree(defaultCSRCategories, ModuleType.CSR, admin.id);
  await seedCategoryTree(defaultCCCategories, ModuleType.CC, admin.id);

  console.log(`Seed complete. Admin user: ${admin.email} (id=${admin.id}).`);

  await sequelize.close();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
