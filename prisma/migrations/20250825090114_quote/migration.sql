/*
  Warnings:

  - The primary key for the `Quote` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Quote` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Quote" DROP CONSTRAINT "Quote_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ADD CONSTRAINT "Quote_pkey" PRIMARY KEY ("id");
