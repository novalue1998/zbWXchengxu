var app = getApp();
var api = require("../../utils/api.js");
const utils = require('../../utils/util.js');
var WxParse = require('../../utils/wxParse/wxParse.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        title:'',
        name:'',
        phone:'',
        username:'',
        activityid:'',
        showModal: false,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
         wx.showLoading({title: '加载中',mask: true});
        var active_title = options.title;
        var activityid = options.id;
        that.setData({
            activityid:activityid
        })
        that.setData({
            title:active_title
        })
        var memberData = wx.getStorageSync('memberData');
        wx.request({
            url: api.member.comfirm,
            method: 'POST',
            data: {
                sign: app.globalData.sign,
                time: app.globalData.timestamp,
                activityid: activityid,
                uc_uid: memberData.uc_uid,
                version: '3.0.1'
            },

            success(e) {
                var information = e.data.data;
                that.setData({
                    name: information.realname,
                    phone: information.mobile,
                    username:information.username,
                    activityid:information.id
                })
                wx.hideLoading();
                that.setData({
                    message:information
                })
               
            },
            fail: function () {
                wx.hideLoading();
                wx.showToast({
                    title: '网络请求超时，请重试！',
                    duration: 1500,
                    icon: 'none',
                })
            }
        })

    },
    //获取手机号和姓名
    getName: function (e) {
        var that = this;
      var val = e.detail.value;
        that.setData({
            name: val
        });
    },
    getPhone: function (e) {
        var that = this;
        var val = e.detail.value;
        that.setData({
            phone: val
        });
    },
    submit:function(){
        var that = this;
        var myreg = /^1[3456789]\d{9}$/;
        getApp().mtj.trackEvent('comfirm_application');
        wx.reportAnalytics('comfirm_application');
        if (that.data.name == '' ){
            wx.showToast({
                title: '姓名不能为空',
                duration: 1500,
                icon: 'none',
            })
        } else if (that.data.phone.length != 11){
            wx.showToast({
                title: '请输入正确的手机号',
                duration: 1500,
                icon: 'none',
            })
        } else if (!myreg.test(that.data.phone)) {
            wx.showToast({
                title: '手机号有误！',
                duration: 1500,
                icon: 'none',
            })
        }else{
            wx.showLoading({ title: '加载中', mask: true });
            var memberData = wx.getStorageSync('memberData');
            wx.request({
                url: api.member.sumbit,
                method: 'POST',
                data: {
                    sign: app.globalData.sign,
                    time: app.globalData.timestamp,
                    activityid: that.data.activityid,
                    uc_uid: memberData.uc_uid,
                    phone: that.data.phone,
                    realname: that.data.name,
                    username: that.data.username,
                    version: '3.0.1'
                },

                success(e) {
                    var comfirm = e.data.data;
                    if (e.data.errcode == '0') {
                        wx.hideLoading();
                        that.setData({
                            showModal: true
                        })
                        var orderid = e.data.data.orderid;
                        that.setData({
                            orderid: orderid
                        })
                    } else if (e.data.errcode == '1') {
                        wx.hideLoading();
                        wx.showToast({
                            title: e.data.errmsg,
                            image: '../../img/warn.png',
                            mask: true,

                        })
                    } else {
                        wx.hideLoading();
                        wx.showModal({
                            content: '您还未绑卡,无法参与活动',
                            showCancel: true,
                            cancelText: '取消',
                            confirmText: '去绑卡',
                            success(res) {
                                if (res.confirm) {
                                    wx.navigateTo({
                                        url: '/pages/open/open',
                                    })
                                }
                            }
                        })
                    }


                },
                fail: function () {
                    wx.hideLoading();
                    wx.showToast({
                        title: '网络请求超时，请重试！',
                        duration: 1500,
                        icon: 'none',
                    })
                }
            })
        }
     
      
    },
    // 关闭报名成功过框
    close:function(e){
        var that = this;
        var orderId = e.currentTarget.dataset.orderid;
        getApp().mtj.trackEvent('shut');
        wx.reportAnalytics('shut');
        that.setData({
            showModal: false
        })
        wx.navigateBack({
            delta: 1
        })
    },
    goToMyactive:function(){
        getApp().mtj.trackEvent('go_to_myactive');
        wx.reportAnalytics('go_to_myactive');
        wx.redirectTo({
            url: '/pages/myactive/myactive',
        })
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})