-- CreateTable
CREATE TABLE "public"."QuoteRequest" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "location" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "quantity" TEXT,
    "message" TEXT,
    "product" TEXT,
    "productImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuoteRequest_pkey" PRIMARY KEY ("id")
);
