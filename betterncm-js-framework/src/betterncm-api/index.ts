/**
 * @fileoverview
 * BetterNCM 插件开发接口
 *
 * 插件作者可以通过此处的接口来和界面或程序外部交互
 */

import "./react";
import { fs } from "./fs";
import { app } from "./app";
import { ncm } from "./ncm";
import { tests } from "./tests";
import { utils } from "./utils";
import { betterncmFetch } from "./base"

/**
 * 包含加载动画的重载
 */
function reload(): void {
	const loadingMask = document.getElementById("loadingMask")
	if (!loadingMask) {
		betterncm_native.app.reloadIgnoreCache();
		return;
	}
	const anim = loadingMask.animate([{ opacity: 0 }, { opacity: 1 }], {
		duration: 300,
		fill: "forwards",
		easing: "cubic-bezier(0.42, 0, 0.58, 1)",
	});
	anim.commitStyles();

	anim.addEventListener("finish", (_) => {
		betterncm_native.app.reloadIgnoreCache();
	});
}

const BetterNCM = {
	fs,
	app,
	ncm,
	utils,
	tests,
	reload,
	betterncmFetch
};

export { fs, app, ncm, utils, tests, reload };

window.dom = utils.dom;

declare let betterncm: typeof BetterNCM;
betterncm = BetterNCM;
export default BetterNCM;
