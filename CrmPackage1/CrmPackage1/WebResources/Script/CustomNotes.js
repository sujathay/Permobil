/// <reference path="OData.js" />
if (typeof (Permobil) == "undefined") {
    Permobil = { __namespace: true };
}
if (typeof (Permobil.CustomNotes) == "undefined") {
    Permobil.CustomNotes = new Object();
}
Permobil.CustomNotes = {};
Permobil.CustomNotes.lastSelectedRow = null;
Permobil.CustomNotes.annotationList = [];
Permobil.CustomNotes.EncodedFileBody = "";
Permobil.CustomNotes.CurrentAnnotationID = "";
Permobil.CustomNotes.CurrentNotesID = "";

Permobil.CustomNotes.selectedAccID = "DD8D7040-2FC4-E411-80DF-C4346BADA664";
Permobil.CustomNotes.Init = function () {
    /// <signature>
    ///<summary></summary> 
    /// </signature>
    try {
        Permobil.BusyIndicator.Show();
        Permobil.CustomNotes.GetNotes();
    }
    catch (e) {
        alert(e);
    }
}
Permobil.CustomNotes.Notes = function () {
    filename: "";
    annotationid: "";
    notetext: "";
    subject: "";
    notes_desc: '';
    notes_name: '';
    notes_id: '';
    modifiedby: '';
    modifiedon: '';
    modifieduserGuid: '';
    permobil_accountid: '';
    permobil_accountName: '';
}
Permobil.CustomNotes.GetNotesSuccess = function success() {
    try {
        var data = {
            colNames: ['Title', 'Description', 'Attachment', 'Modified By', '', '', '',''],
            data: Permobil.CustomNotes.annotationList,
            colModel: [
                { name: 'notes_name', resizable: true, editable: true },
                { name: 'notes_desc', resizable: true, editable: true },
                {
                    //name: 'filename', editable: true, edittype: 'file',
                    //editoptions: {
                    //    enctype: "multipart/form-data"
                    //}
                    name: 'filename',
                    index: 'notes_id',
                    align: 'left',
                    editable: true,
                    edittype: 'file',
                    editoptions: {
                        enctype: "multipart/form-data"
                    }, 
                    align: 'center'
                },
                {
                    name: 'modifiedby', resizable: true, editable: false, formatter: 'showlink',
                    formatoptions: {
                        baseLinkUrl: 'javascript:', showAction: "Permobil.CustomNotes.openUserPage('", addParam: "');"
                    }
                },
                { name: 'notes_id', hidden: true },
                { name: 'modifiedby', hidden: true },
                { name: 'modifiedon', hidden: true },
                { name: 'annotationid', hidden: true }]
        };
        var notesobj = {
            gridID: 'notesGrid',
            ht: auto,
            wd: 800,
            dataSource: data,
            PageSize: 10,
            sortBy: 'permobil_name',
            isDesc: false,
            //rowDoubleClickHandler: Permobil.CustomNotes.GetNotes,
            RefreshGridHandler: Permobil.CustomNotes.GetNotes,
            CaptionText: null,
            customActionObj: null,
            gridCompleted: Permobil.CustomNotes.GridCompleted,
            onRowDelete: Permobil.CustomNotes.Delete
        };
        Permobil.CustomGrid.createGrid(notesobj);
        Permobil.BusyIndicator.Hide();
    } catch (ex) {
        console.log(ex);
    }
}
Permobil.CustomNotes.formatData = function (cellValue, option, rowObject) {
    return '<a  onclick="Permobil.CustomNotes.openUserPage()"  value="' + rowObject["label"] + '">' + rowObject["modifiedby"] + '</>';
}
Permobil.CustomNotes.GetNotesFailure = function failure() {
    alert("error");
}
Permobil.CustomNotes.GridCompleted = function (grid) {
 //   $('.ui-jqgrid-hdiv').hide();
}
Permobil.CustomNotes.Delete = function (cellvalue, options, rowObject) {
    try {

    } catch (ex) {
        console.log(ex);
    }
}
Permobil.CustomNotes.openUserPage = function (id) {
    /// <summary>open CRM user view</summary>   
    /// <param name="e" type="event">Javascript Event</param> 
    try {
        //var row = id.split("=");
        var row_ID = id.split("=")[1];
        var userid = $("#notesGrid").getCell(row_ID, 'modifieduserGuid');
        window.open(Permobil.Common.getClientUrl() + '/main.aspx?etn=systemuser&extraqs=&histKey=647827476&id={' + userid + '}&newWindow=true&pagetype=entityrecord', '', 'status=0,resizable=1,width=1000px,height=600px');
    } catch (ex) {
        console.log(ex);
    }
}
Permobil.CustomNotes.handleFileSelect = function (evt) {
    var file = evt.files[0];

    if (file) {
        var reader = new FileReader();

        reader.onload = function (readerEvt) {
            var binaryString = readerEvt.target.result;
            Permobil.CustomNotes.EncodedFileBody = btoa(binaryString);
        };

        reader.readAsBinaryString(file);
    }
}
Permobil.CustomNotes.Save = function () {
    /// <signature>
    ///<summary></summary> 
    /// </signature>
    try {
        
        var notesObj = new Object();
        notesObj.permobil_name = $('#txtNotesName').val().trim();
        notesObj.permobil_description = $('#txtDesc').val().trim();
        notesObj.permobil_AccountId = { Id: Permobil.CustomNotes.selectedAccID, LogicalName: "account" };
        if ($('#txtNotesName').val().trim().length > 0 || $('#txtDesc').val().trim().length > 0 || $('#txtFileName').val().trim().length > 0)
        { Permobil.BusyIndicator.Show(); Permobil.CustomNotes.SaveData(notesObj); }
        else {

        }
    } catch (ex) {
        console.log(ex);
    }

}
Permobil.CustomNotes.SaveData = function (notesObj) {
    Permobil.OData.createRecord(notesObj, Permobil.Settings.NOTES_ENTITY, function (data) {
        Permobil.CustomNotes.SaveFile(data);
    }, function (err) {
        alert("error is in notes save:" + err);

    }, function () { });
}
Permobil.CustomNotes.SaveFile = function (data) {
    var annotationObj = new Object();
    annotationObj.DocumentBody = Permobil.CustomNotes.EncodedFileBody;
    annotationObj.FileName = $('#txtFileName').val().trim().replace(/C:\\fakepath\\/i, '');
    annotationObj.ObjectId = { Id: data.permobil_notesId, LogicalName: "permobil_notes", Name: null };
    Permobil.OData.createRecord(annotationObj, Permobil.Settings.ANNOTATION_ENTITY, function (data) {
        Permobil.CustomNotes.GetNotes();
    }, function (err) {
        alert("error is in notes save:" + err);

    }, function () { });
}
Permobil.CustomNotes.UpdateNotes = function (data,id) {
    var Rowdata = jQuery("#notesGrid").getRowData(id);
    var notesObj = new Object();
    notesObj.permobil_name = data.notes_name;
    notesObj.permobil_description = data.notes_desc;
    Permobil.CustomNotes.CurrentNotesID = Rowdata.notes_id;
    Permobil.CustomNotes.CurrentAnnotationID = Rowdata.annotationid;
    Permobil.OData.updateRecord(Rowdata.notes_id, notesObj, Permobil.Settings.NOTES_ENTITY, function (data) {
        //Permobil.CustomNotes.UpdateFile();
    }, function (err) {
        alert("error is in notes save:" + err);

    }, function () { });
}

