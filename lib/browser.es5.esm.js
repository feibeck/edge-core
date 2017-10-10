/*! @coliquio/edge-core v0.6.33 by Sebastian Software <s.werner@sebastian-software.de> */
import 'unfetch/polyfill';
import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import { ApolloClient, ApolloProvider, createBatchingNetworkInterface, createNetworkInterface } from 'react-apollo';
import { connectRoutes } from 'redux-first-router';
import queryString from 'query-string';
import areIntlLocalesSupported from 'intl-locales-supported';
import { IntlProvider, addLocaleData } from 'react-intl';
import 'react-universal-component';
import _jsx from 'babel-runtime/helpers/jsx';
import React from 'react';
import { Provider, connect } from 'react-redux';
import reactTreeWalker from 'react-tree-walker';
import nodentRuntime from 'nodent-runtime';
import { render } from 'react-dom';

var composeEnhancers = "web" === "web" && process.env.NODE_ENV === "development" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

/**
 * Placeholder for a non active reducer in Redux.
 *
 * @param previousState {Object} Previous state.
 * @param action {string} Action which is being dispatched.
 */
function emptyReducer() {
  var previousState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  arguments[1];

  return previousState;
}

/**
 * Placeholder for a non active middleware in Redux.
 *
 * @param store {Object} Store object to work with.
 */
function emptyMiddleware() {
  return function (next) {
    return function (action) {
      return next(action);
    };
  };
}

/**
 * Placeholder for a non active enhancer in Redux.
 */
function emptyEnhancer(param) {
  return param;
}

/**
 * Dummy reducer for exporting Edge Platform specific server-side data
 * to the client-side application.
 */
function edgeReducer() {
  var previousState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  arguments[1];

  return previousState;
}

/**
 * Selector for quering the nonce which must be used for injecting script tags.
 */


/**
 * Bundles the given reducers into a root reducer for the application
 */
function createRootReducer(reducers) {
  var router = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var apollo = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  var allReducers = Object.assign({}, reducers, {

    // Edge Platform Data
    edge: edgeReducer

    // Integration point for Redux First Router
  });if (router) {
    allReducers.location = router.reducer;
  }

  // Support for Apollo-based GraphQL backends
  if (apollo) {
    allReducers.apollo = apollo.reducer();
  }

  return combineReducers(allReducers);
}

/**
 *
 *
 */
function createReduxStore() {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var _config$reducers = config.reducers,
      reducers = _config$reducers === undefined ? {} : _config$reducers,
      _config$middlewares = config.middlewares,
      middlewares = _config$middlewares === undefined ? [] : _config$middlewares,
      _config$enhancers = config.enhancers,
      enhancers = _config$enhancers === undefined ? [] : _config$enhancers,
      _config$state = config.state,
      state = _config$state === undefined ? {} : _config$state,
      _config$router = config.router,
      router = _config$router === undefined ? null : _config$router,
      _config$apollo = config.apollo,
      apollo = _config$apollo === undefined ? null : _config$apollo;


  var rootReducer = createRootReducer(reducers, router, apollo);

  var rootEnhancers = composeEnhancers.apply(undefined, [applyMiddleware.apply(undefined, [apollo ? apollo.middleware() : emptyMiddleware,

  // Redux middleware that spits an error on you when you try to mutate
  // your state either inside a dispatch or between dispatches.
  // https://github.com/leoasis/redux-immutable-state-invariant
  process.env.NODE_ENV === "development" ? require("redux-immutable-state-invariant")["default"]() : emptyMiddleware,

  // Basic Promise based async handling
  thunk,

  // Redux Router First Middleware
  router ? router.middleware : emptyMiddleware].concat(middlewares, [

  // Add automatic state change logging for client application
  // Note: Logger must be the last middleware in chain, otherwise it will log thunk and
  // promise, not actual actions (https://github.com/evgenyrodionov/redux-logger/issues/20).
  require("redux-logger").createLogger({ collapsed: true })])),

  // Redux First Router Enhancer
  router ? router.enhancer : emptyEnhancer].concat(enhancers));

  var store = createStore(rootReducer, state, rootEnhancers);

  return store;
}

