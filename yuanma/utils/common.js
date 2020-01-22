const app = getApp();


// 解析链接中的参数
let getQueryString = function (url, name) {
    // console.log("url = " + url);
    // console.log("name = " + name);
    var reg = new RegExp('(^|&|/?)' + name + '=([^&|/?]*)(&|/?|$)', 'i');
    var r = url.substr(1).match(reg);
    if (r != null) {
        // console.log("r = " + r);
        // console.log("r[2] = " + r[2]);
        return r[2];
    }
    return null;
}

module.exports = {
    getQueryString: getQueryString,
}