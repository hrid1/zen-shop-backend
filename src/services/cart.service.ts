import prisma from "../config/database";


export class CartService {
  async getCart(userId: string) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            productVariant: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    images: {
                      where: { isPrimary: true },
                      take: 1,
                    },
                  },
                },
                attributes: true,
              },
            },
          },
        },
      },
    });

    if (!cart) throw new Error('Cart not found');

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + Number(item.priceAtAddition) * item.quantity;
    }, 0);

    return {
      ...cart,
      subtotal,
      itemCount: cart.items.length,
    };
  }

  async addItem(userId: string, data: {
    productVariantId: string;
    quantity: number;
  }) {
    // Get user's cart
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new Error('Cart not found');

    // Validate variant exists and has stock
    const variant = await prisma.productVariant.findUnique({
      where: { id: data.productVariantId },
    });

    if (!variant) throw new Error('Product variant not found');
    if (!variant.isActive) throw new Error('Product is not available');
    if (variant.stockQuantity < data.quantity) {
      throw new Error(`Only ${variant.stockQuantity} items in stock`);
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productVariantId: data.productVariantId,
      },
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + data.quantity;

      if (variant.stockQuantity < newQuantity) {
        throw new Error(`Only ${variant.stockQuantity} items in stock`);
      }

      return prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    }

    // Add new item
    return prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productVariantId: data.productVariantId,
        quantity: data.quantity,
        priceAtAddition: variant.price,
      },
    });
  }

  async updateItem(userId: string, itemId: string, quantity: number) {
    // Verify item belongs to user's cart
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new Error('Cart not found');

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { productVariant: true },
    });

    if (!item) throw new Error('Cart item not found');

    if (item.productVariant.stockQuantity < quantity) {
      throw new Error(`Only ${item.productVariant.stockQuantity} items in stock`);
    }

    return prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new Error('Cart not found');

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) throw new Error('Cart item not found');

    await prisma.cartItem.delete({ where: { id: itemId } });
    return { message: 'Item removed' };
  }

  async clearCart(userId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new Error('Cart not found');

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return { message: 'Cart cleared' };
  }
}