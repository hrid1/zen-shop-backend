import prisma from '../config/database';

export class ProductService {
  
  async getAll(filters: {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    isFeatured?: boolean;
    page?: number;
    limit?: number;
  }) {
    const {
      categoryId,
      minPrice,
      maxPrice,
      search,
      isFeatured,
      page = 1,
      limit = 20,
    } = filters;

    const where: any = {
      isActive: true,
      ...(categoryId && { categoryId }),
      ...(isFeatured !== undefined && { isFeatured }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...((minPrice || maxPrice) && {
        basePrice: {
          ...(minPrice && { gte: minPrice }),
          ...(maxPrice && { lte: maxPrice }),
        },
      }),
    };

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { where: { isPrimary: true }, take: 1 },
          variants: {
            where: { isActive: true },
            select: { id: true, price: true, stockQuantity: true, name: true },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { displayOrder: 'asc' } },
        variants: {
          where: { isActive: true },
          include: { attributes: true },
        },
      },
    });

    if (!product) throw new Error('Product not found');
    return product;
  }

  async create(data: {
    categoryId: string;
    name: string;
    slug: string;
    description: string;
    shortDescription?: string;
    sku: string;
    basePrice: number;
    compareAtPrice?: number;
    isFeatured?: boolean;
    variants: Array<{
      sku: string;
      name: string;
      price: number;
      stockQuantity: number;
      attributes: Array<{ attributeName: string; attributeValue: string }>;
    }>;
  }) {
    const existing = await prisma.product.findUnique({
      where: { slug: data.slug },
    });

    if (existing) throw new Error('Slug already exists');

    const { variants, ...productData } = data;

    return prisma.product.create({
      data: {
        ...productData,
        variants: {
          create: variants.map((v) => ({
            sku: v.sku,
            name: v.name,
            price: v.price,
            stockQuantity: v.stockQuantity,
            attributes: {
              create: v.attributes,
            },
          })),
        },
      },
      include: {
        variants: { include: { attributes: true } },
        images: true,
      },
    });
  }

  async update(id: string, data: Partial<{
    name: string;
    description: string;
    basePrice: number;
    isActive: boolean;
    isFeatured: boolean;
  }>) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new Error('Product not found');

    return prisma.product.update({ where: { id }, data });
  }

  async delete(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new Error('Product not found');

    return prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }
}