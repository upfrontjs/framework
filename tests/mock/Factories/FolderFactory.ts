import Factory from '../../../src/Calliope/Factory/Factory';
import type { Attributes } from '../../../src/Calliope/Concerns/HasAttributes';
import type Folder from '../Models/Folder';

export default class FileFactory extends Factory<Folder> {
    public override definition(): Attributes<Folder> {
        return {
            name: 'my folder',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }
}
