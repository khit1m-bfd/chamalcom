import { prisma } from '../../config/db';
import { hashPassword, comparePassword } from '../../utils/bcrypt';
import { generateTokenPair } from '../../utils/jwt';
import { AppError } from '../../middlewares/errorHandler';
import type {
  AdminLoginInput, ProprietaireRegisterInput, ProprietaireLoginInput,
  ClientRegisterInput, ClientLoginInput,
} from './auth.schema';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export async function loginAdmin(input: AdminLoginInput) {
  const admin = await prisma.admin.findUnique({ where: { email: input.email } });
  if (!admin || !(await comparePassword(input.password, admin.mot_de_passe))) {
    throw new AppError('Email ou mot de passe incorrect', 401);
  }
  if (admin.statut === 'inactif') {
    throw new AppError('Compte admin désactivé', 403);
  }
  const tokens = generateTokenPair({ id: admin.id, role: 'admin', email: admin.email });
  return {
    tokens,
    user: { id: admin.id, nom: admin.nom, prenom: admin.prenom, email: admin.email, role: 'admin' as const },
    cookieOptions: REFRESH_COOKIE_OPTIONS,
  };
}

// ─── Propriétaire ─────────────────────────────────────────────────────────────
export async function registerProprietaire(input: ProprietaireRegisterInput) {
  const exists = await prisma.proprietaire.findFirst({
    where: { OR: [{ email: input.email }, { cin: input.cin }] },
  });
  if (exists) {
    throw new AppError(exists.email === input.email ? 'Email déjà utilisé' : 'CIN déjà utilisé', 409);
  }
  const hashed = await hashPassword(input.password);
  const proprio = await prisma.proprietaire.create({
    data: {
      nom: input.nom,
      prenom: input.prenom,
      email: input.email,
      mot_de_passe: hashed,
      telephone: input.telephone,
      cin: input.cin,
      rib: input.rib,
      banque: input.banque,
    },
    select: { id: true, nom: true, prenom: true, email: true, statut_verification: true },
  });
  return proprio;
}

export async function loginProprietaire(input: ProprietaireLoginInput) {
  const proprio = await prisma.proprietaire.findUnique({ where: { email: input.email } });
  if (!proprio || !(await comparePassword(input.password, proprio.mot_de_passe))) {
    throw new AppError('Email ou mot de passe incorrect', 401);
  }
  if (proprio.statut_verification === 'suspendu') {
    throw new AppError('Compte suspendu, contactez l\'administration', 403);
  }
  const tokens = generateTokenPair({ id: proprio.id, role: 'proprietaire', email: proprio.email });
  return {
    tokens,
    user: {
      id: proprio.id, nom: proprio.nom, prenom: proprio.prenom,
      email: proprio.email, role: 'proprietaire' as const,
      statut_verification: proprio.statut_verification,
    },
    cookieOptions: REFRESH_COOKIE_OPTIONS,
  };
}

// ─── Client ───────────────────────────────────────────────────────────────────
export async function registerClient(input: ClientRegisterInput) {
  const exists = await prisma.client.findUnique({ where: { email: input.email } });
  if (exists) throw new AppError('Email déjà utilisé', 409);

  const hashed = await hashPassword(input.password);
  const client = await prisma.client.create({
    data: {
      nom: input.nom,
      prenom: input.prenom,
      email: input.email,
      mot_de_passe: hashed,
      telephone: input.telephone,
      date_naissance: input.date_naissance ? new Date(input.date_naissance) : undefined,
      nationalite: input.nationalite,
      adresse: input.adresse,
    },
    select: { id: true, nom: true, prenom: true, email: true, statut: true },
  });
  return client;
}

export async function loginClient(input: ClientLoginInput) {
  const client = await prisma.client.findUnique({ where: { email: input.email } });
  if (!client || !(await comparePassword(input.password, client.mot_de_passe))) {
    throw new AppError('Email ou mot de passe incorrect', 401);
  }
  if (client.statut === 'suspendu') {
    throw new AppError('Compte suspendu, contactez l\'administration', 403);
  }
  const tokens = generateTokenPair({ id: client.id, role: 'client', email: client.email });
  return {
    tokens,
    user: { id: client.id, nom: client.nom, prenom: client.prenom, email: client.email, role: 'client' as const },
    cookieOptions: REFRESH_COOKIE_OPTIONS,
  };
}

// ─── Refresh token ─────────────────────────────────────────────────────────────
export async function getMeByRole(id: number, role: string) {
  if (role === 'admin') {
    return prisma.admin.findUnique({ where: { id }, select: { id: true, nom: true, prenom: true, email: true, telephone: true, statut: true } });
  }
  if (role === 'proprietaire') {
    return prisma.proprietaire.findUnique({ where: { id }, select: { id: true, nom: true, prenom: true, email: true, telephone: true, cin: true, statut_verification: true, date_inscription: true } });
  }
  return prisma.client.findUnique({ where: { id }, select: { id: true, nom: true, prenom: true, email: true, telephone: true, nationalite: true, statut: true, date_inscription: true } });
}
