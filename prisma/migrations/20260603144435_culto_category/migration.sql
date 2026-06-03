/*
  Warnings:

  - You are about to drop the column `type` on the `cultos` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `cultos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cultos" DROP COLUMN "type",
ADD COLUMN     "categoryId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "dizimistas" ALTER COLUMN "name" DROP NOT NULL;

-- DropEnum
DROP TYPE "CultoType";

-- CreateTable
CREATE TABLE "culto_categories" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,

    CONSTRAINT "culto_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "culto_categories_title_churchId_key" ON "culto_categories"("title", "churchId");

-- AddForeignKey
ALTER TABLE "culto_categories" ADD CONSTRAINT "culto_categories_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "churches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cultos" ADD CONSTRAINT "cultos_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "culto_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
