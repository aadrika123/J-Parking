-- CreateTable
CREATE TABLE "backup_scheduler" (
    "id" SERIAL NOT NULL,
    "original_id" INTEGER NOT NULL,
    "incharge_id" TEXT[],
    "location_id" INTEGER,
    "from_date" DATE NOT NULL,
    "to_date" DATE NOT NULL,
    "from_time" TEXT,
    "to_time" TEXT,
    "extended_hours" JSONB DEFAULT '[]',
    "is_scheduled" BOOLEAN NOT NULL DEFAULT true,
    "ulb_id" INTEGER NOT NULL DEFAULT 2,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "backup_scheduler_pkey" PRIMARY KEY ("id")
);
