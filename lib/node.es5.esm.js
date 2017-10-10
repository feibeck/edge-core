/*! @coliquio/edge-core v0.6.33 by Sebastian Software <s.werner@sebastian-software.de> */
import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import { ApolloClient, ApolloProvider, createBatchingNetworkInterface, createNetworkInterface } from 'react-apollo';
import { NOT_FOUND, connectRoutes } from 'redux-first-router';
import queryString from 'query-string';
import areIntlLocalesSupported from 'intl-locales-supported';
import { IntlProvider } from 'react-intl';
import { CHUNK_NAMES } from 'react-universal-component';
import _jsx from 'babel-runtime/helpers/jsx';
import React from 'react';
import { Provider, connect } from 'react-redux';
import reactTreeWalker from 'react-tree-walker';
import nodentRuntime from 'nodent-runtime';
import _typeof from 'babel-runtime/helpers/typeof';
import serialize from 'serialize-javascript';
import Helmet from 'react-helmet';
import ReactDOM from 'react-dom/server';
import { flushChunkNames } from 'react-universal-component/server';
import flushChunks from 'webpack-flush-chunks';
import { parse } from 'edge-useragent';
import codeFrame from 'babel-code-frame';
import chalk from 'chalk';
import { wrapCallSite } from 'source-map-support';
import { readFileSync } from 'fs';

var composeEnhancers = "node" === "web" && process.env.NODE_ENV === "development" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

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
  emptyMiddleware])),

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

  var ssrMode = "node" === "node";
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


/**
 * Pre-loads the module directly on the client without direct usage.
 *
 * Acts on transpiled `import()` statements from
 * [babel-plugin-universal-import](https://www.npmjs.com/package/babel-plugin-universal-import).
 *
 * @param {Object} wrapped The return value from transpiled `import()` statements.
 * @returns {Promise} Returns the promise for notification when preloading is ready.
 */

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
function loadImport$1(wrapped) {
  var module = __webpack_require__(wrapped.resolve());
  return module && module.__esModule ? module["default"] : module;
}

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
function preloadImport$1(wrapped) {
  CHUNK_NAMES.add(wrapped.chunkName());
}

var PREFER_NATIVE = true;

var intlSupportTable = require("caniuse-lite").feature(require("caniuse-lite/data/features/internationalization.js"));


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
  // Locale Data in Node.js:
  // When using React Intl in Node.js (same for the Intl.js polyfill), all locale data will be
  // loaded into memory. This makes it easier to write a universal/isomorphic React app with
  // React Intl since you won't have to worry about dynamically loading locale data on the server.
  // Via: https://github.com/yahoo/react-intl/wiki#locale-data-in-nodejs

  // As mentioned above no additional data has to be loaded for NodeJS. We are just resolving
  // the Promise in that case.
  return false;
}

function installReactIntl() {}

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
  return preloadImport$1(importWrapper);
}

