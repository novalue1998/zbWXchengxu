var app = getApp();
var utils = require('md5.js');
var notificationCenter = require('notification.js');
var apisecret = '4c85e432n4n0z9fjdl00';
var timestamp = Date.parse(new Date());
timestamp = timestamp / 1000;
var sign = utils.hex_md5(timestamp + apisecret);

function sessionId() {
    var that = this;
    wx.login({
        success: function (res) {
            var code = res.code; //登录凭证
            wx.request({
                url: 'https://wxapp.ruyigou.com/index.php/xcx/getSid',
                data: {
                    code: code,
                    sign: sign,
                    time: timestamp
                },
                method: 'POST',
                header: {
                    'content-type': 'application/json'
                },
                success: function (e) {
                    var sessionId = e.data.data.sessionid;
                    wx.setStorageSync('sessionId', sessionId);
 
                }
            })
        }
    })
}
function userInfo(){
    var that = this;
    var sessionId = wx.getStorageSync('sessionId');
    if (sessionId){
        wx.request({
            url: 'https://wxapp.ruyigou.com/index.php/xcx/userTransfer',
            data: {
                appid: 'wx0ae5e7e4b7ffd8ba',
                sign: sign,
                time: timestamp,
                method: 'get_user_msg',
                sessionid: sessionId
            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: function (e) {
                var jsonData = JSON.parse(e.data);
                var memberData = {
                    cid: jsonData.data.card_msg.cid,
                    card_num: jsonData.data.card_msg.card_num,
                    cust_type: jsonData.data.card_msg.cust_type,
                    uc_uid: jsonData.data.user_msg.uc_uid,
                    status: jsonData.data.status,
                    username: jsonData.data.user_msg.username,
                };
                wx.setStorageSync('memberData', memberData);
            },
        })
    }else{
        wx.reLaunch({
            url: '/pages/authorize/index',
        })
    }
    
}
function suijichuan(){

        var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
        var nums = "";
        for (var i = 0; i < 32; i++) {
            var id = parseInt(Math.random() * 61);
            nums += chars[id];
        }
        return nums;
    
}
module.exports = {
    sessionId: sessionId,
    userInfo: userInfo,
    suijichuan:suijichuan
    
}        
        