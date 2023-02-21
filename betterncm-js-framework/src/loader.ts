import BetterNCM from "./betterncm-api";
import { initPluginManager, onPluginLoaded } from "./plugin-manager";
import { betterncmFetch } from "./betterncm-api/base";
import { NCMPlugin, NCMInjectPlugin } from "./plugin";

export let loadedPlugins: typeof window.loadedPlugins = {};

const SAFE_MODE_KEY = "betterncm.safemode";
const LOAD_ERROR_KEY = "betterncm.loaderror";
const CPP_SIDE_INJECT_DISABLE_KEY =
	"cc.microblock.betterncm.cpp_side_inject_feature_disabled";

export namespace splashScreen {
	export function hideSplashScreen() {
		const el = document.getElementById("bncm-splash-screen");
		if (el) {
			const anim = el.animate(
				[{ opacity: 1 }, { opacity: 0, display: "none" }],
				{
					duration: 300,
					fill: "forwards",
					easing: "cubic-bezier(0.42,0,0.58,1)",
				},
			);
			anim.commitStyles();
		}
	}
	export function showSplashScreen(): Promise<void> {
		return new Promise((resolve) => {
			const el = document.getElementById("bncm-splash-screen");
			if (!el) {
				return resolve();
			}

			const anim = el.animate([{ opacity: 0 }, { opacity: 1 }], {
				duration: 300,
				fill: "forwards",
				easing: "cubic-bezier(0.42, 0, 0.58, 1)",
			});

			anim.addEventListener(
				"finish",
				(_) => {
					resolve();
				},
				{
					once: true,
				},
			);

			anim.commitStyles();
		});
	}
	export function setSplashScreenText(text: string) {
		const el = document.getElementById("bncm-splash-screen-text");
		if (el) {
			el.innerText = text;
		}
	}
	export function setSplashScreenProgress(progress: number) {
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
}

/**
 * 禁用安全模式，将会在下一次重载生效
 *
 * 详情请参阅 `enableSafeMode`
 *
 * @see {@link enableSafeMode}
 */
export async function disableSafeMode() {
	await BetterNCM.app.writeConfig(CPP_SIDE_INJECT_DISABLE_KEY, "false");
	await BetterNCM.app.writeConfig(SAFE_MODE_KEY, "false");
	await BetterNCM.app.writeConfig(LOAD_ERROR_KEY, "");
}

export function genRandomString(length: number) {
	const words = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
	const result: string[] = [];
	for (let i = 0; i < length; i++) {
		result.push(words.charAt(Math.floor(Math.random() * words.length)));
	}
	return result.join("");
}

/**
 * 启用安全模式，将会在下一次重载生效
 *
 * 在该模式下，只会加载插件管理器本身，所有插件（包括插件商店）将会被忽略加载
 *
 * 同时如果有加载错误的情况的话（即设置了 `LOAD_ERROR_KEY`）则会在插件管理器内显示
 *
 * 供用户和插件作者排查加载错误
 */
export async function enableSafeMode() {
	await BetterNCM.app.writeConfig(CPP_SIDE_INJECT_DISABLE_KEY, "true");
	await BetterNCM.app.writeConfig(SAFE_MODE_KEY, "true");
}

export class PluginLoadError extends Error {
	constructor(
		public readonly pluginPath: string,
		public readonly rawError: Error,
		message?: string,
		options?: ErrorOptions,
	) {
		super(message, options);
	}

	override toString(): string {
		return `插件 ${this.pluginPath} 加载出错: ${this.rawError}`;
	}
}

export class DependencyResolveError extends Error {
	constructor(message?: string, options?: ErrorOptions) {
		super(message, options);
	}

