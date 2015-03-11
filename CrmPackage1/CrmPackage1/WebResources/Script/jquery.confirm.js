﻿(function ($) {

    $.confirm = function (params) {

        if ($('#confirmOverlay').length) {
            // A confirm is already shown on the page:
            return false;
        }

        var buttonHTML = '';
        $.each(params.buttons, function (name, obj) {

            // Generating the markup for the buttons:
            buttonHTML += '<input type="button" name="' + obj['class'] + '" value="' + obj['text'] + '" class="button" id="' + name + 'confirm" />';

            if (!obj.action) {
                obj.action = function () { };
            }
        });

        var markup = [
			'<div id="confirmOverlay">',
			'<div id="confirmBox">',
			'<div id="confirmClose"><img src="/WebResources/Permobil_/img/CloseDialog.png" alt="X"/></div>',
			'<h1>', params.title, '</h1>',
			'<p>', params.message, '</p>',
			'<div id="confirmButtons">',
			buttonHTML,
			'</div></div></div>'
		].join('');

        $(markup).hide().appendTo('body').fadeIn();

        var buttons = $('#confirmBox .button'),
			i = 0;
        //console.log(buttons);
        $('#confirmClose').click(function (e) {
            $.confirm.hide();
        });

        $.each(params.buttons, function (name, obj) {
            buttons.eq(i++).click(function () {

                // Calling the action attribute when a
                // click occurs, and hiding the confirm.
                obj.action();
                return false;
            });
        });
    }


    $.confirm.hide = function () {

        $('#confirmOverlay').fadeOut(function () {
            $(this).remove();
        });
    }


})(jQuery);