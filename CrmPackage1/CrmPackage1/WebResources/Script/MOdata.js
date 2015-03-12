 
if (typeof (Permobil) == "undefined") {
    Permobil = { __namespace: true };
}

Permobil.OData = {
    __namespace: true,

    _oDataPath: function () {
        ///<summary>Private function to return the path to the ODATA endpoint.</summary>
        ///<returns>String</returns>
        return Permobil.Common.getClientUrl() + "/XRMServices/2011/OrganizationData.svc/";
    },
    _errorHandler: function (req) {
        ///<summary>Private function return an Error object to the errorCallback</summary>
        ///<param name="req" type="XMLHttpRequest">The XMLHttpRequest response that returned an error.</param>
        ///<returns>Error</returns>
        //Error descriptions come from http://support.microsoft.com/kb/193625
        if (req.status == 12029) {
            return new Error("The attempt to connect to the server failed.");
        }
        if (req.status == 12007) {
            return new Error("The server name could not be resolved.");
        }

        var errorText = "";

        try {
            errorText = JSON.parse(req.responseText).error.message.value;
        }
        catch (e) {
            errorText = req.responseText;
            Permobil.Logging.PermobilLogger.error(e);
        }

        return new Error("Error : " + req.status + ": " + req.statusText + ": " + errorText);
    },
    handleError: function (e) {
        alert("An unexpected error occurred.\n\nMessage: " + e.message + "\n\nStack: " + e.stack);
        Permobil.Logging.PermobilLogger.error(e);
    },
    _dateReviver: function (key, value) {
        ///<summary>Private function to convert matching string values to Date objects.</summary>
        ///<param name="key" type="String">The key used to identify the object property</param>
        ///<param name="value" type="String">The string value representing a date</param>
        var a;

        if (typeof value === 'string') {
            a = /Date\(([-+]?\d+)\)/.exec(value);
            if (a) {
                return new Date(parseInt(value.replace("/Date(", "").replace(")/", ""), 10));
            }
        }
        return value;
    },
    _parameterCheck: function (parameter, message) {
        ///<summary>Private function used to check whether required parameters are null or undefined</summary>
        ///<param name="parameter" type="Object">The parameter to check;</param>
        ///<param name="message" type="String">The error message text to include when the error is thrown.</param>
        if ((typeof parameter === "undefined") || parameter === null) {
            throw new Error(message);
        }
    },
    _stringParameterCheck: function (parameter, message) {
        ///<summary>Private function used to check whether required parameters are null or undefined</summary>
        ///<param name="parameter" type="String">The string parameter to check;</param>
        ///<param name="message" type="String">The error message text to include when the error is thrown.</param>
        if (typeof parameter != "string") {
            throw new Error(message);
        }
    },
    _callbackParameterCheck: function (callbackParameter, message) {
        ///<summary>Private function used to check whether required callback parameters are functions</summary>
        ///<param name="callbackParameter" type="Function">The callback parameter to check;</param>
        ///<param name="message" type="String">The error message text to include when the error is thrown.</param>
        if (typeof callbackParameter != "function") {
            throw new Error(message);
        }
    },
    _sendRequest: function (action, url, object, successCallback, errorCallback, onComplete) {
        ///<summary>Private function used to send all </summary>
        ///<param name="callbackParameter" type="Function">The callback parameter to check;</param>
        ///<param name="action" type="String">The action to take.  Valid values are create, update, delete, retrieve, retrievemultiple, associate and disassociate.</param>
        ///<param name="url" type="String">The URL to access.  This function will prepend the server URL and the oData end point.</param>
        ///<param name="object" type="Object">Optional JavaScript object with properties corresponding to the Schema name of entity attributes that are valid for the indicated operation.</param>
        ///<param name="successCallback" type="Function">The function that will be passed through and be called with a successfull response.</param>
        ///<param name="errorCallback" type="Function">The function that will be passed through and be called by a failed response. This function must accept an Error object as a parameter.</param>
        ///<param name="onComplete" type="Function">Optional. See retrieveMultiple for description.</param>
        try {
            action = action.toLowerCase();

            var verb = "POST";
            var method = null;

            switch (action) {
                case "retrieve":
                case "retrievemultiple":
                    verb = "GET";
                    break;
                case "delete":
                case "disassociate":
                    method = "DELETE";
                    break;
                case "update":
                    method = "MERGE";
                    break;
            }

            var req = new XMLHttpRequest();

            req.open(verb, encodeURI(this._oDataPath() + url), false);
            req.setRequestHeader("Accept", "application/json");
            req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
            if (method != null) {
                req.setRequestHeader("X-HTTP-Method", method);
            }

            req.onreadystatechange = function () {
                var self = this;
                if (this.readyState == 4 /* complete */) {
                    req.onreadystatechange = null;
                    var validStatus = new Array(200, 201, 204, 1223);
                    if (validStatus.indexOf(this.status) != -1) {
                   // if (_.indexOf(validStatus, this.status) != -1) {
                        switch (action) {
                            case "retrievemultiple":
                                var returned = JSON.parse(this.responseText, Permobil.OData._dateReviver).d;

                                successCallback(returned.results);
                                if (action.toLowerCase() == "retrievemultiple") {
                                    if (returned.__next != null) {
                                        var queryOptions = returned.__next.substring((Permobil.OData._oDataPath() + type + "Set").length);

                                        Permobil.OData.retrieveMultipleRecords(type, queryOptions, successCallback, errorCallback, onComplete);
                                    }
                                    else { onComplete(); }
                                }
                                break;
                            case "create":
                            case "retrieve":
                                successCallback(JSON.parse(this.responseText, Permobil.OData._dateReviver).d);
                                break;
                            default:
                                successCallback();
                                break;
                        }
                    }
                    else {
                        errorCallback(Permobil.OData._errorHandler(this));
                    }
                }
            };

            if (object != null && object != "") {
                req.send(JSON.stringify(object));
            } else {
                req.send();
            }
        }
        catch (e) {
            Permobil.Logging.PermobilLogger.error(e);
        }

    },
    createRecord: function (object, type, successCallback, errorCallback) {
        ///<summary>Sends an asynchronous request to create a new record.</summary>
        ///<param name="object" type="Object">A JavaScript object with properties corresponding to the Schema name of entity attributes that are valid for create operations.</param>
        ///<param name="type" type="String">The Schema Name of the Entity type record to create. For an Account record, use "Account"</param>
        ///<param name="successCallback" type="Function">The function that will be passed through and be called by a successful response. This function can accept the returned record as a parameter.</param>
        ///<param name="errorCallback" type="Function">The function that will be passed through and be called by a failed response. This function must accept an Error object as a parameter.</param>
        this._parameterCheck(object, "Permobil.OData.createRecord requires the object parameter.");
        this._stringParameterCheck(type, "Permobil.OData.createRecord requires the type parameter is a string.");
        this._callbackParameterCheck(successCallback, "Permobil.OData.createRecord requires the successCallback is a function.");
        this._callbackParameterCheck(errorCallback, "Permobil.OData.createRecord requires the errorCallback is a function.");

        var url = type + "Set";

        this._sendRequest("create", url, object, successCallback, errorCallback);
    },
    retrieveRecord: function (id, type, select, expand, successCallback, errorCallback) {
        ///<summary>Sends an asynchronous request to retrieve a record.</summary>
        ///<param name="id" type="String">A String representing the GUID value for the record to retrieve.</param>
        ///<param name="type" type="String">The Schema Name of the Entity type record to retrieve. For an Account record, use "Account"</param>
        ///<param name="select" type="String">A String representing the $select OData System Query Option to control which attributes will be returned. This is a comma separated list of Attribute names that are valid for retrieve. If null all properties for the record will be returned</param>
        ///<param name="expand" type="String">A String representing the $expand OData System Query Option value to control which related records are also returned. This is a comma separated list of of up to 6 entity relationship names. If null no expanded related records will be returned.</param>
        ///<param name="successCallback" type="Function">The function that will be passed through and be called by a successful response. This function must accept the returned record as a parameter.</param>
        ///<param name="errorCallback" type="Function">The function that will be passed through and be called by a failed response. This function must accept an Error object as a parameter.</param>
        this._stringParameterCheck(id, "Permobil.OData.retrieveRecord requires the id parameter is a string.");
        this._stringParameterCheck(type, "Permobil.OData.retrieveRecord requires the type parameter is a string.");
        if (select != null)
            this._stringParameterCheck(select, "Permobil.OData.retrieveRecord requires the select parameter is a string.");
        if (expand != null)
            this._stringParameterCheck(expand, "Permobil.OData.retrieveRecord requires the expand parameter is a string.");
        this._callbackParameterCheck(successCallback, "Permobil.OData.retrieveRecord requires the successCallback parameter is a function.");
        this._callbackParameterCheck(errorCallback, "Permobil.OData.retrieveRecord requires the errorCallback parameter is a function.");

        var systemQueryOptions = "";

        if (select != null || expand != null) {
            systemQueryOptions = "?";
            if (select != null) {
                var selectString = "$select=" + select;
                if (expand != null) {
                    selectString = selectString + "," + expand;
                }
                systemQueryOptions = systemQueryOptions + selectString;
            }
            if (expand != null) {
                systemQueryOptions = systemQueryOptions + "&$expand=" + expand;
            }
        }

        var url = type + "Set(guid'" + id + "')" + systemQueryOptions;

        this._sendRequest("retrieve", url, null, successCallback, errorCallback);
    },
    updateRecord: function (id, object, type, successCallback, errorCallback) {
        ///<summary>Sends an asynchronous request to update a record.</summary>
        ///<param name="id" type="String">A String representing the GUID value for the record to retrieve.</param>
        ///<param name="object" type="Object">A JavaScript object with properties corresponding to the Schema Names for entity attributes that are valid for update operations.</param>
        ///<param name="type" type="String">The Schema Name of the Entity type record to retrieve. For an Account record, use "Account"</param>
        ///<param name="successCallback" type="Function">The function that will be passed through and be called by a successful response. Nothing will be returned to this function.</param>
        ///<param name="errorCallback" type="Function">The function that will be passed through and be called by a failed response. This function must accept an Error object as a parameter.</param>
        this._stringParameterCheck(id, "Permobil.OData.updateRecord requires the id parameter.");
        this._parameterCheck(object, "Permobil.OData.updateRecord requires the object parameter.");
        this._stringParameterCheck(type, "Permobil.OData.updateRecord requires the type parameter.");
        this._callbackParameterCheck(successCallback, "Permobil.OData.updateRecord requires the successCallback is a function.");
        this._callbackParameterCheck(errorCallback, "Permobil.OData.updateRecord requires the errorCallback is a function.");

        var url = type + "Set(guid'" + id + "')";

        this._sendRequest("update", url, object, successCallback, errorCallback);
    },
    deleteRecord: function (id, type, successCallback, errorCallback) {
        ///<summary>Sends an asynchronous request to delete a record.</summary>
        ///<param name="id" type="String">A String representing the GUID value for the record to delete.</param>
        ///<param name="type" type="String">The Schema Name of the Entity type record to delete. For an Account record, use "Account"</param>
        ///<param name="successCallback" type="Function">The function that will be passed through and be called by a successful response. Nothing will be returned to this function.</param>
        ///<param name="errorCallback" type="Function">The function that will be passed through and be called by a failed response. This function must accept an Error object as a parameter.</param>
        this._stringParameterCheck(id, "Permobil.OData.deleteRecord requires the id parameter.");
        this._stringParameterCheck(type, "Permobil.OData.deleteRecord requires the type parameter.");
        this._callbackParameterCheck(successCallback, "Permobil.OData.deleteRecord requires the successCallback is a function.");
        this._callbackParameterCheck(errorCallback, "Permobil.OData.deleteRecord requires the errorCallback is a function.");

        var url = type + "Set(guid'" + id + "')";

        this._sendRequest("delete", url, null, successCallback, errorCallback);
    },
    retrieveMultipleRecords: function (type, options, successCallback, errorCallback, onComplete) {
        ///<summary>Sends an asynchronous request to retrieve records.</summary>
        ///<param name="type" type="String">The Schema Name of the Entity type record to retrieve. For an Account record, use "Account"</param>
        ///<param name="options" type="String">A String representing the OData System Query Options to control the data returned</param>
        ///<param name="successCallback" type="Function">The function that will be passed through and be called for each page of records returned. Each page is 50 records. If you expect that more than one page of records will be returned, this function should loop through the results and push the records into an array outside of the function. Use the OnComplete event handler to know when all the records have been processed.</param>
        ///<param name="errorCallback" type="Function">The function that will be passed through and be called by a failed response. This function must accept an Error object as a parameter.</param>
        ///<param name="OnComplete" type="Function">The function that will be called when all the requested records have been returned. No parameters are passed to this function.</param>
        this._stringParameterCheck(type, "Permobil.OData.retrieveMultipleRecords requires the type parameter is a string.");
        if (options != null)
            this._stringParameterCheck(options, "Permobil.OData.retrieveMultipleRecords requires the options parameter is a string.");
        this._callbackParameterCheck(successCallback, "Permobil.OData.retrieveMultipleRecords requires the successCallback parameter is a function.");
        this._callbackParameterCheck(errorCallback, "Permobil.OData.retrieveMultipleRecords requires the errorCallback parameter is a function.");
        this._callbackParameterCheck(onComplete, "Permobil.OData.retrieveMultipleRecords requires the OnComplete parameter is a function.");

        var optionsString;
        if (options != null) {
            if (options.charAt(0) != "?") {
                optionsString = "?" + options;
            }
            else { optionsString = options; }
        }

        var url = type + "Set" + optionsString;

        this._sendRequest("retrievemultiple", url, null, successCallback, errorCallback, onComplete);
    },
    associateRecords: function (parentId, parentType, relationshipName, childId, childType, successCallback, errorCallback) {
        ///<param name="parentId" type="String">The Id of the record to be the parent record in the relationship</param>
        ///<param name="parentType" type="String">The Schema Name of the Entity type for the parent record. For an Account record, use "Account"</param>
        ///<param name="relationshipName" type="String">The Schema Name of the Entity Relationship to use to associate the records. To associate account records as a Parent account, use "Referencedaccount_parent_account"</param>
        ///<param name="childId" type="String">The Id of the record to be the child record in the relationship</param>
        ///<param name="childType" type="String">The Schema Name of the Entity type for the child record. For an Account record, use "Account"</param>
        ///<param name="successCallback" type="Function">The function that will be passed through and be called by a successful response. Nothing will be returned to this function.</param>
        ///<param name="errorCallback" type="Function">The function that will be passed through and be called by a failed response. This function must accept an Error object as a parameter.</param>
        this._stringParameterCheck(parentId, "Permobil.OData.associateRecords requires the parentId parameter is a string.");
        this._stringParameterCheck(parentType, "Permobil.OData.associateRecords requires the parentType parameter is a string.");
        this._stringParameterCheck(relationshipName, "Permobil.OData.associateRecords requires the relationshipName parameter is a string.");
        this._stringParameterCheck(childId, "Permobil.OData.associateRecords requires the childId parameter is a string.");
        this._stringParameterCheck(childType, "Permobil.OData.associateRecords requires the childType parameter is a string.");
        this._callbackParameterCheck(successCallback, "Permobil.OData.associateRecords requires the successCallback parameter is a function.");
        this._callbackParameterCheck(errorCallback, "Permobil.OData.associateRecords requires the errorCallback parameter is a function.");

        var childEntityReference = {}
        childEntityReference.uri = this._oDataPath() + "/" + childType + "Set(guid'" + childId + "')";

        var url = parentType + "Set(guid'" + parentId + "')/$links/" + relationshipName;

        this._sendRequest("associate", url, childEntityReference, successCallback, errorCallback);
    },
    disassociateRecords: function (parentId, parentType, relationshipName, childId, successCallback, errorCallback) {
        this._stringParameterCheck(parentId, "Permobil.OData.disassociateRecords requires the parentId parameter is a string.");
        ///<param name="parentId" type="String">The Id of the record to be the parent record in the relationship</param>
        ///<param name="parentType" type="String">The Schema Name of the Entity type for the parent record. For an Account record, use "Account"</param>
        ///<param name="relationshipName" type="String">The Schema Name of the Entity Relationship to use to disassociate the records. To disassociate account records as a Parent account, use "Referencedaccount_parent_account"</param>
        ///<param name="childId" type="String">The Id of the record to be disassociated as the child record in the relationship</param>
        ///<param name="successCallback" type="Function">The function that will be passed through and be called by a successful response. Nothing will be returned to this function.</param>
        ///<param name="errorCallback" type="Function">The function that will be passed through and be called by a failed response. This function must accept an Error object as a parameter.</param>
        this._stringParameterCheck(parentType, "Permobil.OData.disassociateRecords requires the parentType parameter is a string.");
        this._stringParameterCheck(relationshipName, "Permobil.OData.disassociateRecords requires the relationshipName parameter is a string.");
        this._stringParameterCheck(childId, "Permobil.OData.disassociateRecords requires the childId parameter is a string.");
        this._callbackParameterCheck(successCallback, "Permobil.OData.disassociateRecords requires the successCallback parameter is a function.");
        this._callbackParameterCheck(errorCallback, "Permobil.OData.disassociateRecords requires the errorCallback parameter is a function.");

        var url = parentType + "Set(guid'" + parentId + "')/$links/" + relationshipName + "(guid'" + childId + "')";

        this._sendRequest("disassociate", url, null, successCallback, errorCallback);
    }
};
