import AncestryCollection from '../../src/Calliope/AncestryCollection';
import Folder from '../mock/Models/Folder';
import ModelCollection from '../../src/Calliope/ModelCollection';
import Collection from '../../src/Support/Collection';
import { types } from '../test-helpers';

const folder1 = Folder.factory().createOne({ name: 'folder 1' });
const folder2 = Folder.factory().createOne({ name: 'folder 2', parentId: folder1.getKey() });
const folder3 = Folder.factory().createOne({ name: 'folder 3', parentId: folder2.getKey() });

describe('AncestryCollection', () => {
    const folderCollection = new ModelCollection([folder1, folder2, folder3]);
    let collection: AncestryCollection<Folder>;

    beforeEach(() => {
        collection = AncestryCollection.treeOf(folderCollection);
    });

    describe('toTree()', () => {
        it('should arrange the models in a tree format', () => {
            expect(collection).toHaveLength(1);
            expect(collection.first()!.is(folder1)).toBe(true);

            expect(collection.first()!.children).toHaveLength(1);
            expect(collection.first()!.children!.first()!.is(folder2)).toBe(true);

            expect(collection.first()!.children!.first()!.children).toHaveLength(1);
            expect(collection.first()!.children!.first()!.children!.first()!.is(folder3)).toBe(true);
        });

        it('should should set the depth to the appropriate values', () => {
            expect(collection.first()!.depth).toBe(0);
            expect(collection.first()!.children!.first()!.depth).toBe(1);
            expect(collection.first()!.children!.first()!.children!.first()!.depth).toBe(2);
        });

        it('should set the depth attribute using the static depth key', () => {
            AncestryCollection.depthName = 'myDepth';
            const folderAncestryCollection = AncestryCollection.treeOf(folderCollection);

            expect(folderAncestryCollection.first()!.myDepth).toBe(0);
            // it was synced as original
            expect(folderAncestryCollection.first()!.hasChanges(AncestryCollection.depthName)).toBe(false);

            AncestryCollection.depthName = 'depth';
        });

        it('should handle non-linear and not sorted values', () => {
            const midLevelFolder = Folder.factory().createOne({
                parentId: folder1.getKey(),
                name: 'mid level folder',
                id: 4
            });
            const topLevelFolder = Folder.factory().createOne({
                name: 'top level folder',
                id: 5
            });
            const newFolderCollection = new ModelCollection(
                [midLevelFolder, folder1, folder2, folder3, topLevelFolder]
            );

            const tree = AncestryCollection.treeOf(newFolderCollection);
            expect(tree).toHaveLength(2);
            expect(tree.findByKey(folder1.getKey())!.children).toHaveLength(2);
        });
    });

    describe('flatten()', () => {
        it('should return the collection in a single level array', () => {
            expect(collection.flatten()).toHaveLength(folderCollection.length);
        });

        it('should return a ModelCollection', () => {
            expect(collection.flatten()).toBeInstanceOf(ModelCollection);
        });

        it('should remove the depth attribute', () => {
            expect(collection.flatten().every(folder => !('depth' in folder))).toBe(true);
            expect(collection.flatten().every(folder => folder.hasChanges(AncestryCollection.depthName))).toBe(false);
        });
    });

    describe('leaves()', () => {
        it('should return a ModelCollection', () => {
            expect(collection.leaves()).toBeInstanceOf(ModelCollection);
        });

        it('should only return models with no children', () => {
            let leaves = collection.leaves();

            expect(leaves).toHaveLength(1);
            expect(leaves.first()!.is(folder3)).toBe(true);

            const midLevelFolder = Folder.factory().createOne({
                parentId: folder1.getKey(),
                name: 'mid level folder',
                id: 4
            });
            const newFolderCollection = new ModelCollection([folder1, folder2, folder3, midLevelFolder]);

            leaves = AncestryCollection.treeOf(newFolderCollection).leaves();

            expect(leaves).toHaveLength(2);
            expect(leaves.first()!.is(folder3)).toBe(true);
            expect(leaves.last()!.is(midLevelFolder)).toBe(true);

            folderCollection.pop();
        });
    });

    describe('isAncestryCollection()', () => {
        it('should assert that it\' a model collection', () => {
            expect(AncestryCollection.isAncestryCollection(folderCollection)).toBe(false);
            expect(AncestryCollection.isAncestryCollection(new Collection([1, 2, 3]))).toBe(false);

            types.forEach(type => {
                expect(AncestryCollection.isAncestryCollection(type)).toBe(false);
            });

            expect(AncestryCollection.isAncestryCollection(collection)).toBe(true);
        });
    });
});
