/// <reference path="Permobil.Common.js" />

if (typeof (Permobil) == "undefined") {
    Permobil = { __namespace: true };
}

Permobil.SOAP = {
    __namespace: true,
    ExecuteFetchXML: function (sFetchXml, successCallback, errorCallback) {
        /// <summary>Execute a FetchXml request. (result is the response XML)</summary> 
        /// <param name="sFetchXml">fetchxml string</param> 
        /// <param name="successCallback" type="function">Async callback function. Gives an XML result</param>
        /// <param name="errorCallback" type="function">Fires when an error occurs. Text error</param>

        var request = "<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">";
        request += "<s:Body>";

        request += '<Execute xmlns="http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">' +
                    '<request i:type="b:RetrieveMultipleRequest" ' +
                    ' xmlns:b="http://schemas.microsoft.com/xrm/2011/Contracts">' +
                    '<b:Parameters xmlns:c="http://schemas.datacontract.org/2004/07/System.Collections.Generic">' +
                    '<b:KeyValuePairOfstringanyType>' +
                    '<c:key>Query</c:key>' +
                    '<c:value i:type="b:FetchExpression">' +
                    '<b:Query>';

        request += window.parent.CrmEncodeDecode.CrmXmlEncode(sFetchXml);

        request += '</b:Query>' +
                    '</c:value>' +
                    '</b:KeyValuePairOfstringanyType>' +
                    '</b:Parameters>' +
                    '<b:RequestId i:nil="true"/>' +
                    '<b:RequestName>RetrieveMultiple</b:RequestName>' +
                    '</request>' +
                    '</Execute>';

        request += '</s:Body></s:Envelope>';

        Permobil.SOAP.ExecuteSoap(request, successCallback, errorCallback);

    },


    ChangeRecordState: function (entityid, entityname, state, status, successCallback, errorCallback) {
        /// <summary>Change record state</summary> 
        /// <param name="entityid">Entity Guid</param>
        /// <param name="entityname">Logical Name of the entity</param> 
        /// <param name="state">state code</param> 
        /// <param name="status">status code</param>  
        /// <param name="successCallback" type="function">Async callback function. Gives an XML result</param>
        /// <param name="errorCallback" type="function">Fires when an error occurs. Error Object</param>
        try {
            var requestMain = "";
            requestMain += "<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">";
            requestMain += "  <s:Body>";
            requestMain += "    <Execute xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">";
            requestMain += "      <request i:type=\"b:SetStateRequest\" xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\" xmlns:b=\"http://schemas.microsoft.com/crm/2011/Contracts\">";
            requestMain += "        <a:Parameters xmlns:c=\"http://schemas.datacontract.org/2004/07/System.Collections.Generic\">";
            requestMain += "          <a:KeyValuePairOfstringanyType>";
            requestMain += "            <c:key>EntityMoniker</c:key>";
            requestMain += "            <c:value i:type=\"a:EntityReference\">";
            requestMain += "              <a:Id>" + entityid + "</a:Id>";
            requestMain += "              <a:LogicalName>" + entityname + "</a:LogicalName>";
            requestMain += "              <a:Name i:nil=\"true\" />";
            requestMain += "            </c:value>";
            requestMain += "          </a:KeyValuePairOfstringanyType>";
            requestMain += "          <a:KeyValuePairOfstringanyType>";
            requestMain += "            <c:key>State</c:key>";
            requestMain += "            <c:value i:type=\"a:OptionSetValue\">";
            requestMain += "              <a:Value>" + state + "</a:Value>";
            requestMain += "            </c:value>";
            requestMain += "          </a:KeyValuePairOfstringanyType>";
            requestMain += "          <a:KeyValuePairOfstringanyType>";
            requestMain += "            <c:key>Status</c:key>";
            requestMain += "            <c:value i:type=\"a:OptionSetValue\">";
            requestMain += "              <a:Value>" + status + "</a:Value>";
            requestMain += "            </c:value>";
            requestMain += "          </a:KeyValuePairOfstringanyType>";
            requestMain += "        </a:Parameters>";
            requestMain += "        <a:RequestId i:nil=\"true\" />";
            requestMain += "        <a:RequestName>SetState</a:RequestName>";
            requestMain += "      </request>";
            requestMain += "    </Execute>";
            requestMain += "  </s:Body>";
            requestMain += "</s:Envelope>";

            Permobil.SOAP.ExecuteSoap(requestMain, successCallback, errorCallback);
        }
        catch (e) {
            Permobil.Common.handleError(e);
        }
    },

    ExecuteSoap: function (request, successCallback, errorCallback) {
        /// <summary>Execute the SOAP message</summary> 
        /// <param name="request">Soap Envelope</param>
        /// <param name="successCallback" type="function">Async callback function. Gives an XML result</param>
        /// <param name="errorCallback" type="function">Fires when an error occurs. Error Object</param>
        var req = new XMLHttpRequest();

        req.open("POST", Permobil.Common.getClientUrl() + "/XRMServices/2011/Organization.svc/web", true);
        req.setRequestHeader("Accept", "application/xml, text/xml, */*");
        req.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
        req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/xrm/2011/Contracts/Services/IOrganizationService/Execute");
        req.onreadystatechange = function () {
            if (req.readyState === 4) {
                req.onreadystatechange = null;
                if (req.status === 200) {
                    if (successCallback !== null)
                    { successCallback(req.responseXML); }
                }
                else {
                    errorCallback(Permobil.SOAP.DisplayFault(req));
                }
            }
        };
        req.send(request);
    },

    DisplayFault: function (req) {
        /// <summary>Handle error</summary> 
        /// <param name="req" type="function">Http Request</param>
        /// <return type="Error Object">Error message</param>
        var errorMessage;
        if (typeof $ === "function") {
            try {
                errorMessage = 'Status - ' + req.statusText + '-' + req.status + ' Message - ' + $(req.responseXML).children().find("faultstring").text();
                if ($(req.responseXML).children().find("TraceText").text() !== '') {
                    errorMessage += '\nTraceText - ' + $(req.responseXML).children().find("TraceText").text();
                }
            }
            catch (e) {
                errorMessage = req.responseText;
            }
        }
        else {
            errorMessage = req.responseText;
        }
        return new Error(errorMessage);
    },

    ExecuteWorkFlows: function (EntityId, WorkflowId, successCallback, errorCallback) {
        /// <summary>Execute the SOAP message</summary> 
        /// <param name="EntityId">Entity Guid</param>
        /// <param name="EntityId">Workflow Guid</param>
        /// <param name="successCallback" type="function">Async callback function. Gives an XML result</param>
        /// <param name="errorCallback" type="function">Fires when an error occurs. Error Object</param>
        try {
            var request = '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">';
            request += '<s:Body>';
            request += '<Execute xmlns="http://schemas.microsoft.com/xrm/2011/Contracts/Services" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">';
            request += '<request i:type="b:ExecuteWorkflowRequest" xmlns:a="http://schemas.microsoft.com/xrm/2011/Contracts" xmlns:b="http://schemas.microsoft.com/crm/2011/Contracts">';
            request += '<a:Parameters xmlns:c="http://schemas.datacontract.org/2004/07/System.Collections.Generic">';
            request += '<a:KeyValuePairOfstringanyType>';
            request += '<c:key>EntityId</c:key>';
            request += '<c:value i:type="d:guid" xmlns:d="http://schemas.microsoft.com/2003/10/Serialization/">' + EntityId + '</c:value>';
            request += '</a:KeyValuePairOfstringanyType>';
            request += '<a:KeyValuePairOfstringanyType>';
            request += '<c:key>WorkflowId</c:key>';
            request += '<c:value i:type="d:guid" xmlns:d="http://schemas.microsoft.com/2003/10/Serialization/">' + WorkflowId + '</c:value>';
            request += '</a:KeyValuePairOfstringanyType>';
            request += '</a:Parameters>';
            request += '<a:RequestId i:nil="true" />';
            request += '<a:RequestName>ExecuteWorkflow</a:RequestName>';
            request += '</request>';
            request += '</Execute>';
            request += '</s:Body>';
            request += '</s:Envelope>';

            Permobil.SOAP.ExecuteSoap(request, successCallback, errorCallback);

        }
        catch (e) {
            Permobil.Common.handleError(e);
        }
    }
};