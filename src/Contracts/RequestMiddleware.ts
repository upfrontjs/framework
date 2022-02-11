import type { SimpleAttributes } from '../Calliope/Concerns/HasAttributes';
import type { Method } from '../Calliope/Concerns/CallsApi';
import type { QueryParams } from '../Calliope/Concerns/BuildsQuery';
import type { MaybeArray } from '../Support/type';

type TransformedRequest = {
    data?: FormData | SimpleAttributes;
    customHeaders?: Record<string, MaybeArray<string>>;
    queryParameters?: Partial<QueryParams> | SimpleAttributes;
};

export default interface RequestMiddleware {
    handle: (
        url: string,
        method: Method,
        data?: FormData | SimpleAttributes,
        customHeaders?: Record<string, MaybeArray<string>>,
        queryParameters?: Partial<QueryParams> | SimpleAttributes
    ) => Promise<TransformedRequest> | TransformedRequest;
}
