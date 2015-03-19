/// <reference path="XrmPageTemplate.js" />

if (typeof (Permobil) == "undefined") {
    Permobil = { __namespace: true };
}

Permobil.Common = {
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
    GetDataParam: function () {
        /// <signature>
        ///<summary>Get the any query string parameters and load them into the vals array</summary>
        /// </signature>    
        var parseDataValue = function (datavalue) {
            var result = new Array();
            if (datavalue != "") {
                result = decodeURIComponent(datavalue).split("&");
                for (var i in result) {
                    result[i] = result[i].replace(/\+/g, " ").split("=");
                }
            }
            return result;
        };

        var vals = new Array();

        if (location.search != "") {
            vals = location.search.substr(1).split("&");
            for (var i in vals) {
                vals[i] = vals[i].replace(/\+/g, " ").split("=");
            }
            //look for the parameter named 'data'
            var found = false;
            for (var i in vals) {
                if (vals[i][0].toLowerCase() == "data") {
                    return parseDataValue(vals[i][1]);
                }
            }
        }

        return null;
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

            alert(e.message);
        }
        catch (e) {
            alert(e);
        }
        Permobil.BusyIndicator.Hide();
    },
    formatDate: function (d) {
        /// <summary>Formats the Date object like 'MM/dd/yyyy'.</summary>  
        var day = d.getDate();
        var mon = d.getMonth();
        var yr = d.getFullYear();
        return ((mon + 1) < 10 ? '0' + (mon + 1) : (mon + 1)) + '/' + (day < 10 ? '0' + day : day) + '/' + yr;
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
Permobil.BusyIndicator = {
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



String.format = function () {
    var s = arguments[0];
    for (var i = 0; i < arguments.length - 1; i++) {
        var reg = new RegExp("\\{" + i + "\\}", "gm");
        s = s.replace(reg, arguments[i + 1]);
    }

    return s;
}

Permobil.Lightbox = {
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