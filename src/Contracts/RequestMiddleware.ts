import type { Attributes } from '../Calliope/Concerns/HasAttributes';
import type { Method } from '../Calliope/Concerns/CallsApi';
import type { QueryParams } from '../Calliope/Concerns/BuildsQuery';
import type { MaybeArray } from '../Support/type';

type TransformedRequest = {
    data?: Attributes | FormData;
    customHeaders?: Record<string, MaybeArray<string>>;
    queryParameters?: Attributes | Partial<QueryParams>;
};

export default interface RequestMiddleware {
    handle: (
        url: string,
        method: Method,
        data?: Attributes | FormData,
        customHeaders?: Record<string, MaybeArray<string>>,
        queryParameters?: Attributes | Partial<QueryParams>
    ) => Promise<TransformedRequest> | TransformedRequest;
}
