import { createElement, Fragment } from "react";
import { NCMPlugin } from "../plugin";
import BetterNCM from "../betterncm-api";

declare global {
	/** 一个由 C++ 侧设置的访问密钥，以免出现非法调用 */
	const BETTERNCM_API_KEY: string;
	const BETTERNCM_API_PATH: string;
	const BETTERNCM_FILES_PATH: string;
	const BETTERNCM_API_PORT: number;
	// rome-ignore lint/suspicious/noExplicitAny: 网易云自带IPC对象，因为量比较大所以不做类型限定了
	const channel: any;
	const h: typeof createElement;
	const f: typeof Fragment;
	const dom: typeof BetterNCM.utils.dom;
	const React: typeof import("react");
	const ReactDOM: typeof import("react-dom");
	// rome-ignore lint/suspicious/noExplicitAny: 云村自带的应用配置属性，因为量比较大所以不做类型限定了
	const APP_CONF: any;
	export namespace betterncm_native {
		export namespace fs {
			export function readDir(
				filePath: string,
				resolve: (data: string[]) => void,
				reject: (error: string) => void,
			): void;

			export function readFileText(
				filePath: string,
				resolve: (data: string) => void,
				reject: (error: string) => void,
			): void;
			export function readFile(
				filePath: string,
				resolve: (data: number[]) => void,
				reject: (error: string) => void,
			): void;
			export function watchDirectory(
				watchDirPath: string,
				callback: (dirPath: string, filename: string) => void,
			): void;
			export function exists(filePath: string): boolean;
			export function writeFile(
				filePath: string,
				data: number[], // 必须是数字 [0-0xFF] 组成的数组，不可以是 Uint8Array 等 Buffer 类对象
				resolve: () => void,
				reject: (error: string) => void,
			): void;
			export function writeFileText(
				filePath: string,
				data: string,
				resolve: () => void,
				reject: (error: string) => void,
			): void;
			export function remove(
				fileOrDirPath: string,
				resolve: () => void,
				reject: (error: string) => void,
			): void;
			export function mkdir(
				dirPath: string,
				resolve: () => void,
				reject: (error: string) => void,
			): void;
		}

		export namespace app {
			export function version(): string;
			export function reloadIgnoreCache(): void;
			export function restart(): void;
			export function getNCMPath(): string;
			export function showConsole(show: boolean): void;
			export function readConfig(
				key: string,
				defaultValue: string,
				resolve: (value: string) => void,
				reject: (error: string) => void,
			): void;
			export function writeConfig(
				key: string,
				value: string,
				resolve: () => void,
				reject: (error: string) => void,
			): void;
			export function reloadPlugins(
				resolve: () => void,
				reject: (error: string) => void,
			): void;
			export function exec(
				command: string,
				elevate: boolean,
				showWindow: boolean,
			): void;
		}

		export namespace internal {
			export function getFrameworkCSS(): string;
		}

		export namespace util {
			export function executeJavaScript(
				code: string,
				scriptUrl: string,
				startLine: number,
				// rome-ignore lint/suspicious/noExplicitAny: <explanation>
			): any;
		}
	}
	interface Window {
		React: typeof import("react");
		ReactDOM: typeof import("react-dom");
		h: typeof createElement;
		f: typeof Fragment;
		loadedPlugins: { [pluginId: string]: NCMPlugin };
		loadFailedErrors: [string, Error][];
		dom: typeof BetterNCM.utils.dom;
		// rome-ignore lint/suspicious/noExplicitAny: 云村自带的应用配置属性，因为量比较大所以不做类型限定了
		APP_CONF: any;
		BETTERNCM_API_PATH: string;
		BETTERNCM_FILES_PATH: string;
	}
}
