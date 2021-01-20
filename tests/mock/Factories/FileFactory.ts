import Factory from '../../../src/Calliope/Factory/Factory';
import type { Attributes } from '../../../src/Calliope/Concerns/HasAttributes';
import type FileModel from '../Models/FileModel';

export default class FileFactory extends Factory<FileModel> {
    public definition(): Attributes {
        return {
            name: 'image.jpg',
            url: 'https://picsum.photos/200'
        };
    }
}
