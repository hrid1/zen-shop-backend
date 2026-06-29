import { Router } from "express";
import { CouponController } from "../controllers/coupon.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();
const couponController = new CouponController();

// Customer
router.post("/validate", authenticate, (req, res) =>
  couponController.validate(req as any, res),
);

// Admin
router.get("/", authenticate, authorize(["ADMIN"]), (req, res) =>
  couponController.getAll(req, res),
);
router.post("/", authenticate, authorize(["ADMIN"]), (req, res) =>
  couponController.create(req, res),
);
router.put("/:id/toggle", authenticate, authorize(["ADMIN"]), (req, res) =>
  couponController.toggleActive(req, res),
);
router.delete("/:id", authenticate, authorize(["ADMIN"]), (req, res) =>
  couponController.delete(req, res),
);

export default router;
