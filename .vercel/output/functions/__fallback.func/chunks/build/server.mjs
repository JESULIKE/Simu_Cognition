import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import { hasInjectionContext, getCurrentInstance, inject, readonly, getCurrentScope, computed, toRef, isRef, defineComponent, createElementBlock, shallowRef, provide, cloneVNode, h, defineAsyncComponent, unref, shallowReactive, ref, createApp, isVNode, createCommentVNode, onErrorCaptured, onServerPrefetch, createVNode, resolveDynamicComponent, reactive, effectScope, mergeProps, withCtx, Suspense, nextTick, Fragment, isReadonly, toRaw, useSSRContext, isShallow, isReactive } from 'vue';
import { J as parseURL, D as encodePath, K as decodePath, L as hasProtocol, M as isScriptProtocol, j as joinURL, w as withQuery, N as sanitizeStatusCode, c as createError$1, O as withLeadingSlash, P as getRequestHeaders$1, $ as $fetch$1, Q as baseURL, l as defu, R as appendHeader, S as createHooks, T as getHeader, U as toRouteMatcher, V as createRouter$1, W as withoutTrailingSlash, X as withoutBase } from '../_/nitro.mjs';
import { setActivePinia, createPinia, shouldHydrate } from 'pinia';
import { useRoute as useRoute$1, RouterView, START_LOCATION, createMemoryHistory, createRouter } from 'vue-router';
import getURL from 'requrl';
import { ssrRenderSuspense, ssrRenderComponent, ssrRenderVNode, ssrRenderAttrs } from 'vue/server-renderer';
import '@prisma/client';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

function createContext$1(opts = {}) {
  let currentInstance;
  let isSingleton = false;
  const checkConflict = (instance) => {
    if (currentInstance && currentInstance !== instance) {
      throw new Error("Context conflict");
    }
  };
  let als;
  if (opts.asyncContext) {
    const _AsyncLocalStorage = opts.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    if (_AsyncLocalStorage) {
      als = new _AsyncLocalStorage();
    } else {
      console.warn("[unctx] `AsyncLocalStorage` is not provided.");
    }
  }
  const _getCurrentInstance = () => {
    if (als) {
      const instance = als.getStore();
      if (instance !== void 0) {
        return instance;
      }
    }
    return currentInstance;
  };
  return {
    use: () => {
      const _instance = _getCurrentInstance();
      if (_instance === void 0) {
        throw new Error("Context is not available");
      }
      return _instance;
    },
    tryUse: () => {
      return _getCurrentInstance();
    },
    set: (instance, replace) => {
      if (!replace) {
        checkConflict(instance);
      }
      currentInstance = instance;
      isSingleton = true;
    },
    unset: () => {
      currentInstance = void 0;
      isSingleton = false;
    },
    call: (instance, callback) => {
      checkConflict(instance);
      currentInstance = instance;
      try {
        return als ? als.run(instance, callback) : callback();
      } finally {
        if (!isSingleton) {
          currentInstance = void 0;
        }
      }
    },
    async callAsync(instance, callback) {
      currentInstance = instance;
      const onRestore = () => {
        currentInstance = instance;
      };
      const onLeave = () => currentInstance === instance ? onRestore : void 0;
      asyncHandlers$1.add(onLeave);
      try {
        const r = als ? als.run(instance, callback) : callback();
        if (!isSingleton) {
          currentInstance = void 0;
        }
        return await r;
      } finally {
        asyncHandlers$1.delete(onLeave);
      }
    }
  };
}
function createNamespace$1(defaultOpts = {}) {
  const contexts = {};
  return {
    get(key, opts = {}) {
      if (!contexts[key]) {
        contexts[key] = createContext$1({ ...defaultOpts, ...opts });
      }
      return contexts[key];
    }
  };
}
const _globalThis$1 = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof global !== "undefined" ? global : {};
const globalKey$1 = "__unctx__";
const defaultNamespace = _globalThis$1[globalKey$1] || (_globalThis$1[globalKey$1] = createNamespace$1());
const getContext = (key, opts = {}) => defaultNamespace.get(key, opts);
const asyncHandlersKey$1 = "__unctx_async_handlers__";
const asyncHandlers$1 = _globalThis$1[asyncHandlersKey$1] || (_globalThis$1[asyncHandlersKey$1] = /* @__PURE__ */ new Set());
function executeAsync$1(function_) {
  const restores = [];
  for (const leaveHandler of asyncHandlers$1) {
    const restore2 = leaveHandler();
    if (restore2) {
      restores.push(restore2);
    }
  }
  const restore = () => {
    for (const restore2 of restores) {
      restore2();
    }
  };
  let awaitable = function_();
  if (awaitable && typeof awaitable === "object" && "catch" in awaitable) {
    awaitable = awaitable.catch((error) => {
      restore();
      throw error;
    });
  }
  return [awaitable, restore];
}

function createContext(opts = {}) {
  let currentInstance;
  let isSingleton = false;
  const checkConflict = (instance) => {
    if (currentInstance && currentInstance !== instance) {
      throw new Error("Context conflict");
    }
  };
  let als;
  if (opts.asyncContext) {
    const _AsyncLocalStorage = opts.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    if (_AsyncLocalStorage) {
      als = new _AsyncLocalStorage();
    } else {
      console.warn("[unctx] `AsyncLocalStorage` is not provided.");
    }
  }
  const _getCurrentInstance = () => {
    if (als) {
      const instance = als.getStore();
      if (instance !== void 0) {
        return instance;
      }
    }
    return currentInstance;
  };
  return {
    use: () => {
      const _instance = _getCurrentInstance();
      if (_instance === void 0) {
        throw new Error("Context is not available");
      }
      return _instance;
    },
    tryUse: () => {
      return _getCurrentInstance();
    },
    set: (instance, replace) => {
      if (!replace) {
        checkConflict(instance);
      }
      currentInstance = instance;
      isSingleton = true;
    },
    unset: () => {
      currentInstance = void 0;
      isSingleton = false;
    },
    call: (instance, callback) => {
      checkConflict(instance);
      currentInstance = instance;
      try {
        return als ? als.run(instance, callback) : callback();
      } finally {
        if (!isSingleton) {
          currentInstance = void 0;
        }
      }
    },
    async callAsync(instance, callback) {
      currentInstance = instance;
      const onRestore = () => {
        currentInstance = instance;
      };
      const onLeave = () => currentInstance === instance ? onRestore : void 0;
      asyncHandlers.add(onLeave);
      try {
        const r = als ? als.run(instance, callback) : callback();
        if (!isSingleton) {
          currentInstance = void 0;
        }
        return await r;
      } finally {
        asyncHandlers.delete(onLeave);
      }
    }
  };
}
function createNamespace(defaultOpts = {}) {
  const contexts = {};
  return {
    get(key, opts = {}) {
      if (!contexts[key]) {
        contexts[key] = createContext({ ...defaultOpts, ...opts });
      }
      return contexts[key];
    }
  };
}
const _globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof global !== "undefined" ? global : {};
const globalKey = "__unctx__";
_globalThis[globalKey] || (_globalThis[globalKey] = createNamespace());
const asyncHandlersKey = "__unctx_async_handlers__";
const asyncHandlers = _globalThis[asyncHandlersKey] || (_globalThis[asyncHandlersKey] = /* @__PURE__ */ new Set());
function executeAsync(function_) {
  const restores = [];
  for (const leaveHandler of asyncHandlers) {
    const restore2 = leaveHandler();
    if (restore2) {
      restores.push(restore2);
    }
  }
  const restore = () => {
    for (const restore2 of restores) {
      restore2();
    }
  };
  let awaitable = function_();
  if (awaitable && typeof awaitable === "object" && "catch" in awaitable) {
    awaitable = awaitable.catch((error) => {
      restore();
      throw error;
    });
  }
  return [awaitable, restore];
}

