import { Request, Response } from "express";
import { ProductService } from "../services/product.service";
import { z } from "zod";

const productService = new ProductService();

const createSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  shortDescription: z.string().optional(),
  sku: z.string().min(1),
  basePrice: z.number().positive(),
  compareAtPrice: z.number().positive().optional(),
  isFeatured: z.boolean().optional(),
  variants: z
    .array(
      z.object({
        sku: z.string().min(1),
        name: z.string().min(1),
        price: z.number().positive(),
        stockQuantity: z.number().int().min(0),
        attributes: z.array(
          z.object({
            attributeName: z.string(),
            attributeValue: z.string(),
          }),
        ),
      }),
    )
    .min(1),
});

export class ProductController {
  async getAll(req: Request, res: Response) {
    try {
      const filters = {
        categoryId: req.query.categoryId as string,
        search: req.query.search as string,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        isFeatured: req.query.isFeatured === "true" ? true : undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
      };

      const data = await productService.getAll(filters);
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const data = await productService.getById(id);
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(404).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const data = createSchema.parse(req.body);
      const product = await productService.create(data);
      return res.status(201).json({ success: true, data: product });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, errors: error.errors });
      }
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const data = await productService.update(req.params.id, req.body);
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await productService.delete(req.params.id);
      return res.json({ success: true, message: "Product deleted" });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
