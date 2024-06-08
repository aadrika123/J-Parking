-- CreateEnum
CREATE TYPE "type_parking_space" AS ENUM ('Organized', 'UnOrganized');

-- CreateEnum
CREATE TYPE "vehicle_type" AS ENUM ('two_wheeler', 'four_wheeler');

-- CreateTable
CREATE TABLE "parking_area" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "zip_code" TEXT NOT NULL,
    "station" TEXT NOT NULL,
    "landmark" TEXT NOT NULL,
    "two_wheeler_capacity" INTEGER NOT NULL,
    "four_wheeler_capacity" INTEGER NOT NULL,
    "total_parking_area" INTEGER,
    "agreement_doc" TEXT,
    "type_parking_space" "type_parking_space",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parking_area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parking_incharge" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "middle_name" TEXT,
    "last_name" TEXT NOT NULL,
    "age" TEXT NOT NULL,
    "blood_grp" TEXT NOT NULL,
    "mobile_no" TEXT NOT NULL,
    "emergency_mob_no" TEXT,
    "address" TEXT,
    "email_id" TEXT,
    "cunique_id" VARCHAR NOT NULL,
    "kyc_doc" TEXT,
    "fitness_doc" TEXT,
    "zip_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parking_incharge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduler" (
    "id" SERIAL NOT NULL,
    "incharge_id" TEXT,
    "location_id" INTEGER,
    "zip_code" TEXT,
    "from_date" DATE NOT NULL,
    "to_date" DATE NOT NULL,
    "from_time" INTEGER,
    "to_time" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scheduler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipts" (
    "id" SERIAL NOT NULL,
    "incharge_id" TEXT NOT NULL,
    "area_id" INTEGER NOT NULL,
    "vehicle_type" "vehicle_type" NOT NULL,
    "type_parking_space" "type_parking_space",
    "vehicle_no" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "receipt_no" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "time" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "receipts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "parking_incharge_cunique_id_key" ON "parking_incharge"("cunique_id");

-- CreateIndex
CREATE UNIQUE INDEX "receipts_receipt_no_key" ON "receipts"("receipt_no");

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_incharge_id_fkey" FOREIGN KEY ("incharge_id") REFERENCES "parking_incharge"("cunique_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "parking_area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
