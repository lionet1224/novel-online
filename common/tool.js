const { iconv } = require('./quick')

function toJson(data, msg){
    return {
        msg,
        data
    }
}

function toGBK(str){
    if(str==null || typeof(str)=='undefined' || str=='')
        return '';

    var a = str.toString().split('');

    for(var i=0; i<a.length; i++) {
        var ai = a[i];
        if( (ai>='0' && ai<='9') || (ai>='A' && ai<='Z') || (ai>='a' && ai<='z') || ai==='.' || ai==='-' || ai==='_') continue;
        var b = iconv.encode(ai, 'gbk');
        var e = ['']; // 注意先放个空字符串，最保证前面有一个%
        for(var j = 0; j<b.length; j++)
            e.push( b.toString('hex', j, j+1).toUpperCase() );
        a[i] = e.join('%');
    }
    return a.join('');
}

function encode(url){
    url = encodeURIComponent(url);
    url = url.replace(/\%3A/g, ":");
    url = url.replace(/\%2F/g, "/");
    url = url.replace(/\%3F/g, "?");
    url = url.replace(/\%3D/g, "=");
    url = url.replace(/\%26/g, "&");
    return url;
}

function checkReplite(replite){
    if(replite.status && replite.href) return true;
    return false;
}

function getClientIp(req){
    return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
}

function isURL(strUrl) {
    var regular = /^\b(((https?|ftp):\/\/)?[-a-z0-9]+(\.[-a-z0-9]+)*\.(?:com|edu|gov|int|mil|net|org|biz|info|name|museum|asia|coop|aero|[a-z][a-z]|((25[0-5])|(2[0-4]\d)|(1\d\d)|([1-9]\d)|\d))\b(\/[-a-z0-9_:\@&?=+,.!\/~%\$]*)?)$/i
    if (regular.test(strUrl)) {
        return true;
    }
    else {
        return false;
    }
}

module.exports = {
    toJson,
    toGBK,
    checkReplite,
    encode,
    getClientIp,
    isURL
}