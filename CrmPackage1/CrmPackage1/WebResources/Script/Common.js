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
Permobil.ConfirmBox = {
    __namespace: true,
    code: '#confirmOverlay{width: 240px;    height: auto;z-index: 950;overflow: hidden;top: 136px;left: 22px;display: block;}#confirmBox{background:#f8fcf8;position:fixed;left:50%;top:50%;margin:-130px 0 0 -230px;box-shadow:0 0 1em #000;border:1px solid #D6D6D6;min-width: 500px;font-family: Segoe UI Light, Segoe UI, Tahoma, Arial;padding:1%;}#confirmBox #confirmClose{display:inline-block;text-align:right;position:absolute;right:1%;top:5%;font-size:16px;cursor:pointer}#confirmBox #confirmClose img{ width:16px;height:16px}#confirmBox h1 span{font-size:12px;color:#666666;font-weight:normal;}#confirmBox h1{font-weight:lighter;font-size:27px;color:#262626;padding:0 30px;line-height: 20px;}#confirmBox p{background:0 0;font-size:11px;line-height:1.4;color:#444444;padding:0 30px;margin-bottom:45px}#confirmButtons{padding:7px 30px 5px 0;text-align:right;background-color:#F7F7F7}#confirmBox .button{display:inline-block;background:#F8F8F8;color:#000;position:relative;height:25px;margin-right:15px;padding:0 5px;width:88px;text-decoration:none;border:1px solid #8f8f8f}#confirmBox .button:hover:enabled{background-color:#B1D6F0}#confirmBox .button:last-child{margin-right:0}#confirmBox .button span{position:absolute;top:0;right:-5px;width:5px;height:33px}#confirmBox .blue{background-position:left top;text-shadow:1px 1px 0 #5889a2}#confirmBox .blue span{background-position:-195px 0}#confirmBox .blue:hover{background-position:left bottom}#confirmBox .blue:hover span{background-position:-195px bottom}#confirmBox .gray{background-position:-200px top;text-shadow:1px 1px 0 #707070}#confirmBox .gray span{background-position:-395px 0}#confirmBox .gray:hover{background-position:-200px bottom}#confirmBox .gray:hover span{background-position:-395px bottom}.progress-label{position:absolute;left:38%;top:4px;font-weight:700;text-shadow:1px 1px 0 #fff}',
    insertCss: function () {
        try { 
            var style = document.createElement('style');
            style.type = 'text/css';
            if (style.styleSheet) {
                // IE
                style.styleSheet.cssText = this.code.replace('[]', Permobil.Common.getClientUrl() + '/').replace('[]', Permobil.Common.getClientUrl() + '/');
            } else {
                // Other browsers
                style.innerHTML = this.code.replace('[]', Permobil.Common.getClientUrl() + '/').replace('[]', Permobil.Common.getClientUrl() + '/');
            }

            document.getElementsByTagName("head")[0].appendChild(style);
        }
        catch (e) {
            console.log(e);
        }
    },
    Show: function (confirmAction, cancelAction, title, message) {
        
        Permobil.ConfirmBox.insertCss();
        $.confirm({
            'title': title,
            'message': message,
            'buttons': {
                'Delete': {
                    'class': 'submit-btn',
                    'text':"Ok",
                    'action': function () {
                        $('div').attr('class', 'ui-widget-overlay')
                        $('#Activateconfirm').attr('disabled', 'disabled').css('border', '1px solid rgb(172, 172, 172)');
                        $('#confirmBox p').html('<div id="progressbar"><div class="progress-label"></div></div>');
                        $.confirm.hide();
                        confirmAction();
                    }
                },
                'Cancel': {
                    'class': 'submit-btn',
                    'text': "Cancel",
                    'action': function () {
                        $.confirm.hide();
                        cancelAction();
                    }
                }
            }
        });
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

 