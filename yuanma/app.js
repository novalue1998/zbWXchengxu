//1.4.1
var utils = require('utils/md5.js');
var notificationCenter = require('utils/notification.js');
const mtjwxsdk = require('utils/mtj-wx-sdk.js');
var common = require('utils/common.js');
var apisecret = '4c85e432n4n0z9fjdl00';
var timestamp = Date.parse(new Date());
timestamp = timestamp / 1000;
var sign = utils.hex_md5(timestamp + apisecret);
App({
    globalData: {
        appid: 'wx0ae5e7e4b7ffd8ba',
        secret: 'da6ad0c1a34d1a6e1c870e9bf550f074',
        notificationMessageCard_msg: 'card_msg',
        sign: sign,
        timestamp: timestamp,
        shop_code: "", //扫码开卡获取存入的shop_code
        shopCodeData: "", //正常流程存入的shop_code
        shopNameLocation: "", //正常流程存入的shop_name
        shopListLocation: "", //正常流程存入的shop_list
        cityCode:"",//正常流程存入的cityCode
        shopCodeDataPoster: "", //  海报正常存入的shopCode
        shopListLocationPoster: "", // 海报正常存入的shop_list

    },
    onLaunch: function(options) {
        var that = this;
        this.notificationCenter = notificationCenter.center();
    },
    sessionKey: function() {
        var that = this;
        var sessionId = wx.getStorageSync('sessionId');
        if (sessionId) {
            wx.checkSession({
                success() {
                    wx.request({
                        url: 'https://wxapp.ruyigou.com/index.php/xcx/validSid',
                        data: {
                            sid: sessionId,
                            sign: that.globalData.sign,
                            time: that.globalData.timestamp
                        },
                        method: 'POST',
                        header: {
                            'content-type': 'application/json'
                        },
                        success: function(e) {
                            if (e.data.code == 0) {
                                var memberData = wx.getStorageSync('memberData');
                                if (that.globalData.shop_code) {
                                    if (memberData.status == 1) {
                                        wx.reLaunch({
                                            url: '/pages/open/open',
                                        })
                                    } else if (memberData.status == 2 || memberData.status == 0) {
                                        wx.reLaunch({
                                            url: '/pages/index/index',
                                        })
                                    }
                                }
                            } else {
                                wx.removeStorageSync('sessionId');
                                wx.removeStorageSync('memberData');
                                wx.reLaunch({
                                    url: '/pages/index/index',
                                })
                            }
                        },
                        fail() { 
                            wx.removeStorageSync('sessionId');
                            wx.removeStorageSync('memberData');
                            wx.reLaunch({
                                url: '/pages/index/index',
                            })
                        }
                    })
                },fail() {
                    wx.removeStorageSync('sessionId');
                    wx.removeStorageSync('memberData');
                    wx.reLaunch({
                        url: '/pages/index/index',
                    })
                }
            })
        }else{
            wx.removeStorageSync('sessionId');
            wx.removeStorageSync('memberData');
        } 
    },

    onShow: function(options) {
        var that = this;
        if (options.query.q) {
            let qrUrl = decodeURIComponent(options.query.q);
            var shop_code = common.getQueryString(qrUrl, 'shop_code');
            var couponid = common.getQueryString(qrUrl, 'id');
            if (couponid){
                var showcoupon = "xianshi";
                wx.reLaunch({
                    url: '/pages/coupon-list-detail/coupon-list-detail?id=' + couponid + '&showcoupon=' + showcoupon,
                });
            }
            that.globalData.shop_code = shop_code;
            var memberData = wx.getStorageSync('memberData');
            if (shop_code && memberData !== "") {
                if (memberData.status == 1) {
                    wx.reLaunch({
                        url: '/pages/open/open',
                        success: function(res) {
                            return false;
                        }
                    })
                    return false;
                } else if (memberData.status == 2) {
                    wx.reLaunch({
                        url: '/pages/index/index',
                        success: function(res) {
                            return false;
                        }
                    })
                } else {
                    wx.reLaunch({
                        url: '/pages/authorize/index',
                        success: function(res) {
                            return false;
                        }
                    })
                }

            } else if (shop_code && memberData == "") {
                wx.reLaunch({
                    url: '/pages/authorize/index',
                    success: function(res) {
                        return false;
                    }
                })
            }
        } else {
            that.sessionKey();
        }

    },
    notificationCenter: null,
})