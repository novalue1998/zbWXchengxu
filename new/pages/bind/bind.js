const app = getApp();
var api = require("../../utils/api.js");
//倒计时功能
var countdown = 60;
var settime = function(that) {
    if (countdown == 0) {
        that.setData({
            codeIsCanClick: true
        })
        countdown = 60;
        return;
    } else {
        that.setData({
            codeIsCanClick: false,
            last_time: countdown
        })
        countdown--;
    }
    setTimeout(function() {
        settime(that)
    }, 1000)
}

Page({
    data: {
        isDisabled: true,
        isBind: false,
        codeIsCanClick: false,
        hasPhone: false,
        phone: '',
        yan: '',
        id_num: '',
        password: '',
        last_num: '',
        cid: ''
    },
    //输入手机号后点击下一步
    step: function() {
        wx.showToast({
            title: '加载中...',
            icon: 'loading',
            mask: true
        })
        getApp().mtj.trackEvent('bindcard_next');
        wx.reportAnalytics('bindcard_next', {});
        var that = this;
        settime(that);
        wx.request({
            url: api.user.usercardmsg,
            data: {
                sign: app.globalData.sign,
                time: app.globalData.timestamp,
                method: 'user_card_msg',
                type1: 2,
                id_type: '',
                send_sms: 1,
                is_binding: 1,
                card_hidden: 1,
                id_keyword: this.data.phone,

            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: function(res) {
                var data = JSON.parse(res.data);
                var news = data.data;
                if (news.card_status == 0) {
                    wx.showToast({
                        title: '未查询到会员卡相关信息，请核实后重新输入!',
                        icon: 'none'
                    });

                    return false;
                } else if (news.card_status == 1) {
                    wx.showToast({
                        title: '会员卡被锁定，请核实后重新输入!',
                        icon: 'none'
                    });
                    return false;
                } else if (news.card_status == 2) {
                    that.setData({
                        hasPhone: true,
                    })
                } else {
                    wx.showToast({
                        title: '会员卡已绑定!',
                        icon: 'none'
                    });
                    return false;
                }
                that.setData({
                    list: data.data

                })
                that.data.id_num = data.data.id_num;
                that.data.cid = data.data.cid;
            },


        })
    },
    //获取短信验证码
    goGetCode: function() {
        var that = this;
        settime(that); //输入手机号点击下一步出发倒计时功能
        wx.request({
            url: api.user.sendsmsrepeat,
            data: {
                sign: app.globalData.sign,
                time: app.globalData.timestamp,
                method: 'send_sms_repeat',
                type1: 2,
                cid: that.data.cid
            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: function(e) {
            }
        })

    },

    // 拿到手机号
    getPhone: function(e) {
        var that = this;
        var val = e.detail.value;
        that.setData({
            phone: val
        });
        if (that.data.phone.length >= 10) {
            that.setData({
                isDisabled: false
            })
        }
    },

    //获取身份证后六位
    getLastNum: function(e) {
        var that = this;
        var val = e.detail.value;

        var card_num = that.data.id_num + val;
        that.setData({
            last_num: card_num
        });
    },
    //获取验证码
    bindCodeInput: function(e) {
        var that = this;
        var val = e.detail.value;
        that.setData({
            yan: val
        });
    },
    //获取会员卡密码
    getPassword: function(e) {
        var that = this;
        var val = e.detail.value;
        that.setData({
            password: val
        });
    },

    onLoad: function() {
        wx.showToast({
            title: '玩命加载中...',
            icon: 'loading',
            mask: true
        })
    },

    //点击立即绑定后
    openCard: function() {
        
        getApp().mtj.trackEvent('bind_card');
        wx.reportAnalytics('bind_card', {});
        var that = this;
        var memberData = wx.getStorageSync("memberData") || {};
        var uc_uid = memberData.uc_uid;
        if (this.data.yan.length == 0 || this.data.id_num.length == 0 || this.data.password.length == 0) {
            wx.showToast({
                title: '验证码、身份证号码和密码不能为空!',
                icon: 'none'
            });
            return false;
        } else {
            if (this.data.yan.length !== 4) {
                wx.showToast({
                    title: '请输入4位验证码!',
                    icon: 'none'
                });
                return false;
            } else if (this.data.last_num.length !== 18) {
                wx.showToast({
                    title: '请输入18位身份证号码!',
                    icon: 'none'
                });
                return false;
            } else if (this.data.password.length !== 6) {
                wx.showToast({
                    title: '请输入6位密码!',
                    icon: 'none'
                });
                return false;
            }

        }
        wx.showLoading({
            title: '玩命加载中...',
            mask: true
        })
        if (app.globalData.shop_code) {
            var shop_codes = app.globalData.shop_code;
        } else {
            var shop_codes = app.globalData.shopCodeData;
        }
        wx.request({
            url: api.user.cardbind,
            data: {
                sign: app.globalData.sign,
                time: app.globalData.timestamp,
                method: 'card_bind',
                type1: 2,
                uc_uid: uc_uid,
                cid: that.data.cid,
                key_num: this.data.last_num,
                card_pwd: this.data.password,
                code: this.data.yan,
                source: "mp_zb",
                shop_code: shop_codes
            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: function(res) {
                var data = JSON.parse(res.data);
                if (data.errcode == 1) {
                    wx.showToast({
                        title: data.errmsg,
                        icon: 'none'
                    });

                    return false;
                } else {
                    if (app.globalData.shop_code) {
                        app.globalData.shop_code = "";
                        wx.reLaunch({
                            url: '../index/index',
                        })

                    }else{
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
                                wx.hideLoading();
                                wx.showToast({
                                    title: '绑卡成功',
                                    icon:'success',
                                    duration:1500,
                                    mask:true
                                })
                               
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
                                
                                that.setData({
                                    jiFen: jsonData.data.card_msg.total_jifen,
                                    couponNum: jsonData.data.card_msg.coupon_num
                                })
                                var pages = getCurrentPages();
                                var currPage = pages[pages.length - 1];
                                var prevPage = pages[pages.length - 3];
                                prevPage.setData({
                                    hasCard: true,
                                })
                                
                                setTimeout(function () {
                                    app.notificationCenter.post(app.globalData.notificationMessageCard_msg, {
                                        "operation_type": '88888'
                                    });
                                    wx.navigateBack({
                                        delta: 2,
                                    })
                                }, 1500);
                                

                            },
                        })

                    }

                }

            }
        })

    },

})