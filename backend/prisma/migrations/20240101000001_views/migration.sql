-- ─── Vue 1 : appartements_complets ────────────────────────────────────────────
-- Appartement + Propriétaire + Photo principale + Note moyenne
CREATE OR REPLACE VIEW `vue_appartements_complets` AS
SELECT
    a.id,
    a.titre,
    a.description,
    a.adresse,
    a.ville,
    a.region,
    a.surface_m2,
    a.nb_chambres,
    a.nb_salles_bain,
    a.capacite_max,
    a.prix_nuit,
    a.caution,
    a.equipements,
    a.statut,
    a.latitude,
    a.longitude,
    a.created_at,
    a.updated_at,
    -- Propriétaire
    p.id          AS proprietaire_id,
    p.nom         AS proprietaire_nom,
    p.prenom      AS proprietaire_prenom,
    p.telephone   AS proprietaire_telephone,
    p.statut_verification AS proprietaire_statut,
    -- Photo principale
    img.url_image AS image_principale_url,
    img.id        AS image_principale_id,
    -- Agrégats avis
    COALESCE(ROUND(AVG(av.note_globale), 2), 0)  AS note_moyenne,
    COUNT(DISTINCT CASE WHEN av.statut = 'publie' THEN av.id END) AS nb_avis
FROM appartement a
INNER JOIN proprietaire p ON a.id_proprietaire = p.id
LEFT JOIN image_appartement img
    ON img.id_appartement = a.id AND img.est_principale = TRUE
LEFT JOIN avis av
    ON av.id_appartement = a.id AND av.statut = 'publie'
GROUP BY
    a.id, a.titre, a.description, a.adresse, a.ville, a.region,
    a.surface_m2, a.nb_chambres, a.nb_salles_bain, a.capacite_max,
    a.prix_nuit, a.caution, a.equipements, a.statut, a.latitude,
    a.longitude, a.created_at, a.updated_at,
    p.id, p.nom, p.prenom, p.telephone, p.statut_verification,
    img.url_image, img.id;

-- ─── Vue 2 : reservations_detaillees ──────────────────────────────────────────
-- Réservation + Client + Appartement + Propriétaire + Paiement
CREATE OR REPLACE VIEW `vue_reservations_detaillees` AS
SELECT
    r.id,
    r.date_arrivee,
    r.date_depart,
    r.nb_nuits,
    r.nb_personnes,
    r.prix_nuit_applique,
    r.prix_total,
    r.statut,
    r.message_client,
    r.motif_annulation,
    r.created_at,
    r.date_confirmation,
    -- Client
    c.id     AS client_id,
    c.nom    AS client_nom,
    c.prenom AS client_prenom,
    c.email  AS client_email,
    c.telephone AS client_telephone,
    -- Appartement
    a.id     AS appartement_id,
    a.titre  AS appartement_titre,
    a.adresse AS appartement_adresse,
    a.ville  AS appartement_ville,
    -- Propriétaire
    p.id     AS proprietaire_id,
    p.nom    AS proprietaire_nom,
    p.prenom AS proprietaire_prenom,
    p.email  AS proprietaire_email,
    p.rib    AS proprietaire_rib,
    p.banque AS proprietaire_banque,
    -- Paiement
    pay.id              AS paiement_id,
    pay.montant         AS paiement_montant,
    pay.methode         AS paiement_methode,
    pay.statut          AS paiement_statut,
    pay.date_paiement   AS paiement_date,
    pay.reference_externe AS paiement_reference
FROM reservation r
INNER JOIN client c       ON r.id_client = c.id
INNER JOIN appartement a  ON r.id_appartement = a.id
INNER JOIN proprietaire p ON a.id_proprietaire = p.id
LEFT JOIN  paiement pay   ON pay.id_reservation = r.id;

-- ─── Vue 3 : paiements_comptabilite ──────────────────────────────────────────
-- Paiement + Réservation + Client + Appartement + Propriétaire (avec RIB)
CREATE OR REPLACE VIEW `vue_paiements_comptabilite` AS
SELECT
    pay.id,
    pay.montant,
    pay.taux_commission,
    pay.montant_commission,
    pay.montant_proprietaire,
    pay.methode,
    pay.statut,
    pay.reference_externe,
    pay.date_paiement,
    pay.date_remboursement,
    -- Réservation
    r.id           AS reservation_id,
    r.date_arrivee,
    r.date_depart,
    r.nb_nuits,
    r.statut       AS reservation_statut,
    -- Client
    c.id           AS client_id,
    c.nom          AS client_nom,
    c.prenom       AS client_prenom,
    c.email        AS client_email,
    -- Appartement
    a.id           AS appartement_id,
    a.titre        AS appartement_titre,
    a.ville        AS appartement_ville,
    -- Propriétaire + coordonnées bancaires
    p.id           AS proprietaire_id,
    p.nom          AS proprietaire_nom,
    p.prenom       AS proprietaire_prenom,
    p.email        AS proprietaire_email,
    p.rib          AS proprietaire_rib,
    p.banque       AS proprietaire_banque,
    p.telephone    AS proprietaire_telephone
FROM paiement pay
INNER JOIN reservation r  ON pay.id_reservation = r.id
INNER JOIN client c       ON r.id_client = c.id
INNER JOIN appartement a  ON r.id_appartement = a.id
INNER JOIN proprietaire p ON a.id_proprietaire = p.id;

-- ─── Vue 4 : avis_publics ─────────────────────────────────────────────────────
-- Avis publiés + Client anonymisé + Appartement + Réservation
CREATE OR REPLACE VIEW `vue_avis_publics` AS
SELECT
    av.id,
    av.note_proprete,
    av.note_localisation,
    av.note_rapport_qp,
    av.note_communication,
    av.note_globale,
    av.commentaire,
    av.reponse_proprietaire,
    av.date_avis,
    av.statut,
    -- Appartement
    av.id_appartement,
    a.titre AS appartement_titre,
    a.ville AS appartement_ville,
    -- Client anonymisé (prénom + initiale nom)
    av.id_client,
    CONCAT(c.prenom, ' ', LEFT(c.nom, 1), '.') AS client_affiche,
    c.nationalite AS client_nationalite,
    -- Réservation (dates seulement)
    av.id_reservation,
    r.date_arrivee,
    r.date_depart,
    r.nb_nuits
FROM avis av
INNER JOIN appartement a ON av.id_appartement = a.id
INNER JOIN client c      ON av.id_client = c.id
INNER JOIN reservation r ON av.id_reservation = r.id
WHERE av.statut = 'publie';
