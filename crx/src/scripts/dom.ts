import * as cheerio from 'cheerio';

class DEditor {

	
	static findURLByText(text: string, html:string): string | undefined {
	
		const $ = cheerio.load(html);
		return $(`a:contains('${text}')`).attr('href');
	}

	static findLinkById(id: string, html:string): string | undefined {
		const $ = cheerio.load(html);
		return $(`#${id}`).find('a').attr('href');
		
	}
	static findLinkByClass(className: string, html:string)  {
		const $ = cheerio.load(html);
		return $(`.${className}`).find('a').map((i, el) => {
			return $(el).attr('href');
		})
	}
	static getTitle(html: string): string {
		const $ = cheerio.load(html);
		return $('title').text();
	}
}

export default DEditor;
