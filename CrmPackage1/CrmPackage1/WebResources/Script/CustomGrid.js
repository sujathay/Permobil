﻿/// <reference path="jQuery1.8.2.js" />
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
            customActionObj: '',
            fetchQuery: '',
            gridCompleted: null,
            onRowDelete: null
        }
        var settings = $.extend(defaults, options);
        settings.PagerId = 'pgr_' + settings.gridID;
        if (settings.customActionObj) {
            var actionbar = null;
            // action bar generation
            var d = $('<div>');
            d.attr({ 'class': 'box2' });
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
                $("#" + settings.gridID).parent().prepend($("<div>", { "class": "Permobil-REO-GridArea" }));
            });

            $("#" + settings.gridID).parent().prepend(d);
        }
        var pager = $('<div>');
        pager.attr({ 'id': settings.PagerId });
        $("#" + settings.gridID).parent().parent().append(pager);
        var grid = $("#" + settings.gridID);
        Permobil.CustomGrid.GridID = settings.gridID;
        var myData = settings.dataSource;
        grid.jqGrid('GridUnload'); // to clear off the grid if it already exist.
        grid = $("#" + settings.gridID); // Note: this is required after gridUnload as the table(container element) is recreated. Hence, the reference needs to be updated.
        function imageFormatter(cellValue, options, cell) {
            try {
                var imgName = '';
                var altName = '';
                switch (cellValue) {
                    case '555860001':
                        imgName = altName = 'info';
                        break;
                    case '555860002':
                        imgName = altName = 'warning';
                        break;
                    case '555860003':
                        imgName = altName = 'alert';
                        break;
                    default:

                }
                return ' <img alt="' + altName + '" src="../img/' + imgName + '.gif" />';
            } catch (e) {
                Permobil.RE.Common.LogException(e);
            }
        }

        Permobil.TextFormatter = function (cellValue, options, cell) {
            try {
                var text = '';
                if (cell['Permobil_expires'] == 'false') {
                    text = "Never";
                }
                else {
                    text = cellValue;
                }
                return '<span>' + text + '</span>';
            } catch (e) {
                Permobil.RE.Common.LogException(e);
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
            success:function(response){ $("#myjqgrid").jqGrid('navGrid','#Pager');
                $("#myjqgrid").jqGrid('gridResize',{minWidth:800,maxWidth:1405,minHeight:350,maxHeight:680});},
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
                if (settings.rowDoubleClickHandler) {
                   // var data = grid.getRowData(rowid);
                    settings.rowDoubleClickHandler(rowid);
                }
            },
            viewrecords: true,
            width: (!settings.wd && settings.wd.length>0) ? settings.wd : null,
            height: settings.ht,
            autowidth: true,
            //shrinkToFit: false,
            pagerpos: 'right',
            recordpos: 'left',
            editurl: 'clientArray',
            emptyrecords: "No Notes found.",
            loadComplete: function (grid) { if (settings.gridCompleted) { settings.gridCompleted($("#" + settings.gridID)); } }, 
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
    ConfirmationBox: function (confirmAction, cancelAction) {

        //Permobil.ConfirmBox.insertCss();
        $.confirm({
            'title': "ConfirmDeletion" ,
            'message':  "Are you sure want to delte this note?" ,
            'buttons': {
                'Delete': {
                    'class': 'blue',
                    'text': "OK",
                    'action': function () {
                        $('#Activateconfirm').attr('disabled', 'disabled').css('color', 'rgb(161, 163, 161)').css('border', '1px solid rgb(172, 172, 172)');
                        $('#confirmBox p').html('<div id="progressbar"><div class="progress-label"></div></div>');
                        $.confirm.hide();
                        confirmAction();
                    }
                },
                'Cancel': {
                    'class': 'gray',
                    'text': "Cancel",
                    'action': function () {
                        $.confirm.hide();
                        cancelAction();
                    } // Nothing to do in this case. You can as well omit the action property.
                }
            }
        });
    },
    Load: function ()
    { }
}

//$(document).bind("OnReady", Load);