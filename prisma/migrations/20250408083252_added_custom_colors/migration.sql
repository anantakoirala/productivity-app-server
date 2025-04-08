-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CustomColors" ADD VALUE 'CYAN';
ALTER TYPE "CustomColors" ADD VALUE 'LIME';
ALTER TYPE "CustomColors" ADD VALUE 'EMERALD';
ALTER TYPE "CustomColors" ADD VALUE 'INDIGO';
ALTER TYPE "CustomColors" ADD VALUE 'FUCHSIA';
