import type { Request, Response, NextFunction } from 'express';
import { verifyRefreshToken, generateTokenPair } from '../../utils/jwt';
import { AppError } from '../../middlewares/errorHandler';
import { success } from '../../types/models';
import {
  loginAdmin,
  registerProprietaire, loginProprietaire,
  registerClient, loginClient,
  getMeByRole,
} from './auth.service';

const COOKIE_NAME = 'refreshToken';
const CLEAR_COOKIE = { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' };

// ─── Admin ────────────────────────────────────────────────────────────────────
export async function handleAdminLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await loginAdmin(req.body as Parameters<typeof loginAdmin>[0]);
    res.cookie(COOKIE_NAME, result.tokens.refreshToken, result.cookieOptions);
    res.json(success({ user: result.user, accessToken: result.tokens.accessToken }, 'Connexion réussie'));
  } catch (err) { next(err); }
}

// ─── Propriétaire ─────────────────────────────────────────────────────────────
export async function handleProprietaireRegister(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const proprio = await registerProprietaire(req.body as Parameters<typeof registerProprietaire>[0]);
    res.status(201).json(success(proprio, 'Compte créé. En attente de vérification par l\'administration.'));
  } catch (err) { next(err); }
}

export async function handleProprietaireLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await loginProprietaire(req.body as Parameters<typeof loginProprietaire>[0]);
    res.cookie(COOKIE_NAME, result.tokens.refreshToken, result.cookieOptions);
    res.json(success({ user: result.user, accessToken: result.tokens.accessToken }, 'Connexion réussie'));
  } catch (err) { next(err); }
}

// ─── Client ───────────────────────────────────────────────────────────────────
export async function handleClientRegister(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const client = await registerClient(req.body as Parameters<typeof registerClient>[0]);
    res.status(201).json(success(client, 'Compte créé avec succès'));
  } catch (err) { next(err); }
}

export async function handleClientLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await loginClient(req.body as Parameters<typeof loginClient>[0]);
    res.cookie(COOKIE_NAME, result.tokens.refreshToken, result.cookieOptions);
    res.json(success({ user: result.user, accessToken: result.tokens.accessToken }, 'Connexion réussie'));
  } catch (err) { next(err); }
}

// ─── Shared ───────────────────────────────────────────────────────────────────
export async function handleRefreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies[COOKIE_NAME] as string | undefined;
    if (!token) throw new AppError('Refresh token manquant', 401);

    const payload = verifyRefreshToken(token);
    const tokens = generateTokenPair({ id: payload.id, role: payload.role, email: payload.email });

    res.cookie(COOKIE_NAME, tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    res.json(success({ accessToken: tokens.accessToken }));
  } catch (err) { next(err); }
}

export function handleLogout(_req: Request, res: Response): void {
  res.clearCookie(COOKIE_NAME, CLEAR_COOKIE);
  res.json(success(null, 'Déconnexion réussie'));
}

export async function handleGetMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Non authentifié', 401);
    const user = await getMeByRole(req.user.id, req.user.role);
    if (!user) throw new AppError('Utilisateur introuvable', 404);
    res.json(success({ ...user, role: req.user.role }));
  } catch (err) { next(err); }
}
