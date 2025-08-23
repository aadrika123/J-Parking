-- CreateEnum
CREATE TYPE "sub_type_parking_space" AS ENUM ('Indoor', 'Outdoor', 'Covered', 'Open', 'Basement', 'Rooftop', 'Automated', 'Others');

-- AlterTable
ALTER TABLE "parking_area" ADD COLUMN     "sub_type_parking_space" "sub_type_parking_space";