/* eslint-disable max-params */
function ensureIntlSupport(importWrapper, intl, browser) {
  var hasIntlSupport = global.Intl && areIntlLocalesSupported([intl.locale]);

  {
    if (!hasIntlSupport) {
      loadImport$1(importWrapper);
    }

    var clientHasIntl = false;
    try {
      // TODO: Make this smarter and more error tolerant
      if (intlSupportTable.stats[browser.family.toLowerCase()][browser.major] === "y") {
        clientHasIntl = true;
      }
    } catch (error) {
      console.log("Error during querying support table:", error);
      // pass
    }

    if (!clientHasIntl) {
      preloadImport$1(importWrapper);
    }
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

var defaultState = null;

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

  // Use given edge instance when not already defined on state
  if ("node" === "node" && edge != null) {
    if (!state.edge) {
      state.edge = edge;
    }
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

/**
 * Generates a full HTML page containing the render output of the given react element.
 *
 * @param config {Object} Configuration.
 * @param config.state {Object} [{}] The initial state for the redux store which will be used by the
 *   client to mount the redux store into the desired state.
 * @param config.html {string} The rendered HTML content.
 * @param config.styles {string} [""] Styles to inject into the page.
 * @param config.scripts {string} [""] Scripts to inject into the page.
 * @returns The full HTML page in the form of a React element.
 */
function renderPage(_ref) {
  var state = _ref.state,
      html = _ref.html,
      styles = _ref.styles,
      scripts = _ref.scripts;

  if ((typeof state === "undefined" ? "undefined" : _typeof(state)) !== "object" || _typeof(state.edge) !== "object") {
    throw new Error("[EDGE]: RenderPage: Invalid state object!");
  }

  if (typeof html !== "string" || html.length === 0) {
    throw new Error("[EDGE]: RenderPage: Invalid html string!");
  }

  if (typeof styles !== "string" || styles.length === 0) {
    throw new Error("[EDGE]: RenderPage: Invalid styles string!");
  }

  if (typeof scripts !== "string" || scripts.length === 0) {
    throw new Error("[EDGE]: RenderPage: Invalid scripts string!");
  }

  var edge = state.edge;
  var helmet = Helmet.renderStatic();
  var inlineCode = "APP_STATE=" + serialize(state, { isJSON: true }) + ";";
  var nonceHtml = edge.nonce ? "nonce=\"" + edge.nonce + "\"" : "";

  return "\n<!doctype html>\n<html lang=\"" + edge.intl.locale + "\" " + helmet.htmlAttributes.toString() + ">\n  <head>\n    " + helmet.title.toString() + "\n    " + helmet.meta.toString() + "\n    " + helmet.link.toString() + "\n    " + styles + "\n    " + helmet.style.toString() + "\n  </head>\n  <body>\n    <div id=\"root\">" + html + "</div>\n    <script " + nonceHtml + ">" + inlineCode + "</script>\n    " + scripts + "\n    " + helmet.script.toString() + "\n  </body>\n</html>";
}

/* eslint-disable max-params, no-console */
function renderApplication(_ref) {
  var Application = _ref.Application,
      clientStats = _ref.clientStats,
      kernel = _ref.kernel,
      request = _ref.request,
      response = _ref.response;

  console.log("[EDGE] Exporting current state...");
  var state = kernel.store.getState();

  // the idiomatic way to handle routes not found :)
  // your component's should also detect this state and render a 404 scene
  var location = state.location;
  var httpStatus = 200;
  if (location.type === NOT_FOUND) {
    /* eslint-disable no-magic-numbers */
    httpStatus = 404;
  } else if (location.kind === "redirect") {
    // By using history.replace() behind the scenes, the private URL the user
    // tried to access now becomes the /login URL in the stack, and the user
    // can go back to the previous page just as he/she would expect.
    return response.redirect(302, location.pathname);
  }

  console.log("[EDGE] Rendering application...");
  var html = "";
  try {
    html = ReactDOM.renderToString(Application);
  } catch (err) {
    console.error("Unable to render server side React:", err);
  }

  console.log("[EDGE] Flushing chunks...");
  var chunkNames = flushChunkNames();
  console.log("[EDGE] Rendered Chunk Names:", chunkNames.join(", "));

  var _flushChunks = flushChunks(clientStats, { chunkNames: chunkNames }),
      js = _flushChunks.js,
      styles = _flushChunks.styles,
      cssHash = _flushChunks.cssHash;

  console.log("[EDGE] Flushed Script Tags:\n" + js.toString() + "\n");
  console.log("[EDGE] Flushed CSS Tags:\n" + styles.toString() + "\n");

  // TODO: Support SRI integrity checksums as added by SRI Webpack Plugin
  // https://www.npmjs.com/package/webpack-subresource-integrity#without-htmlwebpackplugin

  // Render full HTML page using external helper
  console.log("Rendering Page...");
  var renderedPage = renderPage({
    state: state,
    html: html,
    styles: styles.toString(),
    scripts: cssHash + js.toString()
  });

  // Make sure that the actual dynamically rendered page is never being cached
  response.setHeader("Cache-Control", "no-cache");

  // Send actual content
  console.log("[EDGE] Sending Page...");
  return response.status(httpStatus).send(renderedPage);
}

function getLocaleData(request) {
  var locale = request.locale;
  var language = null;
  var region = null;
  var source = null;

  if (locale) {
    language = locale.language;
    region = locale.region;
    source = locale.source;
    locale = language + "-" + region;
  } else {
    console.warn("Locale not auto-detected by server!");

    locale = process.env.DEFAULT_LOCALE;
    if (locale) {
      source = "env";
      var splitted = locale.split("-");
      language = splitted[0];
      region = splitted[1];
    } else {
      locale = "en-US";
      language = "en";
      region = "US";
      source = "default";
    }
  }

  console.log("Using locale: " + locale + " via " + source);

  return {
    locale: locale,
    language: language,
    region: region
  };
}

function prepareResponse(request) {
  var intl = getLocaleData(request);
  var browser = parse(request.headers["user-agent"]);

  return {
    intl: intl,
    browser: browser
  };
}

var FUNCTION_NAME_FILTERS = [/__webpack_require__/];
var SOURCE_FILE_FILTERS = [/\/webpack\/bootstrap/];

var FUNCTION_NAME_CLEARANCE = [/__webpack_exports__/];
var TYPE_NAME_CLEARANCE = [/^Object$/];

var CODE_FRAME_OPTIONS = {
  highlightCode: true

  /**
   * Cleans up the source file name which was modified by `source-map-support` to point to the source mapped
   * origin file. Unfortunately instead of giving us the pure source file it resolves into something
   * like "<generatedFile>:<sourceFile>". We take care of this here and remove the generated file segment
   * as this is typically not relevant for the developer.
   *
   * @param {string} sourceFile Sourcefile as being available in the CallSite.
   * @returns {string} Cleaned up plain source file reference.
   */
};function cleanSourceFileName(sourceFile) {
  var cleanFile = sourceFile.split(":")[1] || sourceFile;
  if (cleanFile.charAt(0) === "/") {
    cleanFile = cleanFile.slice(1);
  }

  return cleanFile;
}

/**
 * This method checks whether the given stack frame (CallSite) is relevant from a
 * developer perspective.
 *
 * @param {CallSite} frame Incoming frame to check for user relevance.
 * @returns {boolean} Whether the frame is relevant for end developer debugging.
 */
function isRelevantFrame(frame) {
  var wrappedFrame = wrapCallSite(frame);
  var generatedFile = frame.getFileName();

  var sourceFile = wrappedFrame.getFileName();
  var functionName = wrappedFrame.getFunctionName();

  // Filter out all raw files which do not have any source mapping
  // This typically removes most of the build related infrastructure
  // which is neither application or framework code.

  if (!(sourceFile !== generatedFile)) {
    return false;
  }

  // Filter out specific functions e.g. webpack require wrappers
  if (FUNCTION_NAME_FILTERS.some(function (regexp) {
    return regexp.test(functionName);
  })) {
    return false;
  }

  // Filter out specific source files e.g. webpack bootstrap implementation
  if (SOURCE_FILE_FILTERS.some(function (regexp) {
    return regexp.test(sourceFile);
  })) {
    return false;
  }

  return true;
}

/**
 * Filters the existing list of CallSites to drop non user-relevant ones.
 *
 * @param {CallSite[]} frames List of CallSite objects.
 * @returns {CallSite[]} Filtered CallSite list.
 */
function getRelevantFrames(frames) {
  return frames.filter(isRelevantFrame);
}

/**
 * Processes a single CallSite entry to filter out build tool related or internal APIs.
 * During this process the method also uses source maps to figure out the original source location.
 * The CallSite API is documented in here: https://github.com/v8/v8/wiki/Stack-Trace-API#customizing-stack-traces.
 *
 * @param {CallSite} frame The current CallSite object to process.
 * @returns {string} Stringified CallSite object with usage of source maps to refer source location.
 */
function frameToString(frame) {
  var wrappedFrame = wrapCallSite(frame);

  var sourceFile = wrappedFrame.getFileName();
  var functionName = wrappedFrame.getFunctionName();
  var typeName = wrappedFrame.getTypeName();

  // Ignore some cryptic function names which typically are just function calls
  if (FUNCTION_NAME_CLEARANCE.some(function (regexp) {
    return regexp.test(functionName);
  })) {
    functionName = "";
  }

  // Filter out configured type names
  if (TYPE_NAME_CLEARANCE.some(function (regexp) {
    return regexp.test(typeName);
  })) {
    typeName = "";
  }

  // Strip out generated filename part from source field
  sourceFile = cleanSourceFileName(sourceFile);

  // Retrieve source file locations
  var lineNumber = wrappedFrame.getLineNumber();
  var columnNumber = wrappedFrame.getColumnNumber();

  var identifier = functionName || typeName || "<anonymous>";

  // Stack frames are displayed in the following format:
  //   at FunctionName (<Fully-qualified name/URL>:<line number>:<column number>)
  // Via: https://docs.microsoft.com/en-us/scripting/javascript/reference/stack-property-error-javascript
  return "at " + identifier + "@" + sourceFile + ":" + lineNumber + ":" + columnNumber;
}

/**
 * Build the stack property for V8 as V8 is documented to use whatever this call returns
 * as the value of the stack property.
 *
 * @param {Error} nativeError Native JavaScript Error Object.
 * @param {CallSite[]} structuredStackTrace A structured representation of the stack.
 * @returns {string} Generated `stack` property for error object.
 */
function prepareStackTrace(nativeError, structuredStackTrace) {
  var frames = getRelevantFrames(structuredStackTrace);
  var firstFrame = frames[0];

  // Need the first frame for highlighting affected source code, sometimes that's not available.
  if (firstFrame != null) {
    var wrappedFirstFrame = wrapCallSite(firstFrame);
    var sourceFile = cleanSourceFileName(wrappedFirstFrame.getFileName());

    var sourceText = "";
    try {
      sourceText = readFileSync(sourceFile, "utf-8");
    } catch (error) {}
    // Ignore errors


    // Generate highlighted code frame and attach it to the native error object (for later usage)
    if (sourceText) {
      var result = codeFrame(sourceText, wrappedFirstFrame.getLineNumber(), wrappedFirstFrame.getColumnNumber(), CODE_FRAME_OPTIONS);
      nativeError.code = result;
    }
  }

  return frames.map(function (frame) {
    return frameToString(frame);
  }).filter(function (item) {
    return item != null;
  }).join("\n");
}

/**
 * Highlights the given stacktrace object using `chalk.
 *
 * @param {Stack} stack Stacktrace result string.
 * @returns {string} Highlighted stack trace for NodeJS.
 */
function highlightStack(stack) {
  return stack.split("\n").map(function (line) {
    if (line.startsWith("at ")) {
      /* eslint-disable max-params */
      return line.replace(/(at )(.*?)(@)(.*?):([0-9]+)(:)([0-9]+)/, function (match, intro, id, symbol, filename, lineNo, separator, columnNo) {
        return "  - " + chalk.white(id) + " " + chalk.dim(filename) + " [" + chalk.yellow(lineNo) + ":" + chalk.yellow(columnNo) + "]";
      });
    }

    return chalk.yellow(line);
  }).join("\n");
}

/**
 * Logs the given error to the NodeJS console.
 *
 * @param {Error} nativeError Native JavaScript Error Object.
 */
function logError(nativeError) {
  /* eslint-disable no-console */
  if (nativeError instanceof Error) {
    // Triggering generating formatted stacktrace
    var formattedMessage = chalk.red(nativeError.name + ": " + nativeError.message);
    var formattedStack = highlightStack(nativeError.stack);

    // Optionally display source code except
    if (nativeError.code) {
      console.error(formattedMessage + "\n\n" + nativeError.code + "\n\n" + formattedStack);
    } else {
      console.error(formattedMessage + "\n\n" + formattedStack);
    }
  } else {
    console.error(nativeError);
  }
}

/**
 * Enable enhanced stack traces.
 *
 * @param {boolean} debug Whether debugging should be enabled.
 */
function enableEnhancedStackTraces() {
  var debug = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

  // Override native Promise API with faster and more developerr friendly bluebird
  global.Promise = require("bluebird");

  /* eslint-disable no-use-extend-native/no-use-extend-native */
  Promise.config({
    longStackTraces: debug,
    warnings: debug
  });

  // Catch unhandled Promise rejections and pass them over to our log handler
  process.on("unhandledRejection", function (reason) {
    return logError(reason);
  });

  // Catch uncaught exceptions and pass them over to our log handler
  process.on("uncaughtException", function (error) {
    return logError(error);
  });

  // Enable by hooking into V8 Stacktrace API integration
  // https://github.com/v8/v8/wiki/Stack-Trace-API
  Error.prepareStackTrace = prepareStackTrace;

  console.log("Activated enhanced stack traces");
}

// This file is just for exporting infrastructure to applications built upon this.

// Polyfill for fetch() API in NodeJS based on code from
// https://github.com/matthew-andrews/isomorphic-fetch/blob/master/fetch-npm-node.js
if (!global.fetch) {
  var realFetch = require("node-fetch");
  global.fetch = function (url, options) {
    var normalized = /^\/\//.test(url) ? "https:" + url : url;
    return realFetch.call(this, normalized, options);
  };
  global.Response = realFetch.Response;
  global.Headers = realFetch.Headers;
  global.Request = realFetch.Request;
}

export { renderPage, renderApplication, getLocaleData, prepareResponse, createReduxStore, createRootReducer, emptyReducer, emptyMiddleware, emptyEnhancer, edgeReducer, createApolloClient, createReduxRouter, requiresIntlPolyfill, installIntlPolyfill, requiresReactIntl, installReactIntl, getRegion, getLanguage, getLocale, ensureReactIntlSupport, ensureIntlSupport, wrapApplication, deepFetch, routed, createKernel, fetchData, loadImport$1 as loadImport, preloadImport$1 as preloadImport, cleanSourceFileName, isRelevantFrame, getRelevantFrames, frameToString, prepareStackTrace, highlightStack, logError, enableEnhancedStackTraces };
//# sourceMappingURL=node.es5.esm.js.map
