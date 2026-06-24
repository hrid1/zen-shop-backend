import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
const productController = new ProductController();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management endpoints
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products with pagination and filters
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by category ID
 *         example: 507f1f77bcf86cd799439011
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Minimum price filter
 *         example: 100
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Maximum price filter
 *         example: 1000
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by product name, description, or SKU
 *         example: iPhone
 *       - in: query
 *         name: isFeatured
 *         schema:
 *           type: boolean
 *         description: Filter featured products
 *         example: true
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
 *           maximum: 100
 *           default: 20
 *         description: Number of products per page
 *         example: 20
 *     responses:
 *       200:
 *         description: List of products with pagination
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
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', (req, res) => productController.getAll(req, res));

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ProductDetail'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', (req, res) => productController.getById(req, res));

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryId
 *               - name
 *               - slug
 *               - description
 *               - sku
 *               - basePrice
 *               - variants
 *             properties:
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *                 description: Category ID
 *                 example: 507f1f77bcf86cd799439011
 *               name:
 *                 type: string
 *                 description: Product name
 *                 example: iPhone 15 Pro
 *               slug:
 *                 type: string
 *                 description: URL-friendly slug (must be unique)
 *                 example: iphone-15-pro
 *               description:
 *                 type: string
 *                 description: Product description
 *                 example: Apple iPhone 15 Pro with A17 Pro chip and titanium design
 *               shortDescription:
 *                 type: string
 *                 description: Short product description
 *                 example: The latest iPhone with advanced features
 *               sku:
 *                 type: string
 *                 description: Stock Keeping Unit (must be unique)
 *                 example: IP15P-256-SB
 *               basePrice:
 *                 type: number
 *                 minimum: 0
 *                 description: Base product price
 *                 example: 999.99
 *               compareAtPrice:
 *                 type: number
 *                 minimum: 0
 *                 description: Original price for sale display
 *                 example: 1199.99
 *               isFeatured:
 *                 type: boolean
 *                 default: false
 *                 description: Feature this product
 *                 example: true
 *               variants:
 *                 type: array
 *                 description: Product variants (colors, sizes, etc.)
 *                 items:
 *                   type: object
 *                   required:
 *                     - sku
 *                     - name
 *                     - price
 *                     - stockQuantity
 *                   properties:
 *                     sku:
 *                       type: string
 *                       description: Variant SKU
 *                       example: IP15P-256-SB-BLK
 *                     name:
 *                       type: string
 *                       description: Variant name
 *                       example: Space Black 256GB
 *                     price:
 *                       type: number
 *                       minimum: 0
 *                       description: Variant price
 *                       example: 1099.99
 *                     stockQuantity:
 *                       type: integer
 *                       minimum: 0
 *                       description: Available stock quantity
 *                       example: 50
 *                     attributes:
 *                       type: array
 *                       description: Variant attributes
 *                       items:
 *                         type: object
 *                         required:
 *                           - attributeName
 *                           - attributeValue
 *                         properties:
 *                           attributeName:
 *                             type: string
 *                             example: Color
 *                           attributeValue:
 *                             type: string
 *                             example: Space Black
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ProductDetail'
 *       400:
 *         description: Validation error or slug/SKU already exists
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
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', authenticate, authorize(['ADMIN']), (req, res) => productController.create(req, res));

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID to update
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Product name
 *                 example: iPhone 15 Pro Max
 *               description:
 *                 type: string
 *                 description: Product description
 *                 example: Apple iPhone 15 Pro Max with A17 Pro chip and titanium design
 *               basePrice:
 *                 type: number
 *                 minimum: 0
 *                 description: Base product price
 *                 example: 1099.99
 *               isActive:
 *                 type: boolean
 *                 description: Product availability status
 *                 example: true
 *               isFeatured:
 *                 type: boolean
 *                 description: Feature this product
 *                 example: true
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error
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
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', authenticate, authorize(['ADMIN']), (req, res) => productController.update(req, res));

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product (soft delete)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID to delete
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Product deleted successfully (soft delete)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *                 message:
 *                   type: string
 *                   example: Product deleted successfully
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
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', authenticate, authorize(['ADMIN']), (req, res) => productController.delete(req, res));

export default router;