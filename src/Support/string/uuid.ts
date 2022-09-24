import { v4 } from 'uuid';

/**
 * Generate a uuid of version 4 using the [uuid](https://www.npmjs.com/package/uuid) package.
 *
 * @return {string}
 */
export default function uuid(): string {
    return v4();
}
