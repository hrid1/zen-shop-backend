import prisma from "../config/database";

export class ReviewService {
  //
  async getProductReviews(
    productId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const where = { productId, isApproved: true };

    const [total, reviews] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
          images: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    // calculate rating summary
    const ratingData = await prisma.review.aggregate({
      where,
      _avg: { rating: true },
      _count: true,
    });

    const ratingBreakdown = await prisma.review.groupBy({
      by: ["rating"],
      where,
      _count: true,
      orderBy: { rating: "desc" },
    });

    return {
      reviews,
      summary: {
        averageRating: ratingData._avg.rating || 0,
        totalReviews: ratingData._count,
        breakdown: ratingBreakdown.map((r) => ({
          rating: r.rating,
          count: r._count,
        })),
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  //   create review
  async createReview(
  userId: string,
  productId: string,
  data: {
    rating: number;
    title?: string;
    comment: string;
    orderId?: string;
  },
) {
  // Check product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });
  if (!product) throw new Error('Product not found');

  // Hard block — must have a delivered order containing this product
  const deliveredOrder = await prisma.order.findFirst({
    where: {
      userId,
      status: 'DELIVERED',
      items: {
        some: {
          productVariant: { productId },
        },
      },
    },
  });

  if (!deliveredOrder) {
    throw new Error('You can only review products you have purchased and received');
  }

  // Check already reviewed
  const existing = await prisma.review.findUnique({
    where: { productId_userId: { productId, userId } },
  });
  if (existing) throw new Error('You have already reviewed this product');

  return prisma.review.create({
    data: {
      productId,
      userId,
      orderId: deliveredOrder.id, // auto attach the delivered order
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      isVerifiedPurchase: true,   // always true now since hard block guarantees it
      isApproved: false,
    },
    include: {
      user: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}
  async updateReview(
    userId: string,
    reviewId: string,
    data: { rating?: number; title?: string; comment?: string },
  ) {
    const review = await prisma.review.findFirst({
      where: { id: reviewId, userId },
    });
    if (!review) throw new Error("Review not found");

    return prisma.review.update({
      where: { id: reviewId },
      data: { ...data, isApproved: false }, // re-approval needed after edit
    });
  }

  async deleteReview(userId: string, reviewId: string) {
    const review = await prisma.review.findFirst({
      where: { id: reviewId, userId },
    });
    if (!review) throw new Error("Review not found");

    await prisma.review.delete({ where: { id: reviewId } });
    return { message: "Review deleted" };
  }

  async markHelpful(reviewId: string) {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new Error("Review not found");

    return prisma.review.update({
      where: { id: reviewId },
      data: { helpfulCount: { increment: 1 } },
    });
  }

  // ADMIN
  async approveReview(reviewId: string) {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new Error("Review not found");

    return prisma.review.update({
      where: { id: reviewId },
      data: { isApproved: true },
    });
  }

  async getPendingReviews() {
    return prisma.review.findMany({
      where: { isApproved: false },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        product: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
