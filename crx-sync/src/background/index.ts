chrome.cookies.getAll({ url: 'https://www.instagram.com' }, (cookies) => {
	console.log(cookies) // logs an array of cookies
})

chrome.runtime.onMessage.addListener(function(message, sender) {
	console.log('hello');
}   )
