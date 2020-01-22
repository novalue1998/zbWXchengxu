const app = getApp();
var api = require("../../utils/api.js");
//判断是否为空
function isBlank(str) {
    if (Object.prototype.toString.call(str) === '[object Undefined]') { //空
        return true
    } else if (
        Object.prototype.toString.call(str) === '[object String]' ||
        Object.prototype.toString.call(str) === '[object Array]') { //字条串或数组
        return str.length == 0 ? true : false
    } else if (Object.prototype.toString.call(str) === '[object Object]') {
        return JSON.stringify(str) == '{}' ? true : false
    } else {
        return true
    }
}
Page({

    /**
     * 页面的初始数据
     */
    data: {
        hidden: true,
        searchValue: "",
        topNum: 0,
        focus: false,
        showModal: false,
        display: true,
        inputValue: '',
        currtab: 0,
        searchLoadingComplete: '',
        pageNum: 1,
        perPage: 10,
        topNum: 0,
        picture: '',
        mobile: '',
        password: '',
        couponid: '',
        timer: '',
        couponList: [],
        searchLoading: false,
        showNum: false,
    },
    onShow: function() {
        var that = this;

        var memberData = wx.getStorageSync('memberData');
        var sessionId = wx.getStorageSync('sessionId');
        if (memberData !== '' && sessionId !== '') {
            that.totalJiFen();
            that.getCardPhone();
            if (that.data.searchValue) {
                that.setData({
                    couponList: [],
                })
                that.getSearch();
            }

        }
    },
    hideerror() {
        var that = this;
        that.setData({
            error: true,
            showNum: false,
        })
    },


    // 获取搜索框中输入的值
    getSearchValue: function(e) {
        var that = this;
        var val = e.detail.value;
        that.setData({
            searchValue: val,
            couponList: [],
            searchLoadingComplete: false,
            pageNum: 1,
            perPage: 10,
        });
        that.getSearch();
    },
    bindinput: function(e) {
        var that = this;
        var val = e.detail.value;
        that.setData({
            searchValue: val,
            couponList: [],
            searchLoadingComplete: false,
            searchLoading: false,
            pageNum: 1,
            perPage: 10,
        });
    },
    //免费领取
    couponReceive: function(couponid) {
        var that = this;
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        var memberData = wx.getStorageSync('memberData');
        wx.request({
            url: api.coupon.getwxappreveivecoupon,
            data: {
                appid: app.globalData.appid,
                sign: app.globalData.sign,
                time: app.globalData.timestamp,
                username: memberData.username,
                ucuid: memberData.uc_uid,
                couponid: couponid,
                cid: memberData.cid,
            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: function(e) {
                wx.hideLoading();
                if (e.data !== "") {
                    if (e.data.errcode === '0') {
                        wx.showToast({
                            title: '领取成功',
                            icon: 'success',
                        })

                        var couponReceive = "mianfeilingqu";
                        that.getSearch(couponReceive);
                    } else {

                        wx.showToast({
                            title: e.data.errmsg,
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
            fail: function() {
                wx.hideLoading();
                wx.showToast({
                    title: '网络请求超时，请重试！',
                    duration: 1500,
                    icon: 'none',
                })
            }
        })
    },

    getSearch: function(couponReceive) {

        var that = this;

        var memberData = wx.getStorageSync('memberData');
        wx.request({
            url: api.coupon.getwxappcouponsearch,
            data: {
                appid: app.globalData.appid,
                sign: app.globalData.sign,
                time: app.globalData.timestamp,
                keyword: that.data.searchValue,
                ryg_account: memberData.username,
                ryg_ucuid: memberData.uc_uid,
                page_num: that.data.pageNum,
                per_page: that.data.perPage,
            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: function(e) {
                if (e.data !== "") {
                    var nowtime = e.data.now_time;
                    var couponList = e.data.data;
                    that.setData({ hidden: false,})
                    clearTimeout(that.data.timer);
                    if (that.data.pageNum == 1 && isBlank(couponList)) {
                        that.setData({
                            display: false,
                            searchLoadingComplete: false,
                            searchLoading: true,
                        })
                    }
                    if (e.data.cust_type === "") {
                        var cid = "buxianshi";
                    } else {
                        var cid = "xianshi";
                    }
                    if (couponList.length > 0) {
                        that.setData({ display: true, hidden: false})
                        if (couponReceive == "mianfeilingqu" || couponReceive == "jifenduihuan") {
                            var couponLists = couponList;
                        } else {
                            if (that.data.pageNum === 1 && couponList.length < 10) {
                                var couponLists = couponList;
                            } else {
                                var couponLists = that.data.couponList.concat(couponList);
                            }
                        }
                        for (var i = 0; i < couponLists.length; i++) {
                            if (couponLists[i].user_rank != '') {
                                if (e.data.data.cust_type != '') {
                                    var cust_type = couponLists[i].user_rank.indexOf(e.data.cust_type);
                                    if (cust_type == "-1") {
                                        couponLists[i].lingqutype = "1"; //不可领取
                                    } else {
                                        couponLists[i].lingqutype = "2"; //可领取
                                    }
                                } else {
                                    couponLists[i].lingqutype = "3"; //不可领取
                                }
                            } else {
                                couponLists[i].lingqutype = "4"; //可领取
                            }
                            couponLists[i].zcid = cid; //可领取
                            couponLists[i].percentage = Math.ceil(couponLists[i].get_num / couponLists[i].total_num * 100);
                            var remainTime = couponLists[i].add_begin - nowtime;
                            if (remainTime > 0) {
                                var num = 1;
                                couponLists[i].remainTime = remainTime * 1000;
                            } else {
                                couponLists[i].remainTime = remainTime;
                            }
                        }
                        if (num == 1) { that.setCountDown(); }
                        if (couponLists.length < 10) {
                            that.setData({ couponList: couponLists, searchLoadingComplete: true, searchLoading: false,})
                        } else {
                            that.setData({ couponList: couponLists, searchLoading: true})
                        }
                    } else {
                        that.setData({ searchLoadingComplete: true, searchLoading: false,})

                    }
                }else{
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
    },

    /**
     * 倒计时
     */

    setCountDown: function() {
        var that = this;
        let time = 100;
        let {
            couponList
        } = that.data;
        let list = couponList.map((v, i) => {
            if (v.remainTime == 0) {
                v.remainTime = 0;
                that.getSearch();
            }
            let formatTime = that.getFormat(v.remainTime);
            v.remainTime -= time;
            v.countDownh = `${formatTime.hh}`;
            v.countDownm = `${formatTime.mm}`;
            v.countDowns = `${formatTime.ss}`;
            return v;
        })
        that.setData({
            couponList: list
        });
        that.data.timer = setTimeout(that.setCountDown, 100);
    },

    /**
     * 格式化时间
     */
    getFormat: function(msec) {
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
        return {
            ss,
            mm,
            hh
        };
    },

    // 点击立即领取
    clickReceive: function(e) {
        var that = this;
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        that.setData({
            showNum: false
        })
        var couponClickData = e.currentTarget.dataset;
        var couponid = e.currentTarget.dataset.couponid;
        var consume_credit = e.currentTarget.dataset.consume_credit;
        if (couponClickData.coupon_status == '1') {
            wx.hideLoading();
            wx.navigateTo({
                url: '/pages/authorize/index',
            })
        } else if (couponClickData.coupon_status == '4') {
            wx.hideLoading();
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
    // 下拉刷新
    onPullDownRefresh: function() {
        var that = this;
        that.setData({
            couponList: [],
            pageNum: 1,
            perPage: 10,
            searchLoadingComplete: false,
        });
        that.getSearch();
        wx.stopPullDownRefresh();

    },
    // 上拉加载
    onReachBottom: function(e) {
        var that = this;

        if (!that.data.searchLoadingComplete) {
            that.setData({
                pageNum: that.data.pageNum + 1,
            });
            that.getSearch();
        } else {
            that.setData({
                searchLoadingComplete: true,
                searchLoading: false,
            });

        }
    },
    // 获取用户剩余积分
    totalJiFen: function() {
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

            success: function(e) {
                if (e.data !== ""){
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
            },
        })
    },


    //获取用户预留手机号接口
    getCardPhone: function() {
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
                    if (e.data !== ""){
                        var jsonData = JSON.parse(e.data);
                        that.setData({
                            mobile: jsonData.data.mobile
                        });
                    }
                    
                }
            })
        }


    },
    // 获取用户输入的密码
    getPassword: function(e) {
        var that = this;
        var val = e.detail.value;
        that.setData({
            password: val
        });
        if (that.data.password.length == 6) {
            that.setData({
                showNum: false,
            })
        }
    },

    // 点击积分兑换
    exchange: function() {
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
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        var memberData = wx.getStorageSync('memberData');
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
                couponid: that.data.couponid
            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },

            success: function(e) {
                if (e.data !== ""){
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
                                    var couponReceive = "jifenduihuan";
                                    that.getSearch(couponReceive);
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

    },
    // 弹窗关闭按钮
    Close: function() {
        this.setData({
            error: true,
            showModal: false,
            showNum: false,
        });
    },


    //小程序由子页面返回主页面,其子页面为隐藏,则计时器还在后台运行,应在返回主页面时清除计时器
    onUnload: function() {
        var that = this;
        clearTimeout(that.data.timer);
    },
    // 跳转优惠券详情页
    couponListDetail: function(e) {
        var that = this;
        var couponId = e.currentTarget.dataset.couponid;
        clearTimeout(that.data.timer);
        wx.showToast({
            title: '加载中,请稍后...',
            icon: 'loading',
            mask: true
        })
        wx.navigateTo({
            url: '../coupon-list-detail/coupon-list-detail?id=' + couponId,
        })
    },


})