import bcrypt from 'bcrypt';
/**
 * @param {string} password
 * @return {Promise<string>}
 * */
export async function hashPassword(password) {
    const SALT_ROUNDS = 10;
    return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * @param {string} password
 * @param {string} hashedPassword
 * @return {Promise<boolean>}
 * */
export async function verifyPassword(password, hashedPassword) {
    const validPassword = await bcrypt.compare(password, hashedPassword);
    return !!validPassword;
}