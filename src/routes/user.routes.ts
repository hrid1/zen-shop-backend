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
 *         description: User profile retrieved successfully
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
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "01fd48bf-b4cf-4ced-9303-7bd224f2a002"
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: user@example.com
 *                     firstName:
 *                       type: string
 *                       example: John
 *                     lastName:
 *                       type: string
 *                       example: Doe
 *                     phoneNumber:
 *                       type: string
 *                       nullable: true
 *                       example: "+1234567890"
 *                     role:
 *                       type: string
 *                       enum: [CUSTOMER, ADMIN, VENDOR]
 *                       example: CUSTOMER
 *                     emailVerified:
 *                       type: boolean
 *                       example: false
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *                 minLength: 1
 *                 example: John
 *               lastName:
 *                 type: string
 *                 minLength: 1
 *                 example: Doe
 *               phoneNumber:
 *                 type: string
 *                 example: "+1234567890"
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     email:
 *                       type: string
 *                       format: email
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     phoneNumber:
 *                       type: string
 *                       nullable: true
 *                     role:
 *                       type: string
 *                       enum: [CUSTOMER, ADMIN, VENDOR]
 *       400:
 *         description: Validation error or user not found
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
router.put('/profile', (req, res) => userController.updateProfile(req as any, res));

/**
 * @swagger
 * /users/addresses:
 *   get:
 *     summary: Get current user's addresses
 *     description: Returns all saved addresses for the authenticated user, newest first.
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
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                       addressType:
 *                         type: string
 *                         enum: [SHIPPING, BILLING, BOTH]
 *                       fullName:
 *                         type: string
 *                       phoneNumber:
 *                         type: string
 *                       addressLine1:
 *                         type: string
 *                       addressLine2:
 *                         type: string
 *                         nullable: true
 *                       city:
 *                         type: string
 *                       state:
 *                         type: string
 *                       postalCode:
 *                         type: string
 *                       country:
 *                         type: string
 *                       isDefault:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
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
router.get('/addresses', (req, res) => userController.getAddresses(req as any, res));

/**
 * @swagger
 * /users/addresses:
 *   post:
 *     summary: Create a new address for current user
 *     description: Creates a saved address. When isDefault is true, all other addresses for the user are unset as default first.
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
 *               - addressType
 *               - fullName
 *               - phoneNumber
 *               - addressLine1
 *               - city
 *               - state
 *               - postalCode
 *               - country
 *             properties:
 *               addressType:
 *                 type: string
 *                 enum: [SHIPPING, BILLING, BOTH]
 *                 example: SHIPPING
 *               fullName:
 *                 type: string
 *                 minLength: 1
 *                 example: John Doe
 *               phoneNumber:
 *                 type: string
 *                 minLength: 1
 *                 example: "+1234567890"
 *               addressLine1:
 *                 type: string
 *                 minLength: 1
 *                 example: "123 Main Street"
 *               addressLine2:
 *                 type: string
 *                 example: "Apt 4B"
 *               city:
 *                 type: string
 *                 minLength: 1
 *                 example: New York
 *               state:
 *                 type: string
 *                 minLength: 1
 *                 example: NY
 *               postalCode:
 *                 type: string
 *                 minLength: 1
 *                 example: "10001"
 *               country:
 *                 type: string
 *                 minLength: 1
 *                 example: USA
 *               isDefault:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Address created successfully
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
 *                   description: Created address
 *       400:
 *         description: Validation error
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
router.post('/addresses', (req, res) => userController.createAddress(req as any, res));

/**
 * @swagger
 * /users/addresses/{id}:
 *   put:
 *     summary: Update an existing address
 *     description: Updates fields on an address owned by the authenticated user. When isDefault is true, all other addresses for the user are unset as default first.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Address ID
 *         example: "7f53a53d-0d23-48ee-92f5-4896fb791d3c"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               addressType:
 *                 type: string
 *                 enum: [SHIPPING, BILLING, BOTH]
 *                 example: BOTH
 *               fullName:
 *                 type: string
 *                 minLength: 1
 *                 example: Jane Doe
 *               phoneNumber:
 *                 type: string
 *                 minLength: 1
 *                 example: "+1234567890"
 *               addressLine1:
 *                 type: string
 *                 minLength: 1
 *                 example: "456 Oak Avenue"
 *               addressLine2:
 *                 type: string
 *                 example: "Suite 2C"
 *               city:
 *                 type: string
 *                 minLength: 1
 *                 example: Los Angeles
 *               state:
 *                 type: string
 *                 minLength: 1
 *                 example: CA
 *               postalCode:
 *                 type: string
 *                 minLength: 1
 *                 example: "90001"
 *               country:
 *                 type: string
 *                 minLength: 1
 *                 example: USA
 *               isDefault:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Address updated successfully
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
 *                   description: Updated address
 *       400:
 *         description: Validation error or address not found
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
 *           format: uuid
 *         description: Address ID
 *         example: "7f53a53d-0d23-48ee-92f5-4896fb791d3c"
 *     responses:
 *       200:
 *         description: Address deleted successfully
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
 *                       example: Address deleted
 *       400:
 *         description: Address not found
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
router.delete('/addresses/:id', (req, res) => userController.deleteAddress(req as any, res));

export default router;
