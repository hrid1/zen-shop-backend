import { CartService } from "../services/cart.service";
import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { z } from "zod";

const cartService = new CartService();

const addItemSchema = z.object({
  productVariantId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

const updateItemSchema = z.object({
  quantity: z.number().int().positive(),
});

export class CartController {
  async getCart(req: AuthRequest, res: Response) {
    try {
      const cart = await cartService.getCart(req.user!.userId);
      return res.json({ success: true, data: cart });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async addItem(req: AuthRequest, res: Response) {
    try {
      const data = addItemSchema.parse(req.body);
      const item = await cartService.addItem(req.user!.userId, data);
      return res.status(201).json({ success: true, data: item });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, errors: error.issues });
      }
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateItem(req: AuthRequest, res: Response) {
    try {
      const { quantity } = updateItemSchema.parse(req.body);
      const item = await cartService.updateItem(
        req.user!.userId,
        req.params.id as string,
        quantity,
      );
      return res.json({ success: true, data: item });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, errors: error.issues });
      }
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async removeItem(req: AuthRequest, res: Response) {
    try {
      const result = await cartService.removeItem(
        req.user!.userId,
        req.params.id as string,
      );
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async clearCart(req: AuthRequest, res: Response) {
    try {
      const result = await cartService.clearCart(req.user!.userId);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
