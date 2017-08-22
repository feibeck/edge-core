import areIntlLocalesSupported from "intl-locales-supported"
import { addLocaleData } from "react-intl"

import {
  loadImport as loadImportClient
} from "../client/loadImport"

import {
  loadImport as loadImportServer,
  preloadImport as preloadImportServer
} from "../server/loadImport"

import { feature } from "caniuse-lite"

const PREFER_NATIVE = true

var intlSupportTable
if (process.env.TARGET === "server") {
  intlSupportTable = feature(
    require("caniuse-lite/data/features/internationalization.js")
  )
}

export function requiresIntlPolyfill(locale) {
  // Determine if the built-in `Intl` has the locale data we need.
  if (PREFER_NATIVE && global.Intl && areIntlLocalesSupported([ locale ])) {
    return false
  }

  // By default Node only ships with basic English locale data. You can however build a
  // Node binary with all locale data. We recommend doing this if you control the container
  // your Node app runs in, otherwise you'll want to polyfill Intl in Node.
  // Via: https://github.com/yahoo/react-intl/wiki#i18n-in-javascript
  if (PREFER_NATIVE === false && process.env.TARGET === "node")
  {
    /* eslint-disable no-console */
    console.warn("Your NodeJS installation does not include full ICU locale data! Fallback to polyfill!")
    console.warn("See also: https://github.com/nodejs/node/wiki/Intl")
  }

  return true
}

export function installIntlPolyfill() {
  const Polyfill = global.IntlPolyfill
  if (!Polyfill) {
    console.log("Can't find IntlPolyfill global!")
    return
  }

  // `Intl` exists, but it doesn't have the data we need, so load the
  // polyfill and patch the constructors we need with the polyfill's.
  if (global.Intl) {
    Intl.NumberFormat = Polyfill.NumberFormat
    Intl.DateTimeFormat = Polyfill.DateTimeFormat
  } else {
    global.Intl = Polyfill
  }
}

export function requiresReactIntl() {
  // Locale Data in Node.js:
  // When using React Intl in Node.js (same for the Intl.js polyfill), all locale data will be
  // loaded into memory. This makes it easier to write a universal/isomorphic React app with
  // React Intl since you won't have to worry about dynamically loading locale data on the server.
  // Via: https://github.com/yahoo/react-intl/wiki#locale-data-in-nodejs

  // As mentioned above no additional data has to be loaded for NodeJS. We are just resolving
  // the Promise in that case.
  if (process.env.TARGET === "node") {
    return false
  }

  return true
}

export function installReactIntl(response) {
  addLocaleData(response)
}


/**
 * Dummy reducer for exporting server-side data to the client-side application.
 */
export function intlReducer(previousState = {}, action) {
  return previousState
}


/**
 * Selector for quering the current locale e.g. de-DE, en-US, ...
 */
export function getLocale(state) {
  return state.intl.locale
}


/**
 * Selector for quering the current language e.g. de, en, fr, es, ...
 */
export function getLanguage(state) {
  return state.intl.language
}


/**
 * Selector for quering the current region e.g. DE, BR, PT, ...
 */
export function getRegion(state) {
  return state.intl.region
}


// Note:
// As long as Rollup does not support dynamic `import()` we unfortunately have to implement
// the loading part of intl files and general all code splitting in the real application
// and not in any shared library. There is currently a way to transpile `import()` to
// `require.ensure()` which does 50% of the equation - and is supported by *prepublish* but the
// remaining part to define code splitting via `webpackChunkName` is not solvable right now.

export function ensureReactIntlSupport(universalImport, language) {
  // React-Intl always loads monolithically with all locales in NodeJS
  if (process.env.TARGET === "server") {
    return preloadImportServer(universalImport)
  } else {
    return loadImportClient(universalImport).then(installReactIntl)
  }
}

/* eslint-disable max-params */
export function ensureIntlSupport(universalImport, locale, userAgent) {
  const hasIntlSupport = global.Intl && areIntlLocalesSupported([ locale ])

  if (process.env.TARGET === "server") {
    if (!hasIntlSupport) {
      loadImportServer(universalImport)
    }

    let clientHasIntl = false
    try {
      // TODO: Make this smarter and more error tolerant
      if (intlSupportTable.stats[userAgent.family.toLowerCase()][userAgent.major] === "y") {
        clientHasIntl = true
      }
    } catch (error) {
      // pass
    }

    if (!clientHasIntl) {
      preloadImportServer(universalImport)
    }
  } else if (!hasIntlSupport) {
    return loadImportClient(universalImport).then(installIntlPolyfill)
  }

  return null
}
