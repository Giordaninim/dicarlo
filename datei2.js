/* Kontaktbericht */

async function saveKontaktbericht(){
	let params = "";


	//Prüfen ob Pflichtfelder gesetzt sind
	if(validateMandatory()){

		document.getElementById("saveBtn").disabled = true;
		doMessage("Die Daten werden gespeichert...", true);

	    //Alle eingegebenen Informationen laden
    let _objs = document.querySelectorAll('[id^="i-"]');
    for(i=0;i<_objs.length;i++){
        let _key = _objs[i].id.replace("i-","");
        let _value = "";
        
        let _obj = document.getElementById("i-"+_key);

        if(_obj.tagName == "INPUT" || _obj.tagName == "TEXTAREA"){
            if(document.getElementsByName(_obj.name).length==2){
    		        //Telefonnummern
                _key = document.getElementById("i-"+_key).name.replace("i-","");
                
                let _1 = document.getElementsByName(_obj.name)[0].value;
                let _2 = document.getElementsByName(_obj.name)[1].value;
                _value = (_1 != "") ? _1+"/"+_2 : _2; 
                i++;
            }
            else {
                _value = (_obj.tagName == "TEXTAREA") ? encodeURIComponent(_obj.value.replace(/(\r?\n)/g, '\\n')) : encodeURIComponent(_obj.value);
            }
        }
        else if(_obj.tagName == "SELECT"){
        _value = _obj.options[_obj.selectedIndex].value;
            params += "&"+_key+"_TXT="+encodeURIComponent(_obj.options[_obj.selectedIndex].text);
        }
    		//params = (_value != "") ? params+"&"+_key+"="+_value : params;
        params = params+"&"+_key+"="+_value;
    }

    if(params == "&KUKDNR="+$("#i-KUKDNR").val()){
    	    //Keine Änderungen gefunden
        doMessage("!IBI.AMP.SPSpeichfe; !IBI.AMP.SPSpeichka;");
    }
    else {
        params += "&ACTION=insert";
        	//File hochladen
        let fileUpload = await fileUploadSubmit();
        if(fileUpload != false){
            params += "&FILENAME="+encodeURIComponent(fileUpload);
        }
            
        	//Speichern & XML-Datei
    	    	//wf.getJson("CRM/Kontaktbericht/Reports/kontaktbericht","_kontaktbericht_db",params+"&KUNDENNUMMER="+kundennummer,doMsgSaveKontaktbericht);
        let _saveReq = await fetch(wf.getUrl("CRM/Kontaktbericht/Reports/kontaktbericht","_kontaktbericht_db")+params+"&KUNDENNUMMER="+kundennummer);
        let _saveJson = await _saveReq.json();
        let _crmid = _saveJson.crm_id;

        if(document.getElementById("i-TO").selectedIndex > 0 || document.getElementById("i-CC").selectedIndex > 0 || document.getElementById("i-CC2").selectedIndex > 0 || document.getElementById("i-CC3").selectedIndex > 0 || document.getElementById("i-CC4").selectedIndex > 0 || document.getElementById("i-CC5").selectedIndex > 0){
         		//Mail verschicken
           //createMailSchedule(_crmid);
    }

        	//Nachricht zeigen, dass Speichern durch ist
        doMsgSaveKontaktbericht();
}
    }
}

async function fileUpload(fileStr){
    // EINFACHES UPLOAD VERSION 1
    fileStr = (typeof fileObj === "undefined") ? "" : "-"+fileStr;

    // TEIL 1 : hochladen ins Repository
    let fname = document.getElementById("file-contents"+fileStr).value;
    fname = fname.split("\\")[fname.split("\\").length-1].substring(0,43);
    let timestamp = getTimestamp();
    fname = timestamp+"_"+fname;
    document.getElementById("file-contents"+fileStr).name = fname;
    
    let f = document.getElementById("file-upload"+fileStr);
    f.submit();
    
    // TEIL 2 : Prozedur anstossen damit die Datei auf dem Reporting Server gespeichert wird
    let _setResponse = await fetch(wf.getUrl("CRM/Kontaktbericht/Reports/kontaktbericht","_kontaktbericht_uploadfile")+"&FILENAME="+fname);
    let _setResponseTxt = await _setResponse.json();
    if(_setResponse.status == 200){
        //Datei hochgeladen, nun muss die Datei noch gelöscht werden aus der Zwischenablage
        let _deleteFile = await deleteTempFile("IBFS:/WFC/Repository/CRM/temp_files/"+fname);

        return fname;
    }
    else {
        //doMessage("FEHLER : Datei hochladen fehlgeschlagen.");
        return false;
    }
}

