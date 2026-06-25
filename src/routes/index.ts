import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import categoryRoutes from './category.routes';
import productRoutes from './product.routes';
import cartRoutes from './cart.routes'
import orderRoutes from './order.routes'

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes )
router.use('/orders', orderRoutes);



router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

export default router;