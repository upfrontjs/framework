export class DateTime {
    private readonly internalValue;

    public constructor(value: any) {
        this.internalValue = value;
    }

    public value(): any {
        return this.internalValue;
    }
}

export function dateTime(value: any): DateTime {
    return new DateTime(value);
}
