/*
 * Copyright (c) 2005-2007 Henri Sivonen
 * Copyright (c) 2007-2008 Mozilla Foundation
 * Copyright (c) 2007 Simon Pieters
 * Copyright (c) 2013-2014 W3C
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */
var idCount = 0
var urlInput = null
var fileInput = null
var textarea = null
var textareaHidden = null
var dynamicStyle = null
var prevHash = null
var hasTextContent = (createHtmlElement('code').textContent != undefined)

var linePattern = /^#l-?[0-9]+$/
var rangePattern = /^#l-?[0-9]+c[0-9]+$/
var exactPattern = /^#cl-?[0-9]+c[0-9]+$/

function boot() {
	installHandlers()
}

function reboot() {
	boot()
	initFieldHolders()
	installDynamicStyle()
	updateFragmentIdHilite()
	window.setInterval(emulateHashChanged, 50)
	initFilters()
	injectHyperlinks()
	replaceSuccessFailure()
}

function installDynamicStyle() {
	dynamicStyle = createHtmlElement('style')
	document.documentElement.firstChild.appendChild(dynamicStyle)
}

function installHandlers() {
	if (document.forms && document.forms.length) {
		document.forms[0].onsubmit = formSubmission
	}
}

function initFieldHolders() {
	urlInput = document.getElementById('doc')
	urlInput.setAttribute('aria-labelledby', 'docselect')
	urlInput.setAttribute('required', '')
	textareaHidden = createHtmlElement('input')
	textarea = createHtmlElement('textarea')
	if (textarea && textareaHidden) {
		textareaHidden.type = 'hidden'
		textareaHidden.name = 'content'
		textarea.cols = 72
		textarea.rows = 15
		textarea.id = 'doc'
		textarea.setAttribute('aria-labelledby', 'docselect')
		copySourceIntoTextArea()
		if (textarea.value == '') {
			textarea.value = '<!DOCTYPE html>\n<html>\n<head>\n<title>Test</title>\n</head>\n<body>\n<p></p>\n</body>\n</html>'
		}
	}
	fileInput = createHtmlElement('input')
	if (fileInput) {
		fileInput.type = 'file'
		fileInput.id = 'doc'
		fileInput.name = 'file'
		fileInput.setAttribute('aria-labelledby', 'docselect')
		fileInput.setAttribute('required','')
	}
	var label = document.getElementById("inputlabel");
	label.removeAttribute("for")
	label.textContent = "Check by"
	var modeSelect = createHtmlElement("select")
	modeSelect.id = 'docselect'
	modeSelect.appendChild(createOption('address', ''))
	modeSelect.appendChild(createOption('file upload', 'file'))
	modeSelect.appendChild(createOption('text input', 'textarea'))
	modeSelect.onchange = function() {
	if (this.value == 'file') {
		installFileUpload()
	}
	else
		if (this.value == 'textarea') {
			installTextarea()
		}
		else {
			installUrlInput()
		}
	}
	label.appendChild(modeSelect)
	if (urlInput.className == 'file') {
		installFileUpload()
		modeSelect.value = 'file'
	} else
		if (urlInput.className == 'textarea') {
		installTextarea()
		modeSelect.value = 'textarea'
	}
}

function createOption(text, value) {
	var rv = createHtmlElement('option')
	rv.value = value
	var tn = document.createTextNode(text)
	rv.appendChild(tn)
	return rv
}

function formSubmission() {
	if (document.getElementsByTagName) {
		var form = document.getElementsByTagName("form")[0]
		if (form.checkValidity) {
			if (!form.checkValidity()) {
				return true
			}
		}
	}
	disableByIdIfEmptyString("doc")
	if (textareaHidden && textarea) {
	  textareaHidden.value = textarea.value
	}
	return true
}

function undoFormSubmission() {
	enableById("doc")
	return true
}

function disableById(id) {
	var field = document.getElementById(id)
	if (field) {
		field.disabled = true
	}
}

function disableByIdIfEmptyString(id) {
	var field = document.getElementById(id)
	if (field) {
		if ("" == field.value) {
			field.disabled = true
		}
	}
}

function enableById(id) {
	var field = document.getElementById(id)
	if (field) {
		field.disabled = false
	}
}

