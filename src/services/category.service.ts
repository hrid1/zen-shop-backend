import prisma from "../config/database";

export class CategoryService {
  async getAll() {
    return prisma.category.findMany({
      where: { isActive: true, parentCategoryId: null },
      include: {
        childCategories: {
          where: { isActive: true },
        },
      },
      orderBy: { displayOrder: "asc" },
    });
  }

  async getById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { childCategories: true },
    });

    if (!category) throw new Error("Category not found");
    return category;
  }

  async create(data: {
    name: string;
    slug: string;
    discription?: string;
    parentCategoryId?: string;
    imageUrl?: string;
    displayOrder?: number;
  }) {
    const existing = await prisma.category.findUnique({
      where: { slug: data.slug },
    });

    if (existing) throw new Error("Slug already exists");

    return prisma.category.create({ data });
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      slug: string;
      description: string;
      imageUrl: string;
      isActive: boolean;
      displayOrder: number;
    }>,
  ) {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) throw new Error("Category not found");

    return prisma.category.update({ where: { id }, data });
  }

  async delete(id: string) {
    const category = await prisma.category.findUnique({ where: { id } });
    // console.log("Category", category)
    if (!category) throw new Error("Category not found");


    // soft delete
    return prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
