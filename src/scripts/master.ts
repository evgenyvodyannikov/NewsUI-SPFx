export function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;
    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
}

export function removeParams(sParam) {
    var url = window.location.href.split('?')[0] + '?';
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;
    if (sPageURL != "") {
        var paramArr = sParam.toLowerCase().split(',');
        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');
            //if (sParameterName[0] != sParam) {
            if (paramArr.indexOf(sParameterName[0].toLowerCase()) == -1) {
                url = url + sParameterName[0] + '=' + sParameterName[1] + '&'
            }
        }
    }
    return url.substring(0, url.length - 1);
}

export function URL_add_parameter(url, param, value) {
    var hash = {};
    var parser = document.createElement('a');

    parser.href = url;

    var parameters = parser.search.split(/\?|&/);

    for (var i = 0; i < parameters.length; i++) {
        if (!parameters[i])
            continue;

        var ary = parameters[i].split('=');
        hash[ary[0]] = ary[1];
    }

    hash[param] = value;

    var list = [];
    Object.keys(hash).forEach(function (key) {
        list.push(key + '=' + hash[key]);
    });

    parser.search = '?' + list.join('&');
    return parser.href;
}
export function URL_add_parameters(url, paramsArray) { //[{paramKey, paramValue}]
    var hash = {};
    var parser = document.createElement('a');

    parser.href = url;

    var parameters = parser.search.split(/\?|&/);

    for (var i = 0; i < parameters.length; i++) {
        if (!parameters[i])
            continue;

        var ary = parameters[i].split('=');
        hash[ary[0]] = ary[1];
    }

    paramsArray.forEach(function (p) {
        hash[p.paramKey] = p.paramValue;
    });


    var list = [];
    Object.keys(hash).forEach(function (key) {
        list.push(key + '=' + hash[key]);
    });

    parser.search = '?' + list.join('&');
    return parser.href;
}


export function isLocalStorageSupported(): boolean {
    try {
        return 'localStorage' in window && window["localStorage"] !== null
    }
    catch (e) {
        return false;
    }
}

export function getPageByRole(role): any {
    return $.ajax({
        url: "/_api/web/lists/getbytitle('Страницы сайта')/items?$filter=PortalPageRole/Title eq '" + role + "'&$select=FileRef",
        type: "GET",
        async: false,
        headers: { "accept": "application/json;odata=verbose" }
    });
}

export function logError(error): void {
    console.log(JSON.stringify(error));
}