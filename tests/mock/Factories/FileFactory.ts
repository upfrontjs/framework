import Factory from '../../../src/Calliope/Factory/Factory';
import type { Attributes } from '../../../src/Calliope/Concerns/HasAttributes';
// eslint-disable-next-line @typescript-eslint/no-redeclare
import type File from '../Models/File';

export default class FileFactory extends Factory<File> {
    public override definition(): Attributes<File> {
        return {
            name: 'image.jpg',
            url: 'https://picsum.photos/200'
        };
    }
}
