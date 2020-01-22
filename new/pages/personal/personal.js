var app = getApp();
var api = require("../../utils/api.js");
Page({

    /**
     * 页面的初始数据
     */
    data: {
        vipCard:"",
    },
    gomember(){
        wx.navigateTo({
            url: '../memberbenefits/memberbenefits',
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        var sessionId = wx.getStorageSync('sessionId');
        var memberData = wx.getStorageSync('memberData');
        if (sessionId != "" && memberData != ""){
            wx.showToast({
                title: '玩命加载中...',
                icon: 'loading',
                mask: true
            })
            
            that.getHeadImg(that);
            that.getVipCard(that);
        }else{
            that.setData({
                head_img: '',
            })
        }
       
    },
    getHeadImg: function (that){
        var memberData = wx.getStorageSync('memberData');
        wx.request({
            url: api.user.getwxappuserinfo,
            data: {
                sign: app.globalData.sign,
                time: app.globalData.timestamp,
                uc_uid: memberData.uc_uid
            },
            method: 'POST', 
            header: {
                'content-type': 'application/json'
            },
            success: function (e) {
                if(e.statusCode === 200){
                    if (e.data !== "") {
                        that.setData({
                            head_img: e.data.photo_thum,
                            username: e.data.username
                        })
                    } else {
                        wx.showToast({
                            title: '网络请求超时，请重试！',
                            duration: 1500,
                            icon: 'none',
                        })
                    }
                }else{
                    wx.showToast({
                        title: '网络请求超时，请重试！',
                        duration: 1500,
                        icon: 'none',
                    }) 
                }
                
                

            }
        })
    },
    onPullDownRefresh: function () {
        var that = this;
        var sessionId = wx.getStorageSync('sessionId');
        var memberData = wx.getStorageSync('memberData');
        if (sessionId != "" && memberData != "") {
            wx.showToast({
                title: '玩命加载中...',
                icon: 'loading',
                mask: true
            })

            that.getHeadImg(that);
            that.getVipCard(that);
        } else {
            that.setData({
                head_img: '',
            })
        }
        wx.stopPullDownRefresh();

    },
    getVipCard: function (that){
        var that= this;
        var sessionId = wx.getStorageSync('sessionId');
        wx.request({
            url: api.user.userinformation,
            data: {
                appid: app.globalData.appid,
                sign: app.globalData.sign,
                time: app.globalData.timestamp,
                method: 'get_user_msg',
                sessionid: sessionId
            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: function (e) {
                if (e.statusCode === 200){
                    if (e.data !== "") {
                        var jsonData = JSON.parse(e.data);
                        if (jsonData.errcode == "0") {

                            var czz = jsonData.data.card_msg.czz;
                            if (jsonData.data.status == 2) {
                                if (jsonData.data.card_msg.cust_type == '001') {
                                    var grade = "VIP金卡";
                                } else if (jsonData.data.card_msg.cust_type == '002') {
                                    var grade = "SVIP铂金卡";
                                } else if (jsonData.data.card_msg.cust_type == '003') {
                                    var grade = "SVIP钻石卡";
                                } else {
                                    var grade = "VIP银卡";
                                }
                                that.setData({
                                    vipCard: grade,
                                    czz: czz
                                })
                            }
                        }
                    } else {
                        wx.showToast({
                            title: '网络请求超时，请重试！',
                            duration: 1500,
                            icon: 'none',
                        })
                    }
                }else{
                    wx.showToast({
                        title: '网络请求超时，请重试！',
                        duration: 1500,
                        icon: 'none',
                    })
                }
                
                
            }
        })
    },
    makePhoneCall: function () {
        wx.makePhoneCall({
            phoneNumber: '0311-89107362',
        })
    },
    goToApp:function(){
        wx.navigateTo({
            url: '../app/app',
        })
    },
    goTOStore:function(){
        wx.navigateTo({
            url: '../store/store',
        })
    },
    //跳转到我的活动
    goMyactive:function(){
        getApp().mtj.trackEvent('activity');
        wx.reportAnalytics('activity');
        wx.navigateTo({
            url: '../myactive/myactive',
        })
    },
})