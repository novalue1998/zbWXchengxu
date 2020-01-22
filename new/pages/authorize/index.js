const app = getApp();
var api = require("../../utils/api.js");
Page({
    data: {
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        title: '掌尚北国小程序',
        content: '为了更好的用户体验，需要您授权微信手机号',
        okText: '去授权'
    },
    onShow: function() {
        wx.hideLoading();
    },
    bindGetUserInfo: function(event) {
        var that = this;
        wx.showLoading({
            title: '玩命加载中...',
            mask: true
        })
        //点击按钮出发事件
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    wx.login({
                        success: function(res) {
                            var code = res.code; //登录凭证
                            if (code) {
                                //2、调用获取用户信息接口
                                wx.getUserInfo({
                                    success: function(res) {
                                        var jsonData = JSON.parse(res.rawData);
                                        var nickname = jsonData.nickName;
                                        wx.setStorageSync('nickname', nickname);
                                
                                        //3.请求自己的服务器，解密用户信息 获取unionId等加密信息
                                        wx.request({
                                            url: api.login.sessionid,
                                            data: {
                                                info: res.encryptedData,
                                                iv: res.iv,
                                                code: code,
                                                sign: app.globalData.sign,
                                                time: app.globalData.timestamp
                                            },
                                            method: 'POST',
                                            header: {
                                                'content-type': 'application/x-www-form-urlencoded'
                                            },
                                            success: function(data) {
                                                if (data.statusCode === 200){
                                                    if (data.data !== "") {
                                                        if (data.data.code == "0") {
                                                            //4.解密成功后 获取自己服务器返回的结果
                                                            var sessionId = data.data.data.sessionid;
                                                            wx.setStorageSync('sessionId', sessionId);
                                                            that.userTransFer();
                                                        } else {
                                                            wx.hideLoading();
                                                            wx.showToast({
                                                                title: '网络请求超时，请重试！',
                                                                duration: 1500,
                                                                icon: 'none',
                                                            })
                                                        }
                                                    } else {
                                                        wx.hideLoading();
                                                        wx.showToast({
                                                            title: '网络请求超时，请重试！',
                                                            duration: 1500,
                                                            icon: 'none',
                                                        })

                                                    }
                                                }else{
                                                    wx.hideLoading();
                                                    wx.showToast({
                                                        title: '网络请求超时，请重试！',
                                                        duration: 1500,
                                                        icon: 'none',
                                                    })
                                                }
                                                
                                                
                                            
                                            },
                                        })
                                    }
                                })

                            } else {
                                wx.hideLoading();
                                wx.showToast({
                                    title: '网络请求超时，请重试！',
                                    duration: 1500,
                                    icon: 'none',
                                })
                            }
                        },
                        fail: function() {
                            wx.hideLoading();
                            wx.showToast({
                                title: '网络请求超时，请重试！',
                                duration: 1500,
                                icon: 'none',
                            })
                        }
                    })

                } else {
                    wx.hideLoading();
                    wx.showModal({
                        title: '警告',
                        content: '您点击了拒绝，将无法进入小程序，请点击允许后再进入小程序',
                        showCancel: false,
                        confirmText: '返回',
                        success: function(res) {
                            
                            if (res.confirm) {
                                that.setData({
                                    hasUserInfo: false
                                })
                            }
                        }
                    })

                }

            }
        })

    },
    getPhoneNumber: function(e) {
        wx.hideLoading();
        wx.login({
            success: function(res) {
                if (e) {
                    wx.request({
                        url: api.login.phone,
                        data: {
                            info: e.detail.encryptedData,
                            iv: e.detail.iv,
                            sign: app.globalData.sign,
                            code: res.code,
                            time: app.globalData.timestamp
                        },
                        method: 'POST',
                        header: {
                            'content-type': 'application/json'
                        },
                        success: function(phone) { //调用接口获取手机号
                            if (phone.statusCode === 200){
                                if (phone.data !== "") {
                                    if (phone.data.code == "0") {
                                        wx.showLoading({
                                            title: '玩命加载中...',
                                            mask: true
                                        })
                                        var phoneNumber = phone.data.data.phoneNumber;
                                        var sessionId = wx.getStorageSync('sessionId');
                                        if (app.globalData.shop_code) {
                                            var shop_codes = app.globalData.shop_code;
                                        } else {
                                            var shop_codes = app.globalData.shopCodeData;
                                        }
                                        wx.request({
                                            url: api.user.register,
                                            data: {
                                                appid: app.globalData.appid,
                                                mobile: phoneNumber,
                                                sign: app.globalData.sign,
                                                time: app.globalData.timestamp,
                                                method: 'register_wx',
                                                source: 'mp_zb',
                                                shop_code: shop_codes,
                                                sessionid: sessionId
                                            },
                                            method: 'POST',
                                            header: {
                                                'content-type': 'application/json'
                                            },
                                            success: function (e) {
                                                if(e.statusCode === 200){
                                                    if (e.data !== "") {
                                                        var jsonData = JSON.parse(e.data);
                                                        if (jsonData.errcode == "0") {

                                                            if (jsonData.data.status == 1) {
                                                                var memberData = {
                                                                    uc_uid: jsonData.data.user_msg.uc_uid,
                                                                    status: jsonData.data.status,
                                                                    username: jsonData.data.user_msg.username,
                                                                };
                                                                wx.setStorageSync('memberData', memberData);
                                                            } else if (jsonData.data.status == 2) {
                                                                var memberData = {
                                                                    cid: jsonData.data.card_msg.cid,
                                                                    card_num: jsonData.data.card_msg.card_num,
                                                                    cust_type: jsonData.data.card_msg.cust_type,
                                                                    uc_uid: jsonData.data.user_msg.uc_uid,
                                                                    status: jsonData.data.status,
                                                                    username: jsonData.data.user_msg.username,
                                                                };
                                                                wx.setStorageSync('memberData', memberData);
                                                                app.globalData.shop_code = "";
                                                            }
                                                            wx.hideLoading();
                                                            if (app.globalData.shop_code) {
                                                                wx.reLaunch({
                                                                    url: '../open/open',
                                                                })
                                                            } else {
                                                                wx.reLaunch({
                                                                    url: '../index/index',
                                                                })
                                                            }

                                                        } else {
                                                            wx.hideLoading();
                                                            wx.showToast({
                                                                title: '网络请求超时，请重试！',
                                                                duration: 1500,
                                                                icon: 'none',
                                                            })
                                                        }
                                                    } else {
                                                        wx.hideLoading();
                                                        wx.showToast({
                                                            title: '网络请求超时，请重试！',
                                                            duration: 1500,
                                                            icon: 'none',
                                                        })
                                                    }
                                                }else{
                                                    wx.hideLoading();
                                                    wx.showToast({
                                                        title: '网络请求超时，请重试！',
                                                        duration: 1500,
                                                        icon: 'none',
                                                    })  
                                                }
                                                



                                            }
                                        })

                                    }

                                } else {
                                    wx.hideLoading();
                                    wx.showToast({
                                        title: '网络请求超时，请重试！',
                                        duration: 1500,
                                        icon: 'none',
                                    })
                                }
                            }else{
                                wx.hideLoading();
                                wx.showToast({
                                    title: '网络请求超时，请重试！',
                                    duration: 1500,
                                    icon: 'none',
                                })
                            }
                            



                            


                        }
                    })
                }

            }
        })

    },
    userTransFer: function() {
        var sessionId = wx.getStorageSync('sessionId');
        if (sessionId){
            var that = this;
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
                    if(e.statusCode === 200){
                        if (e.data !== "") {
                            var jsonData = JSON.parse(e.data);
                            if (jsonData.errcode == "0") {

                                if (jsonData.data.status == 0) {
                                    wx.hideLoading();
                                    that.setData({
                                        hasUserInfo: true
                                    })
                                    that.getPhoneNumber();
                                } else {
                                    if (jsonData.data.status == 2) {
                                        app.globalData.shop_code = "";
                                        var memberData = {
                                            cid: jsonData.data.card_msg.cid,
                                            card_num: jsonData.data.card_msg.card_num,
                                            cust_type: jsonData.data.card_msg.cust_type,
                                            uc_uid: jsonData.data.user_msg.uc_uid,
                                            status: jsonData.data.status,
                                            username: jsonData.data.user_msg.username,
                                        };

                                    } else {
                                        var memberData = {
                                            uc_uid: jsonData.data.user_msg.uc_uid,
                                            status: jsonData.data.status,
                                            username: jsonData.data.user_msg.username,
                                        };

                                    }
                                    wx.setStorageSync('memberData', memberData);
                                    wx.hideLoading();
                                    if (app.globalData.shop_code) {
                                        wx.reLaunch({
                                            url: '../open/open',
                                        })
                                    } else {
                                        wx.reLaunch({
                                            url: '../index/index',
                                        })
                                    }

                                }

                            } else {
                                wx.hideLoading();
                                wx.showToast({
                                    title: '网络请求超时，请重试！',
                                    duration: 1500,
                                    icon: 'none',
                                })

                            }
                        } else {
                            wx.hideLoading();
                            wx.showToast({
                                title: '网络请求超时，请重试！',
                                duration: 1500,
                                icon: 'none',
                            })

                        }
                    }else{
                        wx.hideLoading();
                        wx.showToast({
                            title: '网络请求超时，请重试！',
                            duration: 1500,
                            icon: 'none',
                        })
                    }

                    
                    
                    

                },
            })

        }

    },
    zbLogin:function(){
        wx.navigateBack({
            delta: 1
        })
    }






})