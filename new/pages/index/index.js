const app = getApp();
var api = require("../../utils/api.js");
var util = require('../../utils/util.js');
Page({
    data: {

        hasCard: 0,
        picture: 'http://wxapp.ruyigou.com/static/admin/yinka.png',
        imgUrls: {},
        scrollTop: 0,
        zxCoupon: "",
        shopNameLocation: "",
        showModal: false,
        couponLists: "",
        activityLists: "",
        shopList: "",
        ad_image: []
    },
    //关闭弹窗
    Close: function () {
        this.setData({
            showModal: false
        });
    },
    GoGift() {
        wx.navigateTo({
            url: '../gift/gift',
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
    onLoad: function () {
        var o = this;

        wx.showLoading({
            title: '玩命加载中...',
            mask: true
        })
        o.shouYeAd(o);
        o.showPoster();
        o.shouYeType(o);
        app.notificationCenter.register(app.globalData.notificationMessageCard_msg, this, "didReceviceAnyNotification");

    },
    onPullDownRefresh: function () {

        var o = this;

        wx.showLoading({
            title: '玩命加载中...',
            mask: true
        })
        o.shouYeAd(o);
        o.shouYeType(o);
        wx.stopPullDownRefresh();

    },
    onShow: function () {
        var o = this;
        var sessionId = wx.getStorageSync('sessionId');
        var memberData = wx.getStorageSync('memberData');
        if (!app.globalData.shopCodeData) {
            o.getLocations(o);
        } else {
            o.setData({ couponList: [], });
            o.showCoupon();
            o.showActivity();
            o.shouYeAd(o);
            o.setData({
                shopNameLocation: app.globalData.shopNameLocation
            })

        }

        if (sessionId && memberData != "") {
            o.getWxappRkzxq(o);
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

                    if (e.statusCode === 200) {
                        if (e.data !== "") {
                            var jsonData = JSON.parse(e.data);
                            if (jsonData.errcode === "0") {
                                o.memberDataStatus(o, jsonData);
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


                }
            })
        } else {
            o.setData({
                jiFen: '--',
                couponNum: '--',
            })
        }

    },

    didReceviceAnyNotification: function (notification) {
        console.log("接收到了通知：", notification);
        this.memberInfoumationSuccess();
    },

    getLocations: function (that) {
        wx.getSetting({
            success: function (res) {
                wx.getLocation({
                    type: 'gcj02',
                    success: function (res) {
                        var latitude = res.latitude;
                        var longitude = res.longitude;
                        that.getWxappNearShop(that, latitude, longitude);
                    }
                })

            }
        })
    },

    getWxappNearShop: function (that, latitude, longitude) {
        wx.request({

            url: api.shop.getwxappnearshop,
            data: {
                sign: app.globalData.sign,
                time: app.globalData.timestamp,
                latitude: latitude,
                longitude: longitude
            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: function (e) {

                app.globalData.shopNameLocation = e.data.shop_name;
                that.setData({
                    shopNameLocation: app.globalData.shopNameLocation
                })
                app.globalData.shopCodeData = e.data.shop_code;
                app.globalData.cityCode = e.data.city_code;
                app.globalData.shopListLocation = JSON.stringify(e.data.shop_list);
                that.setData({ couponList: [], })
                that.showCoupon();
                that.showActivity();

            },
        })
    },
    // 专项礼券
    getWxappRkzxq: function (o) {
        //拿到缓存时间戳
        var Storagevalue = wx.getStorageSync('timestamp');
        //记录当前时间
        var timestampvalue = Date.parse(new Date());
        //计算时间差
        var cha = (timestampvalue - Storagevalue) / 1000
        var memberData = wx.getStorageSync('memberData');
        wx.request({
            url: api.coupon.getwxapprkzxq,
            data: {
                sign: app.globalData.sign,
                time: app.globalData.timestamp,
                uc_uid: memberData.uc_uid,
                username: memberData.username,

            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: function (e) {

                if (e.statusCode === 200) {
                    if (e.data.status == 1) {
                        if (!Storagevalue) {
                            o.setData({
                                showModal: true,
                                zximg: "http://wxapp.ruyigou.com/static/admin/images/pic/giftwindow.png"

                            });
                            // 获取当前时间
                            var timestamp = Date.parse(new Date());
                            //存储缓存
                            wx.setStorageSync('timestamp', timestamp);
                        } else {
                            o.setData({
                                showModal: false
                            })
                            if (cha > 28800) {
                                o.setData({
                                    showModal: true,
                                    zximg: "http://wxapp.ruyigou.com/static/admin/images/pic/giftwindow.png"
                                })
                                // 获取当前时间
                                var timestamp = Date.parse(new Date());
                                //存储缓存
                                wx.setStorageSync('timestamp', timestamp);
                            } else {
                                o.setData({
                                    showModal: false
                                })
                            }
                        }
                        o.setData({
                            zxCoupon: e.data.wx_img
                        })
                    }



                } else {
                    wx.showToast({
                        title: '网络请求超时，请重试！',
                        duration: 1500,
                        icon: 'none',
                    })

                }

            }
        })

    },

    memberDataStatus: function (o, jsonData) {


        if (jsonData.data.status == 2) {
            o.memberCustTypes(o, jsonData.data.card_msg.cust_type);
            var memberDatas = {
                cid: jsonData.data.card_msg.cid,
                card_num: jsonData.data.card_msg.card_num,
                cust_type: jsonData.data.card_msg.cust_type,
                uc_uid: jsonData.data.user_msg.uc_uid,
                status: jsonData.data.status,
                username: jsonData.data.user_msg.username,
            };
            wx.setStorageSync('memberData', memberDatas);
            o.setData({
                jiFen: jsonData.data.card_msg.total_jifen,
                couponNum: jsonData.data.card_msg.coupon_num,
                hasCard: 2,
                cardNum: jsonData.data.card_msg.card_num,
            });

            return true;
        } else if (jsonData.data.status == 1) {
            wx.hideLoading();
            var memberDatas = {
                uc_uid: jsonData.data.user_msg.uc_uid,
                status: jsonData.data.status,
                username: jsonData.data.user_msg.username,
            };
            wx.setStorageSync('memberData', memberDatas);
            o.setData({
                jiFen: 0,
                couponNum: jsonData.data.user_msg.coupon_num,
                hasCard: 1
            });
            return true;
        }


    },

    showPoster() {
        var shopCode = app.globalData.shopCodeData;
        var that = this;
        wx.request({
            url: api.ad.shouyead,
            data: {
                alias: "hbshouyead",
                time: app.globalData.timestamp,
                sign: app.globalData.sign,
                shop_code: shopCode ? shopCode : "0"
            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: function (e) {

                if (e.statusCode === 200) {
                    if (e.data !== "") {
                        var jsonData = JSON.parse(e.data);
                    
                        for (var pindex = 0; pindex < jsonData.length; pindex++) {
                            that.data.ad_image[pindex] = jsonData[pindex].ad_image
                        }
                        that.setData({
                            posterimgUrls: that.data.ad_image
                        })

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


            }
        })
    },
    shouYeAd: function (o) {

        if (app.globalData.shopListLocation != "" && app.globalData.shopListLocation != undefined){
            var jsonData = JSON.parse(app.globalData.shopListLocation);
            var bbs = [];
            for (var i = 0; i < jsonData.length; i++) {
                var shop_codes = jsonData[i].shop_code;
                var bb = shop_codes.split(",");
                bbs.push(bb.join(''));
                var shopCode = bbs.join(",")
            }
        }else{
            var shopCode = 0;
        }
  
        wx.request({
            url: api.ad.shouyead,
            data: {
                alias: "shouyead",
                time: app.globalData.timestamp,
                sign: app.globalData.sign,
                shop_code: shopCode
            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: function (e) {

                if (e.statusCode === 200) {
                    if (e.data !== "") {
                        var jsonData = JSON.parse(e.data);
                        o.setData({
                            imgUrls: jsonData
                        })
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


            }
        })
    },
    shouYeType: function (o) {

        wx.request({
            url: api.ad.shouyetype,
            data: {
                alias: "shouyetype",
                time: app.globalData.timestamp,
                sign: app.globalData.sign,
            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: function (e) {

                if (e.statusCode === 200) {
                    var sessionId = wx.getStorageSync('sessionId');
                    var memberData = wx.getStorageSync('memberData');
                    if (sessionId == "" && memberData == "") {
                        wx.hideLoading();
                    }
                    if (e.data !== "") {
                        wx.hideLoading();
                        var jsonData = JSON.parse(e.data);
                        o.setData({
                            classify: jsonData
                        })
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


            }
        })
    },
    classtype: function (t) {
        
        var dataset = t.currentTarget.dataset;
        getApp().mtj.trackEvent(dataset.id);
        wx.reportAnalytics(dataset.id);
        if (dataset.appid != 1) {
            wx.navigateToMiniProgram({
                appId: dataset.appid,
                path: dataset.url
            })
        } else if (dataset.appid == 1 && dataset.url != '' && dataset.adparame !== ""){
            wx.navigateTo({
                url: dataset.url + '?id=' + dataset.adparame
            })

        }else{
            if (dataset.url != '/pages/activity-detail/activity-detail' && dataset.url != '/pages/coupon-list-detail/coupon-list-detail'){
                wx.navigateTo({
                    url: dataset.url
                })
            }
            
        }
    },
    jiFens: function () {
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
                wx.hideLoading();

                if (e.statusCode === 200) {
                    if (e.data !== "") {
                        var jsonData = JSON.parse(e.data);
                        if (jsonData.data.status == 2) {
                            that.setData({
                                jiFen: jsonData.data.card_msg.total_jifen,
                                couponNum: jsonData.data.card_msg.coupon_num
                            });
                        } else {
                            that.setData({
                                jiFen: 0,
                                couponNum: jsonData.data.user_msg.coupon_num
                            });
                        }
                    } else {

                        wx.showToast({
                            title: '网络请求超时，请重试！',
                            duration: 1500,
                            icon: 'none',
                        })
                    }
                } else {
                    wx.showToast({
                        title: '网络请求超时，请重试！',
                        duration: 1500,
                        icon: 'none',
                    })
                }

            },
        })
    },
    // 电子会员卡绑卡成功后渲染
    memberInfoumationSuccess: function () {
        var that = this;
        var memberData = wx.getStorageSync('memberData');
        if (memberData.status === 2) {
            wx.showToast({
                title: '玩命加载中...',
                icon: 'loading',
                duration: 3000,
                mask: true
            })
            that.jiFens();
            that.setData({
                hasCard: 2,
                cardNum: memberData.card_num
            })
            var memberCustType = memberData.cust_type;
            that.memberCustTypes(that, memberCustType);

        }
    },

    memberCustTypes: function (that, memberCustType) {
        wx.hideLoading();
        if (memberCustType == '001') {
            that.setData({
                picture: 'http://wxapp.ruyigou.com/static/admin/jinka.png',
                fontColor: '#9b6e25',
                grade: "VIP金卡"
            })
        } else if (memberCustType == '002') {
            that.setData({
                picture: 'http://wxapp.ruyigou.com/static/admin/bojinka.png',
                fontColor: '#d2ad59',
                grade: "SVIP铂金卡"
            })
        } else if (memberCustType == '003') {
            that.setData({
                picture: 'http://wxapp.ruyigou.com/static/admin/zuanshika.png',
                fontColor: '#d2ad59',
                grade: "SVIP钻石卡"
            })
        } else {
            that.setData({
                picture: 'http://wxapp.ruyigou.com/static/admin/yinka.png',
                fontColor: '#222222',
                grade: "VIP银卡"
            })
        }


    },

    onShareAppMessage: function () {
        return {
            title: '掌尚北国',
            path: '/pages/index/index',
            imageUrl: 'http://wxapp.ruyigou.com/static/admin/images/pic/share.jpg'
        }
    },

    openCard: function () {
        getApp().mtj.trackEvent('opencard_enter');
        wx.reportAnalytics('opencard_enter');
        wx.navigateTo({
            url: '../open/open'
        })
    },
    //点击首页优惠券更多
    goToCoupon: function () {
        getApp().mtj.trackEvent('coupon_more');
        wx.reportAnalytics('coupon_more');
        wx.switchTab({
            url: '../coupon-list/coupon-list',
        })
    },
    //点击会员活动更多
    goToActivity: function () {
        getApp().mtj.trackEvent('activity_more');
        wx.reportAnalytics('activity_more');
        wx.navigateTo({
            url: '../member-activity/member-activity',
        })
    },
    //电子海报跳转
    goPoster() {
        wx.navigateTo({
            url: '../poster/poster',
        })
    },
    // 根据卖场展示优惠券
    showCoupon: function () {
        var that = this;
        var json11 = app.globalData.shopListLocation;

        if (json11 != undefined) {
            var json1 = JSON.parse(app.globalData.shopListLocation);
 
            var bbs = [];
            for (var i = 0; i < json1.length; i++) {
                var shop_codes = json1[i].shop_code;
                var bb = shop_codes.split(",");
                bbs.push(bb.join(''));
                var shopCodes = bbs.join(",")


            }

            wx.request({
                url: api.coupon.getWxappHomeCouponList,
                data: {
                    sign: app.globalData.sign,
                    time: app.globalData.timestamp,
                    shop_codes: shopCodes,
                },
                method: 'POST',
                header: {
                    'content-type': 'application/json'
                },
                success: function (e) {
                    that.setData({
                        couponLists: ''
                    })
                    if (e.statusCode === 200) {
                        if (e.data != "") {
                            var couponList = e.data.data.coupon_list;
                            wx.hideLoading();
                            var market = "";
                            var couponListss = [];
                            for (var i = 0; i < couponList.length; i++) {

                                couponListss.push(couponList[i]);
                                if (couponListss.length !== 0 && couponListss.length % 2 == 0) {
                                    that.setData({
                                        couponLists: couponListss
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
                    } else {
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
    // 根据卖场展示会员活动
    showActivity: function () {
        var that = this;
        var json11 = app.globalData.shopListLocation;
        if (json11 != undefined) {
            var json1 = JSON.parse(app.globalData.shopListLocation);
            var bbs = [];
            for (var i = 0; i < json1.length; i++) {
                var shop_codes = json1[i].shop_code;
                var bb = shop_codes.split(",");
                bbs.push(bb.join(''));
                var shopCodes = bbs.join(",")

            }
            wx.request({
                url: api.member.getwxappnewslist,
                data: {
                    sign: app.globalData.sign,
                    time: app.globalData.timestamp,
                    shop_codes: shopCodes,
                },
                method: 'POST',
                header: {
                    'content-type': 'application/json'
                },
                success: function (e) {
                    wx.hideLoading();
                    that.setData({
                        activityLists: ''
                    })
                    var activity_list = e.data.data.news_list;
                    var activity_listss = [];
                    if (activity_list.length > 0) {
                        for (var i = 0; i < activity_list.length; i++) {
                            // 获取开始时间
                            if (activity_list[i].activity_begin_time != '') {
                                activity_list[i].activity_begin_time = util.formatTimeTwo(activity_list[i].activity_begin_time, 'Y年M月D日 h:m');
                            }
                            activity_listss.push(activity_list[i]);
                            that.setData({
                                activityLists: activity_listss
                            })
                        }


                    }

                }
            })
        }
    },
    // 跳转会员活动详情页
    activityDetail: function (e) {
        var that = this;
        var activityId = e.currentTarget.dataset.activityid;
        getApp().mtj.trackEvent('shouye_activity_detail');
        wx.reportAnalytics('shouye_activity_detail', {
            activityids: e.currentTarget.dataset.activityid,

        });
        wx.navigateTo({
            url: '../activity-detail/activity-detail?id=' + activityId,

        });
    },
    // 跳转优惠券详情页
    couponListDetail: function (e) {
        getApp().mtj.trackEvent('shouye_couponlist_detail');
        wx.reportAnalytics('shouye_couponlist_detail', {
            couponid: e.currentTarget.dataset.couponid,
        });
        var that = this;
        var couponId = e.currentTarget.dataset.couponid;
        wx.navigateTo({
            url: '../coupon-list-detail/coupon-list-detail?id=' + couponId,

        });
    },

})