async function fileUploadSend(file){
    // *** TEIL 1 : hochladen ins Repository ***
    
    //Dateiname mit Datum & Zeit generieren
    let timestamp = getTimestamp();

    let fileparts = file.name.replace(/[\s()]/gi,"_").split(".");
    //substring : Dateiname abkürzen auf 40 Buchstaben, weil sonst WF die Datei nicht akzeptiert
    let fname = fileparts.slice(0,-1).join('_').substring(0,40) + "." + fileparts.slice(-1);
    fname = timestamp+"_"+fname;
    
    // Get WFRS token
    let rndm = Math.random();
    let xmlParser = new DOMParser();
    let _csrf = await fetch("/ibi_apps/service/wf_csrf_check.jsp?random="+rndm);
    let _csrfXml = await _csrf.text();
    let csrfTokenName = xmlParser.parseFromString(_csrfXml,"text/xml").getElementsByTagName('auth_result')[0].getElementsByTagName('result')[0].getAttribute("CSRFTokenName");
    let csrfToken = xmlParser.parseFromString(_csrfXml,"text/xml").getElementsByTagName('auth_result')[0].getElementsByTagName('result')[0].getAttribute("CSRFTokenValue");

    //Formular generieren
    let formData = new FormData();    
    formData.set(csrfTokenName,csrfToken);
    formData.set("path","IBFS:/WFC/Repository/CRM/temp_files");
    formData.set("type","BIP_DOCUMENT_UPLOAD");
    formData.set(fname,file);
    
    //Formular verschicken (Datei hochladen)
    let uploadReq = await fetch("/ibi_apps/reposupload.bip?BIP_REQUEST_TYPE=BIP_RESOURCE_UPLOAD_HP", { method: 'POST', body: formData});
    let uploadReqStatus = await uploadReq.status;
    if(uploadReqStatus == 200){
        //Upload erfolgreich 
            
        // *** TEIL 2 : Prozedur anstossen damit die Datei auf dem Reporting Server gespeichert wird ***
        let _setResponse = await fetch(wf.getUrl("CRM/Kontaktbericht/Reports/kontaktbericht","_kontaktbericht_uploadfile")+"&FILENAME="+encodeURIComponent(fname));
        let _setResponseTxt = await _setResponse.json();
        if(_setResponse.status == 200){
            //Datei hochgeladen, nun muss die Datei noch gelöscht werden aus der Zwischenablage
            //let _deleteFile = await deleteTempFile("IBFS:/WFC/Repository/CRM/temp_files/"+fname);
            return fname;
        }
        else {
            //doMessage("FEHLER : Datei hochladen fehlgeschlagen.");
            return false;
        }
    }
    else {
        return false;
    }
}

async function fileUploadSendWFRS(file){
    // *** TEIL 1 : hochladen ins Repository ***
    
    //Dateiname mit Datum & Zeit generieren
    let timestamp = getTimestamp();

    let fileparts = file.name.replace(/[\s()]/gi,"_").split(".");
    //substring : Dateiname abkürzen auf 40 Buchstaben, weil sonst WF die Datei nicht akzeptiert
    let fname = fileparts.slice(0,-1).join('_').substring(0,40) + "." + fileparts.slice(-1);
    fname = timestamp+"_"+fname;
    
    let _foldername = timestamp.substring(0,4);

    // Get WFRS token
    let rndm = Math.random();
    let xmlParser = new DOMParser();
    let _csrf = await fetch("/ibi_apps/service/wf_csrf_check.jsp?random="+rndm);
    let _csrfXml = await _csrf.text();
    let csrfTokenName = xmlParser.parseFromString(_csrfXml,"text/xml").getElementsByTagName('auth_result')[0].getElementsByTagName('result')[0].getAttribute("CSRFTokenName");
    let csrfToken = xmlParser.parseFromString(_csrfXml,"text/xml").getElementsByTagName('auth_result')[0].getElementsByTagName('result')[0].getAttribute("CSRFTokenValue");

    //Formular generieren
    let formData = new FormData();    
    formData.set(csrfTokenName,csrfToken);
    formData.set("path","IBFS:/EDA/EDASERVE/web/crm/upload/"+_foldername);
    formData.set("type","BIP_DOCUMENT_UPLOAD");
    formData.set(fname,file);
    
    //Formular verschicken (Datei hochladen)
    let uploadReq = await fetch("/ibi_apps/reposupload.bip?BIP_REQUEST_TYPE=BIP_RESOURCE_UPLOAD_HP", { method: 'POST', body: formData});
    let uploadReqStatus = await uploadReq.status;

    if(uploadReqStatus == 200){
        //Upload erfolgreich 
        return fname;
    }
    else {
        return false;
    }
}
async function fileUploadSendDotNet(file){
    // *** hochladen über .NET ***
    
    //Dateiname mit Datum & Zeit generieren
    let timestamp = getTimestamp();

    let fileparts = file.name.replace(/[\s()]/gi,"_").split(".");
    //substring : Dateiname abkürzen auf 40 Buchstaben, weil sonst WF die Datei nicht akzeptiert
    let fname = fileparts.slice(0,-1).join('_').substring(0,40) + "." + fileparts.slice(-1);
    fname = timestamp+"_"+fname;
    
    //Formular generieren
    let formData = new FormData();    
    formData.set("file",file,fname);
    
    //Formular verschicken (Datei hochladen)
    let uploadReq = await fetch("/uploadcrm/UploadHandler.ashx", { method: 'POST', mode: 'cors', body: formData});
    let uploadReqStatus = await uploadReq.status;

console.log("uploadReqStatus",uploadReqStatus);

    if(uploadReqStatus == 200 || uploadReqStatus == 0){
        //Upload erfolgreich (0 bei no-cors)
        return fname;
    }
    else {
        return false;
    }
}

