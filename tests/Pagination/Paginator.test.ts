import Paginator from '../../src/Pagination/Paginator';

describe('paginator', () => {
    const elements: number[] = [1, 2, 3, 4, 5];
    let paginator: Paginator<number>;

    beforeEach(() => {
        paginator = new Paginator(elements, 3);
    });

    describe('properties', () => {
        describe('.pageCount', () => {
            it('should return the correct page count', () => {
                expect(paginator.pageCount).toBe(2);
                expect(paginator.setItemsPerPage(elements.length).pageCount).toBe(1);
            });
        });

        describe('.items', () => {
            it('should return the items on the current page', () => {
                expect(paginator.items).toHaveLength(3);
                expect(paginator.next().items).toHaveLength(2);
                expect(paginator.setItemsPerPage(1).items[0]).toBe(elements[1]);
            });
        });

        describe('.currentPage', () => {
            it('should return the current page\'s number', () => {
                expect(paginator.currentPage).toBe(1);
                expect(paginator.next().currentPage).toBe(2);
            });
        });

        describe('.itemsPerPage', () => {
            it('should return the itemsPerPage correctly', () => {
                expect(paginator.itemsPerPage).toBe(3);
                expect(paginator.setItemsPerPage(2).itemsPerPage).toBe(2);
            });
        });
    });

    describe('methods', () => {
        describe('constructor()', () => {
            it('should fail on invalid input', () => {
                const constructor = () => new Paginator();

                expect(constructor).toThrow('Paginator expect at least one element in the constructor.');
            });
        });

        describe('looping the paginator', () => {
            it('should be looped using for of', () => {
                const items = [];

                for (const element of paginator) {
                    items.push(element);
                }

                expect(items).toHaveLength(paginator.length);
            });
        });

        describe('hasPages()', () => {
            it('should determine if it has pages or not', () => {
                expect(paginator.hasPages()).toBe(true);
                expect(paginator.setItemsPerPage(elements.length).hasPages()).toBe(false);
            });
        });

        describe('setItemsPerPage()', () => {
            it('should set items per page', () => {
                expect(paginator.itemsPerPage).toBe(3);
                expect(paginator.setItemsPerPage(1).itemsPerPage).toBe(1);
            });
        });

        describe('last()', () => {
            it('should set to last page', () => {
                const lastItem = elements[elements.length - 1];

                expect(paginator.last().items).toContain(lastItem);
            });
        });

        describe('first()', () => {
            it('should set to first page', () => {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                expect(paginator.first().items).toContain(elements[0]);
            });
        });

        describe('page()', () => {
            it('should set to specified page', () => {
                expect(paginator.setItemsPerPage(1).page(3).items[0] === elements[2]).toBe(true);
            });
        });

        describe('getAll()', () => {
            it('should access the passed in elements', () => {
                expect(paginator.getAll()).toHaveLength(elements.length);
            });
        });

        describe('next()', () => {
            it('should paginate to the next page', () => {
                expect(
                    paginator
                        .setItemsPerPage(1)
                        .last()
                        .previous()
                        .items
                ).toContain(elements[elements.length - 2]);
            });

            it('should do nothing if there isn\'t a next page', () => {
                expect(
                    paginator
                        .last()
                        .next()
                        .items
                ).toContain(elements[elements.length - 1]);
            });

            it('should jump to first page if wrapping is enabled', () => {
                paginator = new Paginator(paginator.getAll(), 1, true);
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                expect(paginator.last().next().items).toContain(elements[0]);
            });
        });

        describe('previous()', () => {
            it('should paginate to the previous page', () => {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                expect(paginator.next().previous().items).toContain(elements[0]);
            });

            it('should do nothing if there isn\'t a previous page', () => {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                expect(paginator.first().previous().items).toContain(elements[0]);
            });

            it('should jump to last page if wrapping is enabled', () => {
                paginator = new Paginator(paginator.getAll(), 1, true);
                expect(
                    paginator
                        .first()
                        .previous()
                        .items)
                    .toContain(elements[elements.length - 1]);
            });
        });

        describe('hasPrevious()', () => {
            it('should assert if a previous page exists', () => {
                expect(paginator.hasPrevious()).toBe(false);
                expect(paginator.last().hasPrevious()).toBe(true);
            });
        });

        describe('hasNext()', () => {
            it('should assert if a next page exists', () => {
                expect(paginator.hasNext()).toBe(true);
                expect(paginator.last().hasNext()).toBe(false);
            });
        });
    });
});
