-- CreateIndex
CREATE INDEX "Book_userId_idx" ON "Book"("userId");

-- CreateIndex
CREATE INDEX "Book_title_idx" ON "Book"("title");

-- CreateIndex
CREATE INDEX "Book_author_idx" ON "Book"("author");

-- CreateIndex
CREATE INDEX "User_lastname_idx" ON "User"("lastname");

-- CreateIndex
CREATE INDEX "User_role_isActive_idx" ON "User"("role", "isActive");
