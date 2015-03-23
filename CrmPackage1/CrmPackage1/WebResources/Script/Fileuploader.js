var FileAppender = function (parentControlId, prop, errorCallBack) {

    this.InitializeUploader = function (parentControlId) {
        /// <signature>
        ///<summary>Initiates EvidenceAppender</summary>
        /// </signature>
        var self = this;
        var btnEvidenceUploader = document.createElement("input");
        btnEvidenceUploader.id = "btnEvidenceUploader";
        btnEvidenceUploader.className = "fileuploadelement";
        btnEvidenceUploader.value = "Upload";
        btnEvidenceUploader.type = "file";
        if (prop != null) {
            if (prop.accept != undefined && prop.accept != null)
                btnEvidenceUploader.accept = prop.mimeType;
        }
        var parentControl = document.getElementById(parentControlId);
        parentControl.appendChild(btnEvidenceUploader);
        this.btnEvidenceUploader = btnEvidenceUploader;
        this.btnEvidenceUploader.addEventListener("change", this.OnChangeHandler, false);
    }

    this.GetFileName = function (isInternal) {
        /// <signature>
        ///<summary>Gets the selected file name</summary>
        /// </signature>
        var files = this.btnEvidenceUploader.files;
        if (!files.length > 0) {
            alert("Please select a file to proceed");
            return;
        }
        else {
            return files[0].name;
        }
    }

    this.GetMimeType = function (fileData) {
        /// <signature>
        ///<summary>Gets the Mime Type of selected file</summary>
        /// </signature>
        var result = fileData.substring(5, fileData.indexOf(";base64,"));
        if (!result) {
            result = "";
        }
        return result;
    }

    this.GetFileInBytes = function (successCallBack) {
        /// <signature>
        ///<summary>Gets the file data in bytes</summary>
        /// </signature>
        function CallBack(file) {
            var fileData = file.fileData;
            fileData = fileData.substring(fileData.indexOf(";base64,") + 8, fileData.length);
            successCallBack(fileData);
        }
        var fileData = this.GetFile(CallBack);
    }

    this.GetFile = function (CallBack) {
        /// <signature>
        ///<summary>Gets the selected file</summary>
        /// </signature>
        var _self = this;
        var i = 0;
        var files = this.btnEvidenceUploader.files;
        if (files.length > 0) {
            var reader = new FileReader();
            reader.onloadend = function (event) {
                this.fileData = event.target.result;
                var fileProp = {};
                fileProp.fileName = _self.GetFileName(true);
                fileProp.mimeType = _self.GetMimeType(this.fileData);
                fileProp.fileData = this.fileData.substring(this.fileData.indexOf(";base64,") + 8, this.fileData.length);
                CallBack(fileProp);
            };

            reader.onerror = function (event) {
                 
                console.error("File could not be read! Code " + event.target.error.code);
                errorCallBack();
            };

            reader.readAsDataURL(files[i]);
        } else {
            CallBack(null);
            //alert("Please select a file to proceed");
           // errorCallBack();
        }
    }

    this.InitializeUploader(parentControlId);
}