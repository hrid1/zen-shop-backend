import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { UserService } from "../services/user.service";
import { z } from "zod";

const userService = new UserService();

const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phoneNumber: z.string().optional(),
});

const addressSchema = z.object({
  addressType: z.enum(["SHIPPING", "BILLING", "BOTH"]),
  fullName: z.string().min(1),
  phoneNumber: z.string().min(1),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  isDefault: z.boolean().optional(),
});

export class UserController {


  async getProfile(req: AuthRequest, res: Response) {
    try {
      const user = await userService.getProfile(req.user!.userId);
      return res.json({ success: true, data: user });
    } catch (error: any) {
      return res.status(404).json({ success: false, message: error.message });
    }
  }


  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const data = updateProfileSchema.parse(req.body);
      const user = await userService.updateProfile(req.user!.userId, data);
      return res.json({ success: true, data: user });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, errors: error.errors });
      }
      return res.status(400).json({ success: false, message: error.message });
    }
  }


   async getAddresses(req: AuthRequest, res: Response) {
    try {
      const addresses = await userService.getAddresses(req.user!.userId);
      return res.json({ success: true, data: addresses });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async createAddress(req: AuthRequest, res: Response) {
    try {
      const data = addressSchema.parse(req.body);
      const address = await userService.createAddress(req.user!.userId, data);
      return res.status(201).json({ success: true, data: address });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, errors: error.errors });
      }
      return res.status(400).json({ success: false, message: error.message });
    }
  }


  async updateAddress(req: AuthRequest, res: Response) {
    try {
      const data = addressSchema.partial().parse(req.body);
      const address = await userService.updateAddress(req.user!.userId, req.params.id, data);
      return res.json({ success: true, data: address });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }


   async deleteAddress(req: AuthRequest, res: Response) {
    try {
      const result = await userService.deleteAddress(req.user!.userId, req.params.id);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

}
