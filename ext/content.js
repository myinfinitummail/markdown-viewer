﻿function addStylesheet(href, media) {
	var style = document.createElement('link');
	style.rel = 'stylesheet';
	style.type = 'text/css';
	style.href = href;
	if (media) { style.setAttribute('media', media); }
	document.head.appendChild(style);
}

function processMarkdown(textContent) {
	// Parse the content Markdown => HTML

	var hljs = require('highlight.js');

	var md = require('markdown-it')({
				html: true,
				linkify: true,
				// Shameless copypasta https://github.com/markdown-it/markdown-it#syntax-highlighting
				highlight: function (str, lang) {
					if (lang && hljs.getLanguage(lang)) {
						try {
							return hljs.highlight(lang, str).value;
						} catch (__) {}
					}

					try {
						return hljs.highlightAuto(str).value;
					} catch (__) {}
					return ''; // use external default escaping
				}
			})
			//markdown-it plugins:
			.use(require('markdown-it-checkbox')); //to format [ ] and [x]

	var html = md.render(textContent);

	// Style the page and code highlights.
	addStylesheet(browser.extension.getURL('lib/sss/sss.css'));
	addStylesheet(browser.extension.getURL('lib/sss/sss.print.css'), 'print');
	addStylesheet(browser.extension.getURL('lib/highlightjs/styles/default.css'));
	// User-defined stylesheet.
	addStylesheet('_markdown.css');

	// This is considered a good practice for mobiles.
	var viewport = document.createElement('meta');
	viewport.name = 'viewport';
	viewport.content = 'width=device-width, initial-scale=1';
	document.head.appendChild(viewport);

	// Insert html for the markdown into an element for processing.
	var markdownRoot = document.createElement('div');
	markdownRoot.className = "markdownRoot";
	markdownRoot.innerHTML = html;

	// Trample out script elements.
	markdownRoot.querySelectorAll('script').forEach(each => {
		each.innerText = '';
		each.src = '';
	});
	// Remove hrefs that don't look like URLs.
	const likeUrl = /^[-a-z]*:\/\//i;
	markdownRoot.querySelectorAll('[href]').forEach(each => {
		if (!likeUrl.test(each.href)) {
			each.href = '';
		}
	});
	// Remove event handlers. (Others?)
	var events = ['onclick', 'onload', 'onmouseover', 'onmouseout'];
	var eventsJoined = '[' + events.join('],[') + ']';
	markdownRoot.querySelectorAll(eventsJoined).forEach(each => {
		events.forEach(attr => {
			if (each.getAttribute(attr)) { each.setAttribute(attr, null); }
		});
	});

	// Set the page title.
	var title = markdownRoot.querySelector('h1, h2, h3, h4, h5, h6');		// First header
	if (title) {
		title = title.textContent.trim();
	} else {
		title = markdownRoot.textContent.trim().split("\n", 1)[0].trim();	// First line
	}
	if (title.length > 50) {
		title = title.substr(0, 50) + "...";
	}
	document.title = title;

	// Finally insert the markdown.
	document.body.appendChild(markdownRoot);
}

// Execute only if .md is unprocessed text.
var body = document.body;
if (body.childNodes.length === 1 &&
	body.children.length === 1 &&
	body.children[0].nodeName.toUpperCase() === 'PRE')
{
	var textContent = body.textContent;
	body.textContent = '';

	processMarkdown(textContent);
}
