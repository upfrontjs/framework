/* eslint-disable @typescript-eslint/unbound-method */
import Paginator from '../../src/Support/Paginator';
import InvalidOffsetException from '../../src/Exceptions/InvalidOffsetException';
import InvalidArgumentException from "../../src/Exceptions/InvalidArgumentException";

describe('paginator', () => {
    const elements: [1, 2, 3, 4, 5] = [1, 2, 3, 4, 5];
    const lastItem = elements[elements.length - 1] as number;
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

        describe('.hasPrevious', () => {
            it('should assert if there is a previous page', () => {
                expect(paginator.hasPrevious).toBe(false);
                expect(paginator.last().hasPrevious).toBe(true);
            });
        });

        describe('.hasNext', () => {
            it('should assert if there is a next page', () => {
                expect(paginator.hasNext).toBe(true);
                expect(paginator.last().hasNext).toBe(false);
            });
        });

        describe('.hasPages', () => {
            it('should determine if it has pages or not', () => {
                expect(paginator.hasPages).toBe(true);
                expect(paginator.setItemsPerPage(elements.length).hasPages).toBe(false);
            });
        });
    });

    describe('methods', () => {
        describe('constructor()', () => {
            it('should fail on invalid input', () => {
                // @ts-expect-error
                const failingFunc = jest.fn(() => new Paginator());

                expect(failingFunc).toThrow(new InvalidArgumentException(
                    'Paginator expect at least one element in the constructor.'
                ));
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

        describe('setItemsPerPage()', () => {
            it('should set items per page', () => {
                expect(paginator.itemsPerPage).toBe(3);
                expect(paginator.setItemsPerPage(1).itemsPerPage).toBe(1);
            });
        });

        describe('last()', () => {
            it('should set to last page', () => {
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
                ).toContain(lastItem);
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
                    .toContain(lastItem);
            });
        });

        describe('getPages()', () => {
            it('should get an array for every page in an array format', () => {
                const pages = paginator.getPages();

                expect(pages).toHaveLength(2);
                expect(pages[0]).toHaveLength(3);
                expect(pages[1]).toHaveLength(2);
            });
        });

        describe('has()', () => {
            it('should determine whether the given item is in the paginator or not', () => {
                expect(paginator.has(elements[1])).toBe(true);
                expect(paginator.has(Math.random())).toBe(false);
            });

            it('should work as expected regardless of the page where the item\'s located', () => {
                expect(paginator.has(lastItem)).toBe(true);
            });
        });

        describe('pop()', () => {
            it('should remove the last item from the paginator', () => {
                paginator.pop();
                expect(paginator).toHaveLength(elements.length - 1);
            });

            it('should return the last item of the paginator', () => {
                expect(paginator.pop()).toBe(lastItem);
            });
        });

        describe('push()', () => {
            it('should return the new length of the paginator', () => {
                expect(paginator.push(lastItem + 1)).toBe(elements.length + 1);
            });

            it('should set the given item at the end of the paginator', () => {
                paginator.push(lastItem + 1);
                expect(paginator.getAll()).toContain(lastItem + 1);
            });
        });

        describe('shift()', () => {
            it('should remove the first item from the paginator', () => {
                paginator.shift();
                expect(paginator.getAll()).not.toContain(elements[0]);
            });

            it('should return the first item of the paginator', () => {
                expect(paginator.shift()).toBe(elements[0]);
            });
        });

        describe('unshift()', () => {
            it('should return the new length of the paginator', () => {
                expect(paginator.unshift(elements[0] - 1)).toBe(elements.length + 1);
            });
        });

        describe('pageNumberOf()', () => {
            it('should return the page number where the given item is located', () => {
                expect(paginator.pageNumberOf(elements[0])).toBe(1);
                expect(paginator.pageNumberOf(lastItem)).toBe(paginator.pageCount);
            });

            it('should return -1 if the given item is not found', () => {
                expect(paginator.pageNumberOf(Math.random())).toBe(-1);
            });
        });

        describe('isOnPage()', () => {
            it('should correctly determine if the given item is on the current page', () => {
                expect(paginator.isOnPage(lastItem)).toBe(false);
                expect(paginator.first().isOnPage(lastItem)).toBe(false);
            });
        });

        describe('jumpToItem', () => {
            it('should throw an error if item doesn\'t exists in the paginator', () => {
                const failingFunc = jest.fn(() => paginator.jumpToItem(Math.random()));
                expect(failingFunc).toThrow(new InvalidOffsetException('Given item does not exists on the paginator'));
            });

            it('should set to the page where the item is located', () => {
                expect(paginator.jumpToItem(lastItem).currentPage).toBe(paginator.pageCount);
                expect(paginator.jumpToItem(elements[0]).currentPage).toBe(1);
            });

            it('should return itself if the item is already on the current page', () => {
                paginator.first();

                expect(paginator.jumpToItem(elements[0])).toBeInstanceOf(Paginator);
            });
        });
    });
});
