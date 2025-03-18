/*
  Warnings:

  - The values [AVAILABLE,SOLD] on the enum `ProductStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to alter the column `price` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'paid', 'shipped', 'delivered', 'failed', 'refunded');

-- AlterEnum
BEGIN;
CREATE TYPE "ProductStatus_new" AS ENUM ('available', 'sold', 'archived');
ALTER TABLE "Product" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Product" ALTER COLUMN "status" TYPE "ProductStatus_new" USING ("status"::text::"ProductStatus_new");
ALTER TYPE "ProductStatus" RENAME TO "ProductStatus_old";
ALTER TYPE "ProductStatus_new" RENAME TO "ProductStatus";
DROP TYPE "ProductStatus_old";
ALTER TABLE "Product" ALTER COLUMN "status" SET DEFAULT 'available';
COMMIT;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "price" SET DATA TYPE INTEGER,
ALTER COLUMN "status" SET DEFAULT 'available';

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "razorpayOrderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "OrderStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
