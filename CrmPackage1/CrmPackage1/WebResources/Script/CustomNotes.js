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
            var objTab = [{ "Name": 'test', "Desc": "test123" }];
            var data = {
                colNames: ['Name', 'Description', ],
                data: data,
                colModel: [
            { name: 'permobil_name', resizable: true, class: "localizedLabel" },
            { name: 'permobil_description', resizable: true, class: "localizedLabel" }]
            };

            var tabobj = {
                gridID: 'notesGrid',
                ht: 300,
                wd: 1000,
                dataSource: data,
                PageSize: 10,
                sortBy: 'Displayorder',
                isDesc: false,
                rowDoubleClickHandler: Permobil.CustomNotes.GetNotes,
                RefreshGridHandler: Permobil.CustomNotes.GetNotes,
                CaptionText: null,
                customActionObj: null,
                fetchQuery: Permobil.CustomNotes.GetNotes
            };
            Permobil.CustomGrid.createGrid(tabobj);
        }
        function failure()
        {
            alert("error");
        }
        Permobil.CRMMetaDataService.RetrieveEntity("permobil_notes", function (data) { success(data); }, function (data) { failure(data); })
    }
    catch (e) {
        alert(e);
    }
}
Permobil.CustomNotes.GetNotes = function () {

}

$(document).ready(function () {
    if (!!navigator.userAgent.match(/Trident.*rv\:11\./))
        $('head').append('<meta http-equiv=X-UA-Compatible content="IE=10"/>');
    Permobil.CustomNotes.Init();
});