let fileList = [];
function fileUploadParse(e,fileObj){
    //fileList = [];
    //console.log("fileList empty");
    for(let i=0;i<fileObj.files.length; i++){
        fileList.push(fileObj.files[i]);
        console.log("fileList filled");
    }
}

async function fileUploadSubmit(){
    let ret = "";
    for(let f=0;f<fileList.length;f++){
//       let u = await fileUploadSendWFRS(fileList[f]);
    let u = await fileUploadSendDotNet(fileList[f]);
        if(!u){
        ret = false;
        break;
    }
    else {
        ret = (ret == "") ? u : ret+"#"+u;
    }
    }
    ret = (ret == "") ? false : ret;
    return ret;
}

function showNextUpload(e, obj, id){
    fileUploadParse(e, obj);
    document.getElementById("file-input-"+id).style.display="inline-block";
    if(document.getElementById("file-input-"+id+"-btn")){
        document.getElementById("file-input-"+id+"-btn").style.display="inline-block";
    }
}

function emptyFileUpload(o){
    if(o.value != ""){
        let _filename = o.value.split("\\")[o.value.split("\\").length-1];
        removeFile(_filename);
        
        o.value = '';
        let i = parseInt(o.id.split("-")[o.id.split("-").length -1],10) + 1;
        if(document.getElementById("file-input-"+i).value == ""){
            document.getElementById("file-input-"+i).style.display = "none";
            if(document.getElementById("file-input-"+i+"-btn")){
                document.getElementById("file-input-"+i+"-btn").style.display="none";
            }
        }
    }
}

function removeFile(_path){
    for(let f=0;f<fileList.length;f++){
        if(_path == fileList[f].name){
            fileList.splice(f,1);
            break;
        }
    }
}

function doMsgSaveKontaktbericht(){
    doMessage("Kontaktbericht gespeichert."); 

    document.getElementById("saveBtn").disabled = false;

    //Kontakthistorie neuladen
    parent.parent.refreshTab(parent.parent.document.getElementById("a-Kontakthistorie"),true);

	//Werte zurücksetzen
	let _objs = document.querySelectorAll('[id^="i-"]');
	for(i=0;i<_objs.length;i++){
		let _key = _objs[i].id.replace("i-","");
		let _value = "";

		let _obj = document.getElementById("i-"+_key);
		if(_obj.tagName == "INPUT" || _obj.tagName == "TEXTAREA"){
			if(_obj.id == "i-vmptermindat"){
				let _now = new Date();
				_obj.value = _now.toISOString().split('T')[0];
			}
			else {
				_obj.value = "";
			}
		}
		else if(_obj.tagName == "SELECT"){
			for(o=0;o<_obj.options.length;o++){
				_obj.selectedIndex = 0;
			}
		}
	}
	emptyFileUpload(document.getElementById('file-input-1'));
	emptyFileUpload(document.getElementById('file-input-2'));
	emptyFileUpload(document.getElementById('file-input-3'));
}

function hideMessage(){
    document.getElementById("message-dialog").classList.remove("show");
}

function setChange(){
    //Nothing to execute
}
