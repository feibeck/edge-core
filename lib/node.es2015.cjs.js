/*! edge-core v0.6.27 by Sebastian Software <s.werner@sebastian-software.de> */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var redux = require('redux');
var thunk = _interopDefault(require('redux-thunk'));
var reactApollo = require('react-apollo');
var reduxFirstRouter = require('redux-first-router');
var areIntlLocalesSupported = _interopDefault(require('intl-locales-supported'));
var reactIntl = require('react-intl');
var reactUniversalComponent = require('react-universal-component');
var _jsx = _interopDefault(require('babel-runtime/helpers/jsx'));
var React = _interopDefault(require('react'));
var reactRedux = require('react-redux');
var reactTreeWalker = _interopDefault(require('react-tree-walker'));
var nodentRuntime = _interopDefault(require('nodent-runtime'));
var serialize = _interopDefault(require('serialize-javascript'));
var Helmet = _interopDefault(require('react-helmet'));
var ReactDOM = _interopDefault(require('react-dom/server'));
var server = require('react-universal-component/server');
var flushChunks = _interopDefault(require('webpack-flush-chunks'));
var edgeUseragent = require('edge-useragent');
var codeFrame = _interopDefault(require('babel-code-frame'));
var chalk = _interopDefault(require('chalk'));
var sourceMapSupport = require('source-map-support');
var fs = require('fs');

const composeEnhancers = "node" === "web" && process.env.NODE_ENV === "development" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || redux.compose;

/**
 * Placeholder for a non active reducer in Redux.
 *
 * @param previousState {Object} Previous state.
 * @param action {string} Action which is being dispatched.
 */
function emptyReducer(previousState = {}) {
  return previousState;
}

/**
 * Placeholder for a non active middleware in Redux.
 *
 * @param store {Object} Store object to work with.
 */
