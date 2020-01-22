const app = getApp();
var api = require("../../utils/api.js");
Page({
    data: {

    },
    onLoad: function (options) {
        wx.showToast({
            title: '加载中...',
            icon: 'loading',
        })
        var that = this;
        var memberData = wx.getStorageSync("memberData") || {};
        var username = memberData.username;
        var couponId = options.id
        var sessionId = wx.getStorageSync('sessionId');
        //请求优惠券详情接口
        wx.request({
            url: api.coupon.utfgcoupondetail,
            data: {
                http_type: 1,
                type1: 1,
                id: couponId,
                method: 'coupon_detail',
                version: '3.0.0',
                sessionid: sessionId,
                ryg_account: username,
                sign: app.globalData.sign,
                time: app.globalData.timestamp,
            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {
                var content = "https://mnews.ruyigou.com/index.php?c=index&a=wx_coupon_detail&id=" + couponId;
                that.setData({
                    content: content
                })
            }
        })

    },


})