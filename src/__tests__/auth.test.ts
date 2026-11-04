import seed from '@/data/users.json';
import { sanitizeUsers, safeEqual } from '@/lib/users';
import { normalizeEmail, validateEmail, validateName, validatePassword } from '@/lib/validation';

describe('form validation', () => {
  it('checks emails', () => {
    expect(validateEmail('a@b.mn')).toBeNull();
    expect(validateEmail('  Demo@OctoLearn.mn ')).toBeNull();
    expect(validateEmail('')).not.toBeNull();
    expect(validateEmail('no-at-sign')).not.toBeNull();
    expect(validateEmail('a@b')).not.toBeNull();
    expect(validateEmail('a b@c.mn')).not.toBeNull();
    expect(normalizeEmail('  Demo@OctoLearn.mn ')).toBe('demo@octolearn.mn');
  });

  it('requires 8+ characters with a letter and a digit', () => {
    expect(validatePassword('Demo1234')).toBeNull();
    expect(validatePassword('Нууц1234')).toBeNull();
    expect(validatePassword('short1')).not.toBeNull();
    expect(validatePassword('onlyletters')).not.toBeNull();
    expect(validatePassword('12345678')).not.toBeNull();
    expect(validatePassword('a1'.repeat(40))).not.toBeNull();
  });

  it('needs a name of at least 2 visible characters', () => {
    expect(validateName('Болд')).toBeNull();
    expect(validateName('A')).not.toBeNull();
    expect(validateName('<>')).not.toBeNull();
  });
});

describe('sanitizeUsers (the JSON user database)', () => {
  const good = seed.users[0];

  it('accepts the bundled demo account', () => {
    expect(sanitizeUsers(seed)).toHaveLength(1);
  });

  it('drops malformed rows, duplicate emails and duplicate ids', () => {
    const rows = [
      good,
      { ...good, id: 'another-user-0002' }, // same email
      { ...good, email: 'x@y.mn' }, // same id
      { ...good, id: 'bad id!', email: 'q@y.mn' },
      { ...good, id: 'user-0003-abc', email: 'q@y.mn', passwordHash: 'plaintext' },
      { ...good, id: 'user-0004-abc', email: 'r@y.mn', salt: 'short' },
      'not an object',
    ];
    expect(sanitizeUsers({ users: rows })).toHaveLength(1);
  });

  it('copes with garbage', () => {
    expect(sanitizeUsers(null)).toEqual([]);
    expect(sanitizeUsers('x')).toEqual([]);
    expect(sanitizeUsers({ users: 'nope' })).toEqual([]);
  });

  it('cleans the name and lower-cases the email', () => {
    const [u] = sanitizeUsers({ users: [{ ...good, name: '<b>Болд</b>', email: 'DEMO@octolearn.mn' }] });
    expect(u?.name).toBe('bБолдb');
    expect(u?.email).toBe('demo@octolearn.mn');
  });
});

describe('safeEqual', () => {
  it('compares strings', () => {
    expect(safeEqual('abc', 'abc')).toBe(true);
    expect(safeEqual('abc', 'abd')).toBe(false);
    expect(safeEqual('abc', 'ab')).toBe(false);
  });
});
