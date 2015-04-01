//Check login User has 'System Administrator'/sales manager role
function CheckUserRole() {
    try{
        
        var currentUserRoles = Xrm.Page.context.getUserRoles();
        var notesPrivelegeRoles = GetNotesPrivelegeRole();
        var isEligible = false;
        for (var i = 0; i < currentUserRoles.length; i++) {
            ShowLoading();
            var userRoleId = currentUserRoles[i];
            var userRoleName = GetLoggedUserRoleName(userRoleId);
            if (!isEligible) {
                if (notesPrivelegeRoles && notesPrivelegeRoles.toLowerCase().indexOf(userRoleName.toLowerCase()) > -1) {
                    Xrm.Page.ui.tabs.get("SUMMARY_TAB").sections.get("CustomNoteTab").setVisible(true);
                    isEligible = true;
                     HideLoading();
                }
                else {
                    Xrm.Page.ui.tabs.get("SUMMARY_TAB").sections.get("CustomNoteTab").setVisible(false);
                    isEligible = false;
                    HideLoading();
                }
            }

        }}
    catch (ex)
    {
        HideLoading();
        console.log(ex);
    }

}
 function ShowLoading() {
    if (document.getElementById('msgDiv') == undefined) {
        var newdiv = document.createElement('div');
        newdiv.setAttribute('id', "msgDiv"); 
        var divInnerHTML = "<table style='cursor:wait;height:100%;width:100%; background-color:FFFFFF'>";
        divInnerHTML += "<tr>";
        divInnerHTML += "<td style='vertical-align: middle' align='center'>";
        divInnerHTML += "<img alt='loading' src='/_imgs/AdvFind/progress.gif'/>";
        divInnerHTML += "<div/>Loading…";
        divInnerHTML += "</td></tr></table>";
        newdiv.innerHTML = divInnerHTML; 
        newdiv.style.fontSize = "15px";
        newdiv.style.zIndex = "1010"; 
        newdiv.style.position = 'absolute';
        newdiv.style.width = '100%';
        document.body.insertBefore(newdiv, document.body.firstChild);
    }
   // <div style="width: 100%; height: 100%; position: absolute; display: none;"> 
    document.getElementById('msgDiv').style.visibility = 'visible';
}
 function HideLoading() {
    if (document.getElementById('msgDiv') != undefined)
        document.getElementById('msgDiv').style.visibility = 'hidden';
}

//Get Rolename based on RoleId
 function GetLoggedUserRoleName(userRoleId) {
     ShowLoading();
    var odataSelect = Xrm.Page.context.getClientUrl() + "/XRMServices/2011/OrganizationData.svc" + "/" + "RoleSet?$filter=RoleId eq guid'" + userRoleId + "'";
    var roleName = null;
    $.ajax(
        {
            type: "GET",
            async: false,
            contentType: "application/json; charset=utf-8",
            datatype: "json",
            url: odataSelect,
            beforeSend: function (XMLHttpRequest) { XMLHttpRequest.setRequestHeader("Accept", "application/json"); },
            success: function (data, textStatus, XmlHttpRequest) {
                roleName = data.d.results[0].Name;
                HideLoading();
            },
            error: function (XmlHttpRequest, textStatus, errorThrown) { alert('OData Select Failed: ' + textStatus + errorThrown + odataSelect); HideLoading(); }
        }
    );
    return roleName;
}
//Get Rolename based on RoleId
 function GetNotesPrivelegeRole(type) {
     ShowLoading();
    var odataSelect = Xrm.Page.context.getClientUrl() + "/XRMServices/2011/OrganizationData.svc" + "/" + "permobil_settingsSet?$select=permobil_value&filter=permobil_key eq 'Notes Roles'";
    var roleName = null;
    $.ajax(
        {
            type: "GET",
            async: false,
            contentType: "application/json; charset=utf-8",
            datatype: "json",
            url: odataSelect,
            beforeSend: function (XMLHttpRequest) { XMLHttpRequest.setRequestHeader("Accept", "application/json"); },
            success: function (data, textStatus, XmlHttpRequest) {
                roleName = data.d.results[0].permobil_value;
                HideLoading();
            },
            error: function (XmlHttpRequest, textStatus, errorThrown) { alert('OData Select Failed: ' + textStatus + errorThrown + odataSelect); HideLoading(); }
        }
    );
    return roleName;
}
 