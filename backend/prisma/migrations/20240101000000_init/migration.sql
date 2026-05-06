-- CreateTable admin
CREATE TABLE `admin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(100) NOT NULL,
    `prenom` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `mot_de_passe` VARCHAR(255) NOT NULL,
    `telephone` VARCHAR(20) NULL,
    `statut` ENUM('actif', 'inactif') NOT NULL DEFAULT 'actif',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `admin_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable proprietaire
CREATE TABLE `proprietaire` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(100) NOT NULL,
    `prenom` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `mot_de_passe` VARCHAR(255) NOT NULL,
    `telephone` VARCHAR(20) NOT NULL,
    `cin` VARCHAR(20) NOT NULL,
    `rib` VARCHAR(50) NULL,
    `banque` VARCHAR(100) NULL,
    `statut_verification` ENUM('en_attente', 'verifie', 'refuse', 'suspendu') NOT NULL DEFAULT 'en_attente',
    `date_inscription` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `date_verification` DATETIME(3) NULL,
    `id_admin_verificateur` INTEGER NULL,

    UNIQUE INDEX `proprietaire_email_key`(`email`),
    UNIQUE INDEX `proprietaire_cin_key`(`cin`),
    INDEX `proprietaire_statut_verification_idx`(`statut_verification`),
    INDEX `proprietaire_id_admin_verificateur_fkey`(`id_admin_verificateur`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable client
CREATE TABLE `client` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(100) NOT NULL,
    `prenom` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `mot_de_passe` VARCHAR(255) NOT NULL,
    `telephone` VARCHAR(20) NULL,
    `date_naissance` DATE NULL,
    `nationalite` VARCHAR(100) NULL,
    `adresse` VARCHAR(500) NULL,
    `statut` ENUM('actif', 'suspendu') NOT NULL DEFAULT 'actif',
    `date_inscription` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `client_email_key`(`email`),
    INDEX `client_statut_idx`(`statut`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable appartement
CREATE TABLE `appartement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_proprietaire` INTEGER NOT NULL,
    `titre` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `adresse` VARCHAR(500) NOT NULL,
    `ville` VARCHAR(100) NOT NULL DEFAULT 'Oued Laou',
    `region` VARCHAR(150) NOT NULL DEFAULT 'Tanger-Tétouan-Al Hoceima',
    `surface_m2` DOUBLE NOT NULL,
    `nb_chambres` INTEGER NOT NULL,
    `nb_salles_bain` INTEGER NOT NULL,
    `capacite_max` INTEGER NOT NULL,
    `prix_nuit` DECIMAL(10, 2) NOT NULL,
    `caution` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `equipements` TEXT NOT NULL,
    `statut` ENUM('disponible', 'en_attente_validation', 'suspendu', 'archive') NOT NULL DEFAULT 'en_attente_validation',
    `latitude` DECIMAL(10, 7) NULL,
    `longitude` DECIMAL(10, 7) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `appartement_statut_ville_prix_nuit_idx`(`statut`, `ville`, `prix_nuit`),
    INDEX `appartement_id_proprietaire_idx`(`id_proprietaire`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable image_appartement
CREATE TABLE `image_appartement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_appartement` INTEGER NOT NULL,
    `url_image` VARCHAR(500) NOT NULL,
    `nom_fichier` VARCHAR(255) NOT NULL,
    `taille_ko` INTEGER NULL,
    `format` ENUM('jpg', 'png', 'webp') NOT NULL DEFAULT 'webp',
    `est_principale` BOOLEAN NOT NULL DEFAULT false,
    `ordre_affichage` INTEGER NOT NULL DEFAULT 0,
    `date_upload` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `image_appartement_id_appartement_est_principale_idx`(`id_appartement`, `est_principale`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable reservation
CREATE TABLE `reservation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_client` INTEGER NOT NULL,
    `id_appartement` INTEGER NOT NULL,
    `date_arrivee` DATE NOT NULL,
    `date_depart` DATE NOT NULL,
    `nb_nuits` INTEGER NOT NULL,
    `nb_personnes` INTEGER NOT NULL,
    `prix_nuit_applique` DECIMAL(10, 2) NOT NULL,
    `prix_total` DECIMAL(10, 2) NOT NULL,
    `statut` ENUM('en_attente', 'confirmee', 'annulee_client', 'annulee_proprietaire', 'terminee', 'litige') NOT NULL DEFAULT 'en_attente',
    `message_client` TEXT NULL,
    `motif_annulation` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `date_confirmation` DATETIME(3) NULL,

    INDEX `reservation_date_arrivee_date_depart_id_appartement_idx`(`date_arrivee`, `date_depart`, `id_appartement`),
    INDEX `reservation_id_client_idx`(`id_client`),
    INDEX `reservation_statut_idx`(`statut`),
    CONSTRAINT `check_dates` CHECK (`date_depart` > `date_arrivee`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable paiement
CREATE TABLE `paiement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_reservation` INTEGER NOT NULL,
    `montant` DECIMAL(10, 2) NOT NULL,
    `taux_commission` DECIMAL(5, 2) NOT NULL DEFAULT 10,
    `montant_commission` DECIMAL(10, 2) NOT NULL,
    `montant_proprietaire` DECIMAL(10, 2) NOT NULL,
    `methode` ENUM('CMI', 'PayPal', 'virement_bancaire', 'especes') NOT NULL,
    `statut` ENUM('en_attente', 'valide', 'echoue', 'rembourse') NOT NULL DEFAULT 'en_attente',
    `reference_externe` VARCHAR(255) NULL,
    `date_paiement` DATETIME(3) NULL,
    `date_remboursement` DATETIME(3) NULL,

    UNIQUE INDEX `paiement_id_reservation_key`(`id_reservation`),
    INDEX `paiement_statut_idx`(`statut`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable avis
CREATE TABLE `avis` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_client` INTEGER NOT NULL,
    `id_appartement` INTEGER NOT NULL,
    `id_reservation` INTEGER NOT NULL,
    `note_proprete` TINYINT NOT NULL,
    `note_localisation` TINYINT NOT NULL,
    `note_rapport_qp` TINYINT NOT NULL,
    `note_communication` TINYINT NOT NULL,
    `note_globale` DECIMAL(3, 2) NOT NULL,
    `commentaire` TEXT NOT NULL,
    `reponse_proprietaire` TEXT NULL,
    `date_avis` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `statut` ENUM('en_attente', 'publie', 'masque') NOT NULL DEFAULT 'en_attente',

    UNIQUE INDEX `avis_id_reservation_key`(`id_reservation`),
    INDEX `avis_id_appartement_statut_idx`(`id_appartement`, `statut`),
    INDEX `avis_id_client_idx`(`id_client`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `proprietaire` ADD CONSTRAINT `proprietaire_id_admin_verificateur_fkey` FOREIGN KEY (`id_admin_verificateur`) REFERENCES `admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appartement` ADD CONSTRAINT `appartement_id_proprietaire_fkey` FOREIGN KEY (`id_proprietaire`) REFERENCES `proprietaire`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `image_appartement` ADD CONSTRAINT `image_appartement_id_appartement_fkey` FOREIGN KEY (`id_appartement`) REFERENCES `appartement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservation` ADD CONSTRAINT `reservation_id_client_fkey` FOREIGN KEY (`id_client`) REFERENCES `client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservation` ADD CONSTRAINT `reservation_id_appartement_fkey` FOREIGN KEY (`id_appartement`) REFERENCES `appartement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `paiement` ADD CONSTRAINT `paiement_id_reservation_fkey` FOREIGN KEY (`id_reservation`) REFERENCES `reservation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `avis` ADD CONSTRAINT `avis_id_client_fkey` FOREIGN KEY (`id_client`) REFERENCES `client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `avis` ADD CONSTRAINT `avis_id_appartement_fkey` FOREIGN KEY (`id_appartement`) REFERENCES `appartement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `avis` ADD CONSTRAINT `avis_id_reservation_fkey` FOREIGN KEY (`id_reservation`) REFERENCES `reservation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