if (!globalThis.$fetch) {
  globalThis.$fetch = $fetch$1.create({
    baseURL: baseURL()
  });
}
if (!("global" in globalThis)) {
  globalThis.global = globalThis;
}
const appLayoutTransition = false;
const nuxtLinkDefaults = { "componentName": "NuxtLink" };
const appId = "nuxt-app";
function getNuxtAppCtx(id = appId) {
  return getContext(id, {
    asyncContext: false
  });
}
const NuxtPluginIndicator = "__nuxt_plugin";
function createNuxtApp(options) {
  let hydratingCount = 0;
  const nuxtApp = {
    _id: options.id || appId || "nuxt-app",
    _scope: effectScope(),
    provide: void 0,
    globalName: "nuxt",
    versions: {
      get nuxt() {
        return "3.21.11";
      },
      get vue() {
        return nuxtApp.vueApp.version;
      }
    },
    payload: shallowReactive({
      ...options.ssrContext?.payload || {},
      data: shallowReactive({}),
      state: reactive({}),
      once: /* @__PURE__ */ new Set(),
      _errors: shallowReactive({})
    }),
    static: {
      data: {}
    },
    runWithContext(fn) {
      if (nuxtApp._scope.active && !getCurrentScope()) {
        return nuxtApp._scope.run(() => callWithNuxt(nuxtApp, fn));
      }
      return callWithNuxt(nuxtApp, fn);
    },
    isHydrating: false,
    deferHydration() {
      if (!nuxtApp.isHydrating) {
        return () => {
        };
      }
      hydratingCount++;
      let called = false;
      return () => {
        if (called) {
          return;
        }
        called = true;
        hydratingCount--;
        if (hydratingCount === 0) {
          nuxtApp.isHydrating = false;
          return nuxtApp.callHook("app:suspense:resolve");
        }
      };
    },
    _asyncDataPromises: {},
    _asyncData: shallowReactive({}),
    _payloadRevivers: {},
    ...options
  };
  {
    nuxtApp.payload.serverRendered = true;
  }
  if (nuxtApp.ssrContext) {
    nuxtApp.payload.path = nuxtApp.ssrContext.url;
    nuxtApp.ssrContext.nuxt = nuxtApp;
    nuxtApp.ssrContext.payload = nuxtApp.payload;
    nuxtApp.ssrContext.config = {
      public: nuxtApp.ssrContext.runtimeConfig.public,
      app: nuxtApp.ssrContext.runtimeConfig.app
    };
  }
  nuxtApp.hooks = createHooks();
  nuxtApp.hook = nuxtApp.hooks.hook;
  {
    const contextCaller = async function(hooks, args) {
      for (const hook of hooks) {
        await nuxtApp.runWithContext(() => hook(...args));
      }
    };
    nuxtApp.hooks.callHook = (name, ...args) => nuxtApp.hooks.callHookWith(contextCaller, name, ...args);
  }
  nuxtApp.callHook = nuxtApp.hooks.callHook;
  nuxtApp.provide = (name, value) => {
    const $name = "$" + name;
    defineGetter(nuxtApp, $name, value);
    defineGetter(nuxtApp.vueApp.config.globalProperties, $name, value);
  };
  defineGetter(nuxtApp.vueApp, "$nuxt", nuxtApp);
  defineGetter(nuxtApp.vueApp.config.globalProperties, "$nuxt", nuxtApp);
  const runtimeConfig = options.ssrContext.runtimeConfig;
  nuxtApp.provide("config", runtimeConfig);
  return nuxtApp;
}
function registerPluginHooks(nuxtApp, plugin2) {
  if (plugin2.hooks) {
    nuxtApp.hooks.addHooks(plugin2.hooks);
  }
}
async function applyPlugin(nuxtApp, plugin2) {
  if (typeof plugin2 === "function") {
    const { provide: provide2 } = await nuxtApp.runWithContext(() => plugin2(nuxtApp)) || {};
    if (provide2 && typeof provide2 === "object") {
      for (const key in provide2) {
        nuxtApp.provide(key, provide2[key]);
      }
    }
  }
}
async function applyPlugins(nuxtApp, plugins2) {
  const resolvedPlugins = /* @__PURE__ */ new Set();
  const unresolvedPlugins = [];
  const parallels = [];
  let error = void 0;
  let promiseDepth = 0;
  async function executePlugin(plugin2) {
    const unresolvedPluginsForThisPlugin = plugin2.dependsOn?.filter((name) => plugins2.some((p) => p._name === name) && !resolvedPlugins.has(name)) ?? [];
    if (unresolvedPluginsForThisPlugin.length > 0) {
      unresolvedPlugins.push([new Set(unresolvedPluginsForThisPlugin), plugin2]);
    } else {
      const promise = applyPlugin(nuxtApp, plugin2).then(async () => {
        if (plugin2._name) {
          resolvedPlugins.add(plugin2._name);
          await Promise.all(unresolvedPlugins.map(async ([dependsOn, unexecutedPlugin]) => {
            if (dependsOn.has(plugin2._name)) {
              dependsOn.delete(plugin2._name);
              if (dependsOn.size === 0) {
                promiseDepth++;
                await executePlugin(unexecutedPlugin);
              }
            }
          }));
        }
      }).catch((e) => {
        if (!plugin2.parallel && !nuxtApp.payload.error) {
          throw e;
        }
        error ||= e;
      });
      if (plugin2.parallel) {
        parallels.push(promise);
      } else {
        await promise;
      }
    }
  }
  for (const plugin2 of plugins2) {
    if (nuxtApp.ssrContext?.islandContext && plugin2.env?.islands === false) {
      continue;
    }
    registerPluginHooks(nuxtApp, plugin2);
  }
  for (const plugin2 of plugins2) {
    if (nuxtApp.ssrContext?.islandContext && plugin2.env?.islands === false) {
      continue;
    }
    await executePlugin(plugin2);
  }
  await Promise.all(parallels);
  if (promiseDepth) {
    for (let i = 0; i < promiseDepth; i++) {
      await Promise.all(parallels);
    }
  }
  if (error) {
    throw nuxtApp.payload.error || error;
  }
}
// @__NO_SIDE_EFFECTS__
function defineNuxtPlugin(plugin2) {
  if (typeof plugin2 === "function") {
    return plugin2;
  }
  const _name = plugin2._name || plugin2.name;
  delete plugin2.name;
  return Object.assign(plugin2.setup || (() => {
  }), plugin2, { [NuxtPluginIndicator]: true, _name });
}
const definePayloadPlugin = defineNuxtPlugin;
function callWithNuxt(nuxt, setup, args) {
  const fn = () => args ? setup(...args) : setup();
  const nuxtAppCtx = getNuxtAppCtx(nuxt._id);
  {
    return nuxt.vueApp.runWithContext(() => nuxtAppCtx.callAsync(nuxt, fn));
  }
}
function tryUseNuxtApp(id) {
  let nuxtAppInstance;
  if (hasInjectionContext()) {
    nuxtAppInstance = getCurrentInstance()?.appContext.app.$nuxt;
  }
  nuxtAppInstance ||= getNuxtAppCtx(id).tryUse();
  return nuxtAppInstance || null;
}
function useNuxtApp(id) {
  const nuxtAppInstance = tryUseNuxtApp(id);
  if (!nuxtAppInstance) {
    {
      throw new Error("[nuxt] instance unavailable");
    }
  }
  return nuxtAppInstance;
}
// @__NO_SIDE_EFFECTS__
function useRuntimeConfig(_event) {
  return useNuxtApp().$config;
}
function defineGetter(obj, key, val) {
  Object.defineProperty(obj, key, { get: () => val });
}
const LayoutMetaSymbol = /* @__PURE__ */ Symbol("layout-meta");
const PageRouteSymbol = /* @__PURE__ */ Symbol("route");
globalThis._importMeta_.url.replace(/\/app\/.*$/, "/");
const useRouter = () => {
  return useNuxtApp()?.$router;
};
function isScopeWithinInstance(instance) {
  const instanceScope = instance.scope;
  let scope = getCurrentScope();
  while (scope) {
    if (scope === instanceScope) {
      return true;
    }
    scope = scope.parent;
  }
  return false;
}
const useRoute = () => {
  if (hasInjectionContext()) {
    const instance = getCurrentInstance();
    if (!instance || isScopeWithinInstance(instance)) {
      return inject(PageRouteSymbol, useNuxtApp()._route);
    }
  }
  return useNuxtApp()._route;
};
// @__NO_SIDE_EFFECTS__
function defineNuxtRouteMiddleware(middleware) {
  return middleware;
}
const addRouteMiddleware = (name, middleware, options = {}) => {
  const nuxtApp = useNuxtApp();
  const global = options.global || typeof name !== "string";
  const mw = middleware;
  if (!mw) {
    console.warn("[nuxt] No route middleware passed to `addRouteMiddleware`.", name);
    return;
  }
  if (global) {
    nuxtApp._middleware.global.push(mw);
  } else {
    nuxtApp._middleware.named[name] = mw;
  }
};
const isProcessingMiddleware = () => {
  try {
    if (useNuxtApp()._processingMiddleware) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
};
const HTML_ATTR_UNSAFE_RE = /[&"'<>]/g;
const HTML_ATTR_ENCODE_MAP = {
  "&": "%26",
  '"': "%22",
  "'": "%27",
  "<": "%3C",
  ">": "%3E"
};
function encodeForHtmlAttr(value) {
  return value.replace(HTML_ATTR_UNSAFE_RE, (c) => HTML_ATTR_ENCODE_MAP[c]);
}
const navigateTo = (to, options) => {
  to ||= "/";
  const toPath = typeof to === "string" ? to : "path" in to ? resolveRouteObject(to) : useRouter().resolve(to).href;
  const isExternalHost = hasProtocol(toPath, { acceptRelative: true });
  const isExternal = options?.external || isExternalHost;
  if (isExternal) {
    if (!options?.external) {
      throw new Error("Navigating to an external URL is not allowed by default. Use `navigateTo(url, { external: true })`.");
    }
    const { protocol } = new URL(toPath, "http://localhost");
    if (protocol && isScriptProtocol(protocol)) {
      throw new Error(`Cannot navigate to a URL with '${protocol}' protocol.`);
    }
  }
  const inMiddleware = isProcessingMiddleware();
  const router = useRouter();
  const nuxtApp = useNuxtApp();
  {
    if (nuxtApp.ssrContext) {
      const fullPath = typeof to === "string" || isExternal ? toPath : router.resolve(to).fullPath || "/";
      const location2 = isExternal ? toPath : joinURL((/* @__PURE__ */ useRuntimeConfig()).app.baseURL, fullPath);
      const redirect = async function(response) {
        await nuxtApp.callHook("app:redirected");
        const encodedHeader = encodeURL$1(location2, isExternalHost);
        const encodedLoc = encodeForHtmlAttr(encodedHeader);
        nuxtApp.ssrContext["~renderResponse"] = {
          statusCode: sanitizeStatusCode(options?.redirectCode || 302, 302),
          body: `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`,
          headers: { location: encodedHeader }
        };
        return response;
      };
      if (!isExternal && inMiddleware) {
        router.afterEach((final) => final.fullPath === fullPath ? redirect(false) : void 0);
        return to;
      }
      return redirect(!inMiddleware ? void 0 : (
        /* abort route navigation */
        false
      ));
    }
  }
  if (isExternal) {
    nuxtApp._scope.stop();
    if (options?.replace) {
      (void 0).replace(toPath);
    } else {
      (void 0).href = toPath;
    }
    if (inMiddleware) {
      if (!nuxtApp.isHydrating) {
        return false;
      }
      return new Promise(() => {
      });
    }
    return Promise.resolve();
  }
  const encodedTo = typeof to === "string" ? encodeRoutePath(to) : to;
  return options?.replace ? router.replace(encodedTo) : router.push(encodedTo);
};
function resolveRouteObject(to) {
  return withQuery(to.path || "", to.query || {}) + (to.hash || "");
}
function encodeURL$1(location2, isExternalHost = false) {
  const url = new URL(location2, "http://localhost");
  if (!isExternalHost) {
    const pathname = url.pathname.replace(/^\/{2,}/, "/");
    return pathname + url.search + url.hash;
  }
  if (location2.startsWith("//")) {
    return url.toString().replace(url.protocol, "");
  }
  return url.toString();
}
function encodeRoutePath(url) {
  const parsed = parseURL(url);
  return encodePath(decodePath(parsed.pathname)) + parsed.search + parsed.hash;
}
const NUXT_ERROR_SIGNATURE = "__nuxt_error";
const useError = /* @__NO_SIDE_EFFECTS__ */ () => toRef(useNuxtApp().payload, "error");
const showError = (error) => {
  const nuxtError = createError(error);
  try {
    const error2 = /* @__PURE__ */ useError();
    if (false) ;
    error2.value ||= nuxtError;
  } catch {
    throw nuxtError;
  }
  return nuxtError;
};
const isNuxtError = (error) => !!error && typeof error === "object" && NUXT_ERROR_SIGNATURE in error;
const createError = (error) => {
  if (typeof error !== "string" && error.statusText) {
    error.message ??= error.statusText;
  }
  const nuxtError = createError$1(error);
  Object.defineProperty(nuxtError, NUXT_ERROR_SIGNATURE, {
    value: true,
    configurable: false,
    writable: false
  });
  Object.defineProperty(nuxtError, "status", {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    get: () => nuxtError.statusCode,
    configurable: true
  });
  Object.defineProperty(nuxtError, "statusText", {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    get: () => nuxtError.statusMessage,
    configurable: true
  });
  return nuxtError;
};
const _wrapInTransition = (props, children) => {
  return { default: () => children.default?.() };
};
const ROUTE_KEY_PARENTHESES_RE$1 = /(:\w+)\([^)]+\)/g;
const ROUTE_KEY_SYMBOLS_RE$1 = /(:\w+)[?+*]/g;
const ROUTE_KEY_NORMAL_RE$1 = /:\w+/g;
function generateRouteKey$1(route) {
  const source = route?.meta.key ?? route.path.replace(ROUTE_KEY_PARENTHESES_RE$1, "$1").replace(ROUTE_KEY_SYMBOLS_RE$1, "$1").replace(ROUTE_KEY_NORMAL_RE$1, (r) => route.params[r.slice(1)]?.toString() || "");
  return typeof source === "function" ? source(route) : source;
}
function isChangingPage(to, from) {
  if (to === from || from === START_LOCATION) {
    return false;
  }
  if (generateRouteKey$1(to) !== generateRouteKey$1(from)) {
    return true;
  }
  const areComponentsSame = to.matched.every(
    (comp, index) => comp.components && comp.components.default === from.matched[index]?.components?.default
  );
  if (areComponentsSame) {
    return false;
  }
  return true;
}
const VALID_TAG_RE = /^[a-z][a-z0-9-]*$/i;
function sanitizeTag(tag, fallback) {
  return tag && VALID_TAG_RE.test(tag) ? tag : fallback;
}
function toArray$1(value) {
  return Array.isArray(value) ? value : [value];
}
function _mergeTransitionProps(routeProps) {
  const _props = [];
  for (const prop of routeProps) {
    if (!prop) {
      continue;
    }
    _props.push({
      ...prop,
      onAfterLeave: prop.onAfterLeave ? toArray$1(prop.onAfterLeave) : void 0,
      onBeforeLeave: prop.onBeforeLeave ? toArray$1(prop.onBeforeLeave) : void 0
    });
  }
  return defu(..._props);
}
const routerOptions0 = {
  scrollBehavior(to, from, savedPosition) {
    const nuxtApp = useNuxtApp();
    const router = useRouter();
    const hashScrollBehaviour = router.options?.scrollBehaviorType ?? "auto";
    if (to.path.replace(/\/$/, "") === from.path.replace(/\/$/, "")) {
      if (from.hash && !to.hash) {
        return { left: 0, top: 0 };
      }
      if (to.hash) {
        return { el: to.hash, top: _getHashElementScrollMarginTop(to.hash), behavior: hashScrollBehaviour };
      }
      return false;
    }
    const routeAllowsScrollToTop = typeof to.meta.scrollToTop === "function" ? to.meta.scrollToTop(to, from) : to.meta.scrollToTop;
    if (routeAllowsScrollToTop === false) {
      return false;
    }
    if (from === START_LOCATION) {
      return _calculatePosition(to, from, savedPosition, hashScrollBehaviour);
    }
    return new Promise((resolve) => {
      const doScroll = () => {
        requestAnimationFrame(() => {
          if (router.currentRoute.value.fullPath !== to.fullPath) {
            resolve(false);
            return;
          }
          resolve(_calculatePosition(to, from, savedPosition, hashScrollBehaviour));
        });
      };
      nuxtApp.hooks.hookOnce("page:loading:end", () => {
        const transitionPromise = nuxtApp["~transitionPromise"];
        if (transitionPromise) {
          transitionPromise.then(doScroll);
        } else {
          doScroll();
        }
      });
    });
  }
};
function _getHashElementScrollMarginTop(selector) {
  try {
    const elem = (void 0).querySelector(selector);
    if (elem) {
      return (Number.parseFloat(getComputedStyle(elem).scrollMarginTop) || 0) + (Number.parseFloat(getComputedStyle((void 0).documentElement).scrollPaddingTop) || 0);
    }
  } catch {
  }
  return 0;
}
function _calculatePosition(to, from, savedPosition, defaultHashScrollBehaviour) {
  if (savedPosition) {
    return savedPosition;
  }
  if (to.hash) {
    return {
      el: to.hash,
      top: _getHashElementScrollMarginTop(to.hash),
      behavior: isChangingPage(to, from) ? defaultHashScrollBehaviour : "instant"
    };
  }
  return {
    left: 0,
    top: 0
  };
}
const configRouterOptions = {
  hashMode: false,
  scrollBehaviorType: "auto"
};
const routerOptions = {
  ...configRouterOptions,
  ...routerOptions0
};
const sensitiveMatcher = (m, p) => {
  return [];
};
const foldedMatcher = sensitiveMatcher;
const decodeRoutePath = function decodeRoutePath2(path) {
  if (!path.includes("%")) return path;
  const queryIndex = path.indexOf("?");
  const pathname = queryIndex === -1 ? path : path.slice(0, queryIndex);
  try {
    return queryIndex === -1 ? decodeURI(pathname) : decodeURI(pathname) + path.slice(queryIndex);
  } catch {
    return path;
  }
};
const normalizePath = (path, fold) => {
  if (typeof path !== "string") {
    return path;
  }
  const decoded = decodeRoutePath(path);
  return fold ? decoded.toLowerCase() : decoded;
};
const _routeRulesMatcher = (path) => routerOptions.sensitive ? defu({}, ...sensitiveMatcher("", normalizePath(path, false)).map((r) => r.data).reverse()) : defu({}, ...foldedMatcher("", normalizePath(path, true)).map((r) => r.data).reverse());
const routeRulesMatcher$1 = _routeRulesMatcher;
function getRouteRules(arg) {
  const path = typeof arg === "string" ? arg : arg.path;
  try {
    return routeRulesMatcher$1(path);
  } catch (e) {
    console.error("[nuxt] Error matching route rules.", e);
    return {};
  }
}
function definePayloadReducer(name, reduce) {
  {
    useNuxtApp().ssrContext["~payloadReducers"][name] = reduce;
  }
}
const payloadPlugin = definePayloadPlugin(() => {
  definePayloadReducer(
    "skipHydrate",
    // We need to return something truthy to be treated as a match
    (data) => !shouldHydrate(data) && 1
  );
});
function freezeHead(head) {
  const realPush = head.push;
  head.push = () => ({ dispose: () => {
  }, patch: () => {
  }, _poll: () => {
  } });
  return () => {
    head.push = realPush;
  };
}
const unhead_k2P3m_ZDyjlr2mMYnoDPwavjsDN8hBlk9cFai0bbopU = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:head",
  enforce: "pre",
  setup(nuxtApp) {
    const head = nuxtApp.ssrContext.head;
    if (nuxtApp.ssrContext.islandContext) {
      const unfreeze = freezeHead(head);
      nuxtApp.hooks.hookOnce("app:created", unfreeze);
    }
    nuxtApp.vueApp.use(head);
  }
});
const ROUTE_KEY_PARENTHESES_RE = /(:\w+)\([^)]+\)/g;
const ROUTE_KEY_SYMBOLS_RE = /(:\w+)[?+*]/g;
const ROUTE_KEY_NORMAL_RE = /:\w+/g;
const interpolatePath = (route, match) => {
  return match.path.replace(ROUTE_KEY_PARENTHESES_RE, "$1").replace(ROUTE_KEY_SYMBOLS_RE, "$1").replace(ROUTE_KEY_NORMAL_RE, (r) => route.params[r.slice(1)]?.toString() || "");
};
const generateRouteKey = (routeProps, override) => {
  const matchedRoute = routeProps.route.matched.find((m) => m.components?.default === routeProps.Component.type);
  const source = matchedRoute?.meta.key ?? (matchedRoute && interpolatePath(routeProps.route, matchedRoute));
  return typeof source === "function" ? source(routeProps.route) : source;
};
function toArray(value) {
  return Array.isArray(value) ? value : [value];
}
const __nuxt_page_meta$5 = { layout: "auth" };
const __nuxt_page_meta$4 = { layout: "auth" };
const __nuxt_page_meta$3 = {
  layout: "dashboard"
};
const __nuxt_page_meta$2 = {
  layout: "dashboard"
};
const __nuxt_page_meta$1 = {
  layout: "dashboard"
};
const __nuxt_page_meta = {
  layout: "dashboard"
};
const _routes = [
  {
    name: "index",
    path: "/",
    component: () => import('./index-BYZqzXz-.mjs')
  },
  {
    name: "login",
    path: "/login",
    meta: __nuxt_page_meta$5 || {},
    component: () => import('./login-BCDZBLW1.mjs')
  },
  {
    name: "encuesta",
    path: "/encuesta",
    component: () => import('./encuesta-_stiHIUD.mjs')
  },
  {
    name: "registro",
    path: "/registro",
    meta: __nuxt_page_meta$4 || {},
    component: () => import('./registro-DryctPbR.mjs')
  },
  {
    name: "dashboard",
    path: "/dashboard",
    meta: __nuxt_page_meta$3 || {},
    component: () => import('./index-CBmo2ylM.mjs')
  },
  {
    name: "dashboard-datasets",
    path: "/dashboard/datasets",
    meta: __nuxt_page_meta$2 || {},
    component: () => import('./datasets-vOl7ID3Z.mjs')
  },
  {
    name: "dashboard-historial",
    path: "/dashboard/historial",
    meta: __nuxt_page_meta$1 || {},
    component: () => import('./historial-3hju7jyX.mjs')
  },
  {
    name: "dashboard-validacion",
    path: "/dashboard/validacion",
    meta: __nuxt_page_meta || {},
    component: () => import('./validacion-Cye2076Q.mjs')
  }
];
const validate = /* @__PURE__ */ defineNuxtRouteMiddleware(async (to) => {
  let __temp, __restore;
  if (!to.meta?.validate) {
    return;
  }
  const result = ([__temp, __restore] = executeAsync$1(() => Promise.resolve(to.meta.validate(to))), __temp = await __temp, __restore(), __temp);
  if (result === true) {
    return;
  }
  const error = createError({
    fatal: false,
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    status: result && (result.status || result.statusCode) || 404,
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    statusText: result && (result.statusText || result.statusMessage) || `Page Not Found: ${to.fullPath}`,
    data: {
      path: to.fullPath
    }
  });
  return error;
});
const manifest_45route_45rule = /* @__PURE__ */ defineNuxtRouteMiddleware((to) => {
  {
    return;
  }
});
const globalMiddleware = [
  validate,
  manifest_45route_45rule
];
const namedMiddleware = {
  auth: () => import('./auth-FW5zJkx2.mjs'),
  "sidebase-auth": () => Promise.resolve().then(() => sidebaseAuth)
};
Object.assign(/* @__PURE__ */ Object.create(null), {});
const pageIslandRoutes = Object.assign(/* @__PURE__ */ Object.create(null), {});
const plugin$1 = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:router",
  enforce: "pre",
  async setup(nuxtApp) {
    let __temp, __restore;
    let routerBase = (/* @__PURE__ */ useRuntimeConfig()).app.baseURL;
    const history = routerOptions.history?.(routerBase) ?? createMemoryHistory(routerBase);
    const routes = routerOptions.routes ? ([__temp, __restore] = executeAsync$1(() => routerOptions.routes(_routes)), __temp = await __temp, __restore(), __temp) ?? _routes : _routes;
    let startPosition;
    const router = createRouter({
      ...routerOptions,
      scrollBehavior: (to, from, savedPosition) => {
        if (from === START_LOCATION) {
          startPosition = savedPosition;
          return;
        }
        if (routerOptions.scrollBehavior) {
          router.options.scrollBehavior = routerOptions.scrollBehavior;
          if ("scrollRestoration" in (void 0).history) {
            const unsub = router.beforeEach(() => {
              unsub();
              (void 0).history.scrollRestoration = "manual";
            });
          }
          return routerOptions.scrollBehavior(to, START_LOCATION, startPosition || savedPosition);
        }
      },
      history,
      routes
    });
    nuxtApp.vueApp.use(router);
    const previousRoute = shallowRef(router.currentRoute.value);
    router.afterEach((_to, from) => {
      previousRoute.value = from;
    });
    Object.defineProperty(nuxtApp.vueApp.config.globalProperties, "previousRoute", {
      get: () => previousRoute.value
    });
    const initialURL = nuxtApp.ssrContext.url;
    const _route = shallowRef(router.currentRoute.value);
    const syncCurrentRoute = () => {
      _route.value = router.currentRoute.value;
    };
    router.afterEach((to, from) => {
      const lastTo = to.matched.at(-1)?.components?.default;
      const lastFrom = from.matched.at(-1)?.components?.default;
      if (lastTo === lastFrom) {
        const toKey = generateRouteKey({ route: to, Component: { type: lastTo } });
        const fromKey = generateRouteKey({ route: from, Component: { type: lastFrom } });
        if (toKey === fromKey) {
          syncCurrentRoute();
        }
        return;
      }
      if (to.matched.length < from.matched.length && to.matched.every((m, i) => m.components?.default === from.matched[i]?.components?.default)) {
        syncCurrentRoute();
      }
    });
    const route = { sync: syncCurrentRoute };
    for (const key in _route.value) {
      Object.defineProperty(route, key, {
        get: () => _route.value[key],
        enumerable: true
      });
    }
    nuxtApp._route = shallowReactive(route);
    nuxtApp._middleware ||= {
      global: [],
      named: {}
    };
    const error = /* @__PURE__ */ useError();
    const isServerPage = nuxtApp.ssrContext?.islandContext?.name?.startsWith("page_");
    if (!nuxtApp.ssrContext?.islandContext || isServerPage) {
      router.afterEach(async (to, _from, failure) => {
        delete nuxtApp._processingMiddleware;
        {
          delete nuxtApp._middlewareTo;
        }
        if (failure) {
          await nuxtApp.callHook("page:loading:end");
        }
        if (failure?.type === 4) {
          return;
        }
        if (to.redirectedFrom && to.fullPath !== initialURL) {
          await nuxtApp.runWithContext(() => navigateTo(to.fullPath || "/"));
        }
      });
    }
    try {
      if (true) {
        ;
        [__temp, __restore] = executeAsync$1(() => router.push(initialURL)), await __temp, __restore();
        ;
      }
      ;
      [__temp, __restore] = executeAsync$1(() => router.isReady()), await __temp, __restore();
      ;
    } catch (error2) {
      [__temp, __restore] = executeAsync$1(() => nuxtApp.runWithContext(() => showError(error2))), await __temp, __restore();
    }
    const resolvedInitialRoute = router.currentRoute.value;
    const hasDeferredRoute = false;
    syncCurrentRoute();
    if (nuxtApp.ssrContext?.islandContext && !isServerPage) {
      return { provide: { router } };
    }
    function pushErroredRoute(to) {
    }
    const initialLayout = nuxtApp.payload.state._layout;
    router.beforeEach(async (to, from) => {
      await nuxtApp.callHook("page:loading:start");
      to.meta = reactive(to.meta);
      if (nuxtApp.isHydrating && initialLayout && !isReadonly(to.meta.layout)) {
        to.meta.layout = initialLayout;
      }
      nuxtApp._processingMiddleware = true;
      {
        nuxtApp._middlewareTo = to;
      }
      if (!nuxtApp.ssrContext?.islandContext || isServerPage) {
        const middlewareEntries = /* @__PURE__ */ new Set([...globalMiddleware, ...nuxtApp._middleware.global]);
        for (const component of to.matched) {
          const componentMiddleware = component.meta.middleware;
          if (!componentMiddleware) {
            continue;
          }
          for (const entry2 of toArray(componentMiddleware)) {
            middlewareEntries.add(entry2);
          }
        }
        const routeRules = getRouteRules({ path: to.path });
        if (routeRules.appMiddleware) {
          for (const key in routeRules.appMiddleware) {
            if (routeRules.appMiddleware[key]) {
              middlewareEntries.add(key);
            } else {
              middlewareEntries.delete(key);
            }
          }
        }
        for (const entry2 of middlewareEntries) {
          const middleware = typeof entry2 === "string" ? nuxtApp._middleware.named[entry2] || await namedMiddleware[entry2]?.().then((r) => r.default || r) : entry2;
          if (!middleware) {
            throw new Error(`Unknown route middleware: '${entry2}'.`);
          }
          try {
            if (false) ;
            const result = await nuxtApp.runWithContext(() => middleware(to, from));
            if (true) {
              if (result === false || result instanceof Error) {
                const error2 = result || createError({
                  status: 404,
                  statusText: `Page Not Found: ${initialURL}`
                });
                await nuxtApp.runWithContext(() => showError(error2));
                return false;
              }
            }
            if (result === true) {
              continue;
            }
            if (result === false) {
              return result;
            }
            if (result) {
              if (isNuxtError(result) && result.fatal) {
                await nuxtApp.runWithContext(() => showError(result));
                pushErroredRoute(to);
              }
              return result;
            }
          } catch (err) {
            const error2 = createError(err);
            if (error2.fatal) {
              await nuxtApp.runWithContext(() => showError(error2));
            }
            return error2;
          }
        }
      }
    });
    if (isServerPage) {
      router.beforeResolve((to) => {
        const expected = pageIslandRoutes[nuxtApp.ssrContext.islandContext.name];
        const actual = to.matched.find((m) => m.components?.default?.__nuxt_island)?.components?.default;
        if (!expected || expected !== actual?.__nuxt_island) {
          nuxtApp.ssrContext["~renderResponse"] = {
            statusCode: 400,
            statusMessage: "Invalid island request path"
          };
          return false;
        }
      });
    }
    router.onError(async () => {
      delete nuxtApp._processingMiddleware;
      {
        delete nuxtApp._middlewareTo;
      }
      await nuxtApp.callHook("page:loading:end");
    });
    router.afterEach((to) => {
      if (to.matched.length === 0 && !error.value) {
        return nuxtApp.runWithContext(() => showError(createError({
          status: 404,
          fatal: false,
          statusText: `Page not found: ${to.fullPath}`,
          data: {
            path: to.fullPath
          }
        })));
      }
    });
    nuxtApp.hooks.hookOnce("app:created", async () => {
      try {
        if ("name" in resolvedInitialRoute) {
          resolvedInitialRoute.name = void 0;
        }
        const pluginNavigatedAway = false;
        if (pluginNavigatedAway) ;
        else if (hasDeferredRoute) ;
        else {
          await router.replace({
            ...resolvedInitialRoute,
            force: true
          });
        }
        router.options.scrollBehavior = routerOptions.scrollBehavior;
      } catch (error2) {
        await nuxtApp.runWithContext(() => showError(error2));
      }
    });
    return { provide: { router } };
  }
});
const reducers = [
  ["NuxtError", (data) => isNuxtError(data) && data.toJSON()],
  ["EmptyShallowRef", (data) => isRef(data) && isShallow(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
  ["EmptyRef", (data) => isRef(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
  ["ShallowRef", (data) => isRef(data) && isShallow(data) && data.value],
  ["ShallowReactive", (data) => isReactive(data) && isShallow(data) && toRaw(data)],
  ["Ref", (data) => isRef(data) && data.value],
  ["Reactive", (data) => isReactive(data) && toRaw(data)]
];
const revive_payload_server_MVtmlZaQpj6ApFmshWfUWl5PehCebzaBf2NuRMiIbms = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:revive-payload:server",
  setup() {
    for (const [reducer, fn] of reducers) {
      definePayloadReducer(reducer, fn);
    }
  }
});
defineComponent({
  name: "ServerPlaceholder",
  render() {
    return createElementBlock("div");
  }
});
const clientOnlySymbol = /* @__PURE__ */ Symbol.for("nuxt:client-only");
defineComponent({
  name: "ClientOnly",
  inheritAttrs: false,
  props: ["fallback", "placeholder", "placeholderTag", "fallbackTag"],
  ...false,
  setup(props, { slots, attrs }) {
    const mounted = shallowRef(false);
    const vm = getCurrentInstance();
    if (vm) {
      vm._nuxtClientOnly = true;
    }
    provide(clientOnlySymbol, true);
    return () => {
      if (mounted.value) {
        const vnodes = slots.default?.();
        if (vnodes && vnodes.length === 1) {
          return [cloneVNode(vnodes[0], attrs)];
        }
        return vnodes;
      }
      const slot = slots.fallback || slots.placeholder;
      if (slot) {
        return h(slot);
      }
      const fallbackStr = props.fallback || props.placeholder || "";
      const fallbackTag = sanitizeTag(props.fallbackTag || props.placeholderTag, "span");
      return createElementBlock(fallbackTag, attrs, fallbackStr);
    };
  }
});
const useStateKeyPrefix = "$s";
function useState(...args) {
  const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
  if (typeof args[0] !== "string") {
    args.unshift(autoKey);
  }
  const [_key, init] = args;
  if (!_key || typeof _key !== "string") {
    throw new TypeError("[nuxt] [useState] key must be a string: " + _key);
  }
  if (init !== void 0 && typeof init !== "function") {
    throw new Error("[nuxt] [useState] init must be a function: " + init);
  }
  const key = useStateKeyPrefix + _key;
  const nuxtApp = useNuxtApp();
  const state = toRef(nuxtApp.payload.state, key);
  if (state.value === void 0 && init) {
    const initialValue = init();
    if (isRef(initialValue)) {
      nuxtApp.payload.state[key] = initialValue;
      return initialValue;
    }
    state.value = initialValue;
  }
  return state;
}
function useRequestEvent(nuxtApp) {
  nuxtApp ||= useNuxtApp();
  return nuxtApp.ssrContext?.event;
}
function useRequestHeaders(include) {
  const event = useRequestEvent();
  const _headers = event ? getRequestHeaders$1(event) : {};
  if (!include || !event) {
    return _headers;
  }
  const headers = /* @__PURE__ */ Object.create(null);
  for (const _key of include) {
    const key = _key.toLowerCase();
    const header = _headers[key];
    if (header) {
      headers[key] = header;
    }
  }
  return headers;
}
const plugin = /* @__PURE__ */ defineNuxtPlugin({
  name: "pinia",
  setup(nuxtApp) {
    const pinia = createPinia();
    nuxtApp.vueApp.use(pinia);
    setActivePinia(pinia);
    if (nuxtApp.payload && nuxtApp.payload.pinia) {
      pinia.state.value = nuxtApp.payload.pinia;
    }
    return {
      provide: {
        pinia
      }
    };
  },
  hooks: {
    "app:rendered"() {
      const nuxtApp = useNuxtApp();
      nuxtApp.payload.pinia = toRaw(nuxtApp.$pinia).state.value;
      setActivePinia(void 0);
    }
  }
});
const components_plugin_z4hgvsiddfKkfXTP6M8M4zG5Cb7sGnDhcryKVM45Di4 = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:global-components"
});
function resolveApiUrlPath(endpointPath, runtimeConfig) {
  if (isExternalUrl(endpointPath)) {
    return endpointPath;
  }
  const baseURL2 = resolveApiBaseURL(runtimeConfig);
  return joinURL(baseURL2, endpointPath);
}
function resolveApiBaseURL(runtimeConfig, returnOnlyPathname) {
  const authRuntimeConfig = runtimeConfig.public.auth;
  if (returnOnlyPathname === void 0) {
    returnOnlyPathname = !runtimeConfig.public.auth.disableInternalRouting;
  }
  let baseURL2 = authRuntimeConfig.baseURL;
  if (authRuntimeConfig.originEnvKey) {
    const envBaseURL = process.env[authRuntimeConfig.originEnvKey];
    if (envBaseURL) {
      baseURL2 = envBaseURL;
    }
  }
  if (returnOnlyPathname) {
    baseURL2 = withLeadingSlash(parseURL(baseURL2).pathname);
  }
  return baseURL2;
}
function isExternalUrl(url) {
  return url.startsWith("http://") || url.startsWith("https://");
}
function useTypedBackendConfig(runtimeConfig, type) {
  const provider = runtimeConfig.public.auth.provider;
  if (provider.type === type) {
    return provider;
  }
  throw new Error("RuntimeError: Type must match at this point");
}
const ERROR_PREFIX = "[@sidebase/nuxt-auth]";
function getRequestURL(includePath = true) {
  return getURL(useRequestEvent()?.node.req, includePath);
}
function getRequestURLWN(nuxt) {
  return callWithNuxt(nuxt, getRequestURL);
}
async function determineCallbackUrl(authConfig, userCallbackUrl, inferFromRequest) {
  if (userCallbackUrl) {
    return await normalizeCallbackUrl(userCallbackUrl);
  }
  const authConfigCallbackUrl = typeof authConfig.globalAppMiddleware === "object" ? authConfig.globalAppMiddleware.addDefaultCallbackUrl : void 0;
  if (typeof authConfigCallbackUrl === "string") {
    return await normalizeCallbackUrl(authConfigCallbackUrl);
  }
  const shouldInferFromRequest = inferFromRequest !== false && (inferFromRequest === true || authConfigCallbackUrl === true || authConfigCallbackUrl === void 0 && authConfig.globalAppMiddleware === true);
  if (shouldInferFromRequest) {
    const nuxt = useNuxtApp();
    return getRequestURLWN(nuxt);
  }
}
function determineCallbackUrlForRouteMiddleware(authConfig, middlewareTo) {
  const authConfigCallbackUrl = typeof authConfig.globalAppMiddleware === "object" ? authConfig.globalAppMiddleware.addDefaultCallbackUrl : void 0;
  if (typeof authConfigCallbackUrl === "string") {
    return authConfigCallbackUrl;
  }
  if (authConfigCallbackUrl === true || authConfigCallbackUrl === void 0 && authConfig.globalAppMiddleware === true) {
    return middlewareTo.fullPath;
  }
}
async function normalizeCallbackUrl(rawCallbackUrl) {
  if (isExternalUrl(rawCallbackUrl)) {
    return rawCallbackUrl;
  }
  const nuxt = useNuxtApp();
  const router = await callWithNuxt(nuxt, useRouter);
  const resolvedUserRoute = router.options.history.createHref(rawCallbackUrl);
  return resolvedUserRoute;
}
async function _fetch(nuxt, path, fetchOptions = {}, proxyCookies = false) {
  const runtimeConfigOrPromise = callWithNuxt(nuxt, useRuntimeConfig);
  const runtimeConfig = "public" in runtimeConfigOrPromise ? runtimeConfigOrPromise : await runtimeConfigOrPromise;
  const joinedPath = resolveApiUrlPath(path, runtimeConfig);
  if (runtimeConfig.public.auth.disableInternalRouting === false) {
    const currentPath = nuxt.ssrContext?.event?.path;
    if (currentPath?.startsWith(joinedPath)) {
      console.error(`${ERROR_PREFIX} Recursion detected at ${joinedPath}. Have you set the correct \`auth.baseURL\`?`);
      throw new FetchConfigurationError("Server configuration error");
    }
  }
  if (!fetchOptions.credentials) {
    fetchOptions.credentials = "include";
  }
  let event;
  if (proxyCookies) {
    const fetchOptionsHeaders = new Headers(fetchOptions.headers ?? {});
    event = await callWithNuxt(nuxt, useRequestEvent);
    if (event && fetchOptionsHeaders.get("cookie") === null) {
      const cookies = event.node.req.headers.cookie;
      if (cookies) {
        fetchOptionsHeaders.set("cookie", cookies);
        fetchOptions.headers = fetchOptionsHeaders;
      }
    }
  }
  try {
    return $fetch.raw(joinedPath, fetchOptions).then((res) => {
      if (proxyCookies && event) {
        const cookies = res.headers.getSetCookie();
        event.node.res.appendHeader("set-cookie", cookies);
      }
      return res._data;
    });
  } catch (error) {
    let errorMessage = `${ERROR_PREFIX} Error while requesting ${joinedPath}.`;
    if (runtimeConfig.public.auth.provider.type === "authjs") {
      errorMessage += " Have you added the authentication handler server-endpoint `[...].ts`? Have you added the authentication handler in a non-default location (default is `~/server/api/auth/[...].ts`) and not updated the module-setting `auth.basePath`?";
    }
    errorMessage += " Error is:";
    console.error(errorMessage);
    console.error(error);
    throw new FetchConfigurationError(
      "Runtime error, check the console logs to debug, open an issue at https://github.com/sidebase/nuxt-auth/issues/new/choose if you continue to have this problem"
    );
  }
}
class FetchConfigurationError extends Error {
}
const isNonEmptyObject = (obj) => typeof obj === "object" && obj !== null && Object.keys(obj).length > 0;
function navigateToAuthPageWN(nuxt, href, isInternalRouting) {
  return callWithNuxt(nuxt, navigateToAuthPage, [nuxt, href, isInternalRouting]);
}
const URL_QUOTE_RE = /"/g;
function navigateToAuthPage(nuxtApp, href, isInternalRouting = false) {
  const router = useRouter();
  const inMiddleware = Boolean(nuxtApp._processingMiddleware);
  {
    if (nuxtApp.ssrContext) {
      const isExternalHost = hasProtocol(href, { acceptRelative: true });
      if (isExternalHost) {
        const { protocol } = new URL(href, "http://localhost");
        if (protocol && isScriptProtocol(protocol)) {
          throw new Error(`Cannot navigate to a URL with '${protocol}' protocol.`);
        }
      }
      const location = isExternalHost || isInternalRouting ? href : router.resolve(href).fullPath || "/";
      async function redirect(response) {
        await nuxtApp.callHook("app:redirected");
        const encodedLoc = location.replace(URL_QUOTE_RE, "%22");
        const encodedHeader = encodeURL(location, isExternalHost);
        nuxtApp.ssrContext._renderResponse = {
          statusCode: 302,
          body: `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`,
          headers: { location: encodedHeader }
        };
        return response;
      }
      if (!isExternalHost && inMiddleware) {
        return redirect(void 0);
      }
      return redirect(!inMiddleware ? void 0 : (
        /* abort further route navigation */
        false
      ));
    }
  }
  (void 0).location.href = href;
  if (href.includes("#")) {
    (void 0).location.reload();
  }
  const waitForNavigationWithFallbackToRouter = new Promise((resolve) => setTimeout(resolve, 60 * 1e3)).then(() => router.push(href));
  return waitForNavigationWithFallbackToRouter;
}
function encodeURL(location, isExternalHost = false) {
  const url = new URL(location, "http://localhost");
  if (!isExternalHost) {
    return url.pathname + url.search + url.hash;
  }
  if (location.startsWith("//")) {
    return url.toString().replace(url.protocol, "");
  }
  return url.toString();
}
function makeCommonAuthState() {
  const data = useState("auth:data", () => void 0);
  const hasInitialSession = computed(() => !!data.value);
  const lastRefreshedAt = useState("auth:lastRefreshedAt", () => {
    if (hasInitialSession.value) {
      return /* @__PURE__ */ new Date();
    }
    return void 0;
  });
  const loading = useState("auth:loading", () => false);
  const status = computed(() => {
    if (loading.value) {
      return "loading";
    }
    if (data.value) {
      return "authenticated";
    }
    return "unauthenticated";
  });
  return {
    data,
    loading,
    lastRefreshedAt,
    status
  };
}
const useAuthState = () => makeCommonAuthState();
function useAuth() {
  const nuxt = useNuxtApp();
  const runtimeConfig = /* @__PURE__ */ useRuntimeConfig();
  const backendConfig = useTypedBackendConfig(runtimeConfig, "authjs");
  const {
    data,
    loading,
    status,
    lastRefreshedAt
  } = useAuthState();
  async function signIn(provider, options, authorizationParams) {
    const configuredProviders = await getProviders();
    if (!configuredProviders) {
      const errorUrl = resolveApiUrlPath("error", runtimeConfig);
      const navigationResult = await navigateToAuthPageWN(nuxt, errorUrl, true);
      return {
        // Future AuthJS compat here and in other places
        // https://authjs.dev/reference/core/errors#invalidprovider
        error: "InvalidProvider",
        ok: false,
        status: 500,
        url: errorUrl,
        navigationResult
      };
    }
    if (typeof provider === "undefined") {
      provider = backendConfig.defaultProvider;
    }
    const { redirect = true } = options ?? {};
    const callbackUrl = await callWithNuxt(nuxt, () => determineCallbackUrl(runtimeConfig.public.auth, options?.callbackUrl));
    const signinUrl = resolveApiUrlPath("signin", runtimeConfig);
    const queryParams = callbackUrl ? `?${new URLSearchParams({ callbackUrl })}` : "";
    const hrefSignInAllProviderPage = `${signinUrl}${queryParams}`;
    const selectedProvider = provider && configuredProviders[provider];
    if (!selectedProvider) {
      const navigationResult = await navigateToAuthPageWN(nuxt, hrefSignInAllProviderPage, true);
      return {
        // https://authjs.dev/reference/core/errors#invalidprovider
        error: "InvalidProvider",
        ok: false,
        status: 400,
        url: hrefSignInAllProviderPage,
        navigationResult
      };
    }
    const isCredentials = selectedProvider.type === "credentials";
    const isEmail = selectedProvider.type === "email";
    const isSupportingReturn = isCredentials || isEmail;
    const action = isCredentials ? "callback" : "signin";
    const csrfToken = await getCsrfToken();
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      ...await getRequestHeaders(nuxt)
    };
    const body = new URLSearchParams({
      ...options,
      csrfToken,
      callbackUrl,
      json: true
    });
    const fetchSignIn = () => _fetch(
      nuxt,
      `/${action}/${provider}`,
      {
        method: "post",
        params: authorizationParams,
        headers,
        body
      },
      /* proxyCookies = */
      true
    ).catch((error2) => error2.data);
    const signInData = await callWithNuxt(nuxt, fetchSignIn);
    if (redirect || !isSupportingReturn) {
      const href = signInData.url ?? callbackUrl;
      const navigationResult = await navigateToAuthPageWN(nuxt, href);
      const error2 = new URL(href, "http://_").searchParams.get("error");
      return {
        error: error2,
        ok: true,
        status: 302,
        url: href,
        navigationResult
      };
    }
    const error = new URL(signInData.url).searchParams.get("error");
    await getSession();
    return {
      error,
      status: 200,
      ok: true,
      url: error ? null : signInData.url,
      navigationResult: void 0
    };
  }
  async function getProviders() {
    const headers = await getRequestHeaders(nuxt, false);
    return _fetch(
      nuxt,
      "/providers",
      { headers }
    );
  }
  async function getSession(getSessionOptions) {
    return callWithNuxt(nuxt, async () => {
      const callbackUrlFallback = getRequestURL();
      const { required, callbackUrl, onUnauthenticated } = defu(getSessionOptions || {}, {
        required: false,
        callbackUrl: void 0,
        onUnauthenticated: () => signIn(void 0, {
          callbackUrl: getSessionOptions?.callbackUrl || callbackUrlFallback
        })
      });
      function onError() {
        loading.value = false;
      }
      const headers = await getRequestHeaders(nuxt);
      return _fetch(
        nuxt,
        "/session",
        {
          onResponse: ({ response }) => {
            const sessionData = response._data;
            {
              const setCookieValues = response.headers.getSetCookie ? response.headers.getSetCookie() : [response.headers.get("set-cookie")];
              if (setCookieValues && nuxt.ssrContext) {
                for (const value of setCookieValues) {
                  if (!value) {
                    continue;
                  }
                  appendHeader(nuxt.ssrContext.event, "set-cookie", value);
                }
              }
            }
            data.value = isNonEmptyObject(sessionData) ? sessionData : null;
            loading.value = false;
            if (required && status.value === "unauthenticated") {
              return onUnauthenticated();
            }
            return sessionData;
          },
          onRequest: ({ options }) => {
            lastRefreshedAt.value = /* @__PURE__ */ new Date();
            options.params = {
              ...options.params,
              callbackUrl: callbackUrl || callbackUrlFallback
            };
          },
          onRequestError: onError,
          onResponseError: onError,
          headers
        },
        /* proxyCookies = */
        true
      );
    });
  }
  async function signOut(signOutOptions) {
    const { callbackUrl: userCallbackUrl, redirect = true } = signOutOptions ?? {};
    const csrfToken = await getCsrfToken();
    const callbackUrl = await determineCallbackUrl(
      runtimeConfig.public.auth,
      userCallbackUrl,
      true
    );
    if (!csrfToken) {
      throw createError({ statusCode: 400, message: "Could not fetch CSRF Token for signing out" });
    }
    const signoutData = await _fetch(nuxt, "/signout", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        ...await getRequestHeaders(nuxt)
      },
      onRequest: ({ options }) => {
        options.body = new URLSearchParams({
          csrfToken,
          callbackUrl,
          json: "true"
        });
      }
    }).catch((error) => error.data);
    if (redirect) {
      const url = signoutData.url ?? callbackUrl;
      return navigateToAuthPageWN(nuxt, url);
    }
    await getSession();
    return signoutData;
  }
  async function getCsrfToken() {
    return callWithNuxt(nuxt, async () => {
      const headers = await getRequestHeaders(nuxt);
      return _fetch(nuxt, "/csrf", { headers }).then((response) => response.csrfToken);
    });
  }
  return {
    status,
    data: readonly(data),
    lastRefreshedAt: readonly(lastRefreshedAt),
    getSession,
    getCsrfToken,
    getProviders,
    signIn,
    signOut,
    refresh: getSession
  };
}
async function getRequestHeaders(nuxt, includeCookie = true) {
  const headers = await callWithNuxt(nuxt, () => useRequestHeaders(["cookie", "host"]));
  if (includeCookie && headers.cookie) {
    return headers;
  }
  return { host: headers.host };
}
const authMiddleware = /* @__PURE__ */ defineNuxtRouteMiddleware((to) => {
  const options = normalizeUserOptions(to.meta.auth);
  if (!options) {
    return;
  }
  const authConfig = (/* @__PURE__ */ useRuntimeConfig()).public.auth;
  const { status, signIn } = useAuth();
  const isGuestMode = options.unauthenticatedOnly;
  const isAuthenticated = status.value === "authenticated";
  if (isGuestMode && status.value === "unauthenticated") {
    return;
  } else if (isGuestMode && isAuthenticated) {
    return navigateTo(options.navigateAuthenticatedTo);
  } else if (isAuthenticated) {
    return;
  }
  if (authConfig.provider.type === "local") {
    const loginRoute = authConfig.provider.pages.login;
    if (loginRoute && loginRoute === to.path) {
      return;
    }
  }
  const globalAppMiddleware = authConfig.globalAppMiddleware;
  if (globalAppMiddleware === true || typeof globalAppMiddleware === "object" && globalAppMiddleware.allow404WithoutAuth) {
    const matchedRoute = to.matched.length > 0;
    if (!matchedRoute) {
      return;
    }
  }
  if (options.navigateUnauthenticatedTo) {
    return navigateTo(options.navigateUnauthenticatedTo);
  }
  if (authConfig.provider.type === "authjs") {
    const callbackUrl = determineCallbackUrlForRouteMiddleware(authConfig, to);
    const signInOptions = {
      error: "SessionRequired",
      callbackUrl
    };
    return signIn(
      // @ts-expect-error This is valid for a backend-type of `authjs`, where sign-in accepts a provider as a first argument
      void 0,
      signInOptions
    ).then((signInResult) => {
      if (signInResult) {
        return signInResult.navigationResult;
      }
      return true;
    });
  }
  const loginPage = authConfig.provider.pages.login;
  if (typeof loginPage !== "string") {
    console.warn(`${ERROR_PREFIX} provider.pages.login is misconfigured`);
    return;
  }
  const external = isExternalUrl(loginPage);
  if (typeof globalAppMiddleware === "object" && globalAppMiddleware.addDefaultCallbackUrl) {
    let redirectUrl = to.fullPath;
    if (typeof globalAppMiddleware.addDefaultCallbackUrl === "string") {
      redirectUrl = globalAppMiddleware.addDefaultCallbackUrl;
    }
    return navigateTo({
      path: loginPage,
      query: {
        redirect: redirectUrl
      }
    }, { external });
  }
  return navigateTo(loginPage, { external });
});
function normalizeUserOptions(userOptions) {
  if (typeof userOptions === "boolean" || userOptions === void 0) {
    return userOptions !== false ? {
      // Guest Mode off if `auth: true`
      unauthenticatedOnly: false,
      navigateAuthenticatedTo: "/",
      navigateUnauthenticatedTo: void 0
    } : void 0;
  }
  if (typeof userOptions === "object") {
    if (userOptions.unauthenticatedOnly === void 0) {
      userOptions.unauthenticatedOnly = true;
    }
    return {
      unauthenticatedOnly: userOptions.unauthenticatedOnly,
      navigateAuthenticatedTo: userOptions.navigateAuthenticatedTo ?? "/",
      navigateUnauthenticatedTo: userOptions.navigateUnauthenticatedTo
    };
  }
}
const sidebaseAuth = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: authMiddleware
}, Symbol.toStringTag, { value: "Module" }));
function withoutQuery(path) {
  return path.split("?")[0];
}
let routeMatcher;
function getNitroRouteRules(path) {
  const { nitro, app } = /* @__PURE__ */ useRuntimeConfig();
  if (!routeMatcher) {
    routeMatcher = toRouteMatcher(
      createRouter$1({
        routes: Object.fromEntries(
          Object.entries(nitro?.routeRules || {}).map(([routePath, rules]) => [withoutTrailingSlash(routePath), rules])
        )
      })
    );
  }
  const options = {};
  const matches = routeMatcher.matchAll(
    withoutBase(withoutTrailingSlash(withoutQuery(path)), app.baseURL)
  ).toReversed();
  for (const match of matches) {
    options.disableServerSideAuth ??= match.auth?.disableServerSideAuth;
  }
  return options;
}
class DefaultRefreshHandler {
  constructor(config) {
    this.config = config;
    this.boundVisibilityHandler = this.visibilityHandler.bind(this);
  }
  /** Result of `useAuth` composable, mostly used for session data/refreshing */
  auth;
  /** Runtime config is mostly used for getting provider data */
  runtimeConfig;
  /** Refetch interval */
  refetchIntervalTimer;
  // TODO: find more Generic method to start a Timer for the Refresh Token
  /** Refetch interval for local/refresh schema */
  refreshTokenIntervalTimer;
  /** Because passing `this.visibilityHandler` to `document.addEventHandler` loses `this` context */
  boundVisibilityHandler;
  init() {
    this.runtimeConfig = (/* @__PURE__ */ useRuntimeConfig()).public.auth;
    this.auth = useAuth();
    (void 0).addEventListener("visibilitychange", this.boundVisibilityHandler, false);
    const { enablePeriodically } = this.config;
    if (enablePeriodically !== false && enablePeriodically !== void 0) {
      const intervalTime = enablePeriodically === true ? 1e3 : safeTimerDelay(enablePeriodically);
      this.refetchIntervalTimer = setInterval(() => {
        if (this.auth?.data.value) {
          this.auth.refresh();
        }
      }, intervalTime);
    }
    const provider = this.runtimeConfig.provider;
    if (provider.type === "local" && provider.refresh.isEnabled && provider.refresh.token?.maxAgeInSeconds) {
      const intervalTime = safeTimerDelay(provider.refresh.token.maxAgeInSeconds * 1e3);
      this.refreshTokenIntervalTimer = setInterval(() => {
        if (this.auth?.refreshToken.value) {
          this.auth.refresh();
        }
      }, intervalTime);
    }
  }
  destroy() {
    (void 0).removeEventListener("visibilitychange", this.boundVisibilityHandler, false);
    clearInterval(this.refetchIntervalTimer);
    if (this.refreshTokenIntervalTimer) {
      clearInterval(this.refreshTokenIntervalTimer);
    }
    this.auth = void 0;
    this.runtimeConfig = void 0;
  }
  visibilityHandler() {
    if (this.config?.enableOnWindowFocus && (void 0).visibilityState === "visible" && this.auth?.data.value) {
      this.auth.refresh();
    }
  }
}
const MAX_SAFE_INTERVAL_MS = 2147483647;
function safeTimerDelay(milliseconds) {
  return Math.min(milliseconds, MAX_SAFE_INTERVAL_MS);
}
const _refreshHandler = new DefaultRefreshHandler({ "enablePeriodically": false, "enableOnWindowFocus": true });
const plugin_xp_hzh2CmddJ3Myd_cL2a86QZnSMAE8MuLZ6iluDhtI = /* @__PURE__ */ defineNuxtPlugin(async (nuxtApp) => {
  let __temp, __restore;
  const { data, lastRefreshedAt, loading } = useAuthState();
  const { getSession } = useAuth();
  const wholeRuntimeConfig = /* @__PURE__ */ useRuntimeConfig();
  const runtimeConfig = wholeRuntimeConfig.public.auth;
  const globalAppMiddleware = runtimeConfig.globalAppMiddleware;
  const routeRules = getNitroRouteRules(nuxtApp._route.path);
  {
    runtimeConfig.baseURL = resolveApiBaseURL(wholeRuntimeConfig);
  }
  let nitroPrerender = false;
  if (nuxtApp.ssrContext) {
    nitroPrerender = getHeader(nuxtApp.ssrContext.event, "x-nitro-prerender") !== void 0;
  }
  let disableServerSideAuth = routeRules.disableServerSideAuth;
  disableServerSideAuth ??= runtimeConfig?.disableServerSideAuth;
  disableServerSideAuth ??= false;
  if (disableServerSideAuth) {
    loading.value = true;
  }
  const isErrorUrl = nuxtApp.ssrContext?.error === true;
  const requireAuthOnErrorPage = globalAppMiddleware === true || typeof globalAppMiddleware === "object" && globalAppMiddleware.allow404WithoutAuth;
  const shouldFetchSession = typeof data.value === "undefined" && !nitroPrerender && !disableServerSideAuth && !(isErrorUrl && requireAuthOnErrorPage);
  if (shouldFetchSession) {
    try {
      ;
      [__temp, __restore] = executeAsync(() => getSession()), await __temp, __restore();
      ;
    } catch (e) {
      if (!(e instanceof FetchConfigurationError)) {
        throw e;
      }
    }
  }
  nuxtApp.hook("app:mounted", () => {
    _refreshHandler.init();
    if (disableServerSideAuth) {
      getSession();
    }
  });
  const _unmount = nuxtApp.vueApp.unmount;
  nuxtApp.vueApp.unmount = function() {
    _refreshHandler.destroy();
    lastRefreshedAt.value = void 0;
    data.value = void 0;
    _unmount();
  };
  if (globalAppMiddleware === true || typeof globalAppMiddleware === "object" && globalAppMiddleware.isEnabled) {
    addRouteMiddleware("auth", authMiddleware, {
      global: true
    });
  }
});
const plugins = [
  payloadPlugin,
  unhead_k2P3m_ZDyjlr2mMYnoDPwavjsDN8hBlk9cFai0bbopU,
  plugin$1,
  revive_payload_server_MVtmlZaQpj6ApFmshWfUWl5PehCebzaBf2NuRMiIbms,
  plugin,
  components_plugin_z4hgvsiddfKkfXTP6M8M4zG5Cb7sGnDhcryKVM45Di4,
  plugin_xp_hzh2CmddJ3Myd_cL2a86QZnSMAE8MuLZ6iluDhtI
];
const layouts = {
  auth: defineAsyncComponent(() => import('./auth-KXTXPYeN.mjs').then((m) => m.default || m)),
  dashboard: defineAsyncComponent(() => import('./dashboard-BX_HS0V6.mjs').then((m) => m.default || m))
};
const routeRulesMatcher = _routeRulesMatcher;
const LayoutLoader = defineComponent({
  name: "LayoutLoader",
  inheritAttrs: false,
  props: {
    name: String,
    layoutProps: Object
  },
  setup(props, context) {
    return () => h(layouts[props.name], props.layoutProps, context.slots);
  }
});
const nuxtLayoutProps = {
  name: {
    type: [String, Boolean, Object],
    default: null
  },
  fallback: {
    type: [String, Object],
    default: null
  }
};
const __nuxt_component_0 = defineComponent({
  name: "NuxtLayout",
  inheritAttrs: false,
  props: nuxtLayoutProps,
  setup(props, context) {
    const nuxtApp = useNuxtApp();
    const injectedRoute = inject(PageRouteSymbol);
    const shouldUseEagerRoute = !injectedRoute || injectedRoute === useRoute();
    const route = shouldUseEagerRoute ? useRoute$1() : injectedRoute;
    const layout = computed(() => {
      let layout2 = unref(props.name) ?? route?.meta.layout ?? routeRulesMatcher(route?.path).appLayout ?? "default";
      if (layout2 && !(layout2 in layouts)) {
        if (props.fallback) {
          layout2 = unref(props.fallback);
        }
      }
      return layout2;
    });
    const layoutRef = shallowRef();
    context.expose({ layoutRef });
    const done = nuxtApp.deferHydration();
    let lastLayout;
    return () => {
      const hasLayout = !!layout.value && layout.value in layouts;
      const hasTransition = hasLayout && !!(route?.meta.layoutTransition ?? appLayoutTransition);
      const transitionProps = hasTransition && _mergeTransitionProps([
        route?.meta.layoutTransition,
        appLayoutTransition,
        {
          onBeforeLeave() {
            nuxtApp["~transitionPromise"] = new Promise((resolve) => {
              nuxtApp["~transitionFinish"] = resolve;
            });
          },
          onAfterLeave() {
            nuxtApp["~transitionFinish"]?.();
            delete nuxtApp["~transitionFinish"];
            delete nuxtApp["~transitionPromise"];
          }
        }
      ]);
      const previouslyRenderedLayout = lastLayout;
      lastLayout = layout.value;
      return _wrapInTransition(transitionProps, {
        default: () => h(
          Suspense,
          {
            suspensible: true,
            onResolve: async () => {
              await nextTick(done);
            }
          },
          {
            default: () => h(
              LayoutProvider,
              {
                layoutProps: mergeProps(context.attrs, route.meta.layoutProps ?? {}, { ref: layoutRef }),
                key: layout.value || void 0,
                name: layout.value,
                shouldProvide: !props.name,
                isRenderingNewLayout: (name) => {
                  return name !== previouslyRenderedLayout && name === layout.value;
                },
                hasTransition
              },
              context.slots
            )
          }
        )
      }).default();
    };
  }
});
const LayoutProvider = defineComponent({
  name: "NuxtLayoutProvider",
  inheritAttrs: false,
  props: {
    name: {
      type: [String, Boolean]
    },
    layoutProps: {
      type: Object
    },
    hasTransition: {
      type: Boolean
    },
    shouldProvide: {
      type: Boolean
    },
    isRenderingNewLayout: {
      type: Function,
      required: true
    }
  },
  setup(props, context) {
    const name = props.name;
    if (props.shouldProvide) {
      provide(LayoutMetaSymbol, {
        // When name=false, always return true so NuxtPage doesn't skip rendering
        isCurrent: (route) => name === false || name === (route.meta.layout ?? routeRulesMatcher(route.path).appLayout ?? "default")
      });
    }
    const injectedRoute = inject(PageRouteSymbol);
    const isNotWithinNuxtPage = injectedRoute && injectedRoute === useRoute();
    const enclosingLayout = inject(LayoutMetaSymbol, null);
    if (isNotWithinNuxtPage) {
      const vueRouterRoute = useRoute$1();
      const reactiveChildRoute = {};
      for (const _key in vueRouterRoute) {
        const key = _key;
        Object.defineProperty(reactiveChildRoute, key, {
          enumerable: true,
          get: () => {
            const useEagerRoute = props.isRenderingNewLayout(props.name) && (!enclosingLayout || enclosingLayout.isCurrent(vueRouterRoute));
            return useEagerRoute ? vueRouterRoute[key] : injectedRoute[key];
          }
        });
      }
      provide(PageRouteSymbol, shallowReactive(reactiveChildRoute));
    }
    return () => {
      if (!name || typeof name === "string" && !(name in layouts)) {
        return context.slots.default?.();
      }
      return h(
        LayoutLoader,
        { key: name, layoutProps: props.layoutProps, name },
        context.slots
      );
    };
  }
});
const defineRouteProvider = (name = "RouteProvider") => defineComponent({
  name,
  props: {
    route: {
      type: Object,
      required: true
    },
    vnode: Object,
    vnodeRef: Object,
    renderKey: String,
    trackRootNodes: Boolean
  },
  setup(props) {
    const previousKey = props.renderKey;
    const previousRoute = props.route;
    const route = {};
    for (const key in props.route) {
      Object.defineProperty(route, key, {
        get: () => previousKey === props.renderKey ? props.route[key] : previousRoute[key],
        enumerable: true
      });
    }
    provide(PageRouteSymbol, shallowReactive(route));
    return () => {
      if (!props.vnode) {
        return props.vnode;
      }
      return h(props.vnode, { ref: props.vnodeRef });
    };
  }
});
const RouteProvider = defineRouteProvider();
const __nuxt_component_1 = defineComponent({
  name: "NuxtPage",
  inheritAttrs: false,
  props: {
    name: {
      type: String
    },
    transition: {
      type: [Boolean, Object],
      default: void 0
    },
    keepalive: {
      type: [Boolean, Object],
      default: void 0
    },
    route: {
      type: Object
    },
    pageKey: {
      type: [Function, String],
      default: null
    }
  },
  setup(props, { attrs, slots, expose }) {
    const nuxtApp = useNuxtApp();
    const pageRef = ref();
    inject(PageRouteSymbol, null);
    expose({ pageRef });
    inject(LayoutMetaSymbol, null);
    nuxtApp.deferHydration();
    return () => {
      return h(RouterView, { name: props.name, route: props.route, ...attrs }, {
        default: markStableSlot((routeProps) => {
          return h(Suspense, { suspensible: true }, {
            default() {
              return h(RouteProvider, {
                vnode: slots.default ? normalizeSlot(slots.default, routeProps) : routeProps.Component,
                route: routeProps.route,
                vnodeRef: pageRef
              });
            }
          });
        })
      });
    };
  }
});
function markStableSlot(fn) {
  const wrapped = ((routeProps) => {
    const result = fn(routeProps);
    if (Array.isArray(result)) {
      return result;
    }
    if (result == null || !isVNode(result)) {
      return [createCommentVNode()];
    }
    return [result];
  });
  wrapped._n = true;
  return wrapped;
}
function normalizeSlot(slot, data) {
  const slotContent = slot(data);
  return slotContent.length === 1 ? h(slotContent[0]) : h(Fragment, void 0, slotContent);
}
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_main$2 = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_NuxtLayout = __nuxt_component_0;
  const _component_NuxtPage = __nuxt_component_1;
  _push(`<div${ssrRenderAttrs(_attrs)}>`);
  _push(ssrRenderComponent(_component_NuxtLayout, null, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_NuxtPage, null, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_NuxtPage)
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("app.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const AppComponent = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["ssrRender", _sfc_ssrRender]]);
const _sfc_main$1 = {
  __name: "nuxt-error-page",
  __ssrInlineRender: true,
  props: {
    error: Object
  },
  setup(__props) {
    const props = __props;
    const _error = props.error;
    const status = Number(_error.statusCode || 500);
    const is404 = status === 404;
    const statusText = _error.statusMessage ?? (is404 ? "Page Not Found" : "Internal Server Error");
    const description = _error.message || _error.toString();
    const stack = void 0;
    const _Error404 = defineAsyncComponent(() => import('./error-404-BnhrdTIQ.mjs'));
    const _Error = defineAsyncComponent(() => import('./error-500-BwSzE-GO.mjs'));
    const ErrorTemplate = is404 ? _Error404 : _Error;
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(ErrorTemplate), mergeProps({ status: unref(status), statusText: unref(statusText), statusCode: unref(status), statusMessage: unref(statusText), description: unref(description), stack: unref(stack) }, _attrs), null, _parent));
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/nuxt/dist/app/components/nuxt-error-page.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "nuxt-root",
  __ssrInlineRender: true,
  setup(__props) {
    const IslandRenderer = () => null;
    const nuxtApp = useNuxtApp();
    nuxtApp.deferHydration();
    nuxtApp.ssrContext.url;
    const SingleRenderer = false;
    provide(PageRouteSymbol, useRoute());
    nuxtApp.hooks.callHookWith((hooks) => hooks.map((hook) => hook()), "vue:setup", []);
    const error = /* @__PURE__ */ useError();
    const abortRender = error.value && !nuxtApp.ssrContext.error;
    function invokeAppErrorHandler(err, target, info) {
      const errorHandler = nuxtApp.vueApp.config.errorHandler;
      if (errorHandler && !errorHandler.__nuxt_default) {
        try {
          errorHandler(err, target, info);
        } catch (handlerError) {
          console.error("[nuxt] Error in `app.config.errorHandler`", handlerError);
        }
      }
    }
    onErrorCaptured((err, target, info) => {
      nuxtApp.hooks.callHook("vue:error", err, target, info).catch((hookError) => console.error("[nuxt] Error in `vue:error` hook", hookError));
      {
        const p = nuxtApp.runWithContext(() => showError(err));
        onServerPrefetch(() => p);
        invokeAppErrorHandler(err, target, info);
        return false;
      }
    });
    const islandContext = nuxtApp.ssrContext.islandContext;
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderSuspense(_push, {
        default: () => {
          if (unref(abortRender)) {
            _push(`<div></div>`);
          } else if (unref(error)) {
            _push(ssrRenderComponent(unref(_sfc_main$1), { error: unref(error) }, null, _parent));
          } else if (unref(islandContext)) {
            _push(ssrRenderComponent(unref(IslandRenderer), { context: unref(islandContext) }, null, _parent));
          } else if (unref(SingleRenderer)) {
            ssrRenderVNode(_push, createVNode(resolveDynamicComponent(unref(SingleRenderer)), null, null), _parent);
          } else {
            _push(ssrRenderComponent(unref(AppComponent), null, null, _parent));
          }
        },
        _: 1
      });
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/nuxt/dist/app/components/nuxt-root.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
let entry;
{
  entry = async function createNuxtAppServer(ssrContext) {
    const vueApp = createApp(_sfc_main);
    const nuxt = createNuxtApp({ vueApp, ssrContext });
    try {
      await applyPlugins(nuxt, plugins);
      await nuxt.hooks.callHook("app:created", vueApp);
    } catch (error) {
      await nuxt.hooks.callHook("app:error", error);
      nuxt.payload.error ||= createError(error);
    }
    if (ssrContext && (ssrContext["~renderResponse"] || ssrContext._renderResponse)) {
      throw new Error("skipping render");
    }
    return vueApp;
  };
}
const entry_default = ((ssrContext) => entry(ssrContext));

export { _export_sfc as _, useRouter as a, useRoute as b, useNuxtApp as c, useRuntimeConfig as d, entry_default as default, encodeRoutePath as e, nuxtLinkDefaults as f, defineNuxtRouteMiddleware as g, navigateTo as n, resolveRouteObject as r, tryUseNuxtApp as t, useAuth as u };
//# sourceMappingURL=server.mjs.map
