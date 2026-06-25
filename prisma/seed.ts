import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ───────────────────────────────────────
  // ADMIN USER
  // ───────────────────────────────────────
  // const passwordHash = await bcrypt.hash('admin123', 12);

  // const admin = await prisma.user.upsert({
  //   where: { email: 'admin@zenshop.com' },
  //   update: {},
  //   create: {
  //     email: 'admin@zenshop.com',
  //     passwordHash,
  //     firstName: 'Admin',
  //     lastName: 'User',
  //     role: 'ADMIN',
  //   },
  // });

  // // Create cart for admin
  // await prisma.cart.upsert({
  //   where: { userId: admin.id },
  //   update: {},
  //   create: { userId: admin.id },
  // });

  // console.log('✅ Admin user created');

  // ───────────────────────────────────────
  // CATEGORIES
  // ───────────────────────────────────────
  const electronics = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and accessories',
      displayOrder: 1,
    },
  });

  const fashion = await prisma.category.upsert({
    where: { slug: 'fashion' },
    update: {},
    create: {
      name: 'Fashion',
      slug: 'fashion',
      description: 'Clothing and accessories',
      displayOrder: 2,
    },
  });

  const homeAndLiving = await prisma.category.upsert({
    where: { slug: 'home-living' },
    update: {},
    create: {
      name: 'Home & Living',
      slug: 'home-living',
      description: 'Furniture, decor and home essentials',
      displayOrder: 3,
    },
  });

  // Subcategories — Electronics
  const mobiles = await prisma.category.upsert({
    where: { slug: 'mobiles' },
    update: {},
    create: {
      name: 'Mobiles',
      slug: 'mobiles',
      description: 'Smartphones and accessories',
      parentCategoryId: electronics.id,
      displayOrder: 1,
    },
  });

  const laptops = await prisma.category.upsert({
    where: { slug: 'laptops' },
    update: {},
    create: {
      name: 'Laptops',
      slug: 'laptops',
      description: 'Laptops and notebooks',
      parentCategoryId: electronics.id,
      displayOrder: 2,
    },
  });

  // Subcategories — Fashion
  const mensFashion = await prisma.category.upsert({
    where: { slug: 'mens-fashion' },
    update: {},
    create: {
      name: "Men's Fashion",
      slug: 'mens-fashion',
      description: 'Clothing for men',
      parentCategoryId: fashion.id,
      displayOrder: 1,
    },
  });

  const womensFashion = await prisma.category.upsert({
    where: { slug: 'womens-fashion' },
    update: {},
    create: {
      name: "Women's Fashion",
      slug: 'womens-fashion',
      description: 'Clothing for women',
      parentCategoryId: fashion.id,
      displayOrder: 2,
    },
  });

  console.log('✅ Categories created');

  // ───────────────────────────────────────
  // PRODUCTS
  // ───────────────────────────────────────

  // Product 1 — iPhone 15
  const iphone = await prisma.product.upsert({
    where: { slug: 'iphone-15' },
    update: {},
    create: {
      categoryId: mobiles.id,
      name: 'iPhone 15',
      slug: 'iphone-15',
      description: 'The latest iPhone with A16 Bionic chip, 48MP camera, and Dynamic Island.',
      shortDescription: 'Latest iPhone with A16 chip',
      sku: 'IPH-15',
      basePrice: 999,
      compareAtPrice: 1099,
      isFeatured: true,
      images: {
        create: [
          {
            imageUrl: 'https://placehold.co/600x600?text=iPhone+15',
            altText: 'iPhone 15 front view',
            isPrimary: true,
            displayOrder: 1,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: 'IPH-15-BLK-128',
            name: 'Black 128GB',
            price: 999,
            compareAtPrice: 1099,
            stockQuantity: 50,
            attributes: {
              create: [
                { attributeName: 'Color', attributeValue: 'Black' },
                { attributeName: 'Storage', attributeValue: '128GB' },
              ],
            },
          },
          {
            sku: 'IPH-15-BLK-256',
            name: 'Black 256GB',
            price: 1099,
            stockQuantity: 30,
            attributes: {
              create: [
                { attributeName: 'Color', attributeValue: 'Black' },
                { attributeName: 'Storage', attributeValue: '256GB' },
              ],
            },
          },
          {
            sku: 'IPH-15-WHT-128',
            name: 'White 128GB',
            price: 999,
            compareAtPrice: 1099,
            stockQuantity: 40,
            attributes: {
              create: [
                { attributeName: 'Color', attributeValue: 'White' },
                { attributeName: 'Storage', attributeValue: '128GB' },
              ],
            },
          },
        ],
      },
    },
  });

  // Product 2 — MacBook Air
  const macbook = await prisma.product.upsert({
    where: { slug: 'macbook-air-m2' },
    update: {},
    create: {
      categoryId: laptops.id,
      name: 'MacBook Air M2',
      slug: 'macbook-air-m2',
      description: 'Supercharged by M2 chip. MacBook Air is strikingly thin and fanless.',
      shortDescription: 'Thin, light, and powerful laptop',
      sku: 'MBA-M2',
      basePrice: 1299,
      compareAtPrice: 1499,
      isFeatured: true,
      images: {
        create: [
          {
            imageUrl: 'https://placehold.co/600x600?text=MacBook+Air',
            altText: 'MacBook Air M2',
            isPrimary: true,
            displayOrder: 1,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: 'MBA-M2-SLV-256',
            name: 'Silver 256GB',
            price: 1299,
            stockQuantity: 20,
            attributes: {
              create: [
                { attributeName: 'Color', attributeValue: 'Silver' },
                { attributeName: 'Storage', attributeValue: '256GB' },
                { attributeName: 'RAM', attributeValue: '8GB' },
              ],
            },
          },
          {
            sku: 'MBA-M2-SLV-512',
            name: 'Silver 512GB',
            price: 1499,
            stockQuantity: 15,
            attributes: {
              create: [
                { attributeName: 'Color', attributeValue: 'Silver' },
                { attributeName: 'Storage', attributeValue: '512GB' },
                { attributeName: 'RAM', attributeValue: '16GB' },
              ],
            },
          },
        ],
      },
    },
  });

  // Product 3 — Men's T-Shirt
  const tshirt = await prisma.product.upsert({
    where: { slug: 'classic-mens-tshirt' },
    update: {},
    create: {
      categoryId: mensFashion.id,
      name: "Classic Men's T-Shirt",
      slug: 'classic-mens-tshirt',
      description: 'Premium cotton t-shirt. Comfortable, durable, and stylish for everyday wear.',
      shortDescription: '100% cotton premium t-shirt',
      sku: 'TSH-MEN-001',
      basePrice: 29,
      compareAtPrice: 39,
      isFeatured: false,
      images: {
        create: [
          {
            imageUrl: 'https://placehold.co/600x600?text=T-Shirt',
            altText: "Classic Men's T-Shirt",
            isPrimary: true,
            displayOrder: 1,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: 'TSH-MEN-WHT-S',
            name: 'White Small',
            price: 29,
            stockQuantity: 100,
            attributes: {
              create: [
                { attributeName: 'Color', attributeValue: 'White' },
                { attributeName: 'Size', attributeValue: 'S' },
              ],
            },
          },
          {
            sku: 'TSH-MEN-WHT-M',
            name: 'White Medium',
            price: 29,
            stockQuantity: 120,
            attributes: {
              create: [
                { attributeName: 'Color', attributeValue: 'White' },
                { attributeName: 'Size', attributeValue: 'M' },
              ],
            },
          },
          {
            sku: 'TSH-MEN-BLK-L',
            name: 'Black Large',
            price: 29,
            stockQuantity: 80,
            attributes: {
              create: [
                { attributeName: 'Color', attributeValue: 'Black' },
                { attributeName: 'Size', attributeValue: 'L' },
              ],
            },
          },
        ],
      },
    },
  });

  // Product 4 — Samsung Galaxy S24
  const samsung = await prisma.product.upsert({
    where: { slug: 'samsung-galaxy-s24' },
    update: {},
    create: {
      categoryId: mobiles.id,
      name: 'Samsung Galaxy S24',
      slug: 'samsung-galaxy-s24',
      description: 'Galaxy AI is here. The Samsung Galaxy S24 with powerful Snapdragon 8 Gen 3.',
      shortDescription: 'Galaxy AI powered smartphone',
      sku: 'SAM-S24',
      basePrice: 899,
      isFeatured: true,
      images: {
        create: [
          {
            imageUrl: 'https://placehold.co/600x600?text=Galaxy+S24',
            altText: 'Samsung Galaxy S24',
            isPrimary: true,
            displayOrder: 1,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: 'SAM-S24-BLK-256',
            name: 'Phantom Black 256GB',
            price: 899,
            stockQuantity: 60,
            attributes: {
              create: [
                { attributeName: 'Color', attributeValue: 'Phantom Black' },
                { attributeName: 'Storage', attributeValue: '256GB' },
              ],
            },
          },
          {
            sku: 'SAM-S24-CRM-256',
            name: 'Cream 256GB',
            price: 899,
            stockQuantity: 45,
            attributes: {
              create: [
                { attributeName: 'Color', attributeValue: 'Cream' },
                { attributeName: 'Storage', attributeValue: '256GB' },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('✅ Products created');
  console.log('');
  console.log('🎉 Seeding complete!');
  console.log('');
  console.log('Admin credentials:');
  console.log('  Email: admin@zenshop.com');
  console.log('  Password: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });