import prisma from "../config/database";

export class CouponService {
  async validate(code: string, userId: string, orderSubtotal: number) {
    const coupon = await prisma.coupon.findUnique({ where: { code } });

    if (!coupon) throw new Error("Coupon not found!");
    if (!coupon.isActive) throw new Error("Coupon is inactive");

    const now = new Date();
    if (coupon.validFrom > now) throw new Error("Coupon is not yet valid");
    if (coupon.validUntil && coupon.validUntil < now)
      throw new Error("Coupon has expired");

    // check total useage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new Error("Coupon usage limit reached");
    }

    // Check per user usage limit
    const userUsageCount = await prisma.couponUsage.count({
      where: { couponId: coupon.id, userId },
    });
    if (userUsageCount >= coupon.usagePerUserLimit) {
      throw new Error("You have already used this coupon");
    }

    // Check min order value
    if (coupon.minOrderValue && orderSubtotal < Number(coupon.minOrderValue)) {
      throw new Error(
        `Minimum order value is $${coupon.minOrderValue} to use this coupon`,
      );
    }
  }

  calculateDiscount(coupon: any, subtotal: number): number {
    let discount = 0;

    if (coupon.discountType === "PERCENTAGE") {
      discount = (subtotal * Number(coupon.discountValue)) / 100;
    } else if (coupon.discountType === "FIXED_AMOUNT") {
      discount = Number(coupon.discountValue);
    } else if (coupon.discountType === "FREE_SHIPPING") {
      // handled separately in order total calculation
      return 0;
    }

    // Apply max discount cap
    if (
      coupon.maxDiscountAmount &&
      discount > Number(coupon.maxDiscountAmount)
    ) {
      discount = Number(coupon.maxDiscountAmount);
    }

    // Discount can't exceed subtotal
    return Math.min(discount, subtotal);
  }

  // ADMIN
  async create(data: {
    code: string;
    description?: string;
    discountType: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
    discountValue: number;
    minOrderValue?: number;
    maxDiscountAmount?: number;
    usageLimit?: number;
    usagePerUserLimit?: number;
    validFrom: Date;
    validUntil?: Date;
  }) {
    const existing = await prisma.coupon.findUnique({
      where: { code: data.code },
    });

    if (existing) throw new Error("Coupon code already exists");
  }

  async getAll() {
    return prisma.coupon.findMany({
      include: { _count: { select: { usages: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async toggleActive(couponId: string) {
    const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
    if (!coupon) throw new Error("Coupon not found");

    return prisma.coupon.update({
      where: { id: couponId },
      data: { isActive: !coupon.isActive },
    });
  }

  async delete(couponId: string) {
    const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
    if (!coupon) throw new Error("Coupon deleted");
  }
}
