-- AlterTable
ALTER TABLE "scheduler" ADD COLUMN     "is_scheduled" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "extended_hours" SET DEFAULT '[]';
