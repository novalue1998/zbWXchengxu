const app = getApp();
var api = require("../../utils/api.js");
var utils = require('../../utils/md5.js');
var notificationCenter = require('../../utils/notification.js');
var apisecret = '4c85e432n4n0z9fjdl00';
var timestamp = Date.parse(new Date());
timestamp = timestamp / 1000;
var sign = utils.hex_md5(timestamp + apisecret);
Page({

    /**
     * 页面的初始数据
     */
    data: {
        inputValue: '',
        username: '',
    },
    onShow: function (options) {
        var that = this;
        var memberData = wx.getStorageSync('memberData');
        if (memberData.status == 2){
            that.setData({
                xianshi: 1
            });
        }

    },
    formSubmit: function(e) {
        
        var that = this;
        if (app.globalData.shop_code) {
            var shop_codes = app.globalData.shop_code;
        } else {
            var shop_codes = app.globalData.shopCodeData;
        }
        getApp().mtj.trackEvent('open_card', {
            shop_code: shop_codes,
        });
        wx.reportAnalytics('open_card', {});
        that.data.username = e.detail.value.username;
        var username = that.data.username;
        var mobile = e.detail.value.mobile;
        var idcard = e.detail.value.idcard;
        var password = e.detail.value.password;
        var myreg = /^1[3456789]\d{9}$/;
        var reg = /^[1-9][0-9]{5}([1][9][0-9]{2}|[2][0][0|1][0-9])([0][1-9]|[1][0|1|2])([0][1-9]|[1|2][0-9]|[3][0|1])[0-9]{3}([0-9]|[X])$/;
        if (username == '') {
            wx.showToast({
                title: '姓名不能为空!',
                icon: 'none'
            });
            return false;
        } else if (!(mobile.length === 11)) {
            wx.showToast({
                title: '手机号长度有误!',
                icon: 'none'
            });

            return false;
        } else if (!myreg.test(mobile)) {
            wx.showToast({
                title: '手机号有误！',
                icon: 'none'
            })
            return false;
        } else if (!(idcard.length === 18)) {
            wx.showToast({
                title: '请输入18位身份证号码!',
                icon: 'none'
            });

            return false;
        } else if (!idcard || !idcard.match(reg)) {
            wx.showToast({
                title: '身份证有误',
                icon: 'none'
            })
            return false;
        } else if (idcard.length == 18) {
            idcard = idcard.split('');
            //加权因子 
            var factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
            //校验位 
            var parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
            var sum = 0;
            var ai = 0;
            var wi = 0;
            for (var i = 0; i < 17; i++) {
                ai = idcard[i];
                wi = factor[i];
                sum += ai * wi;
            }
            var last = parity[sum % 11];
            if (parity[sum % 11] != idcard[17]) {
                wx.showToast({
                    title: '校验码有误',
                    icon: 'none'
                })
                return false;
            } else if (!(password.length === 6)) {
                wx.showToast({
                    title: '请输入6位验证码',
                    icon: 'none'
                })
                return false;
            } else {
                wx.showLoading({
                    title: '玩命加载中...',
                    icon: 'loading',
                    mask: true
                })
                var memberData = wx.getStorageSync('memberData');
                var uc_uid = memberData.uc_uid;
                idcard = idcard.join('');
                
                wx.request({
                    url: api.user.registercardnew,
                    data: {
                        name: username,
                        reg_mobile: mobile,
                        id_number: idcard,
                        reg_password: password,
                        time: app.globalData.timestamp,
                        method: 'register_card_new',
                        shop_code: shop_codes,
                        type1: 2,
                        sign: app.globalData.sign,
                        uc_uid: uc_uid,
                        source: "mp_zb"
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
                                duration: 3000,
                                icon: 'none'
                            });

                            return false;
                        } else {
                            if (app.globalData.shop_code) {
                                app.globalData.shop_code = "";
                                wx.reLaunch({
                                    url: '../index/index',
                                })

                            } else {
                                var sessionId = wx.getStorageSync('sessionId');
                                wx.request({
                                    url: api.user.registercardnew,
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
                                    success: function(e) {
                                        wx.hideLoading();
                                        wx.showToast({
                                            title: '开卡成功',
                                            icon: 'success',
                                            duration: 1500,
                                            mask: true
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
                                        var prevPage = pages[pages.length - 2];
                                        prevPage.setData({
                                            hasCard: true,
                                        })
                                        
                                        setTimeout(function () {
                                            app.notificationCenter.post(app.globalData.notificationMessageCard_msg, {
                                                "operation_type": '99999'
                                            });
                                            wx.navigateBack();
                                        }, 1500);


                                    },
                                })

                            }

                        }
                    }
                })

            }

        }
    },
    jumpBind: function() {
        getApp().mtj.trackEvent('bind_card_enter');
        wx.reportAnalytics('bind_card_enter', {});
        wx.navigateTo({
            url: '/pages/bind/bind',
        })
    },


})