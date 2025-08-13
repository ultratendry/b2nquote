-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(255) NOT NULL,
    `shop` VARCHAR(255) NOT NULL,
    `state` VARCHAR(255) NOT NULL,
    `isOnline` BOOLEAN NOT NULL DEFAULT false,
    `scope` VARCHAR(255) NULL,
    `expires` DATETIME(3) NULL,
    `accessToken` TEXT NOT NULL,
    `userId` BIGINT NULL,
    `firstName` VARCHAR(255) NULL,
    `lastName` VARCHAR(255) NULL,
    `email` VARCHAR(255) NULL,
    `accountOwner` BOOLEAN NOT NULL DEFAULT false,
    `locale` VARCHAR(50) NULL,
    `collaborator` BOOLEAN NULL DEFAULT false,
    `emailVerified` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Quote` (
    `id` VARCHAR(255) NOT NULL,
    `fullName` VARCHAR(255) NOT NULL,
    `company` VARCHAR(255) NOT NULL,
    `location` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `quantity` INTEGER NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(50) NOT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
