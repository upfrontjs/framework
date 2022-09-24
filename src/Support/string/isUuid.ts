import { validate } from 'uuid';

/**
 * Determine whether the given string is a UUID of version 4.
 *
 * @param {string} str
 *
 * @return {string}
 */
export default function isUuid(str: unknown): boolean {
    return typeof str === 'string' && validate(str);
}
