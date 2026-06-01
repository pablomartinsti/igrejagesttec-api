/*
  Warnings:

  - A unique constraint covering the columns `[title,churchId]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `churchId` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `churchId` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'TREASURER', 'PASTOR');

-- CreateEnum
CREATE TYPE "CultoType" AS ENUM ('FRIDAY_NIGHT', 'SUNDAY_MORNING', 'SUNDAY_NIGHT');

-- DropIndex
DROP INDEX "categories_title_key";

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "churchId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "churchId" TEXT NOT NULL,
ADD COLUMN     "cultoId" TEXT;

-- CreateTable
CREATE TABLE "churches" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT,
    "city" TEXT,
    "state" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "churches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'TREASURER',
    "churchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cultos" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "CultoType" NOT NULL,
    "preacher" TEXT,
    "churchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cultos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dizimistas" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "contributionType" TEXT,
    "cultoId" TEXT NOT NULL,

    CONSTRAINT "dizimistas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spiritual_categories" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,

    CONSTRAINT "spiritual_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spiritual_records" (
    "id" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "cultoId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "spiritual_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "churches_cnpj_key" ON "churches"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "spiritual_categories_title_churchId_key" ON "spiritual_categories"("title", "churchId");

-- CreateIndex
CREATE UNIQUE INDEX "categories_title_churchId_key" ON "categories"("title", "churchId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "churches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cultos" ADD CONSTRAINT "cultos_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "churches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dizimistas" ADD CONSTRAINT "dizimistas_cultoId_fkey" FOREIGN KEY ("cultoId") REFERENCES "cultos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spiritual_categories" ADD CONSTRAINT "spiritual_categories_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "churches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spiritual_records" ADD CONSTRAINT "spiritual_records_cultoId_fkey" FOREIGN KEY ("cultoId") REFERENCES "cultos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spiritual_records" ADD CONSTRAINT "spiritual_records_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "spiritual_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "churches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "churches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_cultoId_fkey" FOREIGN KEY ("cultoId") REFERENCES "cultos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