function createApolloClient() {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var headers = config.headers,
      _config$uri = config.uri,
      uri = _config$uri === undefined ? null : _config$uri,
      _config$batchRequests = config.batchRequests,
      batchRequests = _config$batchRequests === undefined ? false : _config$batchRequests,
      _config$trustNetwork = config.trustNetwork,
      trustNetwork = _config$trustNetwork === undefined ? true : _config$trustNetwork,
      _config$queryDeduplic = config.queryDeduplication,
      queryDeduplication = _config$queryDeduplic === undefined ? true : _config$queryDeduplic;

  var ssrMode = "web" === "node";
  var client;

  if (uri != null) {
    var opts = {
      credentials: trustNetwork ? "include" : "same-origin",

      // transfer request headers to networkInterface so that they're accessible to proxy server
      // Addresses this issue: https://github.com/matthew-andrews/isomorphic-fetch/issues/83
      headers: headers
    };

    var networkInterface;

    if (batchRequests) {
      networkInterface = createBatchingNetworkInterface({
        uri: uri,
        batchInterval: 10,
        opts: opts
      });
    } else {
      networkInterface = createNetworkInterface({
        uri: uri,
        opts: opts
      });
    }

    client = new ApolloClient({
      ssrMode: ssrMode,
      queryDeduplication: queryDeduplication,
      networkInterface: networkInterface
    });
  } else {
    client = new ApolloClient({
      ssrMode: ssrMode,
      queryDeduplication: queryDeduplication
    });
  }

  return client;
}

// eslint-disable-next-line max-params
function createReduxRouter(routes) {
  var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  var config = {};

  // match initial route to express path
  if (path) {
    config.initialEntries = [path];
  }

  config.querySerializer = queryString;

  return connectRoutes(routes, config);
}

/**
 * Asynchrnously loads the given import and returns a Promise.
 *
 * Acts on transpiled `import()` statements from
 * [babel-plugin-universal-import](https://www.npmjs.com/package/babel-plugin-universal-import).
 *
 * @param {Object} wrapped The return value from transpiled `import()` statements.
 * @returns {Promise} Promise which resolves with the default import of imported file (asynchronous, lazy loaded).
 */
function loadImport(wrapped) {
  return wrapped.then(function (module) {
    return module && module.__esModule ? module["default"] : module;
  });
}

/**
 * Pre-loads the module directly on the client without direct usage.
 *
 * Acts on transpiled `import()` statements from
 * [babel-plugin-universal-import](https://www.npmjs.com/package/babel-plugin-universal-import).
 *
 * @param {Object} wrapped The return value from transpiled `import()` statements.
 * @returns {Promise} Returns the promise for notification when preloading is ready.
 */
function preloadImport(wrapped) {
  return wrapped.load();
}

/* global __webpack_require__ */
/**
 * Synchronously loads the given module on the server.
 *
 * Acts on transpiled `import()` statements from
 * [babel-plugin-universal-import](https://www.npmjs.com/package/babel-plugin-universal-import).
 *
 * @param {Object} wrapped The return value from transpiled `import()` statements.
 * @returns {any} The default export of the imported file (synchronously loaded).
 */


/**
 * Register the module for being pre-loaded on the *client*. This has no
 * effect on the server other than injecting the chunk name for flusing to
 * the generated HTML.
 *
 * Acts on transpiled `import()` statements from
 * [babel-plugin-universal-import](https://www.npmjs.com/package/babel-plugin-universal-import).
 *
 * @param {Object} wrapped The return value from transpiled `import()` statements.
 */

var PREFER_NATIVE = true;

function requiresIntlPolyfill(locale) {
  // Determine if the built-in `Intl` has the locale data we need.
  if (PREFER_NATIVE && global.Intl && areIntlLocalesSupported([locale])) {
    return false;
  }

  // By default Node only ships with basic English locale data. You can however build a
  // Node binary with all locale data. We recommend doing this if you control the container
  // your Node app runs in, otherwise you'll want to polyfill Intl in Node.
  // Via: https://github.com/yahoo/react-intl/wiki#i18n-in-javascript


  return true;
}

