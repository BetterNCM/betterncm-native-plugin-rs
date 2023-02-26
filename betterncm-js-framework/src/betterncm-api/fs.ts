import { betterncmFetch } from "./base";

const e = encodeURIComponent;

/**
 * 和外界的文件系统进行交互的接口
 */
export namespace fs {
	/**
	 * 异步读取指定文件夹路径下的所有文件和文件夹
	 * @param folderPath 需要读取的文件夹路径
	 * @returns 所有文件和文件夹的相对路径或绝对路径
	 */
	export function readDir(folderPath: string): Promise<string[]> {
		return new Promise((resolve, reject) => {
			betterncm_native.fs.readDir(folderPath, resolve, reject);
		});
	}

	/**
	 * 读取文本文件，务必保证文件编码是 UTF-8
	 * @param filePath 需要读取的文件路径
	 * @returns 对应文件的文本形式
	 */
	export async function readFileText(filePath: string): Promise<string> {
		try {
			const v = await readFile(filePath);
			return await v.text();
		} catch {
			return "";
		}
	}

	/**
	 * 读取文件
	 * @param filePath 需要读取的文件路径
	 * @returns blob
	 */
	export async function readFile(filePath: string): Promise<Blob> {
		try {
			return betterncmFetch(`/api/fs/read_file?path=${e(filePath)}`).then(
				(v) => v.blob(),
			);
		} catch {
			return new Blob();
		}
	}

	/**
	 * 挂载路径
	 * @param filePath 需要挂载的文件夹路径
	 * @returns 挂载到的 http 地址
	 */
	export async function mountDir(filePath: string): Promise<string> {
		throw new TypeError("未实现");
	}

	/**
	 * 挂载路径
	 * @param filePath 需要挂载的文件路径
	 * @returns 挂载到的 http 地址
	 */
	export async function mountFile(filePath: string): Promise<string> {
		throw new TypeError("未实现");
	}

	/**
	 * 解压指定的 ZIP 压缩文件到一个指定的文件夹中
	 * @param zipPath 需要解压的 ZIP 压缩文件路径
	 * @param unzipDest 需要解压到的文件夹路径，如果不存在则会创建，如果解压时有文件存在则会被覆盖
	 * @returns 返回值，是否成功
	 */
	export async function unzip(
		zipPath: string,
		unzipDest: string = `${zipPath}_extracted/`,
	): Promise<boolean> {
		throw new TypeError("未实现");
	}

	/**
	 * 将文本写入到指定文件内
	 * @param filePath 需要写入的文件路径
	 * @param content 需要写入的文件内容
	 * @returns 是否成功
	 */
	export function writeFileText(
		filePath: string,
		content: string,
	): Promise<boolean> {
		return writeFile(filePath, content);
	}

	/**
	 * 将文本或二进制数据写入到指定文件内
	 * @param filePath 需要写入的文件路径
	 * @param content 需要写入的文件内容
	 * @returns 是否成功
	 */
	export async function writeFile(
		filePath: string,
		content: string | Blob,
	): Promise<boolean> {
		const res = await betterncmFetch(`/api/fs/write_file?path=${e(filePath)}`, {
			method: "POST",
			body: content,
		});
		return res.ok;
	}

	/**
	 * 在指定路径新建文件夹
	 * @param dirPath 文件夹的路径
	 * @returns 是否成功
	 */
	export async function mkdir(dirPath: string): Promise<void> {
		return new Promise((resolve, reject) => {
			betterncm_native.fs.mkdir(dirPath, resolve, reject);
		});
	}

	/**
	 * 检查指定路径下是否存在文件或文件夹
	 * @param path 文件或文件夹的路径
	 * @returns 是否存在
	 */
	export function exists(path: string): boolean {
		return betterncm_native.fs.exists(path);
	}

	/**
	 * 删除指定路径下的文件或文件夹
	 * @param path 指定的文件或文件夹路径
	 */
	export async function remove(path: string): Promise<void> {
		return new Promise((resolve, reject) => {
			betterncm_native.fs.remove(path, resolve, reject);
		});
	}
}
