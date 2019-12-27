function toObj(str){
    let obj = {}
    let arr = str.slice(1).split('&');
    arr.map(k => {
        let v = k.split('=')
        obj[v[0]] = v[1]
    })
    return obj;
}

function toStr(obj){
    let arr = [];
    Object.keys(obj).forEach(key => {
        arr.push(`${key}=${obj[key]}`);
    })
    return arr.join('&');
}