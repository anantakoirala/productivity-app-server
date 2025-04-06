-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "userRole" "UserPermission" NOT NULL DEFAULT 'READ_ONLY';
