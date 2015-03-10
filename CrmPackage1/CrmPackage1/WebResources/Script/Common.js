/// <reference path="XrmPageTemplate.js" />

if (typeof (c360) == "undefined") {
    c360 = { __namespace: true };
}

c360.Common = {
    __namespace: true,
    context: function () {
        ///<summary>Private function to the context object.</summary>
        ///<returns>Context</returns>
        if (typeof GetGlobalContext != "undefined")
        { return GetGlobalContext(); }
        else {
            if (typeof Xrm != "undefined") {
                return Xrm.Page.context;
            }
            else if (typeof parent.Xrm != "undefined") {
                return parent.Xrm.Page.context;
            }
            else { throw new Error("Context is not available."); }
        }
    },
    getClientUrl: function () {
        ///<summary>Private function to return the server URL from the context</summary>
        ///<returns>String</returns>
        var context = this.context();
        var clientUrl = (context.getClientUrl != undefined) ? context.getClientUrl() : context.getServerUrl();

        return clientUrl;
    },
    handleError: function (e) {
        var defaultMessage = "Unexpected Error occured\n\nMessage:";
        try {
            c360.Logging.c360Logger.error(e);
            alert(c360.LocalizationController.GetLocalization("UnexpectedErrorOccured", defaultMessage) + e.message);
        }
        catch (e) {
            alert(c360.LocalizationController.GetLocalization("UnexpectedErrorOccured", defaultMessage));
        }
        c360.BusyIndicator.Hide();
    },
    xmlEncode: function (input) {
        if (input == null) {
            return null;
        }
        if (input == '') {
            return '';
        }

        var c;
        var encodedXml = '';

        for (var cnt = 0; cnt < input.length; cnt++) {
            c = input.charCodeAt(cnt);
            if (((c > 96) && (c < 123)) ||
                     ((c > 64) && (c < 91)) ||
                     (c == 32) ||
                     ((c > 47) && (c < 58)) ||
                     (c == 46) ||
                     (c == 44) ||
                     (c == 45) ||
                     (c == 95)) {
                encodedXml = encodedXml + String.fromCharCode(c);
            }
            else {
                encodedXml = encodedXml + '&#' + c + ';';
            }
        }
        return encodedXml;
    }
};
c360.BusyIndicator = {
    _namespace: true,
    Show: function () {
        if (document.getElementById('msgDiv') == undefined) {
            var newdiv = document.createElement('div');
            newdiv.setAttribute('id', "msgDiv");
            //            newdiv.valign = "middle";
            //            newdiv.align = "center";
            var divInnerHTML = "<table style='cursor:wait'>";
            divInnerHTML += "<tr>";
            divInnerHTML += "<td>";
            divInnerHTML += "<img alt='loading' src='/_imgs/AdvFind/progress.gif'/>";
            divInnerHTML += "<div/>Loading…";
            divInnerHTML += "</td></tr></table>";
            newdiv.innerHTML = divInnerHTML;
            //newdiv.style.background = '#FFFFFF';
            newdiv.style.fontSize = "15px";
            newdiv.style.zIndex = "1010";
            //            newdiv.style.width = document.body.clientWidth;
            //            newdiv.style.height = document.body.clientHeight;
            newdiv.style.position = 'absolute';
            document.body.insertBefore(newdiv, document.body.firstChild);
        }
        document.getElementById('msgDiv').style.visibility = 'visible';
    },
    Hide: function () {
        if (document.getElementById('msgDiv') != undefined)
            document.getElementById('msgDiv').style.visibility = 'hidden';
    }
};

c360.LocalizationController = {};
c360.LocalizationController.LanguageDictionary = null;
c360.LocalizationController.SetLocalization = function (source, languageFileUrl, callback, defaultLanguage) {
    //read xml and put into dictionary   
    try {
        var filePath = "";
        var userLanguage = defaultLanguage ? "1033" : c360.Common.context().getUserLcid();
        if (languageFileUrl) {
            filePath = languageFileUrl + userLanguage + "_" + source + ".xml";
        } else {
            filePath = "../languages/" + userLanguage + "_" + source + ".xml";
        }
        $.ajax({
            type: "GET",
            url: filePath,
            dataType: "xml",
            success: function (xml) {
                parseXML(xml);
                callback();
            },
            error: function (response) {
                OnError(source, languageFileUrl, callback, response);
            }
        });
    } catch (ex) {
        alert("error while reading language xml. Description - " + ex.Description);
        c360.Common.handleError(ex);
    }
    function OnError(source, languageFileUrl, callback, response) {
        if (response.readyState == 4 && response.status == 404) {
            c360.LocalizationController.SetLocalization(source, languageFileUrl, callback, true);
        }
        else {
            alert("Error");
        }
    }
    function parseXML(xml) {
        var dictionary = {};
        try {
            $(xml).find("Token").each(function () {
                dictionary[$(this).attr('key')] = $(this).attr('value');
            });
            c360.LocalizationController.LanguageDictionary = dictionary;
        } catch (ex) {
            c360.Common.handleError(ex);
        }
    }
}

c360.LocalizationController.GetLocalization = function (key, defaultValue) {
    try {
        if (!c360.LocalizationController.LanguageDictionary) return defaultValue || key;
        return c360.LocalizationController.LanguageDictionary[key] ? c360.LocalizationController.LanguageDictionary[key] : defaultValue;

    } catch (ex) {
        c360.Common.handleError(ex);
    }
},

c360.LocalizationController.GetLocalizedHtmlLabels = function () {
    try {
        $(".localizedLabel").each(function (index, value) {
            var id = $(this).attr('id');
            if (id != undefined) {
                if ($(this).prop('nodeName') == "INPUT") {
                    var label = c360.LocalizationController.GetLocalization(id);
                    $(this).val(label);
                }
                else {
                    $(this).html(c360.LocalizationController.GetLocalization(id));
                }
            }
        });
    } catch (ex) {
        c360.Common.handleError(ex);
    }
}

String.format = function () {
    var s = arguments[0];
    for (var i = 0; i < arguments.length - 1; i++) {
        var reg = new RegExp("\\{" + i + "\\}", "gm");
        s = s.replace(reg, arguments[i + 1]);
    }

    return s;
}

c360.Lightbox = {
    _namespace: true,
    Show: function () {
        var width = $(window).width() + 'px';
        var height = $(window).height() + 'px';
        if (document.getElementById('lightboxDiv') == undefined) {
            var newdiv = $('<div>', { 'id': "lightboxDiv", 'style': 'background:none 0px 0px repeat scroll rgba(54, 51, 51, 0.25);font-size:15px;z-index:1010;position:absolute;width:' + width + ';height:' + height });
            //            newdiv.valign = "middle";
            //            newdiv.align = "center";
            var divInnerHTML = "<table style='left:40%;top:45%;position:relative;'>";
            divInnerHTML += "<tr>";
            divInnerHTML += "<td>";
            divInnerHTML += "<img alt='loading' src='/_imgs/AdvFind/progress.gif'/>";
            divInnerHTML += "<div>Loading…</div>";
            divInnerHTML += "</td></tr></table>";
            newdiv.append(divInnerHTML);
            $(document).find('body').prepend(newdiv);
        }
        $('#lightboxDiv').css('width', width).css('height', height);
        document.getElementById('lightboxDiv').style.display = 'block';
    },
    Hide: function () {
        if (document.getElementById('lightboxDiv') != undefined)
            document.getElementById('lightboxDiv').style.display = 'none';
    }
};