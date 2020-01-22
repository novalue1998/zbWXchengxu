var app = getApp();
var api = require("../../utils/api.js");
const utils = require('../../utils/util.js');
var WxParse = require('../../utils/wxParse/wxParse.js');
var wxbarcode = require('../../utils/qrcode/index.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        mobile: '',
        showModal:false,
        showPoster:false,
        id:'',
        orderid:'',
        ordersn:'',
        photo:'',
        showShare:false,
        activitydetail:"",
    },    

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var that = this; 
        if (options.scene) {
            var activityid = options.scene;
        }else{
            var activityid = options.id;
        }
        that.setData({
            id: activityid,
        })


    },
    onShow:function(options){
            var that = this;
        that.activity_detail();      
    },
    // 活动详情
    activity_detail:function(){
        wx.showLoading({
            title: '加载中...',
            icon: 'loading',
            mask: true
        })
        var that = this; 
        var memberData = wx.getStorageSync('memberData');
        wx.request({
            url: api.member.activitydetail,
            method: 'POST',
            data: {
                sign: app.globalData.sign,
                time: app.globalData.timestamp,
                activityid: that.data.id,
                uc_uid: memberData.uc_uid,
                version: '3.0.1'
            },

            success(e) {
                var activitydetail = e.data.data;
                wx.hideLoading();
                var mobile = e.data.data.phone;
                WxParse.wxParse('active', 'md', activitydetail.content, that, 0);
                that.setData({
                    phone: mobile
                })
                activitydetail.activity_begin_times = activitydetail.activity_begin_time;
                activitydetail.activity_begin_time = utils.formatTimeTwo(activitydetail.activity_begin_time, 'Y年M月D日 h:m');
                activitydetail.activity_end_time = utils.formatTimeTwo(activitydetail.activity_end_time, 'Y年M月D日 h:m');
                if (activitydetail.cust_type != '') {
                    var cust_type = activitydetail.user_rank.indexOf(activitydetail.cust_type);
                    if (cust_type == "-1") {
                        activitydetail.lingqutype = "1";//当前等级不符合
                    } else {
                        activitydetail.lingqutype = "2";//等级符合
                    }

                }


                wx.hideLoading();
                that.setData({
                    activitydetail: activitydetail,
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
    //点击打电话
    makePhoneCall: function() {
        var that = this;
        wx.makePhoneCall({
            phoneNumber: that.data.phone,
        })
    },

    // 点击报名进入确认信息页面
    clickTicket:function(e){
        var that = this;
        var activityId = e.currentTarget.dataset.activityid;
        var cust_type = e.currentTarget.dataset.cust_type;
        var user_activity_status = e.currentTarget.dataset.user_activity_status;
        var title = e.currentTarget.dataset.title;
        getApp().mtj.trackEvent('enlist');
        wx.reportAnalytics('enlist');
        if (user_activity_status == '5'){
            if (cust_type == ''){
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
            }else{
                  wx.navigateTo({
                     url: '../comfirm/comfirm?id=' + activityId + '&title=' + title,
                });
            }
        }
      
    },
    // 出示入场券
    showTicket:function(e){
        wx.showLoading({
            title: '加载中',
            icon: 'loading',
            mask: true
        })
        var that = this;
        var orderId = e.currentTarget.dataset.orderid;
        getApp().mtj.trackEvent('show_ticket');
        wx.reportAnalytics('show_ticket', {
            orderid: e.currentTarget.dataset.orderid,

        });
        that.setData({
            showModal:true
        })
        var memberData = wx.getStorageSync('memberData');
        wx.request({
            url: api.member.showticket,
            method: 'POST',
            data: {
                sign: app.globalData.sign,
                time: app.globalData.timestamp,
                orderid: orderId,
                uc_uid: memberData.uc_uid,
                http_type:'1',
                version: '3.0.1'
            },
            success(e){               
                var entrance = e.data.data;            
                that.setData({
                    ordersn: entrance.order_sn
                })
                var barcode = entrance.barcode;
                var qrcode = entrance.qccode;
                entrance.activity_begin_time = utils.formatTimeTwo(entrance.activity_begin_time, 'Y-M-D');
                entrance.activity_end_time = utils.formatTimeTwo(entrance.activity_end_time, 'Y-M-D');
                wxbarcode.barcode('barcode', barcode, 580, 100);
                wxbarcode.qrcode('qrcode', qrcode, 270, 270);
                wx.hideLoading();
                that.setData({
                    entrance: entrance
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
    // 款台核销页面点击关闭
    close: function () {
        var that = this;
        that.setData({
            showModal: false
        })
    },
    // 跳转到我的活动页面
    goActive:function(){
        wx.navigateTo({
            url: '../myactive/myactive',
        })
    },
    // 核销
    wirteoff:function(){
        var that = this;
        that.setData({
            showModal: false
        })
        getApp().mtj.trackEvent('wirteoff');
        wx.reportAnalytics('wirteoff');
        wx.showModal({
            title: '',
            content: '请与活动工作人员当面核验,确定后视为已使用,确认使用吗?',
            showCancel: true,//是否显示取消按钮
            success: function (res) {
                if (res.confirm) {
                    var confirm = res.confirm;
                    getApp().mtj.trackEvent('confirm');
                    wx.reportAnalytics('confirm');
                    var memberData = wx.getStorageSync('memberData');
                    wx.request({
                        url: api.member.writeoff,
                        method: 'POST',
                        data: {
                            sign: app.globalData.sign,
                            time: app.globalData.timestamp,
                            ordersn: that.data.ordersn,
                            uc_uid: memberData.uc_uid,
                            version: '3.0.1'
                        },
                        success(e) {
                            if(e.data.errcode == 0){
                                wx.showToast({
                                    title: e.data.errmsg,
                                    duration: 1500,
                                    icon: 'none',
                                })
                                that.activity_detail();
                            }else{
                                wx.showToast({
                                    title: e.data.errmsg,
                                    duration: 1500,
                                    icon: 'none',
                                })
                            }

                        }
                    })
                } else if (res.cancel) {
                    var cancel = res.cancel;
                    getApp().mtj.trackEvent('cancel');
                    wx.reportAnalytics('cancel');
                    console.log('用户点击取消')
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
       
    },
    /**
     * 用户点击分享
     */
    shareposter:function(e){
        var that = this;
        var activityId = e.currentTarget.dataset.id;
        var shopname = e.currentTarget.dataset.shopname;
        var thumb = that.data.activitydetail.thumb;
        var title = that.data.activitydetail.title;
        var beginTime = that.data.activitydetail.activity_begin_times;
        getApp().mtj.trackEvent('shareposter');
        wx.reportAnalytics('shareposter', {
            title: that.data.activitydetail.title,

        });
        that.setData({
            showShare:true
        })
        wx.showLoading({
            title: '生成海报中...',
            icon: 'loading',
            mask: true
        })
        wx.request({
            url: api.member.share,
            method: 'POST',
            data: {
                sign: app.globalData.sign,
                time: app.globalData.timestamp,
                activity_id:activityId,
                shopname:shopname,
                title:title,
                thumb:thumb,
                beginTime:beginTime,
            },
            success(e){
                var photo = e.data.data.wxchatQcodeUrl;
                that.setData({
                    photo:photo
                })
                wx.hideLoading();
            }
        })
        that.setData({
            showPoster:true
        })
    },
    // 保存图片
    preserve:function(){
        wx.showLoading({
            title: '加载中...',
        })
        var that = this;
        var imgUrl = that.data.photo;
        getApp().mtj.trackEvent('save');
        wx.reportAnalytics('save');
        wx.downloadFile({
            url: imgUrl,
            success: function (res) {
                //图片保存到本地
                wx.saveImageToPhotosAlbum({
                    filePath: res.tempFilePath,
                    success: function (data) {
                        wx.hideLoading();
                        wx.showToast({
                            title: '保存图片成功',
                            icon: 'success',
                            duration: 3000
                        })
                    },
                    fail: function (err) {
                        wx.hideLoading();
                        if (err.errMsg === "saveImageToPhotosAlbum:fail auth deny" || err.errMsg ==="saveImageToPhotosAlbum:fail:auth                               denied"){
                        
                            wx.showModal({
                                title: '提示',
                                content: '需要您授权后才能保存图片哦!',
                                cancelText: '不授权',
                                confirmText: '授权',
                                success(res) {
                                    if (res.confirm) {
                                        wx.openSetting({
                                            success(settingdata) {
                                                if (settingdata.authSetting['scope.writePhotosAlbum']) {
                                                    wx.showModal({
                                                        title: '提示',
                                                        content: '获取权限成功,再次点击图片即可保存',
                                                        showCancel: false,
                                                    })
                                                } else {
                                                    wx.showModal({
                                                        title: '提示',
                                                        content: '获取权限失败，将无法保存到相册哦~',
                                                        showCancel: false,
                                                    })
                                                }
                                            }
                                        })
                                    } else if (res.cancel) {
                                        console.log('用户点击取消')
                                    }
                                }
                            })
                        }
                            wx.hideLoading();
 
                    },
                })
            }
        })
       
    },
    onShareAppMessage: function (res){
        var that = this;
        var activityid = that.data.activitydetail.id;
        var thumb = that.data.activitydetail.thumb;
        var title = that.data.activitydetail.title;
        var shopname = that.data.activitydetail.shop_name;
        getApp().mtj.trackEvent('activity_share');
        wx.reportAnalytics('activity_share', {
            title: that.data.activitydetail.title,

        });
        return {
            title: shopname + "邀您参加:"+ title,
            path: '/pages/activity-detail/activity-detail?id=' + activityid,
            imageUrl: thumb,
            success: function (shareTickets) {
                console.info(shareTickets + '成功');
                // 转发成功
            },
            fail: function (res) {
                console.log(res + '失败');
                // 转发失败
            },
            complete: function (res) {
                // 不管成功失败都会执行
            }
        }
    },
    closeModel:function(){
        var that = this;
        that.setData({
            showPoster: false,
            showShare: false,
        })
    },
    move:function(){
        return;
    },
})