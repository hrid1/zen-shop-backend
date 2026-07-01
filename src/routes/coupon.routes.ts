import { Router } from "express";
import { CouponController } from "../controllers/coupon.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();
const couponController = new CouponController();

/**
 * @swagger
 * tags:
 *   name: Coupons
 *   description: Coupon validation and admin management endpoints
 */

// Customer
/**
 * @swagger
 * /coupons/validate:
 *   post:
 *     summary: Validate a coupon for the current user
 *     description: Checks coupon availability, validity dates, usage limits, and minimum order value for the authenticated user.
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - orderSubtotal
 *             properties:
 *               code:
 *                 type: string
 *                 minLength: 1
 *                 description: Coupon code to validate
 *                 example: SUMMER20
 *               orderSubtotal:
 *                 type: number
 *                 minimum: 0
 *                 exclusiveMinimum: true
 *                 description: Current order subtotal before coupon discount
 *                 example: 149.99
 *     responses:
 *       200:
 *         description: Coupon validated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   description: Coupon validation result
 *       400:
 *         description: Validation error, invalid coupon, inactive coupon, expired coupon, usage limit reached, or minimum order value not met
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: false
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: object
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/validate", authenticate, (req, res) =>
  couponController.validate(req as any, res),
);



// Admin
/**
 * @swagger
 * /coupons:
 *   get:
 *     summary: Get all coupons (Admin only)
 *     description: Returns all coupons sorted newest first, including usage count metadata.
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of coupons
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: 0f78f691-f0a3-49cf-bb50-d2f422a5c8ef
 *                       code:
 *                         type: string
 *                         example: SUMMER20
 *                       description:
 *                         type: string
 *                         nullable: true
 *                         example: 20% off summer sale
 *                       discountType:
 *                         type: string
 *                         enum: [PERCENTAGE, FIXED_AMOUNT, FREE_SHIPPING]
 *                         example: PERCENTAGE
 *                       discountValue:
 *                         type: number
 *                         example: 20
 *                       minOrderValue:
 *                         type: number
 *                         nullable: true
 *                         example: 100
 *                       maxDiscountAmount:
 *                         type: number
 *                         nullable: true
 *                         example: 50
 *                       usageLimit:
 *                         type: integer
 *                         nullable: true
 *                         example: 500
 *                       usageCount:
 *                         type: integer
 *                         example: 42
 *                       usagePerUserLimit:
 *                         type: integer
 *                         example: 1
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *                       validFrom:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-07-01T00:00:00.000Z
 *                       validUntil:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: 2026-07-31T23:59:59.000Z
 *                       _count:
 *                         type: object
 *                         properties:
 *                           usages:
 *                             type: integer
 *                             example: 42
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", authenticate, authorize(["ADMIN"]), (req, res) =>
  couponController.getAll(req, res),
);

/**
 * @swagger
 * /coupons:
 *   post:
 *     summary: Create a coupon (Admin only)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - discountType
 *               - discountValue
 *               - validFrom
 *             properties:
 *               code:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 20
 *                 description: Unique coupon code
 *                 example: SUMMER20
 *               description:
 *                 type: string
 *                 example: 20% off summer sale
 *               discountType:
 *                 type: string
 *                 enum: [PERCENTAGE, FIXED_AMOUNT, FREE_SHIPPING]
 *                 example: PERCENTAGE
 *               discountValue:
 *                 type: number
 *                 minimum: 0
 *                 exclusiveMinimum: true
 *                 example: 20
 *               minOrderValue:
 *                 type: number
 *                 minimum: 0
 *                 exclusiveMinimum: true
 *                 example: 100
 *               maxDiscountAmount:
 *                 type: number
 *                 minimum: 0
 *                 exclusiveMinimum: true
 *                 example: 50
 *               usageLimit:
 *                 type: integer
 *                 minimum: 1
 *                 example: 500
 *               usagePerUserLimit:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *                 example: 1
 *               validFrom:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-07-01T00:00:00.000Z
 *               validUntil:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-07-31T23:59:59.000Z
 *     responses:
 *       201:
 *         description: Coupon created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   description: Created coupon
 *       400:
 *         description: Validation error or coupon code already exists
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: false
 *                     error:
 *                       type: array
 *                       items:
 *                         type: object
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", authenticate, authorize(["ADMIN"]), (req, res) =>
  couponController.create(req, res),
);

/**
 * @swagger
 * /coupons/{id}/toggle:
 *   put:
 *     summary: Toggle coupon active status (Admin only)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Coupon ID to toggle
 *         example: 0f78f691-f0a3-49cf-bb50-d2f422a5c8ef
 *     responses:
 *       200:
 *         description: Coupon active status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   description: Updated coupon
 *       400:
 *         description: Coupon not found or bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/:id/toggle", authenticate, authorize(["ADMIN"]), (req, res) =>
  couponController.toggleActive(req, res),
);

/**
 * @swagger
 * /coupons/{id}:
 *   delete:
 *     summary: Delete a coupon (Admin only)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Coupon ID to delete
 *         example: 0f78f691-f0a3-49cf-bb50-d2f422a5c8ef
 *     responses:
 *       200:
 *         description: Coupon deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   description: Delete result
 *       400:
 *         description: Coupon not found or bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/:id", authenticate, authorize(["ADMIN"]), (req, res) =>
  couponController.delete(req, res),
);

export default router;
