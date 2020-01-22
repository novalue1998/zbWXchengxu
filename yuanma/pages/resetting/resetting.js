// pages/resetting/resetting.js
const app = getApp();
var api = require("../../utils/api.js");
var util = require('../../utils/util.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        pwd: '',
        showcoler: false,
        showNum: false,
        showtext: true,
        showtime: false,
        phonecode: '',
        phone: '',
    },
    gocouponlist() {
        wx.navigateTo({
            url: '../coupon-list/coupon-list',
        })
    },
    //验证码
    getPhonecode(e) {
        this.setData({
            getPhonecode: e.detail.value
        })
    },
    //新密码
    getPwd(e) {
        this.setData({
            firstPwd: e.detail.value
        })
    },
    //确认密码
    againPwd(e) {
        this.setData({
            secondPwd: e.detail.value
        })
    },
    //获取验证码
    getCode() {
        //发送验证码
        var memberData = wx.getStorageSync('memberData');
        var sessionId = wx.getStorageSync('sessionId');
        var cid = memberData.cid;
        wx.request({
            url: api.shop.getcardmobilecode,
            data: {
                appid: app.globalData.appid,
                sign: app.globalData.sign,
                time: app.globalData.timestamp,
                cid: cid,
                sessionid: sessionId
            },
            method: 'POST',
            success(e) {
            }
        })
        //倒计时
        var that = this
        var coden = 60 // 定义60秒的倒计时
        var codeV = setInterval(function() {
            that.setData({
                showtext: false,
                showtime: true,
                time: --coden,
            })
            if (coden == -1) {
                clearInterval(codeV)
                that.setData({
                    showtext: true,
                    showtime: false,
                })
            }
        }, 1000)
    },
    //确认重置
    submit(e) {
        var that = this;
        //判断验证码是否为空
        if (!this.data.getPhonecode) {
            wx.showToast({
                title: '验证码不能为空',
                icon: 'none',
                duration: 2000
            });
            return
            //判断密码是否为空
        } else if (!this.data.firstPwd) {
            wx.showToast({
                title: '密码不能为空',
                icon: 'none',
                duration: 2000
            })
            return
        }

        //判断密码是否为6位数数
        if (this.data.firstPwd.length !== 6) {
            that.setData({
                showNum: true,
            });
            return
        } else {
            that.setData({
                showNum: false
            })
        }
        //判断两次密码是否一样
        if (this.data.firstPwd !== this.data.secondPwd) {
            that.setData({
                showcoler: true
            })
            return
        } else {
            that.setData({
                showcoler: false
            })
        }
        //弹窗loading
        wx.showToast({
            title: '玩命加载中...',
            icon: "loading",
        }, 1000); 
        //确认重置
        if (this.data.firstPwd.length == 6 && this.data.firstPwd == this.data.secondPwd) {
            //发送提交数据
            var memberData = wx.getStorageSync('memberData');
            var sessionId = wx.getStorageSync('sessionId');
            var cid = memberData.cid;
            wx.request({
                url: api.shop.getzbsetcardpassword,
                data: {
                    appid: app.globalData.appid,
                    sign: app.globalData.sign,
                    time: app.globalData.timestamp,
                    cid: cid,
                    sessionid: sessionId,
                    mobile: that.data.phone,
                    passwd: this.data.firstPwd,
                    passwd1: this.data.secondPwd,
                    verify_code: this.data.getPhonecode,
                },
                method: 'POST',
                success(e) {
                    var jsonData = JSON.parse(e.data);
                    if (jsonData.errcode == 1) {
                        wx.showToast({
                            title: '验证码不存在',
                            icon: "none",
                        },500);
                         return;
                    } else if (jsonData.errcode == 0) {
                        wx.showToast({
                            title: '提交成功',
                            icon: "success",
                        }, 500);
                        setTimeout(() => {
                            wx.switchTab({
                                url: '../coupon-list/coupon-list',
                            })
                        }, 3000)
                    }
                    // setTimeout(() => {
                    //     wx.showToast({
                    //         title: '提交成功',
                    //         icon: "success",
                    //     },3000);
                    //     setTimeout(() => {
                    //         wx.hideToast();
                    //     }, 2000)
                    //     wx.switchTab({
                    //         url: '../coupon-list/coupon-list',
                    //     })
                    // },);
                    // wx.switchTab({
                    //         url: '../coupon-list/coupon-list',
                    //     })

                    // setTimeout(function(){ 
                    //     wx.showToast({
                    //         title: '修改成功',
                    //         icon: 'loading',
                    //         duration: 3000
                    //     });

                    //     wx.switchTab({
                    //         url: '../coupon-list/coupon-list',
                    //     })
                    // },1000)


                }
            });
        }
    },
    ishide() {
        var that = this;
        that.setData({
            showcoler: false,
            showNum: false,
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var that = this;
        var memberData = wx.getStorageSync('memberData');
        var cid = memberData.cid;
        if (cid) {
            that.setData({
                showModal: false,
            })
        } else {
            that.setData({
                showModal: true,
            })
        }
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
        var that = this;
        var memberData = wx.getStorageSync('memberData');
        var sessionId = wx.getStorageSync('sessionId');
        var cid = memberData.cid;
        //获取手机号
        wx.request({
            url: api.shop.getcardmobile,
            data: {
                appid: app.globalData.appid,
                sign: app.globalData.sign,
                time: app.globalData.timestamp,
                cid: cid,
                sessionid: sessionId
            },
            method: 'POST',
            success(e) {
                //手机号解析
                var jsonData = JSON.parse(e.data);
                var phone = jsonData.data.mobile;
                that.setData({
                    phone: phone
                });
                var phone = phone.substring(0, 3) + '****' + phone.substring(7, 11);
                that.setData({
                    encry: phone
                });

            }
        })
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