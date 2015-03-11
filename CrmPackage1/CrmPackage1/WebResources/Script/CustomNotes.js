/// <reference path="OData.js" />
if (typeof (Permobil) == "undefined") {
    Permobil = { __namespace: true };
}
if (typeof (Permobil.CustomNotes) == "undefined") {
    Permobil.CustomNotes = new Object();
}
Permobil.CustomNotes = {};
Permobil.CustomNotes.Init = function () {
    /// <signature>
    ///<summary></summary> 
    /// </signature>
    try {
        function success(data) { 
            var data = {
                colNames: ['Name', 'Description', '',''],
                data: data,
                colModel: [
            { name: 'permobil_name', resizable: true, class: "localizedLabel" },
            { name: 'permobil_description', resizable: true, class: "localizedLabel" },
              {
                  name: 'myac', width: 80, fixed: true, sortable: false, resize: false, formatter: 'actions',
                  formatoptions: { keys: true }
              },
            { name: 'permobil_notesId', hidden:true  }, ]
            };
    //var actionObj = [{ "Icon": "../../Portal/img/add.png", "Text": "TEST", "Title": "TITLE", "Handler": Permobil.CustomNotes.Save, "isSelectionReqd": false }];
    var tabobj = {
        gridID: 'notesGrid',
        ht: auto,
        wd: 300,
        dataSource: data,
        PageSize: 10,
        sortBy: 'Displayorder',
        isDesc: false,
        rowDoubleClickHandler: Permobil.CustomNotes.GetNotes,
        RefreshGridHandler: Permobil.CustomNotes.GetNotes,
        CaptionText: null,
        customActionObj: null,
        gridCompleted: Permobil.CustomNotes.GridCompleted,
        onRowDelete: Permobil.CustomNotes.Delete
    };
    Permobil.CustomGrid.createGrid(tabobj);
}
function failure() {
    alert("error");
}
Permobil.OData.retrieveMultipleRecords(Permobil.Settings.NOTES_ENTITY, "$select=*",
   success, failure, function () { });
}
    catch (e) {
        alert(e);
    }
}
Permobil.CustomNotes.GridCompleted = function (grid)
{
    //var ids = grid.jqGrid('getDataIDs');
    //for (var i = 0; i < ids.length; i++) {
    //    var cl = ids[i];
    //    be = "<input style='height:22px;width:20px;' type='button' value='E' onclick=\"jQuery('#notesGrid').editRow('" + cl + "');\"  />";
    //    //se = "<input style='height:22px;width:20px;' type='button' value='S' onclick=\"" + grid + ".saveRow('" + cl + "');\"  />";
    //    //ce = "<input style='height:22px;width:20px;' type='button' value='C' onclick=\"" + grid + ".restoreRow('" + cl + "');\" />";
    //    grid.jqGrid('setRowData', ids[i], { act: be  });
    //}
}
Permobil.CustomNotes.Delete=function(cellvalue, options, rowObject) { 
   
}
Permobil.CustomNotes.Save = function () {
    /// <signature>
    ///<summary></summary> 
    /// </signature>
    try {
        var notesObj = new Object();
        notesObj.permobil_name = $('#txtNotesName').val().trim();
        notesObj.permobil_description = $('#txtDesc').val().trim();
        notesObj.PriceLevelId = $('#txtFileName').val().trim();
        Permobil.OData.createRecord(notesObj, Permobil.Settings.NOTES_ENTITY, function (data) {
            console.log(data);
        }, function (err) {
            alert("error is in notes save:" + err);

        }, function () { });
    } catch (ex) {

    }

}
Permobil.CustomNotes.GetNotes = function () {

}

$(document).ready(function () {
    if (!!navigator.userAgent.match(/Trident.*rv\:11\./))
        $('head').append('<meta http-equiv=X-UA-Compatible content="IE=10"/>');
    Permobil.CustomNotes.Init();
});