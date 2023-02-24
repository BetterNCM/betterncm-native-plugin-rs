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
import { betterncmFetch } from "./base";
import { splashScreen } from "../loader";

/**
 * 包含加载动画的重载
 */
function reload(): void {
	splashScreen.setSplashScreenProgress(0);
	splashScreen.setSplashScreenText("正在重载");
	splashScreen.showSplashScreen().then(() => {
		betterncm_native.app.restart();
	});
}

const BetterNCM = {
	fs,
	app,
	ncm,
	utils,
	tests,
	reload,
	betterncmFetch,
	isMRBNCM: true,
};

export { fs, app, ncm, utils, tests, reload };

window.dom = utils.dom;

declare let betterncm: typeof BetterNCM;
betterncm = BetterNCM;
export default BetterNCM;
