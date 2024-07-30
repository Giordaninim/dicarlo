async function saveMessebericht() {
    let params = "";
    let _objs = document.querySelectorAll('[id^="i-"]');
    for (i=0; i<_objs.length; i++){
        let _key = _objs[i].id.replace("i-", "");
        let _value = "";
        //let _obj = document.getElementById("i-"+_key);
        let _obj = _objs[i];
        //tagName return upper_values for tags
        if(_obj.tagName == "INPUT" || Object.tagName == "TEXTAREA") {
            _value = (_obj.tagName)

        } 
        switch (_obj.tagName){
            case "TEXTAREA":
                _value = encodeURIComponent(_obj.value.replace(/(\r?\n)/g, '\\n'));
                break;
            case "SELECT":
                _value = _obj.options[_obj.selectedIndex].value;
                params += "&" + "_TXT=" + encodeURIComponent(_obj.options[_obj.selectedIndex].text);
                break;
            case "INPUT": _value = encodeURIComponent(_obj.value);
            break;
        }





    }



}