function createHtmlElement(tagName) {
	return document.createElementNS ? document.createElementNS("http://www.w3.org/1999/xhtml", tagName) : document.createElement(tagName)
}

function injectHyperlinks() {
	// var errors = document.getElementsByClassName("error")
	var warnings = document.getElementsByClassName("warning")
	linkify(warnings, "checking against the HTML5 + RDFa 1.1 schema",
		"about.html#rdfa",
		"About HTML5 + RDFa 1.1 checking.")
	}

function replaceSuccessFailure() {
	var success = document.querySelector(".success"),
	failure = document.querySelector(".failure")
	if (success) {
		success.textContent = "Document checking completed."
	} else if (failure) {
		failure.textContent = "Document checking completed."
	}
}

function linkify(messages, text, target, title) {
	if (!messages) return
	for (var i = 0; i < messages.length; ++i) {
		messages[i].firstChild.lastChild.innerHTML =
		messages[i].firstChild.lastChild.innerHTML.replace(text,
		"<a href='" + target + "' title='" + title + "'>" + text + "</a>");
	}
}

function reflow(element) {
	if (element.offsetHeight) {
		var reflow = element.offsetHeight
	}
}

function installTextarea() {
	var input = document.getElementById('doc')
	if (input && textarea) {
		var form = document.forms[0]
		if (form) {
			form.method = 'post'
			form.enctype = 'multipart/form-data'
			if (document.getElementById("xnote")) {
				input.parentNode.removeChild(document.getElementById("xnote"))
			}
			input.parentNode.replaceChild(textarea, input)
			reflow(textarea)
		}
	}
	if (textareaHidden) {
	  var submit = document.getElementById("submit")
	  if (submit) {
	    submit.parentNode.appendChild(textareaHidden)
	  }
	}
	var showSource = document.getElementById("showsource")
	if (showSource) {
		showSource.checked = true
	}
}

function installFileUpload() {
	var input = document.getElementById('doc')
	var xnote = document.createElement("div")
	var tn = document.createTextNode("Uploaded files with .xhtml or .xht extensions are automatically processed as XHTML.")
	if (input && fileInput) {
		var form = document.forms[0]
		if (form) {
			form.method = 'post'
			form.enctype = 'multipart/form-data'
			input.parentNode.replaceChild(fileInput, input)
			document.getElementById("inputregion").appendChild(xnote)
			xnote.setAttribute('id', 'xnote')
			xnote.appendChild(tn)
			reflow(fileInput)
		}
	}
	if (textareaHidden && textareaHidden.parentNode) {
	  textareaHidden.parentNode.removeChild(textareaHidden)
	}
}

function installUrlInput() {
	var input = document.getElementById('doc')
	if (input && urlInput) {
		var form = document.forms[0]
		if (form) {
			form.method = 'get'
			form.enctype = ''
			if (document.getElementById("xnote")) {
				input.parentNode.removeChild(document.getElementById("xnote"))
			}
			input.parentNode.replaceChild(urlInput, input)
			reflow(urlInput)
		}
	}
	if (textareaHidden && textareaHidden.parentNode) {
	  textareaHidden.parentNode.removeChild(textareaHidden)
	}
}

function copySourceIntoTextArea() {
	if (document.getElementById('source') === null) {
		return
	}
	var strings = []
	var source = document.getElementById('source').nextSibling;
	if (source && textarea) {
		var li = source.firstChild
		while (li) {
			var code = li.firstChild
			if (hasTextContent) {
				strings.push(code.textContent)
			}
			else {
				strings.push(code.innerText)
			}
			li = li.nextSibling
		}
		textarea.value = strings.join('\n')
	}
}

function updateFragmentIdHilite() {
	var fragment = window.location.hash
	var selector = null
	if (linePattern.exec(fragment)) {
		selector = fragment + " *"
	} else if (exactPattern.exec(fragment)) {
		selector = fragment
	} else if (rangePattern.exec(fragment)) {
		selector = "html b." + fragment.substring(1)
	}
	var rule = ''
	if (selector) {
		rule = selector + " { background-color: #FF6666; font-weight: bold; }"
	}
	var newStyle = createHtmlElement('style')
	var ex
	try {
		newStyle.appendChild(document.createTextNode(rule))
	} catch (ex) {
		if (ex.number == -0x7FFF0001) {
			newStyle.styleSheet.cssText = rule
		} else {
			throw ex
		} 
	}
	dynamicStyle.parentNode.replaceChild(newStyle, dynamicStyle)
	dynamicStyle = newStyle
}

