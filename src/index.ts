import Model from './Calliope/Model';
import Collection from './Support/Collection';
import ModelCollection from './Calliope/ModelCollection';
import Paginator from './Support/Paginator';
import GlobalConfig from './Support/GlobalConfig';
import Factory from './Calliope/Factory/Factory';
import ApiResponseHandler from './Services/ApiResponseHandler';
import API from './Services/API';
import EventEmitter from './Support/EventEmitter';

export {
    Model,
    Collection,
    ModelCollection,
    Paginator,
    GlobalConfig,
    Factory,
    ApiResponseHandler,
    API,
    EventEmitter
};

import type AttributeCaster from './Contracts/AttributeCaster';
import type HandlesApiResponse from './Contracts/HandlesApiResponse';
import type ApiCaller from './Contracts/ApiCaller';
import type Configuration from './Contracts/Configuration';
import type {
    Attributes,
    AttributeKeys,
    SimpleAttributes,
    SimpleAttributeKeys,
    RawAttributes
} from './Calliope/Concerns/HasAttributes';
import type FactoryHooks from './Contracts/FactoryHooks';
import type { CastType } from './Calliope/Concerns/CastsAttributes';
import type { QueryParams } from './Calliope/Concerns/BuildsQuery';
import type FormatsQueryParameters from './Contracts/FormatsQueryParameters';
import type { ApiResponse } from './Contracts/HandlesApiResponse';
import type { Events, Listener } from './Support/EventEmitter';
import type { Method, CustomHeaders } from './Calliope/Concerns/CallsApi';
import type { ResolvableAttributes } from './Calliope/Factory/FactoryBuilder';
import type { Order } from './Support/Collection';

export type {
    AttributeCaster,
    ApiCaller,
    HandlesApiResponse,
    Configuration,
    Attributes,
    FactoryHooks,
    CastType,
    QueryParams,
    FormatsQueryParameters,
    ApiResponse,
    Events,
    Listener,
    AttributeKeys,
    Method,
    SimpleAttributes,
    SimpleAttributeKeys,
    CustomHeaders,
    RawAttributes,
    ResolvableAttributes,
    Order
};

export * from './Support/type';
export * from './Support/array';
export * from './Support/string';
export * from './Support/function';
export * from './Support/initialiser';
