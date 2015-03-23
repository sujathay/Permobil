//Check login User has 'System Administrator'/sales manager role
function CheckUserRole() {
    var currentUserRoles = Xrm.Page.context.getUserRoles();
    var notesPrivelegeRoles = GetNotesPrivelegeRole();
    var isEligible = false;
    for (var i = 0; i < currentUserRoles.length; i++) {       
        var userRoleId = currentUserRoles[i];
        var userRoleName = GetLoggedUserRoleName(userRoleId);
        if (!isEligible) {
            if (notesPrivelegeRoles && notesPrivelegeRoles.toLowerCase().indexOf(userRoleName.toLowerCase()) > -1) {
                Xrm.Page.ui.tabs.get("SUMMARY_TAB").sections.get("CustomNoteTab").setVisible(true);
                isEligible = true;
            }
            else {
                Xrm.Page.ui.tabs.get("SUMMARY_TAB").sections.get("CustomNoteTab").setVisible(false);
                isEligible = false;
            }
        }

    }

}

//Get Rolename based on RoleId
function GetLoggedUserRoleName(userRoleId) {
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
            },
            error: function (XmlHttpRequest, textStatus, errorThrown) { alert('OData Select Failed: ' + textStatus + errorThrown + odataSelect); }
        }
    );
    return roleName;
}
//Get Rolename based on RoleId
function GetNotesPrivelegeRole(type) {
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
            },
            error: function (XmlHttpRequest, textStatus, errorThrown) { alert('OData Select Failed: ' + textStatus + errorThrown + odataSelect); }
        }
    );
    return roleName;
}
 