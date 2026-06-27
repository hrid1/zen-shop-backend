import { Request, Response } from "express";
import z from "zod";
import { ReviewService } from "../services/review.service";
import { AuthRequest } from "../middleware/auth.middleware";

const reviewService = new ReviewService();

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  comment: z.string().min(10),
  // orderId: z.string().uuid().optional(),
});

const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(100).optional(),
  comment: z.string().min(10).optional(),
});

export class ReviewController {
  async getProductReviews(req: Request, res: Response) {
    try {
      const page = Number(req.query.page || 1);
      const limit = Number(req.query.limit || 10);
      const productId = req.params.productId as string;

      const data = await reviewService.getProductReviews(
        productId,
        page,
        limit,
      );
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async createReview(req: AuthRequest, res: Response) {
    try {
      const data = createReviewSchema.parse(req.body);
      const review = await reviewService.createReview(
        req.user!.userId,
        req.params.productId as string,
        data,
      );
      return res.status(201).json({ success: true, data: review });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, errors: error.issues });
      }
      return res
        .status(400)
        .json({
          success: false,
          message: getErrorMessage(error, "Failed to create review"),
        });
    }
  }

  async updateReview(req: AuthRequest, res: Response) {
    try {
      const data = updateReviewSchema.parse(req.body);
      const review = await reviewService.updateReview(
        req.user!.userId,
        req.params.reviewId as string,
        data,
      );
      return res.json({ success: true, data: review });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, errors: error.issues });
      }
      return res.status(400).json({
        success: false,
        message: getErrorMessage(error, "Failed to update review"),
      });
    }
  }

  async deleteReview(req: AuthRequest, res: Response) {
    try {
      await reviewService.deleteReview(
        req.user!.userId,
        req.params.reviewId as string,
      );
      return res.json({
        success: true,
        message: "Review deleted successfully",
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async markHelpful(req: Request, res: Response) {
    try {
      const review = await reviewService.markHelpful(req.params.id as string);
      return res.json({ success: true, data: review });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  //   Admin Only
  
  async approveReview(req: Request, res: Response) {
    try {
      const review = await reviewService.approveReview(req.params.id as string);
      return res.json({ success: true, data: review });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async getPendingReviews(req: Request, res: Response) {
    try {
      const reviews = await reviewService.getPendingReviews();
      return res.json({ success: true, data: reviews });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
