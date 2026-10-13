-- CreateTable
CREATE TABLE "Admin" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "HecRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cnic" TEXT NOT NULL,
    "reference_number" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_on_degree" TEXT NOT NULL,
    "father_name" TEXT NOT NULL DEFAULT '',
    "date_of_birth" TEXT NOT NULL DEFAULT '',
    "enrollment_no" TEXT NOT NULL DEFAULT '',
    "degree_title" TEXT NOT NULL,
    "university" TEXT NOT NULL,
    "date_of_issuance" TEXT NOT NULL DEFAULT '',
    "attested_by" TEXT NOT NULL,
    "photo_url" TEXT,
    "pdf_url" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");
