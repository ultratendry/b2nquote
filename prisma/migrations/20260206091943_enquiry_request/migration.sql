-- CreateTable
CREATE TABLE "public"."EnquiryRequest" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "productTitle" TEXT,
    "productImage" TEXT,
    "itemCode" TEXT,
    "unitPrice" TEXT,
    "quantity" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnquiryRequest_pkey" PRIMARY KEY ("id")
);
