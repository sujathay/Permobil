//Check login User has 'System Administrator'/sales manager role
function CheckUserRole() {
    var currentUserRoles = Xrm.Page.context.getUserRoles();
    var isEligible = false;
    for (var i = 0; i < currentUserRoles.length; i++) {       
        var userRoleId = currentUserRoles[i];
        var userRoleName = GetRoleName(userRoleId);
        if (!isEligible) {
            if (userRoleName == "System Administrator" || userRoleName == "Sales Manager") {
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
function GetRoleName(roleId) {
    var odataSelect = Xrm.Page.context.getClientUrl() + "/XRMServices/2011/OrganizationData.svc" + "/" + "RoleSet?$filter=RoleId eq guid'" + roleId + "'";
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