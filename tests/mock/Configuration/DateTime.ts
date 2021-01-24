export class DateTime {
    private internalValue;
    public constructor(value: any) {
        this.internalValue = value;
    }

    value(): any {
        return this.internalValue;
    }
}

export function dateTime(value: any): DateTime {
    return new DateTime(value);
}
