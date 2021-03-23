import Model from './Calliope/Model';
import Collection from './Support/Collection';
import ModelCollection from './Calliope/ModelCollection';
import Paginator from './Support/Paginator';
import GlobalConfig from './Support/GlobalConfig';
import Factory from './Calliope/Factory/Factory';
import ApiResponseHandler from './Services/ApiResponseHandler';
import API from './Services/API';

export {
    Model,
    Collection,
    ModelCollection,
    Paginator,
    GlobalConfig,
    Factory,
    ApiResponseHandler,
    API
};

import type AttributeCaster from './Contracts/AttributeCaster';
import type HandlesApiResponse from './Contracts/HandlesApiResponse';
import type ApiCaller from './Contracts/ApiCaller';
import type Configuration from './Contracts/Configuration';
import type { Attributes } from './Calliope/Concerns/HasAttributes';
import type FactoryHooks from './Contracts/FactoryHooks';
import type { CastType } from './Calliope/Concerns/CastsAttributes';

export type {
    AttributeCaster,
    ApiCaller,
    HandlesApiResponse,
    Configuration,
    Attributes,
    FactoryHooks,
    CastType
};

export * from './Support/array';
export * from './Support/string';
export * from './Support/function';
export * from './Support/initialiser';
