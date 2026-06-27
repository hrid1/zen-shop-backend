import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';



const router = Router({ mergeParams: true }); // ← mergeParams to access productId
const reviewController = new ReviewController();

// public
router.get('/', (req, res) => reviewController.getProductReviews(req, res));
router.post('/:id/helpful', (req,res) => reviewController.markHelpful(req, res));


// customer
router.post('/', authenticate, (req, res) => reviewController.createReview(req as any, res));
router.put('/:id', authenticate, (req, res) => reviewController.updateReview(req as any, res));
router.delete('/:id', authenticate, (req, res) => reviewController.deleteReview(req as any, res))

// Admin
// Admin
router.get('/admin/pending', authenticate, authorize(['ADMIN']), (req, res) => reviewController.getPendingReviews(req, res));
router.put('/admin/:id/approve', authenticate, authorize(['ADMIN']), (req, res) => reviewController.approveReview(req, res));

export default router;