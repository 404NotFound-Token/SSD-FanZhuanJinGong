import { resources, sys } from "cc";

export class Language {
	private static languageCode = null;

	/**
	 * 语言代码映射表，根据项目支持语言调整
	 */
	private static languageCodeMap = {
		"zh-cn": "zh",
		"zh": "zh",
		"zh-tw": "zh-tw",
		"zh-hk": "zh-tw",
		"de": "de",
		"ja": "ja",
		"fr": "fr",
		"ko": "ko",
		"ru": "ru",
		"en": "en",
	}

	/**
	 * 初始化语言，确保初始化完成后再进入游戏，否则可能出现图片闪烁一下
	 * @param rootDir 资源根目录
	 * @param endCall 初始化完成回调
	 */
	public static init(rootDir=null, endCall?) {
		if (!this.languageCode) {
			this.getLanguageCode();
		}

		if (!rootDir) {
			rootDir = 'texture';
		}
		resources.loadDir(rootDir + '/' + this.languageCode, ()=>{
			endCall && endCall();
		})
	}

	/**
	 * 获取当前语言代码
	 * @returns 当前语言代码
	 */
	public static getLanguageCode() {
		if (this.languageCode) return this.languageCode;

		let code = sys.languageCode;
		// console.log('========', code)

		let codeNum = "en";
		if (Language.languageCodeMap[code]) {
			codeNum = Language.languageCodeMap[code];
		}

		this.languageCode = codeNum;
		return this.languageCode;
	}
}