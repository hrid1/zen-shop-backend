/*
  Warnings:

  - The `status` column on the `orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `billing_address_id` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shipping_address_id` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "billing_address_id" TEXT NOT NULL,
ADD COLUMN     "cancelled_at" TIMESTAMP(3),
ADD COLUMN     "coupon_code" TEXT,
ADD COLUMN     "discount_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "shipping_address_id" TEXT NOT NULL,
ADD COLUMN     "shipping_cost" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "subtotal" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "tax_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
DROP COLUMN "status",
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "product_variant_id" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "variant_name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "total_price" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_status_histories" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_status_histories_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_shipping_address_id_fkey" FOREIGN KEY ("shipping_address_id") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_billing_address_id_fkey" FOREIGN KEY ("billing_address_id") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_histories" ADD CONSTRAINT "order_status_histories_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
