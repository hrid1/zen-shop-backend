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
 *     summary: Create a new order from selected cart items
 *     description: Creates an order for the authenticated user using selected cart item IDs and saved address IDs. Ordered items are removed from the cart and stock is decremented.
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
 *               - shippingAddressId
 *               - billingAddressId
 *               - cartItemsIds
 *             properties:
 *               shippingAddressId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of a saved address owned by the authenticated user
 *                 example: "01fd48bf-b4cf-4ced-9303-7bd224f2a002"
 *               billingAddressId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of a saved address owned by the authenticated user
 *                 example: "7f53a53d-0d23-48ee-92f5-4896fb791d3c"
 *               cartItemsIds:
 *                 type: array
 *                 minItems: 1
 *                 description: Cart item IDs to include in the order
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 example:
 *                   - "586f9702-01b7-4b4b-8acd-91bcb16201df"
 *                   - "ba3f9607-1c83-4ed8-aa23-38189659cc4b"
 *               notes:
 *                 type: string
 *                 description: Optional order notes or special instructions
 *                 example: "Leave at the front desk"
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
 *                   type: object
 *                   description: Created order with items, shipping address, billing address, and status history
 *       400:
 *         description: Validation error, empty cart, missing selected cart item, missing address, or insufficient stock
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
router.post('/', authenticate, (req, res) => orderController.createOrder(req as any, res));

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get current user's orders
 *     description: Returns all orders for the authenticated user, newest first. This endpoint does not currently support pagination or filters.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of the user's orders
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
 *                     description: Order with items and shipping address
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
 */
router.get('/', authenticate, (req, res) => orderController.getOrders(req as any, res));

// ==================== ADMIN ROUTES ====================

/**
 * @swagger
 * /orders/admin/all:
 *   get:
 *     summary: Get all orders (Admin only)
 *     description: Returns every order, newest first, including user summary, items, and shipping address. This endpoint does not currently support pagination or filters.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all orders
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
 *                     description: Order with user summary, items, and shipping address
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
router.get('/admin/all', authenticate, authorize(['ADMIN']), (req, res) => orderController.getAllOrders(req, res));

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
 *         example: "cb42ccce-1fd8-4f3a-8a4f-8f2cd145ad55"
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
 *                 enum: [PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED]
 *                 description: New order status
 *                 example: SHIPPED
 *               notes:
 *                 type: string
 *                 description: Optional status history note
 *                 example: "Order shipped via courier"
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
 *                   type: array
 *                   description: Prisma transaction result containing the updated order and created status history entry
 *                   items:
 *                     type: object
 *       400:
 *         description: Validation error or order not found
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
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/admin/:id/status', authenticate, authorize(['ADMIN']), (req, res) => orderController.updateOrderStatus(req, res));

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     description: Returns a single order for the authenticated user, including items with product variant attributes, shipping address, billing address, and status history.
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
 *         example: "cb42ccce-1fd8-4f3a-8a4f-8f2cd145ad55"
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
 *                   type: object
 *                   description: Order with items, addresses, and status history
 *       401:
 *         description: Unauthorized - Authentication required
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
 *     description: Cancels an authenticated user's order when its status is PENDING or CONFIRMED, creates a status history entry, and restores stock.
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
 *         example: "cb42ccce-1fd8-4f3a-8a4f-8f2cd145ad55"
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
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Order cancelled successfully
 *       400:
 *         description: Order not found or order cannot be cancelled in its current status
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
 */
router.put('/:id/cancel', authenticate, (req, res) => orderController.cancelOrder(req as any, res));

export default router;
