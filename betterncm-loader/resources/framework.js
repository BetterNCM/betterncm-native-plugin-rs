(() => {
  // src/betterncm-api/utils.ts
  var utils;
  ((utils2) => {
    function waitForElement(selector, interval = 100) {
      return waitForFunction(() => document.querySelector(selector), interval);
    }
    utils2.waitForElement = waitForElement;
    function debounce(callback, waitTime) {
      let timer = 0;
      return function debounceClosure() {
        const self = this;
        const args = arguments;
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(callback.bind(self, args), waitTime);
      };
    }
    utils2.debounce = debounce;
    function waitForFunction(func, interval = 100) {
      return new Promise((rs) => {
        const handle = setInterval(() => {
          const result = func();
          if (result) {
            clearInterval(handle);
            rs(result);
          }
        }, interval);
      });
    }
    utils2.waitForFunction = waitForFunction;
    function delay(ms) {
      return new Promise((rs) => setTimeout(rs, ms));
    }
    utils2.delay = delay;
    function dom2(tag, settings, ...children) {
      const tmp = document.createElement(tag);
      if (settings.class) {
        for (const cl of settings.class) {
          tmp.classList.add(cl);
        }
        settings.class = void 0;
      }
      if (settings.style) {
        for (const cl in settings.style) {
          tmp.style[cl] = settings.style[cl];
        }
        settings.style = void 0;
      }
      for (const v in settings) {
        if (settings[v])
          tmp[v] = settings[v];
      }
      for (const child of children) {
        if (child)
          tmp.appendChild(child);
      }
      return tmp;
    }
    utils2.dom = dom2;
  })(utils || (utils = {}));

  // src/betterncm-api/react.ts
  function initNCMReact() {
    if ("React" in window) {
      if ("createElement" in React && "Fragment" in React) {
        window.h = React.createElement;
        window.f = React.Fragment;
        return true;
      }
    }
    return "h" in window && "f" in window;
  }
  utils.waitForFunction(initNCMReact, 100);

  // src/betterncm-api/fs.ts
  var fs;
  ((fs2) => {
    function readDir(folderPath) {
      return new Promise((resolve, reject) => {
        betterncm_native.fs.readDir(folderPath, resolve, reject);
      });
    }
    fs2.readDir = readDir;
    function readFileText(filePath) {
      return new Promise((resolve, reject) => {
        betterncm_native.fs.readFileText(filePath, resolve, reject);
      });
    }
    fs2.readFileText = readFileText;
    async function readFile(filePath) {
      return new Promise((resolve, reject) => {
        betterncm_native.fs.readFile(filePath, resolve, reject);
      }).then((v) => {
        const data = new Uint8Array(v);
        const blob = new Blob([data]);
        return blob;
      });
    }
    fs2.readFile = readFile;
    async function mountDir(filePath) {
      throw new TypeError("\u672A\u5B9E\u73B0");
    }
    fs2.mountDir = mountDir;
    async function mountFile(filePath) {
      throw new TypeError("\u672A\u5B9E\u73B0");
    }
    fs2.mountFile = mountFile;
    async function unzip(zipPath, unzipDest = `${zipPath}_extracted/`) {
      throw new TypeError("\u672A\u5B9E\u73B0");
    }
    fs2.unzip = unzip;
    function writeFileText(filePath, content) {
      return new Promise((resolve, reject) => {
        betterncm_native.fs.writeFileText(filePath, content, resolve, reject);
      });
    }
    fs2.writeFileText = writeFileText;
    async function writeFile(filePath, content) {
      if (typeof content === "string") {
        return writeFileText(filePath, content);
      } else {
        const data = [...new Uint8Array(await content.arrayBuffer())];
        return new Promise((resolve, reject) => {
          betterncm_native.fs.writeFile(filePath, data, resolve, reject);
        });
      }
    }
    fs2.writeFile = writeFile;
    async function mkdir(dirPath) {
      return new Promise((resolve, reject) => {
        betterncm_native.fs.mkdir(dirPath, resolve, reject);
      });
    }
    fs2.mkdir = mkdir;
    function exists(path) {
      return betterncm_native.fs.exists(path);
    }
    fs2.exists = exists;
    async function remove(path) {
      return new Promise((resolve, reject) => {
        betterncm_native.fs.remove(path, resolve, reject);
      });
    }
    fs2.remove = remove;
  })(fs || (fs = {}));

  // src/betterncm-api/base.ts
  var betterncmFetch = (relPath, option) => {
    if (option) {
      option.headers = option.headers ?? {};
      if (!option.ignoreApiKey)
        option.headers["BETTERNCM_API_KEY"] = BETTERNCM_API_KEY;
    } else {
      option = {
        headers: { BETTERNCM_API_KEY }
      };
    }
    return fetch(BETTERNCM_API_PATH + relPath, option);
  };

  // src/betterncm-api/app.ts
  var e = encodeURIComponent;
  var app;
  ((app2) => {
    async function exec(cmd, elevate = false, showWindow = false) {
      const r = await betterncmFetch(
        `/app/exec${elevate ? "_ele" : ""}${showWindow ? "?_showWindow" : ""}`,
        { method: "POST", body: cmd }
      );
      return r.status === 200;
    }
    app2.exec = exec;
    let betterNCMVersion = null;
    function getBetterNCMVersion() {
      return betterncm_native.app.version();
    }
    app2.getBetterNCMVersion = getBetterNCMVersion;
    async function takeBackgroundScreenshot() {
      const r = await betterncmFetch("/app/bg_screenshot");
      return await r.blob();
    }
    app2.takeBackgroundScreenshot = takeBackgroundScreenshot;
    async function getNCMWinPos() {
      const r = await betterncmFetch("/app/get_win_position", {
        ignoreApiKey: true
      });
      return await r.json();
    }
    app2.getNCMWinPos = getNCMWinPos;
    async function reloadPlugins() {
      const r = await betterncmFetch("/app/reload_plugin");
      return r.status === 200;
    }
    app2.reloadPlugins = reloadPlugins;
    async function getDataPath() {
      const r = await betterncmFetch("/app/datapath");
      const p = await r.text();
      return p.replace(/\//g, "\\");
    }
    app2.getDataPath = getDataPath;
    async function readConfig(key, defaultValue) {
      return new Promise((resolve, reject) => {
        betterncm_native.app.readConfig(key, defaultValue, resolve, reject);
      });
    }
    app2.readConfig = readConfig;
    async function writeConfig(key, value) {
      return new Promise((resolve, reject) => {
        betterncm_native.app.writeConfig(key, value, resolve, reject);
      });
    }
    app2.writeConfig = writeConfig;
    function getNCMPath() {
      return betterncm_native.app.getNCMPath();
    }
    app2.getNCMPath = getNCMPath;
    function showConsole(show = true) {
      betterncm_native.app.showConsole(show);
    }
    app2.showConsole = showConsole;
    async function setRoundedCorner(enable = true) {
    }
    app2.setRoundedCorner = setRoundedCorner;
    async function openFileDialog(filter, initialDir) {
      const r = await betterncmFetch(
        `/app/open_file_dialog?filter=${e(filter)}&initialDir=${e(initialDir)}`
      );
      return await r.text();
    }
    app2.openFileDialog = openFileDialog;
    async function isLightTheme() {
      const r = await betterncmFetch("/app/is_light_theme");
      return await r.json();
    }
    app2.isLightTheme = isLightTheme;
    async function getSucceededHijacks() {
      const r = await betterncmFetch("/app/get_succeeded_hijacks");
      return await r.json();
    }
    app2.getSucceededHijacks = getSucceededHijacks;
  })(app || (app = {}));

  // src/betterncm-api/ncm.ts
  var ncm;
  ((ncm2) => {
    function findNativeFunction(obj, identifiers) {
      for (let key in obj) {
        let flag = true;
        for (let _i = 0, identifiers_1 = identifiers; _i < identifiers_1.length; _i++) {
          let identifier = identifiers_1[_i];
          if (!obj[key].toString().includes(identifier))
            flag = false;
        }
        if (flag)
          return key;
      }
    }
    ncm2.findNativeFunction = findNativeFunction;
    function openUrl(url) {
      channel.call("os.navigateExternal", () => {
      }, [url]);
    }
    ncm2.openUrl = openUrl;
    function getNCMPackageVersion() {
      return window?.APP_CONF?.packageVersion || "0000000";
    }
    ncm2.getNCMPackageVersion = getNCMPackageVersion;
    function getNCMFullVersion() {
      return window?.APP_CONF?.appver || "0.0.0.0";
    }
    ncm2.getNCMFullVersion = getNCMFullVersion;
    function getNCMVersion() {
      const v = getNCMFullVersion();
      return v.substring(0, v.lastIndexOf("."));
    }
    ncm2.getNCMVersion = getNCMVersion;
    function getNCMBuild() {
      const v = getNCMFullVersion();
      return parseInt(v.substring(v.lastIndexOf(".") + 1));
    }
    ncm2.getNCMBuild = getNCMBuild;
    function searchApiFunction(nameOrFinder, root = window, currentPath = ["window"], prevObjects = [], result = []) {
      if (root === void 0 || root === null) {
        return [];
      }
      prevObjects.push(root);
      if (typeof nameOrFinder === "string") {
        if (typeof root[nameOrFinder] === "function") {
          result.push([root[nameOrFinder], root, [...currentPath]]);
        }
      } else {
        for (const key of Object.keys(root)) {
          if (Object.hasOwnProperty.call(root, key) && typeof root[key] === "function" && nameOrFinder(root[key])) {
            result.push([root[key], root, [...currentPath]]);
          }
        }
      }
      if (currentPath.length < 10) {
        for (const key of Object.keys(root)) {
          if (Object.hasOwnProperty.call(root, key) && typeof root[key] === "object" && !prevObjects.includes(root[key]) && !(currentPath.length === 1 && prevObjects[prevObjects.length - 1] === window && key === "betterncm")) {
            currentPath.push(key);
            searchApiFunction(
              nameOrFinder,
              root[key],
              currentPath,
              prevObjects,
              result
            );
            currentPath.pop();
          }
        }
      }
      prevObjects.pop();
      return result;
    }
    ncm2.searchApiFunction = searchApiFunction;
    function searchForData(finder, root = window, currentPath = ["window"], prevObjects = [], result = []) {
      if (root === void 0 || root === null) {
        return [];
      }
      prevObjects.push(root);
      if (currentPath.length < 10) {
        for (const key of Object.keys(root)) {
          if (Object.hasOwnProperty.call(root, key) && !prevObjects.includes(root[key]) && !(currentPath.length === 1 && prevObjects[prevObjects.length - 1] === window && key === "betterncm")) {
            if (typeof root[key] === "object") {
              currentPath.push(key);
              searchApiFunction(
                finder,
                root[key],
                currentPath,
                prevObjects,
                result
              );
              currentPath.pop();
            } else if (finder(root[key])) {
              result.push([root[key], root, [...currentPath]]);
            }
          }
        }
      }
      prevObjects.pop();
      return result;
    }
    ncm2.searchForData = searchForData;
    function findApiFunction(nameOrFinder, root = window, currentPath = ["window"], prevObjects = []) {
      if (root === void 0 || root === null) {
        return null;
      }
      prevObjects.push(root);
      if (typeof nameOrFinder === "string") {
        if (typeof root[nameOrFinder] === "function") {
          return [root[nameOrFinder], root, [...currentPath]];
        }
      } else {
        for (const key of Object.keys(root)) {
          if (Object.hasOwnProperty.call(root, key) && typeof root[key] === "function" && nameOrFinder(root[key])) {
            return [root[key], root, [...currentPath]];
          }
        }
      }
      if (currentPath.length < 10) {
        for (const key of Object.keys(root)) {
          if (Object.hasOwnProperty.call(root, key) && typeof root[key] === "object" && !prevObjects.includes(root[key]) && !(currentPath.length === 1 && prevObjects[prevObjects.length - 1] === window && key === "betterncm")) {
            currentPath.push(key);
            const result = findApiFunction(
              nameOrFinder,
              root[key],
              currentPath,
              prevObjects
            );
            currentPath.pop();
            if (result) {
              return result;
            }
          }
        }
      }
      prevObjects.pop();
      return null;
    }
    ncm2.findApiFunction = findApiFunction;
    let cachedGetPlayingFunc = null;
    function getPlayingSong() {
      if (cachedGetPlayingFunc === null) {
        const findResult = findApiFunction("getPlaying");
        if (findResult) {
          const [getPlaying2, getPlayingRoot] = findResult;
          cachedGetPlayingFunc = getPlaying2.bind(getPlayingRoot);
        }
      }
      if (cachedGetPlayingFunc === null) {
        return null;
      } else {
        return cachedGetPlayingFunc();
      }
    }
    ncm2.getPlayingSong = getPlayingSong;
    function getPlaying() {
      const playing = getPlayingSong();
      const result = {
        id: playing.data.id,
        title: playing.data.name,
        type: "normal"
      };
      if (playing.from.fm) {
        result.type = "fm";
      }
      return result;
    }
    ncm2.getPlaying = getPlaying;
  })(ncm || (ncm = {}));

  // src/betterncm-api/tests.ts
  var tests;
  ((tests2) => {
    async function fail(reason) {
      console.warn("Test Failed", reason);
      await fs.writeFileText("/__TEST_FAILED__.txt", reason);
    }
    tests2.fail = fail;
    async function success(message) {
      console.warn("Test Succeeded", message);
      await fs.writeFileText("/__TEST_SUCCEEDED__.txt", message);
    }
    tests2.success = success;
  })(tests || (tests = {}));

  // src/betterncm-api/index.ts
  function reload() {
    const loadingMask = document.getElementById("loadingMask");
    if (!loadingMask) {
      betterncm_native.app.reloadIgnoreCache();
      return;
    }
    const anim = loadingMask.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 300,
      fill: "forwards",
      easing: "cubic-bezier(0.42, 0, 0.58, 1)"
    });
    anim.commitStyles();
    anim.addEventListener("finish", (_) => {
      betterncm_native.app.reloadIgnoreCache();
    });
  }
  var BetterNCM = {
    fs,
    app,
    ncm,
    utils,
    tests,
    reload,
    betterncmFetch
  };
  window.dom = utils.dom;
  betterncm = BetterNCM;
  var betterncm_api_default = BetterNCM;

  // src/plugin-manager/components/button.tsx
  var Button = (props) => {
    const { children, className, ...other } = props;
    return /* @__PURE__ */ h("a", { className: `u-ibtn5 u-ibtnsz8 ${className || ""}`, ...other }, children);
  };

  // src/plugin-manager/components/progress-ring.tsx
  var ProgressRing = (props) => {
    return /* @__PURE__ */ h(
      "span",
      {
        className: "bncm-spinner",
        style: {
          width: props.size || "16px",
          height: props.size || "16px"
        }
      },
      /* @__PURE__ */ h("div", null),
      /* @__PURE__ */ h("div", null),
      /* @__PURE__ */ h("div", null),
      /* @__PURE__ */ h("div", null),
      /* @__PURE__ */ h("div", null),
      /* @__PURE__ */ h("div", null),
      /* @__PURE__ */ h("div", null),
      /* @__PURE__ */ h("div", null),
      /* @__PURE__ */ h("div", null),
      /* @__PURE__ */ h("div", null),
      /* @__PURE__ */ h("div", null),
      /* @__PURE__ */ h("div", null)
    );
  };

  // src/plugin-manager/components/header.tsx
  var HeaderComponent = (props) => {
    const [updateButtonColor, setUpdateButtonColor] = React.useState("transparent");
    const safeMode = React.useMemo(() => isSafeMode(), []);
    const [latestVersion, setLatestVersion] = React.useState(null);
    const [currentVersion, setCurrentVersion] = React.useState("");
    const globalRequireRestart = React.useMemo(() => Object.values(loadedPlugins).findIndex((plugin) => plugin.manifest.require_restart || plugin.manifest.native_plugin) !== -1, []);
    React.useEffect(() => {
      (async () => {
        if (!latestVersion) {
          const betterNCMVersion = await betterncm_api_default.app.getBetterNCMVersion();
          setCurrentVersion(betterNCMVersion);
          const currentNCMVersion = betterncm_api_default.ncm.getNCMVersion();
          const online = await (await fetch(
            "https://gitee.com/microblock/better-ncm-v2-data/raw/master/betterncm/betterncm.json"
          )).json();
          const onlineSuitableVersions = online.versions.filter(
            (v) => v.supports.includes(currentNCMVersion)
          );
          if (onlineSuitableVersions.length === 0) {
            setUpdateButtonColor("#F004");
            setLatestVersion({
              version: "",
              supports: [],
              file: "",
              changelog: ""
            });
          } else {
            const latestVersion2 = onlineSuitableVersions[0];
            if (latestVersion2.version !== betterNCMVersion) {
              setUpdateButtonColor("#0F04");
            }
            setLatestVersion(latestVersion2);
          }
        }
      })();
    }, [latestVersion]);
    const onUpdateButtonClicked = React.useCallback(async () => {
      if (latestVersion && latestVersion.version !== currentVersion) {
        const ncmpath = await betterncm_api_default.app.getNCMPath();
        const datapath = await betterncm_api_default.app.getDataPath();
        const dllpath = `${datapath}\\betterncm.dll`;
        if (await betterncm_api_default.fs.exists("./betterncm.dll"))
          await betterncm_api_default.fs.remove("./betterncm.dll");
        await betterncm_api_default.fs.writeFile(
          "./betterncm.dll",
          await (await fetch(latestVersion?.file)).blob()
        );
        if (!ncmpath.toLowerCase().includes("system")) {
          betterncm_api_default.app.exec(
            [
              "cmd /c @echo off",
              "echo BetterNCM Updating...",
              "cd /d C:/",
              "cd C:/",
              `cd /d ${ncmpath[0]}:/`,
              `cd "${ncmpath}"`,
              "taskkill /f /im cloudmusic.exe>nul",
              "taskkill /f /im cloudmusicn.exe>nul",
              "ping 127.0.0.1>nul & del msimg32.dll",
              `move "${dllpath}" .\\msimg32.dll`,
              "start cloudmusic.exe"
            ].join(" & "),
            true
          );
        }
      } else if (latestVersion) {
        setLatestVersion(null);
      }
    }, [latestVersion]);
    const [consoleShown, setConsoleShown] = React.useState(false);
    return /* @__PURE__ */ h("section", { className: "bncm-mgr-header" }, /* @__PURE__ */ h(
      "img",
      {
        src: "https://s1.ax1x.com/2022/08/11/vGlJN8.png",
        alt: "",
        style: {
          height: "64px"
        }
      }
    ), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("h1", null, "BetterNCM", " ", /* @__PURE__ */ h("span", { style: { fontSize: "smaller", opacity: "0.8" } }, betterncm_native.app.version())), /* @__PURE__ */ h("div", { className: "bncm-mgr-btns" }, /* @__PURE__ */ h(
      Button,
      {
        onClick: async () => {
          betterncm_api_default.app.exec(
            `explorer "${(await betterncm_api_default.app.getDataPath()).replace(
              /\//g,
              "\\"
            )}"`,
            false,
            true
          );
        }
      },
      "\u6253\u5F00\u63D2\u4EF6\u6587\u4EF6\u5939"
    ), /* @__PURE__ */ h(
      Button,
      {
        onClick: () => {
          betterncm_api_default.app.showConsole(!consoleShown);
          setConsoleShown(!consoleShown);
        }
      },
      consoleShown ? "\u9690\u85CF" : "\u6253\u5F00",
      "\u63A7\u5236\u53F0"
    ), globalRequireRestart ? /* @__PURE__ */ h(f, null, /* @__PURE__ */ h(
      Button,
      {
        onClick: async () => {
          betterncm_api_default.reload();
        }
      },
      "\u91CD\u8F7D\u7F51\u6613\u4E91"
    ), /* @__PURE__ */ h(
      Button,
      {
        onClick: async () => {
          await disableSafeMode();
          betterncm_native.app.restart();
        }
      },
      "\u91CD\u542F\u5E76\u91CD\u8F7D\u63D2\u4EF6"
    )) : /* @__PURE__ */ h(
      Button,
      {
        onClick: async () => {
          await disableSafeMode();
          await betterncm_api_default.app.reloadPlugins();
          betterncm_api_default.reload();
        }
      },
      "\u91CD\u8F7D\u63D2\u4EF6"
    ), /* @__PURE__ */ h(
      Button,
      {
        style: {
          display: "flex",
          alignItems: "center",
          background: updateButtonColor
        },
        onClick: onUpdateButtonClicked
      },
      latestVersion === null ? /* @__PURE__ */ h(f, null, /* @__PURE__ */ h(ProgressRing, null), "\u68C0\u67E5\u66F4\u65B0\u4E2D") : latestVersion.version === currentVersion ? /* @__PURE__ */ h(f, null, "\u5DF2\u662F\u6700\u65B0\u7248\u672C") : latestVersion.version.length === 0 ? /* @__PURE__ */ h(f, null, "\u7248\u672C\u4E0D\u517C\u5BB9") : /* @__PURE__ */ h(f, null, "\u70B9\u51FB\u66F4\u65B0\u5230 ", latestVersion.version)
    ))), /* @__PURE__ */ h("div", { className: "m-tool" }, /* @__PURE__ */ h(
      "a",
      {
        className: "itm",
        onClick: () => props.onRequestOpenStartupWarnings(),
        style: {
          width: "32px",
          height: "32px"
        }
      },
      /* @__PURE__ */ h("svg", { width: "32px", height: "32px", viewBox: "0 0 24 24" }, /* @__PURE__ */ h(
        "path",
        {
          fill: "currentColor",
          d: "M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"
        }
      ))
    ), /* @__PURE__ */ h(
      "a",
      {
        className: "itm",
        onClick: () => betterncm_api_default.ncm.openUrl("https://github.com/MicroCBer/BetterNCM"),
        style: {
          width: "32px",
          height: "32px"
        }
      },
      /* @__PURE__ */ h("svg", { width: "32px", height: "32px", viewBox: "0 0 24 24" }, /* @__PURE__ */ h(
        "path",
        {
          fill: "currentColor",
          d: "M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z"
        }
      ))
    )));
  };

  // src/plugin-manager/components/safe-mode-info.tsx
  var SafeModeInfo = () => {
    const loadError = React.useMemo(getLoadError, []);
    return /* @__PURE__ */ h("div", { className: "v-scroll" }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h(
      "div",
      {
        style: {
          overflowY: "scroll",
          overflowX: "hidden"
        },
        className: "safe-mode-info"
      },
      /* @__PURE__ */ h("h1", null, "\u73B0\u5728\u5904\u4E8E\u5B89\u5168\u6A21\u5F0F"),
      /* @__PURE__ */ h("p", null, "BetterNCM \u63D2\u4EF6\u52A0\u8F7D\u5668\u53EF\u80FD\u906D\u9047\u4E86\u591A\u6B21\u63D2\u4EF6\u52A0\u8F7D\u5931\u8D25\u91CD\u8F7D\uFF0C\u5B89\u5168\u6A21\u5F0F\u5DF2\u81EA\u52A8\u542F\u7528\uFF0C\u5728\u8BE5\u6A21\u5F0F\u4E0B\u4E0D\u4F1A\u52A0\u8F7D\u4EFB\u4F55\u63D2\u4EF6\u3002"),
      /* @__PURE__ */ h("p", null, "\u63D2\u4EF6\u52A0\u8F7D\u5668\u5DF2\u7ECF\u6536\u96C6\u4E86\u6BCF\u6B21\u52A0\u8F7D\u53D1\u751F\u7684\u9519\u8BEF\uFF0C\u8BF7\u786E\u8BA4\u52A0\u8F7D\u5931\u8D25\u7684\u63D2\u4EF6\uFF0C\u5E76\u5C06\u53D1\u751F\u9519\u8BEF\u7684\u63D2\u4EF6\u624B\u52A8\u79FB\u9664\u6216\u4FEE\u6B63\u3002"),
      /* @__PURE__ */ h("p", null, "\u5B8C\u6210\u8C03\u6574\u540E\uFF0C\u53EF\u4EE5\u901A\u8FC7\u6309\u4E0B\u91CD\u8F7D\u63D2\u4EF6\u5173\u95ED\u5B89\u5168\u6A21\u5F0F\u5E76\u91CD\u65B0\u52A0\u8F7D\u63D2\u4EF6\u3002"),
      /* @__PURE__ */ h(
        Button,
        {
          onClick: async () => {
            await disableSafeMode();
            betterncm_native.app.restart();
          }
        },
        "\u91CD\u542F\u5E76\u91CD\u8F7D\u63D2\u4EF6"
      ),
      loadError.length === 0 ? /* @__PURE__ */ h("p", null, "\u6CA1\u6709\u627E\u5230\u52A0\u8F7D\u9519\u8BEF\u8BB0\u5F55\uFF0C\u6709\u53EF\u80FD\u662F\u53D7\u5230\u63D2\u4EF6\u5F71\u54CD\u6216\u63D2\u4EF6\u7BA1\u7406\u5668\u81EA\u8EAB\u51FA\u9519\u3002") : /* @__PURE__ */ h(f, null, /* @__PURE__ */ h("p", null, "\u52A0\u8F7D\u9519\u8BEF\u8BB0\u5F55\uFF1A"), /* @__PURE__ */ h("code", null, /* @__PURE__ */ h("pre", { style: { whiteSpace: "pre-wrap" } }, loadError)))
    )));
  };

  // src/plugin-manager/components/warning.tsx
  var StartupWarning = (props) => {
    return /* @__PURE__ */ h("div", { className: "startup-warning" }, /* @__PURE__ */ h("h1", null, "\u6B22\u8FCE\u4F7F\u7528 BetterNCM\uFF01"), /* @__PURE__ */ h("p", null, "BetterNCM \u662F\u4E00\u4E2A\u7531\u4E00\u7FA4\u70ED\u7231\u7F51\u6613\u4E91\u97F3\u4E50\u7684\u4E91\u6751\u6751\u53CB\u5F00\u53D1\u7684 PC \u7248\u7F51\u6613\u4E91\u97F3\u4E50\u6269\u5C55\u5DE5\u5177\uFF0C\u53EF\u4EE5\u63D0\u4F9B\u975E\u5E38\u4E30\u5BCC\u7684\u81EA\u5B9A\u4E49\u529F\u80FD\u6269\u5C55\u589E\u5F3A\u80FD\u529B\u3002"), /* @__PURE__ */ h("p", null, "\u8003\u8651\u5230\u5DE5\u5177\u6027\u8D28\uFF0CBetterNCM \u5C06", /* @__PURE__ */ h("b", null, "\u6C38\u8FDC\u662F\u5B8C\u5168\u5F00\u6E90\u514D\u8D39\u7684\u81EA\u7531\u8F6F\u4EF6"), "\uFF0C\u6240\u4EE5\u5982\u679C\u4F60\u662F\u4ECE\u4EFB\u4F55\u5730\u65B9\u53D1\u73B0\u6709\u4EFB\u4F55\u4EBA\u5728\u552E\u5356\u672C\u5DE5\u5177\uFF0C\u8BF7\u7ACB\u523B\u8981\u6C42\u9000\u6B3E\u5E76\u4E3E\u62A5\u5546\u5BB6\uFF01 \u4F5C\u4E3A\u4E00\u7FA4\u7231\u597D\u8005\uFF0C\u6211\u4EEC\u4E0D\u4F1A\u4E5F\u6CA1\u529E\u6CD5\u4E3A\u4F60\u56E0\u4E3A\u4ECE\u5176\u5B83\u9014\u5F84\u8D2D\u4E70\u672C\u5DE5\u5177\u9020\u6210\u7684\u635F\u5931\u8D1F\u8D23\uFF01"), /* @__PURE__ */ h("p", null, "\u5982\u679C\u4F60\u4E5F\u5E0C\u671B\u4E3A BetterNCM \u8D21\u732E\u4EE3\u7801\uFF0C\u6B22\u8FCE\u524D\u6765 BetterNCM \u7684 Github \u5F00\u6E90\u4ED3\u5E93\uFF1A", /* @__PURE__ */ h(
      "a",
      {
        className: "itm",
        onClick: () => betterncm_api_default.ncm.openUrl("https://github.com/MicroCBer/BetterNCM"),
        style: {
          width: "32px",
          height: "32px"
        }
      },
      "https://github.com/MicroCBer/BetterNCM"
    )), /* @__PURE__ */ h("p", null, "\u901A\u8FC7\u70B9\u51FB\u53F3\u4E0A\u89D2\u7684\u7F51\u6613\u4E91\u56FE\u6807\uFF08\u5728\u8BBE\u7F6E\u56FE\u6807\u7684\u53F3\u4FA7\uFF09\u53EF\u4EE5\u6253\u5F00\u63D2\u4EF6\u7BA1\u7406\u5668\uFF0C \u7136\u540E\u901A\u8FC7\u63D2\u4EF6\u7BA1\u7406\u5668\u914D\u5957\u7684\u63D2\u4EF6\u5546\u5E97\uFF0C\u5C31\u53EF\u4EE5\u5B89\u88C5\u4F60\u559C\u6B22\u7684\u63D2\u4EF6\u6765\u6269\u5C55\u7F51\u6613\u4E91\u7684\u529F\u80FD\u548C\u5916\u89C2\u54E6\uFF01"), /* @__PURE__ */ h("button", { onClick: () => props.onRequestClose() }, "\u5F00\u59CB\u4F7F\u7528 BetterNCM"));
  };

  // src/plugin-manager/index.tsx
  var OPENED_WARNINGS = "config.betterncm.manager.openedwarnings";
  async function initPluginManager() {
    const settingsView = document.createElement("section");
    const mainPageView = await betterncm_api_default.utils.waitForElement(
      "section.g-mn"
    );
    const settingsButton = await betterncm_api_default.utils.waitForElement(
      'a[href="#/m/setting/"]'
    );
    const betterNCMSettingsButton = settingsButton.cloneNode(
      true
    );
    betterNCMSettingsButton.href = "javascript:void(0)";
    betterNCMSettingsButton.title = "BetterNCM";
    if (localStorage.getItem(OPENED_WARNINGS) !== "true")
      betterNCMSettingsButton.classList.add("bncm-btn-twinkling");
    betterNCMSettingsButton.innerHTML = `<svg style='transform: scale(0.8);'><use xlink:href="orpheus://orpheus/style/res/svg/topbar.sp.svg#logo_white"></use></svg>`;
    mainPageView.parentElement.insertBefore(
      settingsView,
      mainPageView.nextElementSibling
    );
    settingsButton.parentElement.insertBefore(
      betterNCMSettingsButton,
      settingsButton.nextElementSibling
    );
    ReactDOM.render(/* @__PURE__ */ h(PluginManager, null), settingsView);
    settingsView.classList.add("better-ncm-manager");
    settingsView.classList.add("g-mn");
    function showSettings() {
      if (settingsView.parentElement !== mainPageView.parentElement) {
        mainPageView.parentElement.insertBefore(
          settingsView,
          mainPageView.nextElementSibling
        );
      }
      settingsView.classList.add("ncmm-show");
      mainPageView.setAttribute("style", "display: none !important;");
    }
    function hideSettings() {
      settingsView.classList.remove("ncmm-show");
      mainPageView.removeAttribute("style");
    }
    !(async () => {
      const lyricButton = await betterncm_api_default.utils.waitForElement(
        "div.cover.u-cover.u-cover-sm > a > span",
        1e3
      );
      lyricButton.addEventListener("click", hideSettings);
    })();
    settingsButton.addEventListener("click", hideSettings);
    betterNCMSettingsButton.addEventListener("click", () => {
      if (settingsView.classList.contains("ncmm-show")) {
        hideSettings();
      } else {
        showSettings();
      }
    });
    window.addEventListener("hashchange", hideSettings);
    new MutationObserver((rs) => {
      for (const r of rs) {
        if (r.attributeName === "style") {
          settingsView.style.left = mainPageView.style.left;
        }
      }
    }).observe(mainPageView, {
      attributes: true
    });
  }
  var onPluginLoaded = (_) => {
  };
  var PluginManager = () => {
    const [selectedPlugin, setSelectedPlugin] = React.useState(
      loadedPlugins["PluginMarket"]
    );
    const pluginConfigRef = React.useRef(null);
    const [loadedPluginsList, setLoadedPlugins] = React.useState([]);
    const [showStartupWarnings, setShowStartupWarnings] = React.useState(
      localStorage.getItem(OPENED_WARNINGS) !== "true"
    );
    const safeMode = React.useMemo(isSafeMode, void 0);
    React.useEffect(() => {
      function sortFunc(key1, key2) {
        const getSortValue = (key) => {
          const loadPlugin = loadedPlugins[key];
          const value = loadPlugin.haveConfigElement() ? 1 : 0;
          if (loadPlugin.manifest.name.startsWith("PluginMarket"))
            return Number.MAX_SAFE_INTEGER;
          return value;
        };
        return getSortValue(key2) - getSortValue(key1);
      }
      setLoadedPlugins(Object.keys(loadedPlugins).sort(sortFunc));
      onPluginLoaded = (loadedPlugins2) => {
        console.log("\u63D2\u4EF6\u52A0\u8F7D\u5B8C\u6210\uFF01");
        setLoadedPlugins(Object.keys(loadedPlugins2).sort(sortFunc));
      };
    }, []);
    React.useEffect(() => {
      const myDomElement = selectedPlugin?.injects.map((v) => v._getConfigElement()).filter((v) => v !== null) || [];
      if (myDomElement.length === 0) {
        const tipElement = document.createElement("div");
        tipElement.innerText = "\u8BE5\u63D2\u4EF6\u6CA1\u6709\u53EF\u7528\u7684\u8BBE\u7F6E\u9009\u9879";
        myDomElement.push(tipElement);
      }
      pluginConfigRef.current?.replaceChildren(...myDomElement);
    }, [selectedPlugin]);
    return /* @__PURE__ */ h("div", { className: "bncm-mgr" }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h(
      HeaderComponent,
      {
        onRequestOpenStartupWarnings: () => {
          setShowStartupWarnings(!showStartupWarnings);
        }
      }
    ), safeMode ? /* @__PURE__ */ h(SafeModeInfo, null) : showStartupWarnings ? /* @__PURE__ */ h(
      StartupWarning,
      {
        onRequestClose: () => {
          localStorage.setItem(OPENED_WARNINGS, "true");
          setShowStartupWarnings(false);
          document.querySelector(".bncm-btn-twinkling")?.classList.remove("bncm-btn-twinkling");
        }
      }
    ) : /* @__PURE__ */ h(
      "section",
      {
        style: {
          display: "flex",
          flexDirection: "row",
          flex: "1",
          marginBottom: "0"
        }
      },
      /* @__PURE__ */ h(
        "div",
        {
          className: "v-scroll loaded-plugins-list",
          style: {
            borderRight: "1px solid #8885"
          }
        },
        /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("div", null, loadedPluginsList.map((key) => {
          const loadPlugin = loadedPlugins[key];
          const haveConfig = loadPlugin.haveConfigElement();
          return (
            // rome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
            /* @__PURE__ */ h(
              "div",
              {
                className: haveConfig ? selectedPlugin?.manifest.slug === key ? "plugin-btn selected" : "plugin-btn" : "plugin-btn-disabled plugin-btn",
                "data-plugin-slug": key,
                onClick: () => {
                  if (haveConfig)
                    setSelectedPlugin(loadPlugin);
                }
              },
              /* @__PURE__ */ h("span", { className: "plugin-list-name" }, loadPlugin.manifest.name),
              !loadPlugin.pluginPath.includes("./plugins_dev") && loadPlugin.manifest.name !== "PluginMarket" && /* @__PURE__ */ h(
                "span",
                {
                  className: "plugin-uninstall-btn",
                  onClick: async (e2) => {
                    e2.stopPropagation();
                    const requireRestart = loadPlugin.manifest.require_restart || loadPlugin.manifest.native_plugin;
                    const pluginFilePath = await betterncm_api_default.fs.readFileText(
                      `${loadPlugin.pluginPath}/.plugin.path.meta`
                    );
                    if (pluginFilePath.length > 1) {
                      await betterncm_api_default.fs.remove(pluginFilePath);
                      if (requireRestart) {
                        betterncm_native.app.restart();
                      } else {
                        await betterncm_api_default.app.reloadPlugins();
                        betterncm_api_default.reload();
                      }
                    }
                  }
                },
                /* @__PURE__ */ h(
                  "svg",
                  {
                    xmlns: "http://www.w3.org/2000/svg",
                    width: 24,
                    height: 24,
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 2,
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    className: "feather feather-trash-2"
                  },
                  /* @__PURE__ */ h("polyline", { points: "3 6 5 6 21 6" }),
                  /* @__PURE__ */ h("path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }),
                  /* @__PURE__ */ h("line", { x1: 10, y1: 11, x2: 10, y2: 17 }),
                  /* @__PURE__ */ h("line", { x1: 14, y1: 11, x2: 14, y2: 17 })
                )
              )
            )
          );
        })))
      ),
      /* @__PURE__ */ h("div", { className: "v-scroll" }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h(
        "div",
        {
          style: {
            overflowY: "scroll",
            overflowX: "hidden",
            padding: "16px"
          },
          ref: pluginConfigRef
        }
      )))
    )));
  };

  // src/plugin.ts
  var NCMPlugin = class extends EventTarget {
    pluginPath = "";
    injects = [];
    manifest;
    finished = false;
    #haveConfigEle = null;
    devMode = false;
    constructor(manifest, pluginPath, devMode) {
      super();
      this.devMode = devMode;
      this.manifest = manifest;
      this.pluginPath = pluginPath;
      this.addEventListener("load", (evt) => {
        this.injects.forEach((inject) => {
          inject.dispatchEvent(evt);
        });
      });
      this.addEventListener("allpluginsloaded", (evt) => {
        this.injects.forEach((inject) => {
          inject.dispatchEvent(evt);
        });
      });
    }
    haveConfigElement() {
      if (this.#haveConfigEle == null)
        this.#haveConfigEle = this.injects.reduce(
          (previous, plugin) => previous ?? plugin._getConfigElement(),
          null
        ) !== null;
      return this.#haveConfigEle;
    }
  };
  var configToolBox;
  ((configToolBox2) => {
    function makeBtn(text, onClick, smaller = false, args = {}) {
      return dom("a", {
        class: ["u-ibtn5", smaller && "u-ibtnsz8"],
        style: { margin: ".2em .5em" },
        innerText: text,
        onclick: onClick,
        ...args
      });
    }
    configToolBox2.makeBtn = makeBtn;
    function makeCheckbox(args = {}) {
      return dom("input", { type: "checkbox", ...args });
    }
    configToolBox2.makeCheckbox = makeCheckbox;
    function makeInput(value, args = {}) {
      return dom("input", {
        value,
        style: { margin: ".2em .5em", borderRadius: ".5em" },
        class: ["u-txt", "sc-flag"],
        ...args
      });
    }
    configToolBox2.makeInput = makeInput;
  })(configToolBox || (configToolBox = {}));
  var NCMInjectPlugin = class extends EventTarget {
    constructor(mainPlugin, filePath) {
      super();
      this.filePath = filePath;
      this.mainPlugin = mainPlugin;
      this.manifest = mainPlugin.manifest;
      this.pluginPath = mainPlugin.pluginPath;
    }
    pluginPath = "";
    manifest;
    configViewElement = null;
    mainPlugin;
    loadError = null;
    finished = false;
    onLoad(fn) {
      this.addEventListener("load", (evt) => {
        try {
          fn.call(this, evt.detail, evt);
        } catch (e2) {
          this.loadError = e2;
        }
      });
    }
    // rome-ignore lint/suspicious/noExplicitAny: TODO: 工具类参数
    onConfig(fn) {
      this.addEventListener("config", (evt) => {
        this.configViewElement = fn.call(this, evt.detail);
      });
    }
    onAllPluginsLoaded(fn) {
      this.addEventListener("allpluginsloaded", function(evt) {
        fn.call(this, evt.detail, evt);
      });
    }
    getConfig(key, defaultValue) {
      try {
        const config = JSON.parse(
          localStorage.getItem(`config.betterncm.${this.manifest.slug}`) || "{}"
        );
        if (config[key] !== void 0)
          return config[key];
      } catch {
      }
      return defaultValue;
    }
    setConfig(key, value) {
      let config = JSON.parse(
        localStorage.getItem(`config.betterncm.${this.manifest.slug}`) || "{}"
      );
      if (!config || typeof config !== "object") {
        config = /* @__PURE__ */ Object.create(null);
      }
      config[key] = value;
      localStorage[`config.betterncm.${this.manifest.slug}`] = JSON.stringify(config);
    }
    _getConfigElement() {
      if (!this.configViewElement)
        this.dispatchEvent(new CustomEvent("config", { detail: configToolBox }));
      return this.configViewElement;
    }
  };

  // src/loader.ts
  var loadedPlugins = {};
  var SAFE_MODE_KEY = "betterncm.safemode";
  var LOAD_ERROR_KEY = "betterncm.loaderror";
  var CPP_SIDE_INJECT_DISABLE_KEY = "cc.microblock.betterncm.cpp_side_inject_feature_disabled";
  async function disableSafeMode() {
    await betterncm_api_default.app.writeConfig(CPP_SIDE_INJECT_DISABLE_KEY, "false");
    localStorage.removeItem(SAFE_MODE_KEY);
    localStorage.removeItem(LOAD_ERROR_KEY);
  }
  async function enableSafeMode() {
    await betterncm_api_default.app.writeConfig(CPP_SIDE_INJECT_DISABLE_KEY, "true");
    localStorage.setItem(SAFE_MODE_KEY, "true");
  }
  var PluginLoadError = class extends Error {
    constructor(pluginPath, rawError, message, options) {
      super(message, options);
      this.pluginPath = pluginPath;
      this.rawError = rawError;
    }
    toString() {
      return `\u63D2\u4EF6 ${this.pluginPath} \u52A0\u8F7D\u51FA\u9519: ${this.rawError}`;
    }
  };
  var DependencyResolveError = class extends Error {
    constructor(message, options) {
      super(message, options);
    }
    toString() {
      return `\u63D2\u4EF6\u4F9D\u8D56\u89E3\u6790\u51FA\u9519: ${this}`;
    }
  };
  var isSafeMode = () => localStorage.getItem(SAFE_MODE_KEY) === "true";
  var getLoadError = () => localStorage.getItem(LOAD_ERROR_KEY) || "";
  function sortPlugins(plugins) {
    class Graph {
      adjacencyList = {};
      constructor() {
      }
      addVertex(vertex) {
        if (!this.adjacencyList[vertex]) {
          this.adjacencyList[vertex] = [];
        }
      }
      addEdge(v1, v2) {
        this.adjacencyList[v1].push(v2);
      }
    }
    const graph = new Graph();
    for (const plugin of plugins)
      graph.addVertex(plugin.manifest.slug);
    for (const plugin of plugins) {
      if (plugin.manifest.loadBefore)
        plugin.manifest.loadBefore.forEach(
          (dep) => graph.addEdge(dep, plugin.manifest.slug)
        );
      if (plugin.manifest.loadAfter)
        plugin.manifest.loadAfter.forEach(
          (dep) => graph.addEdge(plugin.manifest.slug, dep)
        );
    }
    function dfsTopSortHelper(v, n2, visited2, topNums2) {
      visited2[v] = true;
      if (!(v in graph.adjacencyList))
        throw new DependencyResolveError(`\u627E\u4E0D\u5230\u63D2\u4EF6 ${v}`);
      const neighbors = graph.adjacencyList[v];
      for (const neighbor of neighbors) {
        if (!visited2[neighbor]) {
          n2 = dfsTopSortHelper(neighbor, n2, visited2, topNums2);
        }
      }
      topNums2[v] = n2;
      return n2 - 1;
    }
    const vertices = Object.keys(graph.adjacencyList);
    const visited = {};
    const topNums = {};
    let n = vertices.length - 1;
    for (const v of vertices) {
      if (!visited[v]) {
        n = dfsTopSortHelper(v, n, visited, topNums);
      }
    }
    return Object.keys(topNums).map(
      (slug) => plugins.find((plugin) => plugin.manifest.slug === slug)
    );
  }
  async function loadPlugins() {
    if (isSafeMode()) {
      window.loadedPlugins = loadedPlugins;
      return;
    }
    const debouncedReload = betterncm_api_default.utils.debounce(betterncm_api_default.reload, 1e3);
    const AsyncFunction = async function() {
    }.constructor;
    const pageMap = {
      "/pub/app.html": "Main"
    };
    const pageName = pageMap[location.pathname];
    async function loadPlugin(mainPlugin) {
      const devMode = mainPlugin.devMode;
      const manifest = mainPlugin.manifest;
      const pluginPath = mainPlugin.pluginPath;
      if (devMode && !manifest.noDevReload) {
        betterncm_native.fs.watchDirectory(pluginPath, (_dir, path) => {
          const RELOAD_EXTS = [".js", "manifest.json"];
          if (RELOAD_EXTS.findIndex((ext) => path.endsWith(ext)) !== -1) {
            console.warn(
              "\u5F00\u53D1\u63D2\u4EF6",
              manifest.name,
              "\u6587\u4EF6",
              path,
              "\u53D1\u751F\u66F4\u65B0\uFF0C\u5373\u5C06\u91CD\u8F7D\uFF01"
            );
            debouncedReload();
          }
        });
      }
      async function loadInject(filePath) {
        if (!manifest.slug)
          return;
        const code = await betterncm_api_default.fs.readFileText(filePath);
        if (filePath.endsWith(".js")) {
          const plugin = new NCMInjectPlugin(mainPlugin, filePath);
          const pluginFunction = new Function("plugin", `return (async function ${filePath.replaceAll("-", "_").replaceAll(/[^a-zA-Z0-9_$]/g, "")}(){${code}})();`);
          Object.defineProperty(pluginFunction, "name", {
            value: filePath,
            configurable: true
          });
          console.log(pluginFunction);
          const loadingPromise = pluginFunction.call(
            loadedPlugins[manifest.slug],
            plugin
          );
          await loadingPromise;
          plugin.dispatchEvent(
            new CustomEvent("load", {
              detail: plugin
            })
          );
          if (plugin.loadError) {
            throw new PluginLoadError(
              filePath,
              plugin.loadError,
              `\u63D2\u4EF6\u811A\u672C ${filePath} \u52A0\u8F7D\u51FA\u9519: ${plugin.loadError.stack || plugin.loadError}`,
              {
                cause: plugin.loadError
              }
            );
          }
          plugin.finished = true;
          loadedPlugins[manifest.slug].injects.push(plugin);
        }
      }
      if (manifest.injects[pageName]) {
        for (const inject of manifest.injects[pageName]) {
          await loadInject(`${pluginPath}/${inject.file}`);
        }
      }
      if (manifest.injects[location.pathname]) {
        for (const inject of manifest.injects[location.pathname]) {
          await loadInject(`${pluginPath}/${inject.file}`);
        }
      }
      mainPlugin.finished = true;
    }
    window.loadedPlugins = loadedPlugins;
    const pluginPaths = await betterncm_api_default.fs.readDir("./plugins_runtime");
    let plugins = [];
    const loadPluginByPath = async (path, devMode) => {
      try {
        const manifest = JSON.parse(
          await betterncm_api_default.fs.readFileText(`${path}/manifest.json`)
        );
        manifest.slug = manifest.slug ?? manifest.name.replace(/[^a-zA-Z0-9 ]/g, "").replace(/ /g, "-");
        const mainPlugin = new NCMPlugin(manifest, path, devMode);
        plugins.push(mainPlugin);
      } catch (e2) {
        if (e2 instanceof SyntaxError)
          console.error("Failed to load plugin:", e2);
        else
          throw e2;
      }
    };
    plugins = sortPlugins(plugins);
    const loadThreads = [];
    for (const path of pluginPaths)
      loadThreads.push(loadPluginByPath(path, false));
    if (betterncm_native.fs.exists("./plugins_dev")) {
      const devPluginPaths = await betterncm_api_default.fs.readDir("./plugins_dev");
      for (const path of devPluginPaths)
        await loadPluginByPath(path, true);
    }
    await Promise.all(loadThreads);
    for (const plugin of plugins) {
      if (!(plugin.manifest.slug in loadedPlugins)) {
        loadedPlugins[plugin.manifest.slug] = plugin;
        console.log("\u6B63\u5728\u52A0\u8F7D\u63D2\u4EF6", plugin.manifest.slug);
        await loadPlugin(plugin);
      } else {
        console.warn(
          plugin.manifest.slug,
          "duplicated, the plugin at",
          plugin.pluginPath,
          "wont be loaded."
        );
      }
    }
    for (const name in loadedPlugins) {
      const plugin = loadedPlugins[name];
      plugin.injects.forEach((inject) => {
        inject.dispatchEvent(
          new CustomEvent("allpluginsloaded", { detail: loadedPlugins })
        );
        if (inject.loadError) {
          throw new PluginLoadError(
            inject.filePath,
            inject.loadError,
            `\u63D2\u4EF6\u811A\u672C ${inject.filePath} \u52A0\u8F7D\u51FA\u9519: ${inject.loadError.stack || inject.loadError}`,
            {
              cause: inject.loadError
            }
          );
        }
      });
    }
  }
  async function onLoadError(e2) {
    const ATTEMPTS_KEY = "cc.microblock.loader.reloadPluginAttempts";
    const attempts = parseInt(await betterncm_api_default.app.readConfig(ATTEMPTS_KEY, "0"));
    const pastError = localStorage.getItem(LOAD_ERROR_KEY) || "";
    localStorage.setItem(
      LOAD_ERROR_KEY,
      `${pastError}\u7B2C ${attempts + 1} \u6B21\u52A0\u8F7D\u53D1\u751F\u9519\u8BEF\uFF1A
${e2.stack || e2}

`
    );
    if (attempts < 2) {
      await betterncm_api_default.app.writeConfig(ATTEMPTS_KEY, String(attempts + 1));
    } else {
      await enableSafeMode();
      await betterncm_api_default.app.writeConfig(ATTEMPTS_KEY, "0");
    }
    location.reload();
  }
  window.addEventListener("DOMContentLoaded", async () => {
    const styleContent = betterncm_native.internal.getFrameworkCSS();
    const styleEl = document.createElement("style");
    styleEl.innerHTML = styleContent;
    document.head.appendChild(styleEl);
    if (await betterncm_api_default.app.readConfig(CPP_SIDE_INJECT_DISABLE_KEY, "false") === "false") {
      localStorage.setItem(SAFE_MODE_KEY, "false");
    } else {
      localStorage.setItem(SAFE_MODE_KEY, "true");
    }
    try {
      await Promise.race([
        Promise.all([loadPlugins(), initPluginManager()]),
        betterncm_api_default.utils.delay(2e3)
      ]);
    } catch (e2) {
      onLoadError(e2);
      return;
    }
    const loadingMask = document.getElementById("loadingMask");
    if (loadingMask) {
      const anim = loadingMask.animate(
        [{ opacity: 1 }, { opacity: 0, display: "none" }],
        {
          duration: 300,
          fill: "forwards",
          easing: "cubic-bezier(0.42,0,0.58,1)"
        }
      );
      anim.commitStyles();
    }
    onPluginLoaded(loadedPlugins);
  });
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vYmV0dGVybmNtLWpzLWZyYW1ld29yay9zcmMvYmV0dGVybmNtLWFwaS91dGlscy50cyIsICIuLi8uLi9iZXR0ZXJuY20tanMtZnJhbWV3b3JrL3NyYy9iZXR0ZXJuY20tYXBpL3JlYWN0LnRzIiwgIi4uLy4uL2JldHRlcm5jbS1qcy1mcmFtZXdvcmsvc3JjL2JldHRlcm5jbS1hcGkvZnMudHMiLCAiLi4vLi4vYmV0dGVybmNtLWpzLWZyYW1ld29yay9zcmMvYmV0dGVybmNtLWFwaS9iYXNlLnRzIiwgIi4uLy4uL2JldHRlcm5jbS1qcy1mcmFtZXdvcmsvc3JjL2JldHRlcm5jbS1hcGkvYXBwLnRzIiwgIi4uLy4uL2JldHRlcm5jbS1qcy1mcmFtZXdvcmsvc3JjL2JldHRlcm5jbS1hcGkvbmNtLnRzIiwgIi4uLy4uL2JldHRlcm5jbS1qcy1mcmFtZXdvcmsvc3JjL2JldHRlcm5jbS1hcGkvdGVzdHMudHMiLCAiLi4vLi4vYmV0dGVybmNtLWpzLWZyYW1ld29yay9zcmMvYmV0dGVybmNtLWFwaS9pbmRleC50cyIsICIuLi8uLi9iZXR0ZXJuY20tanMtZnJhbWV3b3JrL3NyYy9wbHVnaW4tbWFuYWdlci9jb21wb25lbnRzL2J1dHRvbi50c3giLCAiLi4vLi4vYmV0dGVybmNtLWpzLWZyYW1ld29yay9zcmMvcGx1Z2luLW1hbmFnZXIvY29tcG9uZW50cy9wcm9ncmVzcy1yaW5nLnRzeCIsICIuLi8uLi9iZXR0ZXJuY20tanMtZnJhbWV3b3JrL3NyYy9wbHVnaW4tbWFuYWdlci9jb21wb25lbnRzL2hlYWRlci50c3giLCAiLi4vLi4vYmV0dGVybmNtLWpzLWZyYW1ld29yay9zcmMvcGx1Z2luLW1hbmFnZXIvY29tcG9uZW50cy9zYWZlLW1vZGUtaW5mby50c3giLCAiLi4vLi4vYmV0dGVybmNtLWpzLWZyYW1ld29yay9zcmMvcGx1Z2luLW1hbmFnZXIvY29tcG9uZW50cy93YXJuaW5nLnRzeCIsICIuLi8uLi9iZXR0ZXJuY20tanMtZnJhbWV3b3JrL3NyYy9wbHVnaW4tbWFuYWdlci9pbmRleC50c3giLCAiLi4vLi4vYmV0dGVybmNtLWpzLWZyYW1ld29yay9zcmMvcGx1Z2luLnRzIiwgIi4uLy4uL2JldHRlcm5jbS1qcy1mcmFtZXdvcmsvc3JjL2xvYWRlci50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiZXhwb3J0IG5hbWVzcGFjZSB1dGlscyB7XG5cdHR5cGUgU2VsZWN0b3IgPVxuXHRcdHwga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwXG5cdFx0fCBrZXlvZiBTVkdFbGVtZW50VGFnTmFtZU1hcFxuXHRcdHwgc3RyaW5nO1xuXHRleHBvcnQgZnVuY3Rpb24gd2FpdEZvckVsZW1lbnQ8SyBleHRlbmRzIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcD4oXG5cdFx0c2VsZWN0b3I6IEssXG5cdFx0aW50ZXJ2YWw/OiBudW1iZXIsXG5cdCk6IFByb21pc2U8SFRNTEVsZW1lbnRUYWdOYW1lTWFwW0tdIHwgbnVsbD47XG5cdGV4cG9ydCBmdW5jdGlvbiB3YWl0Rm9yRWxlbWVudDxLIGV4dGVuZHMga2V5b2YgU1ZHRWxlbWVudFRhZ05hbWVNYXA+KFxuXHRcdHNlbGVjdG9yOiBLLFxuXHRcdGludGVydmFsPzogbnVtYmVyLFxuXHQpOiBQcm9taXNlPFNWR0VsZW1lbnRUYWdOYW1lTWFwW0tdIHwgbnVsbD47XG5cdGV4cG9ydCBmdW5jdGlvbiB3YWl0Rm9yRWxlbWVudDxFIGV4dGVuZHMgRWxlbWVudCA9IEVsZW1lbnQ+KFxuXHRcdHNlbGVjdG9yOiBzdHJpbmcsXG5cdFx0aW50ZXJ2YWw/OiBudW1iZXIsXG5cdCk6IFByb21pc2U8RSB8IG51bGw+O1xuXHRleHBvcnQgZnVuY3Rpb24gd2FpdEZvckVsZW1lbnQoc2VsZWN0b3I6IFNlbGVjdG9yLCBpbnRlcnZhbCA9IDEwMCkge1xuXHRcdHJldHVybiB3YWl0Rm9yRnVuY3Rpb24oKCkgPT4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvciksIGludGVydmFsKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBcdTVDMDZcdTYzMDdcdTVCOUFcdTc2ODRcdTUxRkRcdTY1NzBcdTUwNUFcdTk2MzJcdTYyOTZcdTU5MDRcdTc0MDZcblx0ICogQHBhcmFtIGNhbGxiYWNrIFx1OTcwMFx1ODk4MVx1ODhBQlx1OEMwM1x1NzUyOFx1NzY4NFx1NTZERVx1OEMwM1x1NTFGRFx1NjU3MFxuXHQgKiBAcGFyYW0gd2FpdFRpbWUgXHU5NzAwXHU4OTgxXHU3QjQ5XHU1Rjg1XHU1OTFBXHU5NTdGXHU2NUY2XHU5NUY0XHVGRjBDXHU1MzU1XHU0RjREXHU2QkVCXHU3OUQyXG5cdCAqIEByZXR1cm5zIFx1NTMwNVx1ODhDNVx1NTQwRVx1NzY4NFx1OTYzMlx1NjI5Nlx1NTFGRFx1NjU3MFxuXHQgKi9cblx0ZXhwb3J0IGZ1bmN0aW9uIGRlYm91bmNlPFQgZXh0ZW5kcyBGdW5jdGlvbj4oXG5cdFx0Y2FsbGJhY2s6IFQsXG5cdFx0d2FpdFRpbWU6IG51bWJlcixcblx0KTogVCB7XG5cdFx0bGV0IHRpbWVyID0gMDtcblx0XHRyZXR1cm4gZnVuY3Rpb24gZGVib3VuY2VDbG9zdXJlKCkge1xuXHRcdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0XHQvLyByb21lLWlnbm9yZSBsaW50L3N0eWxlL25vQXJndW1lbnRzOiBcdTk2MzJcdTYyOTZcdTUxRkRcdTY1NzBcblx0XHRcdGNvbnN0IGFyZ3MgPSBhcmd1bWVudHM7XG5cdFx0XHRpZiAodGltZXIpIHtcblx0XHRcdFx0Y2xlYXJUaW1lb3V0KHRpbWVyKTtcblx0XHRcdH1cblx0XHRcdHRpbWVyID0gc2V0VGltZW91dChjYWxsYmFjay5iaW5kKHNlbGYsIGFyZ3MpLCB3YWl0VGltZSk7XG5cdFx0fSBhcyB1bmtub3duIGFzIFQ7XG5cdH1cblxuXHQvKipcblx0ICogXHU5MUNEXHU1OTBEXHU4QzAzXHU3NTI4XHU2N0QwXHU1MUZEXHU2NTcwXHVGRjBDXHU3NkY0XHU1MjMwXHU1MTc2XHU4RkQ0XHU1NkRFXHU0RUZCXHU2MTBGXHU3NzFGXHU1MDNDXHVGRjBDXHU1RTc2XHU4RkQ0XHU1NkRFXHU4QkU1XHU3NzFGXHU1MDNDXHUzMDAyXG5cdCAqIEBwYXJhbSBmdW5jIFx1NTFGRFx1NjU3MFxuXHQgKiBAcGFyYW0gaW50ZXJ2YWwgXHU5MUNEXHU1OTBEXHU4QzAzXHU3NTI4XHU2NUY2XHU5NUY0XHU5NUY0XHU5Njk0XG5cdCAqIEByZXR1cm5zIGBmdW5jYCBcdTUxRkRcdTY1NzBcdTc2ODRcdThGRDRcdTU2REVcdTUwM0Ncblx0ICovXG5cdGV4cG9ydCBmdW5jdGlvbiB3YWl0Rm9yRnVuY3Rpb248VD4oXG5cdFx0ZnVuYzogKCkgPT4gVCxcblx0XHRpbnRlcnZhbCA9IDEwMCxcblx0KTogUHJvbWlzZTxUPiB7XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChycykgPT4ge1xuXHRcdFx0Y29uc3QgaGFuZGxlID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuXHRcdFx0XHRjb25zdCByZXN1bHQgPSBmdW5jKCk7XG5cdFx0XHRcdGlmIChyZXN1bHQpIHtcblx0XHRcdFx0XHRjbGVhckludGVydmFsKGhhbmRsZSk7XG5cdFx0XHRcdFx0cnMocmVzdWx0KTtcblx0XHRcdFx0fVxuXHRcdFx0fSwgaW50ZXJ2YWwpO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFx1NTIxQlx1NUVGQVx1NEUwMFx1NEUyQVx1NUMwNlx1NTcyOFx1NEUwMFx1NUI5QVx1NjVGNlx1OTVGNFx1NTQwRSByZXNvbHZlIFx1NzY4NCBQcm9taXNlXG5cdCAqIEBwYXJhbSBtcyBcdTVFRjZcdThGREZcdTY1RjZcdTk1RjRcdUZGMENcdTRFRTVcdTZCRUJcdTc5RDJcdTRFM0FcdTUzNTVcdTRGNERcdTMwMDJcblx0ICogQHJldHVybnMgXHU1QzA2XHU1NzI4bXNcdTZCRUJcdTc5RDJcdTU0MEVyZXNvbHZlXHU3Njg0XHU0RTAwXHU0RTJBUHJvbWlzZVxuXHQgKi9cblx0ZXhwb3J0IGZ1bmN0aW9uIGRlbGF5KG1zOiBudW1iZXIpIHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJzKSA9PiBzZXRUaW1lb3V0KHJzLCBtcykpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFx1N0I4MFx1NjYxM1x1NzY4NFx1NTIxQlx1NUVGQVx1NEUwMFx1NEUyQVx1NTE0M1x1N0QyMFx1NzY4NFx1NTFGRFx1NjU3MFxuXHQgKiBAZGVwcmVjYXRlZCBcdTY1RTlcdTY3MUZcdTY3MkFcdTRGN0ZcdTc1MjggUmVhY3QgXHU2NUY2XHU1MTk5XHU3Njg0XHU4Rjg1XHU1MkE5XHU1MUZEXHU2NTcwXHVGRjBDXHU1REYyXHU1RjAzXHU3NTI4XHVGRjBDXHU4QkY3XHU4MDAzXHU4NjUxXHU0RjdGXHU3NTI4XHU4MUVBXHU1RTI2XHU3Njg0IFJlYWN0IFx1Njc4NFx1NUVGQVx1NTkwRFx1Njc0Mlx1OTg3NVx1OTc2Mlx1MzAwMlxuXHQgKiBAcGFyYW0gdGFnIFx1NTE0M1x1N0QyMFx1N0M3Qlx1NTc4QlxuXHQgKiBAcGFyYW0gc2V0dGluZ3MgXHU1MTQzXHU3RDIwXHU3Njg0XHU1QzVFXHU2MDI3XHU5NTJFXHU1MDNDXHU1QkY5XG5cdCAqIEBwYXJhbSBjaGlsZHJlbiBcdTUxNDNcdTdEMjBcdTc2ODRcdTVCNTBcdTUxNDNcdTdEMjBcdUZGMENcdTYzMDlcdTk4N0FcdTVFOEZcdTZERkJcdTUyQTBcblx0ICogQHJldHVybnNcblx0ICovXG5cdC8vIHJvbWUtaWdub3JlIGxpbnQvc3VzcGljaW91cy9ub0V4cGxpY2l0QW55OiBcdTVDNUVcdTYwMjdcdTk2OEZcdTYxMEZcblx0ZXhwb3J0IGZ1bmN0aW9uIGRvbSh0YWc6IHN0cmluZywgc2V0dGluZ3M6IGFueSwgLi4uY2hpbGRyZW46IEhUTUxFbGVtZW50W10pIHtcblx0XHRjb25zdCB0bXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZyk7XG5cdFx0aWYgKHNldHRpbmdzLmNsYXNzKSB7XG5cdFx0XHRmb3IgKGNvbnN0IGNsIG9mIHNldHRpbmdzLmNsYXNzKSB7XG5cdFx0XHRcdHRtcC5jbGFzc0xpc3QuYWRkKGNsKTtcblx0XHRcdH1cblx0XHRcdHNldHRpbmdzLmNsYXNzID0gdW5kZWZpbmVkO1xuXHRcdH1cblxuXHRcdGlmIChzZXR0aW5ncy5zdHlsZSkge1xuXHRcdFx0Zm9yIChjb25zdCBjbCBpbiBzZXR0aW5ncy5zdHlsZSkge1xuXHRcdFx0XHR0bXAuc3R5bGVbY2xdID0gc2V0dGluZ3Muc3R5bGVbY2xdO1xuXHRcdFx0fVxuXHRcdFx0c2V0dGluZ3Muc3R5bGUgPSB1bmRlZmluZWQ7XG5cdFx0fVxuXG5cdFx0Zm9yIChjb25zdCB2IGluIHNldHRpbmdzKSB7XG5cdFx0XHRpZiAoc2V0dGluZ3Nbdl0pIHRtcFt2XSA9IHNldHRpbmdzW3ZdO1xuXHRcdH1cblxuXHRcdGZvciAoY29uc3QgY2hpbGQgb2YgY2hpbGRyZW4pIHtcblx0XHRcdGlmIChjaGlsZCkgdG1wLmFwcGVuZENoaWxkKGNoaWxkKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRtcDtcblx0fVxufVxuIiwgImltcG9ydCB7IHV0aWxzIH0gZnJvbSBcIi4vdXRpbHNcIjtcblxuZnVuY3Rpb24gaW5pdE5DTVJlYWN0KCkge1xuXHRpZiAoXCJSZWFjdFwiIGluIHdpbmRvdykge1xuXHRcdGlmIChcImNyZWF0ZUVsZW1lbnRcIiBpbiBSZWFjdCAmJiBcIkZyYWdtZW50XCIgaW4gUmVhY3QpIHtcblx0XHRcdHdpbmRvdy5oID0gUmVhY3QuY3JlYXRlRWxlbWVudDtcblx0XHRcdHdpbmRvdy5mID0gUmVhY3QuRnJhZ21lbnQ7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIFwiaFwiIGluIHdpbmRvdyAmJiBcImZcIiBpbiB3aW5kb3c7XG59XG5cbnV0aWxzLndhaXRGb3JGdW5jdGlvbihpbml0TkNNUmVhY3QsIDEwMCk7XG4iLCAiaW1wb3J0IHsgYmV0dGVybmNtRmV0Y2ggfSBmcm9tIFwiLi9iYXNlXCI7XG5cbmNvbnN0IGUgPSBlbmNvZGVVUklDb21wb25lbnQ7XG5cbi8qKlxuICogXHU1NDhDXHU1OTE2XHU3NTRDXHU3Njg0XHU2NTg3XHU0RUY2XHU3Q0ZCXHU3RURGXHU4RkRCXHU4ODRDXHU0RUE0XHU0RTkyXHU3Njg0XHU2M0E1XHU1M0UzXG4gKi9cbmV4cG9ydCBuYW1lc3BhY2UgZnMge1xuXHQvKipcblx0ICogXHU1RjAyXHU2QjY1XHU4QkZCXHU1M0Q2XHU2MzA3XHU1QjlBXHU2NTg3XHU0RUY2XHU1OTM5XHU4REVGXHU1Rjg0XHU0RTBCXHU3Njg0XHU2MjQwXHU2NzA5XHU2NTg3XHU0RUY2XHU1NDhDXHU2NTg3XHU0RUY2XHU1OTM5XG5cdCAqIEBwYXJhbSBmb2xkZXJQYXRoIFx1OTcwMFx1ODk4MVx1OEJGQlx1NTNENlx1NzY4NFx1NjU4N1x1NEVGNlx1NTkzOVx1OERFRlx1NUY4NFxuXHQgKiBAcmV0dXJucyBcdTYyNDBcdTY3MDlcdTY1ODdcdTRFRjZcdTU0OENcdTY1ODdcdTRFRjZcdTU5MzlcdTc2ODRcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdTYyMTZcdTdFRERcdTVCRjlcdThERUZcdTVGODRcblx0ICovXG5cdGV4cG9ydCBmdW5jdGlvbiByZWFkRGlyKGZvbGRlclBhdGg6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nW10+IHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0YmV0dGVybmNtX25hdGl2ZS5mcy5yZWFkRGlyKGZvbGRlclBhdGgsIHJlc29sdmUsIHJlamVjdCk7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogXHU4QkZCXHU1M0Q2XHU2NTg3XHU2NzJDXHU2NTg3XHU0RUY2XHVGRjBDXHU1MkExXHU1RkM1XHU0RkREXHU4QkMxXHU2NTg3XHU0RUY2XHU3RjE2XHU3ODAxXHU2NjJGIFVURi04XG5cdCAqIEBwYXJhbSBmaWxlUGF0aCBcdTk3MDBcdTg5ODFcdThCRkJcdTUzRDZcdTc2ODRcdTY1ODdcdTRFRjZcdThERUZcdTVGODRcblx0ICogQHJldHVybnMgXHU1QkY5XHU1RTk0XHU2NTg3XHU0RUY2XHU3Njg0XHU2NTg3XHU2NzJDXHU1RjYyXHU1RjBGXG5cdCAqL1xuXHRleHBvcnQgZnVuY3Rpb24gcmVhZEZpbGVUZXh0KGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHRiZXR0ZXJuY21fbmF0aXZlLmZzLnJlYWRGaWxlVGV4dChmaWxlUGF0aCwgcmVzb2x2ZSwgcmVqZWN0KTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBcdThCRkJcdTUzRDZcdTY1ODdcdTRFRjZcblx0ICogQHBhcmFtIGZpbGVQYXRoIFx1OTcwMFx1ODk4MVx1OEJGQlx1NTNENlx1NzY4NFx1NjU4N1x1NEVGNlx1OERFRlx1NUY4NFxuXHQgKiBAcmV0dXJucyBibG9iXG5cdCAqL1xuXHRleHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVhZEZpbGUoZmlsZVBhdGg6IHN0cmluZyk6IFByb21pc2U8QmxvYj4ge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHRiZXR0ZXJuY21fbmF0aXZlLmZzLnJlYWRGaWxlKGZpbGVQYXRoLCByZXNvbHZlLCByZWplY3QpO1xuXHRcdH0pLnRoZW4oKHY6IG51bWJlcltdKSA9PiB7XG5cdFx0XHRjb25zdCBkYXRhID0gbmV3IFVpbnQ4QXJyYXkodik7XG5cdFx0XHRjb25zdCBibG9iID0gbmV3IEJsb2IoW2RhdGFdKTtcblx0XHRcdHJldHVybiBibG9iO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFx1NjMwMlx1OEY3RFx1OERFRlx1NUY4NFxuXHQgKiBAcGFyYW0gZmlsZVBhdGggXHU5NzAwXHU4OTgxXHU2MzAyXHU4RjdEXHU3Njg0XHU2NTg3XHU0RUY2XHU1OTM5XHU4REVGXHU1Rjg0XG5cdCAqIEByZXR1cm5zIFx1NjMwMlx1OEY3RFx1NTIzMFx1NzY4NCBodHRwIFx1NTczMFx1NTc0MFxuXHQgKi9cblx0ZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1vdW50RGlyKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoXCJcdTY3MkFcdTVCOUVcdTczQjBcIik7XG5cdH1cblxuXHQvKipcblx0ICogXHU2MzAyXHU4RjdEXHU4REVGXHU1Rjg0XG5cdCAqIEBwYXJhbSBmaWxlUGF0aCBcdTk3MDBcdTg5ODFcdTYzMDJcdThGN0RcdTc2ODRcdTY1ODdcdTRFRjZcdThERUZcdTVGODRcblx0ICogQHJldHVybnMgXHU2MzAyXHU4RjdEXHU1MjMwXHU3Njg0IGh0dHAgXHU1NzMwXHU1NzQwXG5cdCAqL1xuXHRleHBvcnQgYXN5bmMgZnVuY3Rpb24gbW91bnRGaWxlKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoXCJcdTY3MkFcdTVCOUVcdTczQjBcIik7XG5cdH1cblxuXHQvKipcblx0ICogXHU4OUUzXHU1MzhCXHU2MzA3XHU1QjlBXHU3Njg0IFpJUCBcdTUzOEJcdTdGMjlcdTY1ODdcdTRFRjZcdTUyMzBcdTRFMDBcdTRFMkFcdTYzMDdcdTVCOUFcdTc2ODRcdTY1ODdcdTRFRjZcdTU5MzlcdTRFMkRcblx0ICogQHBhcmFtIHppcFBhdGggXHU5NzAwXHU4OTgxXHU4OUUzXHU1MzhCXHU3Njg0IFpJUCBcdTUzOEJcdTdGMjlcdTY1ODdcdTRFRjZcdThERUZcdTVGODRcblx0ICogQHBhcmFtIHVuemlwRGVzdCBcdTk3MDBcdTg5ODFcdTg5RTNcdTUzOEJcdTUyMzBcdTc2ODRcdTY1ODdcdTRFRjZcdTU5MzlcdThERUZcdTVGODRcdUZGMENcdTU5ODJcdTY3OUNcdTRFMERcdTVCNThcdTU3MjhcdTUyMTlcdTRGMUFcdTUyMUJcdTVFRkFcdUZGMENcdTU5ODJcdTY3OUNcdTg5RTNcdTUzOEJcdTY1RjZcdTY3MDlcdTY1ODdcdTRFRjZcdTVCNThcdTU3MjhcdTUyMTlcdTRGMUFcdTg4QUJcdTg5ODZcdTc2RDZcblx0ICogQHJldHVybnMgXHU4RkQ0XHU1NkRFXHU1MDNDXHVGRjBDXHU2NjJGXHU1NDI2XHU2MjEwXHU1MjlGXG5cdCAqL1xuXHRleHBvcnQgYXN5bmMgZnVuY3Rpb24gdW56aXAoXG5cdFx0emlwUGF0aDogc3RyaW5nLFxuXHRcdHVuemlwRGVzdDogc3RyaW5nID0gYCR7emlwUGF0aH1fZXh0cmFjdGVkL2AsXG5cdCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoXCJcdTY3MkFcdTVCOUVcdTczQjBcIik7XG5cdH1cblxuXHQvKipcblx0ICogXHU1QzA2XHU2NTg3XHU2NzJDXHU1MTk5XHU1MTY1XHU1MjMwXHU2MzA3XHU1QjlBXHU2NTg3XHU0RUY2XHU1MTg1XG5cdCAqIEBwYXJhbSBmaWxlUGF0aCBcdTk3MDBcdTg5ODFcdTUxOTlcdTUxNjVcdTc2ODRcdTY1ODdcdTRFRjZcdThERUZcdTVGODRcblx0ICogQHBhcmFtIGNvbnRlbnQgXHU5NzAwXHU4OTgxXHU1MTk5XHU1MTY1XHU3Njg0XHU2NTg3XHU0RUY2XHU1MTg1XHU1QkI5XG5cdCAqIEByZXR1cm5zIFx1NjYyRlx1NTQyNlx1NjIxMFx1NTI5RlxuXHQgKi9cblx0ZXhwb3J0IGZ1bmN0aW9uIHdyaXRlRmlsZVRleHQoXG5cdFx0ZmlsZVBhdGg6IHN0cmluZyxcblx0XHRjb250ZW50OiBzdHJpbmcsXG5cdCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHRiZXR0ZXJuY21fbmF0aXZlLmZzLndyaXRlRmlsZVRleHQoZmlsZVBhdGgsIGNvbnRlbnQsIHJlc29sdmUsIHJlamVjdCk7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogXHU1QzA2XHU2NTg3XHU2NzJDXHU2MjE2XHU0RThDXHU4RkRCXHU1MjM2XHU2NTcwXHU2MzZFXHU1MTk5XHU1MTY1XHU1MjMwXHU2MzA3XHU1QjlBXHU2NTg3XHU0RUY2XHU1MTg1XG5cdCAqIEBwYXJhbSBmaWxlUGF0aCBcdTk3MDBcdTg5ODFcdTUxOTlcdTUxNjVcdTc2ODRcdTY1ODdcdTRFRjZcdThERUZcdTVGODRcblx0ICogQHBhcmFtIGNvbnRlbnQgXHU5NzAwXHU4OTgxXHU1MTk5XHU1MTY1XHU3Njg0XHU2NTg3XHU0RUY2XHU1MTg1XHU1QkI5XG5cdCAqIEByZXR1cm5zIFx1NjYyRlx1NTQyNlx1NjIxMFx1NTI5RlxuXHQgKi9cblx0ZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdyaXRlRmlsZShcblx0XHRmaWxlUGF0aDogc3RyaW5nLFxuXHRcdGNvbnRlbnQ6IHN0cmluZyB8IEJsb2IsXG5cdCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGlmICh0eXBlb2YgY29udGVudCA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0cmV0dXJuIHdyaXRlRmlsZVRleHQoZmlsZVBhdGgsIGNvbnRlbnQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBkYXRhID0gWy4uLm5ldyBVaW50OEFycmF5KGF3YWl0IGNvbnRlbnQuYXJyYXlCdWZmZXIoKSldO1xuXHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdFx0YmV0dGVybmNtX25hdGl2ZS5mcy53cml0ZUZpbGUoZmlsZVBhdGgsIGRhdGEsIHJlc29sdmUsIHJlamVjdCk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogXHU1NzI4XHU2MzA3XHU1QjlBXHU4REVGXHU1Rjg0XHU2NUIwXHU1RUZBXHU2NTg3XHU0RUY2XHU1OTM5XG5cdCAqIEBwYXJhbSBkaXJQYXRoIFx1NjU4N1x1NEVGNlx1NTkzOVx1NzY4NFx1OERFRlx1NUY4NFxuXHQgKiBAcmV0dXJucyBcdTY2MkZcdTU0MjZcdTYyMTBcdTUyOUZcblx0ICovXG5cdGV4cG9ydCBhc3luYyBmdW5jdGlvbiBta2RpcihkaXJQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0YmV0dGVybmNtX25hdGl2ZS5mcy5ta2RpcihkaXJQYXRoLCByZXNvbHZlLCByZWplY3QpO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFx1NjhDMFx1NjdFNVx1NjMwN1x1NUI5QVx1OERFRlx1NUY4NFx1NEUwQlx1NjYyRlx1NTQyNlx1NUI1OFx1NTcyOFx1NjU4N1x1NEVGNlx1NjIxNlx1NjU4N1x1NEVGNlx1NTkzOVxuXHQgKiBAcGFyYW0gcGF0aCBcdTY1ODdcdTRFRjZcdTYyMTZcdTY1ODdcdTRFRjZcdTU5MzlcdTc2ODRcdThERUZcdTVGODRcblx0ICogQHJldHVybnMgXHU2NjJGXHU1NDI2XHU1QjU4XHU1NzI4XG5cdCAqL1xuXHRleHBvcnQgZnVuY3Rpb24gZXhpc3RzKHBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiBiZXR0ZXJuY21fbmF0aXZlLmZzLmV4aXN0cyhwYXRoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBcdTUyMjBcdTk2NjRcdTYzMDdcdTVCOUFcdThERUZcdTVGODRcdTRFMEJcdTc2ODRcdTY1ODdcdTRFRjZcdTYyMTZcdTY1ODdcdTRFRjZcdTU5Mzlcblx0ICogQHBhcmFtIHBhdGggXHU2MzA3XHU1QjlBXHU3Njg0XHU2NTg3XHU0RUY2XHU2MjE2XHU2NTg3XHU0RUY2XHU1OTM5XHU4REVGXHU1Rjg0XG5cdCAqL1xuXHRleHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVtb3ZlKHBhdGg6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHRiZXR0ZXJuY21fbmF0aXZlLmZzLnJlbW92ZShwYXRoLCByZXNvbHZlLCByZWplY3QpO1xuXHRcdH0pO1xuXHR9XG59XG4iLCAiZXhwb3J0IGNvbnN0IGJldHRlcm5jbUZldGNoID0gKFxuXHRyZWxQYXRoOiBzdHJpbmcsXG5cdG9wdGlvbj86IFJlcXVlc3RJbml0ICYge1xuXHRcdGlnbm9yZUFwaUtleT86IGJvb2xlYW47XG5cdH0sXG4pID0+IHtcblx0aWYgKG9wdGlvbikge1xuXHRcdG9wdGlvbi5oZWFkZXJzID0gb3B0aW9uLmhlYWRlcnMgPz8ge307XG5cdFx0aWYgKCFvcHRpb24uaWdub3JlQXBpS2V5KVxuXHRcdFx0b3B0aW9uLmhlYWRlcnNbXCJCRVRURVJOQ01fQVBJX0tFWVwiXSA9IEJFVFRFUk5DTV9BUElfS0VZO1xuXHR9IGVsc2Uge1xuXHRcdG9wdGlvbiA9IHtcblx0XHRcdGhlYWRlcnM6IHsgQkVUVEVSTkNNX0FQSV9LRVkgfSxcblx0XHR9O1xuXHR9XG5cdHJldHVybiBmZXRjaChCRVRURVJOQ01fQVBJX1BBVEggKyByZWxQYXRoLCBvcHRpb24pO1xufTtcbiIsICJpbXBvcnQgeyBiZXR0ZXJuY21GZXRjaCB9IGZyb20gXCIuL2Jhc2VcIjtcblxuY29uc3QgZSA9IGVuY29kZVVSSUNvbXBvbmVudDtcblxuZXhwb3J0IG5hbWVzcGFjZSBhcHAge1xuXHQvKipcblx0ICogXHU2MjY3XHU4ODRDXHU2MzA3XHU1QjlBXHU3Njg0XHU3QTBCXHU1RThGXG5cdCAqIEBwYXJhbSBjbWQgXHU5NzAwXHU4OTgxXHU2MjY3XHU4ODRDXHU3Njg0XHU2MzA3XHU0RUU0XG5cdCAqIEBwYXJhbSBlbGV2YXRlIFx1NjYyRlx1NTQyNlx1NEY3Rlx1NzUyOFx1N0JBMVx1NzQwNlx1NTQ1OFx1Njc0M1x1OTY1MFx1OEZEMFx1ODg0Q1xuXHQgKiBAcGFyYW0gc2hvd1dpbmRvdyBcdTY2MkZcdTU0MjZcdTY2M0VcdTc5M0FcdTYzQTdcdTUyMzZcdTUzRjBcdTdBOTdcdTUzRTNcblx0ICogQHJldHVybnMgVE9ETzogXHU4RkQ0XHU1NkRFXHU3Njg0XHU1NTY1XHU3M0E5XHU2MTBGXG5cdCAqL1xuXHRleHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhlYyhjbWQ6IHN0cmluZywgZWxldmF0ZSA9IGZhbHNlLCBzaG93V2luZG93ID0gZmFsc2UpIHtcblx0XHRjb25zdCByID0gYXdhaXQgYmV0dGVybmNtRmV0Y2goXG5cdFx0XHRgL2FwcC9leGVjJHtlbGV2YXRlID8gXCJfZWxlXCIgOiBcIlwifSR7c2hvd1dpbmRvdyA/IFwiP19zaG93V2luZG93XCIgOiBcIlwifWAsXG5cdFx0XHR7IG1ldGhvZDogXCJQT1NUXCIsIGJvZHk6IGNtZCB9LFxuXHRcdCk7XG5cdFx0cmV0dXJuIHIuc3RhdHVzID09PSAyMDA7XG5cdH1cblxuXHRsZXQgYmV0dGVyTkNNVmVyc2lvbjogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG5cblx0LyoqXG5cdCAqIFx1ODNCN1x1NTNENlx1NUY1M1x1NTI0RCBCZXR0ZXJOQ00gXHU3Njg0XHU3MjQ4XHU2NzJDXHU1M0Y3XG5cdCAqIEByZXR1cm5zIFx1NUY1M1x1NTI0RCBCZXR0ZXJOQ00gXHU3Njg0XHU3MjQ4XHU2NzJDXHU1M0Y3XG5cdCAqL1xuXHRleHBvcnQgZnVuY3Rpb24gZ2V0QmV0dGVyTkNNVmVyc2lvbigpOiBzdHJpbmcge1xuXHRcdHJldHVybiBiZXR0ZXJuY21fbmF0aXZlLmFwcC52ZXJzaW9uKCk7XG5cdH1cblxuXHQvKipcblx0ICogXHU1MTY4XHU1QzRGXHU2MjJBXHU1NkZFXG5cdCAqIEByZXR1cm5zIFx1NjIyQVx1NTZGRVx1NzY4NCBCbG9iIFx1NjU3MFx1NjM2RVxuXHQgKi9cblx0ZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHRha2VCYWNrZ3JvdW5kU2NyZWVuc2hvdCgpOiBQcm9taXNlPEJsb2I+IHtcblx0XHRjb25zdCByID0gYXdhaXQgYmV0dGVybmNtRmV0Y2goXCIvYXBwL2JnX3NjcmVlbnNob3RcIik7XG5cdFx0cmV0dXJuIGF3YWl0IHIuYmxvYigpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFx1ODNCN1x1NTNENlx1N0Y1MVx1NjYxM1x1NEU5MVx1N0E5N1x1NTNFM1x1NEY0RFx1N0Y2RVxuXHQgKiBAcmV0dXJucyBcdTRGNERcdTdGNkVcblx0ICovXG5cdGV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXROQ01XaW5Qb3MoKTogUHJvbWlzZTx7IHg6IG51bWJlcjsgeTogbnVtYmVyIH0+IHtcblx0XHRjb25zdCByID0gYXdhaXQgYmV0dGVybmNtRmV0Y2goXCIvYXBwL2dldF93aW5fcG9zaXRpb25cIiwge1xuXHRcdFx0aWdub3JlQXBpS2V5OiB0cnVlLFxuXHRcdH0pO1xuXHRcdHJldHVybiBhd2FpdCByLmpzb24oKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBcdTkxQ0RcdTY1QjBcdTg5RTNcdTUzOEJcdTYyNDBcdTY3MDlcdTYzRDJcdTRFRjZcblx0ICogQHJldHVybnMgXHU2NjJGXHU1NDI2XHU2MjEwXHU1MjlGXG5cdCAqL1xuXHRleHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVsb2FkUGx1Z2lucygpIHtcblx0XHRjb25zdCByID0gYXdhaXQgYmV0dGVybmNtRmV0Y2goXCIvYXBwL3JlbG9hZF9wbHVnaW5cIik7XG5cdFx0cmV0dXJuIHIuc3RhdHVzID09PSAyMDA7XG5cdH1cblxuXHQvKipcblx0ICogXHU4M0I3XHU1M0Q2XHU3NkVFXHU1MjREIEJldHRlck5DTSBcdTY1NzBcdTYzNkVcdTc2RUVcdTVGNTVcblx0ICogQHJldHVybnMgXHU2NTcwXHU2MzZFXHU3NkVFXHU1RjU1XHU4REVGXHU1Rjg0XG5cdCAqL1xuXHRleHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RGF0YVBhdGgoKSB7XG5cdFx0Y29uc3QgciA9IGF3YWl0IGJldHRlcm5jbUZldGNoKFwiL2FwcC9kYXRhcGF0aFwiKTtcblx0XHRjb25zdCBwID0gYXdhaXQgci50ZXh0KCk7XG5cdFx0cmV0dXJuIHAucmVwbGFjZSgvXFwvL2csIFwiXFxcXFwiKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBcdThCRkJcdTUzRDYgQmV0dGVyTkNNIFx1OEJCRVx1N0Y2RVxuXHQgKiBAcGFyYW0ga2V5IFx1OTUyRVxuXHQgKiBAcGFyYW0gZGVmYXVsdFZhbHVlIFx1OUVEOFx1OEJBNFx1NTAzQ1xuXHQgKiBAcmV0dXJucyBcdThCRkJcdTUzRDZcdTUyMzBcdTc2ODRcdTUwM0Ncblx0ICovXG5cdGV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWFkQ29uZmlnKFxuXHRcdGtleTogc3RyaW5nLFxuXHRcdGRlZmF1bHRWYWx1ZTogc3RyaW5nLFxuXHQpOiBQcm9taXNlPHN0cmluZz4ge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHRiZXR0ZXJuY21fbmF0aXZlLmFwcC5yZWFkQ29uZmlnKGtleSwgZGVmYXVsdFZhbHVlLCByZXNvbHZlLCByZWplY3QpO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFx1OEJCRVx1N0Y2RSBCZXR0ZXJOQ00gXHU4QkJFXHU3RjZFXG5cdCAqIEBwYXJhbSBrZXkgXHU5NTJFXG5cdCAqIEBwYXJhbSB2YWx1ZSBcdTUwM0Ncblx0ICogQHJldHVybnMgXHU2NjJGXHU1NDI2XHU2MjEwXHU1MjlGXG5cdCAqL1xuXHRleHBvcnQgYXN5bmMgZnVuY3Rpb24gd3JpdGVDb25maWcoa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0YmV0dGVybmNtX25hdGl2ZS5hcHAud3JpdGVDb25maWcoa2V5LCB2YWx1ZSwgcmVzb2x2ZSwgcmVqZWN0KTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBcdTgzQjdcdTUzRDZcdTdGNTFcdTY2MTNcdTRFOTFcdTVCODlcdTg4QzVcdTc2RUVcdTVGNTVcblx0ICogQHJldHVybnMgXHU1Qjg5XHU4OEM1XHU3NkVFXHU1RjU1XG5cdCAqL1xuXHRleHBvcnQgZnVuY3Rpb24gZ2V0TkNNUGF0aCgpIHtcblx0XHRyZXR1cm4gYmV0dGVybmNtX25hdGl2ZS5hcHAuZ2V0TkNNUGF0aCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFx1NjI1M1x1NUYwMFx1N0Y1MVx1NjYxM1x1NEU5MVx1NEUzQlx1OEZEQlx1N0EwQlx1NzY4NENvbnNvbGVcblx0ICogQHJldHVybnMgXHU2NjJGXHU1NDI2XHU2MjEwXHU1MjlGXG5cdCAqL1xuXHRleHBvcnQgZnVuY3Rpb24gc2hvd0NvbnNvbGUoc2hvdyA9IHRydWUpIHtcblx0XHRiZXR0ZXJuY21fbmF0aXZlLmFwcC5zaG93Q29uc29sZShzaG93KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBcdThCQkVcdTdGNkVXaW4xMSBEV01cdTU3MDZcdTg5RDJcdTVGMDBcdTU0MkZcdTcyQjZcdTYwMDFcblx0ICogQHBhcmFtIGVuYWJsZSBcdTY2MkZcdTU0MjZcdTVGMDBcdTU0MkZcblx0ICogQHJldHVybnMgXHU2NjJGXHU1NDI2XHU2MjEwXHU1MjlGXG5cdCAqL1xuXHRleHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0Um91bmRlZENvcm5lcihlbmFibGUgPSB0cnVlKSB7fVxuXG5cdC8qKlxuXHQgKiBcdTYyNTNcdTVGMDBcdTRFMDBcdTRFMkFcdTkwMDlcdTYyRTlcdTY1ODdcdTRFRjZcdTVCRjlcdThCRERcdTY4NDZcblx0ICogQHBhcmFtIGZpbHRlciBcdTg5ODFcdTdCNUJcdTkwMDlcdTc2ODRcdTY1ODdcdTRFRjZcdTdDN0JcdTU3OEJcblx0ICogQHBhcmFtIGluaXRpYWxEaXIgXHU1QkY5XHU4QkREXHU2ODQ2XHU1MjFEXHU1OUNCXHU1NzMwXHU1NzQwXG5cdCAqIEByZXR1cm5zIFx1OTAwOVx1NjJFOVx1NzY4NFx1NjU4N1x1NEVGNlx1NTczMFx1NTc0MFx1RkYwQ1x1ODJFNVx1NjcyQVx1OTAwOVx1NjJFOVx1NTIxOVx1NEUzQVx1N0E3QVx1NUI1N1x1N0IyNlx1NEUzMlxuXHQgKi9cblx0ZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9wZW5GaWxlRGlhbG9nKFxuXHRcdGZpbHRlcjogc3RyaW5nLFxuXHRcdGluaXRpYWxEaXI6IHN0cmluZyxcblx0KTogUHJvbWlzZTxzdHJpbmc+IHtcblx0XHRjb25zdCByID0gYXdhaXQgYmV0dGVybmNtRmV0Y2goXG5cdFx0XHRgL2FwcC9vcGVuX2ZpbGVfZGlhbG9nP2ZpbHRlcj0ke2UoZmlsdGVyKX0maW5pdGlhbERpcj0ke2UoaW5pdGlhbERpcil9YCxcblx0XHQpO1xuXHRcdHJldHVybiBhd2FpdCByLnRleHQoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBcdTgzQjdcdTUzRDZcdTVGNTNcdTUyNERcdTRFM0JcdTk4OThcdTY2MkZcdTU0MjZcdTRFM0FcdTRFQUVcdTgyNzJcdTRFM0JcdTk4OThcblx0ICogQHRvZG8gXHU2RDRCXHU4QkQ1XHU1NzI4IFdpbmRvd3MgNyBcdTUzQ0EgV2luZG93cyAxMCBcdTRFMEJcdTY2MkZcdTU0MjZcdTZCNjNcdTVFMzhcdTVERTVcdTRGNUNcblx0ICogQHJldHVybnMgXHU1RjUzXHU1MjREXHU0RTNCXHU5ODk4XHU2NjJGXHU1NDI2XHU0RTNBXHU0RUFFXHU4MjcyXHU0RTNCXHU5ODk4XG5cdCAqL1xuXHRleHBvcnQgYXN5bmMgZnVuY3Rpb24gaXNMaWdodFRoZW1lKCkge1xuXHRcdGNvbnN0IHIgPSBhd2FpdCBiZXR0ZXJuY21GZXRjaChcIi9hcHAvaXNfbGlnaHRfdGhlbWVcIik7XG5cdFx0cmV0dXJuIGF3YWl0IHIuanNvbigpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFx1ODNCN1x1NTNENlx1NjI2N1x1ODg0Q1x1NjIxMFx1NTI5Rlx1NzY4NCBIaWphY2sgXHU2NUU1XHU1RkQ3XG5cdCAqIEByZXR1cm5zIEhpamFjayBcdTY1RTVcdTVGRDdcblx0ICovXG5cdGV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRTdWNjZWVkZWRIaWphY2tzKCk6IFByb21pc2U8c3RyaW5nW10+IHtcblx0XHRjb25zdCByID0gYXdhaXQgYmV0dGVybmNtRmV0Y2goXCIvYXBwL2dldF9zdWNjZWVkZWRfaGlqYWNrc1wiKTtcblx0XHRyZXR1cm4gYXdhaXQgci5qc29uKCk7XG5cdH1cbn1cbiIsICJjb25zdCBjYWNoZWRGdW5jdGlvbk1hcDogTWFwPHN0cmluZywgRnVuY3Rpb24+ID0gbmV3IE1hcCgpO1xuXG4vLyByb21lLWlnbm9yZSBsaW50L3N1c3BpY2lvdXMvbm9FeHBsaWNpdEFueTogXHU1MUZEXHU2NTcwXHU3QzdCXHU1NzhCXHU1M0VGXHU5NjhGXHU2MTBGXG5mdW5jdGlvbiBjYWxsQ2FjaGVkU2VhcmNoRnVuY3Rpb248RiBleHRlbmRzICguLi5hcmdzOiBhbnlbXSkgPT4gYW55Pihcblx0c2VhcmNoRnVuY3Rpb25OYW1lOiBzdHJpbmcsXG5cdGFyZ3M6IFBhcmFtZXRlcnM8Rj4sXG4pOiBSZXR1cm5UeXBlPEY+IHtcblx0aWYgKCFjYWNoZWRGdW5jdGlvbk1hcC5oYXMoc2VhcmNoRnVuY3Rpb25OYW1lKSkge1xuXHRcdGNvbnN0IGZpbmRSZXN1bHQgPSBuY20uZmluZEFwaUZ1bmN0aW9uKHNlYXJjaEZ1bmN0aW9uTmFtZSk7XG5cdFx0aWYgKGZpbmRSZXN1bHQpIHtcblx0XHRcdGNvbnN0IFtmdW5jLCBmdW5jUm9vdF0gPSBmaW5kUmVzdWx0O1xuXHRcdFx0Y2FjaGVkRnVuY3Rpb25NYXAuc2V0KHNlYXJjaEZ1bmN0aW9uTmFtZSwgZnVuYy5iaW5kKGZ1bmNSb290KSk7XG5cdFx0fVxuXHR9XG5cdGNvbnN0IGNhY2hlZEZ1bmMgPSBjYWNoZWRGdW5jdGlvbk1hcC5nZXQoc2VhcmNoRnVuY3Rpb25OYW1lKTtcblx0aWYgKGNhY2hlZEZ1bmMpIHtcblx0XHRyZXR1cm4gY2FjaGVkRnVuYy5hcHBseShudWxsLCBhcmdzKTtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKGBcdTUxRkRcdTY1NzAgJHtzZWFyY2hGdW5jdGlvbk5hbWV9IFx1NjcyQVx1NjI3RVx1NTIzMGApO1xuXHR9XG59XG5cbmV4cG9ydCBuYW1lc3BhY2UgbmNtIHtcblx0ZXhwb3J0IGZ1bmN0aW9uIGZpbmROYXRpdmVGdW5jdGlvbihvYmo6IE9iamVjdCwgaWRlbnRpZmllcnM6IHN0cmluZykge1xuXHRcdGZvciAobGV0IGtleSBpbiBvYmopIHtcblx0XHRcdGxldCBmbGFnID0gdHJ1ZTtcblx0XHRcdGZvciAoXG5cdFx0XHRcdGxldCBfaSA9IDAsIGlkZW50aWZpZXJzXzEgPSBpZGVudGlmaWVycztcblx0XHRcdFx0X2kgPCBpZGVudGlmaWVyc18xLmxlbmd0aDtcblx0XHRcdFx0X2krK1xuXHRcdFx0KSB7XG5cdFx0XHRcdGxldCBpZGVudGlmaWVyID0gaWRlbnRpZmllcnNfMVtfaV07XG5cdFx0XHRcdGlmICghb2JqW2tleV0udG9TdHJpbmcoKS5pbmNsdWRlcyhpZGVudGlmaWVyKSkgZmxhZyA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGZsYWcpIHJldHVybiBrZXk7XG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGZ1bmN0aW9uIG9wZW5VcmwodXJsOiBzdHJpbmcpIHtcblx0XHRjaGFubmVsLmNhbGwoXCJvcy5uYXZpZ2F0ZUV4dGVybmFsXCIsICgpID0+IHt9LCBbdXJsXSk7XG5cdH1cblxuXHRleHBvcnQgZnVuY3Rpb24gZ2V0TkNNUGFja2FnZVZlcnNpb24oKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gd2luZG93Py5BUFBfQ09ORj8ucGFja2FnZVZlcnNpb24gfHwgXCIwMDAwMDAwXCI7XG5cdH1cblxuXHRleHBvcnQgZnVuY3Rpb24gZ2V0TkNNRnVsbFZlcnNpb24oKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gd2luZG93Py5BUFBfQ09ORj8uYXBwdmVyIHx8IFwiMC4wLjAuMFwiO1xuXHR9XG5cblx0ZXhwb3J0IGZ1bmN0aW9uIGdldE5DTVZlcnNpb24oKTogc3RyaW5nIHtcblx0XHRjb25zdCB2ID0gZ2V0TkNNRnVsbFZlcnNpb24oKTtcblx0XHRyZXR1cm4gdi5zdWJzdHJpbmcoMCwgdi5sYXN0SW5kZXhPZihcIi5cIikpO1xuXHR9XG5cblx0ZXhwb3J0IGZ1bmN0aW9uIGdldE5DTUJ1aWxkKCk6IG51bWJlciB7XG5cdFx0Y29uc3QgdiA9IGdldE5DTUZ1bGxWZXJzaW9uKCk7XG5cdFx0cmV0dXJuIHBhcnNlSW50KHYuc3Vic3RyaW5nKHYubGFzdEluZGV4T2YoXCIuXCIpICsgMSkpO1xuXHR9XG5cblx0ZXhwb3J0IGZ1bmN0aW9uIHNlYXJjaEFwaUZ1bmN0aW9uKFxuXHRcdG5hbWVPckZpbmRlcjogc3RyaW5nIHwgKChmdW5jOiBGdW5jdGlvbikgPT4gYm9vbGVhbiksXG5cdFx0Ly8gcm9tZS1pZ25vcmUgbGludC9zdXNwaWNpb3VzL25vRXhwbGljaXRBbnk6IFx1NjgzOVx1NUJGOVx1OEM2MVx1NTNFRlx1NEVFNVx1NjYyRlx1NEVGQlx1NjEwRlx1NzY4NFxuXHRcdHJvb3Q6IGFueSA9IHdpbmRvdyxcblx0XHRjdXJyZW50UGF0aCA9IFtcIndpbmRvd1wiXSxcblx0XHQvLyByb21lLWlnbm9yZSBsaW50L3N1c3BpY2lvdXMvbm9FeHBsaWNpdEFueTogXHU1REYyXHU2OEMwXHU3RDIyXHU1QkY5XHU4QzYxXHU1M0VGXHU0RUU1XHU2NjJGXHU0RUZCXHU2MTBGXHU3Njg0XG5cdFx0cHJldk9iamVjdHM6IGFueVtdID0gW10sXG5cdFx0Ly8gcm9tZS1pZ25vcmUgbGludC9zdXNwaWNpb3VzL25vRXhwbGljaXRBbnk6IFx1OEZENFx1NTZERVx1OEJFNVx1NTFGRFx1NjU3MFx1NzY4NFx1NjQzQVx1NUUyNlx1NUJGOVx1OEM2MVx1RkYwQ1x1NjVCOVx1NEZCRlx1NTA1QSBiaW5kIFx1N0VEMVx1NUI5QVxuXHRcdHJlc3VsdDogW0Z1bmN0aW9uLCBhbnksIHN0cmluZ1tdXVtdID0gW10sXG5cdFx0Ly8gcm9tZS1pZ25vcmUgbGludC9zdXNwaWNpb3VzL25vRXhwbGljaXRBbnk6IFx1OEZENFx1NTZERVx1OEJFNVx1NTFGRFx1NjU3MFx1NzY4NFx1NjQzQVx1NUUyNlx1NUJGOVx1OEM2MVx1RkYwQ1x1NjVCOVx1NEZCRlx1NTA1QSBiaW5kIFx1N0VEMVx1NUI5QVxuXHQpOiBbRnVuY3Rpb24sIGFueSwgc3RyaW5nW11dW10ge1xuXHRcdGlmIChyb290ID09PSB1bmRlZmluZWQgfHwgcm9vdCA9PT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuIFtdO1xuXHRcdH1cblx0XHRwcmV2T2JqZWN0cy5wdXNoKHJvb3QpO1xuXHRcdGlmICh0eXBlb2YgbmFtZU9yRmluZGVyID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRpZiAodHlwZW9mIHJvb3RbbmFtZU9yRmluZGVyXSA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRcdHJlc3VsdC5wdXNoKFtyb290W25hbWVPckZpbmRlcl0sIHJvb3QsIFsuLi5jdXJyZW50UGF0aF1dKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Zm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMocm9vdCkpIHtcblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKHJvb3QsIGtleSkgJiZcblx0XHRcdFx0XHR0eXBlb2Ygcm9vdFtrZXldID09PSBcImZ1bmN0aW9uXCIgJiZcblx0XHRcdFx0XHRuYW1lT3JGaW5kZXIocm9vdFtrZXldKVxuXHRcdFx0XHQpIHtcblx0XHRcdFx0XHRyZXN1bHQucHVzaChbcm9vdFtrZXldLCByb290LCBbLi4uY3VycmVudFBhdGhdXSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKGN1cnJlbnRQYXRoLmxlbmd0aCA8IDEwKSB7XG5cdFx0XHRmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhyb290KSkge1xuXHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0T2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwocm9vdCwga2V5KSAmJlxuXHRcdFx0XHRcdHR5cGVvZiByb290W2tleV0gPT09IFwib2JqZWN0XCIgJiZcblx0XHRcdFx0XHQhcHJldk9iamVjdHMuaW5jbHVkZXMocm9vdFtrZXldKSAmJlxuXHRcdFx0XHRcdCEoXG5cdFx0XHRcdFx0XHRjdXJyZW50UGF0aC5sZW5ndGggPT09IDEgJiZcblx0XHRcdFx0XHRcdHByZXZPYmplY3RzW3ByZXZPYmplY3RzLmxlbmd0aCAtIDFdID09PSB3aW5kb3cgJiZcblx0XHRcdFx0XHRcdGtleSA9PT0gXCJiZXR0ZXJuY21cIlxuXHRcdFx0XHRcdCkgLy8gXHU1NEIxXHU0RUVDXHU4MUVBXHU1REYxXHU3Njg0XHU1MUZEXHU2NTcwXHU1QzMxXHU0RTBEXHU5NzAwXHU4OTgxXHU2OEMwXHU2RDRCXHU0RTg2XG5cdFx0XHRcdCkge1xuXHRcdFx0XHRcdGN1cnJlbnRQYXRoLnB1c2goa2V5KTtcblx0XHRcdFx0XHRzZWFyY2hBcGlGdW5jdGlvbihcblx0XHRcdFx0XHRcdG5hbWVPckZpbmRlcixcblx0XHRcdFx0XHRcdHJvb3Rba2V5XSxcblx0XHRcdFx0XHRcdGN1cnJlbnRQYXRoLFxuXHRcdFx0XHRcdFx0cHJldk9iamVjdHMsXG5cdFx0XHRcdFx0XHRyZXN1bHQsXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRjdXJyZW50UGF0aC5wb3AoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRwcmV2T2JqZWN0cy5wb3AoKTtcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0ZXhwb3J0IGZ1bmN0aW9uIHNlYXJjaEZvckRhdGEoXG5cdFx0Ly8gcm9tZS1pZ25vcmUgbGludC9zdXNwaWNpb3VzL25vRXhwbGljaXRBbnk6IFx1NEYxQVx1NjhDMFx1NkQ0Qlx1NEVGQlx1NjEwRlx1NTAzQ1xuXHRcdGZpbmRlcjogKGZ1bmM6IGFueSkgPT4gYm9vbGVhbixcblx0XHQvLyByb21lLWlnbm9yZSBsaW50L3N1c3BpY2lvdXMvbm9FeHBsaWNpdEFueTogXHU2ODM5XHU1QkY5XHU4QzYxXHU1M0VGXHU0RUU1XHU2NjJGXHU0RUZCXHU2MTBGXHU3Njg0XG5cdFx0cm9vdDogYW55ID0gd2luZG93LFxuXHRcdGN1cnJlbnRQYXRoID0gW1wid2luZG93XCJdLFxuXHRcdC8vIHJvbWUtaWdub3JlIGxpbnQvc3VzcGljaW91cy9ub0V4cGxpY2l0QW55OiBcdTVERjJcdTY4QzBcdTdEMjJcdTVCRjlcdThDNjFcdTUzRUZcdTRFRTVcdTY2MkZcdTRFRkJcdTYxMEZcdTc2ODRcblx0XHRwcmV2T2JqZWN0czogYW55W10gPSBbXSxcblx0XHQvLyByb21lLWlnbm9yZSBsaW50L3N1c3BpY2lvdXMvbm9FeHBsaWNpdEFueTogXHU4RkQ0XHU1NkRFXHU4QkU1XHU1MUZEXHU2NTcwXHU3Njg0XHU2NDNBXHU1RTI2XHU1QkY5XHU4QzYxXHVGRjBDXHU2NUI5XHU0RkJGXHU1MDVBIGJpbmQgXHU3RUQxXHU1QjlBXG5cdFx0cmVzdWx0OiBbYW55LCBhbnksIHN0cmluZ1tdXVtdID0gW10sXG5cdFx0Ly8gcm9tZS1pZ25vcmUgbGludC9zdXNwaWNpb3VzL25vRXhwbGljaXRBbnk6IFx1OEZENFx1NTZERVx1OEJFNVx1NTFGRFx1NjU3MFx1NzY4NFx1NjQzQVx1NUUyNlx1NUJGOVx1OEM2MVx1RkYwQ1x1NjVCOVx1NEZCRlx1NTA1QSBiaW5kIFx1N0VEMVx1NUI5QVxuXHQpOiBbYW55LCBhbnksIHN0cmluZ1tdXVtdIHtcblx0XHRpZiAocm9vdCA9PT0gdW5kZWZpbmVkIHx8IHJvb3QgPT09IG51bGwpIHtcblx0XHRcdHJldHVybiBbXTtcblx0XHR9XG5cdFx0cHJldk9iamVjdHMucHVzaChyb290KTtcblx0XHRpZiAoY3VycmVudFBhdGgubGVuZ3RoIDwgMTApIHtcblx0XHRcdGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHJvb3QpKSB7XG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHRPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChyb290LCBrZXkpICYmXG5cdFx0XHRcdFx0IXByZXZPYmplY3RzLmluY2x1ZGVzKHJvb3Rba2V5XSkgJiZcblx0XHRcdFx0XHQhKFxuXHRcdFx0XHRcdFx0Y3VycmVudFBhdGgubGVuZ3RoID09PSAxICYmXG5cdFx0XHRcdFx0XHRwcmV2T2JqZWN0c1twcmV2T2JqZWN0cy5sZW5ndGggLSAxXSA9PT0gd2luZG93ICYmXG5cdFx0XHRcdFx0XHRrZXkgPT09IFwiYmV0dGVybmNtXCJcblx0XHRcdFx0XHQpIC8vIFx1NTRCMVx1NEVFQ1x1ODFFQVx1NURGMVx1NzY4NFx1NTFGRFx1NjU3MFx1NUMzMVx1NEUwRFx1OTcwMFx1ODk4MVx1NjhDMFx1NkQ0Qlx1NEU4NlxuXHRcdFx0XHQpIHtcblx0XHRcdFx0XHRpZiAodHlwZW9mIHJvb3Rba2V5XSA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0XHRcdFx0Y3VycmVudFBhdGgucHVzaChrZXkpO1xuXHRcdFx0XHRcdFx0c2VhcmNoQXBpRnVuY3Rpb24oXG5cdFx0XHRcdFx0XHRcdGZpbmRlcixcblx0XHRcdFx0XHRcdFx0cm9vdFtrZXldLFxuXHRcdFx0XHRcdFx0XHRjdXJyZW50UGF0aCxcblx0XHRcdFx0XHRcdFx0cHJldk9iamVjdHMsXG5cdFx0XHRcdFx0XHRcdHJlc3VsdCxcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRjdXJyZW50UGF0aC5wb3AoKTtcblx0XHRcdFx0XHR9IGVsc2UgaWYgKGZpbmRlcihyb290W2tleV0pKSB7XG5cdFx0XHRcdFx0XHRyZXN1bHQucHVzaChbcm9vdFtrZXldLCByb290LCBbLi4uY3VycmVudFBhdGhdXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHByZXZPYmplY3RzLnBvcCgpO1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHRleHBvcnQgZnVuY3Rpb24gZmluZEFwaUZ1bmN0aW9uKFxuXHRcdG5hbWVPckZpbmRlcjogc3RyaW5nIHwgKChmdW5jOiBGdW5jdGlvbikgPT4gYm9vbGVhbiksXG5cdFx0Ly8gcm9tZS1pZ25vcmUgbGludC9zdXNwaWNpb3VzL25vRXhwbGljaXRBbnk6IFx1NjgzOVx1NUJGOVx1OEM2MVx1NTNFRlx1NEVFNVx1NjYyRlx1NEVGQlx1NjEwRlx1NzY4NFxuXHRcdHJvb3Q6IGFueSA9IHdpbmRvdyxcblx0XHRjdXJyZW50UGF0aCA9IFtcIndpbmRvd1wiXSxcblx0XHQvLyByb21lLWlnbm9yZSBsaW50L3N1c3BpY2lvdXMvbm9FeHBsaWNpdEFueTogXHU1REYyXHU2OEMwXHU3RDIyXHU1QkY5XHU4QzYxXHU1M0VGXHU0RUU1XHU2NjJGXHU0RUZCXHU2MTBGXHU3Njg0XG5cdFx0cHJldk9iamVjdHM6IGFueVtdID0gW10sXG5cdFx0Ly8gcm9tZS1pZ25vcmUgbGludC9zdXNwaWNpb3VzL25vRXhwbGljaXRBbnk6IFx1OEZENFx1NTZERVx1OEJFNVx1NTFGRFx1NjU3MFx1NzY4NFx1NjQzQVx1NUUyNlx1NUJGOVx1OEM2MVx1RkYwQ1x1NjVCOVx1NEZCRlx1NTA1QSBiaW5kIFx1N0VEMVx1NUI5QVxuXHQpOiBbRnVuY3Rpb24sIGFueSwgc3RyaW5nW11dIHwgbnVsbCB7XG5cdFx0aWYgKHJvb3QgPT09IHVuZGVmaW5lZCB8fCByb290ID09PSBudWxsKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdFx0cHJldk9iamVjdHMucHVzaChyb290KTtcblx0XHRpZiAodHlwZW9mIG5hbWVPckZpbmRlciA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0aWYgKHR5cGVvZiByb290W25hbWVPckZpbmRlcl0gPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHRyZXR1cm4gW3Jvb3RbbmFtZU9yRmluZGVyXSwgcm9vdCwgWy4uLmN1cnJlbnRQYXRoXV07XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHJvb3QpKSB7XG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHRPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChyb290LCBrZXkpICYmXG5cdFx0XHRcdFx0dHlwZW9mIHJvb3Rba2V5XSA9PT0gXCJmdW5jdGlvblwiICYmXG5cdFx0XHRcdFx0bmFtZU9yRmluZGVyKHJvb3Rba2V5XSlcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0cmV0dXJuIFtyb290W2tleV0sIHJvb3QsIFsuLi5jdXJyZW50UGF0aF1dO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChjdXJyZW50UGF0aC5sZW5ndGggPCAxMCkge1xuXHRcdFx0Zm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMocm9vdCkpIHtcblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKHJvb3QsIGtleSkgJiZcblx0XHRcdFx0XHR0eXBlb2Ygcm9vdFtrZXldID09PSBcIm9iamVjdFwiICYmXG5cdFx0XHRcdFx0IXByZXZPYmplY3RzLmluY2x1ZGVzKHJvb3Rba2V5XSkgJiZcblx0XHRcdFx0XHQhKFxuXHRcdFx0XHRcdFx0Y3VycmVudFBhdGgubGVuZ3RoID09PSAxICYmXG5cdFx0XHRcdFx0XHRwcmV2T2JqZWN0c1twcmV2T2JqZWN0cy5sZW5ndGggLSAxXSA9PT0gd2luZG93ICYmXG5cdFx0XHRcdFx0XHRrZXkgPT09IFwiYmV0dGVybmNtXCJcblx0XHRcdFx0XHQpIC8vIFx1NTRCMVx1NEVFQ1x1ODFFQVx1NURGMVx1NzY4NFx1NTFGRFx1NjU3MFx1NUMzMVx1NEUwRFx1OTcwMFx1ODk4MVx1NjhDMFx1NkQ0Qlx1NEU4NlxuXHRcdFx0XHQpIHtcblx0XHRcdFx0XHRjdXJyZW50UGF0aC5wdXNoKGtleSk7XG5cdFx0XHRcdFx0Y29uc3QgcmVzdWx0ID0gZmluZEFwaUZ1bmN0aW9uKFxuXHRcdFx0XHRcdFx0bmFtZU9yRmluZGVyLFxuXHRcdFx0XHRcdFx0cm9vdFtrZXldLFxuXHRcdFx0XHRcdFx0Y3VycmVudFBhdGgsXG5cdFx0XHRcdFx0XHRwcmV2T2JqZWN0cyxcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdGN1cnJlbnRQYXRoLnBvcCgpO1xuXHRcdFx0XHRcdGlmIChyZXN1bHQpIHtcblx0XHRcdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHByZXZPYmplY3RzLnBvcCgpO1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0Ly8gcm9tZS1pZ25vcmUgbGludC9zdXNwaWNpb3VzL25vRXhwbGljaXRBbnk6IFx1OEZEOVx1NEUyQVx1NjYyRlx1N0Y1MVx1NjYxM1x1NEU5MVx1ODFFQVx1NURGMVx1NjZCNFx1OTczMlx1NzY4NFx1NUJGOVx1OEM2MVx1RkYwQ1x1OTFDQ1x1NTkzNFx1NjcwOVx1NUY4OFx1NTkxQVx1NTNFRlx1NEVFNVx1NTIyOVx1NzUyOFx1NzY4NFx1NTFGRFx1NjU3MFxuXHRkZWNsYXJlIGNvbnN0IGRjOiBhbnk7XG5cdC8vIHJvbWUtaWdub3JlIGxpbnQvc3VzcGljaW91cy9ub0V4cGxpY2l0QW55OiBcdThGRDlcdTRFMkFcdTY2MkZcdTdGNTFcdTY2MTNcdTRFOTFcdTgxRUFcdTVERjFcdTY2QjRcdTk3MzJcdTc2ODRcdTVCRjlcdThDNjFcdUZGMENcdTkxQ0NcdTU5MzRcdTY3MDlcdTVGODhcdTU5MUFcdTUzRUZcdTRFRTVcdTUyMjlcdTc1MjhcdTc2ODRcdTUxRkRcdTY1NzBcblx0ZGVjbGFyZSBjb25zdCBjdGw6IGFueTtcblxuXHRsZXQgY2FjaGVkR2V0UGxheWluZ0Z1bmM6IEZ1bmN0aW9uIHwgbnVsbCA9IG51bGw7XG5cdC8qKlxuXHQgKiBcdTgzQjdcdTUzRDZcdTVGNTNcdTUyNERcdTZCNjNcdTU3MjhcdTY0QURcdTY1M0VcdTc2ODRcdTZCNENcdTY2RjJcdTc2ODRcdTRGRTFcdTYwNkZcdUZGMENcdTUzMDVcdTYyRUNcdTZCNENcdTY2RjJcdTRGRTFcdTYwNkZcdUZGMENcdTY3NjVcdTZFOTBcdUZGMENcdTVGNTNcdTUyNERcdTY0QURcdTY1M0VcdTcyQjZcdTYwMDFcdTdCNDlcblx0ICogQHRvZG8gXHU4ODY1XHU1MTY4XHU4RkQ0XHU1NkRFXHU1MDNDXHU3QzdCXHU1NzhCXG5cdCAqIEByZXR1cm5zIFx1NUY1M1x1NTI0RFx1NkI0Q1x1NjZGMlx1NzY4NFx1NjRBRFx1NjUzRVx1NEZFMVx1NjA2RlxuXHQgKi9cblx0ZXhwb3J0IGZ1bmN0aW9uIGdldFBsYXlpbmdTb25nKCkge1xuXHRcdGlmIChjYWNoZWRHZXRQbGF5aW5nRnVuYyA9PT0gbnVsbCkge1xuXHRcdFx0Y29uc3QgZmluZFJlc3VsdCA9IGZpbmRBcGlGdW5jdGlvbihcImdldFBsYXlpbmdcIik7XG5cdFx0XHRpZiAoZmluZFJlc3VsdCkge1xuXHRcdFx0XHRjb25zdCBbZ2V0UGxheWluZywgZ2V0UGxheWluZ1Jvb3RdID0gZmluZFJlc3VsdDtcblx0XHRcdFx0Y2FjaGVkR2V0UGxheWluZ0Z1bmMgPSBnZXRQbGF5aW5nLmJpbmQoZ2V0UGxheWluZ1Jvb3QpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoY2FjaGVkR2V0UGxheWluZ0Z1bmMgPT09IG51bGwpIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gY2FjaGVkR2V0UGxheWluZ0Z1bmMoKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogXHU4M0I3XHU1M0Q2XHU1RjUzXHU1MjREXHU2QjYzXHU1NzI4XHU2NEFEXHU2NTNFXHU3Njg0XHU2QjRDXHU2NkYyXHU3Njg0XHU3QjgwXHU4OTgxXHU0RkUxXHU2MDZGXG5cdCAqIEBkZXByZWNhdGVkIFx1NzUzMVx1NEU4RVx1NjI3RVx1NTIzMFx1NEU4Nlx1ODFFQVx1NUUyNlx1NzY4NFx1NjNBNVx1NTNFM1x1RkYwQ1x1NjU0NVx1OEZEOVx1NEUyQVx1NTFGRFx1NjU3MFx1ODhBQlx1NUYwM1x1NzUyOFx1RkYwQ1x1OEJGN1x1OEY2Q1x1ODAwQ1x1NEY3Rlx1NzUyOCBgYmV0dGVybmNtLm5jbS5nZXRQbGF5aW5nU29uZ2Bcblx0ICogQHJldHVybnMgXHU3QjgwXHU1MzE2XHU3Njg0XHU2NEFEXHU2NTNFXHU0RkUxXHU2MDZGXG5cdCAqL1xuXHRleHBvcnQgZnVuY3Rpb24gZ2V0UGxheWluZygpIHtcblx0XHRjb25zdCBwbGF5aW5nID0gZ2V0UGxheWluZ1NvbmcoKTtcblx0XHRjb25zdCByZXN1bHQgPSB7XG5cdFx0XHRpZDogcGxheWluZy5kYXRhLmlkIGFzIG51bWJlcixcblx0XHRcdHRpdGxlOiBwbGF5aW5nLmRhdGEubmFtZSBhcyBzdHJpbmcsXG5cdFx0XHR0eXBlOiBcIm5vcm1hbFwiLFxuXHRcdH07XG5cdFx0aWYgKHBsYXlpbmcuZnJvbS5mbSkge1xuXHRcdFx0cmVzdWx0LnR5cGUgPSBcImZtXCI7XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cbn1cbiIsICJpbXBvcnQgeyBmcyB9IGZyb20gXCIuL2ZzXCI7XG5cbmV4cG9ydCBuYW1lc3BhY2UgdGVzdHMge1xuXHRleHBvcnQgYXN5bmMgZnVuY3Rpb24gZmFpbChyZWFzb246IHN0cmluZykge1xuXHRcdGNvbnNvbGUud2FybihcIlRlc3QgRmFpbGVkXCIsIHJlYXNvbik7XG5cdFx0YXdhaXQgZnMud3JpdGVGaWxlVGV4dChcIi9fX1RFU1RfRkFJTEVEX18udHh0XCIsIHJlYXNvbik7XG5cdH1cblxuXHRleHBvcnQgYXN5bmMgZnVuY3Rpb24gc3VjY2VzcyhtZXNzYWdlOiBzdHJpbmcpIHtcblx0XHRjb25zb2xlLndhcm4oXCJUZXN0IFN1Y2NlZWRlZFwiLCBtZXNzYWdlKTtcblx0XHRhd2FpdCBmcy53cml0ZUZpbGVUZXh0KFwiL19fVEVTVF9TVUNDRUVERURfXy50eHRcIiwgbWVzc2FnZSk7XG5cdH1cbn1cbiIsICIvKipcbiAqIEBmaWxlb3ZlcnZpZXdcbiAqIEJldHRlck5DTSBcdTYzRDJcdTRFRjZcdTVGMDBcdTUzRDFcdTYzQTVcdTUzRTNcbiAqXG4gKiBcdTYzRDJcdTRFRjZcdTRGNUNcdTgwMDVcdTUzRUZcdTRFRTVcdTkwMUFcdThGQzdcdTZCNjRcdTU5MDRcdTc2ODRcdTYzQTVcdTUzRTNcdTY3NjVcdTU0OENcdTc1NENcdTk3NjJcdTYyMTZcdTdBMEJcdTVFOEZcdTU5MTZcdTkwRThcdTRFQTRcdTRFOTJcbiAqL1xuXG5pbXBvcnQgXCIuL3JlYWN0XCI7XG5pbXBvcnQgeyBmcyB9IGZyb20gXCIuL2ZzXCI7XG5pbXBvcnQgeyBhcHAgfSBmcm9tIFwiLi9hcHBcIjtcbmltcG9ydCB7IG5jbSB9IGZyb20gXCIuL25jbVwiO1xuaW1wb3J0IHsgdGVzdHMgfSBmcm9tIFwiLi90ZXN0c1wiO1xuaW1wb3J0IHsgdXRpbHMgfSBmcm9tIFwiLi91dGlsc1wiO1xuaW1wb3J0IHsgYmV0dGVybmNtRmV0Y2ggfSBmcm9tIFwiLi9iYXNlXCJcblxuLyoqXG4gKiBcdTUzMDVcdTU0MkJcdTUyQTBcdThGN0RcdTUyQThcdTc1M0JcdTc2ODRcdTkxQ0RcdThGN0RcbiAqL1xuZnVuY3Rpb24gcmVsb2FkKCk6IHZvaWQge1xuXHRjb25zdCBsb2FkaW5nTWFzayA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZGluZ01hc2tcIilcblx0aWYgKCFsb2FkaW5nTWFzaykge1xuXHRcdGJldHRlcm5jbV9uYXRpdmUuYXBwLnJlbG9hZElnbm9yZUNhY2hlKCk7XG5cdFx0cmV0dXJuO1xuXHR9XG5cdGNvbnN0IGFuaW0gPSBsb2FkaW5nTWFzay5hbmltYXRlKFt7IG9wYWNpdHk6IDAgfSwgeyBvcGFjaXR5OiAxIH1dLCB7XG5cdFx0ZHVyYXRpb246IDMwMCxcblx0XHRmaWxsOiBcImZvcndhcmRzXCIsXG5cdFx0ZWFzaW5nOiBcImN1YmljLWJlemllcigwLjQyLCAwLCAwLjU4LCAxKVwiLFxuXHR9KTtcblx0YW5pbS5jb21taXRTdHlsZXMoKTtcblxuXHRhbmltLmFkZEV2ZW50TGlzdGVuZXIoXCJmaW5pc2hcIiwgKF8pID0+IHtcblx0XHRiZXR0ZXJuY21fbmF0aXZlLmFwcC5yZWxvYWRJZ25vcmVDYWNoZSgpO1xuXHR9KTtcbn1cblxuY29uc3QgQmV0dGVyTkNNID0ge1xuXHRmcyxcblx0YXBwLFxuXHRuY20sXG5cdHV0aWxzLFxuXHR0ZXN0cyxcblx0cmVsb2FkLFxuXHRiZXR0ZXJuY21GZXRjaFxufTtcblxuZXhwb3J0IHsgZnMsIGFwcCwgbmNtLCB1dGlscywgdGVzdHMsIHJlbG9hZCB9O1xuXG53aW5kb3cuZG9tID0gdXRpbHMuZG9tO1xuXG5kZWNsYXJlIGxldCBiZXR0ZXJuY206IHR5cGVvZiBCZXR0ZXJOQ007XG5iZXR0ZXJuY20gPSBCZXR0ZXJOQ007XG5leHBvcnQgZGVmYXVsdCBCZXR0ZXJOQ007XG4iLCAiZXhwb3J0IGNvbnN0IEJ1dHRvbjogUmVhY3QuRkM8XG5cdFJlYWN0LlByb3BzV2l0aENoaWxkcmVuPFJlYWN0LkhUTUxBdHRyaWJ1dGVzPEhUTUxBbmNob3JFbGVtZW50Pj5cbj4gPSAocHJvcHMpID0+IHtcblx0Y29uc3QgeyBjaGlsZHJlbiwgY2xhc3NOYW1lLCAuLi5vdGhlciB9ID0gcHJvcHM7XG5cdHJldHVybiAoXG5cdFx0PGEgY2xhc3NOYW1lPXtgdS1pYnRuNSB1LWlidG5zejggJHtjbGFzc05hbWUgfHwgXCJcIn1gfSB7Li4ub3RoZXJ9PlxuXHRcdFx0e2NoaWxkcmVufVxuXHRcdDwvYT5cblx0KTtcbn07XG4iLCAiZXhwb3J0IGNvbnN0IFByb2dyZXNzUmluZzogUmVhY3QuRkM8e1xuXHRzaXplPzogc3RyaW5nO1xufT4gPSAocHJvcHMpID0+IHtcblx0cmV0dXJuIChcblx0XHQ8c3BhblxuXHRcdFx0Y2xhc3NOYW1lPVwiYm5jbS1zcGlubmVyXCJcblx0XHRcdHN0eWxlPXt7XG5cdFx0XHRcdHdpZHRoOiBwcm9wcy5zaXplIHx8IFwiMTZweFwiLFxuXHRcdFx0XHRoZWlnaHQ6IHByb3BzLnNpemUgfHwgXCIxNnB4XCIsXG5cdFx0XHR9fVxuXHRcdD5cblx0XHRcdDxkaXYgLz5cblx0XHRcdDxkaXYgLz5cblx0XHRcdDxkaXYgLz5cblx0XHRcdDxkaXYgLz5cblx0XHRcdDxkaXYgLz5cblx0XHRcdDxkaXYgLz5cblx0XHRcdDxkaXYgLz5cblx0XHRcdDxkaXYgLz5cblx0XHRcdDxkaXYgLz5cblx0XHRcdDxkaXYgLz5cblx0XHRcdDxkaXYgLz5cblx0XHRcdDxkaXYgLz5cblx0XHQ8L3NwYW4+XG5cdCk7XG59O1xuIiwgImltcG9ydCBCZXR0ZXJOQ00gZnJvbSBcIi4uLy4uL2JldHRlcm5jbS1hcGlcIjtcbmltcG9ydCB7IGRpc2FibGVTYWZlTW9kZSwgaXNTYWZlTW9kZSwgbG9hZGVkUGx1Z2lucyB9IGZyb20gXCIuLi8uLi9sb2FkZXJcIjtcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gXCIuL2J1dHRvblwiO1xuaW1wb3J0IHsgUHJvZ3Jlc3NSaW5nIH0gZnJvbSBcIi4vcHJvZ3Jlc3MtcmluZ1wiO1xuXG5pbnRlcmZhY2UgUmVsZWFzZVZlcnNpb24ge1xuXHR2ZXJzaW9uOiBzdHJpbmc7XG5cdHN1cHBvcnRzOiBzdHJpbmdbXTtcblx0ZmlsZTogc3RyaW5nO1xuXHRjaGFuZ2Vsb2c6IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIE9ubGluZVZlcnNpb25JbmZvIHtcblx0dmVyc2lvbnM6IFJlbGVhc2VWZXJzaW9uW107XG59XG5cbmV4cG9ydCBjb25zdCBIZWFkZXJDb21wb25lbnQ6IFJlYWN0LkZDPHtcblx0b25SZXF1ZXN0T3BlblN0YXJ0dXBXYXJuaW5nczogRnVuY3Rpb247XG59PiA9IChwcm9wcykgPT4ge1xuXHRjb25zdCBbdXBkYXRlQnV0dG9uQ29sb3IsIHNldFVwZGF0ZUJ1dHRvbkNvbG9yXSA9XG5cdFx0UmVhY3QudXNlU3RhdGUoXCJ0cmFuc3BhcmVudFwiKTsgLy8gI0YwMDQgIzBGMDRcblxuXHRjb25zdCBzYWZlTW9kZSA9IFJlYWN0LnVzZU1lbW8oKCkgPT4gaXNTYWZlTW9kZSgpLCBbXSk7XG5cblx0Y29uc3QgW2xhdGVzdFZlcnNpb24sIHNldExhdGVzdFZlcnNpb25dID1cblx0XHRSZWFjdC51c2VTdGF0ZTxSZWxlYXNlVmVyc2lvbiB8IG51bGw+KG51bGwpO1xuXG5cdGNvbnN0IFtjdXJyZW50VmVyc2lvbiwgc2V0Q3VycmVudFZlcnNpb25dID0gUmVhY3QudXNlU3RhdGUoXCJcIik7XG5cblx0Y29uc3QgZ2xvYmFsUmVxdWlyZVJlc3RhcnQgPSBSZWFjdC51c2VNZW1vKCgpID0+XG5cdFx0T2JqZWN0LnZhbHVlcyhsb2FkZWRQbHVnaW5zKS5maW5kSW5kZXgocGx1Z2luID0+XG5cdFx0XHRwbHVnaW4ubWFuaWZlc3QucmVxdWlyZV9yZXN0YXJ0IHx8IHBsdWdpbi5tYW5pZmVzdC5uYXRpdmVfcGx1Z2luKSAhPT0gLTEsIFtdKVxuXG5cdFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG5cdFx0KGFzeW5jICgpID0+IHtcblx0XHRcdGlmICghbGF0ZXN0VmVyc2lvbikge1xuXHRcdFx0XHRjb25zdCBiZXR0ZXJOQ01WZXJzaW9uID0gYXdhaXQgQmV0dGVyTkNNLmFwcC5nZXRCZXR0ZXJOQ01WZXJzaW9uKCk7XG5cdFx0XHRcdHNldEN1cnJlbnRWZXJzaW9uKGJldHRlck5DTVZlcnNpb24pO1xuXHRcdFx0XHRjb25zdCBjdXJyZW50TkNNVmVyc2lvbiA9IEJldHRlck5DTS5uY20uZ2V0TkNNVmVyc2lvbigpO1xuXG5cdFx0XHRcdGNvbnN0IG9ubGluZTogT25saW5lVmVyc2lvbkluZm8gPSBhd2FpdCAoXG5cdFx0XHRcdFx0YXdhaXQgZmV0Y2goXG5cdFx0XHRcdFx0XHRcImh0dHBzOi8vZ2l0ZWUuY29tL21pY3JvYmxvY2svYmV0dGVyLW5jbS12Mi1kYXRhL3Jhdy9tYXN0ZXIvYmV0dGVybmNtL2JldHRlcm5jbS5qc29uXCIsXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHQpLmpzb24oKTtcblx0XHRcdFx0Y29uc3Qgb25saW5lU3VpdGFibGVWZXJzaW9ucyA9IG9ubGluZS52ZXJzaW9ucy5maWx0ZXIoKHYpID0+XG5cdFx0XHRcdFx0di5zdXBwb3J0cy5pbmNsdWRlcyhjdXJyZW50TkNNVmVyc2lvbiksXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmIChvbmxpbmVTdWl0YWJsZVZlcnNpb25zLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRcdHNldFVwZGF0ZUJ1dHRvbkNvbG9yKFwiI0YwMDRcIik7XG5cdFx0XHRcdFx0c2V0TGF0ZXN0VmVyc2lvbih7XG5cdFx0XHRcdFx0XHR2ZXJzaW9uOiBcIlwiLFxuXHRcdFx0XHRcdFx0c3VwcG9ydHM6IFtdLFxuXHRcdFx0XHRcdFx0ZmlsZTogXCJcIixcblx0XHRcdFx0XHRcdGNoYW5nZWxvZzogXCJcIixcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zdCBsYXRlc3RWZXJzaW9uID0gb25saW5lU3VpdGFibGVWZXJzaW9uc1swXTtcblx0XHRcdFx0XHRpZiAobGF0ZXN0VmVyc2lvbi52ZXJzaW9uICE9PSBiZXR0ZXJOQ01WZXJzaW9uKSB7XG5cdFx0XHRcdFx0XHRzZXRVcGRhdGVCdXR0b25Db2xvcihcIiMwRjA0XCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRzZXRMYXRlc3RWZXJzaW9uKGxhdGVzdFZlcnNpb24pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSkoKTtcblx0fSwgW2xhdGVzdFZlcnNpb25dKTtcblxuXHRjb25zdCBvblVwZGF0ZUJ1dHRvbkNsaWNrZWQgPSBSZWFjdC51c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XG5cdFx0aWYgKGxhdGVzdFZlcnNpb24gJiYgbGF0ZXN0VmVyc2lvbi52ZXJzaW9uICE9PSBjdXJyZW50VmVyc2lvbikge1xuXHRcdFx0Y29uc3QgbmNtcGF0aCA9IGF3YWl0IEJldHRlck5DTS5hcHAuZ2V0TkNNUGF0aCgpO1xuXHRcdFx0Y29uc3QgZGF0YXBhdGggPSBhd2FpdCBCZXR0ZXJOQ00uYXBwLmdldERhdGFQYXRoKCk7XG5cdFx0XHRjb25zdCBkbGxwYXRoID0gYCR7ZGF0YXBhdGh9XFxcXGJldHRlcm5jbS5kbGxgO1xuXHRcdFx0aWYgKGF3YWl0IEJldHRlck5DTS5mcy5leGlzdHMoXCIuL2JldHRlcm5jbS5kbGxcIikpXG5cdFx0XHRcdGF3YWl0IEJldHRlck5DTS5mcy5yZW1vdmUoXCIuL2JldHRlcm5jbS5kbGxcIik7XG5cblx0XHRcdGF3YWl0IEJldHRlck5DTS5mcy53cml0ZUZpbGUoXG5cdFx0XHRcdFwiLi9iZXR0ZXJuY20uZGxsXCIsXG5cdFx0XHRcdGF3YWl0IChhd2FpdCBmZXRjaChsYXRlc3RWZXJzaW9uPy5maWxlKSkuYmxvYigpLFxuXHRcdFx0KTtcblxuXHRcdFx0aWYgKCFuY21wYXRoLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoXCJzeXN0ZW1cIikpIHtcblx0XHRcdFx0QmV0dGVyTkNNLmFwcC5leGVjKFxuXHRcdFx0XHRcdFtcblx0XHRcdFx0XHRcdFwiY21kIC9jIEBlY2hvIG9mZlwiLFxuXHRcdFx0XHRcdFx0XCJlY2hvIEJldHRlck5DTSBVcGRhdGluZy4uLlwiLFxuXHRcdFx0XHRcdFx0XCJjZCAvZCBDOi9cIixcblx0XHRcdFx0XHRcdFwiY2QgQzovXCIsXG5cdFx0XHRcdFx0XHRgY2QgL2QgJHtuY21wYXRoWzBdfTovYCxcblx0XHRcdFx0XHRcdGBjZCBcIiR7bmNtcGF0aH1cImAsXG5cdFx0XHRcdFx0XHRcInRhc2traWxsIC9mIC9pbSBjbG91ZG11c2ljLmV4ZT5udWxcIixcblx0XHRcdFx0XHRcdFwidGFza2tpbGwgL2YgL2ltIGNsb3VkbXVzaWNuLmV4ZT5udWxcIixcblx0XHRcdFx0XHRcdFwicGluZyAxMjcuMC4wLjE+bnVsICYgZGVsIG1zaW1nMzIuZGxsXCIsXG5cdFx0XHRcdFx0XHRgbW92ZSBcIiR7ZGxscGF0aH1cIiAuXFxcXG1zaW1nMzIuZGxsYCxcblx0XHRcdFx0XHRcdFwic3RhcnQgY2xvdWRtdXNpYy5leGVcIixcblx0XHRcdFx0XHRdLmpvaW4oXCIgJiBcIiksXG5cdFx0XHRcdFx0dHJ1ZSxcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKGxhdGVzdFZlcnNpb24pIHtcblx0XHRcdC8vIFx1OTFDRFx1NjVCMFx1NjhDMFx1NkQ0Qlx1NjVCMFx1NzI0OFx1NjcyQ1xuXHRcdFx0c2V0TGF0ZXN0VmVyc2lvbihudWxsKTtcblx0XHR9XG5cdH0sIFtsYXRlc3RWZXJzaW9uXSk7XG5cblx0Y29uc3QgW2NvbnNvbGVTaG93biwgc2V0Q29uc29sZVNob3duXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKTtcblxuXHRyZXR1cm4gKFxuXHRcdDxzZWN0aW9uIGNsYXNzTmFtZT1cImJuY20tbWdyLWhlYWRlclwiPlxuXHRcdFx0PGltZ1xuXHRcdFx0XHRzcmM9XCJodHRwczovL3MxLmF4MXguY29tLzIwMjIvMDgvMTEvdkdsSk44LnBuZ1wiXG5cdFx0XHRcdGFsdD1cIlwiXG5cdFx0XHRcdHN0eWxlPXt7XG5cdFx0XHRcdFx0aGVpZ2h0OiBcIjY0cHhcIixcblx0XHRcdFx0fX1cblx0XHRcdC8+XG5cdFx0XHQ8ZGl2PlxuXHRcdFx0XHQ8aDE+XG5cdFx0XHRcdFx0QmV0dGVyTkNNe1wiIFwifVxuXHRcdFx0XHRcdDxzcGFuIHN0eWxlPXt7IGZvbnRTaXplOiBcInNtYWxsZXJcIiwgb3BhY2l0eTogXCIwLjhcIiB9fT5cblx0XHRcdFx0XHRcdHtiZXR0ZXJuY21fbmF0aXZlLmFwcC52ZXJzaW9uKCl9XG5cdFx0XHRcdFx0PC9zcGFuPlxuXHRcdFx0XHQ8L2gxPlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImJuY20tbWdyLWJ0bnNcIj5cblx0XHRcdFx0XHQ8QnV0dG9uXG5cdFx0XHRcdFx0XHRvbkNsaWNrPXthc3luYyAoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdEJldHRlck5DTS5hcHAuZXhlYyhcblx0XHRcdFx0XHRcdFx0XHRgZXhwbG9yZXIgXCIkeyhhd2FpdCBCZXR0ZXJOQ00uYXBwLmdldERhdGFQYXRoKCkpLnJlcGxhY2UoXG5cdFx0XHRcdFx0XHRcdFx0XHQvXFwvL2csXG5cdFx0XHRcdFx0XHRcdFx0XHRcIlxcXFxcIixcblx0XHRcdFx0XHRcdFx0XHQpfVwiYCxcblx0XHRcdFx0XHRcdFx0XHRmYWxzZSxcblx0XHRcdFx0XHRcdFx0XHR0cnVlLFxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0fX1cblx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHRcdTYyNTNcdTVGMDBcdTYzRDJcdTRFRjZcdTY1ODdcdTRFRjZcdTU5Mzlcblx0XHRcdFx0XHQ8L0J1dHRvbj5cblx0XHRcdFx0XHQ8QnV0dG9uXG5cdFx0XHRcdFx0XHRvbkNsaWNrPXsoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdEJldHRlck5DTS5hcHAuc2hvd0NvbnNvbGUoIWNvbnNvbGVTaG93bik7XG5cdFx0XHRcdFx0XHRcdHNldENvbnNvbGVTaG93bighY29uc29sZVNob3duKTtcblx0XHRcdFx0XHRcdH19XG5cdFx0XHRcdFx0PlxuXHRcdFx0XHRcdFx0e2NvbnNvbGVTaG93biA/IFwiXHU5NjkwXHU4NUNGXCIgOiBcIlx1NjI1M1x1NUYwMFwifVxuXHRcdFx0XHRcdFx0XHU2M0E3XHU1MjM2XHU1M0YwXG5cdFx0XHRcdFx0PC9CdXR0b24+XG5cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRnbG9iYWxSZXF1aXJlUmVzdGFydCA/IChcblx0XHRcdFx0XHRcdFx0PD5cblx0XHRcdFx0XHRcdFx0XHQ8QnV0dG9uXG5cdFx0XHRcdFx0XHRcdFx0XHRvbkNsaWNrPXthc3luYyAoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdEJldHRlck5DTS5yZWxvYWQoKTtcblx0XHRcdFx0XHRcdFx0XHRcdH19XG5cdFx0XHRcdFx0XHRcdFx0PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHU5MUNEXHU4RjdEXHU3RjUxXHU2NjEzXHU0RTkxXG5cdFx0XHRcdFx0XHRcdFx0PC9CdXR0b24+XG5cblx0XHRcdFx0XHRcdFx0XHQ8QnV0dG9uXG5cdFx0XHRcdFx0XHRcdFx0XHRvbkNsaWNrPXthc3luYyAoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGF3YWl0IGRpc2FibGVTYWZlTW9kZSgpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRiZXR0ZXJuY21fbmF0aXZlLmFwcC5yZXN0YXJ0KCk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9fVxuXHRcdFx0XHRcdFx0XHRcdD5cblx0XHRcdFx0XHRcdFx0XHRcdFx1OTFDRFx1NTQyRlx1NUU3Nlx1OTFDRFx1OEY3RFx1NjNEMlx1NEVGNlxuXHRcdFx0XHRcdFx0XHRcdDwvQnV0dG9uPlxuXHRcdFx0XHRcdFx0XHQ8Lz5cblx0XHRcdFx0XHRcdCkgOiAoXG5cdFx0XHRcdFx0XHRcdDxCdXR0b25cblx0XHRcdFx0XHRcdFx0XHRvbkNsaWNrPXthc3luYyAoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRhd2FpdCBkaXNhYmxlU2FmZU1vZGUoKTtcblx0XHRcdFx0XHRcdFx0XHRcdGF3YWl0IEJldHRlck5DTS5hcHAucmVsb2FkUGx1Z2lucygpO1xuXHRcdFx0XHRcdFx0XHRcdFx0QmV0dGVyTkNNLnJlbG9hZCgpO1xuXHRcdFx0XHRcdFx0XHRcdH19XG5cdFx0XHRcdFx0XHRcdD5cblx0XHRcdFx0XHRcdFx0XHRcdTkxQ0RcdThGN0RcdTYzRDJcdTRFRjZcblx0XHRcdFx0XHRcdFx0PC9CdXR0b24+XG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0fVxuXG5cblxuXHRcdFx0XHRcdDxCdXR0b25cblx0XHRcdFx0XHRcdHN0eWxlPXt7XG5cdFx0XHRcdFx0XHRcdGRpc3BsYXk6IFwiZmxleFwiLFxuXHRcdFx0XHRcdFx0XHRhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuXHRcdFx0XHRcdFx0XHRiYWNrZ3JvdW5kOiB1cGRhdGVCdXR0b25Db2xvcixcblx0XHRcdFx0XHRcdH19XG5cdFx0XHRcdFx0XHRvbkNsaWNrPXtvblVwZGF0ZUJ1dHRvbkNsaWNrZWR9XG5cdFx0XHRcdFx0PlxuXHRcdFx0XHRcdFx0e2xhdGVzdFZlcnNpb24gPT09IG51bGwgPyAoXG5cdFx0XHRcdFx0XHRcdDw+XG5cdFx0XHRcdFx0XHRcdFx0PFByb2dyZXNzUmluZyAvPlxuXHRcdFx0XHRcdFx0XHRcdFx1NjhDMFx1NjdFNVx1NjZGNFx1NjVCMFx1NEUyRFxuXHRcdFx0XHRcdFx0XHQ8Lz5cblx0XHRcdFx0XHRcdCkgOiBsYXRlc3RWZXJzaW9uLnZlcnNpb24gPT09IGN1cnJlbnRWZXJzaW9uID8gKFxuXHRcdFx0XHRcdFx0XHQ8Plx1NURGMlx1NjYyRlx1NjcwMFx1NjVCMFx1NzI0OFx1NjcyQzwvPlxuXHRcdFx0XHRcdFx0KSA6IGxhdGVzdFZlcnNpb24udmVyc2lvbi5sZW5ndGggPT09IDAgPyAoXG5cdFx0XHRcdFx0XHRcdDw+XHU3MjQ4XHU2NzJDXHU0RTBEXHU1MTdDXHU1QkI5PC8+XG5cdFx0XHRcdFx0XHQpIDogKFxuXHRcdFx0XHRcdFx0XHQ8Plx1NzBCOVx1NTFGQlx1NjZGNFx1NjVCMFx1NTIzMCB7bGF0ZXN0VmVyc2lvbi52ZXJzaW9ufTwvPlxuXHRcdFx0XHRcdFx0KX1cblx0XHRcdFx0XHQ8L0J1dHRvbj5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L2Rpdj5cblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwibS10b29sXCI+XG5cdFx0XHRcdDxhXG5cdFx0XHRcdFx0Y2xhc3NOYW1lPVwiaXRtXCJcblx0XHRcdFx0XHQvLyByb21lLWlnbm9yZSBsaW50L2ExMXkvdXNlVmFsaWRBbmNob3I6IDxleHBsYW5hdGlvbj5cblx0XHRcdFx0XHRvbkNsaWNrPXsoKSA9PiBwcm9wcy5vblJlcXVlc3RPcGVuU3RhcnR1cFdhcm5pbmdzKCl9XG5cdFx0XHRcdFx0c3R5bGU9e3tcblx0XHRcdFx0XHRcdHdpZHRoOiBcIjMycHhcIixcblx0XHRcdFx0XHRcdGhlaWdodDogXCIzMnB4XCIsXG5cdFx0XHRcdFx0fX1cblx0XHRcdFx0PlxuXHRcdFx0XHRcdDxzdmcgd2lkdGg9XCIzMnB4XCIgaGVpZ2h0PVwiMzJweFwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIj5cblx0XHRcdFx0XHRcdDxwYXRoXG5cdFx0XHRcdFx0XHRcdGZpbGw9XCJjdXJyZW50Q29sb3JcIlxuXHRcdFx0XHRcdFx0XHRkPVwiTTEzLDlIMTFWN0gxM00xMywxN0gxMVYxMUgxM00xMiwyQTEwLDEwIDAgMCwwIDIsMTJBMTAsMTAgMCAwLDAgMTIsMjJBMTAsMTAgMCAwLDAgMjIsMTJBMTAsMTAgMCAwLDAgMTIsMlpcIlxuXHRcdFx0XHRcdFx0Lz5cblx0XHRcdFx0XHQ8L3N2Zz5cblx0XHRcdFx0PC9hPlxuXHRcdFx0XHQ8YVxuXHRcdFx0XHRcdGNsYXNzTmFtZT1cIml0bVwiXG5cdFx0XHRcdFx0Ly8gcm9tZS1pZ25vcmUgbGludC9hMTF5L3VzZVZhbGlkQW5jaG9yOiA8ZXhwbGFuYXRpb24+XG5cdFx0XHRcdFx0b25DbGljaz17KCkgPT5cblx0XHRcdFx0XHRcdEJldHRlck5DTS5uY20ub3BlblVybChcImh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb0NCZXIvQmV0dGVyTkNNXCIpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHN0eWxlPXt7XG5cdFx0XHRcdFx0XHR3aWR0aDogXCIzMnB4XCIsXG5cdFx0XHRcdFx0XHRoZWlnaHQ6IFwiMzJweFwiLFxuXHRcdFx0XHRcdH19XG5cdFx0XHRcdD5cblx0XHRcdFx0XHQ8c3ZnIHdpZHRoPVwiMzJweFwiIGhlaWdodD1cIjMycHhcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCI+XG5cdFx0XHRcdFx0XHQ8cGF0aFxuXHRcdFx0XHRcdFx0XHRmaWxsPVwiY3VycmVudENvbG9yXCJcblx0XHRcdFx0XHRcdFx0ZD1cIk0xMiwyQTEwLDEwIDAgMCwwIDIsMTJDMiwxNi40MiA0Ljg3LDIwLjE3IDguODQsMjEuNUM5LjM0LDIxLjU4IDkuNSwyMS4yNyA5LjUsMjFDOS41LDIwLjc3IDkuNSwyMC4xNCA5LjUsMTkuMzFDNi43MywxOS45MSA2LjE0LDE3Ljk3IDYuMTQsMTcuOTdDNS42OCwxNi44MSA1LjAzLDE2LjUgNS4wMywxNi41QzQuMTIsMTUuODggNS4xLDE1LjkgNS4xLDE1LjlDNi4xLDE1Ljk3IDYuNjMsMTYuOTMgNi42MywxNi45M0M3LjUsMTguNDUgOC45NywxOCA5LjU0LDE3Ljc2QzkuNjMsMTcuMTEgOS44OSwxNi42NyAxMC4xNywxNi40MkM3Ljk1LDE2LjE3IDUuNjIsMTUuMzEgNS42MiwxMS41QzUuNjIsMTAuMzkgNiw5LjUgNi42NSw4Ljc5QzYuNTUsOC41NCA2LjIsNy41IDYuNzUsNi4xNUM2Ljc1LDYuMTUgNy41OSw1Ljg4IDkuNSw3LjE3QzEwLjI5LDYuOTUgMTEuMTUsNi44NCAxMiw2Ljg0QzEyLjg1LDYuODQgMTMuNzEsNi45NSAxNC41LDcuMTdDMTYuNDEsNS44OCAxNy4yNSw2LjE1IDE3LjI1LDYuMTVDMTcuOCw3LjUgMTcuNDUsOC41NCAxNy4zNSw4Ljc5QzE4LDkuNSAxOC4zOCwxMC4zOSAxOC4zOCwxMS41QzE4LjM4LDE1LjMyIDE2LjA0LDE2LjE2IDEzLjgxLDE2LjQxQzE0LjE3LDE2LjcyIDE0LjUsMTcuMzMgMTQuNSwxOC4yNkMxNC41LDE5LjYgMTQuNSwyMC42OCAxNC41LDIxQzE0LjUsMjEuMjcgMTQuNjYsMjEuNTkgMTUuMTcsMjEuNUMxOS4xNCwyMC4xNiAyMiwxNi40MiAyMiwxMkExMCwxMCAwIDAsMCAxMiwyWlwiXG5cdFx0XHRcdFx0XHQvPlxuXHRcdFx0XHRcdDwvc3ZnPlxuXHRcdFx0XHQ8L2E+XG5cdFx0XHQ8L2Rpdj5cblx0XHQ8L3NlY3Rpb24+XG5cdCk7XG59O1xuIiwgImltcG9ydCB7IGRpc2FibGVTYWZlTW9kZSwgZ2V0TG9hZEVycm9yIH0gZnJvbSBcIi4uLy4uL2xvYWRlclwiO1xuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSBcIi4vYnV0dG9uXCI7XG5cbmV4cG9ydCBjb25zdCBTYWZlTW9kZUluZm86IFJlYWN0LkZDID0gKCkgPT4ge1xuXHRjb25zdCBsb2FkRXJyb3IgPSBSZWFjdC51c2VNZW1vKGdldExvYWRFcnJvciwgW10pO1xuXG5cdHJldHVybiAoXG5cdFx0PGRpdiBjbGFzc05hbWU9XCJ2LXNjcm9sbFwiPlxuXHRcdFx0PGRpdj5cblx0XHRcdFx0PGRpdlxuXHRcdFx0XHRcdHN0eWxlPXt7XG5cdFx0XHRcdFx0XHRvdmVyZmxvd1k6IFwic2Nyb2xsXCIsXG5cdFx0XHRcdFx0XHRvdmVyZmxvd1g6IFwiaGlkZGVuXCIsXG5cdFx0XHRcdFx0fX1cblx0XHRcdFx0XHRjbGFzc05hbWU9XCJzYWZlLW1vZGUtaW5mb1wiXG5cdFx0XHRcdD5cblx0XHRcdFx0XHQ8aDE+XHU3M0IwXHU1NzI4XHU1OTA0XHU0RThFXHU1Qjg5XHU1MTY4XHU2QTIxXHU1RjBGPC9oMT5cblx0XHRcdFx0XHQ8cD5cblx0XHRcdFx0XHRcdEJldHRlck5DTVxuXHRcdFx0XHRcdFx0XHU2M0QyXHU0RUY2XHU1MkEwXHU4RjdEXHU1NjY4XHU1M0VGXHU4MEZEXHU5MDZEXHU5MDQ3XHU0RTg2XHU1OTFBXHU2QjIxXHU2M0QyXHU0RUY2XHU1MkEwXHU4RjdEXHU1OTMxXHU4RDI1XHU5MUNEXHU4RjdEXHVGRjBDXHU1Qjg5XHU1MTY4XHU2QTIxXHU1RjBGXHU1REYyXHU4MUVBXHU1MkE4XHU1NDJGXHU3NTI4XHVGRjBDXHU1NzI4XHU4QkU1XHU2QTIxXHU1RjBGXHU0RTBCXHU0RTBEXHU0RjFBXHU1MkEwXHU4RjdEXHU0RUZCXHU0RjU1XHU2M0QyXHU0RUY2XHUzMDAyXG5cdFx0XHRcdFx0PC9wPlxuXHRcdFx0XHRcdDxwPlxuXHRcdFx0XHRcdFx0XHU2M0QyXHU0RUY2XHU1MkEwXHU4RjdEXHU1NjY4XHU1REYyXHU3RUNGXHU2NTM2XHU5NkM2XHU0RTg2XHU2QkNGXHU2QjIxXHU1MkEwXHU4RjdEXHU1M0QxXHU3NTFGXHU3Njg0XHU5NTE5XHU4QkVGXHVGRjBDXHU4QkY3XHU3ODZFXHU4QkE0XHU1MkEwXHU4RjdEXHU1OTMxXHU4RDI1XHU3Njg0XHU2M0QyXHU0RUY2XHVGRjBDXHU1RTc2XHU1QzA2XHU1M0QxXHU3NTFGXHU5NTE5XHU4QkVGXHU3Njg0XHU2M0QyXHU0RUY2XHU2MjRCXHU1MkE4XHU3OUZCXHU5NjY0XHU2MjE2XHU0RkVFXHU2QjYzXHUzMDAyXG5cdFx0XHRcdFx0PC9wPlxuXHRcdFx0XHRcdDxwPlx1NUI4Q1x1NjIxMFx1OEMwM1x1NjU3NFx1NTQwRVx1RkYwQ1x1NTNFRlx1NEVFNVx1OTAxQVx1OEZDN1x1NjMwOVx1NEUwQlx1OTFDRFx1OEY3RFx1NjNEMlx1NEVGNlx1NTE3M1x1OTVFRFx1NUI4OVx1NTE2OFx1NkEyMVx1NUYwRlx1NUU3Nlx1OTFDRFx1NjVCMFx1NTJBMFx1OEY3RFx1NjNEMlx1NEVGNlx1MzAwMjwvcD5cblxuXHRcdFx0XHRcdDxCdXR0b25cblx0XHRcdFx0XHRcdG9uQ2xpY2s9e2FzeW5jICgpID0+IHtcblx0XHRcdFx0XHRcdFx0YXdhaXQgZGlzYWJsZVNhZmVNb2RlKCk7XG5cdFx0XHRcdFx0XHRcdGJldHRlcm5jbV9uYXRpdmUuYXBwLnJlc3RhcnQoKTtcblx0XHRcdFx0XHRcdH19XG5cdFx0XHRcdFx0PlxuXHRcdFx0XHRcdFx0XHU5MUNEXHU1NDJGXHU1RTc2XHU5MUNEXHU4RjdEXHU2M0QyXHU0RUY2XG5cdFx0XHRcdFx0PC9CdXR0b24+XG5cblx0XHRcdFx0XHR7bG9hZEVycm9yLmxlbmd0aCA9PT0gMCA/IChcblx0XHRcdFx0XHRcdDxwPlxuXHRcdFx0XHRcdFx0XHRcdTZDQTFcdTY3MDlcdTYyN0VcdTUyMzBcdTUyQTBcdThGN0RcdTk1MTlcdThCRUZcdThCQjBcdTVGNTVcdUZGMENcdTY3MDlcdTUzRUZcdTgwRkRcdTY2MkZcdTUzRDdcdTUyMzBcdTYzRDJcdTRFRjZcdTVGNzFcdTU0Q0RcdTYyMTZcdTYzRDJcdTRFRjZcdTdCQTFcdTc0MDZcdTU2NjhcdTgxRUFcdThFQUJcdTUxRkFcdTk1MTlcdTMwMDJcblx0XHRcdFx0XHRcdDwvcD5cblx0XHRcdFx0XHQpIDogKFxuXHRcdFx0XHRcdFx0PD5cblx0XHRcdFx0XHRcdFx0PHA+XHU1MkEwXHU4RjdEXHU5NTE5XHU4QkVGXHU4QkIwXHU1RjU1XHVGRjFBPC9wPlxuXHRcdFx0XHRcdFx0XHQ8Y29kZT5cblx0XHRcdFx0XHRcdFx0XHQ8cHJlIHN0eWxlPXt7IHdoaXRlU3BhY2U6IFwicHJlLXdyYXBcIiB9fT57bG9hZEVycm9yfTwvcHJlPlxuXHRcdFx0XHRcdFx0XHQ8L2NvZGU+XG5cdFx0XHRcdFx0XHQ8Lz5cblx0XHRcdFx0XHQpfVxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdDwvZGl2PlxuXHQpO1xufTtcbiIsICIvKipcbiAqIEBmaWxlb3ZlcnZpZXdcbiAqIFx1OTk5Nlx1NkIyMVx1NTQyRlx1NTJBOFx1NEYxQVx1NUYzOVx1NTFGQVx1NzY4NFx1NTE0RFx1OEQyM1x1NTQ4Q1x1OEI2Nlx1NTQ0QVx1N0E5N1x1NTNFM1xuICpcbiAqIFx1NjVFMFx1ODI2Rlx1NTE2Q1x1NEYxN1x1NTNGN1x1NTQ4Q1x1NTAxMlx1NTM1Nlx1NzJEN1x1NTNCQlx1NkI3Qlx1NTQyN1xuICovXG5cbmltcG9ydCBCZXR0ZXJOQ00gZnJvbSBcIi4uLy4uL2JldHRlcm5jbS1hcGlcIjtcblxuZXhwb3J0IGNvbnN0IFN0YXJ0dXBXYXJuaW5nOiBSZWFjdC5GQzx7XG5cdG9uUmVxdWVzdENsb3NlOiBGdW5jdGlvbjtcbn0+ID0gKHByb3BzKSA9PiB7XG5cdHJldHVybiAoXG5cdFx0PGRpdiBjbGFzc05hbWU9XCJzdGFydHVwLXdhcm5pbmdcIj5cblx0XHRcdDxoMT5cdTZCMjJcdThGQ0VcdTRGN0ZcdTc1MjggQmV0dGVyTkNNXHVGRjAxPC9oMT5cblx0XHRcdDxwPlxuXHRcdFx0XHRCZXR0ZXJOQ00gXHU2NjJGXHU0RTAwXHU0RTJBXHU3NTMxXHU0RTAwXHU3RkE0XHU3MEVEXHU3MjMxXHU3RjUxXHU2NjEzXHU0RTkxXHU5N0YzXHU0RTUwXHU3Njg0XHU0RTkxXHU2NzUxXHU2NzUxXHU1M0NCXHU1RjAwXHU1M0QxXHU3Njg0IFBDXG5cdFx0XHRcdFx1NzI0OFx1N0Y1MVx1NjYxM1x1NEU5MVx1OTdGM1x1NEU1MFx1NjI2OVx1NUM1NVx1NURFNVx1NTE3N1x1RkYwQ1x1NTNFRlx1NEVFNVx1NjNEMFx1NEY5Qlx1OTc1RVx1NUUzOFx1NEUzMFx1NUJDQ1x1NzY4NFx1ODFFQVx1NUI5QVx1NEU0OVx1NTI5Rlx1ODBGRFx1NjI2OVx1NUM1NVx1NTg5RVx1NUYzQVx1ODBGRFx1NTI5Qlx1MzAwMlxuXHRcdFx0PC9wPlxuXHRcdFx0PHA+XG5cdFx0XHRcdFx1ODAwM1x1ODY1MVx1NTIzMFx1NURFNVx1NTE3N1x1NjAyN1x1OEQyOFx1RkYwQ0JldHRlck5DTSBcdTVDMDY8Yj5cdTZDMzhcdThGRENcdTY2MkZcdTVCOENcdTUxNjhcdTVGMDBcdTZFOTBcdTUxNERcdThEMzlcdTc2ODRcdTgxRUFcdTc1MzFcdThGNkZcdTRFRjY8L2I+XG5cdFx0XHRcdFx1RkYwQ1x1NjI0MFx1NEVFNVx1NTk4Mlx1Njc5Q1x1NEY2MFx1NjYyRlx1NEVDRVx1NEVGQlx1NEY1NVx1NTczMFx1NjVCOVx1NTNEMVx1NzNCMFx1NjcwOVx1NEVGQlx1NEY1NVx1NEVCQVx1NTcyOFx1NTUyRVx1NTM1Nlx1NjcyQ1x1NURFNVx1NTE3N1x1RkYwQ1x1OEJGN1x1N0FDQlx1NTIzQlx1ODk4MVx1NkM0Mlx1OTAwMFx1NkIzRVx1NUU3Nlx1NEUzRVx1NjJBNVx1NTU0Nlx1NUJCNlx1RkYwMVxuXHRcdFx0XHRcdTRGNUNcdTRFM0FcdTRFMDBcdTdGQTRcdTcyMzFcdTU5N0RcdTgwMDVcdUZGMENcdTYyMTFcdTRFRUNcdTRFMERcdTRGMUFcdTRFNUZcdTZDQTFcdTUyOUVcdTZDRDVcdTRFM0FcdTRGNjBcdTU2RTBcdTRFM0FcdTRFQ0VcdTUxNzZcdTVCODNcdTkwMTRcdTVGODRcdThEMkRcdTRFNzBcdTY3MkNcdTVERTVcdTUxNzdcdTkwMjBcdTYyMTBcdTc2ODRcdTYzNUZcdTU5MzFcdThEMUZcdThEMjNcdUZGMDFcblx0XHRcdDwvcD5cblx0XHRcdDxwPlxuXHRcdFx0XHRcdTU5ODJcdTY3OUNcdTRGNjBcdTRFNUZcdTVFMENcdTY3MUJcdTRFM0EgQmV0dGVyTkNNIFx1OEQyMVx1NzMyRVx1NEVFM1x1NzgwMVx1RkYwQ1x1NkIyMlx1OEZDRVx1NTI0RFx1Njc2NSBCZXR0ZXJOQ00gXHU3Njg0IEdpdGh1YlxuXHRcdFx0XHRcdTVGMDBcdTZFOTBcdTRFRDNcdTVFOTNcdUZGMUFcblx0XHRcdFx0PGFcblx0XHRcdFx0XHRjbGFzc05hbWU9XCJpdG1cIlxuXHRcdFx0XHRcdC8vIHJvbWUtaWdub3JlIGxpbnQvYTExeS91c2VWYWxpZEFuY2hvcjogPGV4cGxhbmF0aW9uPlxuXHRcdFx0XHRcdG9uQ2xpY2s9eygpID0+XG5cdFx0XHRcdFx0XHRCZXR0ZXJOQ00ubmNtLm9wZW5VcmwoXCJodHRwczovL2dpdGh1Yi5jb20vTWljcm9DQmVyL0JldHRlck5DTVwiKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRzdHlsZT17e1xuXHRcdFx0XHRcdFx0d2lkdGg6IFwiMzJweFwiLFxuXHRcdFx0XHRcdFx0aGVpZ2h0OiBcIjMycHhcIixcblx0XHRcdFx0XHR9fVxuXHRcdFx0XHQ+XG5cdFx0XHRcdFx0aHR0cHM6Ly9naXRodWIuY29tL01pY3JvQ0Jlci9CZXR0ZXJOQ01cblx0XHRcdFx0PC9hPlxuXHRcdFx0PC9wPlxuXHRcdFx0PHA+XG5cdFx0XHRcdFx1OTAxQVx1OEZDN1x1NzBCOVx1NTFGQlx1NTNGM1x1NEUwQVx1ODlEMlx1NzY4NFx1N0Y1MVx1NjYxM1x1NEU5MVx1NTZGRVx1NjgwN1x1RkYwOFx1NTcyOFx1OEJCRVx1N0Y2RVx1NTZGRVx1NjgwN1x1NzY4NFx1NTNGM1x1NEZBN1x1RkYwOVx1NTNFRlx1NEVFNVx1NjI1M1x1NUYwMFx1NjNEMlx1NEVGNlx1N0JBMVx1NzQwNlx1NTY2OFx1RkYwQ1xuXHRcdFx0XHRcdTcxMzZcdTU0MEVcdTkwMUFcdThGQzdcdTYzRDJcdTRFRjZcdTdCQTFcdTc0MDZcdTU2NjhcdTkxNERcdTU5NTdcdTc2ODRcdTYzRDJcdTRFRjZcdTU1NDZcdTVFOTdcdUZGMENcdTVDMzFcdTUzRUZcdTRFRTVcdTVCODlcdTg4QzVcdTRGNjBcdTU1OUNcdTZCMjJcdTc2ODRcdTYzRDJcdTRFRjZcdTY3NjVcdTYyNjlcdTVDNTVcdTdGNTFcdTY2MTNcdTRFOTFcdTc2ODRcdTUyOUZcdTgwRkRcdTU0OENcdTU5MTZcdTg5QzJcdTU0RTZcdUZGMDFcblx0XHRcdDwvcD5cblx0XHRcdDxidXR0b24gb25DbGljaz17KCkgPT4gcHJvcHMub25SZXF1ZXN0Q2xvc2UoKX0+XHU1RjAwXHU1OUNCXHU0RjdGXHU3NTI4IEJldHRlck5DTTwvYnV0dG9uPlxuXHRcdDwvZGl2PlxuXHQpO1xufTtcbiIsICJpbXBvcnQgQmV0dGVyTkNNIGZyb20gXCIuLi9iZXR0ZXJuY20tYXBpXCI7XG5pbXBvcnQgeyBpc1NhZmVNb2RlLCBsb2FkZWRQbHVnaW5zIH0gZnJvbSBcIi4uL2xvYWRlclwiO1xuaW1wb3J0IHsgTkNNUGx1Z2luIH0gZnJvbSBcIi4uL3BsdWdpblwiO1xuaW1wb3J0IHsgSGVhZGVyQ29tcG9uZW50IH0gZnJvbSBcIi4vY29tcG9uZW50cy9oZWFkZXJcIjtcbmltcG9ydCB7IFNhZmVNb2RlSW5mbyB9IGZyb20gXCIuL2NvbXBvbmVudHMvc2FmZS1tb2RlLWluZm9cIjtcbmltcG9ydCB7IFN0YXJ0dXBXYXJuaW5nIH0gZnJvbSBcIi4vY29tcG9uZW50cy93YXJuaW5nXCI7XG5cbmNvbnN0IE9QRU5FRF9XQVJOSU5HUyA9IFwiY29uZmlnLmJldHRlcm5jbS5tYW5hZ2VyLm9wZW5lZHdhcm5pbmdzXCI7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbml0UGx1Z2luTWFuYWdlcigpIHtcblx0Ly8gXHU1MUM2XHU1OTA3XHU4QkJFXHU3RjZFXHU5ODc1XHU5NzYyXHU1NDhDXHU4QkJGXHU5NUVFXHU2MzA5XHU5NEFFXG5cdGNvbnN0IHNldHRpbmdzVmlldyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzZWN0aW9uXCIpO1xuXHRjb25zdCBtYWluUGFnZVZpZXc6IEhUTUxFbGVtZW50ID0gKGF3YWl0IEJldHRlck5DTS51dGlscy53YWl0Rm9yRWxlbWVudChcblx0XHRcInNlY3Rpb24uZy1tblwiLFxuXHQpKSEhO1xuXHRjb25zdCBzZXR0aW5nc0J1dHRvbiA9IChhd2FpdCBCZXR0ZXJOQ00udXRpbHMud2FpdEZvckVsZW1lbnQoXG5cdFx0J2FbaHJlZj1cIiMvbS9zZXR0aW5nL1wiXScsXG5cdCkpISEgYXMgSFRNTEFuY2hvckVsZW1lbnQ7XG5cdGNvbnN0IGJldHRlck5DTVNldHRpbmdzQnV0dG9uID0gc2V0dGluZ3NCdXR0b24uY2xvbmVOb2RlKFxuXHRcdHRydWUsXG5cdCkgYXMgSFRNTEFuY2hvckVsZW1lbnQ7XG5cdGJldHRlck5DTVNldHRpbmdzQnV0dG9uLmhyZWYgPSBcImphdmFzY3JpcHQ6dm9pZCgwKVwiO1xuXHRiZXR0ZXJOQ01TZXR0aW5nc0J1dHRvbi50aXRsZSA9IFwiQmV0dGVyTkNNXCI7XG5cblx0aWYgKGxvY2FsU3RvcmFnZS5nZXRJdGVtKE9QRU5FRF9XQVJOSU5HUykgIT09IFwidHJ1ZVwiKVxuXHRcdGJldHRlck5DTVNldHRpbmdzQnV0dG9uLmNsYXNzTGlzdC5hZGQoXCJibmNtLWJ0bi10d2lua2xpbmdcIik7XG5cdGJldHRlck5DTVNldHRpbmdzQnV0dG9uLmlubmVySFRNTCA9IGA8c3ZnIHN0eWxlPSd0cmFuc2Zvcm06IHNjYWxlKDAuOCk7Jz48dXNlIHhsaW5rOmhyZWY9XCJvcnBoZXVzOi8vb3JwaGV1cy9zdHlsZS9yZXMvc3ZnL3RvcGJhci5zcC5zdmcjbG9nb193aGl0ZVwiPjwvdXNlPjwvc3ZnPmA7XG5cdG1haW5QYWdlVmlldy5wYXJlbnRFbGVtZW50ISEuaW5zZXJ0QmVmb3JlKFxuXHRcdHNldHRpbmdzVmlldyxcblx0XHRtYWluUGFnZVZpZXcubmV4dEVsZW1lbnRTaWJsaW5nLFxuXHQpO1xuXHRzZXR0aW5nc0J1dHRvbi5wYXJlbnRFbGVtZW50ISEuaW5zZXJ0QmVmb3JlKFxuXHRcdGJldHRlck5DTVNldHRpbmdzQnV0dG9uLFxuXHRcdHNldHRpbmdzQnV0dG9uLm5leHRFbGVtZW50U2libGluZyxcblx0KTtcblx0UmVhY3RET00ucmVuZGVyKDxQbHVnaW5NYW5hZ2VyIC8+LCBzZXR0aW5nc1ZpZXcpO1xuXG5cdHNldHRpbmdzVmlldy5jbGFzc0xpc3QuYWRkKFwiYmV0dGVyLW5jbS1tYW5hZ2VyXCIpO1xuXHRzZXR0aW5nc1ZpZXcuY2xhc3NMaXN0LmFkZChcImctbW5cIik7XG5cblx0ZnVuY3Rpb24gc2hvd1NldHRpbmdzKCkge1xuXHRcdC8vIFx1NjcwOVx1NjNEMlx1NEVGNlx1NEYzQ1x1NEU0RVx1NEYxQVx1NjZGRlx1NjM2Mlx1NEUzQlx1OTg3NVx1NTE0M1x1N0QyMFx1RkYwQ1x1NUJGQ1x1ODFGNFx1NjIxMVx1NEVFQ1x1NzY4NFx1OEJCRVx1N0Y2RVx1OTg3NVx1OTc2Mlx1NjVFMFx1NkNENVx1NjYzRVx1NzkzQVx1RkYwQ1x1OTcwMFx1ODk4MVx1OEZEQlx1ODg0Q1x1NjhDMFx1NjdFNVxuXHRcdGlmIChzZXR0aW5nc1ZpZXcucGFyZW50RWxlbWVudCAhPT0gbWFpblBhZ2VWaWV3LnBhcmVudEVsZW1lbnQpIHtcblx0XHRcdG1haW5QYWdlVmlldy5wYXJlbnRFbGVtZW50ISEuaW5zZXJ0QmVmb3JlKFxuXHRcdFx0XHRzZXR0aW5nc1ZpZXcsXG5cdFx0XHRcdG1haW5QYWdlVmlldy5uZXh0RWxlbWVudFNpYmxpbmcsXG5cdFx0XHQpO1xuXHRcdH1cblx0XHRzZXR0aW5nc1ZpZXcuY2xhc3NMaXN0LmFkZChcIm5jbW0tc2hvd1wiKTtcblx0XHQvLyBcdTY3MDlcdTRFOUJcdTRFM0JcdTk4OThcdTYzRDJcdTRFRjZcdTRGMUFcdTdFRDlcdTYyMTFcdTRFRUNcdTRFM0JcdTk4NzVcdTRFMEEgIWltcG9ydGFudCBcdTRGMThcdTUxNDhcdTdFQTdcdTRGRUVcdTk5NzBcdTdCMjZcblx0XHQvLyBcdTYyNDBcdTRFRTVcdTVGOTdcdThGRDlcdTY4MzdcdTc4NkNcdTc4QjBcdTc4NkNcblx0XHRtYWluUGFnZVZpZXcuc2V0QXR0cmlidXRlKFwic3R5bGVcIiwgXCJkaXNwbGF5OiBub25lICFpbXBvcnRhbnQ7XCIpO1xuXHR9XG5cblx0ZnVuY3Rpb24gaGlkZVNldHRpbmdzKCkge1xuXHRcdHNldHRpbmdzVmlldy5jbGFzc0xpc3QucmVtb3ZlKFwibmNtbS1zaG93XCIpO1xuXHRcdG1haW5QYWdlVmlldy5yZW1vdmVBdHRyaWJ1dGUoXCJzdHlsZVwiKTtcblx0fVxuXG5cdCEoYXN5bmMgKCkgPT4ge1xuXHRcdGNvbnN0IGx5cmljQnV0dG9uID0gKGF3YWl0IEJldHRlck5DTS51dGlscy53YWl0Rm9yRWxlbWVudChcblx0XHRcdFwiZGl2LmNvdmVyLnUtY292ZXIudS1jb3Zlci1zbSA+IGEgPiBzcGFuXCIsXG5cdFx0XHQxMDAwLFxuXHRcdCkpISEgYXMgSFRNTEFuY2hvckVsZW1lbnQ7XG5cdFx0bHlyaWNCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGhpZGVTZXR0aW5ncyk7XG5cdH0pKCk7XG5cblx0c2V0dGluZ3NCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGhpZGVTZXR0aW5ncyk7XG5cdGJldHRlck5DTVNldHRpbmdzQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG5cdFx0aWYgKHNldHRpbmdzVmlldy5jbGFzc0xpc3QuY29udGFpbnMoXCJuY21tLXNob3dcIikpIHtcblx0XHRcdGhpZGVTZXR0aW5ncygpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzaG93U2V0dGluZ3MoKTtcblx0XHR9XG5cdH0pO1xuXG5cdC8vIFx1NTk4Mlx1Njc5Q1x1NTkxNlx1OTBFOFx1OTg3NVx1OTc2Mlx1NTNEOFx1NjZGNFx1RkYwOFx1NzBCOVx1NTFGQlx1NEU4Nlx1NTE3Nlx1NUI4M1x1NjMwOVx1OTRBRVx1OERGM1x1OEY2Q1x1RkYwOVx1NTIxOVx1NTE3M1x1OTVFRFx1OEJCRVx1N0Y2RVx1OTg3NVx1OTc2MlxuXHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImhhc2hjaGFuZ2VcIiwgaGlkZVNldHRpbmdzKTtcblx0bmV3IE11dGF0aW9uT2JzZXJ2ZXIoKHJzKSA9PiB7XG5cdFx0Zm9yIChjb25zdCByIG9mIHJzKSB7XG5cdFx0XHRpZiAoci5hdHRyaWJ1dGVOYW1lID09PSBcInN0eWxlXCIpIHtcblx0XHRcdFx0Ly8gXHU0RkE3XHU2ODBGXHU2NjJGXHU1M0VGXHU0RUU1XHU2MkQ2XHU2MkZEXHU2NTM5XHU1M0Q4XHU1OTI3XHU1QzBGXHU3Njg0XHVGRjBDXHU2MjQwXHU0RUU1XHU2MjExXHU0RUVDXHU0RTVGXHU4OTgxXHU0RTAwXHU4RDc3XHU1NDBDXHU2QjY1XHU0RkVFXHU2NTM5XG5cdFx0XHRcdHNldHRpbmdzVmlldy5zdHlsZS5sZWZ0ID0gbWFpblBhZ2VWaWV3LnN0eWxlLmxlZnQ7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KS5vYnNlcnZlKG1haW5QYWdlVmlldywge1xuXHRcdGF0dHJpYnV0ZXM6IHRydWUsXG5cdH0pO1xufVxuXG5leHBvcnQgbGV0IG9uUGx1Z2luTG9hZGVkID0gKF86IHR5cGVvZiBsb2FkZWRQbHVnaW5zKSA9PiB7IH07XG5cbmNvbnN0IFBsdWdpbk1hbmFnZXI6IFJlYWN0LkZDID0gKCkgPT4ge1xuXHRjb25zdCBbc2VsZWN0ZWRQbHVnaW4sIHNldFNlbGVjdGVkUGx1Z2luXSA9IFJlYWN0LnVzZVN0YXRlPE5DTVBsdWdpbiB8IG51bGw+KFxuXHRcdGxvYWRlZFBsdWdpbnNbXCJQbHVnaW5NYXJrZXRcIl0sXG5cdCk7XG5cdGNvbnN0IHBsdWdpbkNvbmZpZ1JlZiA9IFJlYWN0LnVzZVJlZjxIVE1MRGl2RWxlbWVudCB8IG51bGw+KG51bGwpO1xuXHRjb25zdCBbbG9hZGVkUGx1Z2luc0xpc3QsIHNldExvYWRlZFBsdWdpbnNdID0gUmVhY3QudXNlU3RhdGU8c3RyaW5nW10+KFtdKTtcblx0Y29uc3QgW3Nob3dTdGFydHVwV2FybmluZ3MsIHNldFNob3dTdGFydHVwV2FybmluZ3NdID0gUmVhY3QudXNlU3RhdGUoXG5cdFx0bG9jYWxTdG9yYWdlLmdldEl0ZW0oT1BFTkVEX1dBUk5JTkdTKSAhPT0gXCJ0cnVlXCIsXG5cdCk7XG5cdGNvbnN0IHNhZmVNb2RlID0gUmVhY3QudXNlTWVtbyhpc1NhZmVNb2RlLCB1bmRlZmluZWQpO1xuXG5cdFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG5cdFx0ZnVuY3Rpb24gc29ydEZ1bmMoa2V5MTogc3RyaW5nLCBrZXkyOiBzdHJpbmcpIHtcblx0XHRcdGNvbnN0IGdldFNvcnRWYWx1ZSA9IChrZXk6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRjb25zdCBsb2FkUGx1Z2luID0gbG9hZGVkUGx1Z2luc1trZXldO1xuXHRcdFx0XHRjb25zdCB2YWx1ZSA9IGxvYWRQbHVnaW4uaGF2ZUNvbmZpZ0VsZW1lbnQoKSA/IDEgOiAwO1xuXG5cdFx0XHRcdC8vIFx1NUMwNlx1NjNEMlx1NEVGNlx1NTU0Nlx1NUU5N1x1NjM5Mlx1NTIzMFx1NjcwMFx1NTI0RFx1OTc2MlxuXHRcdFx0XHRpZiAobG9hZFBsdWdpbi5tYW5pZmVzdC5uYW1lLnN0YXJ0c1dpdGgoXCJQbHVnaW5NYXJrZXRcIikpXG5cdFx0XHRcdFx0cmV0dXJuIE51bWJlci5NQVhfU0FGRV9JTlRFR0VSO1xuXG5cdFx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHRcdH07XG5cdFx0XHRyZXR1cm4gZ2V0U29ydFZhbHVlKGtleTIpIC0gZ2V0U29ydFZhbHVlKGtleTEpO1xuXHRcdH1cblx0XHRzZXRMb2FkZWRQbHVnaW5zKE9iamVjdC5rZXlzKGxvYWRlZFBsdWdpbnMpLnNvcnQoc29ydEZ1bmMpKTtcblx0XHRvblBsdWdpbkxvYWRlZCA9IChsb2FkZWRQbHVnaW5zKSA9PiB7XG5cdFx0XHRjb25zb2xlLmxvZyhcIlx1NjNEMlx1NEVGNlx1NTJBMFx1OEY3RFx1NUI4Q1x1NjIxMFx1RkYwMVwiKTtcblx0XHRcdHNldExvYWRlZFBsdWdpbnMoT2JqZWN0LmtleXMobG9hZGVkUGx1Z2lucykuc29ydChzb3J0RnVuYykpO1xuXHRcdH07XG5cdH0sIFtdKTtcblxuXHRSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuXHRcdGNvbnN0IG15RG9tRWxlbWVudCA9XG5cdFx0XHQoc2VsZWN0ZWRQbHVnaW4/LmluamVjdHNcblx0XHRcdFx0Lm1hcCgodikgPT4gdi5fZ2V0Q29uZmlnRWxlbWVudCgpKVxuXHRcdFx0XHQuZmlsdGVyKCh2KSA9PiB2ICE9PSBudWxsKSBhcyBIVE1MRWxlbWVudFtdIHwgbnVsbCkgfHwgW107XG5cblx0XHRpZiAobXlEb21FbGVtZW50Lmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0Y29uc3QgdGlwRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG5cdFx0XHR0aXBFbGVtZW50LmlubmVyVGV4dCA9IFwiXHU4QkU1XHU2M0QyXHU0RUY2XHU2Q0ExXHU2NzA5XHU1M0VGXHU3NTI4XHU3Njg0XHU4QkJFXHU3RjZFXHU5MDA5XHU5ODc5XCI7XG5cdFx0XHRteURvbUVsZW1lbnQucHVzaCh0aXBFbGVtZW50KTtcblx0XHR9XG5cblx0XHRwbHVnaW5Db25maWdSZWYuY3VycmVudD8ucmVwbGFjZUNoaWxkcmVuKC4uLm15RG9tRWxlbWVudCk7XG5cdH0sIFtzZWxlY3RlZFBsdWdpbl0pO1xuXG5cdHJldHVybiAoXG5cdFx0PGRpdiBjbGFzc05hbWU9XCJibmNtLW1nclwiPlxuXHRcdFx0PGRpdj5cblx0XHRcdFx0PEhlYWRlckNvbXBvbmVudFxuXHRcdFx0XHRcdG9uUmVxdWVzdE9wZW5TdGFydHVwV2FybmluZ3M9eygpID0+IHtcblx0XHRcdFx0XHRcdHNldFNob3dTdGFydHVwV2FybmluZ3MoIXNob3dTdGFydHVwV2FybmluZ3MpO1xuXHRcdFx0XHRcdH19XG5cdFx0XHRcdC8+XG5cdFx0XHRcdHtzYWZlTW9kZSA/IChcblx0XHRcdFx0XHQ8U2FmZU1vZGVJbmZvIC8+XG5cdFx0XHRcdCkgOiBzaG93U3RhcnR1cFdhcm5pbmdzID8gKFxuXHRcdFx0XHRcdDxTdGFydHVwV2FybmluZ1xuXHRcdFx0XHRcdFx0b25SZXF1ZXN0Q2xvc2U9eygpID0+IHtcblx0XHRcdFx0XHRcdFx0bG9jYWxTdG9yYWdlLnNldEl0ZW0oT1BFTkVEX1dBUk5JTkdTLCBcInRydWVcIik7XG5cdFx0XHRcdFx0XHRcdHNldFNob3dTdGFydHVwV2FybmluZ3MoZmFsc2UpO1xuXHRcdFx0XHRcdFx0XHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYm5jbS1idG4tdHdpbmtsaW5nJyk/LmNsYXNzTGlzdC5yZW1vdmUoXCJibmNtLWJ0bi10d2lua2xpbmdcIik7XG5cdFx0XHRcdFx0XHR9fVxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdCkgOiAoXG5cdFx0XHRcdFx0PHNlY3Rpb25cblx0XHRcdFx0XHRcdHN0eWxlPXt7XG5cdFx0XHRcdFx0XHRcdGRpc3BsYXk6IFwiZmxleFwiLFxuXHRcdFx0XHRcdFx0XHRmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuXHRcdFx0XHRcdFx0XHRmbGV4OiBcIjFcIixcblx0XHRcdFx0XHRcdFx0bWFyZ2luQm90dG9tOiBcIjBcIixcblx0XHRcdFx0XHRcdH19XG5cdFx0XHRcdFx0PlxuXHRcdFx0XHRcdFx0PGRpdlxuXHRcdFx0XHRcdFx0XHRjbGFzc05hbWU9XCJ2LXNjcm9sbCBsb2FkZWQtcGx1Z2lucy1saXN0XCJcblx0XHRcdFx0XHRcdFx0c3R5bGU9e3tcblx0XHRcdFx0XHRcdFx0XHRib3JkZXJSaWdodDogXCIxcHggc29saWQgIzg4ODVcIixcblx0XHRcdFx0XHRcdFx0fX1cblx0XHRcdFx0XHRcdD5cblx0XHRcdFx0XHRcdFx0PGRpdj5cblx0XHRcdFx0XHRcdFx0XHQ8ZGl2PlxuXHRcdFx0XHRcdFx0XHRcdFx0e2xvYWRlZFBsdWdpbnNMaXN0Lm1hcCgoa2V5KSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IGxvYWRQbHVnaW4gPSBsb2FkZWRQbHVnaW5zW2tleV07XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IGhhdmVDb25maWcgPSBsb2FkUGx1Z2luLmhhdmVDb25maWdFbGVtZW50KCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiAoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gcm9tZS1pZ25vcmUgbGludC9hMTF5L3VzZUtleVdpdGhDbGlja0V2ZW50czogPGV4cGxhbmF0aW9uPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxkaXZcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNsYXNzTmFtZT17XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGhhdmVDb25maWdcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ/IHNlbGVjdGVkUGx1Z2luPy5tYW5pZmVzdC5zbHVnID09PSBrZXlcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdD8gXCJwbHVnaW4tYnRuIHNlbGVjdGVkXCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDogXCJwbHVnaW4tYnRuXCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ6IFwicGx1Z2luLWJ0bi1kaXNhYmxlZCBwbHVnaW4tYnRuXCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRhdGEtcGx1Z2luLXNsdWc9e2tleX1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9uQ2xpY2s9eygpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKGhhdmVDb25maWcpIHNldFNlbGVjdGVkUGx1Z2luKGxvYWRQbHVnaW4pO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fX1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9XCJwbHVnaW4tbGlzdC1uYW1lXCI+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHtsb2FkUGx1Z2luLm1hbmlmZXN0Lm5hbWV9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8L3NwYW4+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR7Lyogcm9tZS1pZ25vcmUgbGludC9hMTF5L3VzZUtleVdpdGhDbGlja0V2ZW50czogPGV4cGxhbmF0aW9uPiAqL31cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0KCFsb2FkUGx1Z2luLnBsdWdpblBhdGguaW5jbHVkZXMoXCIuL3BsdWdpbnNfZGV2XCIpICYmIGxvYWRQbHVnaW4ubWFuaWZlc3QubmFtZSAhPT0gXCJQbHVnaW5NYXJrZXRcIikgJiZcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0KFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxzcGFuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjbGFzc05hbWU9XCJwbHVnaW4tdW5pbnN0YWxsLWJ0blwiXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRvbkNsaWNrPXthc3luYyAoZSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IHJlcXVpcmVSZXN0YXJ0ID0gbG9hZFBsdWdpbi5tYW5pZmVzdC5yZXF1aXJlX3Jlc3RhcnQgfHwgbG9hZFBsdWdpbi5tYW5pZmVzdC5uYXRpdmVfcGx1Z2luXG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgcGx1Z2luRmlsZVBhdGggPVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGF3YWl0IEJldHRlck5DTS5mcy5yZWFkRmlsZVRleHQoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRgJHtsb2FkUGx1Z2luLnBsdWdpblBhdGh9Ly5wbHVnaW4ucGF0aC5tZXRhYCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAocGx1Z2luRmlsZVBhdGgubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGF3YWl0IEJldHRlck5DTS5mcy5yZW1vdmUocGx1Z2luRmlsZVBhdGgpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYocmVxdWlyZVJlc3RhcnQpe1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YmV0dGVybmNtX25hdGl2ZS5hcHAucmVzdGFydCgpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fWVsc2V7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRhd2FpdCBCZXR0ZXJOQ00uYXBwLnJlbG9hZFBsdWdpbnMoKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdEJldHRlck5DTS5yZWxvYWQoKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH19XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PHN2Z1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0d2lkdGg9ezI0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRoZWlnaHQ9ezI0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR2aWV3Qm94PVwiMCAwIDI0IDI0XCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZmlsbD1cIm5vbmVcIlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzdHJva2U9XCJjdXJyZW50Q29sb3JcIlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzdHJva2VXaWR0aD17Mn1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0c3Ryb2tlTGluZWNhcD1cInJvdW5kXCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0c3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNsYXNzTmFtZT1cImZlYXRoZXIgZmVhdGhlci10cmFzaC0yXCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PHBvbHlsaW5lIHBvaW50cz1cIjMgNiA1IDYgMjEgNlwiIC8+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxwYXRoIGQ9XCJNMTkgNnYxNGEyIDIgMCAwIDEtMiAySDdhMiAyIDAgMCAxLTItMlY2bTMgMFY0YTIgMiAwIDAgMSAyLTJoNGEyIDIgMCAwIDEgMiAydjJcIiAvPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8bGluZSB4MT17MTB9IHkxPXsxMX0geDI9ezEwfSB5Mj17MTd9IC8+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxsaW5lIHgxPXsxNH0geTE9ezExfSB4Mj17MTR9IHkyPXsxN30gLz5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDwvc3ZnPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDwvc3Bhbj5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0XHRcdH0pfVxuXHRcdFx0XHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJ2LXNjcm9sbFwiPlxuXHRcdFx0XHRcdFx0XHQ8ZGl2PlxuXHRcdFx0XHRcdFx0XHRcdDxkaXZcblx0XHRcdFx0XHRcdFx0XHRcdHN0eWxlPXt7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdG92ZXJmbG93WTogXCJzY3JvbGxcIixcblx0XHRcdFx0XHRcdFx0XHRcdFx0b3ZlcmZsb3dYOiBcImhpZGRlblwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRwYWRkaW5nOiBcIjE2cHhcIixcblx0XHRcdFx0XHRcdFx0XHRcdH19XG5cdFx0XHRcdFx0XHRcdFx0XHRyZWY9e3BsdWdpbkNvbmZpZ1JlZn1cblx0XHRcdFx0XHRcdFx0XHQvPlxuXHRcdFx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdDwvc2VjdGlvbj5cblx0XHRcdFx0KX1cblx0XHRcdDwvZGl2PlxuXHRcdDwvZGl2PlxuXHQpO1xufTtcbiIsICJleHBvcnQgaW50ZXJmYWNlIEluamVjdEZpbGUge1xuXHRmaWxlOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSGlqYWNrT3BlcmF0aW9uIHtcblx0dHlwZTogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEhpamFja1JlcGxhY2VPclJlZ2V4T3BlcmF0aW9uIGV4dGVuZHMgSGlqYWNrT3BlcmF0aW9uIHtcblx0dHlwZTogXCJyZXBsYWNlXCIgfCBcInJlZ2V4XCI7XG5cdGZyb206IHN0cmluZztcblx0dG86IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBIaWphY2tBcHBlbmRPclByZXBlbmRPcGVyYXRpb24gZXh0ZW5kcyBIaWphY2tPcGVyYXRpb24ge1xuXHR0eXBlOiBcImFwcGVuZFwiIHwgXCJwcmVwZW5kXCI7XG5cdGNvZGU6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQbHVnaW5NYW5pZmVzdCB7XG5cdG5hdGl2ZV9wbHVnaW46IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0cmVxdWlyZV9yZXN0YXJ0OiBib29sZWFuIHwgdW5kZWZpbmVkO1xuXHRtYW5pZmVzdF92ZXJzaW9uOiBudW1iZXI7XG5cdG5hbWU6IHN0cmluZztcblx0dmVyc2lvbjogc3RyaW5nO1xuXHRzbHVnOiBzdHJpbmc7XG5cdC8qKiBcdTY2MkZcdTU0MjZcdTc5ODFcdTc1MjhcdTgxRUFcdTVFMjZcdTc2ODRcdTVGMDBcdTUzRDFcdTkxQ0RcdThGN0RcdTUyOUZcdTgwRkRcdUZGMENcdTkwMDJcdTc1MjhcdTRFOEVcdTkwQTNcdTRFOUJcdTk3MDBcdTg5ODFcdTgxRUFcdTUyMzZcdTcwRURcdTkxQ0RcdThGN0RcdTc2ODRcdTYzRDJcdTRFRjZcdTVGMDBcdTUzRDFcdTgwMDVcdTRFRUNcdUZGMENcdTlFRDhcdThCQTRcdTRFMERcdTc5ODFcdTc1MjggKi9cblx0bm9EZXZSZWxvYWQ/OiBib29sZWFuO1xuXHRsb2FkQWZ0ZXI/OiBzdHJpbmdbXTtcblx0bG9hZEJlZm9yZT86IHN0cmluZ1tdO1xuXHRpbmplY3RzOiB7IFtwYWdlVHlwZTogc3RyaW5nXTogSW5qZWN0RmlsZVtdIH07XG5cdGhpamFja3M6IHtcblx0XHRbdmVyc2lvblJhbmdlOiBzdHJpbmddOiB7XG5cdFx0XHRbbWF0Y2hVcmxQYXRoOiBzdHJpbmddOlxuXHRcdFx0fCBIaWphY2tSZXBsYWNlT3JSZWdleE9wZXJhdGlvblxuXHRcdFx0fCBIaWphY2tBcHBlbmRPclByZXBlbmRPcGVyYXRpb247XG5cdFx0fTtcblx0fTtcbn1cblxuZXhwb3J0IGNsYXNzIE5DTVBsdWdpbiBleHRlbmRzIEV2ZW50VGFyZ2V0IHtcblx0cGx1Z2luUGF0aDogc3RyaW5nID0gXCJcIjtcblx0aW5qZWN0czogTkNNSW5qZWN0UGx1Z2luW10gPSBbXTtcblx0bWFuaWZlc3Q6IFBsdWdpbk1hbmlmZXN0O1xuXHRmaW5pc2hlZDogYm9vbGVhbiA9IGZhbHNlO1xuXHQjaGF2ZUNvbmZpZ0VsZTogYm9vbGVhbiB8IG51bGwgPSBudWxsO1xuXHRkZXZNb2RlOiBib29sZWFuID0gZmFsc2U7XG5cdGNvbnN0cnVjdG9yKG1hbmlmZXN0OiBQbHVnaW5NYW5pZmVzdCwgcGx1Z2luUGF0aDogc3RyaW5nLCBkZXZNb2RlOiBib29sZWFuKSB7XG5cdFx0c3VwZXIoKTtcblx0XHR0aGlzLmRldk1vZGUgPSBkZXZNb2RlO1xuXHRcdHRoaXMubWFuaWZlc3QgPSBtYW5pZmVzdDtcblx0XHR0aGlzLnBsdWdpblBhdGggPSBwbHVnaW5QYXRoO1xuXHRcdHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgKGV2dDogQ3VzdG9tRXZlbnQpID0+IHtcblx0XHRcdHRoaXMuaW5qZWN0cy5mb3JFYWNoKChpbmplY3QpID0+IHtcblx0XHRcdFx0aW5qZWN0LmRpc3BhdGNoRXZlbnQoZXZ0KTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHRcdHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcImFsbHBsdWdpbnNsb2FkZWRcIiwgKGV2dDogQ3VzdG9tRXZlbnQpID0+IHtcblx0XHRcdHRoaXMuaW5qZWN0cy5mb3JFYWNoKChpbmplY3QpID0+IHtcblx0XHRcdFx0aW5qZWN0LmRpc3BhdGNoRXZlbnQoZXZ0KTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9XG5cdGhhdmVDb25maWdFbGVtZW50KCkge1xuXHRcdGlmICh0aGlzLiNoYXZlQ29uZmlnRWxlID09IG51bGwpXG5cdFx0XHR0aGlzLiNoYXZlQ29uZmlnRWxlID1cblx0XHRcdFx0dGhpcy5pbmplY3RzLnJlZHVjZTxIVE1MRWxlbWVudCB8IG51bGw+KFxuXHRcdFx0XHRcdChwcmV2aW91cywgcGx1Z2luKSA9PiBwcmV2aW91cyA/PyBwbHVnaW4uX2dldENvbmZpZ0VsZW1lbnQoKSxcblx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHQpICE9PSBudWxsO1xuXHRcdHJldHVybiB0aGlzLiNoYXZlQ29uZmlnRWxlO1xuXHR9XG59XG5cbm5hbWVzcGFjZSBjb25maWdUb29sQm94IHtcblx0ZXhwb3J0IGZ1bmN0aW9uIG1ha2VCdG4oXG5cdFx0dGV4dDogc3RyaW5nLFxuXHRcdG9uQ2xpY2s6ICgpID0+IHZvaWQsXG5cdFx0c21hbGxlciA9IGZhbHNlLFxuXHRcdGFyZ3MgPSB7fSxcblx0KSB7XG5cdFx0cmV0dXJuIGRvbShcImFcIiwge1xuXHRcdFx0Y2xhc3M6IFtcInUtaWJ0bjVcIiwgc21hbGxlciAmJiBcInUtaWJ0bnN6OFwiXSxcblx0XHRcdHN0eWxlOiB7IG1hcmdpbjogXCIuMmVtIC41ZW1cIiB9LFxuXHRcdFx0aW5uZXJUZXh0OiB0ZXh0LFxuXHRcdFx0b25jbGljazogb25DbGljayxcblx0XHRcdC4uLmFyZ3MsXG5cdFx0fSk7XG5cdH1cblxuXHRleHBvcnQgZnVuY3Rpb24gbWFrZUNoZWNrYm94KGFyZ3MgPSB7fSkge1xuXHRcdHJldHVybiBkb20oXCJpbnB1dFwiLCB7IHR5cGU6IFwiY2hlY2tib3hcIiwgLi4uYXJncyB9KTtcblx0fVxuXG5cdGV4cG9ydCBmdW5jdGlvbiBtYWtlSW5wdXQodmFsdWUsIGFyZ3MgPSB7fSkge1xuXHRcdHJldHVybiBkb20oXCJpbnB1dFwiLCB7XG5cdFx0XHR2YWx1ZSxcblx0XHRcdHN0eWxlOiB7IG1hcmdpbjogXCIuMmVtIC41ZW1cIiwgYm9yZGVyUmFkaXVzOiBcIi41ZW1cIiB9LFxuXHRcdFx0Y2xhc3M6IFtcInUtdHh0XCIsIFwic2MtZmxhZ1wiXSxcblx0XHRcdC4uLmFyZ3MsXG5cdFx0fSk7XG5cdH1cbn1cblxuZXhwb3J0IGNsYXNzIE5DTUluamVjdFBsdWdpbiBleHRlbmRzIEV2ZW50VGFyZ2V0IHtcblx0cGx1Z2luUGF0aDogc3RyaW5nID0gXCJcIjtcblx0bWFuaWZlc3Q6IFBsdWdpbk1hbmlmZXN0O1xuXHRjb25maWdWaWV3RWxlbWVudDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcblx0bWFpblBsdWdpbjogTkNNUGx1Z2luO1xuXHRsb2FkRXJyb3I6IEVycm9yIHwgbnVsbCA9IG51bGw7XG5cdGZpbmlzaGVkOiBib29sZWFuID0gZmFsc2U7XG5cdGNvbnN0cnVjdG9yKG1haW5QbHVnaW46IE5DTVBsdWdpbiwgcHVibGljIHJlYWRvbmx5IGZpbGVQYXRoOiBzdHJpbmcpIHtcblx0XHRzdXBlcigpO1xuXHRcdHRoaXMubWFpblBsdWdpbiA9IG1haW5QbHVnaW47XG5cdFx0dGhpcy5tYW5pZmVzdCA9IG1haW5QbHVnaW4ubWFuaWZlc3Q7XG5cdFx0dGhpcy5wbHVnaW5QYXRoID0gbWFpblBsdWdpbi5wbHVnaW5QYXRoO1xuXHR9XG5cblx0b25Mb2FkKGZuOiAoc2VsZlBsdWdpbjogTkNNUGx1Z2luLCBldnQ6IEN1c3RvbUV2ZW50KSA9PiB2b2lkKSB7XG5cdFx0dGhpcy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCAoZXZ0OiBDdXN0b21FdmVudCkgPT4ge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0Zm4uY2FsbCh0aGlzLCBldnQuZGV0YWlsLCBldnQpO1xuXHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHR0aGlzLmxvYWRFcnJvciA9IGU7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblx0Ly8gcm9tZS1pZ25vcmUgbGludC9zdXNwaWNpb3VzL25vRXhwbGljaXRBbnk6IFRPRE86IFx1NURFNVx1NTE3N1x1N0M3Qlx1NTNDMlx1NjU3MFxuXHRvbkNvbmZpZyhmbjogKHRvb2xzQm94OiBhbnkpID0+IEhUTUxFbGVtZW50KSB7XG5cdFx0dGhpcy5hZGRFdmVudExpc3RlbmVyKFwiY29uZmlnXCIsIChldnQ6IEN1c3RvbUV2ZW50KSA9PiB7XG5cdFx0XHR0aGlzLmNvbmZpZ1ZpZXdFbGVtZW50ID0gZm4uY2FsbCh0aGlzLCBldnQuZGV0YWlsKTtcblx0XHR9KTtcblx0fVxuXHRvbkFsbFBsdWdpbnNMb2FkZWQoXG5cdFx0Zm46IChsb2FkZWRQbHVnaW5zOiB0eXBlb2Ygd2luZG93LmxvYWRlZFBsdWdpbnMsIGV2dDogQ3VzdG9tRXZlbnQpID0+IHZvaWQsXG5cdCkge1xuXHRcdHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcImFsbHBsdWdpbnNsb2FkZWRcIiwgZnVuY3Rpb24gKGV2dDogQ3VzdG9tRXZlbnQpIHtcblx0XHRcdGZuLmNhbGwodGhpcywgZXZ0LmRldGFpbCwgZXZ0KTtcblx0XHR9KTtcblx0fVxuXHRnZXRDb25maWc8VD4oa2V5OiBzdHJpbmcpOiBUIHwgdW5kZWZpbmVkO1xuXHRnZXRDb25maWc8VD4oa2V5OiBzdHJpbmcsIGRlZmF1bHRWYWx1ZTogVCk6IFQ7XG5cdGdldENvbmZpZzxUPihrZXk6IHN0cmluZywgZGVmYXVsdFZhbHVlPzogVCk6IFQgfCB1bmRlZmluZWQge1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBjb25maWcgPSBKU09OLnBhcnNlKFxuXHRcdFx0XHRsb2NhbFN0b3JhZ2UuZ2V0SXRlbShgY29uZmlnLmJldHRlcm5jbS4ke3RoaXMubWFuaWZlc3Quc2x1Z31gKSB8fCBcInt9XCIsXG5cdFx0XHQpO1xuXHRcdFx0aWYgKGNvbmZpZ1trZXldICE9PSB1bmRlZmluZWQpIHJldHVybiBjb25maWdba2V5XTtcblx0XHR9IGNhdGNoIHsgfVxuXHRcdHJldHVybiBkZWZhdWx0VmFsdWU7XG5cdH1cblx0c2V0Q29uZmlnPFQ+KGtleTogc3RyaW5nLCB2YWx1ZTogVCkge1xuXHRcdGxldCBjb25maWcgPSBKU09OLnBhcnNlKFxuXHRcdFx0bG9jYWxTdG9yYWdlLmdldEl0ZW0oYGNvbmZpZy5iZXR0ZXJuY20uJHt0aGlzLm1hbmlmZXN0LnNsdWd9YCkgfHwgXCJ7fVwiLFxuXHRcdCk7XG5cdFx0aWYgKCFjb25maWcgfHwgdHlwZW9mIGNvbmZpZyAhPT0gXCJvYmplY3RcIikge1xuXHRcdFx0Y29uZmlnID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblx0XHR9XG5cdFx0Y29uZmlnW2tleV0gPSB2YWx1ZTtcblx0XHRsb2NhbFN0b3JhZ2VbYGNvbmZpZy5iZXR0ZXJuY20uJHt0aGlzLm1hbmlmZXN0LnNsdWd9YF0gPVxuXHRcdFx0SlNPTi5zdHJpbmdpZnkoY29uZmlnKTtcblx0fVxuXHRfZ2V0Q29uZmlnRWxlbWVudCgpIHtcblx0XHRpZiAoIXRoaXMuY29uZmlnVmlld0VsZW1lbnQpXG5cdFx0XHR0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KFwiY29uZmlnXCIsIHsgZGV0YWlsOiBjb25maWdUb29sQm94IH0pKTtcblx0XHRyZXR1cm4gdGhpcy5jb25maWdWaWV3RWxlbWVudDtcblx0fVxufVxuIiwgImltcG9ydCBCZXR0ZXJOQ00gZnJvbSBcIi4vYmV0dGVybmNtLWFwaVwiO1xuaW1wb3J0IHsgaW5pdFBsdWdpbk1hbmFnZXIsIG9uUGx1Z2luTG9hZGVkIH0gZnJvbSBcIi4vcGx1Z2luLW1hbmFnZXJcIjtcbmltcG9ydCB7IGJldHRlcm5jbUZldGNoIH0gZnJvbSBcIi4vYmV0dGVybmNtLWFwaS9iYXNlXCI7XG5pbXBvcnQgeyBOQ01QbHVnaW4sIE5DTUluamVjdFBsdWdpbiB9IGZyb20gXCIuL3BsdWdpblwiO1xuXG5leHBvcnQgbGV0IGxvYWRlZFBsdWdpbnM6IHR5cGVvZiB3aW5kb3cubG9hZGVkUGx1Z2lucyA9IHt9O1xuXG5jb25zdCBTQUZFX01PREVfS0VZID0gXCJiZXR0ZXJuY20uc2FmZW1vZGVcIjtcbmNvbnN0IExPQURfRVJST1JfS0VZID0gXCJiZXR0ZXJuY20ubG9hZGVycm9yXCI7XG5jb25zdCBDUFBfU0lERV9JTkpFQ1RfRElTQUJMRV9LRVkgPVxuXHRcImNjLm1pY3JvYmxvY2suYmV0dGVybmNtLmNwcF9zaWRlX2luamVjdF9mZWF0dXJlX2Rpc2FibGVkXCI7XG5cbi8qKlxuICogXHU3OTgxXHU3NTI4XHU1Qjg5XHU1MTY4XHU2QTIxXHU1RjBGXHVGRjBDXHU1QzA2XHU0RjFBXHU1NzI4XHU0RTBCXHU0RTAwXHU2QjIxXHU5MUNEXHU4RjdEXHU3NTFGXHU2NTQ4XG4gKlxuICogXHU4QkU2XHU2MEM1XHU4QkY3XHU1M0MyXHU5NjA1IGBlbmFibGVTYWZlTW9kZWBcbiAqXG4gKiBAc2VlIHtAbGluayBlbmFibGVTYWZlTW9kZX1cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRpc2FibGVTYWZlTW9kZSgpIHtcblx0YXdhaXQgQmV0dGVyTkNNLmFwcC53cml0ZUNvbmZpZyhDUFBfU0lERV9JTkpFQ1RfRElTQUJMRV9LRVksIFwiZmFsc2VcIik7XG5cdGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFNBRkVfTU9ERV9LRVkpO1xuXHRsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShMT0FEX0VSUk9SX0tFWSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZW5SYW5kb21TdHJpbmcobGVuZ3RoOiBudW1iZXIpIHtcblx0Y29uc3Qgd29yZHMgPSBcIjAxMjM0NTY3ODlBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hUWmFiY2RlZmdoaWtsbW5vcHFyc3R1dnd4eXpcIjtcblx0Y29uc3QgcmVzdWx0OiBzdHJpbmdbXSA9IFtdO1xuXHRmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG5cdFx0cmVzdWx0LnB1c2god29yZHMuY2hhckF0KE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHdvcmRzLmxlbmd0aCkpKTtcblx0fVxuXHRyZXR1cm4gcmVzdWx0LmpvaW4oXCJcIik7XG59XG5cbi8qKlxuICogXHU1NDJGXHU3NTI4XHU1Qjg5XHU1MTY4XHU2QTIxXHU1RjBGXHVGRjBDXHU1QzA2XHU0RjFBXHU1NzI4XHU0RTBCXHU0RTAwXHU2QjIxXHU5MUNEXHU4RjdEXHU3NTFGXHU2NTQ4XG4gKlxuICogXHU1NzI4XHU4QkU1XHU2QTIxXHU1RjBGXHU0RTBCXHVGRjBDXHU1M0VBXHU0RjFBXHU1MkEwXHU4RjdEXHU2M0QyXHU0RUY2XHU3QkExXHU3NDA2XHU1NjY4XHU2NzJDXHU4RUFCXHVGRjBDXHU2MjQwXHU2NzA5XHU2M0QyXHU0RUY2XHVGRjA4XHU1MzA1XHU2MkVDXHU2M0QyXHU0RUY2XHU1NTQ2XHU1RTk3XHVGRjA5XHU1QzA2XHU0RjFBXHU4OEFCXHU1RkZEXHU3NTY1XHU1MkEwXHU4RjdEXG4gKlxuICogXHU1NDBDXHU2NUY2XHU1OTgyXHU2NzlDXHU2NzA5XHU1MkEwXHU4RjdEXHU5NTE5XHU4QkVGXHU3Njg0XHU2MEM1XHU1MUI1XHU3Njg0XHU4QkREXHVGRjA4XHU1MzczXHU4QkJFXHU3RjZFXHU0RTg2IGBMT0FEX0VSUk9SX0tFWWBcdUZGMDlcdTUyMTlcdTRGMUFcdTU3MjhcdTYzRDJcdTRFRjZcdTdCQTFcdTc0MDZcdTU2NjhcdTUxODVcdTY2M0VcdTc5M0FcbiAqXG4gKiBcdTRGOUJcdTc1MjhcdTYyMzdcdTU0OENcdTYzRDJcdTRFRjZcdTRGNUNcdTgwMDVcdTYzOTJcdTY3RTVcdTUyQTBcdThGN0RcdTk1MTlcdThCRUZcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVuYWJsZVNhZmVNb2RlKCkge1xuXHRhd2FpdCBCZXR0ZXJOQ00uYXBwLndyaXRlQ29uZmlnKENQUF9TSURFX0lOSkVDVF9ESVNBQkxFX0tFWSwgXCJ0cnVlXCIpO1xuXHRsb2NhbFN0b3JhZ2Uuc2V0SXRlbShTQUZFX01PREVfS0VZLCBcInRydWVcIik7XG59XG5cbmV4cG9ydCBjbGFzcyBQbHVnaW5Mb2FkRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG5cdGNvbnN0cnVjdG9yKFxuXHRcdHB1YmxpYyByZWFkb25seSBwbHVnaW5QYXRoOiBzdHJpbmcsXG5cdFx0cHVibGljIHJlYWRvbmx5IHJhd0Vycm9yOiBFcnJvcixcblx0XHRtZXNzYWdlPzogc3RyaW5nLFxuXHRcdG9wdGlvbnM/OiBFcnJvck9wdGlvbnMsXG5cdCkge1xuXHRcdHN1cGVyKG1lc3NhZ2UsIG9wdGlvbnMpO1xuXHR9XG5cblx0b3ZlcnJpZGUgdG9TdHJpbmcoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gYFx1NjNEMlx1NEVGNiAke3RoaXMucGx1Z2luUGF0aH0gXHU1MkEwXHU4RjdEXHU1MUZBXHU5NTE5OiAke3RoaXMucmF3RXJyb3J9YDtcblx0fVxufVxuXG5leHBvcnQgY2xhc3MgRGVwZW5kZW5jeVJlc29sdmVFcnJvciBleHRlbmRzIEVycm9yIHtcblx0Y29uc3RydWN0b3IobWVzc2FnZT86IHN0cmluZywgb3B0aW9ucz86IEVycm9yT3B0aW9ucykge1xuXHRcdHN1cGVyKG1lc3NhZ2UsIG9wdGlvbnMpO1xuXHR9XG5cblx0b3ZlcnJpZGUgdG9TdHJpbmcoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gYFx1NjNEMlx1NEVGNlx1NEY5RFx1OEQ1Nlx1ODlFM1x1Njc5MFx1NTFGQVx1OTUxOTogJHt0aGlzfWA7XG5cdH1cbn1cblxuZXhwb3J0IGNvbnN0IGlzU2FmZU1vZGUgPSAoKSA9PiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShTQUZFX01PREVfS0VZKSA9PT0gXCJ0cnVlXCI7XG5cbmV4cG9ydCBjb25zdCBnZXRMb2FkRXJyb3IgPSAoKSA9PiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShMT0FEX0VSUk9SX0tFWSkgfHwgXCJcIjtcblxuZnVuY3Rpb24gc29ydFBsdWdpbnMocGx1Z2luczogTkNNUGx1Z2luW10pIHtcblx0Y2xhc3MgR3JhcGgge1xuXHRcdGFkamFjZW5jeUxpc3QgPSB7fTtcblx0XHRjb25zdHJ1Y3RvcigpIHt9XG5cdFx0YWRkVmVydGV4KHZlcnRleDogc3RyaW5nKSB7XG5cdFx0XHRpZiAoIXRoaXMuYWRqYWNlbmN5TGlzdFt2ZXJ0ZXhdKSB7XG5cdFx0XHRcdHRoaXMuYWRqYWNlbmN5TGlzdFt2ZXJ0ZXhdID0gW107XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGFkZEVkZ2UodjE6IHN0cmluZywgdjI6IHN0cmluZykge1xuXHRcdFx0dGhpcy5hZGphY2VuY3lMaXN0W3YxXS5wdXNoKHYyKTtcblx0XHR9XG5cdH1cblxuXHRjb25zdCBncmFwaCA9IG5ldyBHcmFwaCgpO1xuXHRmb3IgKGNvbnN0IHBsdWdpbiBvZiBwbHVnaW5zKSBncmFwaC5hZGRWZXJ0ZXgocGx1Z2luLm1hbmlmZXN0LnNsdWcpO1xuXHRmb3IgKGNvbnN0IHBsdWdpbiBvZiBwbHVnaW5zKSB7XG5cdFx0aWYgKHBsdWdpbi5tYW5pZmVzdC5sb2FkQmVmb3JlKVxuXHRcdFx0cGx1Z2luLm1hbmlmZXN0LmxvYWRCZWZvcmUuZm9yRWFjaCgoZGVwKSA9PlxuXHRcdFx0XHRncmFwaC5hZGRFZGdlKGRlcCwgcGx1Z2luLm1hbmlmZXN0LnNsdWcpLFxuXHRcdFx0KTtcblx0XHRpZiAocGx1Z2luLm1hbmlmZXN0LmxvYWRBZnRlcilcblx0XHRcdHBsdWdpbi5tYW5pZmVzdC5sb2FkQWZ0ZXIuZm9yRWFjaCgoZGVwKSA9PlxuXHRcdFx0XHRncmFwaC5hZGRFZGdlKHBsdWdpbi5tYW5pZmVzdC5zbHVnLCBkZXApLFxuXHRcdFx0KTtcblx0fVxuXG5cdGZ1bmN0aW9uIGRmc1RvcFNvcnRIZWxwZXIoXG5cdFx0djogc3RyaW5nLFxuXHRcdG46IG51bWJlcixcblx0XHR2aXNpdGVkOiB7IFt4OiBzdHJpbmddOiBib29sZWFuIH0sXG5cdFx0dG9wTnVtczogeyBbeDogc3RyaW5nXTogbnVtYmVyIH0sXG5cdCkge1xuXHRcdHZpc2l0ZWRbdl0gPSB0cnVlO1xuXHRcdGlmICghKHYgaW4gZ3JhcGguYWRqYWNlbmN5TGlzdCkpXG5cdFx0XHR0aHJvdyBuZXcgRGVwZW5kZW5jeVJlc29sdmVFcnJvcihgXHU2MjdFXHU0RTBEXHU1MjMwXHU2M0QyXHU0RUY2ICR7dn1gKTtcblx0XHRjb25zdCBuZWlnaGJvcnMgPSBncmFwaC5hZGphY2VuY3lMaXN0W3ZdO1xuXHRcdGZvciAoY29uc3QgbmVpZ2hib3Igb2YgbmVpZ2hib3JzKSB7XG5cdFx0XHRpZiAoIXZpc2l0ZWRbbmVpZ2hib3JdKSB7XG5cdFx0XHRcdG4gPSBkZnNUb3BTb3J0SGVscGVyKG5laWdoYm9yLCBuLCB2aXNpdGVkLCB0b3BOdW1zKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0dG9wTnVtc1t2XSA9IG47XG5cdFx0cmV0dXJuIG4gLSAxO1xuXHR9XG5cblx0Y29uc3QgdmVydGljZXMgPSBPYmplY3Qua2V5cyhncmFwaC5hZGphY2VuY3lMaXN0KTtcblx0Y29uc3QgdmlzaXRlZCA9IHt9O1xuXHRjb25zdCB0b3BOdW1zID0ge307XG5cdGxldCBuID0gdmVydGljZXMubGVuZ3RoIC0gMTtcblx0Zm9yIChjb25zdCB2IG9mIHZlcnRpY2VzKSB7XG5cdFx0aWYgKCF2aXNpdGVkW3ZdKSB7XG5cdFx0XHRuID0gZGZzVG9wU29ydEhlbHBlcih2LCBuLCB2aXNpdGVkLCB0b3BOdW1zKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIE9iamVjdC5rZXlzKHRvcE51bXMpLm1hcCgoc2x1ZykgPT5cblx0XHRwbHVnaW5zLmZpbmQoKHBsdWdpbikgPT4gcGx1Z2luLm1hbmlmZXN0LnNsdWcgPT09IHNsdWcpLFxuXHQpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBsb2FkUGx1Z2lucygpIHtcblx0aWYgKGlzU2FmZU1vZGUoKSkge1xuXHRcdHdpbmRvdy5sb2FkZWRQbHVnaW5zID0gbG9hZGVkUGx1Z2lucztcblx0XHRyZXR1cm47XG5cdH1cblxuXHRjb25zdCBkZWJvdW5jZWRSZWxvYWQgPSBCZXR0ZXJOQ00udXRpbHMuZGVib3VuY2UoQmV0dGVyTkNNLnJlbG9hZCwgMTAwMCk7XG5cblx0Ly8gcm9tZS1pZ25vcmUgbGludC9zdXNwaWNpb3VzL25vRXhwbGljaXRBbnk6IEFzeW5jRnVuY3Rpb24gXHU1RTc2XHU0RTBEXHU2NkI0XHU5NzMyXHU2MjEwXHU3QzdCXHVGRjBDXHU5NzAwXHU4OTgxXHU2MjRCXHU1MkE4XHU4M0I3XHU1M0Q2XG5cdGNvbnN0IEFzeW5jRnVuY3Rpb24gPSBhc3luYyBmdW5jdGlvbiAoKSB7fS5jb25zdHJ1Y3RvciBhcyBhbnk7XG5cdGNvbnN0IHBhZ2VNYXAgPSB7XG5cdFx0XCIvcHViL2FwcC5odG1sXCI6IFwiTWFpblwiLFxuXHR9O1xuXHRjb25zdCBwYWdlTmFtZSA9IHBhZ2VNYXBbbG9jYXRpb24ucGF0aG5hbWVdO1xuXG5cdGFzeW5jIGZ1bmN0aW9uIGxvYWRQbHVnaW4obWFpblBsdWdpbjogTkNNUGx1Z2luKSB7XG5cdFx0Y29uc3QgZGV2TW9kZSA9IG1haW5QbHVnaW4uZGV2TW9kZTtcblx0XHRjb25zdCBtYW5pZmVzdCA9IG1haW5QbHVnaW4ubWFuaWZlc3Q7XG5cdFx0Y29uc3QgcGx1Z2luUGF0aCA9IG1haW5QbHVnaW4ucGx1Z2luUGF0aDtcblxuXHRcdGlmIChkZXZNb2RlICYmICFtYW5pZmVzdC5ub0RldlJlbG9hZCkge1xuXHRcdFx0YmV0dGVybmNtX25hdGl2ZS5mcy53YXRjaERpcmVjdG9yeShwbHVnaW5QYXRoLCAoX2RpciwgcGF0aCkgPT4ge1xuXHRcdFx0XHRjb25zdCBSRUxPQURfRVhUUyA9IFtcIi5qc1wiLCBcIm1hbmlmZXN0Lmpzb25cIl07XG5cdFx0XHRcdGlmIChSRUxPQURfRVhUUy5maW5kSW5kZXgoKGV4dCkgPT4gcGF0aC5lbmRzV2l0aChleHQpKSAhPT0gLTEpIHtcblx0XHRcdFx0XHRjb25zb2xlLndhcm4oXG5cdFx0XHRcdFx0XHRcIlx1NUYwMFx1NTNEMVx1NjNEMlx1NEVGNlwiLFxuXHRcdFx0XHRcdFx0bWFuaWZlc3QubmFtZSxcblx0XHRcdFx0XHRcdFwiXHU2NTg3XHU0RUY2XCIsXG5cdFx0XHRcdFx0XHRwYXRoLFxuXHRcdFx0XHRcdFx0XCJcdTUzRDFcdTc1MUZcdTY2RjRcdTY1QjBcdUZGMENcdTUzNzNcdTVDMDZcdTkxQ0RcdThGN0RcdUZGMDFcIixcblx0XHRcdFx0XHQpO1xuXG5cdFx0XHRcdFx0ZGVib3VuY2VkUmVsb2FkKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdGFzeW5jIGZ1bmN0aW9uIGxvYWRJbmplY3QoZmlsZVBhdGg6IHN0cmluZykge1xuXHRcdFx0aWYgKCFtYW5pZmVzdC5zbHVnKSByZXR1cm47XG5cdFx0XHRjb25zdCBjb2RlID0gYXdhaXQgQmV0dGVyTkNNLmZzLnJlYWRGaWxlVGV4dChmaWxlUGF0aCk7XG5cblx0XHRcdGlmIChmaWxlUGF0aC5lbmRzV2l0aChcIi5qc1wiKSkge1xuXHRcdFx0XHRjb25zdCBwbHVnaW4gPSBuZXcgTkNNSW5qZWN0UGx1Z2luKG1haW5QbHVnaW4sIGZpbGVQYXRoKTtcblx0XHRcdFx0Y29uc3QgcGx1Z2luRnVuY3Rpb24gPSBuZXcgRnVuY3Rpb24oXCJwbHVnaW5cIiwgYHJldHVybiAoYXN5bmMgZnVuY3Rpb24gJHtmaWxlUGF0aC5yZXBsYWNlQWxsKFwiLVwiLCBcIl9cIikucmVwbGFjZUFsbCgvW15hLXpBLVowLTlfJF0vZywgXCJcIil9KCl7JHtjb2RlfX0pKCk7YCk7XG5cdFx0XHRcdC8vIGdlblJhbmRvbVN0cmluZ1xuXHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkocGx1Z2luRnVuY3Rpb24sIFwibmFtZVwiLCB7XG5cdFx0XHRcdFx0dmFsdWU6IGZpbGVQYXRoLFxuXHRcdFx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZVxuXHRcdFx0XHR9KVxuXHRcdFx0XHRjb25zb2xlLmxvZyhwbHVnaW5GdW5jdGlvbik7XG5cdFx0XHRcdGNvbnN0IGxvYWRpbmdQcm9taXNlID0gcGx1Z2luRnVuY3Rpb24uY2FsbChcblx0XHRcdFx0XHRsb2FkZWRQbHVnaW5zW21hbmlmZXN0LnNsdWddLFxuXHRcdFx0XHRcdHBsdWdpbixcblx0XHRcdFx0KTtcblx0XHRcdFx0YXdhaXQgbG9hZGluZ1Byb21pc2U7XG5cdFx0XHRcdHBsdWdpbi5kaXNwYXRjaEV2ZW50KFxuXHRcdFx0XHRcdG5ldyBDdXN0b21FdmVudChcImxvYWRcIiwge1xuXHRcdFx0XHRcdFx0ZGV0YWlsOiBwbHVnaW4sXG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmIChwbHVnaW4ubG9hZEVycm9yKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IFBsdWdpbkxvYWRFcnJvcihcblx0XHRcdFx0XHRcdGZpbGVQYXRoLFxuXHRcdFx0XHRcdFx0cGx1Z2luLmxvYWRFcnJvcixcblx0XHRcdFx0XHRcdGBcdTYzRDJcdTRFRjZcdTgxMUFcdTY3MkMgJHtmaWxlUGF0aH0gXHU1MkEwXHU4RjdEXHU1MUZBXHU5NTE5OiAke1xuXHRcdFx0XHRcdFx0XHRwbHVnaW4ubG9hZEVycm9yLnN0YWNrIHx8IHBsdWdpbi5sb2FkRXJyb3Jcblx0XHRcdFx0XHRcdH1gLFxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRjYXVzZTogcGx1Z2luLmxvYWRFcnJvcixcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRwbHVnaW4uZmluaXNoZWQgPSB0cnVlO1xuXHRcdFx0XHRsb2FkZWRQbHVnaW5zW21hbmlmZXN0LnNsdWddLmluamVjdHMucHVzaChwbHVnaW4pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIExvYWQgSW5qZWN0c1xuXHRcdGlmIChtYW5pZmVzdC5pbmplY3RzW3BhZ2VOYW1lXSkge1xuXHRcdFx0Zm9yIChjb25zdCBpbmplY3Qgb2YgbWFuaWZlc3QuaW5qZWN0c1twYWdlTmFtZV0pIHtcblx0XHRcdFx0YXdhaXQgbG9hZEluamVjdChgJHtwbHVnaW5QYXRofS8ke2luamVjdC5maWxlfWApO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChtYW5pZmVzdC5pbmplY3RzW2xvY2F0aW9uLnBhdGhuYW1lXSkge1xuXHRcdFx0Zm9yIChjb25zdCBpbmplY3Qgb2YgbWFuaWZlc3QuaW5qZWN0c1tsb2NhdGlvbi5wYXRobmFtZV0pIHtcblx0XHRcdFx0YXdhaXQgbG9hZEluamVjdChgJHtwbHVnaW5QYXRofS8ke2luamVjdC5maWxlfWApO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRtYWluUGx1Z2luLmZpbmlzaGVkID0gdHJ1ZTtcblx0fVxuXG5cdHdpbmRvdy5sb2FkZWRQbHVnaW5zID0gbG9hZGVkUGx1Z2lucztcblxuXHRjb25zdCBwbHVnaW5QYXRocyA9IGF3YWl0IEJldHRlck5DTS5mcy5yZWFkRGlyKFwiLi9wbHVnaW5zX3J1bnRpbWVcIik7XG5cblx0bGV0IHBsdWdpbnM6IE5DTVBsdWdpbltdID0gW107XG5cblx0Y29uc3QgbG9hZFBsdWdpbkJ5UGF0aCA9IGFzeW5jIChwYXRoOiBzdHJpbmcsIGRldk1vZGU6IGJvb2xlYW4pID0+IHtcblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgbWFuaWZlc3QgPSBKU09OLnBhcnNlKFxuXHRcdFx0XHRhd2FpdCBCZXR0ZXJOQ00uZnMucmVhZEZpbGVUZXh0KGAke3BhdGh9L21hbmlmZXN0Lmpzb25gKSxcblx0XHRcdCk7XG5cblx0XHRcdG1hbmlmZXN0LnNsdWcgPVxuXHRcdFx0XHRtYW5pZmVzdC5zbHVnID8/XG5cdFx0XHRcdG1hbmlmZXN0Lm5hbWUucmVwbGFjZSgvW15hLXpBLVowLTkgXS9nLCBcIlwiKS5yZXBsYWNlKC8gL2csIFwiLVwiKTtcblxuXHRcdFx0Y29uc3QgbWFpblBsdWdpbiA9IG5ldyBOQ01QbHVnaW4obWFuaWZlc3QsIHBhdGgsIGRldk1vZGUpO1xuXHRcdFx0cGx1Z2lucy5wdXNoKG1haW5QbHVnaW4pO1xuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdGlmIChlIGluc3RhbmNlb2YgU3ludGF4RXJyb3IpIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gbG9hZCBwbHVnaW46XCIsIGUpO1xuXHRcdFx0ZWxzZSB0aHJvdyBlO1xuXHRcdH1cblx0fTtcblxuXHRwbHVnaW5zID0gc29ydFBsdWdpbnMocGx1Z2lucykgYXMgTkNNUGx1Z2luW107XG5cblx0Y29uc3QgbG9hZFRocmVhZHM6IFByb21pc2U8dm9pZD5bXSA9IFtdO1xuXHRmb3IgKGNvbnN0IHBhdGggb2YgcGx1Z2luUGF0aHMpXG5cdFx0bG9hZFRocmVhZHMucHVzaChsb2FkUGx1Z2luQnlQYXRoKHBhdGgsIGZhbHNlKSk7XG5cblx0aWYgKGJldHRlcm5jbV9uYXRpdmUuZnMuZXhpc3RzKFwiLi9wbHVnaW5zX2RldlwiKSkge1xuXHRcdGNvbnN0IGRldlBsdWdpblBhdGhzID0gYXdhaXQgQmV0dGVyTkNNLmZzLnJlYWREaXIoXCIuL3BsdWdpbnNfZGV2XCIpO1xuXHRcdGZvciAoY29uc3QgcGF0aCBvZiBkZXZQbHVnaW5QYXRocykgYXdhaXQgbG9hZFBsdWdpbkJ5UGF0aChwYXRoLCB0cnVlKTtcblx0fVxuXG5cdGF3YWl0IFByb21pc2UuYWxsKGxvYWRUaHJlYWRzKTtcblx0XG5cdGZvciAoY29uc3QgcGx1Z2luIG9mIHBsdWdpbnMpIHtcblx0XHRpZiAoIShwbHVnaW4ubWFuaWZlc3Quc2x1ZyBpbiBsb2FkZWRQbHVnaW5zKSkge1xuXHRcdFx0bG9hZGVkUGx1Z2luc1twbHVnaW4ubWFuaWZlc3Quc2x1Z10gPSBwbHVnaW47XG5cdFx0XHRjb25zb2xlLmxvZyhcIlx1NkI2M1x1NTcyOFx1NTJBMFx1OEY3RFx1NjNEMlx1NEVGNlwiLCBwbHVnaW4ubWFuaWZlc3Quc2x1Zyk7XG5cdFx0XHRhd2FpdCBsb2FkUGx1Z2luKHBsdWdpbik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUud2Fybihcblx0XHRcdFx0cGx1Z2luLm1hbmlmZXN0LnNsdWcsXG5cdFx0XHRcdFwiZHVwbGljYXRlZCwgdGhlIHBsdWdpbiBhdFwiLFxuXHRcdFx0XHRwbHVnaW4ucGx1Z2luUGF0aCxcblx0XHRcdFx0XCJ3b250IGJlIGxvYWRlZC5cIixcblx0XHRcdCk7XG5cdFx0fVxuXHR9XG5cblx0Zm9yIChjb25zdCBuYW1lIGluIGxvYWRlZFBsdWdpbnMpIHtcblx0XHRjb25zdCBwbHVnaW46IE5DTVBsdWdpbiA9IGxvYWRlZFBsdWdpbnNbbmFtZV07XG5cdFx0cGx1Z2luLmluamVjdHMuZm9yRWFjaCgoaW5qZWN0KSA9PiB7XG5cdFx0XHRpbmplY3QuZGlzcGF0Y2hFdmVudChcblx0XHRcdFx0bmV3IEN1c3RvbUV2ZW50KFwiYWxscGx1Z2luc2xvYWRlZFwiLCB7IGRldGFpbDogbG9hZGVkUGx1Z2lucyB9KSxcblx0XHRcdCk7XG5cdFx0XHRpZiAoaW5qZWN0LmxvYWRFcnJvcikge1xuXHRcdFx0XHR0aHJvdyBuZXcgUGx1Z2luTG9hZEVycm9yKFxuXHRcdFx0XHRcdGluamVjdC5maWxlUGF0aCxcblx0XHRcdFx0XHRpbmplY3QubG9hZEVycm9yLFxuXHRcdFx0XHRcdGBcdTYzRDJcdTRFRjZcdTgxMUFcdTY3MkMgJHtpbmplY3QuZmlsZVBhdGh9IFx1NTJBMFx1OEY3RFx1NTFGQVx1OTUxOTogJHtcblx0XHRcdFx0XHRcdGluamVjdC5sb2FkRXJyb3Iuc3RhY2sgfHwgaW5qZWN0LmxvYWRFcnJvclxuXHRcdFx0XHRcdH1gLFxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGNhdXNlOiBpbmplY3QubG9hZEVycm9yLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gb25Mb2FkRXJyb3IoZTogRXJyb3IpIHtcblx0Y29uc3QgQVRURU1QVFNfS0VZID0gXCJjYy5taWNyb2Jsb2NrLmxvYWRlci5yZWxvYWRQbHVnaW5BdHRlbXB0c1wiO1xuXG5cdGNvbnN0IGF0dGVtcHRzID0gcGFyc2VJbnQoYXdhaXQgQmV0dGVyTkNNLmFwcC5yZWFkQ29uZmlnKEFUVEVNUFRTX0tFWSwgXCIwXCIpKTtcblx0Y29uc3QgcGFzdEVycm9yID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oTE9BRF9FUlJPUl9LRVkpIHx8IFwiXCI7XG5cdGxvY2FsU3RvcmFnZS5zZXRJdGVtKFxuXHRcdExPQURfRVJST1JfS0VZLFxuXHRcdGAke3Bhc3RFcnJvcn1cdTdCMkMgJHthdHRlbXB0cyArIDF9IFx1NkIyMVx1NTJBMFx1OEY3RFx1NTNEMVx1NzUxRlx1OTUxOVx1OEJFRlx1RkYxQVxcbiR7ZS5zdGFjayB8fCBlfVxcblxcbmAsXG5cdCk7XG5cdGlmIChhdHRlbXB0cyA8IDIpIHtcblx0XHRhd2FpdCBCZXR0ZXJOQ00uYXBwLndyaXRlQ29uZmlnKEFUVEVNUFRTX0tFWSwgU3RyaW5nKGF0dGVtcHRzICsgMSkpO1xuXHR9IGVsc2Uge1xuXHRcdGF3YWl0IGVuYWJsZVNhZmVNb2RlKCk7XG5cdFx0YXdhaXQgQmV0dGVyTkNNLmFwcC53cml0ZUNvbmZpZyhBVFRFTVBUU19LRVksIFwiMFwiKTtcblx0fVxuXHQvLyBiZXR0ZXJuY21fbmF0aXZlLmFwcC5yZWxvYWRJZ25vcmVDYWNoZSgpO1xuXHRsb2NhdGlvbi5yZWxvYWQoKTtcbn1cblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGFzeW5jICgpID0+IHtcblx0Ly8gXHU1MkEwXHU4RjdEXHU3QkExXHU3NDA2XHU1NjY4XHU2ODM3XHU1RjBGXHU4ODY4XG5cdGNvbnN0IHN0eWxlQ29udGVudCA9IGJldHRlcm5jbV9uYXRpdmUuaW50ZXJuYWwuZ2V0RnJhbWV3b3JrQ1NTKCk7XG5cdGNvbnN0IHN0eWxlRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG5cdHN0eWxlRWwuaW5uZXJIVE1MID0gc3R5bGVDb250ZW50O1xuXHRkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlRWwpO1xuXG5cdGlmIChcblx0XHQoYXdhaXQgQmV0dGVyTkNNLmFwcC5yZWFkQ29uZmlnKENQUF9TSURFX0lOSkVDVF9ESVNBQkxFX0tFWSwgXCJmYWxzZVwiKSkgPT09XG5cdFx0XCJmYWxzZVwiXG5cdCkge1xuXHRcdGxvY2FsU3RvcmFnZS5zZXRJdGVtKFNBRkVfTU9ERV9LRVksIFwiZmFsc2VcIik7XG5cdH0gZWxzZSB7XG5cdFx0bG9jYWxTdG9yYWdlLnNldEl0ZW0oU0FGRV9NT0RFX0tFWSwgXCJ0cnVlXCIpO1xuXHR9XG5cblx0dHJ5IHtcblx0XHRhd2FpdCBQcm9taXNlLnJhY2UoW1xuXHRcdFx0UHJvbWlzZS5hbGwoW2xvYWRQbHVnaW5zKCksIGluaXRQbHVnaW5NYW5hZ2VyKCldKSxcblx0XHRcdEJldHRlck5DTS51dGlscy5kZWxheSgyMDAwKSxcblx0XHRdKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdG9uTG9hZEVycm9yKGUpO1xuXHRcdHJldHVybjtcblx0fVxuXHRjb25zdCBsb2FkaW5nTWFzayA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZGluZ01hc2tcIilcblx0aWYgKGxvYWRpbmdNYXNrKSB7XG5cdFx0Y29uc3QgYW5pbSA9IGxvYWRpbmdNYXNrLmFuaW1hdGUoXG5cdFx0XHRbeyBvcGFjaXR5OiAxIH0sIHsgb3BhY2l0eTogMCwgZGlzcGxheTogXCJub25lXCIgfV0sXG5cdFx0XHR7XG5cdFx0XHRcdGR1cmF0aW9uOiAzMDAsXG5cdFx0XHRcdGZpbGw6IFwiZm9yd2FyZHNcIixcblx0XHRcdFx0ZWFzaW5nOiBcImN1YmljLWJlemllcigwLjQyLDAsMC41OCwxKVwiLFxuXHRcdFx0fSxcblx0XHQpO1xuXHRcdGFuaW0uY29tbWl0U3R5bGVzKCk7XG5cdH1cblx0b25QbHVnaW5Mb2FkZWQobG9hZGVkUGx1Z2lucyk7IC8vIFx1NjZGNFx1NjVCMFx1NjNEMlx1NEVGNlx1N0JBMVx1NzQwNlx1NTY2OFx1OTBBM1x1OEZCOVx1NzY4NFx1NjNEMlx1NEVGNlx1NTIxN1x1ODg2OFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiOztBQUFPLE1BQVU7QUFBVixJQUFVQSxXQUFWO0FBaUJDLGFBQVMsZUFBZSxVQUFvQixXQUFXLEtBQUs7QUFDbEUsYUFBTyxnQkFBZ0IsTUFBTSxTQUFTLGNBQWMsUUFBUSxHQUFHLFFBQVE7QUFBQSxJQUN4RTtBQUZPLElBQUFBLE9BQVM7QUFVVCxhQUFTLFNBQ2YsVUFDQSxVQUNJO0FBQ0osVUFBSSxRQUFRO0FBQ1osYUFBTyxTQUFTLGtCQUFrQjtBQUNqQyxjQUFNLE9BQU87QUFFYixjQUFNLE9BQU87QUFDYixZQUFJLE9BQU87QUFDVix1QkFBYSxLQUFLO0FBQUEsUUFDbkI7QUFDQSxnQkFBUSxXQUFXLFNBQVMsS0FBSyxNQUFNLElBQUksR0FBRyxRQUFRO0FBQUEsTUFDdkQ7QUFBQSxJQUNEO0FBZE8sSUFBQUEsT0FBUztBQXNCVCxhQUFTLGdCQUNmLE1BQ0EsV0FBVyxLQUNFO0FBQ2IsYUFBTyxJQUFJLFFBQVEsQ0FBQyxPQUFPO0FBQzFCLGNBQU0sU0FBUyxZQUFZLE1BQU07QUFDaEMsZ0JBQU0sU0FBUyxLQUFLO0FBQ3BCLGNBQUksUUFBUTtBQUNYLDBCQUFjLE1BQU07QUFDcEIsZUFBRyxNQUFNO0FBQUEsVUFDVjtBQUFBLFFBQ0QsR0FBRyxRQUFRO0FBQUEsTUFDWixDQUFDO0FBQUEsSUFDRjtBQWJP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QUFlQSxHQUFFLFNBQVNBO0FBQUE7QUFBQTtBQUFBLElBQ3ZEO0FBQ0EsUUFBSSxXQUFXLEdBQUc7QUFDakIsWUFBTSxzQkFBVSxJQUFJLFlBQVksY0FBYyxPQUFPLFdBQVcsQ0FBQyxDQUFDO0FBQUEsSUFDbkUsT0FBTztBQUNOLFlBQU0sZUFBZTtBQUNyQixZQUFNLHNCQUFVLElBQUksWUFBWSxjQUFjLEdBQUc7QUFBQSxJQUNsRDtBQUVBLGFBQVMsT0FBTztBQUFBLEVBQ2pCO0FBRUEsU0FBTyxpQkFBaUIsb0JBQW9CLFlBQVk7QUFFdkQsVUFBTSxlQUFlLGlCQUFpQixTQUFTLGdCQUFnQjtBQUMvRCxVQUFNLFVBQVUsU0FBUyxjQUFjLE9BQU87QUFDOUMsWUFBUSxZQUFZO0FBQ3BCLGFBQVMsS0FBSyxZQUFZLE9BQU87QUFFakMsUUFDRSxNQUFNLHNCQUFVLElBQUksV0FBVyw2QkFBNkIsT0FBTyxNQUNwRSxTQUNDO0FBQ0QsbUJBQWEsUUFBUSxlQUFlLE9BQU87QUFBQSxJQUM1QyxPQUFPO0FBQ04sbUJBQWEsUUFBUSxlQUFlLE1BQU07QUFBQSxJQUMzQztBQUVBLFFBQUk7QUFDSCxZQUFNLFFBQVEsS0FBSztBQUFBLFFBQ2xCLFFBQVEsSUFBSSxDQUFDLFlBQVksR0FBRyxrQkFBa0IsQ0FBQyxDQUFDO0FBQUEsUUFDaEQsc0JBQVUsTUFBTSxNQUFNLEdBQUk7QUFBQSxNQUMzQixDQUFDO0FBQUEsSUFDRixTQUFTQSxJQUFQO0FBQ0Qsa0JBQVlBLEVBQUM7QUFDYjtBQUFBLElBQ0Q7QUFDQSxVQUFNLGNBQWMsU0FBUyxlQUFlLGFBQWE7QUFDekQsUUFBSSxhQUFhO0FBQ2hCLFlBQU0sT0FBTyxZQUFZO0FBQUEsUUFDeEIsQ0FBQyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsU0FBUyxHQUFHLFNBQVMsT0FBTyxDQUFDO0FBQUEsUUFDaEQ7QUFBQSxVQUNDLFVBQVU7QUFBQSxVQUNWLE1BQU07QUFBQSxVQUNOLFFBQVE7QUFBQSxRQUNUO0FBQUEsTUFDRDtBQUNBLFdBQUssYUFBYTtBQUFBLElBQ25CO0FBQ0EsbUJBQWUsYUFBYTtBQUFBLEVBQzdCLENBQUM7IiwKICAibmFtZXMiOiBbInV0aWxzIiwgImRvbSIsICJmcyIsICJhcHAiLCAibmNtIiwgImdldFBsYXlpbmciLCAidGVzdHMiLCAibGF0ZXN0VmVyc2lvbiIsICJsb2FkZWRQbHVnaW5zIiwgImUiLCAiY29uZmlnVG9vbEJveCIsICJlIiwgIm4iLCAidmlzaXRlZCIsICJ0b3BOdW1zIiwgImUiXQp9Cg==
