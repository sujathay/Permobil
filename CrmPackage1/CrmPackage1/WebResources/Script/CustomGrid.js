/// <reference path="jQuery1.8.2.js" />
/// <reference path="Permobil.jqGrid4.3.0.js" />
if (typeof (Permobil) == "undefined") {
    Permobil = new Object();
}
Permobil.CustomGrid = {
    _namespace: true,
    GridID: null,
    createGrid: function (options) {
        defaults = {
            gridID: '_gridControl',
            ht: '',
            wd: '',
            dataSource: 'text',
            PageSize: 10,
            PagerId: 'pgr_',
            sortBy: '',
            isDesc: 'asc',
            rowDoubleClickHandler: null,
            RefreshGridHandler: null,
            CaptionText: null,
            customActionObj: null,
            fetchQuery: '',
            gridCompleted: null
        }
        var settings = $.extend(defaults, options);
        settings.PagerId = 'pgr_' + settings.gridID;
        var actionbar = null;
        // action bar generation
        var d = $('<div>');
        d.attr({ 'class': 'box2' });
        if (settings.customActionObj) {
            $.each(settings.customActionObj, function (index, value) {
                actionbar = $('<input>');
                actionbar.attr({
                    'type': 'button',
                    'value': value.Text,
                    'title': value.Title,
                    'class': 'actionButton'

                });
                actionbar.css('background', 'url(' + value.Icon + ') no-repeat 10px center');
                actionbar.bind('click',
                    function () {
                        var rowID = jQuery("#" + settings.gridID).jqGrid('getGridParam', 'selrow');
                        var selectedrow = jQuery("#" + settings.gridID).jqGrid('getRowData', rowID);
                        if (!rowID && value.isSelectionReqd)
                        { alert('Please select a row'); }
                        else
                        { value.Handler(jQuery("#" + settings.gridID)); }

                    }
                    );
                d.append(actionbar);
                //refresh button adding
                $("#" + settings.gridID).parent().prepend($("<div>", { "class": "c360-REO-GridArea" }));
            });
        }
        $("#" + settings.gridID).parent().prepend(d);
        var pager = $('<div>');
        pager.attr({ 'id': settings.PagerId });
        $("#" + settings.gridID).parent().parent().append(pager);
        var grid = $("#" + settings.gridID);
        Permobil.CustomGrid.GridID = settings.gridID;
        var myData = settings.dataSource;
        grid.jqGrid('GridUnload'); // to clear off the grid if it already exist.
        grid = $("#" + settings.gridID); // Note: this is required after gridUnload as the table(container element) is recreated. Hence, the reference needs to be updated.


        Permobil.TextFormatter = function (cellValue, options, cell) {
            try {
                var text = '';
                if (cell['c360_expires'] == 'false') {
                    text = "Never";
                }
                else {
                    text = cellValue;
                }
                return '<span>' + text + '</span>';
            } catch (e) {
                //Permobil.RE.Common.LogException(e);
            }
        }

        grid.jqGrid({
            datatype: "local",
            data: settings.dataSource.data,
            colNames: settings.dataSource.colNames,
            colModel: settings.dataSource.colModel,
            pager: '#' + settings.PagerId,
            jsonReader: {
                cell: "",
                subgrid: {
                    root: "rows",
                    repeatitems: true,
                    cell: "cell"
                }
            },
            rowNum: settings.PageSize,
            pginput: true,
            sortname: settings.sortBy,
            sortorder: (settings.isDesc) ? 'desc' : 'asc',
            gridview: true,
            subGrid: false,
            caption: settings.CaptionText,
            subGridOptions: {
                "expandOnLoad": true
            },
            subGridRowExpanded: function (subgrid_id, row_id) {

                var alertText = grid.getRowData(row_id)['description'];
                var subdata = $("#" + subgrid_id).parent().parent().prev().find('td:nth-child(10)').text();
                var colspan = $("#" + gridID)[0].p.colNames;
                $("#" + subgrid_id).html(subdata);
            },
            ondblClickRow: function (rowid, iRow, iCol, e) {
                var data = grid.getRowData(rowid);
                settings.rowDoubleClickHandler(data);
            },
            viewrecords: true,
            width: settings.wd,
            height: settings.ht,
            pagerpos: 'right',
            recordpos: 'left',
            loadComplete: function (grid) { if (settings.gridCompleted) { settings.gridCompleted($("#" + settings.gridID)); } }
        });
        grid.jqGrid('navGrid', '#' + settings.PagerId, {
            caption: "", title: "Reload Grid", buttonicon: "ui-icon-refresh",
            onClickButton: function () {
                alert('"Refresh" button is clicked!');
            }
        });

    },
    SelectedRowValue: function (fieldName) {
        var rowID = $("#" + Permobil.CustomGrid.GridID).jqGrid('getGridParam', 'selrow');
        var fieldValue = null;
        if (fieldName) {
            fieldValue = $("#" + Permobil.CustomGrid.GridID).jqGrid('getCell', rowID, fieldName);
        }
        else {
            fieldValue = $("#" + Permobil.CustomGrid.GridID).jqGrid('getRowData', rowID);
        }
        return fieldValue;
    },
    SelectedRowID: function () {
        return $("#" + Permobil.CustomGrid.GridID).jqGrid('getGridParam', 'selrow');
    },
    //ConfirmationBox: function (confirmAction, cancelAction) {

    //   // Permobil.ConfirmBox.insertCss();
    //    $.confirm({
    //        'title': Permobil.LocalizationController.GetLocalization("ConfirmDeletion"),
    //        'message': Permobil.LocalizationController.GetLocalization("DeleteAlertConfirmationMsg"),
    //        'buttons': {
    //            'Delete': {
    //                'class': 'blue',
    //                'text': Permobil.LocalizationController.GetLocalization("OK"),
    //                'action': function () {
    //                    $('#Activateconfirm').attr('disabled', 'disabled').css('color', 'rgb(161, 163, 161)').css('border', '1px solid rgb(172, 172, 172)');
    //                    $('#confirmBox p').html('<div id="progressbar"><div class="progress-label"></div></div>');
    //                    $.confirm.hide();
    //                    confirmAction();
    //                }
    //            },
    //            'Cancel': {
    //                'class': 'gray',
    //                'text': Permobil.LocalizationController.GetLocalization("Cancel"),
    //                'action': function () {
    //                    $.confirm.hide();
    //                    cancelAction();
    //                } // Nothing to do in this case. You can as well omit the action property.
    //            }
    //        }
    //    });
    //},
    Load: function ()
    { }
}

//$(document).bind("OnReady", Load);