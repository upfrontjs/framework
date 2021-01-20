import Factory from '../../../src/Calliope/Factory/Factory';
import type { Attributes } from '../../../src/Calliope/Concerns/HasAttributes';
import type File from '../Models/File';

export default class FileFactory extends Factory<File> {
    public definition(): Attributes {
        return {
            name: 'image.jpg',
            url: 'https://picsum.photos/200'
        };
    }
}
