import Factory from '../../../src/Calliope/Factory/Factory';
import type { Attributes } from '../../../src/Calliope/Concerns/HasAttributes';

export default class FileFactory extends Factory {
    definition(): Attributes {
        return {
            name: 'image.jpg',
            url: 'https://picsum.photos/200'
        };
    }
}
