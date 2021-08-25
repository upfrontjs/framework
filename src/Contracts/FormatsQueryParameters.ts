import type { QueryParams } from '../Calliope/Concerns/BuildsQuery';

/**
 * Interface prescribing the expected signature of the query parameter formatting function.
 */
export default interface FormatsQueryParameters {
    /**
     * The method that customises the outgoing query parameter keys.
     *
     * @param parameters
     */
    formatQueryParameters: (parameters: QueryParams) => Record<string, any>;
}
