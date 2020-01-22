// pages/wheel/wheel.js
const app = getApp();
var api = require("../../utils/api.js");
var util = require('../../utils/util.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        wheelImgUrls: [],
        windowHeight: "500",
        showPicture: false,
        huadongval: "0",
        posterid: "",
        nickname: "",
        xunhuanImgUrl: [],
        posterIndex: '',
        shopCodes: "",
        shoptitle: "",
        showHavePoster: true
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var that = this;
        wx.getSystemInfo({
            success: function(res) {
                that.data.windowHeight = res.windowHeight
            }
        });


        that.data.shopCodes = options.shopCodes;
        var shop_name = options.shop_name;
        if (shop_name == null || shop_name == undefined || shop_name == "") {
            that.data.posterid = options.posterid;
        } else {
            that.data.posterid = options.posterid;
        }
        that.getPosterInfo();

    },
    //点击展示大图
    showBigImg(e) {
        var that = this;

        for (var i = 0; i < that.data.wheelImgUrls.length; i++) {
            that.data.xunhuanImgUrl[i] = that.data.wheelImgUrls[i].url
        }
        wx.previewImage({
            current: that.data.xunhuanImgUrl[e.currentTarget.dataset.index],
            urls: that.data.xunhuanImgUrl,
            // current: that.data.xunhuanImgUrl,
            // urls: [that.data.xunhuanImgUrl[e.currentTarget.dataset.index]]
        })
    },
    // 滑动索引
    cardSwiper(e) {
        var that = this;
        that.setData({
            cardCurbi: e.detail.current
        })
        that.data.posterIndex = e.detail.current;
        if (that.data.wheelImgUrls.length == 2) {
            if (e.detail.current == 2) {
                that.setData({
                    cardCur: 0,
                    cardCurbi: 2,
                })
            } else if (e.detail.current == 3) {
                that.setData({
                    cardCur: 1,
                    cardCurbi: 3,
                })
            } else {
                that.setData({
                    cardCur: e.detail.current
                })
            }
        } else {
            that.setData({
                cardCur: e.detail.current
            })
        }

    },
    //请求海报详情接口
    getPosterInfo() {
        var that = this;
        wx.showLoading({
            title: '玩命加载中...',
            mask: true
        });
        wx.request({
            url: api.shop.getwxappposterdetail,
            data: {
                sign: app.globalData.sign,
                time: app.globalData.timestamp,
                posterid: that.data.posterid
            },
            method: 'POST',
            success(res) {
                if (res.statusCode == 200) {

                    var pictureURl = res.data.data.news_poster_detail.pictureurls;
                    that.data.shoptitle = res.data.data.news_poster_detail.title
                    that.data.wheelImgUrls = res.data.data.news_poster_detail.pictureurls;
                    if (pictureURl.length == 0) {
                        that.data.showHavePoster == false
                    } else {
                        if (pictureURl.length == 2) {
                            var copy1 = that.data.wheelImgUrls;
                            that.data.wheelImgUrls = that.data.wheelImgUrls.concat(copy1);
                        }
                        that.setData({
                            swiperUrl: pictureURl,
                            windowHeight: that.data.windowHeight,
                            cardCur: 0,
                            posterLength: pictureURl.length,
                            cardCurbi: 0
                        });
                    }


                    wx.hideLoading();
                }
            }
        })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {
        var that = this;
        that.data.nickname = wx.getStorageSync('nickname');

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

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
    onShareAppMessage: function(res) {
        var that = this;
       
        var shareImgUrl = that.data.wheelImgUrls[0].url
        return {
            title: '您的好友向你推荐了' + that.data.shoptitle,
            path: '/pages/wheel/wheel?posterid=' + that.data.posterid + '&shopCodes=' + that.data.shopCodes + '&shop_name=' + that.data.shoptitle,
            imageUrl: shareImgUrl,
            success: function(res) {
                console.info(res + '成功');
                // 转发成功
            },
            fail: function(res) {
                console.log(res + '失败');
                // 转发失败
            },
            complete: function(res) {
                // 不管成功失败都会执行
            }
        }
    }
})