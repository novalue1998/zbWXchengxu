var app = getApp();
var api = require("../../utils/api.js");
const utils = require('../../utils/util.js');
var wxbarcode = require('../../utils/qrcode/index.js');
Page({
    data: {
        myactive:[],
        searchLoading: false,
        all: false,
        showModal: false,
        page_num: 1,
        per_page: 5,
        display:true,
        ordersn:'',
    },

    onShow: function () {
        var that = this;
        that.setData({ myactive: [], page_num: 1, per_page: 5, searchLoading: true, all: false,display:true})
        that.myActivity();
        wx.hideLoading();
    },
    // 我的活动列表
    myActivity:function(){
        wx.showLoading({
            title: '加载中...',
            icon: 'loading',
            mask: true
        })
        var that = this;
        var memberData = wx.getStorageSync('memberData');
        wx.request({
            url: api.member.myactive,
            data: {
                sign: app.globalData.sign,
                time: app.globalData.timestamp,
                version: '3.0.1',
                http_type: 1,
                page_num: that.data.page_num,
                per_page: that.data.per_page,
                uc_uid :memberData.uc_uid,
            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: function (e) {
                if(e.data.errcode == '0'){
                    wx.hideLoading();
                    var myactive = e.data.data;
                    if (myactive.length > 0) {
                        if (that.data.page_num == 1 && myactive.length < 5) {
                            var myactives = myactive;
                        } else {
                            var myactives = that.data.myactive.concat(myactive);
                        }
                        for (var i = 0; i < myactive.length; i++) {
                            // 获取开始时间
                            if (myactive[i].activity_begin_time != '') {
                                myactive[i].activity_begin_time = utils.formatTimeTwo(myactive[i].activity_begin_time, 'Y-M-D h:m');

                            }
                        }
                        if (myactives.length < 5) {
                            that.setData({
                                myactive: myactives,
                                all: true,
                                searchLoading: false,

                            })
                        } else {
                            that.setData({
                                myactive: myactives,
                                searchLoading: true,
                            })
                        }

                    } else {
                        if (that.data.page_num == 1){
                            that.setData({
                                display: false,
                                searchLoading: false,
                            })
                        }else{
                            that.setData({
                                all: true,
                                searchLoading: false,
                            })
                        }
                        
                    }

                }else if(e.data.errcode == '1'){
                    wx.hideLoading();
                    wx.redirectTo({
                        url: '../authorize/index',
                    })
                }
              


            }
        })
    },
    // 下拉加载
    onPullDownRefresh: function () {
        var that = this;
        that.setData({
            myactive: [], page_num: 1, per_page: 5, all: false
        });
        that.myActivity();
        wx.stopPullDownRefresh();
    },
    //上拉加载
    onReachBottom: function () {
        var that = this;
        if (!that.data.all) {
            that.setData({
                page_num: that.data.page_num + 1,
            });
            that.myActivity();
        } else {
            that.setData({
                all: true,
                searchLoading: false,
            });

        }
    },

    // 跳转优惠券详情页
    activityDetail: function (e) {
        var that = this;
        var activityId = e.currentTarget.dataset.activityid;
        wx.showLoading({
            title: '加载中',
            icon: 'loading',
            mask: true
        })
        wx.navigateTo({
            url: '../activity-detail/activity-detail?id=' + activityId,

        });
    },
    // 出示入场券
    showTicket: function (e) {
        wx.showLoading({
            title: '加载中',
            icon: 'loading',
            mask: true
        })
        var that = this;
        var orderId = e.currentTarget.dataset.orderid;
        getApp().mtj.trackEvent('my_show_ticket');
        wx.reportAnalytics('my_show_ticket', {
            orderid: e.currentTarget.dataset.orderid,

        });
        that.setData({
            showModal: true
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
                http_type: '1',
                version: '3.0.1'
            },
            success(e) {
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
            }
        })

    },
    //点击打电话
    makePhoneCall: function (e) {
        var that = this;
        var phone = e.currentTarget.dataset.phone;
        getApp().mtj.trackEvent('call_phone');
        wx.reportAnalytics('call_phone', {
            mobile: e.currentTarget.dataset.phone,

        });
        wx.makePhoneCall({
            phoneNumber: phone,
        })
    },
    close: function () {
        var that = this;
        that.setData({
            showModal: false
        })
    },
    // 核销
    wirteoff: function () {
        var that = this;
        that.setData({
            showModal: false
        })
        getApp().mtj.trackEvent('hexiao');
        wx.reportAnalytics('hexiao');
        wx.showModal({
            title: '',
            content: '请与活动工作人员当面核验,确定后视为已使用,确认使用吗?',
            showCancel: true,//是否显示取消按钮
            success: function (res) {
                if (res.confirm) {
                    var memberData = wx.getStorageSync('memberData');
                    var confirm = res.confirm;
                    getApp().mtj.trackEvent('confirm');
                    wx.reportAnalytics('confirm');
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
                            if (e.data.errcode == 0) {
                                wx.showToast({
                                    title: e.data.errmsg,
                                    duration: 1500,
                                    icon: 'none',
                                })
                                that.myActivity();
                            } else {
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
})