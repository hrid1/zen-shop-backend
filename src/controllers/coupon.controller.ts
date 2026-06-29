import z, { success } from "zod";
import { CouponService } from "./coupon.service";
import { DiscountType } from "@prisma/client";
import { Request, Response } from "express";

import { AuthRequest } from "../middleware/auth.middleware";

const couponService = new CouponService();

const validateSchema = z.object({
  code: z.string().min(1),
  orderSubtotal: z.number().positive(),
});

const createCouponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  description: z.string().optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"]),
  discountValue: z.number().positive(),
  minOrderValue: z.number().positive().optional(),
  maxDiscountAmount: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  usagePerUserLimit: z.number().int().positive().default(1),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime().optional(),
});

export class CouponController {
  async validate(req: AuthRequest, res: Response) {
    try {
      const { code, orderSubtotal } = validateSchema.parse(req.body);
      const result = await couponService.validate(
        code,
        req.user!.userId,
        orderSubtotal,
      );
      return res.json({ success: true, data: result });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, errors: error.issues });
      }
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const data = createCouponSchema.parse(req.body);
      const coupon = await couponService.create({
        ...data,
        validFrom: new Date(data.validFrom),
        validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
      });
      return res.status(201).json({ success: true, data: coupon });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: error.issues });
      }
      return res.status(400).json({ success: false, message: error.messsage });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const coupons = await couponService.getAll();
      return res.json({ success: true, data: coupons });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async toggleActive(req: Request, res: Response) {
    try {
      const coupon = await couponService.toggleActive(req.params.id as string);
      return res.json({ success: true, data: coupon });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const result = await couponService.delete(req.params.id as string);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
