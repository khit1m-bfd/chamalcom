import { PrismaClient, AdminStatut, StatutVerificationProprietaire,
  ClientStatut, AppartementStatut, ReservationStatut,
  PaiementMethode, PaiementStatut, AvisStatut, ImageFormat } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 12;

async function hash(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

async function main(): Promise<void> {
  console.log('🌱 Démarrage du seed ChamalCom...');

  // ─── Nettoyage dans l'ordre (FK) ───────────────────────────────────────────
  await prisma.avis.deleteMany();
  await prisma.paiement.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.imageAppartement.deleteMany();
  await prisma.appartement.deleteMany();
  await prisma.client.deleteMany();
  await prisma.proprietaire.deleteMany();
  await prisma.admin.deleteMany();

  console.log('🗑️  Tables nettoyées');

  // ─── 1. ADMIN ──────────────────────────────────────────────────────────────
  const admin = await prisma.admin.create({
    data: {
      nom: 'Benali',
      prenom: 'Mohammed',
      email: 'admin@chamalcom.ma',
      mot_de_passe: await hash('Admin@1234'),
      telephone: '+212661001001',
      statut: AdminStatut.actif,
    },
  });
  console.log(`✅ Admin créé: ${admin.email}`);

  // ─── 2. PROPRIÉTAIRES ──────────────────────────────────────────────────────
  const proprio1 = await prisma.proprietaire.create({
    data: {
      nom: 'Chakir',
      prenom: 'Hassan',
      email: 'hassan.chakir@gmail.com',
      mot_de_passe: await hash('Proprio@1234'),
      telephone: '+212662002002',
      cin: 'BE123456',
      rib: '007 780 0001234567890123 45',
      banque: 'CIH Bank',
      statut_verification: StatutVerificationProprietaire.verifie,
      date_verification: new Date('2024-03-15'),
      id_admin_verificateur: admin.id,
    },
  });

  const proprio2 = await prisma.proprietaire.create({
    data: {
      nom: 'Amrani',
      prenom: 'Fatima',
      email: 'fatima.amrani@gmail.com',
      mot_de_passe: await hash('Proprio@1234'),
      telephone: '+212663003003',
      cin: 'BJ789012',
      rib: '021 000 0009876543210123 67',
      banque: 'Attijariwafa Bank',
      statut_verification: StatutVerificationProprietaire.verifie,
      date_verification: new Date('2024-04-01'),
      id_admin_verificateur: admin.id,
    },
  });

  const proprio3 = await prisma.proprietaire.create({
    data: {
      nom: 'Rifi',
      prenom: 'Karim',
      email: 'karim.rifi@gmail.com',
      mot_de_passe: await hash('Proprio@1234'),
      telephone: '+212664004004',
      cin: 'CD345678',
      rib: null,
      banque: null,
      statut_verification: StatutVerificationProprietaire.en_attente,
    },
  });

  console.log(`✅ 3 propriétaires créés (2 vérifiés, 1 en attente)`);

  // ─── 3. CLIENTS ────────────────────────────────────────────────────────────
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        nom: 'Karimi',
        prenom: 'Yasmine',
        email: 'yasmine.karimi@gmail.com',
        mot_de_passe: await hash('Client@1234'),
        telephone: '+212665005005',
        date_naissance: new Date('1992-06-15'),
        nationalite: 'Marocaine',
        adresse: 'Rue Al Mouahidine, Tétouan',
        statut: ClientStatut.actif,
      },
    }),
    prisma.client.create({
      data: {
        nom: 'Bennis',
        prenom: 'Omar',
        email: 'omar.bennis@gmail.com',
        mot_de_passe: await hash('Client@1234'),
        telephone: '+212666006006',
        date_naissance: new Date('1988-11-22'),
        nationalite: 'Marocaine',
        adresse: 'Avenue Hassan II, Tanger',
        statut: ClientStatut.actif,
      },
    }),
    prisma.client.create({
      data: {
        nom: 'Martin',
        prenom: 'Sophie',
        email: 'sophie.martin@gmail.com',
        mot_de_passe: await hash('Client@1234'),
        telephone: '+33612345678',
        date_naissance: new Date('1990-03-08'),
        nationalite: 'Française',
        adresse: '12 Rue de la Paix, Paris',
        statut: ClientStatut.actif,
      },
    }),
    prisma.client.create({
      data: {
        nom: 'Zouak',
        prenom: 'Amine',
        email: 'amine.zouak@gmail.com',
        mot_de_passe: await hash('Client@1234'),
        telephone: '+212667007007',
        date_naissance: new Date('1995-09-30'),
        nationalite: 'Marocaine',
        adresse: 'Quartier Mesnana, Tanger',
        statut: ClientStatut.actif,
      },
    }),
    prisma.client.create({
      data: {
        nom: 'El Fassi',
        prenom: 'Nadia',
        email: 'nadia.elfassi@gmail.com',
        mot_de_passe: await hash('Client@1234'),
        telephone: '+212668008008',
        date_naissance: new Date('1985-01-12'),
        nationalite: 'Marocaine',
        adresse: 'Avenue Mohammed V, Chefchaouen',
        statut: ClientStatut.actif,
      },
    }),
  ]);

  console.log(`✅ 5 clients créés`);

  // ─── 4. APPARTEMENTS ───────────────────────────────────────────────────────
  const appart1 = await prisma.appartement.create({
    data: {
      id_proprietaire: proprio1.id,
      titre: 'شقة فاخرة بإطلالة على البحر - واد لاو',
      description: 'شقة راقية مطلة مباشرة على البحر الأبيض المتوسط في واد لاو. تتوفر على غرفتي نوم فاخرتين، مطبخ مجهز بالكامل، وشرفة واسعة. المكان مثالي للعائلات والأزواج الباحثين عن الراحة والهدوء.',
      adresse: 'شارع الشاطئ، حي النور، واد لاو',
      ville: 'Oued Laou',
      region: 'Tanger-Tétouan-Al Hoceima',
      surface_m2: 85,
      nb_chambres: 2,
      nb_salles_bain: 1,
      capacite_max: 5,
      prix_nuit: 450.00,
      caution: 500.00,
      equipements: JSON.stringify(['WiFi', 'Climatisation', 'Parking', 'Cuisine équipée', 'Lave-linge', 'TV Satellite', 'Balcon vue mer', 'Barbecue']),
      statut: AppartementStatut.disponible,
      latitude: 35.4612,
      longitude: -5.0873,
    },
  });

  const appart2 = await prisma.appartement.create({
    data: {
      id_proprietaire: proprio1.id,
      titre: 'Villa Riad — Centre Oued Laou',
      description: 'Villa de style riad au cœur du village. Architecture marocaine authentique avec patio intérieur, fontaine et décoration artisanale. 3 chambres, grande terrasse avec vue panoramique sur les montagnes du Rif.',
      adresse: 'Derb Lalla Fatima, Médina, Oued Laou',
      ville: 'Oued Laou',
      region: 'Tanger-Tétouan-Al Hoceima',
      surface_m2: 140,
      nb_chambres: 3,
      nb_salles_bain: 2,
      capacite_max: 8,
      prix_nuit: 750.00,
      caution: 1000.00,
      equipements: JSON.stringify(['WiFi', 'Climatisation', 'Piscine', 'Cuisine marocaine', 'Parking', 'TV', 'Terrasse panoramique', 'Hammam', 'Service ménage']),
      statut: AppartementStatut.disponible,
      latitude: 35.4598,
      longitude: -5.0891,
    },
  });

  const appart3 = await prisma.appartement.create({
    data: {
      id_proprietaire: proprio2.id,
      titre: 'Studio Cosy — 100m de la Plage',
      description: 'Studio moderne et bien équipé à 100 mètres de la plage. Idéal pour les couples ou voyageurs solo. Décoration contemporaine, literie haut de gamme et kitchenette complète.',
      adresse: 'Résidence Al Andalus, Bloc B, Appt 12, Oued Laou',
      ville: 'Oued Laou',
      region: 'Tanger-Tétouan-Al Hoceima',
      surface_m2: 35,
      nb_chambres: 1,
      nb_salles_bain: 1,
      capacite_max: 2,
      prix_nuit: 200.00,
      caution: 300.00,
      equipements: JSON.stringify(['WiFi', 'Climatisation', 'Kitchenette', 'TV', 'Parking']),
      statut: AppartementStatut.disponible,
      latitude: 35.4625,
      longitude: -5.0855,
    },
  });

  const appart4 = await prisma.appartement.create({
    data: {
      id_proprietaire: proprio3.id,
      titre: 'Appartement Familial — Vue Montagne',
      description: 'Grand appartement familial avec vue imprenable sur les montagnes du Rif. 4 chambres, 2 salles de bain, grand salon. Proche de toutes commodités.',
      adresse: 'Avenue Al Massira, Résidence Nour, Oued Laou',
      ville: 'Oued Laou',
      region: 'Tanger-Tétouan-Al Hoceima',
      surface_m2: 120,
      nb_chambres: 4,
      nb_salles_bain: 2,
      capacite_max: 10,
      prix_nuit: 600.00,
      caution: 800.00,
      equipements: JSON.stringify(['WiFi', 'Climatisation', 'Parking', 'Cuisine équipée', 'Lave-linge', 'TV']),
      statut: AppartementStatut.en_attente_validation,
      latitude: 35.4635,
      longitude: -5.0840,
    },
  });

  console.log(`✅ 4 appartements créés (3 disponibles, 1 en attente validation)`);

  // ─── 5. IMAGES ─────────────────────────────────────────────────────────────
  // Images Cloudinary placeholder (utilise des URLs de démonstration)
  const imageData = [
    // Appart 1
    { id_appartement: appart1.id, url: 'https://res.cloudinary.com/demo/image/upload/v1/chamalcom/appart1_1.webp', nom: 'appart1_main.webp', principale: true, ordre: 0 },
    { id_appartement: appart1.id, url: 'https://res.cloudinary.com/demo/image/upload/v1/chamalcom/appart1_2.webp', nom: 'appart1_salon.webp', principale: false, ordre: 1 },
    { id_appartement: appart1.id, url: 'https://res.cloudinary.com/demo/image/upload/v1/chamalcom/appart1_3.webp', nom: 'appart1_chambre.webp', principale: false, ordre: 2 },
    // Appart 2
    { id_appartement: appart2.id, url: 'https://res.cloudinary.com/demo/image/upload/v1/chamalcom/appart2_1.webp', nom: 'appart2_main.webp', principale: true, ordre: 0 },
    { id_appartement: appart2.id, url: 'https://res.cloudinary.com/demo/image/upload/v1/chamalcom/appart2_2.webp', nom: 'appart2_patio.webp', principale: false, ordre: 1 },
    // Appart 3
    { id_appartement: appart3.id, url: 'https://res.cloudinary.com/demo/image/upload/v1/chamalcom/appart3_1.webp', nom: 'appart3_main.webp', principale: true, ordre: 0 },
    { id_appartement: appart3.id, url: 'https://res.cloudinary.com/demo/image/upload/v1/chamalcom/appart3_2.webp', nom: 'appart3_cuisine.webp', principale: false, ordre: 1 },
    // Appart 4
    { id_appartement: appart4.id, url: 'https://res.cloudinary.com/demo/image/upload/v1/chamalcom/appart4_1.webp', nom: 'appart4_main.webp', principale: true, ordre: 0 },
  ];

  await prisma.imageAppartement.createMany({
    data: imageData.map((img) => ({
      id_appartement: img.id_appartement,
      url_image: img.url,
      nom_fichier: img.nom,
      taille_ko: Math.floor(Math.random() * 400) + 100,
      format: ImageFormat.webp,
      est_principale: img.principale,
      ordre_affichage: img.ordre,
    })),
  });

  console.log(`✅ ${imageData.length} images créées`);

  // ─── 6. RÉSERVATIONS ───────────────────────────────────────────────────────

  // Réservation 1 : terminée (pour pouvoir créer un avis)
  const res1 = await prisma.reservation.create({
    data: {
      id_client: clients[0].id,          // Yasmine
      id_appartement: appart1.id,
      date_arrivee: new Date('2024-07-10'),
      date_depart: new Date('2024-07-17'),
      nb_nuits: 7,
      nb_personnes: 3,
      prix_nuit_applique: 450.00,
      prix_total: 3150.00,
      statut: ReservationStatut.terminee,
      message_client: 'نتطلع إلى قضاء عطلة رائعة مع عائلتي في شقتكم.',
      date_confirmation: new Date('2024-07-05'),
    },
  });

  // Réservation 2 : confirmée (en cours ou à venir)
  const res2 = await prisma.reservation.create({
    data: {
      id_client: clients[1].id,          // Omar
      id_appartement: appart2.id,
      date_arrivee: new Date('2025-08-01'),
      date_depart: new Date('2025-08-08'),
      nb_nuits: 7,
      nb_personnes: 6,
      prix_nuit_applique: 750.00,
      prix_total: 5250.00,
      statut: ReservationStatut.confirmee,
      message_client: 'Séjour en famille. Nous serons 6 adultes.',
      date_confirmation: new Date('2025-07-20'),
    },
  });

  // Réservation 3 : en attente
  const res3 = await prisma.reservation.create({
    data: {
      id_client: clients[2].id,          // Sophie
      id_appartement: appart3.id,
      date_arrivee: new Date('2025-08-15'),
      date_depart: new Date('2025-08-20'),
      nb_nuits: 5,
      nb_personnes: 2,
      prix_nuit_applique: 200.00,
      prix_total: 1000.00,
      statut: ReservationStatut.en_attente,
      message_client: 'Couple en voyage de noces. Nous cherchons la tranquillité.',
    },
  });

  console.log(`✅ 3 réservations créées (1 terminée, 1 confirmée, 1 en attente)`);

  // ─── 7. PAIEMENTS ──────────────────────────────────────────────────────────
  const commission1 = 3150 * 0.1;
  const paiement1 = await prisma.paiement.create({
    data: {
      id_reservation: res1.id,
      montant: 3150.00,
      taux_commission: 10,
      montant_commission: commission1,
      montant_proprietaire: 3150 - commission1,
      methode: PaiementMethode.virement_bancaire,
      statut: PaiementStatut.valide,
      reference_externe: 'PAY-2024-001-VB',
      date_paiement: new Date('2024-07-05'),
    },
  });

  const commission2 = 5250 * 0.1;
  const paiement2 = await prisma.paiement.create({
    data: {
      id_reservation: res2.id,
      montant: 5250.00,
      taux_commission: 10,
      montant_commission: commission2,
      montant_proprietaire: 5250 - commission2,
      methode: PaiementMethode.CMI,
      statut: PaiementStatut.valide,
      reference_externe: 'PAY-2025-002-CMI',
      date_paiement: new Date('2025-07-20'),
    },
  });

  console.log(`✅ 2 paiements créés`);

  // Éviter les variables inutilisées
  void paiement1;
  void paiement2;
  void res3;

  // ─── 8. AVIS ───────────────────────────────────────────────────────────────
  const noteP = 5, noteL = 4, noteRQ = 5, noteC = 4;
  const noteGlobale = parseFloat(((noteP + noteL + noteRQ + noteC) / 4).toFixed(2));

  await prisma.avis.create({
    data: {
      id_client: clients[0].id,         // Yasmine
      id_appartement: appart1.id,
      id_reservation: res1.id,
      note_proprete: noteP,
      note_localisation: noteL,
      note_rapport_qp: noteRQ,
      note_communication: noteC,
      note_globale: noteGlobale,
      commentaire: 'إقامة رائعة! الشقة نظيفة جداً ومجهزة بكل شيء. الإطلالة على البحر خلابة. المضيف متجاوب وودود. سنعود بالتأكيد.',
      reponse_proprietaire: 'شكراً جزيلاً ياسمين! يسعدنا أنكم قضيتم وقتاً رائعاً. نتطلع لاستقبالكم مجدداً في الصيف القادم.',
      date_avis: new Date('2024-07-20'),
      statut: AvisStatut.publie,
    },
  });

  console.log(`✅ 1 avis créé et publié`);

  // ─── Résumé final ──────────────────────────────────────────────────────────
  const counts = await Promise.all([
    prisma.admin.count(),
    prisma.proprietaire.count(),
    prisma.client.count(),
    prisma.appartement.count(),
    prisma.imageAppartement.count(),
    prisma.reservation.count(),
    prisma.paiement.count(),
    prisma.avis.count(),
  ]);

  console.log('\n📊 Résumé du seed :');
  console.log(`   Admin:         ${counts[0]}`);
  console.log(`   Propriétaires: ${counts[1]}`);
  console.log(`   Clients:       ${counts[2]}`);
  console.log(`   Appartements:  ${counts[3]}`);
  console.log(`   Images:        ${counts[4]}`);
  console.log(`   Réservations:  ${counts[5]}`);
  console.log(`   Paiements:     ${counts[6]}`);
  console.log(`   Avis:          ${counts[7]}`);
  console.log('\n✨ Seed ChamalCom terminé avec succès!');
  console.log('\n🔑 Comptes de test :');
  console.log('   Admin:        admin@chamalcom.ma     / Admin@1234');
  console.log('   Proprio 1:    hassan.chakir@gmail.com / Proprio@1234');
  console.log('   Proprio 2:    fatima.amrani@gmail.com / Proprio@1234');
  console.log('   Client 1:     yasmine.karimi@gmail.com / Client@1234');
  console.log('   Client 2:     omar.bennis@gmail.com   / Client@1234');
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
