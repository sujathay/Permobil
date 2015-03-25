
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
Permobil.CustomNotes.Uploader = "";
Permobil.CustomNotes.GridUploader = "";
Permobil.CustomNotes.FiletobeDeleted = "";
Permobil.CustomNotes.selectedAccID = parent.Xrm.Page.data.entity.getId().replace("{", "").replace("}", "");
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
Permobil.CustomNotes.hoverTitle = function () {
    if (event.keyCode == 46 || event.keyCode == 127) {
        var domEvent = new Sys.UI.DomEvent(event); domEvent.stopPropagation();
    } else if (event.keyCode == 13 && event.shiftKey) {
        alert('dfd');
        return false;
    } else if (event.keyCode == 9) { alert('cancel'); }
}
Permobil.CustomNotes.formatGridDisplay = function (cellvalue, options, rowObject) { // format the cellvalue to new format
    var inlineDelete = (rowObject["annotationid"] && rowObject["annotationid"].length == 36) ? ('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<img id=' + rowObject["annotationid"] + '  onclick="Permobil.CustomNotes.DeleteFile(this)" src="../img/delete.png"> </div>') : ' ';
    var filelink = (rowObject["annotationid"] && rowObject["annotationid"].length == 36) ? ('<div class="attachments"><img width="16" height="16" src="../img/attach.png" />&nbsp;&nbsp;<a class="filelink" id=' + rowObject["annotationid"] + '   onclick="Permobil.CustomNotes.DownloadAttachment(this)"   target="_blank" >' + rowObject["filename"] + '</a>') : "";
    var new_formated_cellvalue = '<h2>' + rowObject["notes_name"] + '</h2> <p>' + rowObject["notes_desc"] + '</p>' +
    filelink + inlineDelete +
    '<a class="links" id=' + rowObject["modifieduserGuid"] + '  onclick="Permobil.CustomNotes.openUserPage(this)" >' + rowObject["modifiedby"] + '</a> '
    + ' - <span class="timer">' + rowObject["modifiedon"] + ' </span>';
    return new_formated_cellvalue;
}
Permobil.CustomNotes.DeleteFile = function (annotation) {
    Permobil.CustomNotes.FiletobeDeleted = annotation;
    $("#ConfirmDeleteFileOverLay").show();
    $("#ConfirmDeleteFile").show();
}
Permobil.CustomNotes.DeleteFiles = function () {
    $("#ConfirmDeleteFile").hide();
    $("#ConfirmDeleteFileOverLay").hide();
    Permobil.BusyIndicator.Show();
    Permobil.OData.deleteRecord(Permobil.CustomNotes.FiletobeDeleted.id, Permobil.Settings.ANNOTATION_ENTITY, function () {
        Permobil.CustomNotes.GetNotes();
    }, function (err) {
        Permobil.BusyIndicator.Hide();
        console.log(err);
    });
}

