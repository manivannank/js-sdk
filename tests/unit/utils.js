(function($) {

Echo.Tests.module("Echo.Utils", {
	"meta": {
		"className": "Echo.Utils",
		"functions": [
			"addCSS",
			"capitalize",
			"foldl",
			"getComponent",
			"get",
			"getUniqueString",
			"getVisibleColor",
			"hasCSS",
			"htmlize",
			"htmlTextTruncate",
			"hyperlink",
			"inherit",
			"invoke",
			"isComponentDefined",
			"isMobileDevice",
			"loadImage",
			"log",
			"objectToJSON",
			"parallelCall",
			"parseURL",
			"remove",
			"random",
			"safelyExecute",
			"sequentialCall",
			"set",
			"stripTags",
			"substitute", // covered within the Control and Plugin tests
			"timestampFromW3CDTF"
		]
	}
});

Echo.Tests.test("foldl()", function() {
	var hash = Echo.Utils.foldl({}, ["value1", "value2"], function(value, acc) {
		acc[value] = value;
	});
	QUnit.deepEqual(hash, {"value1": "value1", "value2": "value2"}, "Hash as accumulator");

	var values = Echo.Utils.foldl([], ["value1", "value2"], function(value, acc) {
		acc.push(value);
	});
	QUnit.deepEqual(values, ["value1", "value2"], "Array as accumulator");

	var truncated_hash = Echo.Utils.foldl({}, {"key1": "value1", "key2": "value2"}, function(value, acc, key) {
		if (key === "key2") return;
		acc[key] = value;
	});
	QUnit.deepEqual(truncated_hash, {"key1": "value1"}, "Skipping some values in process");
});

Echo.Tests.test("get()", function() {
	var data = {
		"key1": "value1",
		"key2": {
			"key2-1": "value2-1",
			"key2-2": {
				"key2-2-1": "value2-2-1"
			}
		}
	};
	QUnit.strictEqual(Echo.Utils.get(data, ""), undefined,
		"empty string as key, expecting 'undefined'");
	QUnit.strictEqual(Echo.Utils.get(data, []), undefined,
		"empty array as key, expecting 'undefined'");
	QUnit.equal(Echo.Utils.get(data, "key1"), "value1",
		"simple key, simple value");
	QUnit.deepEqual(Echo.Utils.get(data, "key2"), {
		"key2-1": "value2-1",
		"key2-2": {
			"key2-2-1": "value2-2-1"
		}
	}, "simple key, complex value");
	QUnit.equal(Echo.Utils.get(data, "key2.key2-1"), "value2-1",
		"complex key, simple value");
	QUnit.equal(Echo.Utils.get(data, ["key2", "key2-1"]), "value2-1",
		"complex key represented as an array");
	QUnit.equal(Echo.Utils.get(data, "key1.fakekey", "default value"), "default value",
		"non-existent key and default value");
	QUnit.strictEqual(Echo.Utils.get(data), undefined,
		"missing key and no default value");
	QUnit.strictEqual(Echo.Utils.get(undefined, "key1"), undefined,
		"missing data, existing key");
	QUnit.strictEqual(Echo.Utils.get(), undefined,
		"both data and key are missing");
});

Echo.Tests.test("set()", function() {
	var data = {
		"key1": "value1",
		"key2": {
			"key2-1": "value2-1",
			"key2-2": {
				"key2-2-1": "value2-2-1"
			}
		}
	};
	QUnit.strictEqual(Echo.Utils.set(data), false,
		"can't set value if key is missing");
	QUnit.strictEqual(Echo.Utils.set(undefined, "key1"), false,
		"can't set value if data is missing");
	QUnit.strictEqual(Echo.Utils.set(), false,
		"can't set value if both data and key are missing");
	Echo.Utils.set(data, "key3", "value3");
	QUnit.equal(data["key3"], "value3",
		"simple value for simple key");
	Echo.Utils.set(data, "key1", {"key1-1": "value1-1"});
	QUnit.deepEqual(data["key1"], {"key1-1": "value1-1"},
		"complex value for simple key");
	Echo.Utils.set(data, "key2.key2-1", "value222");
	QUnit.equal(data["key2"]["key2-1"], "value222",
		"simple value for complex key");
});

Echo.Tests.test("remove()", function() {
	var data = {
		"key11": "value1",
		"key2": {
			"key2-1": "value2-1",
			"key2-2": {
				"key2-2-1": "value2-2-1"
			}
		},
		"key3": "value3"
	};
	QUnit.ok(!Echo.Utils.remove(data, ""), "key is an empty string");
	QUnit.ok(!Echo.Utils.remove(undefined, "key2"), "data is missing");
	QUnit.ok(!Echo.Utils.remove(data), "key is missing");
	QUnit.ok(!Echo.Utils.remove(), "both data and key are missing");
	QUnit.ok(Echo.Utils.remove(data, "key11"), "by simple key");
	QUnit.ok(typeof data.key11 === "undefined" && !data.hasOwnProperty("key11"), "check that value was removed");
	QUnit.deepEqual(data, {
		"key2": {
			"key2-1": "value2-1",
			"key2-2": {
				"key2-2-1": "value2-2-1"
			}
		},
		"key3": "value3"
	}, "check data object structure");
	QUnit.ok(Echo.Utils.remove(data, "key2.key2-2.key2-2-1"), "by complex key");
	QUnit.deepEqual(data, {
		"key2": {
			"key2-1": "value2-1",
			"key2-2": {}
		},
		"key3": "value3"
	}, "check data object structure");
	QUnit.ok(!Echo.Utils.remove("key2.key2-2.key2-2-1"), "can't remove value by non-existing complex key (tail part is not defined)");
	QUnit.ok(!Echo.Utils.remove("key2.key2-34.key2-2-1"), "can't remove value by non-existing complex key (middle part is not defined)");
	QUnit.ok(Echo.Utils.remove(data, ["key2", "key2-2"]), "by complex key represented as array");
	QUnit.deepEqual(data, {
		"key2": {
			"key2-1": "value2-1"
		},
		"key3": "value3"
	}, "check data object structure");
});

Echo.Tests.test("htmlize()", function() {
	QUnit.equal(Echo.Utils.htmlize(), undefined,
		"Checking with undefined param");
	QUnit.equal(Echo.Utils.htmlize(""), "",
		"Checking with empty string param");
	QUnit.equal(Echo.Utils.htmlize(10), 10,
		"Checking with integer param (expecting the same integer to be returned)");
	QUnit.equal(Echo.Utils.htmlize("text1 < & > text2"), "text1 &lt; &amp; &gt; text2",
		"Checking with special characters");
});

Echo.Tests.test("stripTags()", function() {
	QUnit.equal(Echo.Utils.stripTags(), undefined,
		"Checking with undefined param");
	QUnit.equal(Echo.Utils.stripTags(""), "",
		"Checking with empty string param");
	QUnit.equal(Echo.Utils.stripTags(20), 20,
		"Checking with integer param (expecting the same integer to be returned)");
	QUnit.equal(Echo.Utils.stripTags("<div>Content</div>"), "Content",
		"Checking with simple HTML");
	QUnit.equal(Echo.Utils.stripTags("<div>Outer<div><!-- Comment -->Inner</div></div>"), "OuterInner",
		"Checking with complex HTML");
});

Echo.Tests.test("objectToJSON()", function() {
	QUnit.equal(Echo.Utils.objectToJSON(null), "null",
		"Checking for null object ");
	QUnit.equal(Echo.Utils.objectToJSON(123), "123",
		"Checking for number object");
	QUnit.equal(Echo.Utils.objectToJSON("string\n"), "\"string\\n\"",
		"Checking for string object");
	QUnit.equal(Echo.Utils.objectToJSON(Number.POSITIVE_INFINITY), "null",
		"Checking for number object (infinity value)");
	QUnit.equal(Echo.Utils.objectToJSON(true), "true",
		"Checking for boolean object (true value)");
	QUnit.equal(Echo.Utils.objectToJSON(false), "false",
		"Checking for boolen object (false value)");
	QUnit.equal(Echo.Utils.objectToJSON(["value1", "value2"]), '["value1","value2"]',
		"Checking for simple array");
	QUnit.equal(Echo.Utils.objectToJSON([["value1.1", "value1.2"], "value2"]), '[["value1.1","value1.2"],"value2"]',
		"Checking for complex array");
	QUnit.equal(Echo.Utils.objectToJSON({"k1": "v1", "k2": "v2"}), '{"k1":"v1","k2":"v2"}',
		"Checking for simple object");
	var complex_object = {
		"k1": ["v1.1", null, false],
		"k2": {
			"k2.1": 21,
			"k2.2": 22
		}
	};
	QUnit.equal(Echo.Utils.objectToJSON(complex_object), '{"k1":["v1.1",null,false],"k2":{"k2.1":21,"k2.2":22}}',
		"Checking for complex object");
});

Echo.Tests.test("parseURL()", function() {
	QUnit.deepEqual(Echo.Utils.parseURL("http://domain.com:8080/some/path/1?query_string#hash_value"), {
		"scheme": "http",
		"domain": "domain.com",
		"port": "8080",
		"path": "/some/path/1",
		"query": "query_string",
		"fragment": "hash_value"
	}, "every part is defined");
	QUnit.deepEqual(Echo.Utils.parseURL("https://www.domain.com"), {
		"scheme": "https",
		"domain": "www.domain.com",
		"port": "",
		"path": "/",
		"query": "",
		"fragment": ""
	}, "only scheme and domain are defined");
	QUnit.deepEqual(Echo.Utils.parseURL("/some/path/1?query_string#hash_value"), {
		"scheme": "",
		"domain": "",
		"port": "",
		"path": "/some/path/1",
		"query": "query_string",
		"fragment": "hash_value"
	}, "only path, query and fragment are defined");
});

Echo.Tests.test("timestampFromW3CDTF()", function() {
	QUnit.equal(Echo.Utils.timestampFromW3CDTF("1994-11-05T08:15:30Z"), 784023330,
		"Checking with date and time");
	QUnit.equal(Echo.Utils.timestampFromW3CDTF("1994-11-05T08:15:30+01:30"), 784017930,
		"Checking with timezone offset");
	QUnit.equal(Echo.Utils.timestampFromW3CDTF("2012-11-09T11:32:23.726Z"), 1352460743.726,
		"Checking with milliseconds");
	QUnit.equal(Echo.Utils.timestampFromW3CDTF("2012-11-09T11:32:23.726+01:00"), 1352457143.726,
		"Checking with timezone offset and milliseconds");
	QUnit.equal(Echo.Utils.timestampFromW3CDTF("2012-11-09T11:32:23.726-01:00"), 1352464343.726,
		"Checking with negative timezone offset and milliseconds");
	QUnit.equal(Echo.Utils.timestampFromW3CDTF("2012-11-09"), 1352419200,
		"Checking with just date defined");
	QUnit.equal(Echo.Utils.timestampFromW3CDTF("2012-11"), 1351728000,
		"Checking with year and month defined");
	QUnit.equal(Echo.Utils.timestampFromW3CDTF("2012"), 1325376000,
		"Checking with just year defined");
	QUnit.equal(Echo.Utils.timestampFromW3CDTF("2012-01-01"), 1325376000,
		"Checking with boundary values of the year and month (min both)");
	QUnit.equal(Echo.Utils.timestampFromW3CDTF("2012-12-01"), 1354320000,
		"Checking with boundary values of the year and month (month max, date min)");
	QUnit.equal(Echo.Utils.timestampFromW3CDTF("2012-12-31"), 1356912000,
		"Checking with boundary values of the year and month (max both)");
	QUnit.equal(Echo.Utils.timestampFromW3CDTF("2012-01-01T00:00:00.000Z"), 1325376000,
		"Checking with boundary values (min time)");
	QUnit.equal(Echo.Utils.timestampFromW3CDTF("2012-01-01T00:00:00.000+00:00"), 1325376000,
		"Checking with boundary values (min time) and timezone offset");
	QUnit.equal(Echo.Utils.timestampFromW3CDTF("2012-12-31T23:59:59.999Z"), 1356998399.999,
		"Checking with boundary values of the year and month (max time)");
	QUnit.equal(Echo.Utils.timestampFromW3CDTF("2012-12-31T23:59:59.999-00:00"), 1356998399.999,
		"Checking with boundary values of the year and month (max time) and negative zero timzone offset");
	QUnit.equal(Echo.Utils.timestampFromW3CDTF("2012-01-01T00:00:00.000-01:45"), 1325382300,
		"Checking with boundary values (min time) and negative timezone offset");
	QUnit.equal(Echo.Utils.timestampFromW3CDTF("2012-01-01T00:00:00.000+01:45"), 1325369700,
		"Checking with boundary values (min time) and positive timezone offset");
	QUnit.equal(Echo.Utils.timestampFromW3CDTF("2012-12-31T23:59:59.999-23:59"), 1357084739.999,
		"Checking with boundary values of the year and month (max time) and negative timezone offset");
	QUnit.equal(Echo.Utils.timestampFromW3CDTF("2012-12-31T23:59:59.999+23:59"), 1356912059.999,
		"Checking with boundary values of the year and month (max time) and positive timezone offset");
	QUnit.strictEqual(Echo.Utils.timestampFromW3CDTF("1994-11-0508-15:30"), undefined,
		"Checking with incorrect input value");
});

Echo.Tests.test("htmlTextTruncate()", function() {
	var htmlToTruncate = '<div class="some-class">some<br>longword &copy;, &amp;amp; <b>bold<u>_underlined_<i>word</i> and <a href="domain.com" class="link">link</a></u></b> <span>qwerty</b>asdf</span></div>';
	QUnit.equal(
		Echo.Utils.htmlTextTruncate(htmlToTruncate, 3),
		'<div class="some-class">some</div>',
		"truncate in the middle of the first word"
	);
	QUnit.equal(
		Echo.Utils.htmlTextTruncate(htmlToTruncate, 10),
		'<div class="some-class">some<br>longword</div>',
		"truncate in the middle of the second word"
	);
	QUnit.equal(
		Echo.Utils.htmlTextTruncate(htmlToTruncate, 10, "_postfix"),
		'<div class="some-class">some<br>longword_postfix</div>',
		"with postfix"
	);
	QUnit.equal(
		Echo.Utils.htmlTextTruncate(htmlToTruncate, 13),
		'<div class="some-class">some<br>longword &copy;</div>',
		"truncate before html special character"
	);
	QUnit.equal(
		Echo.Utils.htmlTextTruncate(htmlToTruncate, 15),
		'<div class="some-class">some<br>longword &copy;,</div>',
		"truncate after comma"
	);
	QUnit.equal(
		Echo.Utils.htmlTextTruncate(htmlToTruncate, 19),
		'<div class="some-class">some<br>longword &copy;, &amp;amp</div>',
		"truncate in the middle of the word"
	);
	QUnit.equal(
		Echo.Utils.htmlTextTruncate(htmlToTruncate, 22),
		'<div class="some-class">some<br>longword &copy;, &amp;amp; <b></b></div>',
		"truncate after space"
	);
	QUnit.equal(
		Echo.Utils.htmlTextTruncate(htmlToTruncate, 26),
		'<div class="some-class">some<br>longword &copy;, &amp;amp; <b>bold<u></u></b></div>',
		"truncate between word and closing tag"
	);
	QUnit.equal(
		Echo.Utils.htmlTextTruncate(htmlToTruncate, 37),
		'<div class="some-class">some<br>longword &copy;, &amp;amp; <b>bold<u>_underlined_</u></b></div>',
		"truncate between word and underscore"
	);
	QUnit.equal(
		Echo.Utils.htmlTextTruncate(htmlToTruncate, 37, "..."),
		'<div class="some-class">some<br>longword &copy;, &amp;amp; <b>bold<u>_underlined_...</u></b></div>',
		"truncate between word and underscore with postfix"
	);
	QUnit.equal(
		Echo.Utils.htmlTextTruncate(htmlToTruncate, 38),
		'<div class="some-class">some<br>longword &copy;, &amp;amp; <b>bold<u>_underlined_<i></i></u></b></div>',
		"truncate after underscore"
	);
	QUnit.equal(
		Echo.Utils.htmlTextTruncate(htmlToTruncate, 40),
		'<div class="some-class">some<br>longword &copy;, &amp;amp; <b>bold<u>_underlined_<i>word</i></u></b></div>',
		"truncate in the middle of the word"
	);
	QUnit.equal(
		Echo.Utils.htmlTextTruncate(htmlToTruncate, 42),
		'<div class="some-class">some<br>longword &copy;, &amp;amp; <b>bold<u>_underlined_<i>word</i></u></b></div>',
		"truncate before closing tag"
	);
	QUnit.equal(
		Echo.Utils.htmlTextTruncate(htmlToTruncate, 49),
		'<div class="some-class">some<br>longword &copy;, &amp;amp; <b>bold<u>_underlined_<i>word</i> and <a href=\"domain.com\" class=\"link\">link</a></u></b></div>',
		"truncate in the middle of the link"
	);
	QUnit.equal(
		Echo.Utils.htmlTextTruncate(htmlToTruncate, 4),
		'<div class="some-class">some<br></div>',
		"truncate before standalone tag"
	);
	QUnit.equal(
		Echo.Utils.htmlTextTruncate(htmlToTruncate, 5),
		'<div class="some-class">some<br>longword</div>',
		"truncate after standalone tag"
	);
	QUnit.equal(
		Echo.Utils.htmlTextTruncate(htmlToTruncate),
		htmlToTruncate,
		"without 'limit' parameter"
	);
	QUnit.equal(
		Echo.Utils.htmlTextTruncate(htmlToTruncate, 60),
		htmlToTruncate,
		"with invalid html code"
	);
	QUnit.equal(
		Echo.Utils.htmlTextTruncate(htmlToTruncate, 100),
		htmlToTruncate,
		"without truncation (text.length < limit)"
	);

	htmlToTruncate = '<div class="some-class">some<br>longword &copy;, &amp;amp; <b>bold<u>_underlined_<i>word</i> and <a href="domain.com" class="link">link</a></u></b> <span>qwerty asdf</span>';
	QUnit.equal(
		Echo.Utils.htmlTextTruncate(htmlToTruncate, 62),
		htmlToTruncate + "</div>",
		"truncate after the last word"
	);
	QUnit.equal(
		Echo.Utils.htmlTextTruncate(htmlToTruncate, 70, "", true),
		htmlToTruncate + '</div>',
		"with forceClosingTags = true"
	);
});

Echo.Tests.test("getUniqueString()", function() {
	QUnit.ok(typeof Echo.Utils.getUniqueString() == "string", "returned value is string");
	var strings = [];
	for (var i = 0; i < 5; i++) {
		strings.push(Echo.Utils.getUniqueString());
	}
	for (var i = 0; i < 4; i++) {
		var str = strings.shift();
		QUnit.ok(!~$.inArray(str, strings), "string \"" + str + "\" differs from others");
	}
});

Echo.Tests.test("log()", function() {
	try {
		// checking log() calls with invalid params
		Echo.Utils.log();
		Echo.Utils.log("Some message");
		Echo.Utils.log(null);
		Echo.Utils.log(undefined);
		Echo.Utils.log({});
		Echo.Utils.log({"test": 1});

		// call log() with valid params
		Echo.Utils.log({
			"component": "Echo.TestComponent",
			"type": "warning",
			"message": "Test message from JS SDK Control class",
			"args": {"a": 1, "b": 2}
		});

		// checking if no exceptions were thrown
		QUnit.ok(true, "Checking if no exceptions were thrown while executing the \"log\" function with valid and invalid params");
	} catch(e) {
		QUnit.pushFailure("Execution of the \"log\" function caused exception.");
	};
});

Echo.Tests.test("hyperlink()", function() {
	var linkParams = {
		"data": {
			"caption": "TestLink",
			"href": "http://aboutecho.com",
			"target": "_blank"
		},
		"options": {
			"openInNewWindow": true,
			"skipEscaping": true
		}
	};
	QUnit.equal(
		Echo.Utils.hyperlink(linkParams.data, linkParams.options),
		"<a href=\"http://aboutecho.com\" target=\"_blank\">TestLink</a>",
		"returned value is a proper link"
	);
	linkParams.data.href = undefined;
	QUnit.equal(
		Echo.Utils.hyperlink(linkParams.data, linkParams.options),
		"<a target=\"_blank\" href=\"javascript:void(0)\">TestLink</a>",
		"'javascript:void(0)' is set as default href"
	);
	linkParams.data.href = "http://aboutecho.com";
	linkParams.data.caption = undefined;
	QUnit.equal(
		Echo.Utils.hyperlink(linkParams.data, linkParams.options),
		"<a href=\"http://aboutecho.com\" target=\"_blank\"></a>",
		"without caption"
	);
	linkParams.data.target = undefined;
	linkParams.options.openInNewWindow = true;
	QUnit.equal(
		Echo.Utils.hyperlink(linkParams.data, linkParams.options),
		"<a href=\"http://aboutecho.com\" target=\"_blank\"></a>",
		"target is set to '_blank' value if openInNewWindow is true"
	);
	linkParams.data.href = "http://aboutecho.com\?&a=b";
	linkParams.options.skipEscaping = false;
	QUnit.equal(
		Echo.Utils.hyperlink(linkParams.data, linkParams.options),
		"<a href=\"http://aboutecho.com\?&amp;a=b\" target=\"_blank\"></a>",
		"href attribute is htmlized if skipEscaping is false"
	);
});

Echo.Tests.test("capitalize()", function() {
	QUnit.strictEqual(Echo.Utils.capitalize(""), "", "Checking capitalize method if string is empty");
	QUnit.strictEqual(Echo.Utils.capitalize("someword"), "Someword", "Checking capitalize method if argument is lowercased word but with no word boundary.");
	QUnit.strictEqual(Echo.Utils.capitalize(" someword"), " Someword", "Checking capitalize method if argument is lowercased word but with word boundary.");
	QUnit.strictEqual(Echo.Utils.capitalize("SOMEWORD"), "SOMEWORD", "Checking capitalize method if argument is uppercased word");
	QUnit.strictEqual(Echo.Utils.capitalize("some text with whitespaces capitalized"), "Some Text With Whitespaces Capitalized", "Checking capitalize method if argument is regular text with whitespaces");
	QUnit.strictEqual(Echo.Utils.capitalize("some|long|word|with|no|whitespace|delimiter"), "Some|Long|Word|With|No|Whitespace|Delimiter", "Checking capitalize method if argument string is delimted with no whiespaces word boundary");
});

Echo.Tests.test("invoke()", function() {
	var nonCtxSpecificCases = [
		[10, 10],
		[true, true],
		[undefined, undefined],
		["some string", "some string"],
		[function() { return "test"; }, "test"],
		[function() {}, undefined],
		[function() { return this.a; }, undefined]
	];
	var ctxSpecificTests = [
		[function() { return this.a; }, 1],
		[function() { return this.b; }, undefined],
		[function() { return this.c; }, "test"]
	];
	var invoke = function(cases, context) {
		$.each(cases, function(id, _case) {
			QUnit.strictEqual(
				Echo.Utils.invoke(_case[0], context),
				_case[1],
				"case #" + (id + 1) + ", with " + (context ? "defined" : "no") + " context"
			);
		});
	};
	invoke(nonCtxSpecificCases);
	invoke(ctxSpecificTests, {"a": 1, "c": "test"});
});

Echo.Tests.test("safelyExecute()", function() {
	var TestClass = function(a) {
		this.a = a;
	};
	TestClass.prototype.fn = function() {
		return this.a;
	};
	var testInstance = new TestClass("some var");
	QUnit.strictEqual(Echo.Utils.safelyExecute(), undefined, "Checking if \"safelyExecute\" function called with no args (throw exception)");
	QUnit.strictEqual(Echo.Utils.safelyExecute(function() { throw "Some exception"; }), undefined, "Checking if \"safelyExecute\" function called which throwing an exception");
	QUnit.strictEqual(Echo.Utils.safelyExecute(function() {}), undefined, "Checking if \"safelyExecute\" function called which do not returns a value");
	QUnit.strictEqual(Echo.Utils.safelyExecute(function() { return "aaa"; }), "aaa", "Checking if \"safelyExecute\" function called with function which return value without args & context");
	QUnit.strictEqual(Echo.Utils.safelyExecute(function(a) { return a; }, 25), 25, "Checking if \"safelyExecute\" function called with function which return value with one argument & without context");
	QUnit.deepEqual(Echo.Utils.safelyExecute(function(a, b) { return [a, b]; }, [25, "aa"]), [25, "aa"], "Checking if \"safelyExecute\" function called with function which return value with 2 args & without context");
	QUnit.strictEqual(Echo.Utils.safelyExecute(testInstance.fn, 44, testInstance), "some var", "Checking if \"safelyExecute\" function called with function which return value with args & with context");
});

Echo.Tests.test("random()", function() {
	var num = Echo.Utils.random(1, 5);
	var num2 = Echo.Utils.random(1);
	var num3 = Echo.Utils.random();
	var num4 = Echo.Utils.random(5, 1);
	var num5 = Echo.Utils.random(-5, 1);
	var num6 = Echo.Utils.random(-5, -1);
	QUnit.ok(num <= 5 && num >= 1, "Check that generated number is in range (normal usage)");
	QUnit.ok(num5 <= 1 && num5 >= -5, "Check that generated number is in range (first argument is negative, second is positive)");
	QUnit.ok(num6 <= -1 && num6 >= -5, "Check that generated number is in range (both arguments is negative)");
	QUnit.ok(isNaN(num2), "Check that if function called with illegal number of parameters, then it returns NaN (one parameter)");
	QUnit.ok(isNaN(num3), "Check that if function called with illegal number of parameters, then it returns NaN (no parameters)");
	QUnit.ok(num4 <= 5 && num4 >= 1, "Check that if min greater than max, then function steel returns expected value");
});

Echo.Tests.asyncTest("loadImage()", function() {
	var simpleImage = function(callback) {
		var url = Echo.Loader.getURL("third-party/bootstrap/img/glyphicons-halflings.png", false);
		var img = Echo.Utils.loadImage({
			"image": url,
			"onload": function() {
				QUnit.equal($(this).attr("src"), url, "simple image");
				callback();
			}
		});
		$("#qunit-fixture").append(img);
	};
	var nonexistentImage = function(callback) {
		var url = Echo.Loader.getURL("images/avatar-default.png", false);
		var img = Echo.Utils.loadImage({
			"image": "http://example.com/fake.jpg",
			"defaultImage": url,
			"onload": function() {
				QUnit.equal($(this).attr("src"), url, "using default image if requested image is broken");
				callback();
			}
		});
		$("#qunit-fixture").append(img);
	};
	var emptyURL = function(callback) {
		var url = Echo.Loader.getURL("images/avatar-default.png", false);
		var img = Echo.Utils.loadImage({
			"image": "",
			"defaultImage": url,
			"onerror": function() {
				QUnit.ok(false, "onerror callback shouldn't be called");
				callback();
			},
			"onload": function() {
				QUnit.equal($(this).attr("src"), url, "using default image if requested URL is empty");
				callback();
			}
		});
		$("#qunit-fixture").append(img);
	};
	var nullURL = function(callback) {
		var url = Echo.Loader.getURL("images/avatar-default.png", false);
		var img = Echo.Utils.loadImage({
			"image": null,
			"defaultImage": url,
			"onerror": function() {
				QUnit.ok(false, "onerror callback shouldn't be called");
				callback();
			},
			"onload": function() {
				QUnit.equal($(this).attr("src"), url, "using default image if requested URL is null");
				callback();
			}
		});
		$("#qunit-fixture").append(img);
	};
	var onerrorCallback = function(callback) {
		var img = Echo.Utils.loadImage({
			"image": "http://example.com/fake.jpg",
			"onerror": function() {
				QUnit.ok(true, "onerror callback is called if requested image is broken");
				callback();
			},
			"onload": function() {
				QUnit.ok(false, "onload callback shouldn't be called");
				callback();
			}
		});
		$("#qunit-fixture").append(img);
	};

	QUnit.expect(5);
	Echo.Utils.sequentialCall([
		simpleImage,
		nonexistentImage,
		emptyURL,
		nullURL,
		onerrorCallback
	], function() {
		QUnit.start();
	});
});

Echo.Tests.test("testing templateSubstitution regexp", function() {
	var browser = Echo.Tests.browser;
	QUnit.deepEqual(
		new RegExp(Echo.Utils.regexps.templateSubstitution).exec("{key:value}"),
		["{key:value}", "key", "value"],
		"Checking with one key-value pair"
	);
	QUnit.deepEqual(
		new RegExp(Echo.Utils.regexps.templateSubstitution).exec("{key}"),
		["{key}", "key", (browser.msie && +browser.version <= 8 || browser.msie && document.compatMode === "BackCompat" ? "" : undefined)],
		"Checking with key and empty value"
	);
	QUnit.deepEqual(
		new RegExp(Echo.Utils.regexps.templateSubstitution).exec("string without template"),
		null,
		"Checking with fake string as parameter"
	);
	var regexp = new RegExp(Echo.Utils.regexps.templateSubstitution, "g");
	var processed = [].concat(regexp.exec("{key1:value1} {key2:value2}"),
		regexp.exec("{key1:value1} {key2:value2}"));
	QUnit.deepEqual(
		processed,
		["{key1:value1}", "key1", "value1", "{key2:value2}", "key2", "value2"],
		"Checking templateSubstitution regexp with multiple key-value pairs"
	);
});

Echo.Tests.test("_prepareFieldAccessKey()", function() {
	var data = {
		"key1": "value1",
		"key2": {
			"key2-1": "value2-1",
			"key2-2": {
				"key2-2-1": "value2-2-1"
			}
		}
	};
	var cases = [
		["", false, "empty string as a value"],
		[false, false, "boolean 'false' as a value"],
		[true, false, "boolean 'true' as a value"],
		[0, false, "integer '0' as a value"],
		[12, false, "non-zero integer '12' as a value"],
		[{}, false, "object as a value"],
		["key", ["key"], "plain key string"],
		["key1.key2", ["key1", "key2"], "string key with nesting"],
		[["key1", "key2"], ["key1", "key2"], "array as a key"],
		[[], false, "empty array as a key"]
	];
	$.map(cases, function(_case) {
		var result = Echo.Utils._prepareFieldAccessKey(_case[0]);
		if (_case[1] === false) {
			QUnit.strictEqual(result, _case[1], _case[2]);
		} else {
			QUnit.deepEqual(result, _case[1], _case[2]);
		}
	});
});

Echo.Tests.test("component related methods", function() {
	var classA = function() {};
	classA.prototype.functionA = function() {};
	var classB = Echo.Utils.inherit(classA);
	classB.prototype.functionB = function() {};
	QUnit.ok(!!classB.prototype.functionB,
		"Checking that the result object extended using the inherit() function has native methods");
	QUnit.ok(!!classA.prototype.functionA,
		"Checking that the parent object has native function after the inherit() function call");
	QUnit.ok(!classA.prototype.functionB,
		"Checking that there is no methods added to the parent object after the inherit() function call");
	QUnit.ok(!!classB.prototype.functionA,
		"Checking if the child object has all methods from the parent class");

	QUnit.ok(!!Echo.Utils.getComponent("Echo"),
		"Checking if Echo namespace was defined (via getComponent() function)");
	QUnit.ok(!!Echo.Utils.getComponent("Echo.Utils"),
		"Checking if Echo.Utils lib was defined (via getComponent() function)");
	QUnit.deepEqual(Echo.Utils.getComponent("Echo.Utils"), window.Echo.Utils,
		"Checking if we receive a proper link back from the getComponent() function");
	QUnit.equal(Echo.Utils.getComponent("Fake.Echo.Utils"), undefined,
		"Checking if we receive 'undefined' as a value in case the given component doesn't exist on the page");

	QUnit.ok(Echo.Utils.isComponentDefined("Echo"),
		"Checking if Echo namespace was defined (via isComponentDefined() function)");
	QUnit.ok(Echo.Utils.isComponentDefined("Echo.Utils"),
		"Checking if Echo.Utils lib was defined (via isComponentDefined() function)");
	QUnit.ok(!Echo.Utils.isComponentDefined("Echo.SomeRandomLib"),
		"Checking if the isComponentDefined() function triggers negative value for the random name");
	QUnit.ok(!Echo.Utils.isComponentDefined("SomeNameSpace.SomeRandomLib"),
		"Checking if the isComponentDefined() function triggers negative value for the random name and namespace");
});

Echo.Tests.test("DOM related methods", function() {
	QUnit.ok(!Echo.Utils.hasCSS("utils-tests"),
		"Checking whether we don't have the \"utils-tests\" CSS styles set added to the document before really adding it (using hasCSS function)");
	QUnit.ok(Echo.Utils.addCSS(".echo-utils-tests { background-color: rgb(12, 34, 56); }", "utils-tests"),
		"Checking that addCSS() method returns true if CSS-class was added");
	QUnit.ok(Echo.Utils.hasCSS("utils-tests"),
		"Checking whether we have the \"utils-tests\" CSS styles set added as soon as we added it into the document (using hasCSS function)");
	QUnit.ok(!Echo.Utils.hasCSS(), "Checking the hasCSS function with empty argument");

	var testElement = $('<div class="echo-utils-tests"></div>');
	$("#qunit-fixture").append(testElement);
	QUnit.ok(/rgb\(12,\s*34,\s*56\)/.test(Echo.Utils.getVisibleColor(testElement)),
		"Test element has correct background color added via addCss() function");
	QUnit.ok(!Echo.Utils.addCSS(".echo-utils-tests {}", "utils-tests"),
		"Checking that addCSS() method returns false if previously added Id is used");

	var template =
		'<div class="echo-utils-tests-container">' +
			'<div class="echo-utils-tests-header">header</div>' +
			'<div class="echo-utils-tests-content">' +
				'<div class="echo-utils-tests-section1">content1</div>' +
				'<div class="echo-utils-tests-section2">content2</div>' +
				'<div class="echo-utils-tests-section3">content3</div>' +
			'</div>' +
		'</div>';

	var container = $(template);
	var get = function(name) {
		return $(".echo-utils-tests-" + name, container);
	};
	get("section1").css("background-color", "rgb(255, 0, 0)");
	QUnit.ok(/rgb\(255,\s*0,\s*0\)/.test(Echo.Utils.getVisibleColor(get("section1"))),
		"Checking getVisibleColor() method with element color");
	get("content").css("background-color", "rgb(0, 255, 0)");
	QUnit.ok(/rgb\(0,\s*255,\s*0\)/.test(Echo.Utils.getVisibleColor(get("section3"))),
		"Checking that getVisibleColor() method returns parent element color if element color is undefined");
	get("footer").css("background-color", "rgba(0, 0, 0, 0)");
	QUnit.equal(Echo.Utils.getVisibleColor(get("footer")), "transparent",
		"Checking getVisibleColor() method with transparent element color");
});

Echo.Tests.test("user agents", function() {
	var user_agents = {
		"android": "Android-x86-1.6-r2 - Mozilla/5.0 (Linux; U; Android 1.6; en-us; eeepc Build/Donut)" +
			"AppleWebKit/528.5+ (KHTML, like Gecko) Version/3.1.2 Mobile Safari/525.20.1",
		"iphone": "Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_2 like Mac OS X; en_us) AppleWebKit/525.18.1",
		"opera-mini": "Opera/9.60 (J2ME/MIDP; Opera Mini/4.2.14912/812; U; ru) Presto/2.4.15",
		"ie": "Mozilla/5.0 (Windows; U; MSIE 9.0; Windows NT 9.0; en-US)",
		"firefox": "Mozilla/5.0 (X11; U; Linux i686; cs-CZ; rv:1.7.12) Gecko/20050929",
		"chrome": "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_7; en-US) AppleWebKit/534.16" +
			"(KHTML, like Gecko) Chrome/10.0.648.205 Safari/534.16"
	};
	var regexp = Echo.Utils.regexps.mobileUA;
	// test regexp for isMobileDevice() method to avoid redefining userAgent
	QUnit.ok(regexp.test(user_agents["android"]), "Android: mobile user agent");
	QUnit.ok(regexp.test(user_agents["iphone"]), "iPhone: mobile user agent");
	QUnit.ok(regexp.test(user_agents["opera-mini"]), "Opera-Mini: mobile user agent");
	QUnit.ok(!regexp.test(user_agents["ie"]), "IE: NOT mobile user agent");
	QUnit.ok(!regexp.test(user_agents["firefox"]), "Firefox: NOT mobile user agent");
	QUnit.ok(!regexp.test(user_agents["chrome"]), "Chrome: NOT mobile user agent");
	QUnit.equal(Echo.Utils.isMobileDevice(), regexp.test(navigator.userAgent),
		"Checking isMobileDevice() method with real user agent");
});

var _getTestFunctions = function() {
	var result = [];
	var functions = [
		function(cb) { result.push(1); cb(); },
		function(cb) { result.push(2); cb(); },
		function(cb) { result.push(3); cb(); },
		function(cb) { setTimeout(function () { result.push(4); cb(); }, 100); },
		function(cb) { result.push(5); cb(); }
	];
	return {"functions": functions, "result": result};
};

Echo.Tests.asyncTest("sequentialCall()", function() {
	Echo.Utils.sequentialCall([], function() {
		QUnit.ok(true, "an empty list of actions doesn't produce error");
	});
	var data = _getTestFunctions();
	Echo.Utils.sequentialCall(data.functions, function() {
		QUnit.deepEqual(data.result, [1, 2, 3, 4, 5], "Checking functions execution order");
		QUnit.start();
	});
});

Echo.Tests.asyncTest("parallelCall()", function() {
	Echo.Utils.parallelCall([], function() {
		QUnit.ok(true, "an empty list of actions doesn't produce error");
	});
	var data = _getTestFunctions();
	Echo.Utils.parallelCall(data.functions, function() {
		QUnit.deepEqual(data.result, [1, 2, 3, 5, 4],
			"Checking functions execution order");
		QUnit.start();
	});
});

})(Echo.jQuery);
