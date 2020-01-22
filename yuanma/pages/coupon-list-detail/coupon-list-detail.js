var  app = getApp();
var WxParse = require('../../utils/wxParse/wxParse.js');
var api = require("../../utils/api.js");
Page({
    data: {
        showModal: false,
        isDisabled: true,
        evalue:'',
        mobile: '',
        password: '',
        couponid: '',
        timer: '',
        item:"",
        showcoupon:'',
        couponList: [],
        showNum: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
    
    },
    onShow: function (options) {
        var that = this;
        var memberData = wx.getStorageSync('memberData');
        var sessionId = wx.getStorageSync('sessionId');
        var nickname = wx.getStorageSync('nickname');
        that.setData({
            nickname:nickname
        })
        console.log(memberData)
        console.log(sessionId)
        if (memberData !== '' && sessionId !== '') {
            that.totalJiFen();
            that.getCardPhone();
        }

    },
    gocoupon(){
        wx.navigateTo({
            url: '../coupon/coupon',
        })
    },
    // 上下滑动专享礼券的展示和隐藏

    onPageScroll: function (res) {
        if (res.scrollTop == 0) {
            this.setData({
                left: '0'
            })
        } else {
            this.setData({
                left: '50%'
            })
        }
    },
    //点击领取事件
    clickReceive: function (e) {
        wx.showLoading({ title: '加载中', mask: true });
        var that = this;
        that.setData({
     
            isDisabled: true,
            showNum:false
        })
        var couponClickData = e.currentTarget.dataset;
        var couponid = e.currentTarget.dataset.couponid;
        var consume_credit = e.currentTarget.dataset.consume_credit;
        getApp().mtj.trackEvent('draw');
        wx.reportAnalytics('draw', {
            couponid: e.currentTarget.dataset.couponid,

        });
        if (couponClickData.coupon_status == '1') {
            wx.hideLoading();
            wx.navigateTo({
                url: '/pages/authorize/index',
            })
        } else if (couponClickData.coupon_status == '4') {
            wx.navigateTo({
                url: '/pages/coupon/coupon',
            })
        } else if (couponClickData.coupon_status == '5') {
            if (couponClickData.consume_credit !== '0.00') {
                wx.hideLoading();
                if (couponClickData.zcid == "xianshi") {

                    that.setData({
                        showModal: true,
                        consume_credit: consume_credit,
                        couponid: couponid
                    })
                } else {
                    wx.showModal({
                        content: '仅限北人电子会员兑换',
                        showCancel: true,
                        cancelText: '取消',
                        confirmText: '去开卡',
                        success(res) {
                            if (res.confirm) {
                                wx.navigateTo({
                                    url: '/pages/open/open',
                                })
                            }
                        }
                    })
                }
            } else {
                wx.hideLoading();
                that.couponReceive(couponClickData.couponid);
            }
        } else if (couponClickData.coupon_status == '6') {
            if (couponClickData.consume_credit !== '0.00') {
                wx.hideLoading();
                if (couponClickData.zcid == "xianshi") {

                    that.setData({
                        showModal: true,
                        consume_credit: consume_credit,
                        couponid: couponid
                    })
                } else {
                    wx.showModal({
                        content: '仅限北人电子会员兑换',
                        showCancel: true,
                        cancelText: '取消',
                        confirmText: '去开卡',
                        success(res) {
                            if (res.confirm) {
                                wx.navigateTo({
                                    url: '/pages/open/open',
                                })
                            }
                        }
                    })
                }
            } else {
                wx.hideLoading();
                that.couponReceive(couponClickData.couponid);
            }
        }
    },
    //免费领取
    couponReceive: function (couponid) {
        wx.showLoading({ title: '加载中', mask: true });
        var that = this;
        var memberData = wx.getStorageSync('memberData');
        wx.request({
            url: api.coupon.getwxappreveivecoupon,
            data: {
                appid: app.globalData.appid,
                sign: app.globalData.sign,
                time: app.globalData.timestamp,
                username: memberData.username,
                ucuid: memberData.uc_uid,
                cid: memberData.cid,
                couponid: couponid
            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: function (e) {
                if(e.statusCode === 200){
                    if (e.data.errcode == '0') {
                        wx.hideLoading();
                        wx.showToast({
                            title: '领取成功',
                            icon: 'success',
                        })
                        var showcoupon = "xianshi";
                        wx.redirectTo({
                            url: '../coupon-list-detail/coupon-list-detail?id=' + that.data.evalue + '&showcoupon=' + showcoupon,
                        })
                    } else {
                        wx.hideLoading();
                        wx.showToast({
                            title: e.data.errmsg,
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
                

            },
        })
    },
    // 获取用户剩余积分
    totalJiFen: function () {
        var that = this;
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
                if(e.statusCode === 200){
                    if (e.data !== "") {
                        var jsonData = JSON.parse(e.data);
                        if (jsonData.data.card_msg.total_jifen) {
                            that.setData({
                                total_jifen: jsonData.data.card_msg.total_jifen,
                            });
                        } else {
                            that.setData({
                                total_jifen: 0,
                            });
                        }
                    }
                }else{
                    wx.showToast({
                        title: '网络请求超时，请重试！',
                        duration: 1500,
                        icon: 'none',
                    })
                }
                
                

            },
        })
    },


    //获取用户预留手机号接口
    getCardPhone: function () {
        var that = this;
        var memberData = wx.getStorageSync('memberData');
        var sessionId = wx.getStorageSync('sessionId');
        if (memberData.cid) {
            wx.request({
                url: api.shop.getcardmobile,
                data: {
                    appid: app.globalData.appid,
                    sign: app.globalData.sign,
                    time: app.globalData.timestamp,
                    cid: memberData.cid,
                    sessionid: sessionId
                },
                method: 'POST',
                success(e) {
                    if(e.statusCode === 200){
                        console.log(e)
                        if (e.data !== "") {
                            var jsonData = JSON.parse(e.data);
                            that.setData({
                                mobile: jsonData.data.mobile
                            });
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
        }


    },
    // 获取用户输入的密码
    getPassword: function (e) {
        var that = this;
        var val = e.detail.value;
        that.setData({
            password: val
        });
        if (that.data.password.length == 6) {
            that.setData({
    
                isDisabled: false,
                showNum: false,
            })
        }
    },
    // 跳转优惠券详情页
    couponListDetail: function (e) {

        var that = this;
        clearTimeout(that.data.timer);
        var couponId = e.currentTarget.dataset.couponid;
        wx.showLoading({
            title: '加载中',
            icon: 'loading',
            mask: true
        })
        wx.navigateTo({
            url: '/pages/coupon-list-detail/coupon-list-detail?id=' + couponId,
        });
    },
    // 点击积分兑换
    exchange: function () {
        var that = this;
        //判断密码是否为6位数数
        if (that.data.password.length !== 6) {
            wx.hideLoading();
            that.setData({
                showNum: true,
            });
            return
        } else {
            wx.hideLoading();
            that.setData({
                showNum: false
            })
        }
        wx.showLoading({ title: '加载中', mask: true });
        var memberData = wx.getStorageSync('memberData');
        getApp().mtj.trackEvent('detail_exchange');
        wx.reportAnalytics('detail_exchange');
        console.log()
        wx.request({
            url: api.coupon.getwxappreveivecoupon,
            data: {
                cid: memberData.cid,
                appid: app.globalData.appid,
                sign: app.globalData.sign,
                time: app.globalData.timestamp,
                ucuid: memberData.uc_uid,
                username: memberData.username,
                mobile: that.data.mobile,
                id_password: that.data.password,
                couponid: that.data.evalue,
            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: function (e) {
                if(e.statusCode === 200){
                    console.log(e)
                    if (e.data.errcode === '0') {
                        that.totalJiFen();
                        wx.hideLoading();
                        that.setData({
                            showModal: false
                        })
                        wx.showModal({
                            title: '领取成功!',
                            cancelText: '关闭',
                            confirmText: '去查看',
                            success(res) {
                                if (res.confirm) {
                                    wx.navigateTo({
                                        url: '/pages/coupon/coupon',
                                    })
                                } else if (res.cancel) {
                                    wx.redirectTo({
                                        url: '../coupon-list-detail/coupon-list-detail?id=' + that.data.evalue,
                                    })
                                }
                            }
                        })
                    } else {
                        wx.hideLoading();
                        that.setData({
                            error: false,
                            errmsg: e.data.errmsg
                        })
                    }
                }else{
                    wx.showToast({
                        title: '网络请求超时，请重试！',
                        duration: 1500,
                        icon: 'none',
                    })
                }

                
            }, fail: function () {
                wx.hideLoading();
                wx.showToast({
                    title: '网络请求超时，请重试！',
                    duration: 1500,
                    icon: 'none',
                })
            }
        })

    },


    hideerror() {
        var that = this;
        that.setData({
            error: true,
            showNum: false,
        })
    },
 
    // 弹窗关闭按钮
    Close: function () {
        this.setData({
            showModal: false,
            error: true,
            showNum: false,
        });
    },
    //分享按钮函数
    onShareAppMessage: function (res) {
          var that = this;
          var showcoupon = "xianshi";
        getApp().mtj.trackEvent('sharebtn');
        wx.reportAnalytics('sharebtn', {
            coupon_detailid: that.data.evalue,

        });
        return {
            title: that.data.nickname + '超值推荐'+ that.data.item.title,
            path: '/pages/coupon-list-detail/coupon-list-detail?id=' + that.data.evalue + '&showcoupon=' + showcoupon,
            imageUrl: that.data.item.image,
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

    onLoad: function (e){

        var evalue = e.id;
        
        if (e.showcoupon){
            var showcoupon = e.showcoupon;
        }else{
            var showcoupon = "buxianshi";
        }
        if (e.quanbao) {
            var quanbao = e.quanbao;
            wx.hideShareMenu();
        } else {
            var quanbao = "xianshi";
        }
        var that = this;
        wx.showLoading({
            title: '加载中',
            icon: 'loading',
            mask: true
        });
        var memberData = wx.getStorageSync('memberData');
            wx.request({
                url: api.coupon.getwappcoupondetail,
                method: 'POST',
                data:{
                    sign: app.globalData.sign,
                    time: app.globalData.timestamp,
                    couponid: e.id,
                    username: memberData.username,
                    ucuid: memberData.uc_uid
                },

                success(e) {
                    if(e.statusCode === 200){
                        if (e.data !== "") {
                            if (e.data.data.cust_type === "") {
                                var cid = "buxianshi";
                            } else {
                                var cid = "xianshi";
                            }
                            wx.hideLoading();
                            clearTimeout(that.data.timer);
                            var couponDetail = e.data.data;
                            var nowtime = e.data.now_time;
                            var percentage = Math.ceil(couponDetail.get_num / couponDetail.total_num * 100);
                            WxParse.wxParse('article', 'md', couponDetail.content, that, 0);
                            if (couponDetail.user_rank != '') {
                                if (couponDetail.cust_type != '') {
                                    var cust_type = couponDetail.user_rank.indexOf(couponDetail.cust_type);
                                    if (cust_type == "-1") {
                                        couponDetail.lingqutype = "1";//不可领取
                                    } else {
                                        couponDetail.lingqutype = "2";//可领取
                                    }
                                } else {
                                    couponDetail.lingqutype = "3";//不可领取
                                }
                            } else {
                                couponDetail.lingqutype = "4";//可领取
                            }
                            var remainTime = couponDetail.add_begin - nowtime;
                            if (remainTime > 0) {
                                couponDetail.remainTime = remainTime * 1000;
                                that.data.item = couponDetail;
                                that.setCountDown();
                            } else {
                                couponDetail.remainTime = remainTime;
                                that.data.item = couponDetail;
                            }
                            couponDetail.zcid = cid;//可领取
                            that.setData({
                                item: couponDetail,
                                quanbao: quanbao,

                                percentage: percentage,
                                showcoupon: showcoupon,
                                evalue: evalue
                            })




                        } else {
                            wx.hideLoading();
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
                    
                    
                }, fail: function () {
                    wx.hideLoading();
                    wx.showToast({
                        title: '网络请求超时，请重试！',
                        duration: 1500,
                        icon: 'none',
                    })
                }
            })
           
    

    },
    showCoupon:function(){
        wx.reLaunch({
            url: '/pages/index/index',
        });
    },

    /**
     * 倒计时
     */

    setCountDown: function () {
        var that = this;
        let time = 100;
        let  {item}  = that.data;
        if (item.remainTime == 0) {
            item.remainTime = 0;
            that.onLoad(item);
        }
        let formatTime = that.getFormat(item.remainTime);
        item.remainTime -= time;
        item.countDownh = `${formatTime.hh}`;
        item.countDownm = `${formatTime.mm}`;
        item.countDowns = `${formatTime.ss}`;
        that.setData({
            item: item
        });
        that.data.timer = setTimeout(that.setCountDown, 100);
    },


    /**
     * 格式化时间
     */
    getFormat: function (msec) {
        let ss = parseInt(msec / 1000);
        let mm = 0;
        let hh = 0;
        if (ss > 60) {
            mm = parseInt(ss / 60);
            ss = parseInt(ss % 60);
            if (mm > 60) {
                hh = parseInt(mm / 60);
                mm = parseInt(mm % 60);
            }
        }
        ss = ss > 9 ? ss : `0${ss}`;
        mm = mm > 9 ? mm : `0${mm}`;
        hh = hh > 9 ? hh : `0${hh}`;
        return { ss, mm, hh };
    },
//忘记密码
    detail_forget:function(){
        getApp().mtj.trackEvent('detail_forget');
        wx.reportAnalytics('detail_forget');
        wx.navigateTo({
            url: '../resetting/resetting',
        })
    },
    onUnload: function () {
        var that = this;
        clearTimeout(that.data.timer);
    },

})