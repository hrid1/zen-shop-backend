import prisma from "../config/database";


export class OrderService {
  async createOrder(userId: string, data: {
    shippingAddressId: string;
    billingAddressId: string;
    notes?: string;
  }) {
    // Get cart with items
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            productVariant: {
              include: { product: true },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    // Validate stock for all items first
    for (const item of cart.items) {
      if (item.productVariant.stockQuantity < item.quantity) {
        throw new Error(
          `Insufficient stock for ${item.productVariant.product.name} - ${item.productVariant.name}`
        );
      }
    }

    // Validate addresses belong to user
    const [shippingAddress, billingAddress] = await Promise.all([
      prisma.address.findFirst({
        where: { id: data.shippingAddressId, userId },
      }),
      prisma.address.findFirst({
        where: { id: data.billingAddressId, userId },
      }),
    ]);

    if (!shippingAddress) throw new Error('Shipping address not found');
    if (!billingAddress) throw new Error('Billing address not found');

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + Number(item.priceAtAddition) * item.quantity;
    }, 0);

    const taxAmount = subtotal * 0.1;       // 10% tax
    const shippingCost = subtotal > 100 ? 0 : 10; // free shipping over $100
    const totalAmount = subtotal + taxAmount + shippingCost;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase()}`;

    // Create order in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId,
          orderNumber,
          shippingAddressId: data.shippingAddressId,
          billingAddressId: data.billingAddressId,
          subtotal,
          taxAmount,
          shippingCost,
          totalAmount,
          notes: data.notes,
          items: {
            create: cart.items.map((item) => ({
              productVariantId: item.productVariantId,
              productName: item.productVariant.product.name,
              variantName: item.productVariant.name,
              sku: item.productVariant.sku,
              quantity: item.quantity,
              unitPrice: item.priceAtAddition,
              totalPrice: Number(item.priceAtAddition) * item.quantity,
            })),
          },
          statusHistory: {
            create: {
              status: 'PENDING',
              notes: 'Order placed',
            },
          },
        },
        include: {
          items: true,
          shippingAddress: true,
          billingAddress: true,
          statusHistory: true,
        },
      });

      // Deduct stock for each variant
      for (const item of cart.items) {
        await tx.productVariant.update({
          where: { id: item.productVariantId },
          data: { stockQuantity: { decrement: item.quantity } },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    return order;
  }

  async getOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
        shippingAddress: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderById(userId: string, orderId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: {
          include: {
            productVariant: {
              include: { attributes: true },
            },
          },
        },
        shippingAddress: true,
        billingAddress: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!order) throw new Error('Order not found');
    return order;
  }

  async cancelOrder(userId: string, orderId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true },
    });

    if (!order) throw new Error('Order not found');

    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      throw new Error(`Cannot cancel order with status ${order.status}`);
    }

    // Cancel and restore stock in transaction
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: 'CANCELLED',
          notes: 'Cancelled by customer',
        },
      });

      // Restore stock
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.productVariantId },
          data: { stockQuantity: { increment: item.quantity } },
        });
      }
    });

    return { message: 'Order cancelled successfully' };
  }

  // Admin only
  async updateOrderStatus(orderId: string, status: string, notes?: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error('Order not found');

    return prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { status: status as any },
      }),
      prisma.orderStatusHistory.create({
        data: { orderId, status: status as any, notes },
      }),
    ]);
  }

  async getAllOrders() {
    return prisma.order.findMany({
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        items: true,
        shippingAddress: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}