function installIntlPolyfill() {
  var Polyfill = global.IntlPolyfill;
  if (!Polyfill) {
    console.log("Can't find IntlPolyfill global!");
    return;
  }

  // `Intl` exists, but it doesn't have the data we need, so load the
  // polyfill and patch the constructors we need with the polyfill's.
  if (global.Intl) {
    Intl.NumberFormat = Polyfill.NumberFormat;
    Intl.DateTimeFormat = Polyfill.DateTimeFormat;
  } else {
    global.Intl = Polyfill;
  }
}

function requiresReactIntl() {

  return true;
}

function installReactIntl(response) {
  addLocaleData(response);
}

/**
 * Selector for quering the current locale e.g. de-DE, en-US, ...
 */
function getLocale(state) {
  return state.edge.intl.locale;
}

/**
 * Selector for quering the current language e.g. de, en, fr, es, ...
 */
function getLanguage(state) {
  return state.edge.intl.language;
}

/**
 * Selector for quering the current region e.g. DE, BR, PT, ...
 */
function getRegion(state) {
  return state.edge.intl.region;
}

// Note:
// As long as Rollup does not support dynamic `import()` we unfortunately have to implement
// the loading part of intl files and general all code splitting in the real application
// and not in any shared library. There is currently a way to transpile `import()` to
// `require.ensure()` which does 50% of the equation - and is supported by *prepublish* but the
// remaining part to define code splitting via `webpackChunkName` is not solvable right now.

function ensureReactIntlSupport(importWrapper) {
  // React-Intl always loads monolithically with all locales in NodeJS
  return loadImport(importWrapper).then(installReactIntl);
}

/* eslint-disable max-params */
function ensureIntlSupport(importWrapper, intl) {
  var hasIntlSupport = global.Intl && areIntlLocalesSupported([intl.locale]);

  if (!hasIntlSupport) {
    return loadImport(importWrapper).then(installIntlPolyfill);
  }

  return null;
}

/**
 * Wraps the application class with different providers for offering the
 * following features:
 *
 * - Apollo GraphQL
 * - Redux
 * - React Intl
 *
 * This might be extended with new features during development.
 *
 * @param {React.Component} Application The React root application component.
 * @param {Kernel} kernel Kernel instance which holds the data oriented runtime state.
 * @returns {React.Component} Returns the wrapped application component.
 */
function wrapApplication(Application, kernel) {
  var Wrapped = Application;

  if (kernel.apollo) {
    Wrapped = _jsx(ApolloProvider, {
      client: kernel.apollo,
      store: kernel.store
    }, void 0, Wrapped);
  }

  if (kernel.store) {
    Wrapped = _jsx(Provider, {
      store: kernel.store
    }, void 0, Wrapped);
  }

  if (kernel.intl) {
    Wrapped = _jsx(IntlProvider, {
      locale: kernel.intl.locale
    }, void 0, Wrapped);
  }

  return Wrapped;
}

/* eslint-disable no-shadow */
/* eslint-disable max-params */
function deepFetch(rootElement) {

  return reactTreeWalker(rootElement, function (element, instance) {
    if (instance && typeof instance.fetchData === "function") {
      return instance.fetchData();
    }

    return true;
  });
}

/**
 * Wraps the given component to make it only visible when the current
 * navigation matches the redux router type.
 *
 * @param {Component} ChildComponent Component to wrap.
 * @param {string} type Redux-Route Type to match for make visible.
 */
function routed(ChildComponent, type) {

  return connect(function (state) {
    return {
      currentLocation: state.location.type,
      currentPayload: state.location.payload
    };
  })(function (_ref) {
    var currentLocation = _ref.currentLocation,
        currentPayload = _ref.currentPayload;

    if (type === currentLocation) {
      return React.createElement(ChildComponent, currentPayload);
    }

    return null;
  });
}

