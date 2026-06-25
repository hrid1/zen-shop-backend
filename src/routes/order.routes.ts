import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';


const router = Router();
const orderController = new OrderController();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management endpoints
 */

// ==================== CUSTOMER ROUTES ====================

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order from cart
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shippingAddress
 *               - paymentMethod
 *             properties:
 *               shippingAddress:
 *                 type: object
 *                 required:
 *                   - street
 *                   - city
 *                   - state
 *                   - postalCode
 *                   - country
 *                 properties:
 *                   street:
 *                     type: string
 *                     example: "123 Main St"
 *                   city:
 *                     type: string
 *                     example: "New York"
 *                   state:
 *                     type: string
 *                     example: "NY"
 *                   postalCode:
 *                     type: string
 *                     example: "10001"
 *                   country:
 *                     type: string
 *                     example: "USA"
 *               paymentMethod:
 *                 type: string
 *                 enum: [CREDIT_CARD, DEBIT_CARD, PAYPAL, BANK_TRANSFER]
 *                 example: CREDIT_CARD
 *               notes:
 *                 type: string
 *                 description: Order notes or special instructions
 *                 example: "Leave at front door"
 *               couponCode:
 *                 type: string
 *                 description: Coupon code for discount
 *                 example: "SAVE10"
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Validation error or cart is empty
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ValidationError'
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Cart not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', authenticate, (req, res) => orderController.createOrder(req as any, res));

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get current user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED]
 *         description: Filter by order status
 *         example: PROCESSING
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of orders per page
 *         example: 10
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter orders from this date
 *         example: 2024-01-01
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter orders until this date
 *         example: 2024-12-31
 *     responses:
 *       200:
 *         description: List of user's orders with pagination
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
 *                   properties:
 *                     orders:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/OrderSummary'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', authenticate, (req, res) => orderController.getOrders(req as any, res));

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order ID
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/OrderDetail'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Not your order
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', authenticate, (req, res) => orderController.getOrderById(req as any, res));

/**
 * @swagger
 * /orders/{id}/cancel:
 *   put:
 *     summary: Cancel an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order ID to cancel
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Cancellation reason
 *                 example: "Changed my mind"
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *                 message:
 *                   type: string
 *                   example: Order cancelled successfully
 *       400:
 *         description: Order cannot be cancelled (already shipped/delivered)
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
 *         description: Forbidden - Not your order
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id/cancel', authenticate, (req, res) => orderController.cancelOrder(req as any, res));

// ==================== ADMIN ROUTES ====================

/**
 * @swagger
 * /orders/admin/all:
 *   get:
 *     summary: Get all orders (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED]
 *         description: Filter by order status
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by user ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of orders per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, total, status]
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter orders from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter orders until this date
 *     responses:
 *       200:
 *         description: List of all orders with pagination
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
 *                   properties:
 *                     orders:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/OrderAdminSummary'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalOrders:
 *                           type: integer
 *                         totalRevenue:
 *                           type: number
 *                         pendingOrders:
 *                           type: integer
 *                         processingOrders:
 *                           type: integer
 *                         shippedOrders:
 *                           type: integer
 *                         deliveredOrders:
 *                           type: integer
 *                         cancelledOrders:
 *                           type: integer
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
router.get('/admin/all', authenticate, authorize('ADMIN'), (req, res) => orderController.getAllOrders(req, res));

/**
 * @swagger
 * /orders/admin/{id}/status:
 *   put:
 *     summary: Update order status (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order ID to update
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED]
 *                 description: New order status
 *                 example: SHIPPED
 *               trackingNumber:
 *                 type: string
 *                 description: Tracking number for shipped orders
 *                 example: "1Z999AA10123456784"
 *               notes:
 *                 type: string
 *                 description: Admin notes
 *                 example: "Order shipped via FedEx"
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *                 message:
 *                   type: string
 *                   example: Order status updated successfully
 *       400:
 *         description: Invalid status transition
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
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/admin/:id/status', authenticate, authorize('ADMIN'), (req, res) => orderController.updateOrderStatus(req, res));

export default router;