Permobil.CustomNotes.UpdateFile = function () {
    var annotationObj = new Object();
    annotationObj.DocumentBody = Permobil.CustomNotes.EncodedFileBody;
    annotationObj.FileName = $('#txtFileName').val().trim().replace(/C:\\fakepath\\/i, '');
    annotationObj.ObjectId = { Id: Permobil.CustomNotes.CurrentNoteID, LogicalName: "permobil_notes", Name: null };
    //if(Permobil.CustomNotes.CurrentAnnotationID.length>34 &&  
    Permobil.OData.updateRecord(Permobil.CustomNotes.CurrentAnnotationID, annotationObj, Permobil.Settings.ANNOTATION_ENTITY, function (data) {
        Permobil.CustomNotes.GetNotes();
    }, function (err) {
        alert("error is in notes save:" + err);

    }, function () { });
}
Permobil.CustomNotes.GetNotes = function () {
    try {
        var getNotes = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='true' >" +
            "<entity name='permobil_notes' >" +
            "<attribute name='permobil_name' /><attribute name='permobil_description' /><attribute name='permobil_notesid' /> <attribute name='modifiedby' /> <attribute name='modifiedon'/> " +
            "<attribute name='permobil_accountid' />" +
            "<order attribute='permobil_name' descending='false' />" +
            "<filter type='and'>" +
            "<condition attribute='permobil_accountid' operator='eq'   value='{" + Permobil.CustomNotes.selectedAccID + "}' />" +
            "</filter>" +
            "<link-entity name='annotation' from='objectid' to='permobil_notesid' alias='ab'  link-type='outer'>" +
            "<attribute name='filename' /><attribute name='annotationid' /><attribute name='notetext' /><attribute name='subject' /> " +
            "</link-entity></entity></fetch>";
        Permobil.SOAP.ExecuteFetchXML(getNotes, function (resp) { Permobil.CustomNotes.ParseFetchResponse(resp); },
            function () { alert("failed"); },
            function () { });
    } catch (ex) {
        console.log(ex);
    }
}
Permobil.CustomNotes.ParseFetchResponse = function (FetchResult) {
    /// <summary>Parses the fetch response to create the product collection array.</summary>
    /// <param name="FetchResult" type="string">fetch xml string.</param>
    /// <param name="FQ_Attr" type="object">fetch xml condition attributes.</param>
    /// <param name="productItemCollection" type="object">object that products for which the related products is fetched.</param>
    try {

        $.each($(FetchResult).find("a\\:Entities ,Attributes"), function (j, it) {
            var item = new Permobil.CustomNotes.Notes();
            $.each($(this).find("a\\:Attributes ,KeyValuePairOfstringanyType"), function (i, it2) {
                switch ($(this).find("b\\:value a\\:Value ,key").text()) {
                    case "ab.filename":
                        item.filename = $(this).find("b\\:value ,Value").text();
                        break;
                    case "ab.annotationid":
                        item.annotationid = $(this).find("b\\:value ,Value").text();
                        break;
                    case "ab.notetext":
                        item.notetext = $(this).find("b\\:value ,Value").text();
                        break;
                    case "ab.subject":
                        item.subject = $(this).find("b\\:value ,Value").text();
                        break;
                    case "permobil_name":
                        item.notes_name = $(this).find("b\\:value a\\:Value ,value").text();
                        break;
                    case "permobil_description":
                        item.notes_desc = $(this).find("b\\:value a\\:Value ,value").text();
                        break;
                    case "permobil_notesid":
                        item.notes_id = $(this).find("b\\:value a\\:Value ,value").text();
                        break;
                    case "modifiedby":
                        item.modifiedby = $(this).find("b\\:value a\\:Value ,value").text().substring(45, $(this).find("b\\:value a\\:Value ,value").text().length - 1);
                        item.modifieduserGuid = $(this).find("b\\:value a\\:Value ,value").text().substring(0, 36);
                        break;
                    case "modifiedon":
                        item.modifiedon = $(this).find("b\\:value a\\:Value ,value").text();
                        break;
                    case "permobil_accountid":
                        item.permobil_accountid = $(this).find("b\\:value a\\:Value ,value").text();
                        break;
                }

            });
            Permobil.CustomNotes.annotationList.push({
                'filename': (item.filename) ? item.filename : '',
                'annotationid': (item.annotationid) ? item.annotationid : '',
                'notetext': (item.notetext) ? item.notetext : '',
                'subject': (item.subject) ? item.subject : '',
                'notes_desc': (item.notes_desc) ? item.notes_desc : '',
                'notes_name': (item.notes_name) ? item.notes_name : '',
                'notes_id': (item.notes_id) ? item.notes_id : '',
                'permobil_accountid': (item.permobil_accountid) ? item.permobil_accountid : '',
            });
        });
        $('#txtNotesName').val("");
        $('#txtDesc').val("");
        $('#txtFileName').val("");
        Permobil.CustomNotes.GetNotesSuccess();
    }
    catch (ex) {
        console.log(ex);
    }
}

$(document).ready(function () {
    if (!!navigator.userAgent.match(/Trident.*rv\:11\./))
        $('head').append('<meta http-equiv=X-UA-Compatible content="IE=10"/>');
    Permobil.CustomNotes.Init();
});