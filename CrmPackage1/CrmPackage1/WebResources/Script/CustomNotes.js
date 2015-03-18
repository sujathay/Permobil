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
Permobil.CustomNotes.hoverTitle=function(){
    if (event.keyCode==46 || event.keyCode==127){ 
        var domEvent=new Sys.UI.DomEvent(event); domEvent.stopPropagation();
    } else if (event.keyCode == 13 && event.shiftKey) {
        alert('dfd');
        return false;
    } else if (event.keyCode == 9) { alert('cancel'); }
}
Permobil.CustomNotes.formatGridDisplay = function (cellvalue, options, rowObject) { // format the cellvalue to new format
    var inlineDelete = (rowObject["annotationid"] && rowObject["annotationid"].length == 36) ? ('<img id=' + rowObject["annotationid"] + '  onclick="Permobil.CustomNotes.DeleteFile(this)" src="../img/delete.png">  <br/> ' ): '<br/> ';
    var new_formated_cellvalue = '<h2>' + rowObject["notes_name"] + '</h2> <p>' + rowObject["notes_desc"] + '</p>' +
    '<a class="links" id=' + rowObject["annotationid"] + '   onclick="Permobil.CustomNotes.DownloadAttachment(this)"   target="_blank" >' + rowObject["filename"] + '</a>'+
    inlineDelete+
    '<a class="links" id=' + rowObject["modifieduserGuid"] + '  onclick="Permobil.CustomNotes.openUserPage(this)" >' + rowObject["modifiedby"] + '</a> '
   + ' - <span class="timer">' + rowObject["modifiedon"] + ' </span>';
    return new_formated_cellvalue;
}
Permobil.CustomNotes.DeleteFile = function (annotation)
{
    Permobil.BusyIndicator.Show();
    Permobil.OData.deleteRecord(annotation.id, Permobil.Settings.ANNOTATION_ENTITY, function () {
        Permobil.CustomNotes.GetNotes();
    }, function (err) {
        Permobil.BusyIndicator.Hide();
        console.log(err);
    });
}
Permobil.CustomNotes.DownloadAttachment = function (file) {
    Xrm.Utility.openEntityForm("annotation", file.id);
}
Permobil.CustomNotes.GetNotesSuccess = function success() {
    try {
        var data = {
            colNames: ['Title', '', '', '', '', '', '', '', '', '' ],
            data: Permobil.CustomNotes.annotationList,
            colModel: [
                {
                    name: 'formatted', resizable: true, editable: false,
                    formatter: Permobil.CustomNotes.formatGridDisplay
                }, {
                    name: 'actions', index: 'actions', formatter: 'actions',
                    width:30,
                    formatoptions: {
                        keys: true,
                        editbutton: false,
                        delOptions: {
                            delicon:'delicon',
                            msg:'Are you sure want to delete this note?',
                            beforeSubmit: function (id ) { 
                                Permobil.CustomNotes.Delete(id );
                                return "1";
                            }
                        }
                    }
                },
                {
                    name: 'filename',
                    index: 'customer_id',
                    caption:'File Name',
                    align: 'left',
                    editable: true,
                    hidden:true,
                    edittype: 'file',
                    editoptions: {
                        enctype: "multipart/form-data"
                    },
                    width: 210,
                    align: 'center',
                    //formatter: jgImageFormatter,
                    search: false
                },
                { name: 'notes_name',   hidden: true, editable: true },
                { name: 'notes_desc', hidden: true, editable: true },
                 
                { name: 'notes_id', hidden: true },
                { name: 'modifiedby', hidden: true },
                { name: 'modifiedon', hidden: true },
                { name: 'annotationid', hidden: true },
                { name: 'modifieduserGuid', hidden: true }, ]
        };
        var notesobj = {
            gridID: 'notesGrid',
            ht: auto,
            wd: 600,
            dataSource: data,
            PageSize: 10,
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
Permobil.CustomNotes.UploadImage=function(response, postdata) {

    var data = $.parseJSON(response.responseText);

    if (data.success == true) {
        if ($("#fileToUpload").val() != "") {
            ajaxFileUpload(data.id);
        }
    }

    return [data.success, data.message, data.id];

}

Permobil.CustomNotes.ajaxFileUpload=function (id) {
    $("#loading")
    .ajaxStart(function () {
        $(this).show();
    })
    .ajaxComplete(function () {
        $(this).hide();
    });

    $.ajaxFileUpload
    (
        {
            url: '@Url.Action("UploadImage")',
            secureuri: false,
            fileElementId: 'fileToUpload',
            dataType: 'json',
            data: { id: id },
            success: function (data, status) {

                if (typeof (data.success) != 'undefined') {
                    if (data.success == true) {
                        return;
                    } else {
                        alert(data.message);
                    }
                }
                else {
                    return alert('Failed to upload logo!');
                }
            },
            error: function (data, status, e) {
                return alert('Failed to upload logo!');
            }
        }
    )
}
Permobil.CustomNotes.OpenEditForm = function () {
    var gr = jQuery("#notesGrid").jqGrid('getGridParam', 'selrow');
    if (gr != null)
        jQuery("#notesGrid").jqGrid('editGridRow', gr, {
            height: 150, reloadAfterSubmit: false,
            editCaption: "Edit Notes",
            processData: "Saving...",
            closeAfterEdit: true,
            beforeShowForm: function (form) {
                $("tr#tr_notes_desc").show();
                $("tr#tr_notes_name").show();
                $("tr#tr_filename").show();
                $("tr#tr_formatted").hide();
                $(".navButton").hide();
                $("#TblGrid_notesGrid").append('<tr  class="FormData" id="tr_spnfilename"><td class="CaptionTD"></td><td class="DataTD"><span>' + $("#notes_desc").val() + '</span></td></tr>')

            },
            afterclickPgButtons: function (whichbutton, form, rowid) {
                $("tr#tr_notes_desc").show();
                $("tr#tr_notes_name").show();
                $("tr#tr_filename").show();
                $("tr#tr_formatted").hide();
                $(".navButton").hide();
                //$("tr#tr_modifieduserGuid").show();
            },
            beforeSubmit: function (id,rowid,options) {
                //var gr = jQuery("#notesGrid").jqGrid('getGridParam', id);
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
    //jQuery("#notesGrid").jqGrid('navGrid', 'hideCol', "notes_desc");
}
Permobil.CustomNotes.Delete = function (id ) {
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
            else { Permobil.CustomNotes.GetNotes();  console.log("ther is no file to delete"); }
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
        window.open(Permobil.Common.getClientUrl() + '/main.aspx?etn=systemuser&extraqs=&histKey=647827476&id={' + userid.id + '}&newWindow=true&pagetype=entityrecord', '', 'status=0,resizable=1,width=1000px,height=600px');
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
        if ($('#txtFileName').val().trim().length > 0) {
            Permobil.CustomNotes.SaveFile(data);
        } else { Permobil.CustomNotes.GetNotes(); }
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
Permobil.CustomNotes.UpdateNotes = function (data ) {
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
    var annotationObj = new Object();
    annotationObj.DocumentBody = Permobil.CustomNotes.EncodedFileBody;
    annotationObj.FileName = $('#txtFileName').val().trim().replace(/C:\\fakepath\\/i, '');
    annotationObj.ObjectId = { Id: Permobil.CustomNotes.CurrentNotesID, LogicalName: "permobil_notes", Name: null };
    if (Permobil.CustomNotes.CurrentAnnotationID.length > 34) {
        Permobil.OData.updateRecord(Permobil.CustomNotes.CurrentAnnotationID, annotationObj, Permobil.Settings.ANNOTATION_ENTITY, function (data) {
            Permobil.CustomNotes.GetNotes();
        }, function (err) {
            alert("error is in notes save:" + err);

        }, function () { });
    }
    else { Permobil.CustomNotes.GetNotes(); }
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
    /// <summary>Parses the fetch response to create the product collection array.</summary>
    /// <param name="FetchResult" type="string">fetch xml string.</param>
    /// <param name="FQ_Attr" type="object">fetch xml condition attributes.</param>
    /// <param name="productItemCollection" type="object">object that products for which the related products is fetched.</param>
    try {
        Permobil.CustomNotes.annotationList.length = 0;
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
                        item.modifiedby = $(this).find("b\\:value a\\:Value ,value").text().substring(46, $(this).find("b\\:value a\\:Value ,value").text().length);
                        item.modifieduserGuid = $(this).find("b\\:value a\\:Value ,value").text().substring(0, 36);
                        break;
                    case "modifiedon":
                        item.modifiedon =  Permobil.Common.formatDate($(this).find("b\\:value a\\:Value ,value").text());
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
                'modifiedby': (item.modifiedby) ? item.modifiedby : '',
                'modifieduserGuid': (item.modifieduserGuid) ? item.modifieduserGuid : '',
                'modifiedon': (item.modifiedby) ? item.modifiedon : '',

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