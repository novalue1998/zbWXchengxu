const app = getApp();
var api = require("../../utils/api.js");
const utils = require('../../utils/md5.js');
const utils1 = require('../../utils/util.js');
var wxbarcode = require('../../utils/qrcode/index.js');
var barcode = '';
var qrcode = '';
var hehe;
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
    data: {
        all: true,
        selectedFlag: [false],
        show: false,
        showModal: false,
        currtab: 0,
        page: 1,
        seleted: false,
        useCouponList: [],
        done: false,
        scrollTop: 0,
        display: true,
        picture: '',
        searchLoading: "",
        swipertab: [{
            name: '未使用',
            index: 0
        }, {
            name: '已使用',
            index: 1
        }, {
            name: '已失效',
            index: 2
        }],
    },

    onShow: function(options) {
        var that = this;
        that.setData({
            searchLoading: true,
        })
        that.getDeviceInfo();
        that.getCoupon();

    },
    //进入优惠券详情页
    couponDetails: function(e) {
        var couponId = e.currentTarget.dataset.couponid.id
        wx.showToast({
            title: '加载中,请稍后...',
            icon: 'loading',
            mask: true
        })
        var quanbao = "buxianshi";
        wx.navigateTo({
            url: '../coupon-list-detail/coupon-list-detail?id=' + couponId + '&quanbao=' + quanbao,
        })
    },
    // 点击去使用
    couponUse: function(e) {
        var that = this;
        that.data.useCouponList = [];
        hehe = e.currentTarget.dataset.useid;
        var type_id = hehe.type_id
        var str_random = Math.round(Math.random() * 10000);
        if (type_id == 5 || type_id == 9 || type_id == 10 || type_id == 11 || type_id == 12) {
            that.setData({
                show: false
            })
        } else {
            that.setData({
                show: true
            })
        }
        var used_begin = utils1.formatTimeTwo(hehe.used_begin, 'Y-M-D');
        var used_end = utils1.formatTimeTwo(hehe.used_end, 'Y-M-D');
        qrcode = hehe.code;
        barcode = hehe.code;
        this.setData({
            hiddenmodal: true,
            showModal: true,
            hehe: hehe,
            used_begin: used_begin,
            used_end: used_end,
            str_random: str_random
        })
        wxbarcode.barcode(str_random, barcode, 560, 100);
        wxbarcode.qrcode('qrcode' + str_random, qrcode, 320, 320);
    },

    getDeviceInfo: function() {
        let that = this;
        wx.getSystemInfo({
            success: function(res) {
                that.setData({
                    deviceW: res.windowWidth,
                    deviceH: res.windowHeight
                })
            }
        })
    },
    // 款台核销页面点击关闭
    close: function() {
        var that = this;
        that.setData({
            showModal: false
        })
    },
    /**
     * @Explain：选项卡点击切换
     */
    tabSwitch: function(e) {
        var that = this;
        if (this.data.currtab === e.target.dataset.current) {
            return false
        } else {
            that.setData({
                currtab: e.target.dataset.current
            })
        }
    },

    // 用户左右滑动更新加载数据
    tabChange: function (e) {
        this.setData({
            currtab: e.detail.current
        })
        this.orderShow()
    },
    orderShow: function () {
        let that = this;
        switch (this.data.currtab) {
            case 0:
                that.data.page = 1
                done: false
                all: true
                that.data.useCouponList = [];
                that.setData({
                    useCouponList: that.data.useCouponList,
                    display: true
                })
                that.getCoupon();
                break
            case 1:
                that.data.page = 1

                done: false
                all: true
                that.data.useCouponList = [];
                that.setData({
                    useCouponList: that.data.useCouponList,
                    display: true
                })
                that.getCoupon();
                break
            case 2:
                that.data.page = 1
                done: false
                all: true
                display: true
                this.data.currtab = 3
                that.data.useCouponList = [];
                that.setData({
                    useCouponList: that.data.useCouponList,
                    display: true
                })
                that.getCoupon();
                break
        }
    },
    //调用优惠券接口

    getCoupon: function() {

        var that = this;
        var memberData = wx.getStorageSync("memberData") || {};
        wx.request({
            url: api.coupon.couponpackage,
            data: {
                status: that.data.currtab,
                type1: 5,
                method: 'coupon_package',
                http_type: 1,
                page_num: that.data.page,
                per_page: "10",
                version: '2.0.2',
                username: memberData.username,
                sign: app.globalData.sign,
                time: app.globalData.timestamp,
            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: function(res) {
                wx.hideLoading();
                if (res.statusCode === 200){
                    if (res.data !== "") {
                        var useCouponList = JSON.parse(res.data);
                        if (useCouponList.errcode == "0") {
                            var useCouponList1 = useCouponList.data;
                            var coupon_list = useCouponList1.coupon_list
                            var coupon_intro = useCouponList1.coupon_list.coupon_intro
                            var page = that.data.page;
                            if (page === 1) {
                                if (isBlank(coupon_list)) {
                                    that.setData({
                                        picture: '../../img/cartk.png', display: false, all: true, searchLoading: false
                                    })
                                } else {
                                    if (coupon_list.length < 10){
                                        that.setData({
                                            useCouponList: useCouponList1.coupon_list, done: false,
                                            all: false, searchLoading: false,
                                        })
                                    }else{
                                        that.setData({
                                            useCouponList: useCouponList1.coupon_list, done: false,
                                            all: true, searchLoading: true,
                                        })
                                    }

                                    
                                }
                                if (that.data.scrollTop <= -60) {
                                    wx.stopPullDownRefresh();
                                    return;
                                }
                            } else {
                                that.setData({
                                    useCouponList: that.data.useCouponList.concat(useCouponList1.coupon_list),
                                })
                                if (isBlank(useCouponList1.coupon_list)) {
                                    that.setData({
                                        done: true, all: false, searchLoading: false
                                    })
                                } else {
                                    that.setData({
                                        all: true, searchLoading: true, done: false
                                    })
                                }
                            }

                        }
                    } else {
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

                
            }
        })

    },

    //核销优惠券
    writeOffCoupon: function() {
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        var that = this;
        wx.request({
            url: api.coupon.consumecoupon,
            data: {
                version: '2.0.0',
                sign: app.globalData.sign,
                time: app.globalData.timestamp,
                method: 'consume_coupon',
                type1: 6,
                code: hehe.code
            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: function(res) {
                wx.hideLoading();
                var message = JSON.parse(res.data);
                that.data.page = 1;
                if (message.errcode == "0") {
                    that.setData({
                        showModal: false
                    })
                    var errmsg = message.errmsg;
                    that.getCoupon(errmsg, that.data.page);;
                    wx.showToast({
                        title: '核销成功!',
                    })
                } else {
                    
                    var errmsg = message.errmsg;
                    that.setData({
                        showModal: false
                    })
                    wx.showToast({
                        title: errmsg,
                        image: '../../img/warn.png',
                        mask: true,

                    })

                }
            }
        })
    },


    ok: function() {
        var that = this;
        that.setData({
            hiddenmodal: false
        })
        wx.showModal({
            title: '是否立即使用',
            content: '该操作需由店员点击操作,确认后将不能再次使用,是否确认立即核销?',
            success(res) {
                if (res.confirm) {
                    that.writeOffCoupon();
                } else if (res.cancel) {
                    that.setData({
                        showModal: true
                    })
                }
            }
        })
    },

    // 下拉加载
    onPullDownRefresh: function() {


        var that = this;
        that.setData({
            useCouponList: [],
            page: 1,
            done: false,
            searchLoading: true
        });

        that.getCoupon();
        wx.stopPullDownRefresh();

    },
    // 上拉刷新
    loadMore: function(e) {
        var done = this.data.done;
        if (done == true) {
            this.setData({
                all: false
            })
            return
        } else {
            this.setData({
                all: true
            })
            this.getCoupon(this.data.page++);
        }


    },
    //根据点击当前优惠券的下标来判断哪个详情进行展示
    selectTap: function(e) {
        let index = e.currentTarget.dataset.index;
        // console.log(index);
        if (this.data.selectedFlag[index]) {
            this.data.selectedFlag[index] = false;

        } else {
            this.data.selectedFlag[index] = true;

        }
        this.setData({
            index: index,
            selectedFlag: this.data.selectedFlag
        })
    },
})