import type { SimpleAttributes } from '../Calliope/Concerns/HasAttributes';
import type { Method, CustomHeaders } from '../Calliope/Concerns/CallsApi';
import type { QueryParams } from '../Calliope/Concerns/BuildsQuery';

type TransformedRequest = {
    data?: FormData | SimpleAttributes;
    customHeaders?: CustomHeaders;
    queryParameters?: Partial<QueryParams> | SimpleAttributes;
};

export default interface RequestMiddleware {
    handle: (
        url: string,
        method: Method,
        data?: FormData | SimpleAttributes,
        customHeaders?: CustomHeaders,
        queryParameters?: Partial<QueryParams> | SimpleAttributes
    ) => Promise<TransformedRequest> | TransformedRequest;
}
