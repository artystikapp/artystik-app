-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('email', 'sms', 'whatsapp');

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "event" "OrderStatus" NOT NULL,
    "sent_at" TIMESTAMP(3),
    "order_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_order_id_idx" ON "Notification"("order_id");

-- CreateIndex
CREATE INDEX "Notification_user_id_idx" ON "Notification"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_order_id_type_event_key" ON "Notification"("order_id", "type", "event");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
