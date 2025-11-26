/*
  Warnings:

  - You are about to drop the column `cityId` on the `ParkingArea` table. All the data in the column will be lost.
  - You are about to drop the `City` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `city` to the `ParkingArea` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ParkingArea" DROP CONSTRAINT "ParkingArea_cityId_fkey";

-- AlterTable
ALTER TABLE "ParkingArea" DROP COLUMN "cityId",
ADD COLUMN     "city" TEXT NOT NULL;

-- DropTable
DROP TABLE "City";
