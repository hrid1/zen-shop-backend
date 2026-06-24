import { Request, Response } from "express";
import { CategoryService } from "../services/category.service";
import { z } from "zod";

const categoryService = new CategoryService();

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  parentCategoryId: z.string().uuid().nullish(),
  imageUrl: z.string().url().optional(),
  displayOrder: z.number().optional(),
});

export class CategoryController {
  async getAll(req: Request, res: Response) {
    try {
      const data = await categoryService.getAll();
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const data = await categoryService.getById(req.params.id as string);
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(404).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const data = createSchema.parse(req.body);
      const category = await categoryService.create(data);
      return res.status(201).json({ success: true, data: category });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, errors: error.issues }); // ← shows validation errors
      }
      return res.status(400).json({ success: false, message: error.message }); // ← shows other errors
    }
  }

  async update(req: Request, res: Response) {
    try {
      const data = await categoryService.update(
        req.params.id as string,
        req.body,
      );
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await categoryService.delete(req.params.id as string);
      return res.json({ success: true, message: "Category deleted" });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
