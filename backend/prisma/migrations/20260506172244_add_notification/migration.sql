-- CreateTable
CREATE TABLE `notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type_role` VARCHAR(20) NOT NULL,
    `id_user` INTEGER NOT NULL,
    `titre` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `lu` BOOLEAN NOT NULL DEFAULT false,
    `lien` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notification_type_role_id_user_lu_idx`(`type_role`, `id_user`, `lu`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
