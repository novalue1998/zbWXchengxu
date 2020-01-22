var app = getApp();
var api = require("../../utils/api.js");
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
        all: true,
        selectedFlag: [false],
        show: false,
        page: 1,
        scrollTop: 0,
        done: false,
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        wx.showToast({
            title: '玩命加载中...',
            icon: 'loading',
            mask: true
        })
        var that = this;
        that.getCouponZg();
    },
    // 下拉加载
    onPullDownRefresh: function() {
        var that = this;
        that.setData({
            zgCouponList: [], page: 1, 
        });
        wx.showToast({
            title: '加载中...',
            icon: 'loading',
            mask: true
        })
        that.getCouponZg();
        wx.stopPullDownRefresh();

       
    },
    // 上拉刷新  
    loadMore: function(e) {
   
        var done = this.data.done;
       
        if (done == true ) {
            this.setData({
                all: false
            })
            return
           
        }else{
            this.setData({
                all: true
            })
            wx.showToast({
                title: '加载中...',
                icon: 'loading',
                mask: true
            })
            this.getCouponZg(this.data.page++);
        }     
        
    },
    getCouponZg: function (page, stopPull) {
        var memberData = wx.getStorageSync('memberData');
        var that = this;
        wx.request({
            url: api.coupon.getwxappzgl,
            data: {
                page_num: that.data.page,
                per_page: "10",
                username: memberData.username,
                uc_uid: memberData.uc_uid,
                sign: app.globalData.sign,
                time: app.globalData.timestamp,
            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: function(res) {
                var page = that.data.page;
                if (page === 1) {
                    that.setData({
                        zgCouponList: res.data,
                        done:false,
                        all: true
                    })
                    if (that.data.scrollTop <= -60) {
                        wx.stopPullDownRefresh();
                        return;
                    }
                }else{
                    that.setData({
                        zgCouponList: that.data.zgCouponList.concat(res.data),
                    })
                    if (isBlank(res.data)) {
                        that.setData({
                            done: true,
                            all: false
                        })
                    } else {
                        that.setData({
                            done: false,
                            all: true,
                        })
                    }
                }
            }
        })

    },
    receive: function(t) {
        var memberData = wx.getStorageSync('memberData');
        var dataset = t.currentTarget.dataset;
        var that = this;
        wx.request({
            url: api.coupon.getwxappzglingqu,
            data: {
                zid: dataset.zid,
                username: memberData.username,
                sign: app.globalData.sign,
                time: app.globalData.timestamp,
            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: function(res) {
                var errmsg = res.data.errmsg;
                if (res.data.errcode == "0"){
                    wx.showToast({
                        title: errmsg,
                        mask: true
                    })
                    that.data.page = 1;
                    that.getCouponZg(that.data.page);
                   
                }else{
                    wx.showToast({ 
                        title: errmsg,
                        image:'../../img/error.png',
                        mask: true
                    })
                   
                }
                
            }
        })


    },
    //进入专享礼券详情页
    giftDetails: function (e) {
        var couponId = e.currentTarget.dataset.couponid
        wx.showToast({
            title: '加载中,请稍后...',
            icon: 'loading',
            mask: true
        })
        wx.navigateTo({
            url: '../gift-detail/gift-detail?id=' + couponId,
        })
    },
    //根据点击当前优惠券的下标来判断哪个详情进行展示
    selectTap: function (e) {
        let index = e.currentTarget.dataset.index;
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