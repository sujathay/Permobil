if (typeof (Permobil) == "undefined") {
    Permobil = { __namespace: true };
}
Permobil.CRMMetaDataService = {};


Permobil.CRMMetaDataService.EntityDict = {};


Permobil.CRMMetaDataService.RetrieveEntity = function (entityName, CallBackSuccess, CallbackError) {

    function RetrieveEntity_Success(result) {
        Permobil.CRMMetaDataService.EntityDict[entityName] = result;
        CallBackSuccess(result);
    }
    function RetrieveEntity_Error(error) {
        CallbackError(error);
    }

    if (typeof (Permobil.CRMMetaDataService.EntityDict[entityName]) == "undefined") { 

        Permobil.Metadata.RetrieveEntity(Permobil.Metadata.EntityFilters.Entity | Permobil.Metadata.EntityFilters.Attributes, entityName, null, false, RetrieveEntity_Success, RetrieveEntity_Error);

    } else {
        CallBackSuccess(Permobil.CRMMetaDataService.EntityDict[entityName]);
    }
}


 