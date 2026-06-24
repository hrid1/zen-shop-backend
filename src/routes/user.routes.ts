import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const userController = new UserController();

// All routes protected
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile and address management
 */

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: user_123
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     firstName:
 *                       type: string
 *                       example: John
 *                     lastName:
 *                       type: string
 *                       example: Doe
 *                     phoneNumber:
 *                       type: string
 *                       example: +1234567890
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Authentication required
 *       500:
 *         description: Internal server error
 */
router.get('/profile', (req, res) => userController.getProfile(req as any, res));

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *                 description: User's first name
 *               lastName:
 *                 type: string
 *                 example: Doe
 *                 description: User's last name
 *               phoneNumber:
 *                 type: string
 *                 example: +1234567890
 *                 description: User's phone number with country code
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: user_123
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     firstName:
 *                       type: string
 *                       example: John
 *                     lastName:
 *                       type: string
 *                       example: Doe
 *                     phoneNumber:
 *                       type: string
 *                       example: +1234567890
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Invalid phone number format
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       500:
 *         description: Internal server error
 */
router.put('/profile', (req, res) => userController.updateProfile(req as any, res));

/**
 * @swagger
 * /users/addresses:
 *   get:
 *     summary: Get all addresses for current user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User addresses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: addr_123
 *                       userId:
 *                         type: string
 *                         example: user_123
 *                       street:
 *                         type: string
 *                         example: 123 Main Street
 *                       city:
 *                         type: string
 *                         example: New York
 *                       state:
 *                         type: string
 *                         example: NY
 *                       zipCode:
 *                         type: string
 *                         example: 10001
 *                       country:
 *                         type: string
 *                         example: USA
 *                       isDefault:
 *                         type: boolean
 *                         example: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       500:
 *         description: Internal server error
 */
router.get('/addresses', (req, res) => userController.getAddresses(req as any, res));

/**
 * @swagger
 * /users/addresses:
 *   post:
 *     summary: Create a new address for current user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - street
 *               - city
 *               - state
 *               - zipCode
 *               - country
 *             properties:
 *               street:
 *                 type: string
 *                 example: 123 Main Street
 *                 description: Street address
 *               apartment:
 *                 type: string
 *                 example: Apt 4B
 *                 description: Apartment or suite number (optional)
 *               city:
 *                 type: string
 *                 example: New York
 *                 description: City
 *               state:
 *                 type: string
 *                 example: NY
 *                 description: State or province
 *               zipCode:
 *                 type: string
 *                 example: 10001
 *                 description: Postal/ZIP code
 *               country:
 *                 type: string
 *                 example: USA
 *                 description: Country
 *               isDefault:
 *                 type: boolean
 *                 example: true
 *                 description: Set as default address
 *               label:
 *                 type: string
 *                 example: Home
 *                 description: Address label (e.g., Home, Work)
 *     responses:
 *       201:
 *         description: Address created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: addr_123
 *                     userId:
 *                       type: string
 *                       example: user_123
 *                     street:
 *                       type: string
 *                       example: 123 Main Street
 *                     apartment:
 *                       type: string
 *                       example: Apt 4B
 *                     city:
 *                       type: string
 *                       example: New York
 *                     state:
 *                       type: string
 *                       example: NY
 *                     zipCode:
 *                       type: string
 *                       example: 10001
 *                     country:
 *                       type: string
 *                       example: USA
 *                     isDefault:
 *                       type: boolean
 *                       example: true
 *                     label:
 *                       type: string
 *                       example: Home
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: All required fields must be provided
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       500:
 *         description: Internal server error
 */
router.post('/addresses', (req, res) => userController.createAddress(req as any, res));

/**
 * @swagger
 * /users/addresses/{id}:
 *   put:
 *     summary: Update an existing address
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Address ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               street:
 *                 type: string
 *                 example: 456 Oak Avenue
 *               apartment:
 *                 type: string
 *                 example: Suite 2C
 *               city:
 *                 type: string
 *                 example: Los Angeles
 *               state:
 *                 type: string
 *                 example: CA
 *               zipCode:
 *                 type: string
 *                 example: 90001
 *               country:
 *                 type: string
 *                 example: USA
 *               isDefault:
 *                 type: boolean
 *                 example: false
 *               label:
 *                 type: string
 *                 example: Work
 *     responses:
 *       200:
 *         description: Address updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: addr_123
 *                     userId:
 *                       type: string
 *                       example: user_123
 *                     street:
 *                       type: string
 *                       example: 456 Oak Avenue
 *                     city:
 *                       type: string
 *                       example: Los Angeles
 *                     state:
 *                       type: string
 *                       example: CA
 *                     zipCode:
 *                       type: string
 *                       example: 90001
 *                     country:
 *                       type: string
 *                       example: USA
 *                     isDefault:
 *                       type: boolean
 *                       example: false
 *                     label:
 *                       type: string
 *                       example: Work
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       404:
 *         description: Address not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Address not found
 *       500:
 *         description: Internal server error
 */
router.put('/addresses/:id', (req, res) => userController.updateAddress(req as any, res));

/**
 * @swagger
 * /users/addresses/{id}:
 *   delete:
 *     summary: Delete an address
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Address ID
 *     responses:
 *       200:
 *         description: Address deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Address deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       404:
 *         description: Address not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Address not found
 *       500:
 *         description: Internal server error
 */
router.delete('/addresses/:id', (req, res) => userController.deleteAddress(req as any, res));

export default router;