import { beforeAll, afterAll } from 'vitest';

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_ACCESS_SECRET = 'test_access_secret_min_64_chars_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_min_64_chars_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  process.env.JWT_ACCESS_EXPIRES = '15m';
  process.env.JWT_REFRESH_EXPIRES = '7d';
});

afterAll(async () => {
  // cleanup
});
