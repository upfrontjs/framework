# Api Response Handler

ApiResponseHandler is responsible for handling the [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) That was returned by the [`ApiCaller`](./readme.md#apicaller). It is the implementation of the [`HandlesApiResponse`](./readme.md#handlesapiresponse) interface that is used by default.

You may [override its methods](./readme.md#using-custom-services) to add or [customise its functionality](./readme.md#extending-services).

On top of the `HandlesApiResponse`'s `handle` method for the sake of brevity the following methods have been added:

#### handleSuccess

The `handleSuccess` method attempts to parse the `ApiResponse` and returns its value.

#### handleError

The `handleError` method throws the given error.

#### handleFinally

The `handleFinally` method is an empty function for the sake of type suggestion when customising.
