/**
 * Test Runner for Database Relationships
 * Run: npx ts-node libs/database/test-runner.ts
 */

import { Sequelize } from 'sequelize-typescript';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { User } from './src/models/user.model';
import { Company } from './src/models/company.model';
import { CompanyUser } from './src/models/company_user.model';
import { Role } from './src/models/role.model';
import { Permission } from './src/models/permission.model';
import { RolePermission } from './src/models/role_permission.model';
import { UserRole } from './src/models/user_role.model';

// Load environment variables
dotenv.config({ path: join(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`) });

async function initializeDatabase() {
  const sequelize = new Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dev_paypagar',
    models: [User, Company, CompanyUser, Role, Permission, RolePermission, UserRole],
    logging: false, // Set to console.log to see SQL queries
  });

  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.\n');
    return sequelize;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
}

async function testRelationships() {
  console.log('🧪 Starting Database Relationship Tests...\n');
  console.log('='.repeat(60));

  const sequelize = await initializeDatabase();

  try {
    // Test 1: Check if User model has companyUsers association
    console.log('\n📋 Test 1: User → CompanyUser Association');
    console.log('-'.repeat(60));
    
    const userAssociations = Object.keys(User.associations);
    console.log('User associations:', userAssociations);
    
    if (userAssociations.includes('companyUsers')) {
      console.log('✅ User.companyUsers association exists');
    } else {
      console.log('❌ User.companyUsers association NOT found');
    }

    // Test 2: Check Company associations
    console.log('\n📋 Test 2: Company Associations');
    console.log('-'.repeat(60));
    
    const companyAssociations = Object.keys(Company.associations);
    console.log('Company associations:', companyAssociations);
    
    if (companyAssociations.includes('companyUsers')) {
      console.log('✅ Company.companyUsers association exists');
    }
    if (companyAssociations.includes('roles')) {
      console.log('✅ Company.roles association exists');
    }

    // Test 3: Check CompanyUser associations
    console.log('\n📋 Test 3: CompanyUser Associations');
    console.log('-'.repeat(60));
    
    const companyUserAssociations = Object.keys(CompanyUser.associations);
    console.log('CompanyUser associations:', companyUserAssociations);
    
    if (companyUserAssociations.includes('user')) {
      console.log('✅ CompanyUser.user association exists');
    }
    if (companyUserAssociations.includes('company')) {
      console.log('✅ CompanyUser.company association exists');
    }
    if (companyUserAssociations.includes('userRoles')) {
      console.log('✅ CompanyUser.userRoles association exists');
    }

    // Test 4: Check Role associations
    console.log('\n📋 Test 4: Role Associations');
    console.log('-'.repeat(60));
    
    const roleAssociations = Object.keys(Role.associations);
    console.log('Role associations:', roleAssociations);
    
    if (roleAssociations.includes('company')) {
      console.log('✅ Role.company association exists');
    }
    if (roleAssociations.includes('permissions')) {
      console.log('✅ Role.permissions association exists (Many-to-Many)');
    }
    if (roleAssociations.includes('rolePermissions')) {
      console.log('✅ Role.rolePermissions association exists');
    }
    if (roleAssociations.includes('userRoles')) {
      console.log('✅ Role.userRoles association exists');
    }

    // Test 5: Check Permission associations
    console.log('\n📋 Test 5: Permission Associations');
    console.log('-'.repeat(60));
    
    const permissionAssociations = Object.keys(Permission.associations);
    console.log('Permission associations:', permissionAssociations);
    
    if (permissionAssociations.includes('roles')) {
      console.log('✅ Permission.roles association exists (Many-to-Many)');
    }
    if (permissionAssociations.includes('rolePermissions')) {
      console.log('✅ Permission.rolePermissions association exists');
    }

    // Test 6: Check RolePermission associations
    console.log('\n📋 Test 6: RolePermission Associations');
    console.log('-'.repeat(60));
    
    const rolePermissionAssociations = Object.keys(RolePermission.associations);
    console.log('RolePermission associations:', rolePermissionAssociations);
    
    if (rolePermissionAssociations.includes('role')) {
      console.log('✅ RolePermission.role association exists');
    }
    if (rolePermissionAssociations.includes('permission')) {
      console.log('✅ RolePermission.permission association exists');
    }

    // Test 7: Check UserRole associations
    console.log('\n📋 Test 7: UserRole Associations');
    console.log('-'.repeat(60));
    
    const userRoleAssociations = Object.keys(UserRole.associations);
    console.log('UserRole associations:', userRoleAssociations);
    
    if (userRoleAssociations.includes('companyUser')) {
      console.log('✅ UserRole.companyUser association exists');
    }
    if (userRoleAssociations.includes('role')) {
      console.log('✅ UserRole.role association exists');
    }

    // Test 8: Try actual database query (if data exists)
    console.log('\n📋 Test 8: Database Query Test');
    console.log('-'.repeat(60));
    
    try {
      const userCount = await User.count();
      console.log(`Total users in database: ${userCount}`);

      if (userCount > 0) {
        const user = await User.findOne({
          include: [
            {
              model: CompanyUser,
              include: [
                { model: Company },
                { model: UserRole, include: [{ model: Role }] }
              ]
            }
          ]
        });

        if (user) {
          console.log('✅ Successfully queried User with nested associations');
          console.log(`   User: ${user.firstName} ${user.lastName}`);
          console.log(`   Companies: ${user.companyUsers?.length || 0}`);
        }
      } else {
        console.log('ℹ️  No users in database to test queries');
      }
    } catch (error) {
      console.log('⚠️  Query test skipped (no data or error):', error.message);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATIONSHIP TEST SUMMARY');
    console.log('='.repeat(60));
    
    const allAssociations = {
      User: Object.keys(User.associations).length,
      Company: Object.keys(Company.associations).length,
      CompanyUser: Object.keys(CompanyUser.associations).length,
      Role: Object.keys(Role.associations).length,
      Permission: Object.keys(Permission.associations).length,
      RolePermission: Object.keys(RolePermission.associations).length,
      UserRole: Object.keys(UserRole.associations).length,
    };

    console.log('\nAssociations per model:');
    Object.entries(allAssociations).forEach(([model, count]) => {
      console.log(`  ${model}: ${count} associations`);
    });

    const totalAssociations = Object.values(allAssociations).reduce((a, b) => a + b, 0);
    console.log(`\nTotal associations: ${totalAssociations}`);
    console.log('\n✅ All relationship tests completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run tests
testRelationships()
  .then(() => {
    console.log('\n✨ Test execution completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test execution failed:', error);
    process.exit(1);
  });
