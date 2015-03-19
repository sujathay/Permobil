/* JQuery Watermark Light Plugin
 * Version 1.01
 * http://www.davidjrush.com/jqueryplugin/watermark/
 *
 * Copyright 2013, David J Rush
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/GPL-2.0
 */
!function (a) { var t = [], e = { init: function () { return this.each(function (e) { var r = a(this), s = r.attr("title"); if (t.push(s), r.is(":password")) { var i = '<input type="text" class="watermark marked password" value="' + s + '" />'; r.wrap("<span />").after(i).hide().removeClass("watermark"), r.blur(function () { 0 == r.val().length && r.hide().next().show() }).next().focus(function () { a(this).hide().prev().show().focus() }) } else (r.is(":text") || r.is("[type=email]") || r.is("textarea")) && (r.blur(function () { 0 == r.val().length && r.val(t[e]).addClass("marked") }).focus(function () { r.val() == t[e] && r.hasClass("marked") && r.val("").removeClass("marked") }), r.val().length < 1 && r.val(s).addClass("marked")) }) }, clearWatermarks: function () { return this.each(function (e) { a(this).hasClass("marked") && a(this).val() == t[e] && a(this).val("") }) } }; a.fn.watermark = function (t) { return e[t] ? e[t].apply(this, Array.prototype.slice.call(arguments, 1)) : "object" != typeof t && t ? (a.error("Method " + t + " does not exist on jQuery.watermark"), void 0) : e.init.apply(this, arguments) } }(jQuery);