	override toString(): string {
		return `插件依赖解析出错: ${this}`;
	}
}

export const isSafeMode = () =>
	BetterNCM.app.readConfig(SAFE_MODE_KEY, "false").then((v) => v === "true");

export const getLoadError = () =>
	BetterNCM.app.readConfig(LOAD_ERROR_KEY, "").then((v) => v || "");

function sortPlugins(plugins: NCMPlugin[]) {
	class Graph {
		adjacencyList = {};
		constructor() {}
		addVertex(vertex: string) {
			if (!this.adjacencyList[vertex]) {
				this.adjacencyList[vertex] = [];
			}
		}
		addEdge(v1: string, v2: string) {
			this.adjacencyList[v1].push(v2);
		}
	}

	const graph = new Graph();
	for (const plugin of plugins) graph.addVertex(plugin.manifest.slug);
	for (const plugin of plugins) {
		if (plugin.manifest.loadBefore)
			plugin.manifest.loadBefore.forEach((dep) =>
				graph.addEdge(dep, plugin.manifest.slug),
			);
		if (plugin.manifest.loadAfter)
			plugin.manifest.loadAfter.forEach((dep) =>
				graph.addEdge(plugin.manifest.slug, dep),
			);
	}

	function dfsTopSortHelper(
		v: string,
		n: number,
		visited: { [x: string]: boolean },
		topNums: { [x: string]: number },
	) {
		visited[v] = true;
		if (!(v in graph.adjacencyList))
			throw new DependencyResolveError(`找不到插件 ${v}`);
		const neighbors = graph.adjacencyList[v];
		for (const neighbor of neighbors) {
			if (!visited[neighbor]) {
				n = dfsTopSortHelper(neighbor, n, visited, topNums);
			}
		}
		topNums[v] = n;
		return n - 1;
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
	return Object.keys(topNums).map((slug) =>
		plugins.find((plugin) => plugin.manifest.slug === slug),
	);
}

async function loadPlugins() {
	if (await isSafeMode()) {
		window.loadedPlugins = loadedPlugins;
		return;
	}

	const debouncedReload = BetterNCM.utils.debounce(BetterNCM.reload, 1000);

	const pageMap = {
		"/pub/app.html": "Main",
	};
	const pageName = pageMap[location.pathname];

	async function loadPlugin(mainPlugin: NCMPlugin) {
		const devMode = mainPlugin.devMode;
		const manifest = mainPlugin.manifest;
		const pluginPath = mainPlugin.pluginPath;

		if (devMode && !manifest.noDevReload) {
			betterncm_native.fs.watchDirectory(pluginPath, (_dir, path) => {
				const RELOAD_EXTS = [".js", "manifest.json"];
				if (RELOAD_EXTS.findIndex((ext) => path.endsWith(ext)) !== -1) {
					console.warn(
						"开发插件",
						manifest.name,
						"文件",
						path,
						"发生更新，即将重载！",
					);

					debouncedReload();
				}
			});
		}

		async function loadInject(filePath: string) {
			if (!manifest.slug) return;
			const code = await BetterNCM.fs.readFileText(filePath);

			if (filePath.endsWith(".js")) {
				const plugin = new NCMInjectPlugin(mainPlugin, filePath);
				const pluginFunction = new Function(
					"plugin",
					`return (async function ${filePath
						.replaceAll(/[/\\\.]/g, "_")
						.replaceAll("-", "_")
						.replaceAll(/[^a-zA-Z0-9_$]/g, "")}(){${code}})();`,
				);
				// genRandomString
				Object.defineProperty(pluginFunction, "name", {
					value: filePath,
					configurable: true,
				});
				const loadingPromise = pluginFunction.call(
					loadedPlugins[manifest.slug],
					plugin,
				);
				await loadingPromise;
				plugin.dispatchEvent(
					new CustomEvent("load", {
						detail: plugin,
					}),
				);
				if (plugin.loadError) {
					throw new PluginLoadError(
						filePath,
						plugin.loadError,
						`插件脚本 ${filePath} 加载出错: ${
							plugin.loadError.stack || plugin.loadError
						}`,
						{
							cause: plugin.loadError,
						},
					);
				}
				plugin.finished = true;
				loadedPlugins[manifest.slug].injects.push(plugin);
			}
		}

		// Load Injects
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

	splashScreen.setSplashScreenText("正在检索插件");
	splashScreen.setSplashScreenProgress(0);

	const pluginPaths = await BetterNCM.fs.readDir("./plugins_runtime");

	let plugins: NCMPlugin[] = [];

	const loadPluginByPath = async (path: string, devMode: boolean) => {
		try {
			const manifest = JSON.parse(
				await BetterNCM.fs.readFileText(`${path}/manifest.json`),
			);

			manifest.slug =
				manifest.slug ??
				manifest.name.replace(/[^a-zA-Z0-9 ]/g, "").replace(/ /g, "-");

			const mainPlugin = new NCMPlugin(manifest, path, devMode);
			plugins.push(mainPlugin);
		} catch (e) {
			if (e instanceof SyntaxError) console.error("Failed to load plugin:", e);
			else throw e;
		}
	};

	splashScreen.setSplashScreenText("正在确认插件加载顺序");
	splashScreen.setSplashScreenProgress(0);
	plugins = sortPlugins(plugins) as NCMPlugin[];

	const loadThreads: Promise<void>[] = [];
	for (const path of pluginPaths)
		loadThreads.push(loadPluginByPath(path, false));

	splashScreen.setSplashScreenText("正在检索开发插件");
	splashScreen.setSplashScreenProgress(0);
	if (betterncm_native.fs.exists("./plugins_dev")) {
		const devPluginPaths = await BetterNCM.fs.readDir("./plugins_dev");
		for (const path of devPluginPaths) {
			splashScreen.setSplashScreenText(`正在加载开发插件 ${path}`);
			await loadPluginByPath(path, true);
		}
	}

	await Promise.all(loadThreads);

	let i = 0;
	for (const plugin of plugins) {
		if (!(plugin.manifest.slug in loadedPlugins)) {
			loadedPlugins[plugin.manifest.slug] = plugin;
			console.log("正在加载插件", plugin.manifest.slug);
			splashScreen.setSplashScreenText(
				`正在加载插件 ${plugin.manifest.name} (${i++}/${plugins.length})`,
			);
			splashScreen.setSplashScreenProgress(i / plugins.length);
			const startTime = Date.now();
			await loadPlugin(plugin);
			const endTime = Date.now() - startTime;
			console.log("插件加载完成", plugin.manifest.slug, "用时", `${endTime}ms`);
		} else {
			console.warn(
				"插件",
				plugin.manifest.slug,
				"出现重复，位于",
				plugin.pluginPath,
				"的插件将不会被加载",
			);
		}
	}

	splashScreen.setSplashScreenProgress(1);
	splashScreen.setSplashScreenText("正在完成加载");
	for (const name in loadedPlugins) {
		const plugin: NCMPlugin = loadedPlugins[name];
		plugin.injects.forEach((inject) => {
			inject.dispatchEvent(
				new CustomEvent("allpluginsloaded", { detail: loadedPlugins }),
			);
			if (inject.loadError) {
				throw new PluginLoadError(
					inject.filePath,
					inject.loadError,
					`插件脚本 ${inject.filePath} 加载出错: ${
						inject.loadError.stack || inject.loadError
					}`,
					{
						cause: inject.loadError,
					},
				);
			}
		});
	}
}

async function onLoadError(e: Error) {
	const ATTEMPTS_KEY = "cc.microblock.loader.reloadPluginAttempts";

	const attempts = parseInt(await BetterNCM.app.readConfig(ATTEMPTS_KEY, "0"));
	const pastError = await BetterNCM.app.readConfig(LOAD_ERROR_KEY, "");
	await BetterNCM.app.writeConfig(
		LOAD_ERROR_KEY,
		`${pastError}第 ${attempts + 1} 次加载发生错误：\n${e.stack || e}\n\n`,
	);
	if (attempts < 2) {
		await BetterNCM.app.writeConfig(ATTEMPTS_KEY, String(attempts + 1));
	} else {
		await enableSafeMode();
		await BetterNCM.app.writeConfig(ATTEMPTS_KEY, "0");
	}
	// betterncm_native.app.restart();
	location.reload();
}

window.addEventListener("DOMContentLoaded", async () => {
	// 加载管理器样式表
	const styleContent = betterncm_native.internal.getFrameworkCSS();
	const styleEl = document.createElement("style");
	styleEl.innerHTML = styleContent;
	document.head.appendChild(styleEl);

	if (
		(await BetterNCM.app.readConfig(CPP_SIDE_INJECT_DISABLE_KEY, "false")) ===
		"false"
	) {
		localStorage.setItem(SAFE_MODE_KEY, "false");
	} else {
		localStorage.setItem(SAFE_MODE_KEY, "true");
	}

	try {
		await Promise.race([Promise.all([loadPlugins(), initPluginManager()])]);
	} catch (e) {
		onLoadError(e);
		return;
	}
	splashScreen.setSplashScreenText("加载完成！");
	splashScreen.hideSplashScreen();
	onPluginLoaded(loadedPlugins); // 更新插件管理器那边的插件列表
});