Permobil.CustomNotes.DownloadAttachment = function (file) {
    try {
        var noteId = $(this).attr("id");
        window.open(Permobil.Common.getClientUrl() + "/WebResources/Permobil_/htm/PM_OpenDocs.htm?data=noteId%3d" + file.id);
    } catch (ex) {
        alert(ex);
    }
}
Permobil.CustomNotes.GetNotesSuccess = function success() {
    try {
        var data = {
            colNames: ['Title', '', '', '', '', '', '', '', ''],
            data: Permobil.CustomNotes.annotationList,
            colModel: [
                {
                    name: 'formatted', width: 90, resizable: true, editable: false,
                    formatter: Permobil.CustomNotes.formatGridDisplay
                }, {
                    name: 'actions', index: 'actions', formatter: 'actions',
                    width: 10,
                    formatoptions: {
                        keys: true,
                        editbutton: false,
                        delOptions: {
                            afterShowForm: function (form) {
                                $("#dData").removeClass();
                                $("#dData").addClass("submit-btn");
                                $("#eData").removeClass();
                                $("#eData").addClass("submit-btn");
                            },
                            delicon: 'delicon',
                            msg: 'Are you sure want to delete this note?',
                            beforeSubmit: function (id) {
                                Permobil.CustomNotes.Delete(id);
                                return "1";
                            }
                        }
                    }
                },
                { name: 'notes_name', hidden: true, editable: true },
                { name: 'notes_desc', hidden: true, editable: true, edittype: 'textarea', editoptions: { rows: "5", cols: "10" } },
                { name: 'notes_id', hidden: true },
                { name: 'modifiedby', hidden: true },
                { name: 'modifiedon', hidden: true },
                { name: 'annotationid', hidden: true },
                { name: 'modifieduserGuid', hidden: true }, ]
        };
        var notesobj = {
            gridID: 'notesGrid',
            ht: auto,
            width: null,
            shrinkToFit: false,
            dataSource: data,
            PageSize: 5,
            sortBy: 'permobil_name',
            isDesc: false,
            RefreshGridHandler: Permobil.CustomNotes.GetNotes,
            CaptionText: null,
            customActionObj: null,
            gridCompleted: Permobil.CustomNotes.GridCompleted,
            onRowDelete: Permobil.CustomNotes.Delete,
            rowDoubleClickHandler: Permobil.CustomNotes.OpenEditForm
        };
        Permobil.CustomGrid.createGrid(notesobj);
        Permobil.BusyIndicator.Hide();
    } catch (ex) {
        console.log(ex);
    }
}
Permobil.CustomNotes.CreateFileInput = function () {
    Permobil.CustomNotes.GridUploader = new FileAppender("uploader", {}, function (Data) { console.log(Data) });
}
Permobil.CustomNotes.OpenEditForm = function () {
    var gr = jQuery("#notesGrid").jqGrid('getGridParam', 'selrow');
    if (gr != null)
        jQuery("#notesGrid").jqGrid('editGridRow', gr, {
            height: 225,
            width: 425,
            reloadAfterSubmit: false,
            editCaption: "Edit Notes",
            recreateForm: true,
            processData: "Saving...",
            closeAfterEdit: true,
            beforeShowForm: function (form) {

                var gridUploaderID = 'tdGridUploader' + $("#id_g").val();
                $('<tr style="" rowpos="3" class="FormData" id="tr_filename"><td class="CaptionTD"></td><td id="' + gridUploaderID + '" class="DataTD"> </td></tr>')
                .insertAfter($("#tr_notes_desc"));
                Permobil.CustomNotes.GridUploader = new FileAppender(gridUploaderID, {}, function (Data) { console.log(Data) });
                $("tr#tr_notes_desc").show();
                $("tr#tr_notes_name").show();
                $("tr#tr_formatted").hide();
                $(".navButton").hide();
                $("#sData").removeClass();
                $("#sData").addClass("submit-btn");
                $("#cData").removeClass();
                $("#cData").addClass("submit-btn");
            },
            afterclickPgButtons: function (whichbutton, form, rowid) {
                $("tr#tr_notes_desc").show();
                $("tr#tr_notes_name").show();
                $("tr#tr_filename").show();
                $("tr#tr_formatted").hide();
                $(".navButton").hide();
                $("#sData").removeClass();
                $("#sData").addClass("submit-btn");
                $("#cData").removeClass();
                $("#cData").addClass("submit-btn");
            },
            beforeSubmit: function (id, rowid, options) {
                Permobil.CustomNotes.UpdateNotes(id);
                return "1";
            }
        });
}
Permobil.CustomNotes.formatData = function (cellValue, option, rowObject) {
    return '<a  onclick="Permobil.CustomNotes.openUserPage()"  value="' + rowObject["label"] + '">' + rowObject["modifiedby"] + '</>';
}
Permobil.CustomNotes.GetNotesFailure = function failure() {
    alert("error");
}
Permobil.CustomNotes.GridCompleted = function (grid) {
    $('.ui-jqgrid-hdiv').hide();
}
Permobil.CustomNotes.Delete = function (id) {
    try {
        Permobil.BusyIndicator.Show();
        var Rowdata = jQuery("#notesGrid").getRowData(id);
        // delete notes entity
        Permobil.OData.deleteRecord(Rowdata.notes_id, Permobil.Settings.NOTES_ENTITY, function () {
            if (Rowdata.annotationid && Rowdata.annotationid.length == 36) {
                Permobil.OData.deleteRecord(Rowdata.annotationid, Permobil.Settings.ANNOTATION_ENTITY, function () {
                    Permobil.CustomNotes.GetNotes();
                }, function (err) {
                    Permobil.BusyIndicator.Hide();
                    console.log(err);
                });
            }
            else { Permobil.CustomNotes.GetNotes(); console.log("ther is no file to delete"); }
        }, function (err) {
            Permobil.BusyIndicator.Hide();
            console.log(err);
        });
    } catch (ex) {
        console.log(ex);
    }
}
Permobil.CustomNotes.openUserPage = function (userid) {
    /// <summary>open CRM user view</summary>   
    /// <param name="userid" type="string">Last modified userid</param> 
    try {
        window.parent.parent.Xrm.Utility.openEntityForm("systemuser", userid.id);
    } catch (ex) {
        console.log(ex);
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
        if ($('#txtNotesName').val().trim().length > 0 || $('#txtDesc').val().trim().length > 0 || $('#btnEvidenceUploader').val().trim().length > 0)
        { Permobil.BusyIndicator.Show(); Permobil.CustomNotes.SaveData(notesObj); }
        else {

        }
    } catch (ex) {
        console.log(ex);
    }

}
Permobil.CustomNotes.SaveData = function (notesObj) {
    Permobil.OData.createRecord(notesObj, Permobil.Settings.NOTES_ENTITY, function (data) {
        if ($('#btnEvidenceUploader').val().trim().length > 0) {
            Permobil.CustomNotes.SaveFile(data);
        } else { Permobil.CustomNotes.GetNotes(); }
    }, function (err) {
        alert("error is in notes save:" + err);

    }, function () { });
}
Permobil.CustomNotes.SaveFile = function (data) {

    Permobil.CustomNotes.Uploader.GetFile(successFile);
    function successFile(file) {
        if (file) {
            var annotationObj = new Object();
            annotationObj.DocumentBody = file.fileData;
            annotationObj.FileName = file.fileName;
            annotationObj.NoteText = "Notes Attachment " + file.fileName;
            annotationObj.Subject = "Notes Attachment " + file.fileName;
            annotationObj.FileName = file.fileName;
            annotationObj.MimeType = file.mimeType;
            annotationObj.ObjectId = { Id: data.permobil_notesId, LogicalName: "permobil_notes", Name: null };
            Permobil.OData.createRecord(annotationObj, Permobil.Settings.ANNOTATION_ENTITY, function (data) {
                Permobil.CustomNotes.GetNotes();
            }, function (err) {
                alert("error is in notes save:" + err);

            }, function () { });
        }
    }
}
Permobil.CustomNotes.UpdateNotes = function (data) {
    var Rowdata = jQuery("#notesGrid").getRowData(data.notesGrid_id);
    var notesObj = new Object();
    notesObj.permobil_name = data.notes_name;
    notesObj.permobil_description = data.notes_desc;
    Permobil.CustomNotes.CurrentNotesID = Rowdata.notes_id;
    Permobil.CustomNotes.CurrentAnnotationID = Rowdata.annotationid;
    Permobil.OData.updateRecord(Rowdata.notes_id, notesObj, Permobil.Settings.NOTES_ENTITY, function (data) {
        Permobil.CustomNotes.UpdateFile();
    }, function (err) {
        alert("error is in notes save:" + err);

    }, function () { });
}

