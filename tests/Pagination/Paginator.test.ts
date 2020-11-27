import Paginator from '../../src/Pagination/Paginator';

describe('paginator', () => {
    const elements: number[] = [1, 2, 3, 4, 5];
    let paginator: Paginator<number>;

    beforeEach(() => {
        paginator = new Paginator(elements, 3);
    });

    describe('properties', () => {
        describe('.pageCount', () => {
            it('can return the correct page count', () => {
                expect(paginator.pageCount).toBe(2);
                expect(paginator.setItemsPerPage(elements.length).pageCount).toBe(1);
            });
        });

        describe('.items', () => {
            it('can return the items on the current page', () => {
                expect(paginator.items).toHaveLength(3);
                expect(paginator.next().items).toHaveLength(2);
                expect(paginator.setItemsPerPage(1).items[0]).toBe(elements[1]);
            });
        });

        describe('.currentPage', () => {
            it('can return the current page\'s number', () => {
                expect(paginator.currentPage).toBe(1);
                expect(paginator.next().currentPage).toBe(2);
            });
        });

        describe('.itemsPerPage', () => {
            it('can return the itemsPerPage correctly', () => {
                expect(paginator.itemsPerPage).toBe(3);
                expect(paginator.setItemsPerPage(2).itemsPerPage).toBe(2);
            });
        });
    });

    describe('methods', () => {
        describe('constructor()', () => {
            it('fails on invalid input', () => {
                const constructor = () => new Paginator();

                expect(constructor).toThrow('Paginator expect at least one element in the constructor.');
            });
        });

        describe('looping the paginator', () => {
            it('can be looped using for of', () => {
                const items = [];

                for (const element of paginator) {
                    items.push(element);
                }

                expect(items).toHaveLength(paginator.length);
            });
        });

        describe('hasPages()', () => {
            it('determine if it has pages or not', () => {
                expect(paginator.hasPages()).toBe(true);
                expect(paginator.setItemsPerPage(elements.length).hasPages()).toBe(false);
            });
        });

        describe('setItemsPerPage()', () => {
            it('can set items per page', () => {
                expect(paginator.itemsPerPage).toBe(3);
                expect(paginator.setItemsPerPage(1).itemsPerPage).toBe(1);
            });
        });

        describe('last()', () => {
            it('can set to last page', () => {
                const lastItem = elements[elements.length - 1];

                // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                expect(paginator.last().items.has(lastItem as number)).toBe(true);
            });
        });

        describe('first()', () => {
            it('can set to first page', () => {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                expect(paginator.first().items.has(elements[0] as number)).toBe(true);
            });
        });

        describe('page()', () => {
            it('can set to specified page', () => {
                expect(paginator.setItemsPerPage(1).page(3).items[0] === elements[2]).toBe(true);
            });
        });

        describe('getAll()', () => {
            it('can access the passed in elements', () => {
                expect(paginator.getAll()).toHaveLength(elements.length);
            });
        });

        describe('next()', () => {
            it('can paginate to the next page', () => {
                expect(
                    paginator
                        .setItemsPerPage(1)
                        .last()
                        .previous()
                        .items
                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                        .has(elements[elements.length - 2] as number)
                ).toBe(true);
            });

            it('does nothing if there isn\'t a next page', () => {
                expect(
                    paginator
                        .last()
                        .next()
                        .items
                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                        .has(elements[elements.length - 1] as number)
                ).toBe(true);
            });

            it('jumps to first page if wrapping is enabled', () => {
                paginator = new Paginator(paginator.getAll(), 1, true);
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                expect(paginator.last().next().items.has(elements[0] as number)).toBe(true);
            });
        });

        describe('previous()', () => {
            it('can paginate to the previous page', () => {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                expect(paginator.next().previous().items.has(elements[0] as number)).toBe(true);
            });

            it('does nothing if there isn\'t a previous page', () => {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                expect(paginator.first().previous().items.has(elements[0] as number)).toBe(true);
            });

            it('jumps to last page if wrapping is enabled', () => {
                paginator = new Paginator(paginator.getAll(), 1, true);
                expect(
                    paginator
                        .first()
                        .previous()
                        .items
                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                        .has(elements[elements.length - 1] as number)
                ).toBe(true);
            });
        });

        describe('hasPrevious()', () => {
            it('can assert if a previous page exists', () => {
                expect(paginator.hasPrevious()).toBe(false);
                expect(paginator.last().hasPrevious()).toBe(true);
            });
        });

        describe('hasNext()', () => {
            it('can assert if a next page exists', () => {
                expect(paginator.hasNext()).toBe(true);
                expect(paginator.last().hasNext()).toBe(false);
            });
        });
    });
});