/**
 * Returns the browser locale settings based on available locales and browser settings.
 *
 * @param {Array} supportedLocales List of supported locales by the application.
 */
function getBrowserLocale(supportedLocales) {
  return _getBrowserLocale(supportedLocales);
}

function _getBrowserLocale(supportedLocales) {
  var supported = new Set(supportedLocales);
  var available = new Set();

  // Modern standard: Support by modern Chrome, Safari and Firefox
  var languages = navigator.languages;
  if (languages) {
    for (var _iterator = languages, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref = _i.value;
      }

      var lang = _ref;

      if (supported.has(lang)) {
        available.add(lang);
      }
    }
  }

  // Microsoft standard
  var userLanguage = navigator.userLanguage;
  if (userLanguage) {
    var wellFormedUserLanguage = function () {
      var splitted = userLanguage.split("-");
      return splitted[0] + "-" + splitted[1].toUpperCase();
    }();

    if (supported.has(wellFormedUserLanguage)) {
      available.add(wellFormedUserLanguage);
    }
  }

  // Legacy API
  var language = navigator.language;
  if (language && supported.has(language)) {
    available.add(language);
  }

  // Return only the first match
  var first = Array.from(available.values())[0];
  return first ? {
    locale: first,
    language: first.split("-")[0],
    region: first.split("-")[1] || first.split("-")[0].toUpperCase()
  } : null;
}

var defaultState = window.APP_STATE;

/**
 *
 * @param {*} State
 * @param {*} param1
 */
function createKernel(State) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$state = _ref.state,
      state = _ref$state === undefined ? defaultState : _ref$state,
      edge = _ref.edge,
      request = _ref.request;

  if ("web" === "web" && state.edge.intl == null) {
    console.warn("Fallback to client side locale information!");

    // FIXME: Retrieve data from build config

    state.edge.intl = getBrowserLocale([]);
  }

  var router = createReduxRouter(State.getRoutes(), request ? request.path : null);

  var apolloClientConfig = State.getApolloClientConfig && State.getApolloClientConfig() ? State.getApolloClientConfig() : { uri: null };

  var apollo = createApolloClient(apolloClientConfig);

  var store = createReduxStore({
    reducers: State.getReducers(),
    enhancers: State.getEnhancers(),
    middlewares: State.getMiddlewares(),
    state: state,
    router: router,
    apollo: apollo
  });

  var intl = state.edge.intl;

  // Kernel "Instance"
  return {
    intl: intl,
    router: router,
    apollo: apollo,
    store: store
  };
}

var fetchData = (function (WrappedApplication, kernel) {
  return new Promise(function ($return, $error) {
    var start, result;

    start = new Date();
    console.log("[EDGE] Fetching data...");
    return Promise.all([kernel.router.thunk(kernel.store), deepFetch(WrappedApplication)]).then(function ($await_1) {
      result = $await_1;

      console.log("[EDGE] Done in " + (new Date() - start) + "ms");
      return $return(result);
    }.$asyncbind(this, $error), $error);
  }.$asyncbind(this));
});

function renderApp(Application, kernel) {
  console.log("[EDGE]: Rendering application...");
  render(wrapApplication(_jsx(Application, {}), kernel), document.getElementById("root"));
}

function updateState(NextState, kernel) {
  console.log("[EDGE]: Updating application state...");
  kernel.store.replaceReducer(createRootReducer(NextState.getReducers(), kernel.router, kernel.apollo));
}

// This file is just for exporting infrastructure to applications built upon this.

// Polyfill for fetch() API
// https://github.com/developit/unfetch

export { getBrowserLocale, renderApp, updateState, createReduxStore, createRootReducer, emptyReducer, emptyMiddleware, emptyEnhancer, edgeReducer, createApolloClient, createReduxRouter, requiresIntlPolyfill, installIntlPolyfill, requiresReactIntl, installReactIntl, getRegion, getLanguage, getLocale, ensureReactIntlSupport, ensureIntlSupport, wrapApplication, deepFetch, routed, createKernel, fetchData, loadImport, preloadImport };
//# sourceMappingURL=browser.es5.esm.js.map