function emptyMiddleware() {
  return next => {
    return action => {
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
function edgeReducer(previousState = {}) {
  return previousState;
}

/**
 * Selector for quering the nonce which must be used for injecting script tags.
 */


/**
 * Bundles the given reducers into a root reducer for the application
 */
function createRootReducer(reducers, router = null, apollo = null) {
  const allReducers = Object.assign({}, reducers, {

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

  return redux.combineReducers(allReducers);
}

/**
 *
 *
 */
function createReduxStore(config = {}) {
  const {
    reducers = {},
    middlewares = [],
    enhancers = [],
    state = {},
    router = null,
    apollo = null
  } = config;

  const rootReducer = createRootReducer(reducers, router, apollo);

  const rootEnhancers = composeEnhancers(redux.applyMiddleware(apollo ? apollo.middleware() : emptyMiddleware,

  // Redux middleware that spits an error on you when you try to mutate
  // your state either inside a dispatch or between dispatches.
  // https://github.com/leoasis/redux-immutable-state-invariant
  process.env.NODE_ENV === "development" ? require("redux-immutable-state-invariant")["default"]() : emptyMiddleware,

  // Basic Promise based async handling
  thunk,

  // Redux Router First Middleware
  router ? router.middleware : emptyMiddleware,

  // Application specific middlewares
  ...middlewares,

  // Add automatic state change logging for client application
  // Note: Logger must be the last middleware in chain, otherwise it will log thunk and
  // promise, not actual actions (https://github.com/evgenyrodionov/redux-logger/issues/20).
  emptyMiddleware),

  // Redux First Router Enhancer
  router ? router.enhancer : emptyEnhancer,

  // Application specific enhancers
  ...enhancers);

  const store = redux.createStore(rootReducer, state, rootEnhancers);

  return store;
}

function createApolloClient(config = {}) {
  const {
    headers,
    uri = null,
    batchRequests = false,
    trustNetwork = true,
    queryDeduplication = true
  } = config;

  const ssrMode = "node" === "node";
  var client;

  if (uri != null) {
    var opts = {
      credentials: trustNetwork ? "include" : "same-origin",

      // transfer request headers to networkInterface so that they're accessible to proxy server
      // Addresses this issue: https://github.com/matthew-andrews/isomorphic-fetch/issues/83
      headers
    };

    var networkInterface;

    if (batchRequests) {
      networkInterface = reactApollo.createBatchingNetworkInterface({
        uri,
        batchInterval: 10,
        opts
      });
    } else {
      networkInterface = reactApollo.createNetworkInterface({
        uri,
        opts
      });
    }

    client = new reactApollo.ApolloClient({
      ssrMode,
      queryDeduplication,
      networkInterface
    });
  } else {
    client = new reactApollo.ApolloClient({
      ssrMode,
      queryDeduplication
    });
  }

  return client;
}

/* eslint-disable import/no-commonjs */
const createHistory = require("history/createMemoryHistory")["default"];

function createReduxRouter(routes, path = null, config = {}) {
  // match initial route to express path
  const history = path ? createHistory({
    initialEntries: [path]
  }) : createHistory();

  return reduxFirstRouter.connectRoutes(history, routes);
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
  const module = __webpack_require__(wrapped.resolve());
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
  reactUniversalComponent.CHUNK_NAMES.add(wrapped.chunkName());
}

const PREFER_NATIVE = true;

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
  const Polyfill = global.IntlPolyfill;
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
  const hasIntlSupport = global.Intl && areIntlLocalesSupported([intl.locale]);

  {
    if (!hasIntlSupport) {
      loadImport$1(importWrapper);
    }

    let clientHasIntl = false;
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
  let Wrapped = Application;

  if (kernel.apollo) {
    Wrapped = _jsx(reactApollo.ApolloProvider, {
      client: kernel.apollo,
      store: kernel.store
    }, void 0, Wrapped);
  }

  if (kernel.store) {
    Wrapped = _jsx(reactRedux.Provider, {
      store: kernel.store
    }, void 0, Wrapped);
  }

  if (kernel.intl) {
    Wrapped = _jsx(reactIntl.IntlProvider, {
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

  return reactRedux.connect(function (state) {
    return {
      currentLocation: state.location.type,
      currentPayload: state.location.payload
    };
  })(function ({ currentLocation, currentPayload }) {
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

const defaultState = null;

/**
 *
 * @param {*} State
 * @param {*} param1
 */
function createKernel(State, { state = defaultState, edge, request } = {}) {
  // Use given edge instance when not already defined on state
  if ("node" === "node" && edge != null) {
    if (!state.edge) {
      state.edge = edge;
    }
  }

  let router = createReduxRouter(State.getRoutes(), request ? request.path : null);

  const apolloClientConfig = State.getApolloClientConfig && State.getApolloClientConfig() ? State.getApolloClientConfig() : { uri: null };

  let apollo = createApolloClient(apolloClientConfig);

  let store = createReduxStore({
    reducers: State.getReducers(),
    enhancers: State.getEnhancers(),
    middlewares: State.getMiddlewares(),
    state,
    router,
    apollo
  });

  let intl = state.edge.intl;

  // Kernel "Instance"
  return {
    intl,
    router,
    apollo,
    store
  };
}

var fetchData = (function (WrappedApplication, kernel) {
  return new Promise(function ($return, $error) {
    var start, result;
    start = new Date();

    console.log("[EDGE] Fetching data...");
    return Promise.all([kernel.router.thunk(kernel.store), deepFetch(WrappedApplication)]).then(function ($await_1) {
      result = $await_1;


      console.log(`[EDGE] Done in ${new Date() - start}ms`);
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
function renderPage({
  state,
  html,
  styles,
  scripts
}) {
  if (typeof state !== "object" || typeof state.edge !== "object") {
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

  const edge = state.edge;
  const helmet = Helmet.renderStatic();
  const inlineCode = `APP_STATE=${serialize(state, { isJSON: true })};`;
  const nonceHtml = edge.nonce ? `nonce="${edge.nonce}"` : "";

  return `
<!doctype html>
<html lang="${edge.intl.locale}" ${helmet.htmlAttributes.toString()}>
  <head>
    ${helmet.title.toString()}
    ${helmet.meta.toString()}
    ${helmet.link.toString()}
    ${styles}
    ${helmet.style.toString()}
  </head>
  <body>
    <div id="root">${html}</div>
    <script ${nonceHtml}>${inlineCode}</script>
    ${scripts}
    ${helmet.script.toString()}
  </body>
</html>`;
}

/* eslint-disable max-params, no-console */
function renderApplication({ Application, clientStats, kernel, request, response }) {
  console.log("[EDGE] Exporting current state...");
  const state = kernel.store.getState();

  // the idiomatic way to handle routes not found :)
  // your component's should also detect this state and render a 404 scene
  const location = state.location;
  let httpStatus = 200;
  if (location.type === reduxFirstRouter.NOT_FOUND) {
    /* eslint-disable no-magic-numbers */
    httpStatus = 404;
  } else if (location.kind === "redirect") {
    // By using history.replace() behind the scenes, the private URL the user
    // tried to access now becomes the /login URL in the stack, and the user
    // can go back to the previous page just as he/she would expect.
    return response.redirect(302, location.pathname);
  }

  console.log("[EDGE] Rendering application...");
  let html = "";
  try {
    html = ReactDOM.renderToString(Application);
  } catch (err) {
    console.error("Unable to render server side React:", err);
  }

  console.log("[EDGE] Flushing chunks...");
  const chunkNames = server.flushChunkNames();
  console.log("[EDGE] Rendered Chunk Names:", chunkNames.join(", "));
  const { js, styles, cssHash } = flushChunks(clientStats, { chunkNames });
  console.log("[EDGE] Flushed Script Tags:\n" + js.toString() + "\n");
  console.log("[EDGE] Flushed CSS Tags:\n" + styles.toString() + "\n");

  // TODO: Support SRI integrity checksums as added by SRI Webpack Plugin
  // https://www.npmjs.com/package/webpack-subresource-integrity#without-htmlwebpackplugin

  // Render full HTML page using external helper
  console.log("Rendering Page...");
  const renderedPage = renderPage({
    state,
    html,
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
  let locale = request.locale;
  let language = null;
  let region = null;
  let source = null;

  if (locale) {
    language = locale.language;
    region = locale.region;
    source = locale.source;
    locale = `${language}-${region}`;
  } else {
    console.warn("Locale not auto-detected by server!");

    locale = process.env.DEFAULT_LOCALE;
    if (locale) {
      source = "env";
      let splitted = locale.split("-");
      language = splitted[0];
      region = splitted[1];
    } else {
      locale = "en-US";
      language = "en";
      region = "US";
      source = "default";
    }
  }

  console.log(`Using locale: ${locale} via ${source}`);

  return {
    locale,
    language,
    region
  };
}

function prepareResponse(request) {
  const intl = getLocaleData(request);
  const browser = edgeUseragent.parse(request.headers["user-agent"]);

  return {
    intl,
    browser
  };
}

const FUNCTION_NAME_FILTERS = [/__webpack_require__/];
const SOURCE_FILE_FILTERS = [/\/webpack\/bootstrap/];

const FUNCTION_NAME_CLEARANCE = [/__webpack_exports__/];
const TYPE_NAME_CLEARANCE = [/^Object$/];

const CODE_FRAME_OPTIONS = {
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
  const wrappedFrame = sourceMapSupport.wrapCallSite(frame);
  const generatedFile = frame.getFileName();

  var sourceFile = wrappedFrame.getFileName();
  var functionName = wrappedFrame.getFunctionName();

  // Filter out all raw files which do not have any source mapping
  // This typically removes most of the build related infrastructure
  // which is neither application or framework code.

  if (!(sourceFile !== generatedFile)) {
    return false;
  }

  // Filter out specific functions e.g. webpack require wrappers
  if (FUNCTION_NAME_FILTERS.some(regexp => regexp.test(functionName))) {
    return false;
  }

  // Filter out specific source files e.g. webpack bootstrap implementation
  if (SOURCE_FILE_FILTERS.some(regexp => regexp.test(sourceFile))) {
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
  const wrappedFrame = sourceMapSupport.wrapCallSite(frame);

  var sourceFile = wrappedFrame.getFileName();
  var functionName = wrappedFrame.getFunctionName();
  var typeName = wrappedFrame.getTypeName();

  // Ignore some cryptic function names which typically are just function calls
  if (FUNCTION_NAME_CLEARANCE.some(regexp => regexp.test(functionName))) {
    functionName = "";
  }

  // Filter out configured type names
  if (TYPE_NAME_CLEARANCE.some(regexp => regexp.test(typeName))) {
    typeName = "";
  }

  // Strip out generated filename part from source field
  sourceFile = cleanSourceFileName(sourceFile);

  // Retrieve source file locations
  const lineNumber = wrappedFrame.getLineNumber();
  const columnNumber = wrappedFrame.getColumnNumber();

  var identifier = functionName || typeName || "<anonymous>";

  // Stack frames are displayed in the following format:
  //   at FunctionName (<Fully-qualified name/URL>:<line number>:<column number>)
  // Via: https://docs.microsoft.com/en-us/scripting/javascript/reference/stack-property-error-javascript
  return `at ${identifier}@${sourceFile}:${lineNumber}:${columnNumber}`;
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
    var wrappedFirstFrame = sourceMapSupport.wrapCallSite(firstFrame);
    var sourceFile = cleanSourceFileName(wrappedFirstFrame.getFileName());

    var sourceText = "";
    try {
      sourceText = fs.readFileSync(sourceFile, "utf-8");
    } catch (error) {}
    // Ignore errors


    // Generate highlighted code frame and attach it to the native error object (for later usage)
    if (sourceText) {
      const result = codeFrame(sourceText, wrappedFirstFrame.getLineNumber(), wrappedFirstFrame.getColumnNumber(), CODE_FRAME_OPTIONS);
      nativeError.code = result;
    }
  }

  return frames.map(frame => frameToString(frame)).filter(item => item != null).join("\n");
}

/**
 * Highlights the given stacktrace object using `chalk.
 *
 * @param {Stack} stack Stacktrace result string.
 * @returns {string} Highlighted stack trace for NodeJS.
 */
function highlightStack(stack) {
  return stack.split("\n").map(line => {
    if (line.startsWith("at ")) {
      /* eslint-disable max-params */
      return line.replace(/(at )(.*?)(@)(.*?):([0-9]+)(:)([0-9]+)/, (match, intro, id, symbol, filename, lineNo, separator, columnNo) => `  - ${chalk.white(id)} ${chalk.dim(filename)} [${chalk.yellow(lineNo)}:${chalk.yellow(columnNo)}]`);
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
    const formattedMessage = chalk.red(nativeError.name + ": " + nativeError.message);
    const formattedStack = highlightStack(nativeError.stack);

    // Optionally display source code except
    if (nativeError.code) {
      console.error(`${formattedMessage}\n\n${nativeError.code}\n\n${formattedStack}`);
    } else {
      console.error(`${formattedMessage}\n\n${formattedStack}`);
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
function enableEnhancedStackTraces(debug = false) {
  // Override native Promise API with faster and more developerr friendly bluebird
  global.Promise = require("bluebird");

  /* eslint-disable no-use-extend-native/no-use-extend-native */
  Promise.config({
    longStackTraces: debug,
    warnings: debug
  });

  // Catch unhandled Promise rejections and pass them over to our log handler
  process.on("unhandledRejection", reason => logError(reason));

  // Catch uncaught exceptions and pass them over to our log handler
  process.on("uncaughtException", error => logError(error));

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
    const normalized = /^\/\//.test(url) ? `https:${url}` : url;
    return realFetch.call(this, normalized, options);
  };
  global.Response = realFetch.Response;
  global.Headers = realFetch.Headers;
  global.Request = realFetch.Request;
}

exports.renderPage = renderPage;
exports.renderApplication = renderApplication;
exports.getLocaleData = getLocaleData;
exports.prepareResponse = prepareResponse;
exports.createReduxStore = createReduxStore;
exports.createRootReducer = createRootReducer;
exports.emptyReducer = emptyReducer;
exports.emptyMiddleware = emptyMiddleware;
exports.emptyEnhancer = emptyEnhancer;
exports.edgeReducer = edgeReducer;
exports.createApolloClient = createApolloClient;
exports.createReduxRouter = createReduxRouter;
exports.requiresIntlPolyfill = requiresIntlPolyfill;
exports.installIntlPolyfill = installIntlPolyfill;
exports.requiresReactIntl = requiresReactIntl;
exports.installReactIntl = installReactIntl;
exports.getRegion = getRegion;
exports.getLanguage = getLanguage;
exports.getLocale = getLocale;
exports.ensureReactIntlSupport = ensureReactIntlSupport;
exports.ensureIntlSupport = ensureIntlSupport;
exports.wrapApplication = wrapApplication;
exports.deepFetch = deepFetch;
exports.routed = routed;
exports.createKernel = createKernel;
exports.fetchData = fetchData;
exports.loadImport = loadImport$1;
exports.preloadImport = preloadImport$1;
exports.cleanSourceFileName = cleanSourceFileName;
exports.isRelevantFrame = isRelevantFrame;
exports.getRelevantFrames = getRelevantFrames;
exports.frameToString = frameToString;
exports.prepareStackTrace = prepareStackTrace;
exports.highlightStack = highlightStack;
exports.logError = logError;
exports.enableEnhancedStackTraces = enableEnhancedStackTraces;
//# sourceMappingURL=node.es2015.cjs.js.map
