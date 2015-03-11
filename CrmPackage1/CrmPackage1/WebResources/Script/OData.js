/**
* OData client
* Requires: common-lib.js
* Example usage:
* var contacts = nho.odata.res("ContactSet").get();
* var contact = nho.odata.res("ContactSet", guid).get();
* var location = nho.odata.res("ContactSet", guid).res("AppointmentSet").top(1).select("Location").get();
*
* Asynchronous calls also possible:
* nho.odata.res("ContactSet").get(function(contacts) {
*     // do stuff
* });
*/
(function (context) {

    function _od() {
        var _url = RealServerUrl() + "/XRMServices/2011/OrganizationData.svc";
        var _resourcePath = "";
        var _queryPath = "";
        var _generateLazyLoaders = true;
        function _lazy(lazy) {
            _generateLazyLoaders = lazy;
            return {
                res: _res
            };
        }

        function _res(resource, id) {
            var operations = {
                res: _res,
                get: _get,
                select: _select,
                top: _top,
                orderby: _orderby,
                filter: _filter,
                create: _create,
                update: _update,
                remove: _delete,
                addLoad: _addLoad
            };
            if (id) {
                resource += "(guid'" + _braces(id) + "')";
            }
            _resourcePath += "/" + resource;
            return operations;
        }

        function _createLazyLoaders(arr) {
            var sets = nho.odata.sets;
            if (!arr.push) arr = [arr];
            var i = 0; len = arr.length;
            var obj;
            for (; i < len; i++) {
                obj = arr[i];
                var guid = obj.__metadata.uri;
                guid = guid.substring(guid.indexOf("(guid"));
                for (var j in obj) {
                    if (obj[j] != undefined && typeof obj[j] == "object") {
                        if (obj[j].hasOwnProperty("__metadata") && obj[j].__metadata.hasOwnProperty("type")) {
                            if (obj[j].__metadata.type == "Microsoft.Crm.Sdk.Data.Services.EntityReference" && obj[j].Id != undefined) {
                                (function () {
                                    var prop = j;
                                    var id = obj[prop].Id;
                                    var logicalName = obj[prop]["LogicalName"];
                                    var resource = sets[logicalName] != undefined ? sets[logicalName] : logicalName;
                                    resource = resource + "Set";
                                    var methodName = prop;
                                    if (methodName.endsWith("Id")) methodName = methodName.substring(0, methodName.length - 2);
                                    obj[methodName] = function () {
                                        var odata = new nho.odata();
                                        return odata.res(resource, id).get();
                                    };
                                    obj[methodName].id = id;
                                })();
                            } else if (obj[j].__metadata.type == "Microsoft.Crm.Sdk.Data.Services.EntityReference") {
                                (function () {
                                    var methodName = j;
                                    obj[methodName] = function () { return null; };
                                })();
                            }
                        } else if (obj[j].hasOwnProperty("__deferred")) {
                            (function () {
                                var prop = j;
                                var url = obj[prop].__deferred.uri;
                                var start = url.indexOf("OrganizationData.svc") + 20;
                                url = _url + url.substring(start);
                                var methodName = prop;
                                if (methodName.endsWith("Id")) methodName = methodName.substring(0, methodName.length - 2);
                                obj[methodName] = function (callback) {
                                    var _od = new nho.odata();
                                    return _od.execUrl(callback, url);
                                };
                            })();
                        }
                    } else if (obj[j] != undefined && typeof obj[j] == "string" && obj[j].indexOf("/Date(") != -1) {
                        obj[j] = new Date(
                           parseInt(obj[j].substring(6, obj[j].length - 1), 10)
                        );
                    }
                }
            }
        }

        function _get(yield, __nextUrl) {
            var url = __nextUrl || _url + _resourcePath + (_queryPath.length > 0 ? "?" + _queryPath.substring(1) : "");
            var results;
            var options = {
                type: "GET",
                beforeSend: function (req) { req.setRequestHeader("Accept", "application/json"); },
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                url: url,
                error: function (xhr, status, ex) {
                    alert(ex);
                }
            };
            var res = [];
            if (yield) {
                options.success = function (data) {
                    if (!data.d["results"]) {
                        res = data.d;
                    } else {
                        res = Arrays(res).addAll(data.d.results);
                    }
                    if (data.d.__next) {
                        (function () {
                            var nextUrl = data.d.__next;
                            var start = nextUrl.indexOf("OrganizationData.svc") + 20;
                            nextUrl = _url + nextUrl.substring(start);
                            res.next = function (callback) {
                                var _od = new nho.odata();
                                return _od.execUrl(callback, nextUrl);
                            };
                        })();
                    }
                    if (_generateLazyLoaders) _createLazyLoaders(res);
                    yield(res);
                    _generateLazyLoaders = true;
                };
            } else {
                options.async = false;
                options.success = function (data) {
                    var res = data.d.results || data.d;
                    results = res;
                };
            }
            $.ajax(options);
            _destroy();
            if (results != undefined && _generateLazyLoaders)
                _createLazyLoaders(results);
            if (!yield) _generateLazyLoaders = true;
            return results;
        }
        function _save(object, operation, yield) {
            /*if (object.push) {
                var batchMediaType = "multipart/mixed";
                var boundary = "batch_" + hex16() + "-" + hex16() + "-" + hex16();
                var data = "";
                Arryas(object).each(function(item) {
                    data += "\r\n--" + boundary + "\r\n";
                    var changeSetBoundary = "changeset_" + hex16() + "-" + hex16() + "-" + hex16();
                    data += "Content-Type: multipart/mixed; boundary=" + changeSetBoundary + "\r\n";
                });
                data += "\r\n--" + boundary + "--\r\n";
            }
            */
            for (var i in object) {
                // remove lazy loaders if present.
                if (typeof object[i] == "function") delete object[i];
            }
            var data = JSON.stringify(object);
            var url = _url + _resourcePath + (_queryPath.length > 0 ? "?" + _queryPath.substring(1) : "");
            var options = {
                type: "POST",
                beforeSend: function (req) {
                    req.setRequestHeader("Accept", "application/json");
                    if (operation == "update") {
                        req.setRequestHeader("X-HTTP-Method", "MERGE");
                    } else if (operation == "delete") {
                        req.setRequestHeader("X-HTTP-Method", "DELETE");
                    }
                },
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                url: url,
                data: data,
                error: function (xhr, status, ex) {
                    alert(ex);
                }
            };
            var results;
            if (yield) {
                options.success = function (data) {
                    yield(data);
                };
            } else {
                options.async = false;
                options.success = function (data) {
                    results = data.d.results || data.d;
                };
            }
            $.ajax(options);
            _destroy();
            return results;
        }
        function _create(object, yield) {
            return _save(object, "create", yield);
        }
        function _update(object, yield) {
            return _save(object, "update", yield);
        }
        function _delete(object, yield) {
            return _save(object, "delete", yield);
        }
        function _top(top) {
            if (_queryPath.indexOf("$top=") == -1) _queryPath += "&$top=" + top;
            return {
                get: _get,
                select: _select,
                orderby: _orderby,
                filter: _filter,
                addLoad: _addLoad
            };
        }
        function _select(fields) {
            if (_queryPath.indexOf("$select=") == -1) _queryPath += "&$select=" + fields;
            return {
                get: _get,
                top: _top,
                orderby: _orderby,
                filter: _filter,
                addLoad: _addLoad
            };
        }
        function _addLoad(fields) {
            if (_queryPath.indexOf("$expand=") == -1) _queryPath += "&$expand=" + fields;
            return {
                get: _get,
                top: _top,
                orderby: _orderby,
                filter: _filter,
                select: _select
            };
        }
        function _orderby(fields) {
            if (_queryPath.indexOf("$orderby=") == -1) {
                _queryPath += "&$orderby=" + fields;
                return {
                    get: _get,
                    top: _top,
                    select: _select,
                    asc: _asc,
                    desc: _desc,
                    filter: _filter,
                    addLoad: _addLoad
                };
            } else {
                return {
                    get: _get,
                    top: _top,
                    select: _select,
                    filter: _filter,
                    addLoad: _addLoad
                };
            }
        }
        function _asc() {
            _queryPath += " asc";
            return {
                get: _get,
                top: _top,
                select: _select,
                orderby: _orderby,
                filter: _filter,
                addLoad: _addLoad
            };
        }
        function _desc() {
            _queryPath += " desc";
            return {
                get: _get,
                top: _top,
                select: _select,
                orderby: _orderby,
                filter: _filter,
                addLoad: _addLoad
            };
        }
        function _filter(value) {
            if (_queryPath.indexOf("$filter=") == -1) {
                _queryPath += "&$filter=" + value;
            }
            return {
                get: _get,
                top: _top,
                orderby: _orderby,
                select: _select,
                addLoad: _addLoad
            };
        }
        function _destroy() {
            _resourcePath = "";
            _queryPath = "";
        }

        function _defer(callback) {
            var loader = function (items) {
                var _items = [];
                var handler;
                handler = function (items) {
                    _items = Arrays(_items).addAll(items);
                    if (items.hasOwnProperty("next")) {
                        items.next(handler);
                    } else {
                        callback(_items);
                    }
                };
                handler(items);
            };
            return loader;
        }

        function _braces(id) {
            if (id.indexOf("{") == -1) return "{" + id + "}";
            else return id;
        }

        this.lazy = _lazy;
        this.res = _res;
        this.destroy = _destroy;
        this.execUrl = _get;
        this.defer = _defer;
        this.addLoad = _addLoad;
        this.debrace = function (id) {
            return id.replace("{", "").replace("}", "");
        };
        this.braces = _braces;
    }

    if (!context["nho"]) context.nho = {};
    context.nho.odata = _od;
    context.nho.odata.sets = {
        businessunit: "BusinessUnit",
        systemuser: "SystemUser",
        sn_medlemsorganisation: "SN_medlemsorganisation",
        sn_kollektivavtal: "Sn_Kollektivavtal",
        account: "Account"
    };
})(this);