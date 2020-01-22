// pages/memberbenefits/memberbenefits.js
var api = require("../../utils/api.js");
var app = getApp();
var that;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        judgeshow: false,
        judgeshow1: false,
        img1show: false,
        img2show: false,
        img3show: false,
        img4show: false,
    },
    goViprules() {
        wx.navigateTo({
            url: '../viprules/viprules',
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        that = this;
        //拿到数据
        var sessionId = wx.getStorageSync('sessionId');
        var memberData1 = wx.getStorageSync('memberData');
        var memberData = memberData1.cid;
        wx.request({
            url: api.user.memberbenefits,
            data: {
                appid: app.globalData.appid,
                sign: app.globalData.sign,
                time: app.globalData.timestamp,
                sessionid: sessionId,
                cid: memberData
            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success(e) {

                var data = JSON.parse(e.data);
                var next_point = data.data.next_point - data.data.current_point;
                //判断data.errcode值来确定解析成功
                if (data.errcode == 0) {
                    that.setData({
                        growValue: data.data.current_point,
                        next_point: next_point.toFixed(2),
                        current_level: data.data.current_level,
                        next_level: data.data.next_level,
                    })
                } else {
                    wx.showToast({
                        title: '解析错误',
                        icon: 'loading',
                    })
                };
                //积分成长值判断
                if (data.data.current_level !== 'VIP钻石卡') {
                    that.setData({
                        judgeshow: true,
                    })
                } else {
                    that.setData({
                        judgeshow1: true,
                    })
                };
                //会员卡等级判断
                if (data.data.current_level == 'VIP银卡') {
                    that.setData({
                        img1show: true,
                    })
                } else if (data.data.current_level == 'VIP金卡') {
                    that.setData({
                        img2show: true,
                    })
                } else if (data.data.current_level == 'SVIP铂金卡') {
                    that.setData({
                        img3show: true,
                    })

                } else {
                    that.setData({
                        img4show: true,
                    })
                };
            }
        });

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    }
})