function emulateHashChanged() {
	var hash = window.location.hash
	if (prevHash != hash) {
		updateFragmentIdHilite()
		prevHash = hash
	}
}

if (document.getElementById) {
	window.onload = reboot
	if (document.addEventListener) {
		document.addEventListener("DOMContentLoaded", function() {
			window.onload = undefined
			reboot()
		}, false)
	}
	window.onunload = undoFormSubmission
	window.onabort = undoFormSubmission
	boot()
}

function initFilters() {
	var errors,
		warnings,
		info,
		filters,
		heading,
		filtersButton,
		makeFieldset,
		fieldsets,
		fieldset,
		legend,
		toggleFilters,
		checkboxes,
		links,
		messageCollection,
		className,
		links,
		mainForm

	if (!document.getElementsByClassName || !document.querySelectorAll) {
		return
	}
	if (document.getElementsByTagName('ol').length < 1) {
		// If there's no <ol> on the page, then we have no
		// messages to filter.
		return
	}

	errors = document.getElementsByClassName('error')
	warnings = document.getElementsByClassName('warning')
	info = document.querySelectorAll('[class=info]')
	filters = document.createElement("section")
	filters.id = "filters"
	filters.className = "unexpanded"
	heading = document.createElement("h2")
	filtersButton = document.createElement("button")
	filtersButton.appendChild(document.createTextNode("Message filtering"))
	heading.appendChild(filtersButton)
	filters.appendChild(heading)
	filtersButton.addEventListener('click', function (e) {
	  toggleFilters()
	}, false)

	// Generate errors/warnings/info fieldsets
	makeFieldset = function(messages, displayType) {
		var fieldset,
			legend,
			hide,
			show,
			messageList,
			messageGroupList,
			checkbox,
			listitem,
			hidegroup,
			showgroup,
			message,
			messagesObject = {},
			messagesSorted = [],
			type = displayType.toLowerCase(),
			messageGroup,
			uniqueMessage,
			makeCheckbox

		makeCheckbox = function(messageName, messageCollection) {
			var checkbox, label, listitem,
				messageSpan = document.getElementById(messageCollection[0]).getElementsByTagName("p")[0].getElementsByTagName("span")[0].cloneNode(true)

			checkbox = document.createElement("input")
			checkbox.type = "checkbox"
			checkbox.checked = "checked"
			checkbox.vnuMessageName = messageName
			checkbox.vnuMessageCollection = messageCollection
			checkbox.vnuMessageType = type
			label = document.createElement("label")
			label.appendChild(checkbox)
			label.appendChild(messageSpan)
			if (messageCollection.length > 1) {
				label.appendChild(document.createTextNode(' (' + messageCollection.length.toString() + ')'))
			}

			// Restore saved checkbox value from local storage
			if (supportsLocalStorage()) {
				if (localStorage.hasOwnProperty(type + ':' + messageName) && localStorage[type + ':' + messageName] === 'false') {
					checkbox.checked = false
					for (var i = 0; i < messageCollection.length; ++i) {
						document.getElementById(messageCollection[i]).className += ' hidden'
					}
				}
			}

			listitem = document.createElement("li")
			listitem.appendChild(label)
			return listitem
		}

		if (messages.length > 0) {

			// Find the unique messages
			for (var i = 0; i < messages.length; ++i) {
				message = messages[i]
				messageClone = messages[i].cloneNode(true)
					uniqueMessage = messageClone.getElementsByTagName('p')[0].getElementsByTagName('span')[0].textContent
					messageGroupEl = messageClone.getElementsByTagName('p')[0].getElementsByTagName('span')[0].cloneNode(true)
					messageGroupElCode = messageGroupEl.getElementsByTagName("code")
					for (var j = 0; j < messageGroupElCode.length; ++j) {
						messageGroupElCode[j].textContent = "___"
						if (messageGroupElCode[j].parentNode instanceof HTMLAnchorElement) {
							messageGroupElCode[j].parentNode.removeAttribute("href")
						}
					}
					messageGroup = messageGroupEl.textContent
					messageGroupNode = messageGroupEl

				if (!messages.hasOwnProperty(messageGroup)) {
					messages[messageGroup] = {
						messageCollection: [],
						uniqueMessages: {},
						uniqueMessagesLength: 0,
						messageGroupNode: messageGroupNode
					}
				}
				messages[messageGroup].messageCollection.push(message)

				if (!messages[messageGroup].uniqueMessages.hasOwnProperty(uniqueMessage)) {
					messages[messageGroup].uniqueMessages[uniqueMessage] = []
					messages[messageGroup].uniqueMessagesLength += 1
				}
				var id = "vnuId" + idCount
				message.id = id
				messages[messageGroup].uniqueMessages[uniqueMessage].push(id)
				idCount++
			}

			// Generate Hide/Show All buttons
			fieldset = document.createElement("fieldset")
			fieldset.className = "hidden"
			legend = document.createElement("legend")
			legend.appendChild(document.createTextNode(displayType + " · "))
			hide = document.createElement("a")
			hide.href = ""
			show = hide.cloneNode(true)
			hide.className = "hide"
			show.className = "show"
			hide.appendChild(document.createTextNode("Hide all " + type))
			show.appendChild(document.createTextNode("Show all " + type))
			legend.appendChild(hide)
			legend.appendChild(document.createTextNode(" · "))
			legend.appendChild(show)
			fieldset.appendChild(legend)

			messageList = document.createElement("ol")
			for (messageGroup in messages) {
				if (messages.hasOwnProperty(messageGroup)) {
					messageGroupList = document.createElement("ol")
					for (uniqueMessage in messages[messageGroup].uniqueMessages) {
						if (messages[messageGroup].uniqueMessages.hasOwnProperty(uniqueMessage)) {
							var box = makeCheckbox(uniqueMessage, messages[messageGroup].uniqueMessages[uniqueMessage])
							if (messages[messageGroup].uniqueMessagesLength === 1) {
								messageList.appendChild(box)
							} else {
								messageGroupList.appendChild(box)
							}
						}
					}

					if (messages[messageGroup].uniqueMessagesLength > 1) {
						listitem = document.createElement("li")
						listitem.appendChild(messages[messageGroup].messageGroupNode)
						listitem.appendChild(document.createTextNode(' (' + messages[messageGroup].messageCollection.length.toString() + ') · '))
						hidegroup = document.createElement("a")
						hidegroup.href = ""
						showgroup = hidegroup.cloneNode(true)
						hidegroup.className = "hide"
						showgroup.className = "show"
						hidegroup.appendChild(document.createTextNode("Hide all"))
						showgroup.appendChild(document.createTextNode("Show all"))
						listitem.appendChild(hidegroup)
						listitem.appendChild(document.createTextNode(" · "))
						listitem.appendChild(showgroup)
						listitem.appendChild(messageGroupList)
						messageList.appendChild(listitem)
					}
				}
			}

			fieldset.appendChild(messageList)
			filters.appendChild(fieldset)
		}
	}

	showCount = function() {
		var count = document.querySelectorAll("body ol > li.hidden"),
			span
		span = document.querySelector(".filtercount")
		if (span) {
			span.parentNode.removeChild(span)
		}
		if (count.length > 0) {
			span = document.createElement("span")
			span.className = "filtercount"
			span.appendChild(document.createTextNode(count.length.toString() + (count.length === 1 ? " message" : " messages") + " hidden by filtering"))
			heading.appendChild(document.createTextNode(" "))
			heading.appendChild(span)
		}
	}

	makeFieldset(errors, 'Errors')
	makeFieldset(warnings, 'Warnings')
	makeFieldset(info, 'Info messages')
	showCount()

	mainForm = document.getElementsByTagName("form")[0]
	mainForm.parentNode.insertBefore(filters, mainForm.nextSibling)
	fieldsets = filters.getElementsByTagName("fieldset")

	toggleFilters = function() {
		filters.className === "expanded" ? filters.className = "unexpanded" : filters.className = "expanded"
		for (var i = 0; i < fieldsets.length; ++i) {
			fieldset = fieldsets[i]
			fieldset.className === "hidden" ? fieldset.className = "unhidden" : fieldset.className = "hidden"
		}
	}

	// Show/hide the messages when the checkboxes are toggled
	checkboxes = document.getElementById("filters").getElementsByTagName("input")
	for (var i = 0; i < checkboxes.length; ++i) {
		checkboxes[i].addEventListener("change", function(e) {
			messageCollection = e.target.vnuMessageCollection
			for (var j = 0; j < messageCollection.length; ++j) {
				className = document.getElementById(messageCollection[j]).className
				if (e.target.checked) {
					document.getElementById(messageCollection[j]).className = className.replace(/\s*hidden\s*/g, "")
				} else {
					document.getElementById(messageCollection[j]).className += ' hidden'
				}
				if (supportsLocalStorage()) {
					localStorage[e.target.vnuMessageType + ':' + e.target.vnuMessageName] = e.target.checked
				}
			}
			showCount()
		}, false)
	}

	links = document.getElementsByClassName("hide")
	for (var n = 0; n < links.length; ++n) {
		links[n].addEventListener("click", function(e) {
			if (e.target.className !== "hide") {
				return
			}
			e.preventDefault()
			var boxes
			if (e.target.parentNode.getElementsByTagName("ol").length > 0) {
				// If this item has <ol> descendants, then
				// it must be a message group, in which
				// case we go back up the tree to its
				// parent, which is an <li>, and get the
				// checkboxes descendants of that.
				boxes = e.target.parentNode.getElementsByTagName("input")
			} else {
				// If this item has no <ol> descendants, then
				// it must not be a message group, in which
				// case we go back up the tree to its
				// parent's parent, which is a <fieldset>,
				// and get the checkboxes descendants of that.
				boxes = e.target.parentNode.parentNode.getElementsByTagName("input")
			}
			for (var i = 0; i < boxes.length; ++i) {
				var box = boxes[i]
				box.removeAttribute("checked")
				box.checked = false
				messageCollection = box.vnuMessageCollection
				for (var j = 0; j < messageCollection.length; ++j) {
					if (document.getElementById(messageCollection[j])) {
						document.getElementById(messageCollection[j]).className += ' hidden'
					}
				}
				if (supportsLocalStorage()) {
					localStorage[box.vnuMessageType + ':' + box.vnuMessageName] = false
				}
			}
			showCount()
		}, false)
	}

	links = document.getElementsByClassName("show")
	for (var n = 0; n < links.length; ++n) {
		links[n].addEventListener("click", function(e) {
			if (e.target.className !== "show") {
				return
			}
			e.preventDefault()
			var boxes
			if (e.target.parentNode.getElementsByTagName("ol").length > 0) {
				// If this item has <ol> descendants, then
				// it must be a message group, in which
				// case we go back up the tree to its
				// parent, which is an <li>, and get the
				// checkboxes descendants of that.
				boxes = e.target.parentNode.getElementsByTagName("input")
			} else {
				// If this item has no <ol> descendants, then
				// it must not be a message group, in which
				// case we go back up the tree to its
				// parent's parent, which is a <fieldset>,
				// and get the checkboxes descendants of that.
				boxes = e.target.parentNode.parentNode.getElementsByTagName("input")
			}
			for (var i = 0; i < boxes.length; ++i) {
				var box = boxes[i]
				box.checked = true
				messageCollection = box.vnuMessageCollection
				for (var j = 0; j < messageCollection.length; ++j) {
					if (document.getElementById(messageCollection[j])) {
						var className = document.getElementById(messageCollection[j]).className
						document.getElementById(messageCollection[j]).className = className.replace(/\s*hidden\s*/g, "")
					}
				}
				if (supportsLocalStorage()) {
					localStorage[box.vnuMessageType + ':' + box.vnuMessageName] = true
				}
			}
			showCount()
		}, false)
	}
}

function supportsLocalStorage() {
	try {
		return 'localStorage' in window && window['localStorage'] !== null
	} catch (e) {
		return false
	}
}
