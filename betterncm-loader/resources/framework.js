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
      return betterncm_native.app.exec(cmd, elevate, showWindow);
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
      return new Promise((resolve, reject) => {
        betterncm_native.app.reloadPlugins(resolve, reject);
      });
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
      betterncm_native.app.setRoundedCorner(enable);
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
    const globalRequireRestart = React.useMemo(
      () => Object.values(loadedPlugins).findIndex(
        (plugin) => plugin.manifest.require_restart || plugin.manifest.native_plugin
      ) !== -1,
      []
    );
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
          await disableSafeMode();
          betterncm_api_default.reload();
        }
      },
      "\u91CD\u542F\u7F51\u6613\u4E91"
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
    const [loadError, setLoadError] = React.useState("");
    React.useEffect(() => {
      getLoadError().then(setLoadError);
    }, []);
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
    splashScreen.setSplashScreenText("\u6B63\u5728\u521D\u59CB\u5316\u63D2\u4EF6\u7BA1\u7406\u5668");
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
    const [safeMode, setSafeMode] = React.useState(false);
    React.useEffect(() => {
      isSafeMode().then(setSafeMode);
    }, []);
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
              !loadPlugin.pluginPath.includes("./plugins_dev") && loadPlugin.manifest.name !== "PluginMarket" && // rome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
              /* @__PURE__ */ h(
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
                        await betterncm_api_default.app.reloadPlugins();
                      }
                      betterncm_api_default.reload();
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
  var splashScreen;
  ((splashScreen2) => {
    function hideSplashScreen() {
      const el = document.getElementById("bncm-splash-screen");
      if (el) {
        const anim = el.animate(
          [{ opacity: 1 }, { opacity: 0, display: "none" }],
          {
            duration: 300,
            fill: "forwards",
            easing: "cubic-bezier(0.42,0,0.58,1)"
          }
        );
        anim.commitStyles();
      }
    }
    splashScreen2.hideSplashScreen = hideSplashScreen;
    function showSplashScreen() {
      return new Promise((resolve) => {
        const el = document.getElementById("bncm-splash-screen");
        if (!el) {
          return resolve();
        }
        const anim = el.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 300,
          fill: "forwards",
          easing: "cubic-bezier(0.42, 0, 0.58, 1)"
        });
        anim.addEventListener(
          "finish",
          (_) => {
            resolve();
          },
          {
            once: true
          }
        );
        anim.commitStyles();
      });
    }
    splashScreen2.showSplashScreen = showSplashScreen;
    function setSplashScreenText(text) {
      const el = document.getElementById("bncm-splash-screen-text");
      if (el) {
        el.innerText = text;
      }
    }
    splashScreen2.setSplashScreenText = setSplashScreenText;
    function setSplashScreenProgress(progress) {
      const el = document.getElementById("bncm-splash-screen-progress");
      if (el) {
        if (progress === 0) {
          el.style.display = "none";
        } else {
          el.style.display = "";
        }
        el.style.width = `${Math.max(0, Math.min(100, progress * 100))}%`;
      }
    }
    splashScreen2.setSplashScreenProgress = setSplashScreenProgress;
  })(splashScreen || (splashScreen = {}));
  async function disableSafeMode() {
    await betterncm_api_default.app.writeConfig(CPP_SIDE_INJECT_DISABLE_KEY, "false");
    await betterncm_api_default.app.writeConfig(SAFE_MODE_KEY, "false");
    await betterncm_api_default.app.writeConfig(LOAD_ERROR_KEY, "");
  }
  async function enableSafeMode() {
    await betterncm_api_default.app.writeConfig(CPP_SIDE_INJECT_DISABLE_KEY, "true");
    await betterncm_api_default.app.writeConfig(SAFE_MODE_KEY, "true");
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
  var isSafeMode = () => betterncm_api_default.app.readConfig(SAFE_MODE_KEY, "false").then((v) => v === "true");
  var getLoadError = () => betterncm_api_default.app.readConfig(LOAD_ERROR_KEY, "").then((v) => v || "");
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
    if (await isSafeMode()) {
      window.loadedPlugins = loadedPlugins;
      return;
    }
    const debouncedReload = betterncm_api_default.utils.debounce(betterncm_api_default.reload, 1e3);
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
          const pluginFunction = new Function(
            "plugin",
            `return (async function ${filePath.replaceAll(/[/\\\.]/g, "_").replaceAll("-", "_").replaceAll(/[^a-zA-Z0-9_$]/g, "")}(){${code}})();`
          );
          Object.defineProperty(pluginFunction, "name", {
            value: filePath,
            configurable: true
          });
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
    splashScreen.setSplashScreenText("\u6B63\u5728\u68C0\u7D22\u63D2\u4EF6");
    splashScreen.setSplashScreenProgress(0);
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
    splashScreen.setSplashScreenText("\u6B63\u5728\u786E\u8BA4\u63D2\u4EF6\u52A0\u8F7D\u987A\u5E8F");
    splashScreen.setSplashScreenProgress(0);
    plugins = sortPlugins(plugins);
    const loadThreads = [];
    for (const path of pluginPaths)
      loadThreads.push(loadPluginByPath(path, false));
    splashScreen.setSplashScreenText("\u6B63\u5728\u68C0\u7D22\u5F00\u53D1\u63D2\u4EF6");
    splashScreen.setSplashScreenProgress(0);
    if (betterncm_native.fs.exists("./plugins_dev")) {
      const devPluginPaths = await betterncm_api_default.fs.readDir("./plugins_dev");
      for (const path of devPluginPaths) {
        splashScreen.setSplashScreenText(`\u6B63\u5728\u52A0\u8F7D\u5F00\u53D1\u63D2\u4EF6 ${path}`);
        await loadPluginByPath(path, true);
      }
    }
    await Promise.all(loadThreads);
    let i = 0;
    for (const plugin of plugins) {
      if (!(plugin.manifest.slug in loadedPlugins)) {
        loadedPlugins[plugin.manifest.slug] = plugin;
        console.log("\u6B63\u5728\u52A0\u8F7D\u63D2\u4EF6", plugin.manifest.slug);
        splashScreen.setSplashScreenText(
          `\u6B63\u5728\u52A0\u8F7D\u63D2\u4EF6 ${plugin.manifest.name} (${i++}/${plugins.length})`
        );
        splashScreen.setSplashScreenProgress(i / plugins.length);
        const startTime = Date.now();
        await loadPlugin(plugin);
        const endTime = Date.now() - startTime;
        console.log("\u63D2\u4EF6\u52A0\u8F7D\u5B8C\u6210", plugin.manifest.slug, "\u7528\u65F6", `${endTime}ms`);
      } else {
        console.warn(
          "\u63D2\u4EF6",
          plugin.manifest.slug,
          "\u51FA\u73B0\u91CD\u590D\uFF0C\u4F4D\u4E8E",
          plugin.pluginPath,
          "\u7684\u63D2\u4EF6\u5C06\u4E0D\u4F1A\u88AB\u52A0\u8F7D"
        );
      }
    }
    splashScreen.setSplashScreenProgress(1);
    splashScreen.setSplashScreenText("\u6B63\u5728\u5B8C\u6210\u52A0\u8F7D");
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
    const pastError = await betterncm_api_default.app.readConfig(LOAD_ERROR_KEY, "");
    await betterncm_api_default.app.writeConfig(
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
      await Promise.race([Promise.all([loadPlugins(), initPluginManager()])]);
    } catch (e2) {
      onLoadError(e2);
      return;
    }
    splashScreen.setSplashScreenText("\u52A0\u8F7D\u5B8C\u6210\uFF01");
    splashScreen.hideSplashScreen();
    onPluginLoaded(loadedPlugins);
  });

  // src/betterncm-api/index.ts
  function reload() {
    splashScreen.setSplashScreenProgress(0);
    splashScreen.setSplashScreenText("\u6B63\u5728\u91CD\u8F7D");
    splashScreen.showSplashScreen().then(() => {
      betterncm_native.app.restart();
    });
  }
  var BetterNCM = {
    fs,
    app,
    ncm,
    utils,
    tests,
    reload,
    betterncmFetch,
    isMRBNCM: true
  };
  window.dom = utils.dom;
  betterncm = BetterNCM;
  var betterncm_api_default = BetterNCM;
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vYmV0dGVybmNtLWpzLWZyYW1ld29yay9zcmMvYmV0dGVybmNtLWFwaS91dGlscy50cyIsICIuLi8uLi9iZXR0ZXJuY20tanMtZnJhbWV3b3JrL3NyYy9iZXR0ZXJuY20tYXBpL3JlYWN0LnRzIiwgIi4uLy4uL2JldHRlcm5jbS1qcy1mcmFtZXdvcmsvc3JjL2JldHRlcm5jbS1hcGkvZnMudHMiLCAiLi4vLi4vYmV0dGVybmNtLWpzLWZyYW1ld29yay9zcmMvYmV0dGVybmNtLWFwaS9iYXNlLnRzIiwgIi4uLy4uL2JldHRlcm5jbS1qcy1mcmFtZXdvcmsvc3JjL2JldHRlcm5jbS1hcGkvYXBwLnRzIiwgIi4uLy4uL2JldHRlcm5jbS1qcy1mcmFtZXdvcmsvc3JjL2JldHRlcm5jbS1hcGkvbmNtLnRzIiwgIi4uLy4uL2JldHRlcm5jbS1qcy1mcmFtZXdvcmsvc3JjL2JldHRlcm5jbS1hcGkvdGVzdHMudHMiLCAiLi4vLi4vYmV0dGVybmNtLWpzLWZyYW1ld29yay9zcmMvcGx1Z2luLW1hbmFnZXIvY29tcG9uZW50cy9idXR0b24udHN4IiwgIi4uLy4uL2JldHRlcm5jbS1qcy1mcmFtZXdvcmsvc3JjL3BsdWdpbi1tYW5hZ2VyL2NvbXBvbmVudHMvcHJvZ3Jlc3MtcmluZy50c3giLCAiLi4vLi4vYmV0dGVybmNtLWpzLWZyYW1ld29yay9zcmMvcGx1Z2luLW1hbmFnZXIvY29tcG9uZW50cy9oZWFkZXIudHN4IiwgIi4uLy4uL2JldHRlcm5jbS1qcy1mcmFtZXdvcmsvc3JjL3BsdWdpbi1tYW5hZ2VyL2NvbXBvbmVudHMvc2FmZS1tb2RlLWluZm8udHN4IiwgIi4uLy4uL2JldHRlcm5jbS1qcy1mcmFtZXdvcmsvc3JjL3BsdWdpbi1tYW5hZ2VyL2NvbXBvbmVudHMvd2FybmluZy50c3giLCAiLi4vLi4vYmV0dGVybmNtLWpzLWZyYW1ld29yay9zcmMvcGx1Z2luLW1hbmFnZXIvaW5kZXgudHN4IiwgIi4uLy4uL2JldHRlcm5jbS1qcy1mcmFtZXdvcmsvc3JjL3BsdWdpbi50cyIsICIuLi8uLi9iZXR0ZXJuY20tanMtZnJhbWV3b3JrL3NyYy9sb2FkZXIudHMiLCAiLi4vLi4vYmV0dGVybmNtLWpzLWZyYW1ld29yay9zcmMvYmV0dGVybmNtLWFwaS9pbmRleC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiZXhwb3J0IG5hbWVzcGFjZSB1dGlscyB7XG5cdHR5cGUgU2VsZWN0b3IgPVxuXHRcdHwga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwXG5cdFx0fCBrZXlvZiBTVkdFbGVtZW50VGFnTmFtZU1hcFxuXHRcdHwgc3RyaW5nO1xuXHRleHBvcnQgZnVuY3Rpb24gd2FpdEZvckVsZW1lbnQ8SyBleHRlbmRzIGtleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcD4oXG5cdFx0c2VsZWN0b3I6IEssXG5cdFx0aW50ZXJ2YWw/OiBudW1iZXIsXG5cdCk6IFByb21pc2U8SFRNTEVsZW1lbnRUYWdOYW1lTWFwW0tdIHwgbnVsbD47XG5cdGV4cG9ydCBmdW5jdGlvbiB3YWl0Rm9yRWxlbWVudDxLIGV4dGVuZHMga2V5b2YgU1ZHRWxlbWVudFRhZ05hbWVNYXA+KFxuXHRcdHNlbGVjdG9yOiBLLFxuXHRcdGludGVydmFsPzogbnVtYmVyLFxuXHQpOiBQcm9taXNlPFNWR0VsZW1lbnRUYWdOYW1lTWFwW0tdIHwgbnVsbD47XG5cdGV4cG9ydCBmdW5jdGlvbiB3YWl0Rm9yRWxlbWVudDxFIGV4dGVuZHMgRWxlbWVudCA9IEVsZW1lbnQ+KFxuXHRcdHNlbGVjdG9yOiBzdHJpbmcsXG5cdFx0aW50ZXJ2YWw/OiBudW1iZXIsXG5cdCk6IFByb21pc2U8RSB8IG51bGw+O1xuXHRleHBvcnQgZnVuY3Rpb24gd2FpdEZvckVsZW1lbnQoc2VsZWN0b3I6IFNlbGVjdG9yLCBpbnRlcnZhbCA9IDEwMCkge1xuXHRcdHJldHVybiB3YWl0Rm9yRnVuY3Rpb24oKCkgPT4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvciksIGludGVydmFsKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBcdTVDMDZcdTYzMDdcdTVCOUFcdTc2ODRcdTUxRkRcdTY1NzBcdTUwNUFcdTk2MzJcdTYyOTZcdTU5MDRcdTc0MDZcblx0ICogQHBhcmFtIGNhbGxiYWNrIFx1OTcwMFx1ODk4MVx1ODhBQlx1OEMwM1x1NzUyOFx1NzY4NFx1NTZERVx1OEMwM1x1NTFGRFx1NjU3MFxuXHQgKiBAcGFyYW0gd2FpdFRpbWUgXHU5NzAwXHU4OTgxXHU3QjQ5XHU1Rjg1XHU1OTFBXHU5NTdGXHU2NUY2XHU5NUY0XHVGRjBDXHU1MzU1XHU0RjREXHU2QkVCXHU3OUQyXG5cdCAqIEByZXR1cm5zIFx1NTMwNVx1ODhDNVx1NTQwRVx1NzY4NFx1OTYzMlx1NjI5Nlx1NTFGRFx1NjU3MFxuXHQgKi9cblx0ZXhwb3J0IGZ1bmN0aW9uIGRlYm91bmNlPFQgZXh0ZW5kcyBGdW5jdGlvbj4oXG5cdFx0Y2FsbGJhY2s6IFQsXG5cdFx0d2FpdFRpbWU6IG51bWJlcixcblx0KTogVCB7XG5cdFx0bGV0IHRpbWVyID0gMDtcblx0XHRyZXR1cm4gZnVuY3Rpb24gZGVib3VuY2VDbG9zdXJlKCkge1xuXHRcdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0XHQvLyByb21lLWlnbm9yZSBsaW50L3N0eWxlL25vQXJndW1lbnRzOiBcdTk2MzJcdTYyOTZcdTUxRkRcdTY1NzBcblx0XHRcdGNvbnN0IGFyZ3MgPSBhcmd1bWVudHM7XG5cdFx0XHRpZiAodGltZXIpIHtcblx0XHRcdFx0Y2xlYXJUaW1lb3V0KHRpbWVyKTtcblx0XHRcdH1cblx0XHRcdHRpbWVyID0gc2V0VGltZW91dChjYWxsYmFjay5iaW5kKHNlbGYsIGFyZ3MpLCB3YWl0VGltZSk7XG5cdFx0fSBhcyB1bmtub3duIGFzIFQ7XG5cdH1cblxuXHQvKipcblx0ICogXHU5MUNEXHU1OTBEXHU4QzAzXHU3NTI4XHU2N0QwXHU1MUZEXHU2NTcwXHVGRjBDXHU3NkY0XHU1MjMwXHU1MTc2XHU4RkQ0XHU1NkRFXHU0RUZCXHU2MTBGXHU3NzFGXHU1MDNDXHVGRjBDXHU1RTc2XHU4RkQ0XHU1NkRFXHU4QkU1XHU3NzFGXHU1MDNDXHUzMDAyXG5cdCAqIEBwYXJhbSBmdW5jIFx1NTFGRFx1NjU3MFxuXHQgKiBAcGFyYW0gaW50ZXJ2YWwgXHU5MUNEXHU1OTBEXHU4QzAzXHU3NTI4XHU2NUY2XHU5NUY0XHU5NUY0XHU5Njk0XG5cdCAqIEByZXR1cm5zIGBmdW5jYCBcdTUxRkRcdTY1NzBcdTc2ODRcdThGRDRcdTU2REVcdTUwM0Ncblx0ICovXG5cdGV4cG9ydCBmdW5jdGlvbiB3YWl0Rm9yRnVuY3Rpb248VD4oXG5cdFx0ZnVuYzogKCkgPT4gVCxcblx0XHRpbnRlcnZhbCA9IDEwMCxcblx0KTogUHJvbWlzZTxUPiB7XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChycykgPT4ge1xuXHRcdFx0Y29uc3QgaGFuZGxlID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuXHRcdFx0XHRjb25zdCByZXN1bHQgPSBmdW5jKCk7XG5cdFx0XHRcdGlmIChyZXN1bHQpIHtcblx0XHRcdFx0XHRjbGVhckludGVydmFsKGhhbmRsZSk7XG5cdFx0XHRcdFx0cnMocmVzdWx0KTtcblx0XHRcdFx0fVxuXHRcdFx0fSwgaW50ZXJ2YWwpO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFx1NTIxQlx1NUVGQVx1NEUwMFx1NEUyQVx1NUMwNlx1NTcyOFx1NEUwMFx1NUI5QVx1NjVGNlx1OTVGNFx1NTQwRSByZXNvbHZlIFx1NzY4NCBQcm9taXNlXG5cdCAqIEBwYXJhbSBtcyBcdTVFRjZcdThGREZcdTY1RjZcdTk1RjRcdUZGMENcdTRFRTVcdTZCRUJcdTc5RDJcdTRFM0FcdTUzNTVcdTRGNERcdTMwMDJcblx0ICogQHJldHVybnMgXHU1QzA2XHU1NzI4bXNcdTZCRUJcdTc5RDJcdTU0MEVyZXNvbHZlXHU3Njg0XHU0RTAwXHU0RTJBUHJvbWlzZVxuXHQgKi9cblx0ZXhwb3J0IGZ1bmN0aW9uIGRlbGF5KG1zOiBudW1iZXIpIHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJzKSA9PiBzZXRUaW1lb3V0KHJzLCBtcykpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFx1N0I4MFx1NjYxM1x1NzY4NFx1NTIxQlx1NUVGQVx1NEUwMFx1NEUyQVx1NTE0M1x1N0QyMFx1NzY4NFx1NTFGRFx1NjU3MFxuXHQgKiBAZGVwcmVjYXRlZCBcdTY1RTlcdTY3MUZcdTY3MkFcdTRGN0ZcdTc1MjggUmVhY3QgXHU2NUY2XHU1MTk5XHU3Njg0XHU4Rjg1XHU1MkE5XHU1MUZEXHU2NTcwXHVGRjBDXHU1REYyXHU1RjAzXHU3NTI4XHVGRjBDXHU4QkY3XHU4MDAzXHU4NjUxXHU0RjdGXHU3NTI4XHU4MUVBXHU1RTI2XHU3Njg0IFJlYWN0IFx1Njc4NFx1NUVGQVx1NTkwRFx1Njc0Mlx1OTg3NVx1OTc2Mlx1MzAwMlxuXHQgKiBAcGFyYW0gdGFnIFx1NTE0M1x1N0QyMFx1N0M3Qlx1NTc4QlxuXHQgKiBAcGFyYW0gc2V0dGluZ3MgXHU1MTQzXHU3RDIwXHU3Njg0XHU1QzVFXHU2MDI3XHU5NTJFXHU1MDNDXHU1QkY5XG5cdCAqIEBwYXJhbSBjaGlsZHJlbiBcdTUxNDNcdTdEMjBcdTc2ODRcdTVCNTBcdTUxNDNcdTdEMjBcdUZGMENcdTYzMDlcdTk4N0FcdTVFOEZcdTZERkJcdTUyQTBcblx0ICogQHJldHVybnNcblx0ICovXG5cdC8vIHJvbWUtaWdub3JlIGxpbnQvc3VzcGljaW91cy9ub0V4cGxpY2l0QW55OiBcdTVDNUVcdTYwMjdcdTk2OEZcdTYxMEZcblx0ZXhwb3J0IGZ1bmN0aW9uIGRvbSh0YWc6IHN0cmluZywgc2V0dGluZ3M6IGFueSwgLi4uY2hpbGRyZW46IEhUTUxFbGVtZW50W10pIHtcblx0XHRjb25zdCB0bXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZyk7XG5cdFx0aWYgKHNldHRpbmdzLmNsYXNzKSB7XG5cdFx0XHRmb3IgKGNvbnN0IGNsIG9mIHNldHRpbmdzLmNsYXNzKSB7XG5cdFx0XHRcdHRtcC5jbGFzc0xpc3QuYWRkKGNsKTtcblx0XHRcdH1cblx0XHRcdHNldHRpbmdzLmNsYXNzID0gdW5kZWZpbmVkO1xuXHRcdH1cblxuXHRcdGlmIChzZXR0aW5ncy5zdHlsZSkge1xuXHRcdFx0Zm9yIChjb25zdCBjbCBpbiBzZXR0aW5ncy5zdHlsZSkge1xuXHRcdFx0XHR0bXAuc3R5bGVbY2xdID0gc2V0dGluZ3Muc3R5bGVbY2xdO1xuXHRcdFx0fVxuXHRcdFx0c2V0dGluZ3Muc3R5bGUgPSB1bmRlZmluZWQ7XG5cdFx0fVxuXG5cdFx0Zm9yIChjb25zdCB2IGluIHNldHRpbmdzKSB7XG5cdFx0XHRpZiAoc2V0dGluZ3Nbdl0pIHRtcFt2XSA9IHNldHRpbmdzW3ZdO1xuXHRcdH1cblxuXHRcdGZvciAoY29uc3QgY2hpbGQgb2YgY2hpbGRyZW4pIHtcblx0XHRcdGlmIChjaGlsZCkgdG1wLmFwcGVuZENoaWxkKGNoaWxkKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRtcDtcblx0fVxufVxuIiwgImltcG9ydCB7IHV0aWxzIH0gZnJvbSBcIi4vdXRpbHNcIjtcblxuZnVuY3Rpb24gaW5pdE5DTVJlYWN0KCkge1xuXHRpZiAoXCJSZWFjdFwiIGluIHdpbmRvdykge1xuXHRcdGlmIChcImNyZWF0ZUVsZW1lbnRcIiBpbiBSZWFjdCAmJiBcIkZyYWdtZW50XCIgaW4gUmVhY3QpIHtcblx0XHRcdHdpbmRvdy5oID0gUmVhY3QuY3JlYXRlRWxlbWVudDtcblx0XHRcdHdpbmRvdy5mID0gUmVhY3QuRnJhZ21lbnQ7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIFwiaFwiIGluIHdpbmRvdyAmJiBcImZcIiBpbiB3aW5kb3c7XG59XG5cbnV0aWxzLndhaXRGb3JGdW5jdGlvbihpbml0TkNNUmVhY3QsIDEwMCk7XG4iLCAiaW1wb3J0IHsgYmV0dGVybmNtRmV0Y2ggfSBmcm9tIFwiLi9iYXNlXCI7XG5cbmNvbnN0IGUgPSBlbmNvZGVVUklDb21wb25lbnQ7XG5cbi8qKlxuICogXHU1NDhDXHU1OTE2XHU3NTRDXHU3Njg0XHU2NTg3XHU0RUY2XHU3Q0ZCXHU3RURGXHU4RkRCXHU4ODRDXHU0RUE0XHU0RTkyXHU3Njg0XHU2M0E1XHU1M0UzXG4gKi9cbmV4cG9ydCBuYW1lc3BhY2UgZnMge1xuXHQvKipcblx0ICogXHU1RjAyXHU2QjY1XHU4QkZCXHU1M0Q2XHU2MzA3XHU1QjlBXHU2NTg3XHU0RUY2XHU1OTM5XHU4REVGXHU1Rjg0XHU0RTBCXHU3Njg0XHU2MjQwXHU2NzA5XHU2NTg3XHU0RUY2XHU1NDhDXHU2NTg3XHU0RUY2XHU1OTM5XG5cdCAqIEBwYXJhbSBmb2xkZXJQYXRoIFx1OTcwMFx1ODk4MVx1OEJGQlx1NTNENlx1NzY4NFx1NjU4N1x1NEVGNlx1NTkzOVx1OERFRlx1NUY4NFxuXHQgKiBAcmV0dXJucyBcdTYyNDBcdTY3MDlcdTY1ODdcdTRFRjZcdTU0OENcdTY1ODdcdTRFRjZcdTU5MzlcdTc2ODRcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdTYyMTZcdTdFRERcdTVCRjlcdThERUZcdTVGODRcblx0ICovXG5cdGV4cG9ydCBmdW5jdGlvbiByZWFkRGlyKGZvbGRlclBhdGg6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nW10+IHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0YmV0dGVybmNtX25hdGl2ZS5mcy5yZWFkRGlyKGZvbGRlclBhdGgsIHJlc29sdmUsIHJlamVjdCk7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogXHU4QkZCXHU1M0Q2XHU2NTg3XHU2NzJDXHU2NTg3XHU0RUY2XHVGRjBDXHU1MkExXHU1RkM1XHU0RkREXHU4QkMxXHU2NTg3XHU0RUY2XHU3RjE2XHU3ODAxXHU2NjJGIFVURi04XG5cdCAqIEBwYXJhbSBmaWxlUGF0aCBcdTk3MDBcdTg5ODFcdThCRkJcdTUzRDZcdTc2ODRcdTY1ODdcdTRFRjZcdThERUZcdTVGODRcblx0ICogQHJldHVybnMgXHU1QkY5XHU1RTk0XHU2NTg3XHU0RUY2XHU3Njg0XHU2NTg3XHU2NzJDXHU1RjYyXHU1RjBGXG5cdCAqL1xuXHRleHBvcnQgZnVuY3Rpb24gcmVhZEZpbGVUZXh0KGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHRiZXR0ZXJuY21fbmF0aXZlLmZzLnJlYWRGaWxlVGV4dChmaWxlUGF0aCwgcmVzb2x2ZSwgcmVqZWN0KTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBcdThCRkJcdTUzRDZcdTY1ODdcdTRFRjZcblx0ICogQHBhcmFtIGZpbGVQYXRoIFx1OTcwMFx1ODk4MVx1OEJGQlx1NTNENlx1NzY4NFx1NjU4N1x1NEVGNlx1OERFRlx1NUY4NFxuXHQgKiBAcmV0dXJucyBibG9iXG5cdCAqL1xuXHRleHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVhZEZpbGUoZmlsZVBhdGg6IHN0cmluZyk6IFByb21pc2U8QmxvYj4ge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHRiZXR0ZXJuY21fbmF0aXZlLmZzLnJlYWRGaWxlKGZpbGVQYXRoLCByZXNvbHZlLCByZWplY3QpO1xuXHRcdH0pLnRoZW4oKHY6IG51bWJlcltdKSA9PiB7XG5cdFx0XHRjb25zdCBkYXRhID0gbmV3IFVpbnQ4QXJyYXkodik7XG5cdFx0XHRjb25zdCBibG9iID0gbmV3IEJsb2IoW2RhdGFdKTtcblx0XHRcdHJldHVybiBibG9iO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFx1NjMwMlx1OEY3RFx1OERFRlx1NUY4NFxuXHQgKiBAcGFyYW0gZmlsZVBhdGggXHU5NzAwXHU4OTgxXHU2MzAyXHU4RjdEXHU3Njg0XHU2NTg3XHU0RUY2XHU1OTM5XHU4REVGXHU1Rjg0XG5cdCAqIEByZXR1cm5zIFx1NjMwMlx1OEY3RFx1NTIzMFx1NzY4NCBodHRwIFx1NTczMFx1NTc0MFxuXHQgKi9cblx0ZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1vdW50RGlyKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoXCJcdTY3MkFcdTVCOUVcdTczQjBcIik7XG5cdH1cblxuXHQvKipcblx0ICogXHU2MzAyXHU4RjdEXHU4REVGXHU1Rjg0XG5cdCAqIEBwYXJhbSBmaWxlUGF0aCBcdTk3MDBcdTg5ODFcdTYzMDJcdThGN0RcdTc2ODRcdTY1ODdcdTRFRjZcdThERUZcdTVGODRcblx0ICogQHJldHVybnMgXHU2MzAyXHU4RjdEXHU1MjMwXHU3Njg0IGh0dHAgXHU1NzMwXHU1NzQwXG5cdCAqL1xuXHRleHBvcnQgYXN5bmMgZnVuY3Rpb24gbW91bnRGaWxlKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoXCJcdTY3MkFcdTVCOUVcdTczQjBcIik7XG5cdH1cblxuXHQvKipcblx0ICogXHU4OUUzXHU1MzhCXHU2MzA3XHU1QjlBXHU3Njg0IFpJUCBcdTUzOEJcdTdGMjlcdTY1ODdcdTRFRjZcdTUyMzBcdTRFMDBcdTRFMkFcdTYzMDdcdTVCOUFcdTc2ODRcdTY1ODdcdTRFRjZcdTU5MzlcdTRFMkRcblx0ICogQHBhcmFtIHppcFBhdGggXHU5NzAwXHU4OTgxXHU4OUUzXHU1MzhCXHU3Njg0IFpJUCBcdTUzOEJcdTdGMjlcdTY1ODdcdTRFRjZcdThERUZcdTVGODRcblx0ICogQHBhcmFtIHVuemlwRGVzdCBcdTk3MDBcdTg5ODFcdTg5RTNcdTUzOEJcdTUyMzBcdTc2ODRcdTY1ODdcdTRFRjZcdTU5MzlcdThERUZcdTVGODRcdUZGMENcdTU5ODJcdTY3OUNcdTRFMERcdTVCNThcdTU3MjhcdTUyMTlcdTRGMUFcdTUyMUJcdTVFRkFcdUZGMENcdTU5ODJcdTY3OUNcdTg5RTNcdTUzOEJcdTY1RjZcdTY3MDlcdTY1ODdcdTRFRjZcdTVCNThcdTU3MjhcdTUyMTlcdTRGMUFcdTg4QUJcdTg5ODZcdTc2RDZcblx0ICogQHJldHVybnMgXHU4RkQ0XHU1NkRFXHU1MDNDXHVGRjBDXHU2NjJGXHU1NDI2XHU2MjEwXHU1MjlGXG5cdCAqL1xuXHRleHBvcnQgYXN5bmMgZnVuY3Rpb24gdW56aXAoXG5cdFx0emlwUGF0aDogc3RyaW5nLFxuXHRcdHVuemlwRGVzdDogc3RyaW5nID0gYCR7emlwUGF0aH1fZXh0cmFjdGVkL2AsXG5cdCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoXCJcdTY3MkFcdTVCOUVcdTczQjBcIik7XG5cdH1cblxuXHQvKipcblx0ICogXHU1QzA2XHU2NTg3XHU2NzJDXHU1MTk5XHU1MTY1XHU1MjMwXHU2MzA3XHU1QjlBXHU2NTg3XHU0RUY2XHU1MTg1XG5cdCAqIEBwYXJhbSBmaWxlUGF0aCBcdTk3MDBcdTg5ODFcdTUxOTlcdTUxNjVcdTc2ODRcdTY1ODdcdTRFRjZcdThERUZcdTVGODRcblx0ICogQHBhcmFtIGNvbnRlbnQgXHU5NzAwXHU4OTgxXHU1MTk5XHU1MTY1XHU3Njg0XHU2NTg3XHU0RUY2XHU1MTg1XHU1QkI5XG5cdCAqIEByZXR1cm5zIFx1NjYyRlx1NTQyNlx1NjIxMFx1NTI5RlxuXHQgKi9cblx0ZXhwb3J0IGZ1bmN0aW9uIHdyaXRlRmlsZVRleHQoXG5cdFx0ZmlsZVBhdGg6IHN0cmluZyxcblx0XHRjb250ZW50OiBzdHJpbmcsXG5cdCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHRiZXR0ZXJuY21fbmF0aXZlLmZzLndyaXRlRmlsZVRleHQoZmlsZVBhdGgsIGNvbnRlbnQsIHJlc29sdmUsIHJlamVjdCk7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogXHU1QzA2XHU2NTg3XHU2NzJDXHU2MjE2XHU0RThDXHU4RkRCXHU1MjM2XHU2NTcwXHU2MzZFXHU1MTk5XHU1MTY1XHU1MjMwXHU2MzA3XHU1QjlBXHU2NTg3XHU0RUY2XHU1MTg1XG5cdCAqIEBwYXJhbSBmaWxlUGF0aCBcdTk3MDBcdTg5ODFcdTUxOTlcdTUxNjVcdTc2ODRcdTY1ODdcdTRFRjZcdThERUZcdTVGODRcblx0ICogQHBhcmFtIGNvbnRlbnQgXHU5NzAwXHU4OTgxXHU1MTk5XHU1MTY1XHU3Njg0XHU2NTg3XHU0RUY2XHU1MTg1XHU1QkI5XG5cdCAqIEByZXR1cm5zIFx1NjYyRlx1NTQyNlx1NjIxMFx1NTI5RlxuXHQgKi9cblx0ZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdyaXRlRmlsZShcblx0XHRmaWxlUGF0aDogc3RyaW5nLFxuXHRcdGNvbnRlbnQ6IHN0cmluZyB8IEJsb2IsXG5cdCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGlmICh0eXBlb2YgY29udGVudCA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0cmV0dXJuIHdyaXRlRmlsZVRleHQoZmlsZVBhdGgsIGNvbnRlbnQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBkYXRhID0gWy4uLm5ldyBVaW50OEFycmF5KGF3YWl0IGNvbnRlbnQuYXJyYXlCdWZmZXIoKSldO1xuXHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdFx0YmV0dGVybmNtX25hdGl2ZS5mcy53cml0ZUZpbGUoZmlsZVBhdGgsIGRhdGEsIHJlc29sdmUsIHJlamVjdCk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogXHU1NzI4XHU2MzA3XHU1QjlBXHU4REVGXHU1Rjg0XHU2NUIwXHU1RUZBXHU2NTg3XHU0RUY2XHU1OTM5XG5cdCAqIEBwYXJhbSBkaXJQYXRoIFx1NjU4N1x1NEVGNlx1NTkzOVx1NzY4NFx1OERFRlx1NUY4NFxuXHQgKiBAcmV0dXJucyBcdTY2MkZcdTU0MjZcdTYyMTBcdTUyOUZcblx0ICovXG5cdGV4cG9ydCBhc3luYyBmdW5jdGlvbiBta2RpcihkaXJQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0YmV0dGVybmNtX25hdGl2ZS5mcy5ta2RpcihkaXJQYXRoLCByZXNvbHZlLCByZWplY3QpO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFx1NjhDMFx1NjdFNVx1NjMwN1x1NUI5QVx1OERFRlx1NUY4NFx1NEUwQlx1NjYyRlx1NTQyNlx1NUI1OFx1NTcyOFx1NjU4N1x1NEVGNlx1NjIxNlx1NjU4N1x1NEVGNlx1NTkzOVxuXHQgKiBAcGFyYW0gcGF0aCBcdTY1ODdcdTRFRjZcdTYyMTZcdTY1ODdcdTRFRjZcdTU5MzlcdTc2ODRcdThERUZcdTVGODRcblx0ICogQHJldHVybnMgXHU2NjJGXHU1NDI2XHU1QjU4XHU1NzI4XG5cdCAqL1xuXHRleHBvcnQgZnVuY3Rpb24gZXhpc3RzKHBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiBiZXR0ZXJuY21fbmF0aXZlLmZzLmV4aXN0cyhwYXRoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBcdTUyMjBcdTk2NjRcdTYzMDdcdTVCOUFcdThERUZcdTVGODRcdTRFMEJcdTc2ODRcdTY1ODdcdTRFRjZcdTYyMTZcdTY1ODdcdTRFRjZcdTU5Mzlcblx0ICogQHBhcmFtIHBhdGggXHU2MzA3XHU1QjlBXHU3Njg0XHU2NTg3XHU0RUY2XHU2MjE2XHU2NTg3XHU0RUY2XHU1OTM5XHU4REVGXHU1Rjg0XG5cdCAqL1xuXHRleHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVtb3ZlKHBhdGg6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHRiZXR0ZXJuY21fbmF0aXZlLmZzLnJlbW92ZShwYXRoLCByZXNvbHZlLCByZWplY3QpO1xuXHRcdH0pO1xuXHR9XG59XG4iLCAiZXhwb3J0IGNvbnN0IGJldHRlcm5jbUZldGNoID0gKFxuXHRyZWxQYXRoOiBzdHJpbmcsXG5cdG9wdGlvbj86IFJlcXVlc3RJbml0ICYge1xuXHRcdGlnbm9yZUFwaUtleT86IGJvb2xlYW47XG5cdH0sXG4pID0+IHtcblx0aWYgKG9wdGlvbikge1xuXHRcdG9wdGlvbi5oZWFkZXJzID0gb3B0aW9uLmhlYWRlcnMgPz8ge307XG5cdFx0aWYgKCFvcHRpb24uaWdub3JlQXBpS2V5KVxuXHRcdFx0b3B0aW9uLmhlYWRlcnNbXCJCRVRURVJOQ01fQVBJX0tFWVwiXSA9IEJFVFRFUk5DTV9BUElfS0VZO1xuXHR9IGVsc2Uge1xuXHRcdG9wdGlvbiA9IHtcblx0XHRcdGhlYWRlcnM6IHsgQkVUVEVSTkNNX0FQSV9LRVkgfSxcblx0XHR9O1xuXHR9XG5cdHJldHVybiBmZXRjaChCRVRURVJOQ01fQVBJX1BBVEggKyByZWxQYXRoLCBvcHRpb24pO1xufTtcbiIsICJpbXBvcnQgeyBiZXR0ZXJuY21GZXRjaCB9IGZyb20gXCIuL2Jhc2VcIjtcblxuY29uc3QgZSA9IGVuY29kZVVSSUNvbXBvbmVudDtcblxuZXhwb3J0IG5hbWVzcGFjZSBhcHAge1xuXHQvKipcblx0ICogXHU2MjY3XHU4ODRDXHU2MzA3XHU1QjlBXHU3Njg0XHU3QTBCXHU1RThGXG5cdCAqIEBwYXJhbSBjbWQgXHU5NzAwXHU4OTgxXHU2MjY3XHU4ODRDXHU3Njg0XHU2MzA3XHU0RUU0XG5cdCAqIEBwYXJhbSBlbGV2YXRlIFx1NjYyRlx1NTQyNlx1NEY3Rlx1NzUyOFx1N0JBMVx1NzQwNlx1NTQ1OFx1Njc0M1x1OTY1MFx1OEZEMFx1ODg0Q1xuXHQgKiBAcGFyYW0gc2hvd1dpbmRvdyBcdTY2MkZcdTU0MjZcdTY2M0VcdTc5M0FcdTYzQTdcdTUyMzZcdTUzRjBcdTdBOTdcdTUzRTNcblx0ICogQHJldHVybnMgVE9ETzogXHU4RkQ0XHU1NkRFXHU3Njg0XHU1NTY1XHU3M0E5XHU2MTBGXG5cdCAqL1xuXHRleHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhlYyhjbWQ6IHN0cmluZywgZWxldmF0ZSA9IGZhbHNlLCBzaG93V2luZG93ID0gZmFsc2UpIHtcblx0XHRyZXR1cm4gYmV0dGVybmNtX25hdGl2ZS5hcHAuZXhlYyhjbWQsIGVsZXZhdGUsIHNob3dXaW5kb3cpO1xuXHR9XG5cblx0bGV0IGJldHRlck5DTVZlcnNpb246IHN0cmluZyB8IG51bGwgPSBudWxsO1xuXG5cdC8qKlxuXHQgKiBcdTgzQjdcdTUzRDZcdTVGNTNcdTUyNEQgQmV0dGVyTkNNIFx1NzY4NFx1NzI0OFx1NjcyQ1x1NTNGN1xuXHQgKiBAcmV0dXJucyBcdTVGNTNcdTUyNEQgQmV0dGVyTkNNIFx1NzY4NFx1NzI0OFx1NjcyQ1x1NTNGN1xuXHQgKi9cblx0ZXhwb3J0IGZ1bmN0aW9uIGdldEJldHRlck5DTVZlcnNpb24oKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gYmV0dGVybmNtX25hdGl2ZS5hcHAudmVyc2lvbigpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFx1NTE2OFx1NUM0Rlx1NjIyQVx1NTZGRVxuXHQgKiBAcmV0dXJucyBcdTYyMkFcdTU2RkVcdTc2ODQgQmxvYiBcdTY1NzBcdTYzNkVcblx0ICovXG5cdGV4cG9ydCBhc3luYyBmdW5jdGlvbiB0YWtlQmFja2dyb3VuZFNjcmVlbnNob3QoKTogUHJvbWlzZTxCbG9iPiB7XG5cdFx0Y29uc3QgciA9IGF3YWl0IGJldHRlcm5jbUZldGNoKFwiL2FwcC9iZ19zY3JlZW5zaG90XCIpO1xuXHRcdHJldHVybiBhd2FpdCByLmJsb2IoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBcdTgzQjdcdTUzRDZcdTdGNTFcdTY2MTNcdTRFOTFcdTdBOTdcdTUzRTNcdTRGNERcdTdGNkVcblx0ICogQHJldHVybnMgXHU0RjREXHU3RjZFXG5cdCAqL1xuXHRleHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0TkNNV2luUG9zKCk6IFByb21pc2U8eyB4OiBudW1iZXI7IHk6IG51bWJlciB9PiB7XG5cdFx0Y29uc3QgciA9IGF3YWl0IGJldHRlcm5jbUZldGNoKFwiL2FwcC9nZXRfd2luX3Bvc2l0aW9uXCIsIHtcblx0XHRcdGlnbm9yZUFwaUtleTogdHJ1ZSxcblx0XHR9KTtcblx0XHRyZXR1cm4gYXdhaXQgci5qc29uKCk7XG5cdH1cblxuXHQvKipcblx0ICogXHU5MUNEXHU2NUIwXHU4OUUzXHU1MzhCXHU2MjQwXHU2NzA5XHU2M0QyXHU0RUY2XG5cdCAqIEByZXR1cm5zIFx1NjYyRlx1NTQyNlx1NjIxMFx1NTI5RlxuXHQgKi9cblx0ZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlbG9hZFBsdWdpbnMoKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdGJldHRlcm5jbV9uYXRpdmUuYXBwLnJlbG9hZFBsdWdpbnMocmVzb2x2ZSwgcmVqZWN0KTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBcdTgzQjdcdTUzRDZcdTc2RUVcdTUyNEQgQmV0dGVyTkNNIFx1NjU3MFx1NjM2RVx1NzZFRVx1NUY1NVxuXHQgKiBAcmV0dXJucyBcdTY1NzBcdTYzNkVcdTc2RUVcdTVGNTVcdThERUZcdTVGODRcblx0ICovXG5cdGV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXREYXRhUGF0aCgpIHtcblx0XHRjb25zdCByID0gYXdhaXQgYmV0dGVybmNtRmV0Y2goXCIvYXBwL2RhdGFwYXRoXCIpO1xuXHRcdGNvbnN0IHAgPSBhd2FpdCByLnRleHQoKTtcblx0XHRyZXR1cm4gcC5yZXBsYWNlKC9cXC8vZywgXCJcXFxcXCIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFx1OEJGQlx1NTNENiBCZXR0ZXJOQ00gXHU4QkJFXHU3RjZFXG5cdCAqIEBwYXJhbSBrZXkgXHU5NTJFXG5cdCAqIEBwYXJhbSBkZWZhdWx0VmFsdWUgXHU5RUQ4XHU4QkE0XHU1MDNDXG5cdCAqIEByZXR1cm5zIFx1OEJGQlx1NTNENlx1NTIzMFx1NzY4NFx1NTAzQ1xuXHQgKi9cblx0ZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlYWRDb25maWcoXG5cdFx0a2V5OiBzdHJpbmcsXG5cdFx0ZGVmYXVsdFZhbHVlOiBzdHJpbmcsXG5cdCk6IFByb21pc2U8c3RyaW5nPiB7XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdGJldHRlcm5jbV9uYXRpdmUuYXBwLnJlYWRDb25maWcoa2V5LCBkZWZhdWx0VmFsdWUsIHJlc29sdmUsIHJlamVjdCk7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogXHU4QkJFXHU3RjZFIEJldHRlck5DTSBcdThCQkVcdTdGNkVcblx0ICogQHBhcmFtIGtleSBcdTk1MkVcblx0ICogQHBhcmFtIHZhbHVlIFx1NTAzQ1xuXHQgKiBAcmV0dXJucyBcdTY2MkZcdTU0MjZcdTYyMTBcdTUyOUZcblx0ICovXG5cdGV4cG9ydCBhc3luYyBmdW5jdGlvbiB3cml0ZUNvbmZpZyhrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHRiZXR0ZXJuY21fbmF0aXZlLmFwcC53cml0ZUNvbmZpZyhrZXksIHZhbHVlLCByZXNvbHZlLCByZWplY3QpO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFx1ODNCN1x1NTNENlx1N0Y1MVx1NjYxM1x1NEU5MVx1NUI4OVx1ODhDNVx1NzZFRVx1NUY1NVxuXHQgKiBAcmV0dXJucyBcdTVCODlcdTg4QzVcdTc2RUVcdTVGNTVcblx0ICovXG5cdGV4cG9ydCBmdW5jdGlvbiBnZXROQ01QYXRoKCkge1xuXHRcdHJldHVybiBiZXR0ZXJuY21fbmF0aXZlLmFwcC5nZXROQ01QYXRoKCk7XG5cdH1cblxuXHQvKipcblx0ICogXHU2MjUzXHU1RjAwXHU3RjUxXHU2NjEzXHU0RTkxXHU0RTNCXHU4RkRCXHU3QTBCXHU3Njg0Q29uc29sZVxuXHQgKiBAcmV0dXJucyBcdTY2MkZcdTU0MjZcdTYyMTBcdTUyOUZcblx0ICovXG5cdGV4cG9ydCBmdW5jdGlvbiBzaG93Q29uc29sZShzaG93ID0gdHJ1ZSkge1xuXHRcdGJldHRlcm5jbV9uYXRpdmUuYXBwLnNob3dDb25zb2xlKHNob3cpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFx1OEJCRVx1N0Y2RVdpbjExIERXTVx1NTcwNlx1ODlEMlx1NUYwMFx1NTQyRlx1NzJCNlx1NjAwMVxuXHQgKiBAcGFyYW0gZW5hYmxlIFx1NjYyRlx1NTQyNlx1NUYwMFx1NTQyRlxuXHQgKiBAcmV0dXJucyBcdTY2MkZcdTU0MjZcdTYyMTBcdTUyOUZcblx0ICovXG5cdGV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRSb3VuZGVkQ29ybmVyKGVuYWJsZSA9IHRydWUpIHtcblx0XHRiZXR0ZXJuY21fbmF0aXZlLmFwcC5zZXRSb3VuZGVkQ29ybmVyKGVuYWJsZSk7XG5cdH1cblxuXHQvKipcblx0ICogXHU2MjUzXHU1RjAwXHU0RTAwXHU0RTJBXHU5MDA5XHU2MkU5XHU2NTg3XHU0RUY2XHU1QkY5XHU4QkREXHU2ODQ2XG5cdCAqIEBwYXJhbSBmaWx0ZXIgXHU4OTgxXHU3QjVCXHU5MDA5XHU3Njg0XHU2NTg3XHU0RUY2XHU3QzdCXHU1NzhCXG5cdCAqIEBwYXJhbSBpbml0aWFsRGlyIFx1NUJGOVx1OEJERFx1Njg0Nlx1NTIxRFx1NTlDQlx1NTczMFx1NTc0MFxuXHQgKiBAcmV0dXJucyBcdTkwMDlcdTYyRTlcdTc2ODRcdTY1ODdcdTRFRjZcdTU3MzBcdTU3NDBcdUZGMENcdTgyRTVcdTY3MkFcdTkwMDlcdTYyRTlcdTUyMTlcdTRFM0FcdTdBN0FcdTVCNTdcdTdCMjZcdTRFMzJcblx0ICovXG5cdGV4cG9ydCBhc3luYyBmdW5jdGlvbiBvcGVuRmlsZURpYWxvZyhcblx0XHRmaWx0ZXI6IHN0cmluZyxcblx0XHRpbml0aWFsRGlyOiBzdHJpbmcsXG5cdCk6IFByb21pc2U8c3RyaW5nPiB7XG5cdFx0Y29uc3QgciA9IGF3YWl0IGJldHRlcm5jbUZldGNoKFxuXHRcdFx0YC9hcHAvb3Blbl9maWxlX2RpYWxvZz9maWx0ZXI9JHtlKGZpbHRlcil9JmluaXRpYWxEaXI9JHtlKGluaXRpYWxEaXIpfWAsXG5cdFx0KTtcblx0XHRyZXR1cm4gYXdhaXQgci50ZXh0KCk7XG5cdH1cblxuXHQvKipcblx0ICogXHU4M0I3XHU1M0Q2XHU1RjUzXHU1MjREXHU0RTNCXHU5ODk4XHU2NjJGXHU1NDI2XHU0RTNBXHU0RUFFXHU4MjcyXHU0RTNCXHU5ODk4XG5cdCAqIEB0b2RvIFx1NkQ0Qlx1OEJENVx1NTcyOCBXaW5kb3dzIDcgXHU1M0NBIFdpbmRvd3MgMTAgXHU0RTBCXHU2NjJGXHU1NDI2XHU2QjYzXHU1RTM4XHU1REU1XHU0RjVDXG5cdCAqIEByZXR1cm5zIFx1NUY1M1x1NTI0RFx1NEUzQlx1OTg5OFx1NjYyRlx1NTQyNlx1NEUzQVx1NEVBRVx1ODI3Mlx1NEUzQlx1OTg5OFxuXHQgKi9cblx0ZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGlzTGlnaHRUaGVtZSgpIHtcblx0XHRjb25zdCByID0gYXdhaXQgYmV0dGVybmNtRmV0Y2goXCIvYXBwL2lzX2xpZ2h0X3RoZW1lXCIpO1xuXHRcdHJldHVybiBhd2FpdCByLmpzb24oKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBcdTgzQjdcdTUzRDZcdTYyNjdcdTg4NENcdTYyMTBcdTUyOUZcdTc2ODQgSGlqYWNrIFx1NjVFNVx1NUZEN1xuXHQgKiBAcmV0dXJucyBIaWphY2sgXHU2NUU1XHU1RkQ3XG5cdCAqL1xuXHRleHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0U3VjY2VlZGVkSGlqYWNrcygpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG5cdFx0Y29uc3QgciA9IGF3YWl0IGJldHRlcm5jbUZldGNoKFwiL2FwcC9nZXRfc3VjY2VlZGVkX2hpamFja3NcIik7XG5cdFx0cmV0dXJuIGF3YWl0IHIuanNvbigpO1xuXHR9XG59XG4iLCAiY29uc3QgY2FjaGVkRnVuY3Rpb25NYXA6IE1hcDxzdHJpbmcsIEZ1bmN0aW9uPiA9IG5ldyBNYXAoKTtcblxuLy8gcm9tZS1pZ25vcmUgbGludC9zdXNwaWNpb3VzL25vRXhwbGljaXRBbnk6IFx1NTFGRFx1NjU3MFx1N0M3Qlx1NTc4Qlx1NTNFRlx1OTY4Rlx1NjEwRlxuZnVuY3Rpb24gY2FsbENhY2hlZFNlYXJjaEZ1bmN0aW9uPEYgZXh0ZW5kcyAoLi4uYXJnczogYW55W10pID0+IGFueT4oXG5cdHNlYXJjaEZ1bmN0aW9uTmFtZTogc3RyaW5nLFxuXHRhcmdzOiBQYXJhbWV0ZXJzPEY+LFxuKTogUmV0dXJuVHlwZTxGPiB7XG5cdGlmICghY2FjaGVkRnVuY3Rpb25NYXAuaGFzKHNlYXJjaEZ1bmN0aW9uTmFtZSkpIHtcblx0XHRjb25zdCBmaW5kUmVzdWx0ID0gbmNtLmZpbmRBcGlGdW5jdGlvbihzZWFyY2hGdW5jdGlvbk5hbWUpO1xuXHRcdGlmIChmaW5kUmVzdWx0KSB7XG5cdFx0XHRjb25zdCBbZnVuYywgZnVuY1Jvb3RdID0gZmluZFJlc3VsdDtcblx0XHRcdGNhY2hlZEZ1bmN0aW9uTWFwLnNldChzZWFyY2hGdW5jdGlvbk5hbWUsIGZ1bmMuYmluZChmdW5jUm9vdCkpO1xuXHRcdH1cblx0fVxuXHRjb25zdCBjYWNoZWRGdW5jID0gY2FjaGVkRnVuY3Rpb25NYXAuZ2V0KHNlYXJjaEZ1bmN0aW9uTmFtZSk7XG5cdGlmIChjYWNoZWRGdW5jKSB7XG5cdFx0cmV0dXJuIGNhY2hlZEZ1bmMuYXBwbHkobnVsbCwgYXJncyk7XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihgXHU1MUZEXHU2NTcwICR7c2VhcmNoRnVuY3Rpb25OYW1lfSBcdTY3MkFcdTYyN0VcdTUyMzBgKTtcblx0fVxufVxuXG5leHBvcnQgbmFtZXNwYWNlIG5jbSB7XG5cdGV4cG9ydCBmdW5jdGlvbiBmaW5kTmF0aXZlRnVuY3Rpb24ob2JqOiBPYmplY3QsIGlkZW50aWZpZXJzOiBzdHJpbmcpIHtcblx0XHRmb3IgKGxldCBrZXkgaW4gb2JqKSB7XG5cdFx0XHRsZXQgZmxhZyA9IHRydWU7XG5cdFx0XHRmb3IgKFxuXHRcdFx0XHRsZXQgX2kgPSAwLCBpZGVudGlmaWVyc18xID0gaWRlbnRpZmllcnM7XG5cdFx0XHRcdF9pIDwgaWRlbnRpZmllcnNfMS5sZW5ndGg7XG5cdFx0XHRcdF9pKytcblx0XHRcdCkge1xuXHRcdFx0XHRsZXQgaWRlbnRpZmllciA9IGlkZW50aWZpZXJzXzFbX2ldO1xuXHRcdFx0XHRpZiAoIW9ialtrZXldLnRvU3RyaW5nKCkuaW5jbHVkZXMoaWRlbnRpZmllcikpIGZsYWcgPSBmYWxzZTtcblx0XHRcdH1cblx0XHRcdGlmIChmbGFnKSByZXR1cm4ga2V5O1xuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBmdW5jdGlvbiBvcGVuVXJsKHVybDogc3RyaW5nKSB7XG5cdFx0Y2hhbm5lbC5jYWxsKFwib3MubmF2aWdhdGVFeHRlcm5hbFwiLCAoKSA9PiB7fSwgW3VybF0pO1xuXHR9XG5cblx0ZXhwb3J0IGZ1bmN0aW9uIGdldE5DTVBhY2thZ2VWZXJzaW9uKCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIHdpbmRvdz8uQVBQX0NPTkY/LnBhY2thZ2VWZXJzaW9uIHx8IFwiMDAwMDAwMFwiO1xuXHR9XG5cblx0ZXhwb3J0IGZ1bmN0aW9uIGdldE5DTUZ1bGxWZXJzaW9uKCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIHdpbmRvdz8uQVBQX0NPTkY/LmFwcHZlciB8fCBcIjAuMC4wLjBcIjtcblx0fVxuXG5cdGV4cG9ydCBmdW5jdGlvbiBnZXROQ01WZXJzaW9uKCk6IHN0cmluZyB7XG5cdFx0Y29uc3QgdiA9IGdldE5DTUZ1bGxWZXJzaW9uKCk7XG5cdFx0cmV0dXJuIHYuc3Vic3RyaW5nKDAsIHYubGFzdEluZGV4T2YoXCIuXCIpKTtcblx0fVxuXG5cdGV4cG9ydCBmdW5jdGlvbiBnZXROQ01CdWlsZCgpOiBudW1iZXIge1xuXHRcdGNvbnN0IHYgPSBnZXROQ01GdWxsVmVyc2lvbigpO1xuXHRcdHJldHVybiBwYXJzZUludCh2LnN1YnN0cmluZyh2Lmxhc3RJbmRleE9mKFwiLlwiKSArIDEpKTtcblx0fVxuXG5cdGV4cG9ydCBmdW5jdGlvbiBzZWFyY2hBcGlGdW5jdGlvbihcblx0XHRuYW1lT3JGaW5kZXI6IHN0cmluZyB8ICgoZnVuYzogRnVuY3Rpb24pID0+IGJvb2xlYW4pLFxuXHRcdC8vIHJvbWUtaWdub3JlIGxpbnQvc3VzcGljaW91cy9ub0V4cGxpY2l0QW55OiBcdTY4MzlcdTVCRjlcdThDNjFcdTUzRUZcdTRFRTVcdTY2MkZcdTRFRkJcdTYxMEZcdTc2ODRcblx0XHRyb290OiBhbnkgPSB3aW5kb3csXG5cdFx0Y3VycmVudFBhdGggPSBbXCJ3aW5kb3dcIl0sXG5cdFx0Ly8gcm9tZS1pZ25vcmUgbGludC9zdXNwaWNpb3VzL25vRXhwbGljaXRBbnk6IFx1NURGMlx1NjhDMFx1N0QyMlx1NUJGOVx1OEM2MVx1NTNFRlx1NEVFNVx1NjYyRlx1NEVGQlx1NjEwRlx1NzY4NFxuXHRcdHByZXZPYmplY3RzOiBhbnlbXSA9IFtdLFxuXHRcdC8vIHJvbWUtaWdub3JlIGxpbnQvc3VzcGljaW91cy9ub0V4cGxpY2l0QW55OiBcdThGRDRcdTU2REVcdThCRTVcdTUxRkRcdTY1NzBcdTc2ODRcdTY0M0FcdTVFMjZcdTVCRjlcdThDNjFcdUZGMENcdTY1QjlcdTRGQkZcdTUwNUEgYmluZCBcdTdFRDFcdTVCOUFcblx0XHRyZXN1bHQ6IFtGdW5jdGlvbiwgYW55LCBzdHJpbmdbXV1bXSA9IFtdLFxuXHRcdC8vIHJvbWUtaWdub3JlIGxpbnQvc3VzcGljaW91cy9ub0V4cGxpY2l0QW55OiBcdThGRDRcdTU2REVcdThCRTVcdTUxRkRcdTY1NzBcdTc2ODRcdTY0M0FcdTVFMjZcdTVCRjlcdThDNjFcdUZGMENcdTY1QjlcdTRGQkZcdTUwNUEgYmluZCBcdTdFRDFcdTVCOUFcblx0KTogW0Z1bmN0aW9uLCBhbnksIHN0cmluZ1tdXVtdIHtcblx0XHRpZiAocm9vdCA9PT0gdW5kZWZpbmVkIHx8IHJvb3QgPT09IG51bGwpIHtcblx0XHRcdHJldHVybiBbXTtcblx0XHR9XG5cdFx0cHJldk9iamVjdHMucHVzaChyb290KTtcblx0XHRpZiAodHlwZW9mIG5hbWVPckZpbmRlciA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0aWYgKHR5cGVvZiByb290W25hbWVPckZpbmRlcl0gPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHRyZXN1bHQucHVzaChbcm9vdFtuYW1lT3JGaW5kZXJdLCByb290LCBbLi4uY3VycmVudFBhdGhdXSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHJvb3QpKSB7XG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHRPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChyb290LCBrZXkpICYmXG5cdFx0XHRcdFx0dHlwZW9mIHJvb3Rba2V5XSA9PT0gXCJmdW5jdGlvblwiICYmXG5cdFx0XHRcdFx0bmFtZU9yRmluZGVyKHJvb3Rba2V5XSlcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0cmVzdWx0LnB1c2goW3Jvb3Rba2V5XSwgcm9vdCwgWy4uLmN1cnJlbnRQYXRoXV0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChjdXJyZW50UGF0aC5sZW5ndGggPCAxMCkge1xuXHRcdFx0Zm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMocm9vdCkpIHtcblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKHJvb3QsIGtleSkgJiZcblx0XHRcdFx0XHR0eXBlb2Ygcm9vdFtrZXldID09PSBcIm9iamVjdFwiICYmXG5cdFx0XHRcdFx0IXByZXZPYmplY3RzLmluY2x1ZGVzKHJvb3Rba2V5XSkgJiZcblx0XHRcdFx0XHQhKFxuXHRcdFx0XHRcdFx0Y3VycmVudFBhdGgubGVuZ3RoID09PSAxICYmXG5cdFx0XHRcdFx0XHRwcmV2T2JqZWN0c1twcmV2T2JqZWN0cy5sZW5ndGggLSAxXSA9PT0gd2luZG93ICYmXG5cdFx0XHRcdFx0XHRrZXkgPT09IFwiYmV0dGVybmNtXCJcblx0XHRcdFx0XHQpIC8vIFx1NTRCMVx1NEVFQ1x1ODFFQVx1NURGMVx1NzY4NFx1NTFGRFx1NjU3MFx1NUMzMVx1NEUwRFx1OTcwMFx1ODk4MVx1NjhDMFx1NkQ0Qlx1NEU4NlxuXHRcdFx0XHQpIHtcblx0XHRcdFx0XHRjdXJyZW50UGF0aC5wdXNoKGtleSk7XG5cdFx0XHRcdFx0c2VhcmNoQXBpRnVuY3Rpb24oXG5cdFx0XHRcdFx0XHRuYW1lT3JGaW5kZXIsXG5cdFx0XHRcdFx0XHRyb290W2tleV0sXG5cdFx0XHRcdFx0XHRjdXJyZW50UGF0aCxcblx0XHRcdFx0XHRcdHByZXZPYmplY3RzLFxuXHRcdFx0XHRcdFx0cmVzdWx0LFxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0Y3VycmVudFBhdGgucG9wKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cHJldk9iamVjdHMucG9wKCk7XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdGV4cG9ydCBmdW5jdGlvbiBzZWFyY2hGb3JEYXRhKFxuXHRcdC8vIHJvbWUtaWdub3JlIGxpbnQvc3VzcGljaW91cy9ub0V4cGxpY2l0QW55OiBcdTRGMUFcdTY4QzBcdTZENEJcdTRFRkJcdTYxMEZcdTUwM0Ncblx0XHRmaW5kZXI6IChmdW5jOiBhbnkpID0+IGJvb2xlYW4sXG5cdFx0Ly8gcm9tZS1pZ25vcmUgbGludC9zdXNwaWNpb3VzL25vRXhwbGljaXRBbnk6IFx1NjgzOVx1NUJGOVx1OEM2MVx1NTNFRlx1NEVFNVx1NjYyRlx1NEVGQlx1NjEwRlx1NzY4NFxuXHRcdHJvb3Q6IGFueSA9IHdpbmRvdyxcblx0XHRjdXJyZW50UGF0aCA9IFtcIndpbmRvd1wiXSxcblx0XHQvLyByb21lLWlnbm9yZSBsaW50L3N1c3BpY2lvdXMvbm9FeHBsaWNpdEFueTogXHU1REYyXHU2OEMwXHU3RDIyXHU1QkY5XHU4QzYxXHU1M0VGXHU0RUU1XHU2NjJGXHU0RUZCXHU2MTBGXHU3Njg0XG5cdFx0cHJldk9iamVjdHM6IGFueVtdID0gW10sXG5cdFx0Ly8gcm9tZS1pZ25vcmUgbGludC9zdXNwaWNpb3VzL25vRXhwbGljaXRBbnk6IFx1OEZENFx1NTZERVx1OEJFNVx1NTFGRFx1NjU3MFx1NzY4NFx1NjQzQVx1NUUyNlx1NUJGOVx1OEM2MVx1RkYwQ1x1NjVCOVx1NEZCRlx1NTA1QSBiaW5kIFx1N0VEMVx1NUI5QVxuXHRcdHJlc3VsdDogW2FueSwgYW55LCBzdHJpbmdbXV1bXSA9IFtdLFxuXHRcdC8vIHJvbWUtaWdub3JlIGxpbnQvc3VzcGljaW91cy9ub0V4cGxpY2l0QW55OiBcdThGRDRcdTU2REVcdThCRTVcdTUxRkRcdTY1NzBcdTc2ODRcdTY0M0FcdTVFMjZcdTVCRjlcdThDNjFcdUZGMENcdTY1QjlcdTRGQkZcdTUwNUEgYmluZCBcdTdFRDFcdTVCOUFcblx0KTogW2FueSwgYW55LCBzdHJpbmdbXV1bXSB7XG5cdFx0aWYgKHJvb3QgPT09IHVuZGVmaW5lZCB8fCByb290ID09PSBudWxsKSB7XG5cdFx0XHRyZXR1cm4gW107XG5cdFx0fVxuXHRcdHByZXZPYmplY3RzLnB1c2gocm9vdCk7XG5cdFx0aWYgKGN1cnJlbnRQYXRoLmxlbmd0aCA8IDEwKSB7XG5cdFx0XHRmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhyb290KSkge1xuXHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0T2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwocm9vdCwga2V5KSAmJlxuXHRcdFx0XHRcdCFwcmV2T2JqZWN0cy5pbmNsdWRlcyhyb290W2tleV0pICYmXG5cdFx0XHRcdFx0IShcblx0XHRcdFx0XHRcdGN1cnJlbnRQYXRoLmxlbmd0aCA9PT0gMSAmJlxuXHRcdFx0XHRcdFx0cHJldk9iamVjdHNbcHJldk9iamVjdHMubGVuZ3RoIC0gMV0gPT09IHdpbmRvdyAmJlxuXHRcdFx0XHRcdFx0a2V5ID09PSBcImJldHRlcm5jbVwiXG5cdFx0XHRcdFx0KSAvLyBcdTU0QjFcdTRFRUNcdTgxRUFcdTVERjFcdTc2ODRcdTUxRkRcdTY1NzBcdTVDMzFcdTRFMERcdTk3MDBcdTg5ODFcdTY4QzBcdTZENEJcdTRFODZcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0aWYgKHR5cGVvZiByb290W2tleV0gPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdFx0XHRcdGN1cnJlbnRQYXRoLnB1c2goa2V5KTtcblx0XHRcdFx0XHRcdHNlYXJjaEFwaUZ1bmN0aW9uKFxuXHRcdFx0XHRcdFx0XHRmaW5kZXIsXG5cdFx0XHRcdFx0XHRcdHJvb3Rba2V5XSxcblx0XHRcdFx0XHRcdFx0Y3VycmVudFBhdGgsXG5cdFx0XHRcdFx0XHRcdHByZXZPYmplY3RzLFxuXHRcdFx0XHRcdFx0XHRyZXN1bHQsXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0Y3VycmVudFBhdGgucG9wKCk7XG5cdFx0XHRcdFx0fSBlbHNlIGlmIChmaW5kZXIocm9vdFtrZXldKSkge1xuXHRcdFx0XHRcdFx0cmVzdWx0LnB1c2goW3Jvb3Rba2V5XSwgcm9vdCwgWy4uLmN1cnJlbnRQYXRoXV0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRwcmV2T2JqZWN0cy5wb3AoKTtcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0ZXhwb3J0IGZ1bmN0aW9uIGZpbmRBcGlGdW5jdGlvbihcblx0XHRuYW1lT3JGaW5kZXI6IHN0cmluZyB8ICgoZnVuYzogRnVuY3Rpb24pID0+IGJvb2xlYW4pLFxuXHRcdC8vIHJvbWUtaWdub3JlIGxpbnQvc3VzcGljaW91cy9ub0V4cGxpY2l0QW55OiBcdTY4MzlcdTVCRjlcdThDNjFcdTUzRUZcdTRFRTVcdTY2MkZcdTRFRkJcdTYxMEZcdTc2ODRcblx0XHRyb290OiBhbnkgPSB3aW5kb3csXG5cdFx0Y3VycmVudFBhdGggPSBbXCJ3aW5kb3dcIl0sXG5cdFx0Ly8gcm9tZS1pZ25vcmUgbGludC9zdXNwaWNpb3VzL25vRXhwbGljaXRBbnk6IFx1NURGMlx1NjhDMFx1N0QyMlx1NUJGOVx1OEM2MVx1NTNFRlx1NEVFNVx1NjYyRlx1NEVGQlx1NjEwRlx1NzY4NFxuXHRcdHByZXZPYmplY3RzOiBhbnlbXSA9IFtdLFxuXHRcdC8vIHJvbWUtaWdub3JlIGxpbnQvc3VzcGljaW91cy9ub0V4cGxpY2l0QW55OiBcdThGRDRcdTU2REVcdThCRTVcdTUxRkRcdTY1NzBcdTc2ODRcdTY0M0FcdTVFMjZcdTVCRjlcdThDNjFcdUZGMENcdTY1QjlcdTRGQkZcdTUwNUEgYmluZCBcdTdFRDFcdTVCOUFcblx0KTogW0Z1bmN0aW9uLCBhbnksIHN0cmluZ1tdXSB8IG51bGwge1xuXHRcdGlmIChyb290ID09PSB1bmRlZmluZWQgfHwgcm9vdCA9PT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHRcdHByZXZPYmplY3RzLnB1c2gocm9vdCk7XG5cdFx0aWYgKHR5cGVvZiBuYW1lT3JGaW5kZXIgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdGlmICh0eXBlb2Ygcm9vdFtuYW1lT3JGaW5kZXJdID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0cmV0dXJuIFtyb290W25hbWVPckZpbmRlcl0sIHJvb3QsIFsuLi5jdXJyZW50UGF0aF1dO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhyb290KSkge1xuXHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0T2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwocm9vdCwga2V5KSAmJlxuXHRcdFx0XHRcdHR5cGVvZiByb290W2tleV0gPT09IFwiZnVuY3Rpb25cIiAmJlxuXHRcdFx0XHRcdG5hbWVPckZpbmRlcihyb290W2tleV0pXG5cdFx0XHRcdCkge1xuXHRcdFx0XHRcdHJldHVybiBbcm9vdFtrZXldLCByb290LCBbLi4uY3VycmVudFBhdGhdXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoY3VycmVudFBhdGgubGVuZ3RoIDwgMTApIHtcblx0XHRcdGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHJvb3QpKSB7XG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHRPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChyb290LCBrZXkpICYmXG5cdFx0XHRcdFx0dHlwZW9mIHJvb3Rba2V5XSA9PT0gXCJvYmplY3RcIiAmJlxuXHRcdFx0XHRcdCFwcmV2T2JqZWN0cy5pbmNsdWRlcyhyb290W2tleV0pICYmXG5cdFx0XHRcdFx0IShcblx0XHRcdFx0XHRcdGN1cnJlbnRQYXRoLmxlbmd0aCA9PT0gMSAmJlxuXHRcdFx0XHRcdFx0cHJldk9iamVjdHNbcHJldk9iamVjdHMubGVuZ3RoIC0gMV0gPT09IHdpbmRvdyAmJlxuXHRcdFx0XHRcdFx0a2V5ID09PSBcImJldHRlcm5jbVwiXG5cdFx0XHRcdFx0KSAvLyBcdTU0QjFcdTRFRUNcdTgxRUFcdTVERjFcdTc2ODRcdTUxRkRcdTY1NzBcdTVDMzFcdTRFMERcdTk3MDBcdTg5ODFcdTY4QzBcdTZENEJcdTRFODZcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0Y3VycmVudFBhdGgucHVzaChrZXkpO1xuXHRcdFx0XHRcdGNvbnN0IHJlc3VsdCA9IGZpbmRBcGlGdW5jdGlvbihcblx0XHRcdFx0XHRcdG5hbWVPckZpbmRlcixcblx0XHRcdFx0XHRcdHJvb3Rba2V5XSxcblx0XHRcdFx0XHRcdGN1cnJlbnRQYXRoLFxuXHRcdFx0XHRcdFx0cHJldk9iamVjdHMsXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRjdXJyZW50UGF0aC5wb3AoKTtcblx0XHRcdFx0XHRpZiAocmVzdWx0KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRwcmV2T2JqZWN0cy5wb3AoKTtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdC8vIHJvbWUtaWdub3JlIGxpbnQvc3VzcGljaW91cy9ub0V4cGxpY2l0QW55OiBcdThGRDlcdTRFMkFcdTY2MkZcdTdGNTFcdTY2MTNcdTRFOTFcdTgxRUFcdTVERjFcdTY2QjRcdTk3MzJcdTc2ODRcdTVCRjlcdThDNjFcdUZGMENcdTkxQ0NcdTU5MzRcdTY3MDlcdTVGODhcdTU5MUFcdTUzRUZcdTRFRTVcdTUyMjlcdTc1MjhcdTc2ODRcdTUxRkRcdTY1NzBcblx0ZGVjbGFyZSBjb25zdCBkYzogYW55O1xuXHQvLyByb21lLWlnbm9yZSBsaW50L3N1c3BpY2lvdXMvbm9FeHBsaWNpdEFueTogXHU4RkQ5XHU0RTJBXHU2NjJGXHU3RjUxXHU2NjEzXHU0RTkxXHU4MUVBXHU1REYxXHU2NkI0XHU5NzMyXHU3Njg0XHU1QkY5XHU4QzYxXHVGRjBDXHU5MUNDXHU1OTM0XHU2NzA5XHU1Rjg4XHU1OTFBXHU1M0VGXHU0RUU1XHU1MjI5XHU3NTI4XHU3Njg0XHU1MUZEXHU2NTcwXG5cdGRlY2xhcmUgY29uc3QgY3RsOiBhbnk7XG5cblx0bGV0IGNhY2hlZEdldFBsYXlpbmdGdW5jOiBGdW5jdGlvbiB8IG51bGwgPSBudWxsO1xuXHQvKipcblx0ICogXHU4M0I3XHU1M0Q2XHU1RjUzXHU1MjREXHU2QjYzXHU1NzI4XHU2NEFEXHU2NTNFXHU3Njg0XHU2QjRDXHU2NkYyXHU3Njg0XHU0RkUxXHU2MDZGXHVGRjBDXHU1MzA1XHU2MkVDXHU2QjRDXHU2NkYyXHU0RkUxXHU2MDZGXHVGRjBDXHU2NzY1XHU2RTkwXHVGRjBDXHU1RjUzXHU1MjREXHU2NEFEXHU2NTNFXHU3MkI2XHU2MDAxXHU3QjQ5XG5cdCAqIEB0b2RvIFx1ODg2NVx1NTE2OFx1OEZENFx1NTZERVx1NTAzQ1x1N0M3Qlx1NTc4QlxuXHQgKiBAcmV0dXJucyBcdTVGNTNcdTUyNERcdTZCNENcdTY2RjJcdTc2ODRcdTY0QURcdTY1M0VcdTRGRTFcdTYwNkZcblx0ICovXG5cdGV4cG9ydCBmdW5jdGlvbiBnZXRQbGF5aW5nU29uZygpIHtcblx0XHRpZiAoY2FjaGVkR2V0UGxheWluZ0Z1bmMgPT09IG51bGwpIHtcblx0XHRcdGNvbnN0IGZpbmRSZXN1bHQgPSBmaW5kQXBpRnVuY3Rpb24oXCJnZXRQbGF5aW5nXCIpO1xuXHRcdFx0aWYgKGZpbmRSZXN1bHQpIHtcblx0XHRcdFx0Y29uc3QgW2dldFBsYXlpbmcsIGdldFBsYXlpbmdSb290XSA9IGZpbmRSZXN1bHQ7XG5cdFx0XHRcdGNhY2hlZEdldFBsYXlpbmdGdW5jID0gZ2V0UGxheWluZy5iaW5kKGdldFBsYXlpbmdSb290KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKGNhY2hlZEdldFBsYXlpbmdGdW5jID09PSBudWxsKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGNhY2hlZEdldFBsYXlpbmdGdW5jKCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFx1ODNCN1x1NTNENlx1NUY1M1x1NTI0RFx1NkI2M1x1NTcyOFx1NjRBRFx1NjUzRVx1NzY4NFx1NkI0Q1x1NjZGMlx1NzY4NFx1N0I4MFx1ODk4MVx1NEZFMVx1NjA2RlxuXHQgKiBAZGVwcmVjYXRlZCBcdTc1MzFcdTRFOEVcdTYyN0VcdTUyMzBcdTRFODZcdTgxRUFcdTVFMjZcdTc2ODRcdTYzQTVcdTUzRTNcdUZGMENcdTY1NDVcdThGRDlcdTRFMkFcdTUxRkRcdTY1NzBcdTg4QUJcdTVGMDNcdTc1MjhcdUZGMENcdThCRjdcdThGNkNcdTgwMENcdTRGN0ZcdTc1MjggYGJldHRlcm5jbS5uY20uZ2V0UGxheWluZ1NvbmdgXG5cdCAqIEByZXR1cm5zIFx1N0I4MFx1NTMxNlx1NzY4NFx1NjRBRFx1NjUzRVx1NEZFMVx1NjA2RlxuXHQgKi9cblx0ZXhwb3J0IGZ1bmN0aW9uIGdldFBsYXlpbmcoKSB7XG5cdFx0Y29uc3QgcGxheWluZyA9IGdldFBsYXlpbmdTb25nKCk7XG5cdFx0Y29uc3QgcmVzdWx0ID0ge1xuXHRcdFx0aWQ6IHBsYXlpbmcuZGF0YS5pZCBhcyBudW1iZXIsXG5cdFx0XHR0aXRsZTogcGxheWluZy5kYXRhLm5hbWUgYXMgc3RyaW5nLFxuXHRcdFx0dHlwZTogXCJub3JtYWxcIixcblx0XHR9O1xuXHRcdGlmIChwbGF5aW5nLmZyb20uZm0pIHtcblx0XHRcdHJlc3VsdC50eXBlID0gXCJmbVwiO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG59XG4iLCAiaW1wb3J0IHsgZnMgfSBmcm9tIFwiLi9mc1wiO1xuXG5leHBvcnQgbmFtZXNwYWNlIHRlc3RzIHtcblx0ZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZhaWwocmVhc29uOiBzdHJpbmcpIHtcblx0XHRjb25zb2xlLndhcm4oXCJUZXN0IEZhaWxlZFwiLCByZWFzb24pO1xuXHRcdGF3YWl0IGZzLndyaXRlRmlsZVRleHQoXCIvX19URVNUX0ZBSUxFRF9fLnR4dFwiLCByZWFzb24pO1xuXHR9XG5cblx0ZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN1Y2Nlc3MobWVzc2FnZTogc3RyaW5nKSB7XG5cdFx0Y29uc29sZS53YXJuKFwiVGVzdCBTdWNjZWVkZWRcIiwgbWVzc2FnZSk7XG5cdFx0YXdhaXQgZnMud3JpdGVGaWxlVGV4dChcIi9fX1RFU1RfU1VDQ0VFREVEX18udHh0XCIsIG1lc3NhZ2UpO1xuXHR9XG59XG4iLCAiZXhwb3J0IGNvbnN0IEJ1dHRvbjogUmVhY3QuRkM8XG5cdFJlYWN0LlByb3BzV2l0aENoaWxkcmVuPFJlYWN0LkhUTUxBdHRyaWJ1dGVzPEhUTUxBbmNob3JFbGVtZW50Pj5cbj4gPSAocHJvcHMpID0+IHtcblx0Y29uc3QgeyBjaGlsZHJlbiwgY2xhc3NOYW1lLCAuLi5vdGhlciB9ID0gcHJvcHM7XG5cdHJldHVybiAoXG5cdFx0PGEgY2xhc3NOYW1lPXtgdS1pYnRuNSB1LWlidG5zejggJHtjbGFzc05hbWUgfHwgXCJcIn1gfSB7Li4ub3RoZXJ9PlxuXHRcdFx0e2NoaWxkcmVufVxuXHRcdDwvYT5cblx0KTtcbn07XG4iLCAiZXhwb3J0IGNvbnN0IFByb2dyZXNzUmluZzogUmVhY3QuRkM8e1xuXHRzaXplPzogc3RyaW5nO1xufT4gPSAocHJvcHMpID0+IHtcblx0cmV0dXJuIChcblx0XHQ8c3BhblxuXHRcdFx0Y2xhc3NOYW1lPVwiYm5jbS1zcGlubmVyXCJcblx0XHRcdHN0eWxlPXt7XG5cdFx0XHRcdHdpZHRoOiBwcm9wcy5zaXplIHx8IFwiMTZweFwiLFxuXHRcdFx0XHRoZWlnaHQ6IHByb3BzLnNpemUgfHwgXCIxNnB4XCIsXG5cdFx0XHR9fVxuXHRcdD5cblx0XHRcdDxkaXYgLz5cblx0XHRcdDxkaXYgLz5cblx0XHRcdDxkaXYgLz5cblx0XHRcdDxkaXYgLz5cblx0XHRcdDxkaXYgLz5cblx0XHRcdDxkaXYgLz5cblx0XHRcdDxkaXYgLz5cblx0XHRcdDxkaXYgLz5cblx0XHRcdDxkaXYgLz5cblx0XHRcdDxkaXYgLz5cblx0XHRcdDxkaXYgLz5cblx0XHRcdDxkaXYgLz5cblx0XHQ8L3NwYW4+XG5cdCk7XG59O1xuIiwgImltcG9ydCBCZXR0ZXJOQ00gZnJvbSBcIi4uLy4uL2JldHRlcm5jbS1hcGlcIjtcbmltcG9ydCB7IGRpc2FibGVTYWZlTW9kZSwgaXNTYWZlTW9kZSwgbG9hZGVkUGx1Z2lucyB9IGZyb20gXCIuLi8uLi9sb2FkZXJcIjtcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gXCIuL2J1dHRvblwiO1xuaW1wb3J0IHsgUHJvZ3Jlc3NSaW5nIH0gZnJvbSBcIi4vcHJvZ3Jlc3MtcmluZ1wiO1xuXG5pbnRlcmZhY2UgUmVsZWFzZVZlcnNpb24ge1xuXHR2ZXJzaW9uOiBzdHJpbmc7XG5cdHN1cHBvcnRzOiBzdHJpbmdbXTtcblx0ZmlsZTogc3RyaW5nO1xuXHRjaGFuZ2Vsb2c6IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIE9ubGluZVZlcnNpb25JbmZvIHtcblx0dmVyc2lvbnM6IFJlbGVhc2VWZXJzaW9uW107XG59XG5cbmV4cG9ydCBjb25zdCBIZWFkZXJDb21wb25lbnQ6IFJlYWN0LkZDPHtcblx0b25SZXF1ZXN0T3BlblN0YXJ0dXBXYXJuaW5nczogRnVuY3Rpb247XG59PiA9IChwcm9wcykgPT4ge1xuXHRjb25zdCBbdXBkYXRlQnV0dG9uQ29sb3IsIHNldFVwZGF0ZUJ1dHRvbkNvbG9yXSA9XG5cdFx0UmVhY3QudXNlU3RhdGUoXCJ0cmFuc3BhcmVudFwiKTsgLy8gI0YwMDQgIzBGMDRcblxuXHRjb25zdCBzYWZlTW9kZSA9IFJlYWN0LnVzZU1lbW8oKCkgPT4gaXNTYWZlTW9kZSgpLCBbXSk7XG5cblx0Y29uc3QgW2xhdGVzdFZlcnNpb24sIHNldExhdGVzdFZlcnNpb25dID1cblx0XHRSZWFjdC51c2VTdGF0ZTxSZWxlYXNlVmVyc2lvbiB8IG51bGw+KG51bGwpO1xuXG5cdGNvbnN0IFtjdXJyZW50VmVyc2lvbiwgc2V0Q3VycmVudFZlcnNpb25dID0gUmVhY3QudXNlU3RhdGUoXCJcIik7XG5cblx0Y29uc3QgZ2xvYmFsUmVxdWlyZVJlc3RhcnQgPSBSZWFjdC51c2VNZW1vKFxuXHRcdCgpID0+XG5cdFx0XHRPYmplY3QudmFsdWVzKGxvYWRlZFBsdWdpbnMpLmZpbmRJbmRleChcblx0XHRcdFx0KHBsdWdpbikgPT5cblx0XHRcdFx0XHRwbHVnaW4ubWFuaWZlc3QucmVxdWlyZV9yZXN0YXJ0IHx8IHBsdWdpbi5tYW5pZmVzdC5uYXRpdmVfcGx1Z2luLFxuXHRcdFx0KSAhPT0gLTEsXG5cdFx0W10sXG5cdCk7XG5cblx0UmVhY3QudXNlRWZmZWN0KCgpID0+IHtcblx0XHQoYXN5bmMgKCkgPT4ge1xuXHRcdFx0aWYgKCFsYXRlc3RWZXJzaW9uKSB7XG5cdFx0XHRcdGNvbnN0IGJldHRlck5DTVZlcnNpb24gPSBhd2FpdCBCZXR0ZXJOQ00uYXBwLmdldEJldHRlck5DTVZlcnNpb24oKTtcblx0XHRcdFx0c2V0Q3VycmVudFZlcnNpb24oYmV0dGVyTkNNVmVyc2lvbik7XG5cdFx0XHRcdGNvbnN0IGN1cnJlbnROQ01WZXJzaW9uID0gQmV0dGVyTkNNLm5jbS5nZXROQ01WZXJzaW9uKCk7XG5cblx0XHRcdFx0Y29uc3Qgb25saW5lOiBPbmxpbmVWZXJzaW9uSW5mbyA9IGF3YWl0IChcblx0XHRcdFx0XHRhd2FpdCBmZXRjaChcblx0XHRcdFx0XHRcdFwiaHR0cHM6Ly9naXRlZS5jb20vbWljcm9ibG9jay9iZXR0ZXItbmNtLXYyLWRhdGEvcmF3L21hc3Rlci9iZXR0ZXJuY20vYmV0dGVybmNtLmpzb25cIixcblx0XHRcdFx0XHQpXG5cdFx0XHRcdCkuanNvbigpO1xuXHRcdFx0XHRjb25zdCBvbmxpbmVTdWl0YWJsZVZlcnNpb25zID0gb25saW5lLnZlcnNpb25zLmZpbHRlcigodikgPT5cblx0XHRcdFx0XHR2LnN1cHBvcnRzLmluY2x1ZGVzKGN1cnJlbnROQ01WZXJzaW9uKSxcblx0XHRcdFx0KTtcblx0XHRcdFx0aWYgKG9ubGluZVN1aXRhYmxlVmVyc2lvbnMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdFx0c2V0VXBkYXRlQnV0dG9uQ29sb3IoXCIjRjAwNFwiKTtcblx0XHRcdFx0XHRzZXRMYXRlc3RWZXJzaW9uKHtcblx0XHRcdFx0XHRcdHZlcnNpb246IFwiXCIsXG5cdFx0XHRcdFx0XHRzdXBwb3J0czogW10sXG5cdFx0XHRcdFx0XHRmaWxlOiBcIlwiLFxuXHRcdFx0XHRcdFx0Y2hhbmdlbG9nOiBcIlwiLFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnN0IGxhdGVzdFZlcnNpb24gPSBvbmxpbmVTdWl0YWJsZVZlcnNpb25zWzBdO1xuXHRcdFx0XHRcdGlmIChsYXRlc3RWZXJzaW9uLnZlcnNpb24gIT09IGJldHRlck5DTVZlcnNpb24pIHtcblx0XHRcdFx0XHRcdHNldFVwZGF0ZUJ1dHRvbkNvbG9yKFwiIzBGMDRcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHNldExhdGVzdFZlcnNpb24obGF0ZXN0VmVyc2lvbik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KSgpO1xuXHR9LCBbbGF0ZXN0VmVyc2lvbl0pO1xuXG5cdGNvbnN0IG9uVXBkYXRlQnV0dG9uQ2xpY2tlZCA9IFJlYWN0LnVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcblx0XHRpZiAobGF0ZXN0VmVyc2lvbiAmJiBsYXRlc3RWZXJzaW9uLnZlcnNpb24gIT09IGN1cnJlbnRWZXJzaW9uKSB7XG5cdFx0XHRjb25zdCBuY21wYXRoID0gYXdhaXQgQmV0dGVyTkNNLmFwcC5nZXROQ01QYXRoKCk7XG5cdFx0XHRjb25zdCBkYXRhcGF0aCA9IGF3YWl0IEJldHRlck5DTS5hcHAuZ2V0RGF0YVBhdGgoKTtcblx0XHRcdGNvbnN0IGRsbHBhdGggPSBgJHtkYXRhcGF0aH1cXFxcYmV0dGVybmNtLmRsbGA7XG5cdFx0XHRpZiAoYXdhaXQgQmV0dGVyTkNNLmZzLmV4aXN0cyhcIi4vYmV0dGVybmNtLmRsbFwiKSlcblx0XHRcdFx0YXdhaXQgQmV0dGVyTkNNLmZzLnJlbW92ZShcIi4vYmV0dGVybmNtLmRsbFwiKTtcblxuXHRcdFx0YXdhaXQgQmV0dGVyTkNNLmZzLndyaXRlRmlsZShcblx0XHRcdFx0XCIuL2JldHRlcm5jbS5kbGxcIixcblx0XHRcdFx0YXdhaXQgKGF3YWl0IGZldGNoKGxhdGVzdFZlcnNpb24/LmZpbGUpKS5ibG9iKCksXG5cdFx0XHQpO1xuXG5cdFx0XHRpZiAoIW5jbXBhdGgudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhcInN5c3RlbVwiKSkge1xuXHRcdFx0XHRCZXR0ZXJOQ00uYXBwLmV4ZWMoXG5cdFx0XHRcdFx0W1xuXHRcdFx0XHRcdFx0XCJjbWQgL2MgQGVjaG8gb2ZmXCIsXG5cdFx0XHRcdFx0XHRcImVjaG8gQmV0dGVyTkNNIFVwZGF0aW5nLi4uXCIsXG5cdFx0XHRcdFx0XHRcImNkIC9kIEM6L1wiLFxuXHRcdFx0XHRcdFx0XCJjZCBDOi9cIixcblx0XHRcdFx0XHRcdGBjZCAvZCAke25jbXBhdGhbMF19Oi9gLFxuXHRcdFx0XHRcdFx0YGNkIFwiJHtuY21wYXRofVwiYCxcblx0XHRcdFx0XHRcdFwidGFza2tpbGwgL2YgL2ltIGNsb3VkbXVzaWMuZXhlPm51bFwiLFxuXHRcdFx0XHRcdFx0XCJ0YXNra2lsbCAvZiAvaW0gY2xvdWRtdXNpY24uZXhlPm51bFwiLFxuXHRcdFx0XHRcdFx0XCJwaW5nIDEyNy4wLjAuMT5udWwgJiBkZWwgbXNpbWczMi5kbGxcIixcblx0XHRcdFx0XHRcdGBtb3ZlIFwiJHtkbGxwYXRofVwiIC5cXFxcbXNpbWczMi5kbGxgLFxuXHRcdFx0XHRcdFx0XCJzdGFydCBjbG91ZG11c2ljLmV4ZVwiLFxuXHRcdFx0XHRcdF0uam9pbihcIiAmIFwiKSxcblx0XHRcdFx0XHR0cnVlLFxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAobGF0ZXN0VmVyc2lvbikge1xuXHRcdFx0Ly8gXHU5MUNEXHU2NUIwXHU2OEMwXHU2RDRCXHU2NUIwXHU3MjQ4XHU2NzJDXG5cdFx0XHRzZXRMYXRlc3RWZXJzaW9uKG51bGwpO1xuXHRcdH1cblx0fSwgW2xhdGVzdFZlcnNpb25dKTtcblxuXHRjb25zdCBbY29uc29sZVNob3duLCBzZXRDb25zb2xlU2hvd25dID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpO1xuXG5cdHJldHVybiAoXG5cdFx0PHNlY3Rpb24gY2xhc3NOYW1lPVwiYm5jbS1tZ3ItaGVhZGVyXCI+XG5cdFx0XHQ8aW1nXG5cdFx0XHRcdHNyYz1cImh0dHBzOi8vczEuYXgxeC5jb20vMjAyMi8wOC8xMS92R2xKTjgucG5nXCJcblx0XHRcdFx0YWx0PVwiXCJcblx0XHRcdFx0c3R5bGU9e3tcblx0XHRcdFx0XHRoZWlnaHQ6IFwiNjRweFwiLFxuXHRcdFx0XHR9fVxuXHRcdFx0Lz5cblx0XHRcdDxkaXY+XG5cdFx0XHRcdDxoMT5cblx0XHRcdFx0XHRCZXR0ZXJOQ017XCIgXCJ9XG5cdFx0XHRcdFx0PHNwYW4gc3R5bGU9e3sgZm9udFNpemU6IFwic21hbGxlclwiLCBvcGFjaXR5OiBcIjAuOFwiIH19PlxuXHRcdFx0XHRcdFx0e2JldHRlcm5jbV9uYXRpdmUuYXBwLnZlcnNpb24oKX1cblx0XHRcdFx0XHQ8L3NwYW4+XG5cdFx0XHRcdDwvaDE+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiYm5jbS1tZ3ItYnRuc1wiPlxuXHRcdFx0XHRcdDxCdXR0b25cblx0XHRcdFx0XHRcdG9uQ2xpY2s9e2FzeW5jICgpID0+IHtcblx0XHRcdFx0XHRcdFx0QmV0dGVyTkNNLmFwcC5leGVjKFxuXHRcdFx0XHRcdFx0XHRcdGBleHBsb3JlciBcIiR7KGF3YWl0IEJldHRlck5DTS5hcHAuZ2V0RGF0YVBhdGgoKSkucmVwbGFjZShcblx0XHRcdFx0XHRcdFx0XHRcdC9cXC8vZyxcblx0XHRcdFx0XHRcdFx0XHRcdFwiXFxcXFwiLFxuXHRcdFx0XHRcdFx0XHRcdCl9XCJgLFxuXHRcdFx0XHRcdFx0XHRcdGZhbHNlLFxuXHRcdFx0XHRcdFx0XHRcdHRydWUsXG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHR9fVxuXHRcdFx0XHRcdD5cblx0XHRcdFx0XHRcdFx1NjI1M1x1NUYwMFx1NjNEMlx1NEVGNlx1NjU4N1x1NEVGNlx1NTkzOVxuXHRcdFx0XHRcdDwvQnV0dG9uPlxuXHRcdFx0XHRcdDxCdXR0b25cblx0XHRcdFx0XHRcdG9uQ2xpY2s9eygpID0+IHtcblx0XHRcdFx0XHRcdFx0QmV0dGVyTkNNLmFwcC5zaG93Q29uc29sZSghY29uc29sZVNob3duKTtcblx0XHRcdFx0XHRcdFx0c2V0Q29uc29sZVNob3duKCFjb25zb2xlU2hvd24pO1xuXHRcdFx0XHRcdFx0fX1cblx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHR7Y29uc29sZVNob3duID8gXCJcdTk2OTBcdTg1Q0ZcIiA6IFwiXHU2MjUzXHU1RjAwXCJ9XG5cdFx0XHRcdFx0XHRcdTYzQTdcdTUyMzZcdTUzRjBcblx0XHRcdFx0XHQ8L0J1dHRvbj5cblxuXHRcdFx0XHRcdHtnbG9iYWxSZXF1aXJlUmVzdGFydCA/IChcblx0XHRcdFx0XHRcdDw+XG5cdFx0XHRcdFx0XHRcdDxCdXR0b25cblx0XHRcdFx0XHRcdFx0XHRvbkNsaWNrPXthc3luYyAoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRhd2FpdCBkaXNhYmxlU2FmZU1vZGUoKTtcblx0XHRcdFx0XHRcdFx0XHRcdEJldHRlck5DTS5yZWxvYWQoKTtcblx0XHRcdFx0XHRcdFx0XHR9fVxuXHRcdFx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHRcdFx0XHU5MUNEXHU1NDJGXHU3RjUxXHU2NjEzXHU0RTkxXG5cdFx0XHRcdFx0XHRcdDwvQnV0dG9uPlxuXHRcdFx0XHRcdFx0PC8+XG5cdFx0XHRcdFx0KSA6IChcblx0XHRcdFx0XHRcdDxCdXR0b25cblx0XHRcdFx0XHRcdFx0b25DbGljaz17YXN5bmMgKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdGF3YWl0IGRpc2FibGVTYWZlTW9kZSgpO1xuXHRcdFx0XHRcdFx0XHRcdGF3YWl0IEJldHRlck5DTS5hcHAucmVsb2FkUGx1Z2lucygpO1xuXHRcdFx0XHRcdFx0XHRcdEJldHRlck5DTS5yZWxvYWQoKTtcblx0XHRcdFx0XHRcdFx0fX1cblx0XHRcdFx0XHRcdD5cblx0XHRcdFx0XHRcdFx0XHU5MUNEXHU4RjdEXHU2M0QyXHU0RUY2XG5cdFx0XHRcdFx0XHQ8L0J1dHRvbj5cblx0XHRcdFx0XHQpfVxuXG5cdFx0XHRcdFx0PEJ1dHRvblxuXHRcdFx0XHRcdFx0c3R5bGU9e3tcblx0XHRcdFx0XHRcdFx0ZGlzcGxheTogXCJmbGV4XCIsXG5cdFx0XHRcdFx0XHRcdGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG5cdFx0XHRcdFx0XHRcdGJhY2tncm91bmQ6IHVwZGF0ZUJ1dHRvbkNvbG9yLFxuXHRcdFx0XHRcdFx0fX1cblx0XHRcdFx0XHRcdG9uQ2xpY2s9e29uVXBkYXRlQnV0dG9uQ2xpY2tlZH1cblx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHR7bGF0ZXN0VmVyc2lvbiA9PT0gbnVsbCA/IChcblx0XHRcdFx0XHRcdFx0PD5cblx0XHRcdFx0XHRcdFx0XHQ8UHJvZ3Jlc3NSaW5nIC8+XG5cdFx0XHRcdFx0XHRcdFx0XHU2OEMwXHU2N0U1XHU2NkY0XHU2NUIwXHU0RTJEXG5cdFx0XHRcdFx0XHRcdDwvPlxuXHRcdFx0XHRcdFx0KSA6IGxhdGVzdFZlcnNpb24udmVyc2lvbiA9PT0gY3VycmVudFZlcnNpb24gPyAoXG5cdFx0XHRcdFx0XHRcdDw+XHU1REYyXHU2NjJGXHU2NzAwXHU2NUIwXHU3MjQ4XHU2NzJDPC8+XG5cdFx0XHRcdFx0XHQpIDogbGF0ZXN0VmVyc2lvbi52ZXJzaW9uLmxlbmd0aCA9PT0gMCA/IChcblx0XHRcdFx0XHRcdFx0PD5cdTcyNDhcdTY3MkNcdTRFMERcdTUxN0NcdTVCQjk8Lz5cblx0XHRcdFx0XHRcdCkgOiAoXG5cdFx0XHRcdFx0XHRcdDw+XHU3MEI5XHU1MUZCXHU2NkY0XHU2NUIwXHU1MjMwIHtsYXRlc3RWZXJzaW9uLnZlcnNpb259PC8+XG5cdFx0XHRcdFx0XHQpfVxuXHRcdFx0XHRcdDwvQnV0dG9uPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdFx0PGRpdiBjbGFzc05hbWU9XCJtLXRvb2xcIj5cblx0XHRcdFx0PGFcblx0XHRcdFx0XHRjbGFzc05hbWU9XCJpdG1cIlxuXHRcdFx0XHRcdC8vIHJvbWUtaWdub3JlIGxpbnQvYTExeS91c2VWYWxpZEFuY2hvcjogPGV4cGxhbmF0aW9uPlxuXHRcdFx0XHRcdG9uQ2xpY2s9eygpID0+IHByb3BzLm9uUmVxdWVzdE9wZW5TdGFydHVwV2FybmluZ3MoKX1cblx0XHRcdFx0XHRzdHlsZT17e1xuXHRcdFx0XHRcdFx0d2lkdGg6IFwiMzJweFwiLFxuXHRcdFx0XHRcdFx0aGVpZ2h0OiBcIjMycHhcIixcblx0XHRcdFx0XHR9fVxuXHRcdFx0XHQ+XG5cdFx0XHRcdFx0PHN2ZyB3aWR0aD1cIjMycHhcIiBoZWlnaHQ9XCIzMnB4XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiPlxuXHRcdFx0XHRcdFx0PHBhdGhcblx0XHRcdFx0XHRcdFx0ZmlsbD1cImN1cnJlbnRDb2xvclwiXG5cdFx0XHRcdFx0XHRcdGQ9XCJNMTMsOUgxMVY3SDEzTTEzLDE3SDExVjExSDEzTTEyLDJBMTAsMTAgMCAwLDAgMiwxMkExMCwxMCAwIDAsMCAxMiwyMkExMCwxMCAwIDAsMCAyMiwxMkExMCwxMCAwIDAsMCAxMiwyWlwiXG5cdFx0XHRcdFx0XHQvPlxuXHRcdFx0XHRcdDwvc3ZnPlxuXHRcdFx0XHQ8L2E+XG5cdFx0XHRcdDxhXG5cdFx0XHRcdFx0Y2xhc3NOYW1lPVwiaXRtXCJcblx0XHRcdFx0XHQvLyByb21lLWlnbm9yZSBsaW50L2ExMXkvdXNlVmFsaWRBbmNob3I6IDxleHBsYW5hdGlvbj5cblx0XHRcdFx0XHRvbkNsaWNrPXsoKSA9PlxuXHRcdFx0XHRcdFx0QmV0dGVyTkNNLm5jbS5vcGVuVXJsKFwiaHR0cHM6Ly9naXRodWIuY29tL01pY3JvQ0Jlci9CZXR0ZXJOQ01cIilcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0c3R5bGU9e3tcblx0XHRcdFx0XHRcdHdpZHRoOiBcIjMycHhcIixcblx0XHRcdFx0XHRcdGhlaWdodDogXCIzMnB4XCIsXG5cdFx0XHRcdFx0fX1cblx0XHRcdFx0PlxuXHRcdFx0XHRcdDxzdmcgd2lkdGg9XCIzMnB4XCIgaGVpZ2h0PVwiMzJweFwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIj5cblx0XHRcdFx0XHRcdDxwYXRoXG5cdFx0XHRcdFx0XHRcdGZpbGw9XCJjdXJyZW50Q29sb3JcIlxuXHRcdFx0XHRcdFx0XHRkPVwiTTEyLDJBMTAsMTAgMCAwLDAgMiwxMkMyLDE2LjQyIDQuODcsMjAuMTcgOC44NCwyMS41QzkuMzQsMjEuNTggOS41LDIxLjI3IDkuNSwyMUM5LjUsMjAuNzcgOS41LDIwLjE0IDkuNSwxOS4zMUM2LjczLDE5LjkxIDYuMTQsMTcuOTcgNi4xNCwxNy45N0M1LjY4LDE2LjgxIDUuMDMsMTYuNSA1LjAzLDE2LjVDNC4xMiwxNS44OCA1LjEsMTUuOSA1LjEsMTUuOUM2LjEsMTUuOTcgNi42MywxNi45MyA2LjYzLDE2LjkzQzcuNSwxOC40NSA4Ljk3LDE4IDkuNTQsMTcuNzZDOS42MywxNy4xMSA5Ljg5LDE2LjY3IDEwLjE3LDE2LjQyQzcuOTUsMTYuMTcgNS42MiwxNS4zMSA1LjYyLDExLjVDNS42MiwxMC4zOSA2LDkuNSA2LjY1LDguNzlDNi41NSw4LjU0IDYuMiw3LjUgNi43NSw2LjE1QzYuNzUsNi4xNSA3LjU5LDUuODggOS41LDcuMTdDMTAuMjksNi45NSAxMS4xNSw2Ljg0IDEyLDYuODRDMTIuODUsNi44NCAxMy43MSw2Ljk1IDE0LjUsNy4xN0MxNi40MSw1Ljg4IDE3LjI1LDYuMTUgMTcuMjUsNi4xNUMxNy44LDcuNSAxNy40NSw4LjU0IDE3LjM1LDguNzlDMTgsOS41IDE4LjM4LDEwLjM5IDE4LjM4LDExLjVDMTguMzgsMTUuMzIgMTYuMDQsMTYuMTYgMTMuODEsMTYuNDFDMTQuMTcsMTYuNzIgMTQuNSwxNy4zMyAxNC41LDE4LjI2QzE0LjUsMTkuNiAxNC41LDIwLjY4IDE0LjUsMjFDMTQuNSwyMS4yNyAxNC42NiwyMS41OSAxNS4xNywyMS41QzE5LjE0LDIwLjE2IDIyLDE2LjQyIDIyLDEyQTEwLDEwIDAgMCwwIDEyLDJaXCJcblx0XHRcdFx0XHRcdC8+XG5cdFx0XHRcdFx0PC9zdmc+XG5cdFx0XHRcdDwvYT5cblx0XHRcdDwvZGl2PlxuXHRcdDwvc2VjdGlvbj5cblx0KTtcbn07XG4iLCAiaW1wb3J0IHsgZGlzYWJsZVNhZmVNb2RlLCBnZXRMb2FkRXJyb3IgfSBmcm9tIFwiLi4vLi4vbG9hZGVyXCI7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tIFwiLi9idXR0b25cIjtcblxuZXhwb3J0IGNvbnN0IFNhZmVNb2RlSW5mbzogUmVhY3QuRkMgPSAoKSA9PiB7XG5cdGNvbnN0IFtsb2FkRXJyb3IsIHNldExvYWRFcnJvcl0gPSBSZWFjdC51c2VTdGF0ZShcIlwiKTtcblxuXHRSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuXHRcdGdldExvYWRFcnJvcigpLnRoZW4oc2V0TG9hZEVycm9yKTtcblx0fSwgW10pO1xuXG5cdHJldHVybiAoXG5cdFx0PGRpdiBjbGFzc05hbWU9XCJ2LXNjcm9sbFwiPlxuXHRcdFx0PGRpdj5cblx0XHRcdFx0PGRpdlxuXHRcdFx0XHRcdHN0eWxlPXt7XG5cdFx0XHRcdFx0XHRvdmVyZmxvd1k6IFwic2Nyb2xsXCIsXG5cdFx0XHRcdFx0XHRvdmVyZmxvd1g6IFwiaGlkZGVuXCIsXG5cdFx0XHRcdFx0fX1cblx0XHRcdFx0XHRjbGFzc05hbWU9XCJzYWZlLW1vZGUtaW5mb1wiXG5cdFx0XHRcdD5cblx0XHRcdFx0XHQ8aDE+XHU3M0IwXHU1NzI4XHU1OTA0XHU0RThFXHU1Qjg5XHU1MTY4XHU2QTIxXHU1RjBGPC9oMT5cblx0XHRcdFx0XHQ8cD5cblx0XHRcdFx0XHRcdEJldHRlck5DTVxuXHRcdFx0XHRcdFx0XHU2M0QyXHU0RUY2XHU1MkEwXHU4RjdEXHU1NjY4XHU1M0VGXHU4MEZEXHU5MDZEXHU5MDQ3XHU0RTg2XHU1OTFBXHU2QjIxXHU2M0QyXHU0RUY2XHU1MkEwXHU4RjdEXHU1OTMxXHU4RDI1XHU5MUNEXHU4RjdEXHVGRjBDXHU1Qjg5XHU1MTY4XHU2QTIxXHU1RjBGXHU1REYyXHU4MUVBXHU1MkE4XHU1NDJGXHU3NTI4XHVGRjBDXHU1NzI4XHU4QkU1XHU2QTIxXHU1RjBGXHU0RTBCXHU0RTBEXHU0RjFBXHU1MkEwXHU4RjdEXHU0RUZCXHU0RjU1XHU2M0QyXHU0RUY2XHUzMDAyXG5cdFx0XHRcdFx0PC9wPlxuXHRcdFx0XHRcdDxwPlxuXHRcdFx0XHRcdFx0XHU2M0QyXHU0RUY2XHU1MkEwXHU4RjdEXHU1NjY4XHU1REYyXHU3RUNGXHU2NTM2XHU5NkM2XHU0RTg2XHU2QkNGXHU2QjIxXHU1MkEwXHU4RjdEXHU1M0QxXHU3NTFGXHU3Njg0XHU5NTE5XHU4QkVGXHVGRjBDXHU4QkY3XHU3ODZFXHU4QkE0XHU1MkEwXHU4RjdEXHU1OTMxXHU4RDI1XHU3Njg0XHU2M0QyXHU0RUY2XHVGRjBDXHU1RTc2XHU1QzA2XHU1M0QxXHU3NTFGXHU5NTE5XHU4QkVGXHU3Njg0XHU2M0QyXHU0RUY2XHU2MjRCXHU1MkE4XHU3OUZCXHU5NjY0XHU2MjE2XHU0RkVFXHU2QjYzXHUzMDAyXG5cdFx0XHRcdFx0PC9wPlxuXHRcdFx0XHRcdDxwPlx1NUI4Q1x1NjIxMFx1OEMwM1x1NjU3NFx1NTQwRVx1RkYwQ1x1NTNFRlx1NEVFNVx1OTAxQVx1OEZDN1x1NjMwOVx1NEUwQlx1OTFDRFx1OEY3RFx1NjNEMlx1NEVGNlx1NTE3M1x1OTVFRFx1NUI4OVx1NTE2OFx1NkEyMVx1NUYwRlx1NUU3Nlx1OTFDRFx1NjVCMFx1NTJBMFx1OEY3RFx1NjNEMlx1NEVGNlx1MzAwMjwvcD5cblxuXHRcdFx0XHRcdDxCdXR0b25cblx0XHRcdFx0XHRcdG9uQ2xpY2s9e2FzeW5jICgpID0+IHtcblx0XHRcdFx0XHRcdFx0YXdhaXQgZGlzYWJsZVNhZmVNb2RlKCk7XG5cdFx0XHRcdFx0XHRcdGJldHRlcm5jbV9uYXRpdmUuYXBwLnJlc3RhcnQoKTtcblx0XHRcdFx0XHRcdH19XG5cdFx0XHRcdFx0PlxuXHRcdFx0XHRcdFx0XHU5MUNEXHU1NDJGXHU1RTc2XHU5MUNEXHU4RjdEXHU2M0QyXHU0RUY2XG5cdFx0XHRcdFx0PC9CdXR0b24+XG5cblx0XHRcdFx0XHR7bG9hZEVycm9yLmxlbmd0aCA9PT0gMCA/IChcblx0XHRcdFx0XHRcdDxwPlxuXHRcdFx0XHRcdFx0XHRcdTZDQTFcdTY3MDlcdTYyN0VcdTUyMzBcdTUyQTBcdThGN0RcdTk1MTlcdThCRUZcdThCQjBcdTVGNTVcdUZGMENcdTY3MDlcdTUzRUZcdTgwRkRcdTY2MkZcdTUzRDdcdTUyMzBcdTYzRDJcdTRFRjZcdTVGNzFcdTU0Q0RcdTYyMTZcdTYzRDJcdTRFRjZcdTdCQTFcdTc0MDZcdTU2NjhcdTgxRUFcdThFQUJcdTUxRkFcdTk1MTlcdTMwMDJcblx0XHRcdFx0XHRcdDwvcD5cblx0XHRcdFx0XHQpIDogKFxuXHRcdFx0XHRcdFx0PD5cblx0XHRcdFx0XHRcdFx0PHA+XHU1MkEwXHU4RjdEXHU5NTE5XHU4QkVGXHU4QkIwXHU1RjU1XHVGRjFBPC9wPlxuXHRcdFx0XHRcdFx0XHQ8Y29kZT5cblx0XHRcdFx0XHRcdFx0XHQ8cHJlIHN0eWxlPXt7IHdoaXRlU3BhY2U6IFwicHJlLXdyYXBcIiB9fT57bG9hZEVycm9yfTwvcHJlPlxuXHRcdFx0XHRcdFx0XHQ8L2NvZGU+XG5cdFx0XHRcdFx0XHQ8Lz5cblx0XHRcdFx0XHQpfVxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdDwvZGl2PlxuXHQpO1xufTtcbiIsICIvKipcbiAqIEBmaWxlb3ZlcnZpZXdcbiAqIFx1OTk5Nlx1NkIyMVx1NTQyRlx1NTJBOFx1NEYxQVx1NUYzOVx1NTFGQVx1NzY4NFx1NTE0RFx1OEQyM1x1NTQ4Q1x1OEI2Nlx1NTQ0QVx1N0E5N1x1NTNFM1xuICpcbiAqIFx1NjVFMFx1ODI2Rlx1NTE2Q1x1NEYxN1x1NTNGN1x1NTQ4Q1x1NTAxMlx1NTM1Nlx1NzJEN1x1NTNCQlx1NkI3Qlx1NTQyN1xuICovXG5cbmltcG9ydCBCZXR0ZXJOQ00gZnJvbSBcIi4uLy4uL2JldHRlcm5jbS1hcGlcIjtcblxuZXhwb3J0IGNvbnN0IFN0YXJ0dXBXYXJuaW5nOiBSZWFjdC5GQzx7XG5cdG9uUmVxdWVzdENsb3NlOiBGdW5jdGlvbjtcbn0+ID0gKHByb3BzKSA9PiB7XG5cdHJldHVybiAoXG5cdFx0PGRpdiBjbGFzc05hbWU9XCJzdGFydHVwLXdhcm5pbmdcIj5cblx0XHRcdDxoMT5cdTZCMjJcdThGQ0VcdTRGN0ZcdTc1MjggQmV0dGVyTkNNXHVGRjAxPC9oMT5cblx0XHRcdDxwPlxuXHRcdFx0XHRCZXR0ZXJOQ00gXHU2NjJGXHU0RTAwXHU0RTJBXHU3NTMxXHU0RTAwXHU3RkE0XHU3MEVEXHU3MjMxXHU3RjUxXHU2NjEzXHU0RTkxXHU5N0YzXHU0RTUwXHU3Njg0XHU0RTkxXHU2NzUxXHU2NzUxXHU1M0NCXHU1RjAwXHU1M0QxXHU3Njg0IFBDXG5cdFx0XHRcdFx1NzI0OFx1N0Y1MVx1NjYxM1x1NEU5MVx1OTdGM1x1NEU1MFx1NjI2OVx1NUM1NVx1NURFNVx1NTE3N1x1RkYwQ1x1NTNFRlx1NEVFNVx1NjNEMFx1NEY5Qlx1OTc1RVx1NUUzOFx1NEUzMFx1NUJDQ1x1NzY4NFx1ODFFQVx1NUI5QVx1NEU0OVx1NTI5Rlx1ODBGRFx1NjI2OVx1NUM1NVx1NTg5RVx1NUYzQVx1ODBGRFx1NTI5Qlx1MzAwMlxuXHRcdFx0PC9wPlxuXHRcdFx0PHA+XG5cdFx0XHRcdFx1ODAwM1x1ODY1MVx1NTIzMFx1NURFNVx1NTE3N1x1NjAyN1x1OEQyOFx1RkYwQ0JldHRlck5DTSBcdTVDMDY8Yj5cdTZDMzhcdThGRENcdTY2MkZcdTVCOENcdTUxNjhcdTVGMDBcdTZFOTBcdTUxNERcdThEMzlcdTc2ODRcdTgxRUFcdTc1MzFcdThGNkZcdTRFRjY8L2I+XG5cdFx0XHRcdFx1RkYwQ1x1NjI0MFx1NEVFNVx1NTk4Mlx1Njc5Q1x1NEY2MFx1NjYyRlx1NEVDRVx1NEVGQlx1NEY1NVx1NTczMFx1NjVCOVx1NTNEMVx1NzNCMFx1NjcwOVx1NEVGQlx1NEY1NVx1NEVCQVx1NTcyOFx1NTUyRVx1NTM1Nlx1NjcyQ1x1NURFNVx1NTE3N1x1RkYwQ1x1OEJGN1x1N0FDQlx1NTIzQlx1ODk4MVx1NkM0Mlx1OTAwMFx1NkIzRVx1NUU3Nlx1NEUzRVx1NjJBNVx1NTU0Nlx1NUJCNlx1RkYwMVxuXHRcdFx0XHRcdTRGNUNcdTRFM0FcdTRFMDBcdTdGQTRcdTcyMzFcdTU5N0RcdTgwMDVcdUZGMENcdTYyMTFcdTRFRUNcdTRFMERcdTRGMUFcdTRFNUZcdTZDQTFcdTUyOUVcdTZDRDVcdTRFM0FcdTRGNjBcdTU2RTBcdTRFM0FcdTRFQ0VcdTUxNzZcdTVCODNcdTkwMTRcdTVGODRcdThEMkRcdTRFNzBcdTY3MkNcdTVERTVcdTUxNzdcdTkwMjBcdTYyMTBcdTc2ODRcdTYzNUZcdTU5MzFcdThEMUZcdThEMjNcdUZGMDFcblx0XHRcdDwvcD5cblx0XHRcdDxwPlxuXHRcdFx0XHRcdTU5ODJcdTY3OUNcdTRGNjBcdTRFNUZcdTVFMENcdTY3MUJcdTRFM0EgQmV0dGVyTkNNIFx1OEQyMVx1NzMyRVx1NEVFM1x1NzgwMVx1RkYwQ1x1NkIyMlx1OEZDRVx1NTI0RFx1Njc2NSBCZXR0ZXJOQ00gXHU3Njg0IEdpdGh1YlxuXHRcdFx0XHRcdTVGMDBcdTZFOTBcdTRFRDNcdTVFOTNcdUZGMUFcblx0XHRcdFx0PGFcblx0XHRcdFx0XHRjbGFzc05hbWU9XCJpdG1cIlxuXHRcdFx0XHRcdC8vIHJvbWUtaWdub3JlIGxpbnQvYTExeS91c2VWYWxpZEFuY2hvcjogPGV4cGxhbmF0aW9uPlxuXHRcdFx0XHRcdG9uQ2xpY2s9eygpID0+XG5cdFx0XHRcdFx0XHRCZXR0ZXJOQ00ubmNtLm9wZW5VcmwoXCJodHRwczovL2dpdGh1Yi5jb20vTWljcm9DQmVyL0JldHRlck5DTVwiKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRzdHlsZT17e1xuXHRcdFx0XHRcdFx0d2lkdGg6IFwiMzJweFwiLFxuXHRcdFx0XHRcdFx0aGVpZ2h0OiBcIjMycHhcIixcblx0XHRcdFx0XHR9fVxuXHRcdFx0XHQ+XG5cdFx0XHRcdFx0aHR0cHM6Ly9naXRodWIuY29tL01pY3JvQ0Jlci9CZXR0ZXJOQ01cblx0XHRcdFx0PC9hPlxuXHRcdFx0PC9wPlxuXHRcdFx0PHA+XG5cdFx0XHRcdFx1OTAxQVx1OEZDN1x1NzBCOVx1NTFGQlx1NTNGM1x1NEUwQVx1ODlEMlx1NzY4NFx1N0Y1MVx1NjYxM1x1NEU5MVx1NTZGRVx1NjgwN1x1RkYwOFx1NTcyOFx1OEJCRVx1N0Y2RVx1NTZGRVx1NjgwN1x1NzY4NFx1NTNGM1x1NEZBN1x1RkYwOVx1NTNFRlx1NEVFNVx1NjI1M1x1NUYwMFx1NjNEMlx1NEVGNlx1N0JBMVx1NzQwNlx1NTY2OFx1RkYwQ1xuXHRcdFx0XHRcdTcxMzZcdTU0MEVcdTkwMUFcdThGQzdcdTYzRDJcdTRFRjZcdTdCQTFcdTc0MDZcdTU2NjhcdTkxNERcdTU5NTdcdTc2ODRcdTYzRDJcdTRFRjZcdTU1NDZcdTVFOTdcdUZGMENcdTVDMzFcdTUzRUZcdTRFRTVcdTVCODlcdTg4QzVcdTRGNjBcdTU1OUNcdTZCMjJcdTc2ODRcdTYzRDJcdTRFRjZcdTY3NjVcdTYyNjlcdTVDNTVcdTdGNTFcdTY2MTNcdTRFOTFcdTc2ODRcdTUyOUZcdTgwRkRcdTU0OENcdTU5MTZcdTg5QzJcdTU0RTZcdUZGMDFcblx0XHRcdDwvcD5cblx0XHRcdDxidXR0b24gb25DbGljaz17KCkgPT4gcHJvcHMub25SZXF1ZXN0Q2xvc2UoKX0+XHU1RjAwXHU1OUNCXHU0RjdGXHU3NTI4IEJldHRlck5DTTwvYnV0dG9uPlxuXHRcdDwvZGl2PlxuXHQpO1xufTtcbiIsICJpbXBvcnQgQmV0dGVyTkNNIGZyb20gXCIuLi9iZXR0ZXJuY20tYXBpXCI7XG5pbXBvcnQgeyBpc1NhZmVNb2RlLCBsb2FkZWRQbHVnaW5zLCBzcGxhc2hTY3JlZW4gfSBmcm9tIFwiLi4vbG9hZGVyXCI7XG5pbXBvcnQgeyBOQ01QbHVnaW4gfSBmcm9tIFwiLi4vcGx1Z2luXCI7XG5pbXBvcnQgeyBIZWFkZXJDb21wb25lbnQgfSBmcm9tIFwiLi9jb21wb25lbnRzL2hlYWRlclwiO1xuaW1wb3J0IHsgU2FmZU1vZGVJbmZvIH0gZnJvbSBcIi4vY29tcG9uZW50cy9zYWZlLW1vZGUtaW5mb1wiO1xuaW1wb3J0IHsgU3RhcnR1cFdhcm5pbmcgfSBmcm9tIFwiLi9jb21wb25lbnRzL3dhcm5pbmdcIjtcblxuY29uc3QgT1BFTkVEX1dBUk5JTkdTID0gXCJjb25maWcuYmV0dGVybmNtLm1hbmFnZXIub3BlbmVkd2FybmluZ3NcIjtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGluaXRQbHVnaW5NYW5hZ2VyKCkge1xuXHRzcGxhc2hTY3JlZW4uc2V0U3BsYXNoU2NyZWVuVGV4dChcIlx1NkI2M1x1NTcyOFx1NTIxRFx1NTlDQlx1NTMxNlx1NjNEMlx1NEVGNlx1N0JBMVx1NzQwNlx1NTY2OFwiKTtcblx0Ly8gXHU1MUM2XHU1OTA3XHU4QkJFXHU3RjZFXHU5ODc1XHU5NzYyXHU1NDhDXHU4QkJGXHU5NUVFXHU2MzA5XHU5NEFFXG5cdGNvbnN0IHNldHRpbmdzVmlldyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzZWN0aW9uXCIpO1xuXHRjb25zdCBtYWluUGFnZVZpZXc6IEhUTUxFbGVtZW50ID0gKGF3YWl0IEJldHRlck5DTS51dGlscy53YWl0Rm9yRWxlbWVudChcblx0XHRcInNlY3Rpb24uZy1tblwiLFxuXHQpKSEhO1xuXHRjb25zdCBzZXR0aW5nc0J1dHRvbiA9IChhd2FpdCBCZXR0ZXJOQ00udXRpbHMud2FpdEZvckVsZW1lbnQoXG5cdFx0J2FbaHJlZj1cIiMvbS9zZXR0aW5nL1wiXScsXG5cdCkpISEgYXMgSFRNTEFuY2hvckVsZW1lbnQ7XG5cdGNvbnN0IGJldHRlck5DTVNldHRpbmdzQnV0dG9uID0gc2V0dGluZ3NCdXR0b24uY2xvbmVOb2RlKFxuXHRcdHRydWUsXG5cdCkgYXMgSFRNTEFuY2hvckVsZW1lbnQ7XG5cdGJldHRlck5DTVNldHRpbmdzQnV0dG9uLmhyZWYgPSBcImphdmFzY3JpcHQ6dm9pZCgwKVwiO1xuXHRiZXR0ZXJOQ01TZXR0aW5nc0J1dHRvbi50aXRsZSA9IFwiQmV0dGVyTkNNXCI7XG5cblx0aWYgKGxvY2FsU3RvcmFnZS5nZXRJdGVtKE9QRU5FRF9XQVJOSU5HUykgIT09IFwidHJ1ZVwiKVxuXHRcdGJldHRlck5DTVNldHRpbmdzQnV0dG9uLmNsYXNzTGlzdC5hZGQoXCJibmNtLWJ0bi10d2lua2xpbmdcIik7XG5cdGJldHRlck5DTVNldHRpbmdzQnV0dG9uLmlubmVySFRNTCA9IGA8c3ZnIHN0eWxlPSd0cmFuc2Zvcm06IHNjYWxlKDAuOCk7Jz48dXNlIHhsaW5rOmhyZWY9XCJvcnBoZXVzOi8vb3JwaGV1cy9zdHlsZS9yZXMvc3ZnL3RvcGJhci5zcC5zdmcjbG9nb193aGl0ZVwiPjwvdXNlPjwvc3ZnPmA7XG5cdG1haW5QYWdlVmlldy5wYXJlbnRFbGVtZW50ISEuaW5zZXJ0QmVmb3JlKFxuXHRcdHNldHRpbmdzVmlldyxcblx0XHRtYWluUGFnZVZpZXcubmV4dEVsZW1lbnRTaWJsaW5nLFxuXHQpO1xuXHRzZXR0aW5nc0J1dHRvbi5wYXJlbnRFbGVtZW50ISEuaW5zZXJ0QmVmb3JlKFxuXHRcdGJldHRlck5DTVNldHRpbmdzQnV0dG9uLFxuXHRcdHNldHRpbmdzQnV0dG9uLm5leHRFbGVtZW50U2libGluZyxcblx0KTtcblx0UmVhY3RET00ucmVuZGVyKDxQbHVnaW5NYW5hZ2VyIC8+LCBzZXR0aW5nc1ZpZXcpO1xuXG5cdHNldHRpbmdzVmlldy5jbGFzc0xpc3QuYWRkKFwiYmV0dGVyLW5jbS1tYW5hZ2VyXCIpO1xuXHRzZXR0aW5nc1ZpZXcuY2xhc3NMaXN0LmFkZChcImctbW5cIik7XG5cblx0ZnVuY3Rpb24gc2hvd1NldHRpbmdzKCkge1xuXHRcdC8vIFx1NjcwOVx1NjNEMlx1NEVGNlx1NEYzQ1x1NEU0RVx1NEYxQVx1NjZGRlx1NjM2Mlx1NEUzQlx1OTg3NVx1NTE0M1x1N0QyMFx1RkYwQ1x1NUJGQ1x1ODFGNFx1NjIxMVx1NEVFQ1x1NzY4NFx1OEJCRVx1N0Y2RVx1OTg3NVx1OTc2Mlx1NjVFMFx1NkNENVx1NjYzRVx1NzkzQVx1RkYwQ1x1OTcwMFx1ODk4MVx1OEZEQlx1ODg0Q1x1NjhDMFx1NjdFNVxuXHRcdGlmIChzZXR0aW5nc1ZpZXcucGFyZW50RWxlbWVudCAhPT0gbWFpblBhZ2VWaWV3LnBhcmVudEVsZW1lbnQpIHtcblx0XHRcdG1haW5QYWdlVmlldy5wYXJlbnRFbGVtZW50ISEuaW5zZXJ0QmVmb3JlKFxuXHRcdFx0XHRzZXR0aW5nc1ZpZXcsXG5cdFx0XHRcdG1haW5QYWdlVmlldy5uZXh0RWxlbWVudFNpYmxpbmcsXG5cdFx0XHQpO1xuXHRcdH1cblx0XHRzZXR0aW5nc1ZpZXcuY2xhc3NMaXN0LmFkZChcIm5jbW0tc2hvd1wiKTtcblx0XHQvLyBcdTY3MDlcdTRFOUJcdTRFM0JcdTk4OThcdTYzRDJcdTRFRjZcdTRGMUFcdTdFRDlcdTYyMTFcdTRFRUNcdTRFM0JcdTk4NzVcdTRFMEEgIWltcG9ydGFudCBcdTRGMThcdTUxNDhcdTdFQTdcdTRGRUVcdTk5NzBcdTdCMjZcblx0XHQvLyBcdTYyNDBcdTRFRTVcdTVGOTdcdThGRDlcdTY4MzdcdTc4NkNcdTc4QjBcdTc4NkNcblx0XHRtYWluUGFnZVZpZXcuc2V0QXR0cmlidXRlKFwic3R5bGVcIiwgXCJkaXNwbGF5OiBub25lICFpbXBvcnRhbnQ7XCIpO1xuXHR9XG5cblx0ZnVuY3Rpb24gaGlkZVNldHRpbmdzKCkge1xuXHRcdHNldHRpbmdzVmlldy5jbGFzc0xpc3QucmVtb3ZlKFwibmNtbS1zaG93XCIpO1xuXHRcdG1haW5QYWdlVmlldy5yZW1vdmVBdHRyaWJ1dGUoXCJzdHlsZVwiKTtcblx0fVxuXG5cdCEoYXN5bmMgKCkgPT4ge1xuXHRcdGNvbnN0IGx5cmljQnV0dG9uID0gKGF3YWl0IEJldHRlck5DTS51dGlscy53YWl0Rm9yRWxlbWVudChcblx0XHRcdFwiZGl2LmNvdmVyLnUtY292ZXIudS1jb3Zlci1zbSA+IGEgPiBzcGFuXCIsXG5cdFx0XHQxMDAwLFxuXHRcdCkpISEgYXMgSFRNTEFuY2hvckVsZW1lbnQ7XG5cdFx0bHlyaWNCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGhpZGVTZXR0aW5ncyk7XG5cdH0pKCk7XG5cblx0c2V0dGluZ3NCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGhpZGVTZXR0aW5ncyk7XG5cdGJldHRlck5DTVNldHRpbmdzQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG5cdFx0aWYgKHNldHRpbmdzVmlldy5jbGFzc0xpc3QuY29udGFpbnMoXCJuY21tLXNob3dcIikpIHtcblx0XHRcdGhpZGVTZXR0aW5ncygpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzaG93U2V0dGluZ3MoKTtcblx0XHR9XG5cdH0pO1xuXG5cdC8vIFx1NTk4Mlx1Njc5Q1x1NTkxNlx1OTBFOFx1OTg3NVx1OTc2Mlx1NTNEOFx1NjZGNFx1RkYwOFx1NzBCOVx1NTFGQlx1NEU4Nlx1NTE3Nlx1NUI4M1x1NjMwOVx1OTRBRVx1OERGM1x1OEY2Q1x1RkYwOVx1NTIxOVx1NTE3M1x1OTVFRFx1OEJCRVx1N0Y2RVx1OTg3NVx1OTc2MlxuXHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImhhc2hjaGFuZ2VcIiwgaGlkZVNldHRpbmdzKTtcblx0bmV3IE11dGF0aW9uT2JzZXJ2ZXIoKHJzKSA9PiB7XG5cdFx0Zm9yIChjb25zdCByIG9mIHJzKSB7XG5cdFx0XHRpZiAoci5hdHRyaWJ1dGVOYW1lID09PSBcInN0eWxlXCIpIHtcblx0XHRcdFx0Ly8gXHU0RkE3XHU2ODBGXHU2NjJGXHU1M0VGXHU0RUU1XHU2MkQ2XHU2MkZEXHU2NTM5XHU1M0Q4XHU1OTI3XHU1QzBGXHU3Njg0XHVGRjBDXHU2MjQwXHU0RUU1XHU2MjExXHU0RUVDXHU0RTVGXHU4OTgxXHU0RTAwXHU4RDc3XHU1NDBDXHU2QjY1XHU0RkVFXHU2NTM5XG5cdFx0XHRcdHNldHRpbmdzVmlldy5zdHlsZS5sZWZ0ID0gbWFpblBhZ2VWaWV3LnN0eWxlLmxlZnQ7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KS5vYnNlcnZlKG1haW5QYWdlVmlldywge1xuXHRcdGF0dHJpYnV0ZXM6IHRydWUsXG5cdH0pO1xufVxuXG5leHBvcnQgbGV0IG9uUGx1Z2luTG9hZGVkID0gKF86IHR5cGVvZiBsb2FkZWRQbHVnaW5zKSA9PiB7fTtcblxuY29uc3QgUGx1Z2luTWFuYWdlcjogUmVhY3QuRkMgPSAoKSA9PiB7XG5cdGNvbnN0IFtzZWxlY3RlZFBsdWdpbiwgc2V0U2VsZWN0ZWRQbHVnaW5dID0gUmVhY3QudXNlU3RhdGU8TkNNUGx1Z2luIHwgbnVsbD4oXG5cdFx0bG9hZGVkUGx1Z2luc1tcIlBsdWdpbk1hcmtldFwiXSxcblx0KTtcblx0Y29uc3QgcGx1Z2luQ29uZmlnUmVmID0gUmVhY3QudXNlUmVmPEhUTUxEaXZFbGVtZW50IHwgbnVsbD4obnVsbCk7XG5cdGNvbnN0IFtsb2FkZWRQbHVnaW5zTGlzdCwgc2V0TG9hZGVkUGx1Z2luc10gPSBSZWFjdC51c2VTdGF0ZTxzdHJpbmdbXT4oW10pO1xuXHRjb25zdCBbc2hvd1N0YXJ0dXBXYXJuaW5ncywgc2V0U2hvd1N0YXJ0dXBXYXJuaW5nc10gPSBSZWFjdC51c2VTdGF0ZShcblx0XHRsb2NhbFN0b3JhZ2UuZ2V0SXRlbShPUEVORURfV0FSTklOR1MpICE9PSBcInRydWVcIixcblx0KTtcblx0Y29uc3QgW3NhZmVNb2RlLCBzZXRTYWZlTW9kZV0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSk7XG5cblx0UmVhY3QudXNlRWZmZWN0KCgpID0+IHtcblx0XHRpc1NhZmVNb2RlKCkudGhlbihzZXRTYWZlTW9kZSk7XG5cdH0sIFtdKTtcblxuXHRSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuXHRcdGZ1bmN0aW9uIHNvcnRGdW5jKGtleTE6IHN0cmluZywga2V5Mjogc3RyaW5nKSB7XG5cdFx0XHRjb25zdCBnZXRTb3J0VmFsdWUgPSAoa2V5OiBzdHJpbmcpID0+IHtcblx0XHRcdFx0Y29uc3QgbG9hZFBsdWdpbiA9IGxvYWRlZFBsdWdpbnNba2V5XTtcblx0XHRcdFx0Y29uc3QgdmFsdWUgPSBsb2FkUGx1Z2luLmhhdmVDb25maWdFbGVtZW50KCkgPyAxIDogMDtcblxuXHRcdFx0XHQvLyBcdTVDMDZcdTYzRDJcdTRFRjZcdTU1NDZcdTVFOTdcdTYzOTJcdTUyMzBcdTY3MDBcdTUyNERcdTk3NjJcblx0XHRcdFx0aWYgKGxvYWRQbHVnaW4ubWFuaWZlc3QubmFtZS5zdGFydHNXaXRoKFwiUGx1Z2luTWFya2V0XCIpKVxuXHRcdFx0XHRcdHJldHVybiBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcblxuXHRcdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0XHR9O1xuXHRcdFx0cmV0dXJuIGdldFNvcnRWYWx1ZShrZXkyKSAtIGdldFNvcnRWYWx1ZShrZXkxKTtcblx0XHR9XG5cdFx0c2V0TG9hZGVkUGx1Z2lucyhPYmplY3Qua2V5cyhsb2FkZWRQbHVnaW5zKS5zb3J0KHNvcnRGdW5jKSk7XG5cdFx0b25QbHVnaW5Mb2FkZWQgPSAobG9hZGVkUGx1Z2lucykgPT4ge1xuXHRcdFx0Y29uc29sZS5sb2coXCJcdTYzRDJcdTRFRjZcdTUyQTBcdThGN0RcdTVCOENcdTYyMTBcdUZGMDFcIik7XG5cdFx0XHRzZXRMb2FkZWRQbHVnaW5zKE9iamVjdC5rZXlzKGxvYWRlZFBsdWdpbnMpLnNvcnQoc29ydEZ1bmMpKTtcblx0XHR9O1xuXHR9LCBbXSk7XG5cblx0UmVhY3QudXNlRWZmZWN0KCgpID0+IHtcblx0XHRjb25zdCBteURvbUVsZW1lbnQgPVxuXHRcdFx0KHNlbGVjdGVkUGx1Z2luPy5pbmplY3RzXG5cdFx0XHRcdC5tYXAoKHYpID0+IHYuX2dldENvbmZpZ0VsZW1lbnQoKSlcblx0XHRcdFx0LmZpbHRlcigodikgPT4gdiAhPT0gbnVsbCkgYXMgSFRNTEVsZW1lbnRbXSB8IG51bGwpIHx8IFtdO1xuXG5cdFx0aWYgKG15RG9tRWxlbWVudC5sZW5ndGggPT09IDApIHtcblx0XHRcdGNvbnN0IHRpcEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuXHRcdFx0dGlwRWxlbWVudC5pbm5lclRleHQgPSBcIlx1OEJFNVx1NjNEMlx1NEVGNlx1NkNBMVx1NjcwOVx1NTNFRlx1NzUyOFx1NzY4NFx1OEJCRVx1N0Y2RVx1OTAwOVx1OTg3OVwiO1xuXHRcdFx0bXlEb21FbGVtZW50LnB1c2godGlwRWxlbWVudCk7XG5cdFx0fVxuXG5cdFx0cGx1Z2luQ29uZmlnUmVmLmN1cnJlbnQ/LnJlcGxhY2VDaGlsZHJlbiguLi5teURvbUVsZW1lbnQpO1xuXHR9LCBbc2VsZWN0ZWRQbHVnaW5dKTtcblxuXHRyZXR1cm4gKFxuXHRcdDxkaXYgY2xhc3NOYW1lPVwiYm5jbS1tZ3JcIj5cblx0XHRcdDxkaXY+XG5cdFx0XHRcdDxIZWFkZXJDb21wb25lbnRcblx0XHRcdFx0XHRvblJlcXVlc3RPcGVuU3RhcnR1cFdhcm5pbmdzPXsoKSA9PiB7XG5cdFx0XHRcdFx0XHRzZXRTaG93U3RhcnR1cFdhcm5pbmdzKCFzaG93U3RhcnR1cFdhcm5pbmdzKTtcblx0XHRcdFx0XHR9fVxuXHRcdFx0XHQvPlxuXHRcdFx0XHR7c2FmZU1vZGUgPyAoXG5cdFx0XHRcdFx0PFNhZmVNb2RlSW5mbyAvPlxuXHRcdFx0XHQpIDogc2hvd1N0YXJ0dXBXYXJuaW5ncyA/IChcblx0XHRcdFx0XHQ8U3RhcnR1cFdhcm5pbmdcblx0XHRcdFx0XHRcdG9uUmVxdWVzdENsb3NlPXsoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdGxvY2FsU3RvcmFnZS5zZXRJdGVtKE9QRU5FRF9XQVJOSU5HUywgXCJ0cnVlXCIpO1xuXHRcdFx0XHRcdFx0XHRzZXRTaG93U3RhcnR1cFdhcm5pbmdzKGZhbHNlKTtcblx0XHRcdFx0XHRcdFx0ZG9jdW1lbnRcblx0XHRcdFx0XHRcdFx0XHQucXVlcnlTZWxlY3RvcihcIi5ibmNtLWJ0bi10d2lua2xpbmdcIilcblx0XHRcdFx0XHRcdFx0XHQ/LmNsYXNzTGlzdC5yZW1vdmUoXCJibmNtLWJ0bi10d2lua2xpbmdcIik7XG5cdFx0XHRcdFx0XHR9fVxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdCkgOiAoXG5cdFx0XHRcdFx0PHNlY3Rpb25cblx0XHRcdFx0XHRcdHN0eWxlPXt7XG5cdFx0XHRcdFx0XHRcdGRpc3BsYXk6IFwiZmxleFwiLFxuXHRcdFx0XHRcdFx0XHRmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuXHRcdFx0XHRcdFx0XHRmbGV4OiBcIjFcIixcblx0XHRcdFx0XHRcdFx0bWFyZ2luQm90dG9tOiBcIjBcIixcblx0XHRcdFx0XHRcdH19XG5cdFx0XHRcdFx0PlxuXHRcdFx0XHRcdFx0PGRpdlxuXHRcdFx0XHRcdFx0XHRjbGFzc05hbWU9XCJ2LXNjcm9sbCBsb2FkZWQtcGx1Z2lucy1saXN0XCJcblx0XHRcdFx0XHRcdFx0c3R5bGU9e3tcblx0XHRcdFx0XHRcdFx0XHRib3JkZXJSaWdodDogXCIxcHggc29saWQgIzg4ODVcIixcblx0XHRcdFx0XHRcdFx0fX1cblx0XHRcdFx0XHRcdD5cblx0XHRcdFx0XHRcdFx0PGRpdj5cblx0XHRcdFx0XHRcdFx0XHQ8ZGl2PlxuXHRcdFx0XHRcdFx0XHRcdFx0e2xvYWRlZFBsdWdpbnNMaXN0Lm1hcCgoa2V5KSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IGxvYWRQbHVnaW4gPSBsb2FkZWRQbHVnaW5zW2tleV07XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IGhhdmVDb25maWcgPSBsb2FkUGx1Z2luLmhhdmVDb25maWdFbGVtZW50KCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiAoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gcm9tZS1pZ25vcmUgbGludC9hMTF5L3VzZUtleVdpdGhDbGlja0V2ZW50czogPGV4cGxhbmF0aW9uPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxkaXZcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNsYXNzTmFtZT17XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGhhdmVDb25maWdcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ/IHNlbGVjdGVkUGx1Z2luPy5tYW5pZmVzdC5zbHVnID09PSBrZXlcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdD8gXCJwbHVnaW4tYnRuIHNlbGVjdGVkXCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDogXCJwbHVnaW4tYnRuXCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ6IFwicGx1Z2luLWJ0bi1kaXNhYmxlZCBwbHVnaW4tYnRuXCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRhdGEtcGx1Z2luLXNsdWc9e2tleX1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9uQ2xpY2s9eygpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKGhhdmVDb25maWcpIHNldFNlbGVjdGVkUGx1Z2luKGxvYWRQbHVnaW4pO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fX1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9XCJwbHVnaW4tbGlzdC1uYW1lXCI+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHtsb2FkUGx1Z2luLm1hbmlmZXN0Lm5hbWV9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8L3NwYW4+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR7IWxvYWRQbHVnaW4ucGx1Z2luUGF0aC5pbmNsdWRlcyhcIi4vcGx1Z2luc19kZXZcIikgJiZcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0bG9hZFBsdWdpbi5tYW5pZmVzdC5uYW1lICE9PSBcIlBsdWdpbk1hcmtldFwiICYmIChcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvLyByb21lLWlnbm9yZSBsaW50L2ExMXkvdXNlS2V5V2l0aENsaWNrRXZlbnRzOiA8ZXhwbGFuYXRpb24+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PHNwYW5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNsYXNzTmFtZT1cInBsdWdpbi11bmluc3RhbGwtYnRuXCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9uQ2xpY2s9e2FzeW5jIChlKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgcmVxdWlyZVJlc3RhcnQgPVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGxvYWRQbHVnaW4ubWFuaWZlc3QucmVxdWlyZV9yZXN0YXJ0IHx8XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0bG9hZFBsdWdpbi5tYW5pZmVzdC5uYXRpdmVfcGx1Z2luO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IHBsdWdpbkZpbGVQYXRoID1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRhd2FpdCBCZXR0ZXJOQ00uZnMucmVhZEZpbGVUZXh0KFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YCR7bG9hZFBsdWdpbi5wbHVnaW5QYXRofS8ucGx1Z2luLnBhdGgubWV0YWAsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKHBsdWdpbkZpbGVQYXRoLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRhd2FpdCBCZXR0ZXJOQ00uZnMucmVtb3ZlKHBsdWdpbkZpbGVQYXRoKTtcblxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChyZXF1aXJlUmVzdGFydCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YXdhaXQgQmV0dGVyTkNNLmFwcC5yZWxvYWRQbHVnaW5zKCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdEJldHRlck5DTS5yZWxvYWQoKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fX1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8c3ZnXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR3aWR0aD17MjR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGhlaWdodD17MjR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHZpZXdCb3g9XCIwIDAgMjQgMjRcIlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRmaWxsPVwibm9uZVwiXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHN0cm9rZT1cImN1cnJlbnRDb2xvclwiXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHN0cm9rZVdpZHRoPXsyfVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzdHJva2VMaW5lY2FwPVwicm91bmRcIlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzdHJva2VMaW5lam9pbj1cInJvdW5kXCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2xhc3NOYW1lPVwiZmVhdGhlciBmZWF0aGVyLXRyYXNoLTJcIlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8cG9seWxpbmUgcG9pbnRzPVwiMyA2IDUgNiAyMSA2XCIgLz5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PHBhdGggZD1cIk0xOSA2djE0YTIgMiAwIDAgMS0yIDJIN2EyIDIgMCAwIDEtMi0yVjZtMyAwVjRhMiAyIDAgMCAxIDItMmg0YTIgMiAwIDAgMSAyIDJ2MlwiIC8+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxsaW5lIHgxPXsxMH0geTE9ezExfSB4Mj17MTB9IHkyPXsxN30gLz5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PGxpbmUgeDE9ezE0fSB5MT17MTF9IHgyPXsxNH0geTI9ezE3fSAvPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PC9zdmc+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PC9zcGFuPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQpfVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fSl9XG5cdFx0XHRcdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cInYtc2Nyb2xsXCI+XG5cdFx0XHRcdFx0XHRcdDxkaXY+XG5cdFx0XHRcdFx0XHRcdFx0PGRpdlxuXHRcdFx0XHRcdFx0XHRcdFx0c3R5bGU9e3tcblx0XHRcdFx0XHRcdFx0XHRcdFx0b3ZlcmZsb3dZOiBcInNjcm9sbFwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRvdmVyZmxvd1g6IFwiaGlkZGVuXCIsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHBhZGRpbmc6IFwiMTZweFwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0fX1cblx0XHRcdFx0XHRcdFx0XHRcdHJlZj17cGx1Z2luQ29uZmlnUmVmfVxuXHRcdFx0XHRcdFx0XHRcdC8+XG5cdFx0XHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0PC9zZWN0aW9uPlxuXHRcdFx0XHQpfVxuXHRcdFx0PC9kaXY+XG5cdFx0PC9kaXY+XG5cdCk7XG59O1xuIiwgImV4cG9ydCBpbnRlcmZhY2UgSW5qZWN0RmlsZSB7XG5cdGZpbGU6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBIaWphY2tPcGVyYXRpb24ge1xuXHR0eXBlOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSGlqYWNrUmVwbGFjZU9yUmVnZXhPcGVyYXRpb24gZXh0ZW5kcyBIaWphY2tPcGVyYXRpb24ge1xuXHR0eXBlOiBcInJlcGxhY2VcIiB8IFwicmVnZXhcIjtcblx0ZnJvbTogc3RyaW5nO1xuXHR0bzogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEhpamFja0FwcGVuZE9yUHJlcGVuZE9wZXJhdGlvbiBleHRlbmRzIEhpamFja09wZXJhdGlvbiB7XG5cdHR5cGU6IFwiYXBwZW5kXCIgfCBcInByZXBlbmRcIjtcblx0Y29kZTogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFBsdWdpbk1hbmlmZXN0IHtcblx0bmF0aXZlX3BsdWdpbjogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXHRyZXF1aXJlX3Jlc3RhcnQ6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG5cdG1hbmlmZXN0X3ZlcnNpb246IG51bWJlcjtcblx0bmFtZTogc3RyaW5nO1xuXHR2ZXJzaW9uOiBzdHJpbmc7XG5cdHNsdWc6IHN0cmluZztcblx0LyoqIFx1NjYyRlx1NTQyNlx1Nzk4MVx1NzUyOFx1ODFFQVx1NUUyNlx1NzY4NFx1NUYwMFx1NTNEMVx1OTFDRFx1OEY3RFx1NTI5Rlx1ODBGRFx1RkYwQ1x1OTAwMlx1NzUyOFx1NEU4RVx1OTBBM1x1NEU5Qlx1OTcwMFx1ODk4MVx1ODFFQVx1NTIzNlx1NzBFRFx1OTFDRFx1OEY3RFx1NzY4NFx1NjNEMlx1NEVGNlx1NUYwMFx1NTNEMVx1ODAwNVx1NEVFQ1x1RkYwQ1x1OUVEOFx1OEJBNFx1NEUwRFx1Nzk4MVx1NzUyOCAqL1xuXHRub0RldlJlbG9hZD86IGJvb2xlYW47XG5cdGxvYWRBZnRlcj86IHN0cmluZ1tdO1xuXHRsb2FkQmVmb3JlPzogc3RyaW5nW107XG5cdGluamVjdHM6IHsgW3BhZ2VUeXBlOiBzdHJpbmddOiBJbmplY3RGaWxlW10gfTtcblx0aGlqYWNrczoge1xuXHRcdFt2ZXJzaW9uUmFuZ2U6IHN0cmluZ106IHtcblx0XHRcdFttYXRjaFVybFBhdGg6IHN0cmluZ106XG5cdFx0XHRcdHwgSGlqYWNrUmVwbGFjZU9yUmVnZXhPcGVyYXRpb25cblx0XHRcdFx0fCBIaWphY2tBcHBlbmRPclByZXBlbmRPcGVyYXRpb247XG5cdFx0fTtcblx0fTtcbn1cblxuZXhwb3J0IGNsYXNzIE5DTVBsdWdpbiBleHRlbmRzIEV2ZW50VGFyZ2V0IHtcblx0cGx1Z2luUGF0aDogc3RyaW5nID0gXCJcIjtcblx0aW5qZWN0czogTkNNSW5qZWN0UGx1Z2luW10gPSBbXTtcblx0bWFuaWZlc3Q6IFBsdWdpbk1hbmlmZXN0O1xuXHRmaW5pc2hlZDogYm9vbGVhbiA9IGZhbHNlO1xuXHQjaGF2ZUNvbmZpZ0VsZTogYm9vbGVhbiB8IG51bGwgPSBudWxsO1xuXHRkZXZNb2RlOiBib29sZWFuID0gZmFsc2U7XG5cdGNvbnN0cnVjdG9yKG1hbmlmZXN0OiBQbHVnaW5NYW5pZmVzdCwgcGx1Z2luUGF0aDogc3RyaW5nLCBkZXZNb2RlOiBib29sZWFuKSB7XG5cdFx0c3VwZXIoKTtcblx0XHR0aGlzLmRldk1vZGUgPSBkZXZNb2RlO1xuXHRcdHRoaXMubWFuaWZlc3QgPSBtYW5pZmVzdDtcblx0XHR0aGlzLnBsdWdpblBhdGggPSBwbHVnaW5QYXRoO1xuXHRcdHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgKGV2dDogQ3VzdG9tRXZlbnQpID0+IHtcblx0XHRcdHRoaXMuaW5qZWN0cy5mb3JFYWNoKChpbmplY3QpID0+IHtcblx0XHRcdFx0aW5qZWN0LmRpc3BhdGNoRXZlbnQoZXZ0KTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHRcdHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcImFsbHBsdWdpbnNsb2FkZWRcIiwgKGV2dDogQ3VzdG9tRXZlbnQpID0+IHtcblx0XHRcdHRoaXMuaW5qZWN0cy5mb3JFYWNoKChpbmplY3QpID0+IHtcblx0XHRcdFx0aW5qZWN0LmRpc3BhdGNoRXZlbnQoZXZ0KTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9XG5cdGhhdmVDb25maWdFbGVtZW50KCkge1xuXHRcdGlmICh0aGlzLiNoYXZlQ29uZmlnRWxlID09IG51bGwpXG5cdFx0XHR0aGlzLiNoYXZlQ29uZmlnRWxlID1cblx0XHRcdFx0dGhpcy5pbmplY3RzLnJlZHVjZTxIVE1MRWxlbWVudCB8IG51bGw+KFxuXHRcdFx0XHRcdChwcmV2aW91cywgcGx1Z2luKSA9PiBwcmV2aW91cyA/PyBwbHVnaW4uX2dldENvbmZpZ0VsZW1lbnQoKSxcblx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHQpICE9PSBudWxsO1xuXHRcdHJldHVybiB0aGlzLiNoYXZlQ29uZmlnRWxlO1xuXHR9XG59XG5cbm5hbWVzcGFjZSBjb25maWdUb29sQm94IHtcblx0ZXhwb3J0IGZ1bmN0aW9uIG1ha2VCdG4oXG5cdFx0dGV4dDogc3RyaW5nLFxuXHRcdG9uQ2xpY2s6ICgpID0+IHZvaWQsXG5cdFx0c21hbGxlciA9IGZhbHNlLFxuXHRcdGFyZ3MgPSB7fSxcblx0KSB7XG5cdFx0cmV0dXJuIGRvbShcImFcIiwge1xuXHRcdFx0Y2xhc3M6IFtcInUtaWJ0bjVcIiwgc21hbGxlciAmJiBcInUtaWJ0bnN6OFwiXSxcblx0XHRcdHN0eWxlOiB7IG1hcmdpbjogXCIuMmVtIC41ZW1cIiB9LFxuXHRcdFx0aW5uZXJUZXh0OiB0ZXh0LFxuXHRcdFx0b25jbGljazogb25DbGljayxcblx0XHRcdC4uLmFyZ3MsXG5cdFx0fSk7XG5cdH1cblxuXHRleHBvcnQgZnVuY3Rpb24gbWFrZUNoZWNrYm94KGFyZ3MgPSB7fSkge1xuXHRcdHJldHVybiBkb20oXCJpbnB1dFwiLCB7IHR5cGU6IFwiY2hlY2tib3hcIiwgLi4uYXJncyB9KTtcblx0fVxuXG5cdGV4cG9ydCBmdW5jdGlvbiBtYWtlSW5wdXQodmFsdWUsIGFyZ3MgPSB7fSkge1xuXHRcdHJldHVybiBkb20oXCJpbnB1dFwiLCB7XG5cdFx0XHR2YWx1ZSxcblx0XHRcdHN0eWxlOiB7IG1hcmdpbjogXCIuMmVtIC41ZW1cIiwgYm9yZGVyUmFkaXVzOiBcIi41ZW1cIiB9LFxuXHRcdFx0Y2xhc3M6IFtcInUtdHh0XCIsIFwic2MtZmxhZ1wiXSxcblx0XHRcdC4uLmFyZ3MsXG5cdFx0fSk7XG5cdH1cbn1cblxuZXhwb3J0IGNsYXNzIE5DTUluamVjdFBsdWdpbiBleHRlbmRzIEV2ZW50VGFyZ2V0IHtcblx0cGx1Z2luUGF0aDogc3RyaW5nID0gXCJcIjtcblx0bWFuaWZlc3Q6IFBsdWdpbk1hbmlmZXN0O1xuXHRjb25maWdWaWV3RWxlbWVudDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcblx0bWFpblBsdWdpbjogTkNNUGx1Z2luO1xuXHRsb2FkRXJyb3I6IEVycm9yIHwgbnVsbCA9IG51bGw7XG5cdGZpbmlzaGVkOiBib29sZWFuID0gZmFsc2U7XG5cdGNvbnN0cnVjdG9yKG1haW5QbHVnaW46IE5DTVBsdWdpbiwgcHVibGljIHJlYWRvbmx5IGZpbGVQYXRoOiBzdHJpbmcpIHtcblx0XHRzdXBlcigpO1xuXHRcdHRoaXMubWFpblBsdWdpbiA9IG1haW5QbHVnaW47XG5cdFx0dGhpcy5tYW5pZmVzdCA9IG1haW5QbHVnaW4ubWFuaWZlc3Q7XG5cdFx0dGhpcy5wbHVnaW5QYXRoID0gbWFpblBsdWdpbi5wbHVnaW5QYXRoO1xuXHR9XG5cblx0b25Mb2FkKGZuOiAoc2VsZlBsdWdpbjogTkNNUGx1Z2luLCBldnQ6IEN1c3RvbUV2ZW50KSA9PiB2b2lkKSB7XG5cdFx0dGhpcy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCAoZXZ0OiBDdXN0b21FdmVudCkgPT4ge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0Zm4uY2FsbCh0aGlzLCBldnQuZGV0YWlsLCBldnQpO1xuXHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHR0aGlzLmxvYWRFcnJvciA9IGU7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblx0Ly8gcm9tZS1pZ25vcmUgbGludC9zdXNwaWNpb3VzL25vRXhwbGljaXRBbnk6IFRPRE86IFx1NURFNVx1NTE3N1x1N0M3Qlx1NTNDMlx1NjU3MFxuXHRvbkNvbmZpZyhmbjogKHRvb2xzQm94OiBhbnkpID0+IEhUTUxFbGVtZW50KSB7XG5cdFx0dGhpcy5hZGRFdmVudExpc3RlbmVyKFwiY29uZmlnXCIsIChldnQ6IEN1c3RvbUV2ZW50KSA9PiB7XG5cdFx0XHR0aGlzLmNvbmZpZ1ZpZXdFbGVtZW50ID0gZm4uY2FsbCh0aGlzLCBldnQuZGV0YWlsKTtcblx0XHR9KTtcblx0fVxuXHRvbkFsbFBsdWdpbnNMb2FkZWQoXG5cdFx0Zm46IChsb2FkZWRQbHVnaW5zOiB0eXBlb2Ygd2luZG93LmxvYWRlZFBsdWdpbnMsIGV2dDogQ3VzdG9tRXZlbnQpID0+IHZvaWQsXG5cdCkge1xuXHRcdHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcImFsbHBsdWdpbnNsb2FkZWRcIiwgZnVuY3Rpb24gKGV2dDogQ3VzdG9tRXZlbnQpIHtcblx0XHRcdGZuLmNhbGwodGhpcywgZXZ0LmRldGFpbCwgZXZ0KTtcblx0XHR9KTtcblx0fVxuXHRnZXRDb25maWc8VD4oa2V5OiBzdHJpbmcpOiBUIHwgdW5kZWZpbmVkO1xuXHRnZXRDb25maWc8VD4oa2V5OiBzdHJpbmcsIGRlZmF1bHRWYWx1ZTogVCk6IFQ7XG5cdGdldENvbmZpZzxUPihrZXk6IHN0cmluZywgZGVmYXVsdFZhbHVlPzogVCk6IFQgfCB1bmRlZmluZWQge1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBjb25maWcgPSBKU09OLnBhcnNlKFxuXHRcdFx0XHRsb2NhbFN0b3JhZ2UuZ2V0SXRlbShgY29uZmlnLmJldHRlcm5jbS4ke3RoaXMubWFuaWZlc3Quc2x1Z31gKSB8fCBcInt9XCIsXG5cdFx0XHQpO1xuXHRcdFx0aWYgKGNvbmZpZ1trZXldICE9PSB1bmRlZmluZWQpIHJldHVybiBjb25maWdba2V5XTtcblx0XHR9IGNhdGNoIHt9XG5cdFx0cmV0dXJuIGRlZmF1bHRWYWx1ZTtcblx0fVxuXHRzZXRDb25maWc8VD4oa2V5OiBzdHJpbmcsIHZhbHVlOiBUKSB7XG5cdFx0bGV0IGNvbmZpZyA9IEpTT04ucGFyc2UoXG5cdFx0XHRsb2NhbFN0b3JhZ2UuZ2V0SXRlbShgY29uZmlnLmJldHRlcm5jbS4ke3RoaXMubWFuaWZlc3Quc2x1Z31gKSB8fCBcInt9XCIsXG5cdFx0KTtcblx0XHRpZiAoIWNvbmZpZyB8fCB0eXBlb2YgY29uZmlnICE9PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRjb25maWcgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXHRcdH1cblx0XHRjb25maWdba2V5XSA9IHZhbHVlO1xuXHRcdGxvY2FsU3RvcmFnZVtgY29uZmlnLmJldHRlcm5jbS4ke3RoaXMubWFuaWZlc3Quc2x1Z31gXSA9XG5cdFx0XHRKU09OLnN0cmluZ2lmeShjb25maWcpO1xuXHR9XG5cdF9nZXRDb25maWdFbGVtZW50KCkge1xuXHRcdGlmICghdGhpcy5jb25maWdWaWV3RWxlbWVudClcblx0XHRcdHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoXCJjb25maWdcIiwgeyBkZXRhaWw6IGNvbmZpZ1Rvb2xCb3ggfSkpO1xuXHRcdHJldHVybiB0aGlzLmNvbmZpZ1ZpZXdFbGVtZW50O1xuXHR9XG59XG4iLCAiaW1wb3J0IEJldHRlck5DTSBmcm9tIFwiLi9iZXR0ZXJuY20tYXBpXCI7XG5pbXBvcnQgeyBpbml0UGx1Z2luTWFuYWdlciwgb25QbHVnaW5Mb2FkZWQgfSBmcm9tIFwiLi9wbHVnaW4tbWFuYWdlclwiO1xuaW1wb3J0IHsgYmV0dGVybmNtRmV0Y2ggfSBmcm9tIFwiLi9iZXR0ZXJuY20tYXBpL2Jhc2VcIjtcbmltcG9ydCB7IE5DTVBsdWdpbiwgTkNNSW5qZWN0UGx1Z2luIH0gZnJvbSBcIi4vcGx1Z2luXCI7XG5cbmV4cG9ydCBsZXQgbG9hZGVkUGx1Z2luczogdHlwZW9mIHdpbmRvdy5sb2FkZWRQbHVnaW5zID0ge307XG5cbmNvbnN0IFNBRkVfTU9ERV9LRVkgPSBcImJldHRlcm5jbS5zYWZlbW9kZVwiO1xuY29uc3QgTE9BRF9FUlJPUl9LRVkgPSBcImJldHRlcm5jbS5sb2FkZXJyb3JcIjtcbmNvbnN0IENQUF9TSURFX0lOSkVDVF9ESVNBQkxFX0tFWSA9XG5cdFwiY2MubWljcm9ibG9jay5iZXR0ZXJuY20uY3BwX3NpZGVfaW5qZWN0X2ZlYXR1cmVfZGlzYWJsZWRcIjtcblxuZXhwb3J0IG5hbWVzcGFjZSBzcGxhc2hTY3JlZW4ge1xuXHRleHBvcnQgZnVuY3Rpb24gaGlkZVNwbGFzaFNjcmVlbigpIHtcblx0XHRjb25zdCBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYm5jbS1zcGxhc2gtc2NyZWVuXCIpO1xuXHRcdGlmIChlbCkge1xuXHRcdFx0Y29uc3QgYW5pbSA9IGVsLmFuaW1hdGUoXG5cdFx0XHRcdFt7IG9wYWNpdHk6IDEgfSwgeyBvcGFjaXR5OiAwLCBkaXNwbGF5OiBcIm5vbmVcIiB9XSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGR1cmF0aW9uOiAzMDAsXG5cdFx0XHRcdFx0ZmlsbDogXCJmb3J3YXJkc1wiLFxuXHRcdFx0XHRcdGVhc2luZzogXCJjdWJpYy1iZXppZXIoMC40MiwwLDAuNTgsMSlcIixcblx0XHRcdFx0fSxcblx0XHRcdCk7XG5cdFx0XHRhbmltLmNvbW1pdFN0eWxlcygpO1xuXHRcdH1cblx0fVxuXHRleHBvcnQgZnVuY3Rpb24gc2hvd1NwbGFzaFNjcmVlbigpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblx0XHRcdGNvbnN0IGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJibmNtLXNwbGFzaC1zY3JlZW5cIik7XG5cdFx0XHRpZiAoIWVsKSB7XG5cdFx0XHRcdHJldHVybiByZXNvbHZlKCk7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IGFuaW0gPSBlbC5hbmltYXRlKFt7IG9wYWNpdHk6IDAgfSwgeyBvcGFjaXR5OiAxIH1dLCB7XG5cdFx0XHRcdGR1cmF0aW9uOiAzMDAsXG5cdFx0XHRcdGZpbGw6IFwiZm9yd2FyZHNcIixcblx0XHRcdFx0ZWFzaW5nOiBcImN1YmljLWJlemllcigwLjQyLCAwLCAwLjU4LCAxKVwiLFxuXHRcdFx0fSk7XG5cblx0XHRcdGFuaW0uYWRkRXZlbnRMaXN0ZW5lcihcblx0XHRcdFx0XCJmaW5pc2hcIixcblx0XHRcdFx0KF8pID0+IHtcblx0XHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRvbmNlOiB0cnVlLFxuXHRcdFx0XHR9LFxuXHRcdFx0KTtcblxuXHRcdFx0YW5pbS5jb21taXRTdHlsZXMoKTtcblx0XHR9KTtcblx0fVxuXHRleHBvcnQgZnVuY3Rpb24gc2V0U3BsYXNoU2NyZWVuVGV4dCh0ZXh0OiBzdHJpbmcpIHtcblx0XHRjb25zdCBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYm5jbS1zcGxhc2gtc2NyZWVuLXRleHRcIik7XG5cdFx0aWYgKGVsKSB7XG5cdFx0XHRlbC5pbm5lclRleHQgPSB0ZXh0O1xuXHRcdH1cblx0fVxuXHRleHBvcnQgZnVuY3Rpb24gc2V0U3BsYXNoU2NyZWVuUHJvZ3Jlc3MocHJvZ3Jlc3M6IG51bWJlcikge1xuXHRcdGNvbnN0IGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJibmNtLXNwbGFzaC1zY3JlZW4tcHJvZ3Jlc3NcIik7XG5cdFx0aWYgKGVsKSB7XG5cdFx0XHRpZiAocHJvZ3Jlc3MgPT09IDApIHtcblx0XHRcdFx0ZWwuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZWwuc3R5bGUuZGlzcGxheSA9IFwiXCI7XG5cdFx0XHR9XG5cdFx0XHRlbC5zdHlsZS53aWR0aCA9IGAke01hdGgubWF4KDAsIE1hdGgubWluKDEwMCwgcHJvZ3Jlc3MgKiAxMDApKX0lYDtcblx0XHR9XG5cdH1cbn1cblxuLyoqXG4gKiBcdTc5ODFcdTc1MjhcdTVCODlcdTUxNjhcdTZBMjFcdTVGMEZcdUZGMENcdTVDMDZcdTRGMUFcdTU3MjhcdTRFMEJcdTRFMDBcdTZCMjFcdTkxQ0RcdThGN0RcdTc1MUZcdTY1NDhcbiAqXG4gKiBcdThCRTZcdTYwQzVcdThCRjdcdTUzQzJcdTk2MDUgYGVuYWJsZVNhZmVNb2RlYFxuICpcbiAqIEBzZWUge0BsaW5rIGVuYWJsZVNhZmVNb2RlfVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGlzYWJsZVNhZmVNb2RlKCkge1xuXHRhd2FpdCBCZXR0ZXJOQ00uYXBwLndyaXRlQ29uZmlnKENQUF9TSURFX0lOSkVDVF9ESVNBQkxFX0tFWSwgXCJmYWxzZVwiKTtcblx0YXdhaXQgQmV0dGVyTkNNLmFwcC53cml0ZUNvbmZpZyhTQUZFX01PREVfS0VZLCBcImZhbHNlXCIpO1xuXHRhd2FpdCBCZXR0ZXJOQ00uYXBwLndyaXRlQ29uZmlnKExPQURfRVJST1JfS0VZLCBcIlwiKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdlblJhbmRvbVN0cmluZyhsZW5ndGg6IG51bWJlcikge1xuXHRjb25zdCB3b3JkcyA9IFwiMDEyMzQ1Njc4OUFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFRaYWJjZGVmZ2hpa2xtbm9wcXJzdHV2d3h5elwiO1xuXHRjb25zdCByZXN1bHQ6IHN0cmluZ1tdID0gW107XG5cdGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcblx0XHRyZXN1bHQucHVzaCh3b3Jkcy5jaGFyQXQoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogd29yZHMubGVuZ3RoKSkpO1xuXHR9XG5cdHJldHVybiByZXN1bHQuam9pbihcIlwiKTtcbn1cblxuLyoqXG4gKiBcdTU0MkZcdTc1MjhcdTVCODlcdTUxNjhcdTZBMjFcdTVGMEZcdUZGMENcdTVDMDZcdTRGMUFcdTU3MjhcdTRFMEJcdTRFMDBcdTZCMjFcdTkxQ0RcdThGN0RcdTc1MUZcdTY1NDhcbiAqXG4gKiBcdTU3MjhcdThCRTVcdTZBMjFcdTVGMEZcdTRFMEJcdUZGMENcdTUzRUFcdTRGMUFcdTUyQTBcdThGN0RcdTYzRDJcdTRFRjZcdTdCQTFcdTc0MDZcdTU2NjhcdTY3MkNcdThFQUJcdUZGMENcdTYyNDBcdTY3MDlcdTYzRDJcdTRFRjZcdUZGMDhcdTUzMDVcdTYyRUNcdTYzRDJcdTRFRjZcdTU1NDZcdTVFOTdcdUZGMDlcdTVDMDZcdTRGMUFcdTg4QUJcdTVGRkRcdTc1NjVcdTUyQTBcdThGN0RcbiAqXG4gKiBcdTU0MENcdTY1RjZcdTU5ODJcdTY3OUNcdTY3MDlcdTUyQTBcdThGN0RcdTk1MTlcdThCRUZcdTc2ODRcdTYwQzVcdTUxQjVcdTc2ODRcdThCRERcdUZGMDhcdTUzNzNcdThCQkVcdTdGNkVcdTRFODYgYExPQURfRVJST1JfS0VZYFx1RkYwOVx1NTIxOVx1NEYxQVx1NTcyOFx1NjNEMlx1NEVGNlx1N0JBMVx1NzQwNlx1NTY2OFx1NTE4NVx1NjYzRVx1NzkzQVxuICpcbiAqIFx1NEY5Qlx1NzUyOFx1NjIzN1x1NTQ4Q1x1NjNEMlx1NEVGNlx1NEY1Q1x1ODAwNVx1NjM5Mlx1NjdFNVx1NTJBMFx1OEY3RFx1OTUxOVx1OEJFRlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZW5hYmxlU2FmZU1vZGUoKSB7XG5cdGF3YWl0IEJldHRlck5DTS5hcHAud3JpdGVDb25maWcoQ1BQX1NJREVfSU5KRUNUX0RJU0FCTEVfS0VZLCBcInRydWVcIik7XG5cdGF3YWl0IEJldHRlck5DTS5hcHAud3JpdGVDb25maWcoU0FGRV9NT0RFX0tFWSwgXCJ0cnVlXCIpO1xufVxuXG5leHBvcnQgY2xhc3MgUGx1Z2luTG9hZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuXHRjb25zdHJ1Y3Rvcihcblx0XHRwdWJsaWMgcmVhZG9ubHkgcGx1Z2luUGF0aDogc3RyaW5nLFxuXHRcdHB1YmxpYyByZWFkb25seSByYXdFcnJvcjogRXJyb3IsXG5cdFx0bWVzc2FnZT86IHN0cmluZyxcblx0XHRvcHRpb25zPzogRXJyb3JPcHRpb25zLFxuXHQpIHtcblx0XHRzdXBlcihtZXNzYWdlLCBvcHRpb25zKTtcblx0fVxuXG5cdG92ZXJyaWRlIHRvU3RyaW5nKCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIGBcdTYzRDJcdTRFRjYgJHt0aGlzLnBsdWdpblBhdGh9IFx1NTJBMFx1OEY3RFx1NTFGQVx1OTUxOTogJHt0aGlzLnJhd0Vycm9yfWA7XG5cdH1cbn1cblxuZXhwb3J0IGNsYXNzIERlcGVuZGVuY3lSZXNvbHZlRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG5cdGNvbnN0cnVjdG9yKG1lc3NhZ2U/OiBzdHJpbmcsIG9wdGlvbnM/OiBFcnJvck9wdGlvbnMpIHtcblx0XHRzdXBlcihtZXNzYWdlLCBvcHRpb25zKTtcblx0fVxuXG5cdG92ZXJyaWRlIHRvU3RyaW5nKCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIGBcdTYzRDJcdTRFRjZcdTRGOURcdThENTZcdTg5RTNcdTY3OTBcdTUxRkFcdTk1MTk6ICR7dGhpc31gO1xuXHR9XG59XG5cbmV4cG9ydCBjb25zdCBpc1NhZmVNb2RlID0gKCkgPT5cblx0QmV0dGVyTkNNLmFwcC5yZWFkQ29uZmlnKFNBRkVfTU9ERV9LRVksIFwiZmFsc2VcIikudGhlbigodikgPT4gdiA9PT0gXCJ0cnVlXCIpO1xuXG5leHBvcnQgY29uc3QgZ2V0TG9hZEVycm9yID0gKCkgPT5cblx0QmV0dGVyTkNNLmFwcC5yZWFkQ29uZmlnKExPQURfRVJST1JfS0VZLCBcIlwiKS50aGVuKCh2KSA9PiB2IHx8IFwiXCIpO1xuXG5mdW5jdGlvbiBzb3J0UGx1Z2lucyhwbHVnaW5zOiBOQ01QbHVnaW5bXSkge1xuXHRjbGFzcyBHcmFwaCB7XG5cdFx0YWRqYWNlbmN5TGlzdCA9IHt9O1xuXHRcdGNvbnN0cnVjdG9yKCkge31cblx0XHRhZGRWZXJ0ZXgodmVydGV4OiBzdHJpbmcpIHtcblx0XHRcdGlmICghdGhpcy5hZGphY2VuY3lMaXN0W3ZlcnRleF0pIHtcblx0XHRcdFx0dGhpcy5hZGphY2VuY3lMaXN0W3ZlcnRleF0gPSBbXTtcblx0XHRcdH1cblx0XHR9XG5cdFx0YWRkRWRnZSh2MTogc3RyaW5nLCB2Mjogc3RyaW5nKSB7XG5cdFx0XHR0aGlzLmFkamFjZW5jeUxpc3RbdjFdLnB1c2godjIpO1xuXHRcdH1cblx0fVxuXG5cdGNvbnN0IGdyYXBoID0gbmV3IEdyYXBoKCk7XG5cdGZvciAoY29uc3QgcGx1Z2luIG9mIHBsdWdpbnMpIGdyYXBoLmFkZFZlcnRleChwbHVnaW4ubWFuaWZlc3Quc2x1Zyk7XG5cdGZvciAoY29uc3QgcGx1Z2luIG9mIHBsdWdpbnMpIHtcblx0XHRpZiAocGx1Z2luLm1hbmlmZXN0LmxvYWRCZWZvcmUpXG5cdFx0XHRwbHVnaW4ubWFuaWZlc3QubG9hZEJlZm9yZS5mb3JFYWNoKChkZXApID0+XG5cdFx0XHRcdGdyYXBoLmFkZEVkZ2UoZGVwLCBwbHVnaW4ubWFuaWZlc3Quc2x1ZyksXG5cdFx0XHQpO1xuXHRcdGlmIChwbHVnaW4ubWFuaWZlc3QubG9hZEFmdGVyKVxuXHRcdFx0cGx1Z2luLm1hbmlmZXN0LmxvYWRBZnRlci5mb3JFYWNoKChkZXApID0+XG5cdFx0XHRcdGdyYXBoLmFkZEVkZ2UocGx1Z2luLm1hbmlmZXN0LnNsdWcsIGRlcCksXG5cdFx0XHQpO1xuXHR9XG5cblx0ZnVuY3Rpb24gZGZzVG9wU29ydEhlbHBlcihcblx0XHR2OiBzdHJpbmcsXG5cdFx0bjogbnVtYmVyLFxuXHRcdHZpc2l0ZWQ6IHsgW3g6IHN0cmluZ106IGJvb2xlYW4gfSxcblx0XHR0b3BOdW1zOiB7IFt4OiBzdHJpbmddOiBudW1iZXIgfSxcblx0KSB7XG5cdFx0dmlzaXRlZFt2XSA9IHRydWU7XG5cdFx0aWYgKCEodiBpbiBncmFwaC5hZGphY2VuY3lMaXN0KSlcblx0XHRcdHRocm93IG5ldyBEZXBlbmRlbmN5UmVzb2x2ZUVycm9yKGBcdTYyN0VcdTRFMERcdTUyMzBcdTYzRDJcdTRFRjYgJHt2fWApO1xuXHRcdGNvbnN0IG5laWdoYm9ycyA9IGdyYXBoLmFkamFjZW5jeUxpc3Rbdl07XG5cdFx0Zm9yIChjb25zdCBuZWlnaGJvciBvZiBuZWlnaGJvcnMpIHtcblx0XHRcdGlmICghdmlzaXRlZFtuZWlnaGJvcl0pIHtcblx0XHRcdFx0biA9IGRmc1RvcFNvcnRIZWxwZXIobmVpZ2hib3IsIG4sIHZpc2l0ZWQsIHRvcE51bXMpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHR0b3BOdW1zW3ZdID0gbjtcblx0XHRyZXR1cm4gbiAtIDE7XG5cdH1cblxuXHRjb25zdCB2ZXJ0aWNlcyA9IE9iamVjdC5rZXlzKGdyYXBoLmFkamFjZW5jeUxpc3QpO1xuXHRjb25zdCB2aXNpdGVkID0ge307XG5cdGNvbnN0IHRvcE51bXMgPSB7fTtcblx0bGV0IG4gPSB2ZXJ0aWNlcy5sZW5ndGggLSAxO1xuXHRmb3IgKGNvbnN0IHYgb2YgdmVydGljZXMpIHtcblx0XHRpZiAoIXZpc2l0ZWRbdl0pIHtcblx0XHRcdG4gPSBkZnNUb3BTb3J0SGVscGVyKHYsIG4sIHZpc2l0ZWQsIHRvcE51bXMpO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gT2JqZWN0LmtleXModG9wTnVtcykubWFwKChzbHVnKSA9PlxuXHRcdHBsdWdpbnMuZmluZCgocGx1Z2luKSA9PiBwbHVnaW4ubWFuaWZlc3Quc2x1ZyA9PT0gc2x1ZyksXG5cdCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGxvYWRQbHVnaW5zKCkge1xuXHRpZiAoYXdhaXQgaXNTYWZlTW9kZSgpKSB7XG5cdFx0d2luZG93LmxvYWRlZFBsdWdpbnMgPSBsb2FkZWRQbHVnaW5zO1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGNvbnN0IGRlYm91bmNlZFJlbG9hZCA9IEJldHRlck5DTS51dGlscy5kZWJvdW5jZShCZXR0ZXJOQ00ucmVsb2FkLCAxMDAwKTtcblxuXHRjb25zdCBwYWdlTWFwID0ge1xuXHRcdFwiL3B1Yi9hcHAuaHRtbFwiOiBcIk1haW5cIixcblx0fTtcblx0Y29uc3QgcGFnZU5hbWUgPSBwYWdlTWFwW2xvY2F0aW9uLnBhdGhuYW1lXTtcblxuXHRhc3luYyBmdW5jdGlvbiBsb2FkUGx1Z2luKG1haW5QbHVnaW46IE5DTVBsdWdpbikge1xuXHRcdGNvbnN0IGRldk1vZGUgPSBtYWluUGx1Z2luLmRldk1vZGU7XG5cdFx0Y29uc3QgbWFuaWZlc3QgPSBtYWluUGx1Z2luLm1hbmlmZXN0O1xuXHRcdGNvbnN0IHBsdWdpblBhdGggPSBtYWluUGx1Z2luLnBsdWdpblBhdGg7XG5cblx0XHRpZiAoZGV2TW9kZSAmJiAhbWFuaWZlc3Qubm9EZXZSZWxvYWQpIHtcblx0XHRcdGJldHRlcm5jbV9uYXRpdmUuZnMud2F0Y2hEaXJlY3RvcnkocGx1Z2luUGF0aCwgKF9kaXIsIHBhdGgpID0+IHtcblx0XHRcdFx0Y29uc3QgUkVMT0FEX0VYVFMgPSBbXCIuanNcIiwgXCJtYW5pZmVzdC5qc29uXCJdO1xuXHRcdFx0XHRpZiAoUkVMT0FEX0VYVFMuZmluZEluZGV4KChleHQpID0+IHBhdGguZW5kc1dpdGgoZXh0KSkgIT09IC0xKSB7XG5cdFx0XHRcdFx0Y29uc29sZS53YXJuKFxuXHRcdFx0XHRcdFx0XCJcdTVGMDBcdTUzRDFcdTYzRDJcdTRFRjZcIixcblx0XHRcdFx0XHRcdG1hbmlmZXN0Lm5hbWUsXG5cdFx0XHRcdFx0XHRcIlx1NjU4N1x1NEVGNlwiLFxuXHRcdFx0XHRcdFx0cGF0aCxcblx0XHRcdFx0XHRcdFwiXHU1M0QxXHU3NTFGXHU2NkY0XHU2NUIwXHVGRjBDXHU1MzczXHU1QzA2XHU5MUNEXHU4RjdEXHVGRjAxXCIsXG5cdFx0XHRcdFx0KTtcblxuXHRcdFx0XHRcdGRlYm91bmNlZFJlbG9hZCgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRhc3luYyBmdW5jdGlvbiBsb2FkSW5qZWN0KGZpbGVQYXRoOiBzdHJpbmcpIHtcblx0XHRcdGlmICghbWFuaWZlc3Quc2x1ZykgcmV0dXJuO1xuXHRcdFx0Y29uc3QgY29kZSA9IGF3YWl0IEJldHRlck5DTS5mcy5yZWFkRmlsZVRleHQoZmlsZVBhdGgpO1xuXG5cdFx0XHRpZiAoZmlsZVBhdGguZW5kc1dpdGgoXCIuanNcIikpIHtcblx0XHRcdFx0Y29uc3QgcGx1Z2luID0gbmV3IE5DTUluamVjdFBsdWdpbihtYWluUGx1Z2luLCBmaWxlUGF0aCk7XG5cdFx0XHRcdGNvbnN0IHBsdWdpbkZ1bmN0aW9uID0gbmV3IEZ1bmN0aW9uKFxuXHRcdFx0XHRcdFwicGx1Z2luXCIsXG5cdFx0XHRcdFx0YHJldHVybiAoYXN5bmMgZnVuY3Rpb24gJHtmaWxlUGF0aFxuXHRcdFx0XHRcdFx0LnJlcGxhY2VBbGwoL1svXFxcXFxcLl0vZywgXCJfXCIpXG5cdFx0XHRcdFx0XHQucmVwbGFjZUFsbChcIi1cIiwgXCJfXCIpXG5cdFx0XHRcdFx0XHQucmVwbGFjZUFsbCgvW15hLXpBLVowLTlfJF0vZywgXCJcIil9KCl7JHtjb2RlfX0pKCk7YCxcblx0XHRcdFx0KTtcblx0XHRcdFx0Ly8gZ2VuUmFuZG9tU3RyaW5nXG5cdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwbHVnaW5GdW5jdGlvbiwgXCJuYW1lXCIsIHtcblx0XHRcdFx0XHR2YWx1ZTogZmlsZVBhdGgsXG5cdFx0XHRcdFx0Y29uZmlndXJhYmxlOiB0cnVlLFxuXHRcdFx0XHR9KTtcblx0XHRcdFx0Y29uc3QgbG9hZGluZ1Byb21pc2UgPSBwbHVnaW5GdW5jdGlvbi5jYWxsKFxuXHRcdFx0XHRcdGxvYWRlZFBsdWdpbnNbbWFuaWZlc3Quc2x1Z10sXG5cdFx0XHRcdFx0cGx1Z2luLFxuXHRcdFx0XHQpO1xuXHRcdFx0XHRhd2FpdCBsb2FkaW5nUHJvbWlzZTtcblx0XHRcdFx0cGx1Z2luLmRpc3BhdGNoRXZlbnQoXG5cdFx0XHRcdFx0bmV3IEN1c3RvbUV2ZW50KFwibG9hZFwiLCB7XG5cdFx0XHRcdFx0XHRkZXRhaWw6IHBsdWdpbixcblx0XHRcdFx0XHR9KSxcblx0XHRcdFx0KTtcblx0XHRcdFx0aWYgKHBsdWdpbi5sb2FkRXJyb3IpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgUGx1Z2luTG9hZEVycm9yKFxuXHRcdFx0XHRcdFx0ZmlsZVBhdGgsXG5cdFx0XHRcdFx0XHRwbHVnaW4ubG9hZEVycm9yLFxuXHRcdFx0XHRcdFx0YFx1NjNEMlx1NEVGNlx1ODExQVx1NjcyQyAke2ZpbGVQYXRofSBcdTUyQTBcdThGN0RcdTUxRkFcdTk1MTk6ICR7XG5cdFx0XHRcdFx0XHRcdHBsdWdpbi5sb2FkRXJyb3Iuc3RhY2sgfHwgcGx1Z2luLmxvYWRFcnJvclxuXHRcdFx0XHRcdFx0fWAsXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGNhdXNlOiBwbHVnaW4ubG9hZEVycm9yLFxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHBsdWdpbi5maW5pc2hlZCA9IHRydWU7XG5cdFx0XHRcdGxvYWRlZFBsdWdpbnNbbWFuaWZlc3Quc2x1Z10uaW5qZWN0cy5wdXNoKHBsdWdpbik7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gTG9hZCBJbmplY3RzXG5cdFx0aWYgKG1hbmlmZXN0LmluamVjdHNbcGFnZU5hbWVdKSB7XG5cdFx0XHRmb3IgKGNvbnN0IGluamVjdCBvZiBtYW5pZmVzdC5pbmplY3RzW3BhZ2VOYW1lXSkge1xuXHRcdFx0XHRhd2FpdCBsb2FkSW5qZWN0KGAke3BsdWdpblBhdGh9LyR7aW5qZWN0LmZpbGV9YCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKG1hbmlmZXN0LmluamVjdHNbbG9jYXRpb24ucGF0aG5hbWVdKSB7XG5cdFx0XHRmb3IgKGNvbnN0IGluamVjdCBvZiBtYW5pZmVzdC5pbmplY3RzW2xvY2F0aW9uLnBhdGhuYW1lXSkge1xuXHRcdFx0XHRhd2FpdCBsb2FkSW5qZWN0KGAke3BsdWdpblBhdGh9LyR7aW5qZWN0LmZpbGV9YCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdG1haW5QbHVnaW4uZmluaXNoZWQgPSB0cnVlO1xuXHR9XG5cblx0d2luZG93LmxvYWRlZFBsdWdpbnMgPSBsb2FkZWRQbHVnaW5zO1xuXG5cdHNwbGFzaFNjcmVlbi5zZXRTcGxhc2hTY3JlZW5UZXh0KFwiXHU2QjYzXHU1NzI4XHU2OEMwXHU3RDIyXHU2M0QyXHU0RUY2XCIpO1xuXHRzcGxhc2hTY3JlZW4uc2V0U3BsYXNoU2NyZWVuUHJvZ3Jlc3MoMCk7XG5cblx0Y29uc3QgcGx1Z2luUGF0aHMgPSBhd2FpdCBCZXR0ZXJOQ00uZnMucmVhZERpcihcIi4vcGx1Z2luc19ydW50aW1lXCIpO1xuXG5cdGxldCBwbHVnaW5zOiBOQ01QbHVnaW5bXSA9IFtdO1xuXG5cdGNvbnN0IGxvYWRQbHVnaW5CeVBhdGggPSBhc3luYyAocGF0aDogc3RyaW5nLCBkZXZNb2RlOiBib29sZWFuKSA9PiB7XG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IG1hbmlmZXN0ID0gSlNPTi5wYXJzZShcblx0XHRcdFx0YXdhaXQgQmV0dGVyTkNNLmZzLnJlYWRGaWxlVGV4dChgJHtwYXRofS9tYW5pZmVzdC5qc29uYCksXG5cdFx0XHQpO1xuXG5cdFx0XHRtYW5pZmVzdC5zbHVnID1cblx0XHRcdFx0bWFuaWZlc3Quc2x1ZyA/P1xuXHRcdFx0XHRtYW5pZmVzdC5uYW1lLnJlcGxhY2UoL1teYS16QS1aMC05IF0vZywgXCJcIikucmVwbGFjZSgvIC9nLCBcIi1cIik7XG5cblx0XHRcdGNvbnN0IG1haW5QbHVnaW4gPSBuZXcgTkNNUGx1Z2luKG1hbmlmZXN0LCBwYXRoLCBkZXZNb2RlKTtcblx0XHRcdHBsdWdpbnMucHVzaChtYWluUGx1Z2luKTtcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRpZiAoZSBpbnN0YW5jZW9mIFN5bnRheEVycm9yKSBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGxvYWQgcGx1Z2luOlwiLCBlKTtcblx0XHRcdGVsc2UgdGhyb3cgZTtcblx0XHR9XG5cdH07XG5cblx0c3BsYXNoU2NyZWVuLnNldFNwbGFzaFNjcmVlblRleHQoXCJcdTZCNjNcdTU3MjhcdTc4NkVcdThCQTRcdTYzRDJcdTRFRjZcdTUyQTBcdThGN0RcdTk4N0FcdTVFOEZcIik7XG5cdHNwbGFzaFNjcmVlbi5zZXRTcGxhc2hTY3JlZW5Qcm9ncmVzcygwKTtcblx0cGx1Z2lucyA9IHNvcnRQbHVnaW5zKHBsdWdpbnMpIGFzIE5DTVBsdWdpbltdO1xuXG5cdGNvbnN0IGxvYWRUaHJlYWRzOiBQcm9taXNlPHZvaWQ+W10gPSBbXTtcblx0Zm9yIChjb25zdCBwYXRoIG9mIHBsdWdpblBhdGhzKVxuXHRcdGxvYWRUaHJlYWRzLnB1c2gobG9hZFBsdWdpbkJ5UGF0aChwYXRoLCBmYWxzZSkpO1xuXG5cdHNwbGFzaFNjcmVlbi5zZXRTcGxhc2hTY3JlZW5UZXh0KFwiXHU2QjYzXHU1NzI4XHU2OEMwXHU3RDIyXHU1RjAwXHU1M0QxXHU2M0QyXHU0RUY2XCIpO1xuXHRzcGxhc2hTY3JlZW4uc2V0U3BsYXNoU2NyZWVuUHJvZ3Jlc3MoMCk7XG5cdGlmIChiZXR0ZXJuY21fbmF0aXZlLmZzLmV4aXN0cyhcIi4vcGx1Z2luc19kZXZcIikpIHtcblx0XHRjb25zdCBkZXZQbHVnaW5QYXRocyA9IGF3YWl0IEJldHRlck5DTS5mcy5yZWFkRGlyKFwiLi9wbHVnaW5zX2RldlwiKTtcblx0XHRmb3IgKGNvbnN0IHBhdGggb2YgZGV2UGx1Z2luUGF0aHMpIHtcblx0XHRcdHNwbGFzaFNjcmVlbi5zZXRTcGxhc2hTY3JlZW5UZXh0KGBcdTZCNjNcdTU3MjhcdTUyQTBcdThGN0RcdTVGMDBcdTUzRDFcdTYzRDJcdTRFRjYgJHtwYXRofWApO1xuXHRcdFx0YXdhaXQgbG9hZFBsdWdpbkJ5UGF0aChwYXRoLCB0cnVlKTtcblx0XHR9XG5cdH1cblxuXHRhd2FpdCBQcm9taXNlLmFsbChsb2FkVGhyZWFkcyk7XG5cblx0bGV0IGkgPSAwO1xuXHRmb3IgKGNvbnN0IHBsdWdpbiBvZiBwbHVnaW5zKSB7XG5cdFx0aWYgKCEocGx1Z2luLm1hbmlmZXN0LnNsdWcgaW4gbG9hZGVkUGx1Z2lucykpIHtcblx0XHRcdGxvYWRlZFBsdWdpbnNbcGx1Z2luLm1hbmlmZXN0LnNsdWddID0gcGx1Z2luO1xuXHRcdFx0Y29uc29sZS5sb2coXCJcdTZCNjNcdTU3MjhcdTUyQTBcdThGN0RcdTYzRDJcdTRFRjZcIiwgcGx1Z2luLm1hbmlmZXN0LnNsdWcpO1xuXHRcdFx0c3BsYXNoU2NyZWVuLnNldFNwbGFzaFNjcmVlblRleHQoXG5cdFx0XHRcdGBcdTZCNjNcdTU3MjhcdTUyQTBcdThGN0RcdTYzRDJcdTRFRjYgJHtwbHVnaW4ubWFuaWZlc3QubmFtZX0gKCR7aSsrfS8ke3BsdWdpbnMubGVuZ3RofSlgLFxuXHRcdFx0KTtcblx0XHRcdHNwbGFzaFNjcmVlbi5zZXRTcGxhc2hTY3JlZW5Qcm9ncmVzcyhpIC8gcGx1Z2lucy5sZW5ndGgpO1xuXHRcdFx0Y29uc3Qgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcblx0XHRcdGF3YWl0IGxvYWRQbHVnaW4ocGx1Z2luKTtcblx0XHRcdGNvbnN0IGVuZFRpbWUgPSBEYXRlLm5vdygpIC0gc3RhcnRUaW1lO1xuXHRcdFx0Y29uc29sZS5sb2coXCJcdTYzRDJcdTRFRjZcdTUyQTBcdThGN0RcdTVCOENcdTYyMTBcIiwgcGx1Z2luLm1hbmlmZXN0LnNsdWcsIFwiXHU3NTI4XHU2NUY2XCIsIGAke2VuZFRpbWV9bXNgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS53YXJuKFxuXHRcdFx0XHRcIlx1NjNEMlx1NEVGNlwiLFxuXHRcdFx0XHRwbHVnaW4ubWFuaWZlc3Quc2x1Zyxcblx0XHRcdFx0XCJcdTUxRkFcdTczQjBcdTkxQ0RcdTU5MERcdUZGMENcdTRGNERcdTRFOEVcIixcblx0XHRcdFx0cGx1Z2luLnBsdWdpblBhdGgsXG5cdFx0XHRcdFwiXHU3Njg0XHU2M0QyXHU0RUY2XHU1QzA2XHU0RTBEXHU0RjFBXHU4OEFCXHU1MkEwXHU4RjdEXCIsXG5cdFx0XHQpO1xuXHRcdH1cblx0fVxuXG5cdHNwbGFzaFNjcmVlbi5zZXRTcGxhc2hTY3JlZW5Qcm9ncmVzcygxKTtcblx0c3BsYXNoU2NyZWVuLnNldFNwbGFzaFNjcmVlblRleHQoXCJcdTZCNjNcdTU3MjhcdTVCOENcdTYyMTBcdTUyQTBcdThGN0RcIik7XG5cdGZvciAoY29uc3QgbmFtZSBpbiBsb2FkZWRQbHVnaW5zKSB7XG5cdFx0Y29uc3QgcGx1Z2luOiBOQ01QbHVnaW4gPSBsb2FkZWRQbHVnaW5zW25hbWVdO1xuXHRcdHBsdWdpbi5pbmplY3RzLmZvckVhY2goKGluamVjdCkgPT4ge1xuXHRcdFx0aW5qZWN0LmRpc3BhdGNoRXZlbnQoXG5cdFx0XHRcdG5ldyBDdXN0b21FdmVudChcImFsbHBsdWdpbnNsb2FkZWRcIiwgeyBkZXRhaWw6IGxvYWRlZFBsdWdpbnMgfSksXG5cdFx0XHQpO1xuXHRcdFx0aWYgKGluamVjdC5sb2FkRXJyb3IpIHtcblx0XHRcdFx0dGhyb3cgbmV3IFBsdWdpbkxvYWRFcnJvcihcblx0XHRcdFx0XHRpbmplY3QuZmlsZVBhdGgsXG5cdFx0XHRcdFx0aW5qZWN0LmxvYWRFcnJvcixcblx0XHRcdFx0XHRgXHU2M0QyXHU0RUY2XHU4MTFBXHU2NzJDICR7aW5qZWN0LmZpbGVQYXRofSBcdTUyQTBcdThGN0RcdTUxRkFcdTk1MTk6ICR7XG5cdFx0XHRcdFx0XHRpbmplY3QubG9hZEVycm9yLnN0YWNrIHx8IGluamVjdC5sb2FkRXJyb3Jcblx0XHRcdFx0XHR9YCxcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjYXVzZTogaW5qZWN0LmxvYWRFcnJvcixcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIG9uTG9hZEVycm9yKGU6IEVycm9yKSB7XG5cdGNvbnN0IEFUVEVNUFRTX0tFWSA9IFwiY2MubWljcm9ibG9jay5sb2FkZXIucmVsb2FkUGx1Z2luQXR0ZW1wdHNcIjtcblxuXHRjb25zdCBhdHRlbXB0cyA9IHBhcnNlSW50KGF3YWl0IEJldHRlck5DTS5hcHAucmVhZENvbmZpZyhBVFRFTVBUU19LRVksIFwiMFwiKSk7XG5cdGNvbnN0IHBhc3RFcnJvciA9IGF3YWl0IEJldHRlck5DTS5hcHAucmVhZENvbmZpZyhMT0FEX0VSUk9SX0tFWSwgXCJcIik7XG5cdGF3YWl0IEJldHRlck5DTS5hcHAud3JpdGVDb25maWcoXG5cdFx0TE9BRF9FUlJPUl9LRVksXG5cdFx0YCR7cGFzdEVycm9yfVx1N0IyQyAke2F0dGVtcHRzICsgMX0gXHU2QjIxXHU1MkEwXHU4RjdEXHU1M0QxXHU3NTFGXHU5NTE5XHU4QkVGXHVGRjFBXFxuJHtlLnN0YWNrIHx8IGV9XFxuXFxuYCxcblx0KTtcblx0aWYgKGF0dGVtcHRzIDwgMikge1xuXHRcdGF3YWl0IEJldHRlck5DTS5hcHAud3JpdGVDb25maWcoQVRURU1QVFNfS0VZLCBTdHJpbmcoYXR0ZW1wdHMgKyAxKSk7XG5cdH0gZWxzZSB7XG5cdFx0YXdhaXQgZW5hYmxlU2FmZU1vZGUoKTtcblx0XHRhd2FpdCBCZXR0ZXJOQ00uYXBwLndyaXRlQ29uZmlnKEFUVEVNUFRTX0tFWSwgXCIwXCIpO1xuXHR9XG5cdC8vIGJldHRlcm5jbV9uYXRpdmUuYXBwLnJlc3RhcnQoKTtcblx0bG9jYXRpb24ucmVsb2FkKCk7XG59XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBhc3luYyAoKSA9PiB7XG5cdC8vIFx1NTJBMFx1OEY3RFx1N0JBMVx1NzQwNlx1NTY2OFx1NjgzN1x1NUYwRlx1ODg2OFxuXHRjb25zdCBzdHlsZUNvbnRlbnQgPSBiZXR0ZXJuY21fbmF0aXZlLmludGVybmFsLmdldEZyYW1ld29ya0NTUygpO1xuXHRjb25zdCBzdHlsZUVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuXHRzdHlsZUVsLmlubmVySFRNTCA9IHN0eWxlQ29udGVudDtcblx0ZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZUVsKTtcblxuXHRpZiAoXG5cdFx0KGF3YWl0IEJldHRlck5DTS5hcHAucmVhZENvbmZpZyhDUFBfU0lERV9JTkpFQ1RfRElTQUJMRV9LRVksIFwiZmFsc2VcIikpID09PVxuXHRcdFwiZmFsc2VcIlxuXHQpIHtcblx0XHRsb2NhbFN0b3JhZ2Uuc2V0SXRlbShTQUZFX01PREVfS0VZLCBcImZhbHNlXCIpO1xuXHR9IGVsc2Uge1xuXHRcdGxvY2FsU3RvcmFnZS5zZXRJdGVtKFNBRkVfTU9ERV9LRVksIFwidHJ1ZVwiKTtcblx0fVxuXG5cdHRyeSB7XG5cdFx0YXdhaXQgUHJvbWlzZS5yYWNlKFtQcm9taXNlLmFsbChbbG9hZFBsdWdpbnMoKSwgaW5pdFBsdWdpbk1hbmFnZXIoKV0pXSk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRvbkxvYWRFcnJvcihlKTtcblx0XHRyZXR1cm47XG5cdH1cblx0c3BsYXNoU2NyZWVuLnNldFNwbGFzaFNjcmVlblRleHQoXCJcdTUyQTBcdThGN0RcdTVCOENcdTYyMTBcdUZGMDFcIik7XG5cdHNwbGFzaFNjcmVlbi5oaWRlU3BsYXNoU2NyZWVuKCk7XG5cdG9uUGx1Z2luTG9hZGVkKGxvYWRlZFBsdWdpbnMpOyAvLyBcdTY2RjRcdTY1QjBcdTYzRDJcdTRFRjZcdTdCQTFcdTc0MDZcdTU2NjhcdTkwQTNcdThGQjlcdTc2ODRcdTYzRDJcdTRFRjZcdTUyMTdcdTg4Njhcbn0pO1xuIiwgIi8qKlxuICogQGZpbGVvdmVydmlld1xuICogQmV0dGVyTkNNIFx1NjNEMlx1NEVGNlx1NUYwMFx1NTNEMVx1NjNBNVx1NTNFM1xuICpcbiAqIFx1NjNEMlx1NEVGNlx1NEY1Q1x1ODAwNVx1NTNFRlx1NEVFNVx1OTAxQVx1OEZDN1x1NkI2NFx1NTkwNFx1NzY4NFx1NjNBNVx1NTNFM1x1Njc2NVx1NTQ4Q1x1NzU0Q1x1OTc2Mlx1NjIxNlx1N0EwQlx1NUU4Rlx1NTkxNlx1OTBFOFx1NEVBNFx1NEU5MlxuICovXG5cbmltcG9ydCBcIi4vcmVhY3RcIjtcbmltcG9ydCB7IGZzIH0gZnJvbSBcIi4vZnNcIjtcbmltcG9ydCB7IGFwcCB9IGZyb20gXCIuL2FwcFwiO1xuaW1wb3J0IHsgbmNtIH0gZnJvbSBcIi4vbmNtXCI7XG5pbXBvcnQgeyB0ZXN0cyB9IGZyb20gXCIuL3Rlc3RzXCI7XG5pbXBvcnQgeyB1dGlscyB9IGZyb20gXCIuL3V0aWxzXCI7XG5pbXBvcnQgeyBiZXR0ZXJuY21GZXRjaCB9IGZyb20gXCIuL2Jhc2VcIjtcbmltcG9ydCB7IHNwbGFzaFNjcmVlbiB9IGZyb20gXCIuLi9sb2FkZXJcIjtcblxuLyoqXG4gKiBcdTUzMDVcdTU0MkJcdTUyQTBcdThGN0RcdTUyQThcdTc1M0JcdTc2ODRcdTkxQ0RcdThGN0RcbiAqL1xuZnVuY3Rpb24gcmVsb2FkKCk6IHZvaWQge1xuXHRzcGxhc2hTY3JlZW4uc2V0U3BsYXNoU2NyZWVuUHJvZ3Jlc3MoMCk7XG5cdHNwbGFzaFNjcmVlbi5zZXRTcGxhc2hTY3JlZW5UZXh0KFwiXHU2QjYzXHU1NzI4XHU5MUNEXHU4RjdEXCIpO1xuXHRzcGxhc2hTY3JlZW4uc2hvd1NwbGFzaFNjcmVlbigpLnRoZW4oKCkgPT4ge1xuXHRcdGJldHRlcm5jbV9uYXRpdmUuYXBwLnJlc3RhcnQoKTtcblx0fSk7XG59XG5cbmNvbnN0IEJldHRlck5DTSA9IHtcblx0ZnMsXG5cdGFwcCxcblx0bmNtLFxuXHR1dGlscyxcblx0dGVzdHMsXG5cdHJlbG9hZCxcblx0YmV0dGVybmNtRmV0Y2gsXG5cdGlzTVJCTkNNOiB0cnVlLFxufTtcblxuZXhwb3J0IHsgZnMsIGFwcCwgbmNtLCB1dGlscywgdGVzdHMsIHJlbG9hZCB9O1xuXG53aW5kb3cuZG9tID0gdXRpbHMuZG9tO1xuXG5kZWNsYXJlIGxldCBiZXR0ZXJuY206IHR5cGVvZiBCZXR0ZXJOQ007XG5iZXR0ZXJuY20gPSBCZXR0ZXJOQ007XG5leHBvcnQgZGVmYXVsdCBCZXR0ZXJOQ007XG4iXSwKICAibWFwcGluZ3MiOiAiOztBQUFPLE1BQVU7QUFBVixJQUFVQSxXQUFWO0FBaUJDLGFBQVMsZUFBZSxVQUFvQixXQUFXLEtBQUs7QUFDbEUsYUFBTyxnQkFBZ0IsTUFBTSxTQUFTLGNBQWMsUUFBUSxHQUFHLFFBQVE7QUFBQSxJQUN4RTtBQUZPLElBQUFBLE9BQVM7QUFVVCxhQUFTLFNBQ2YsVUFDQSxVQUNJO0FBQ0osVUFBSSxRQUFRO0FBQ1osYUFBTyxTQUFTLGtCQUFrQjtBQUNqQyxjQUFNLE9BQU87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ZTtBQUNyQixZQUFNLHNCQUFVLElBQUksWUFBWSxjQUFjLEdBQUc7QUFBQSxJQUNsRDtBQUVBLGFBQVMsT0FBTztBQUFBLEVBQ2pCO0FBRUEsU0FBTyxpQkFBaUIsb0JBQW9CLFlBQVk7QUFFdkQsVUFBTSxlQUFlLGlCQUFpQixTQUFTLGdCQUFnQjtBQUMvRCxVQUFNLFVBQVUsU0FBUyxjQUFjLE9BQU87QUFDOUMsWUFBUSxZQUFZO0FBQ3BCLGFBQVMsS0FBSyxZQUFZLE9BQU87QUFFakMsUUFDRSxNQUFNLHNCQUFVLElBQUksV0FBVyw2QkFBNkIsT0FBTyxNQUNwRSxTQUNDO0FBQ0QsbUJBQWEsUUFBUSxlQUFlLE9BQU87QUFBQSxJQUM1QyxPQUFPO0FBQ04sbUJBQWEsUUFBUSxlQUFlLE1BQU07QUFBQSxJQUMzQztBQUVBLFFBQUk7QUFDSCxZQUFNLFFBQVEsS0FBSyxDQUFDLFFBQVEsSUFBSSxDQUFDLFlBQVksR0FBRyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUFBLElBQ3ZFLFNBQVNBLElBQVA7QUFDRCxrQkFBWUEsRUFBQztBQUNiO0FBQUEsSUFDRDtBQUNBLGlCQUFhLG9CQUFvQixnQ0FBTztBQUN4QyxpQkFBYSxpQkFBaUI7QUFDOUIsbUJBQWUsYUFBYTtBQUFBLEVBQzdCLENBQUM7OztBQzlaRCxXQUFTLFNBQWU7QUFDdkIsaUJBQWEsd0JBQXdCLENBQUM7QUFDdEMsaUJBQWEsb0JBQW9CLDBCQUFNO0FBQ3ZDLGlCQUFhLGlCQUFpQixFQUFFLEtBQUssTUFBTTtBQUMxQyx1QkFBaUIsSUFBSSxRQUFRO0FBQUEsSUFDOUIsQ0FBQztBQUFBLEVBQ0Y7QUFFQSxNQUFNLFlBQVk7QUFBQSxJQUNqQjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0EsVUFBVTtBQUFBLEVBQ1g7QUFJQSxTQUFPLE1BQU0sTUFBTTtBQUduQixjQUFZO0FBQ1osTUFBTyx3QkFBUTsiLAogICJuYW1lcyI6IFsidXRpbHMiLCAiZG9tIiwgImZzIiwgImFwcCIsICJuY20iLCAiZ2V0UGxheWluZyIsICJ0ZXN0cyIsICJsYXRlc3RWZXJzaW9uIiwgImxvYWRlZFBsdWdpbnMiLCAiZSIsICJjb25maWdUb29sQm94IiwgImUiLCAic3BsYXNoU2NyZWVuIiwgIm4iLCAidmlzaXRlZCIsICJ0b3BOdW1zIiwgImUiXQp9Cg==
