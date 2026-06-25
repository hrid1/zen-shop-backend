import { Request, Response } from 'express';

import { z } from 'zod';
import { OrderService } from '../services/order.service';
import { AuthRequest } from '../middleware/auth.middleware';

const orderService = new OrderService();

const createOrderSchema = z.object({
  shippingAddressId: z.string().uuid(),
  billingAddressId: z.string().uuid(),
  notes: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
  notes: z.string().optional(),
});

export class OrderController {
  async createOrder(req: AuthRequest, res: Response) {
    try {
      const data = createOrderSchema.parse(req.body);
      const order = await orderService.createOrder(req.user!.userId, data);
      return res.status(201).json({ success: true, data: order });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, errors: error.issues });
      }
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async getOrders(req: AuthRequest, res: Response) {
    try {
      const orders = await orderService.getOrders(req.user!.userId);
      return res.json({ success: true, data: orders });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async getOrderById(req: AuthRequest, res: Response) {
    try {
      const order = await orderService.getOrderById(req.user!.userId, req.params.id as string);
      return res.json({ success: true, data: order });
    } catch (error: any) {
      return res.status(404).json({ success: false, message: error.message });
    }
  }

  async cancelOrder(req: AuthRequest, res: Response) {
    try {
      const result = await orderService.cancelOrder(req.user!.userId, req.params.id as string);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // Admin only
  async getAllOrders(req: Request, res: Response) {
    try {
      const orders = await orderService.getAllOrders();
      return res.json({ success: true, data: orders });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateOrderStatus(req: Request, res: Response) {
    try {
      const { status, notes } = updateStatusSchema.parse(req.body);
      const result = await orderService.updateOrderStatus(req.params.id as string, status, notes);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, errors: error.issues });
      }
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}