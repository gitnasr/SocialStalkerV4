import * as cheerio from "cheerio";

import { ButtonTypes } from "@src/types";

class DEditor {
	static findURLByText(text: string, html: string): string | undefined {
		const $ = cheerio.load(html);
		return $(`a:contains('${text}')`).attr('href');
	}
	static findURLsByText(text: string, html: string): string[] | undefined {
		const $ = cheerio.load(html);
		const urls: string[] = [];

		$(`a:contains('${text}')`).each(function () {
			const url = $(this).attr("href");
			if (url) {
				urls.push(url);
			}
		});

		return urls;
	}

	static findLinkById(id: string, html: string): string | undefined {
		const $ = cheerio.load(html);
		return $(`#${id}`).find("a").attr("href");
	}
	static findLinkByClass(className: string, html: string) {
		const $ = cheerio.load(html);
		return $(`.${className}`)
			.find("a")
			.map((i, el) => {
				return $(el).attr("href");
			});
	}
	static getTitle(html: string): string {
		const $ = cheerio.load(html);
		return $("title").text();
	}
	static createWrapperElement(wrapperTag: string, className: string) {
		const wrapper = document.createElement(wrapperTag);
		wrapper.className = className;
		return wrapper;
	}
	static createDownloadButton(
		id: string,
		iconSrc: string,
		type: ButtonTypes,
		callback: (type: ButtonTypes) => void
	) {
		const button = document.createElement("img");
		button.id = id;
		button.className = "btn";
		button.src = chrome.runtime.getURL(iconSrc);
		button.addEventListener("click", () => {
			callback(type);
		});
		return button;
	}
	static findParentForAppending(n = 3, query = 'svg[aria-label="Pause"]') {
		const element = document.querySelector(query);
		if (!element) return null;
		return this.getNthParent(element, n);
	}

	static isInjected(wrapperTag: string) {
		return !!document.querySelector(wrapperTag);
	}
	static getNthParent(element: Element, n: number) {
		let currentParent: Element = element;
		for (let i = 0; i < n; i++) {
			if (!currentParent) {
				return null;
			}
			currentParent = currentParent.parentNode as Element;
		}
		return currentParent;
	}

	static detachButton(wrapperTag: string) {
		const button = document.querySelector(wrapperTag);
		if (button) {
			button.remove();
		}
	}
}

export default DEditor;