Permobil.CustomNotes.UpdateFile = function () {
    Permobil.CustomNotes.GridUploader.GetFile(successFile);
    function successFile(file) {
        if (file) {
            var annotationObj = new Object();
            annotationObj.DocumentBody = file.fileData;
            annotationObj.FileName = file.fileName;
            annotationObj.NoteText = "Notes Attachment " + file.fileName;
            annotationObj.Subject = "Notes Attachment " + file.fileName;
            annotationObj.FileName = file.fileName;
            annotationObj.MimeType = file.mimeType;
            annotationObj.ObjectId = { Id: Permobil.CustomNotes.CurrentNotesID, LogicalName: "permobil_notes", Name: null };
            if (Permobil.CustomNotes.CurrentAnnotationID.length == 36) {//if file already there            
                Permobil.OData.updateRecord(Permobil.CustomNotes.CurrentAnnotationID, annotationObj, Permobil.Settings.ANNOTATION_ENTITY, function (data) {
                    Permobil.CustomNotes.GetNotes();
                }, function (err) {
                    alert("error is in notes save:" + err);

                }, function () { });
            } else {

                Permobil.OData.createRecord(annotationObj, Permobil.Settings.ANNOTATION_ENTITY, function (data) {
                    Permobil.CustomNotes.GetNotes();
                }, function (err) {
                    alert("error is in notes save:" + err);

                }, function () { });
            }
        }
        else { Permobil.CustomNotes.GetNotes(); }
    }
}
Permobil.CustomNotes.GetNotes = function () {
    try {
        $("#notesGrid").empty();
        var getNotes = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='true' >" +
            "<entity name='permobil_notes' >" +
            "<attribute name='permobil_name' /><attribute name='permobil_description' /><attribute name='permobil_notesid' /> <attribute name='modifiedby' /> <attribute name='modifiedon'/> " +
            "<attribute name='permobil_accountid' />" +
            "<order attribute='modifiedon' descending='true' />" +
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
    /// <summary>Parses the fetch response to create the notes array collection.</summary>
    /// <param name="FetchResult" type="string">fetch xml string.</param> 
    try {
        Permobil.CustomNotes.annotationList.length = 0;
        $.each($(FetchResult).find("a\\:Entities a\\:Entity ,Attributes"), function (j, it) {
            var item = new Permobil.CustomNotes.Notes();
            $.each($(this).find("a\\:KeyValuePairOfstringanyType,KeyValuePairOfstringanyType"), function (i, it2) {
                switch ($(this).find("b\\:key ,key").text()) {
                    case "ab.filename":
                        item.filename = $(this).find("b\\:value a\\:Value, Value").text();
                        break;
                    case "ab.annotationid":
                        item.annotationid = $(this).find("b\\:value a\\:Value, Value").text();
                        break;
                    case "ab.notetext":
                        item.notetext = $(this).find("b\\:value a\\:Value, Value").text();
                        break;
                    case "ab.subject":
                        item.subject = $(this).find("b\\:value a\\:Value, Value").text();
                        break;
                    case "permobil_name":
                        item.notes_name = $(this).find("b\\:value,value").text();
                        break;
                    case "permobil_description":
                        item.notes_desc = $(this).find("b\\:value,value").text();
                        break;
                    case "permobil_notesid":
                        item.notes_id = $(this).find("b\\:value,value").text();
                        break;
                    case "modifiedby":
                        item.modifiedby = $(this).find("b\\:value,value").text().substring(46, $(this).find("b\\:value,value").text().length);
                        item.modifieduserGuid = $(this).find("b\\:value,value").text().substring(0, 36);
                        break;
                    case "modifiedon":
                        item.modifiedon = new Date(Date.parse(($(this).find("b\\:value,value").text()), 'MM-dd-yyyy HH:mm')).toLocaleString();
                        break;
                    case "permobil_accountid":
                        item.permobil_accountid = $(this).find("b\\:value,value").text();
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
                'modifiedby': (item.modifiedby) ? item.modifiedby : '',
                'modifieduserGuid': (item.modifieduserGuid) ? item.modifieduserGuid : '',
                'modifiedon': (item.modifiedby) ? item.modifiedon : '',

            });
        });
        $('#txtNotesName').val("");
        $('#txtDesc').val("");
        $('#btnEvidenceUploader').val("");
        Permobil.CustomNotes.GetNotesSuccess();
    }
    catch (ex) {
        console.log(ex);
    }
}

$(document).ready(function () {
    if (!!navigator.userAgent.match(/Trident.*rv\:11\./))
        $('head').append('<meta http-equiv=X-UA-Compatible content="IE=10"/>');
    Permobil.CustomNotes.Uploader = new FileAppender("uploader", {}, function (Data) { console.log(Data) });
    Permobil.CustomNotes.Init();
});