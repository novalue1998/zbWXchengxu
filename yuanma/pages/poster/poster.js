// pages/poster/poster.js
const app = getApp();
var api = require("../../utils/api.js");
var util = require('../../utils/util.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        shopNameinfo: "",
        shopNameinfo: [],
        posterImgInfo: [],
        shop_name: "",
        shopCodes: "",
        shownoposter: false,
        shop_list: [],
        cityCode: ""
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        that.data.cityCode = app.globalData.cityCode;


        app.globalData.shopListLocationPoster = app.globalData.shopListLocation;
        var shopListLocationPoster = app.globalData.shopListLocationPoster;
        if (shopListLocationPoster !== undefined && shopListLocationPoster !== null && shopListLocationPoster !== "") {
            var shopListLocationParse = JSON.parse(app.globalData.shopListLocationPoster);
            var bbs = [];
            for (var i = 0; i < shopListLocationParse.length; i++) {
                var shop_codes = shopListLocationParse[i].shop_code;
                var bb = shop_codes.split(",");
                bbs.push(bb.join(''));
                that.data.shopCodes = bbs.join(",");
                var shop_name = shopListLocationParse[0].shop_name;
            }
            that.data.shop_name = shop_name;
            that.getPosterList()
        } else {
            that.data.shop_name = "请选择门店";
            that.setData({
                shownoposter: !that.data.shownoposter
            })

        }


        that.setData({
            sendShopName: that.data.shop_name,
            shopNameinfo: that.data.shopNameinfo,
            posterUrl: that.data.posterUrl,
            posterExplain: "请先选择门店"
        });

    },
    //点击的传值卖场
    bindPickerChange: function (e) {
        var that = this;
        console.log(111)
        that.setData({
            sendShopName: that.data.shopNameinfo[e.detail.value]
        })
        var clickShopname = that.data.shop_list[e.detail.value];
        var bbs = [];
        for (var i = 0; i < clickShopname.length; i++) {
            var shop_codes = clickShopname[i].shop_code;
            var bb = shop_codes.split(",");
            bbs.push(bb.join(''));
            that.data.shopCodes = bbs.join(",");
        }
        that.getPosterList();

    },
    //获取门店名称
    getPIckerShopName() {
        var that = this;
        wx.showLoading({
            title: '玩命加载中...',
            mask: true
        });
        if (that.data.cityCode == undefined || that.data.cityCode == null) {
            that.data.cityCode = "";
        }
        console.log(app.globalData.sign)
        console.log(app.globalData.timestamp)
        console.log(that.data.cityCode)
        console.log(typeof (that.data.cityCode))
        if (that.data.cityCode === "") {
            console.log(111)
        }
        if (wx.canIUse('reportPerformance')) {
            wx.reportPerformance(1001, 680)
            wx.request({
                url: api.shop.getwxappposterchooseshop,
                data: {
                    sign: app.globalData.sign,
                    time: app.globalData.timestamp,
                    city_code: that.data.cityCode
                },
                method: 'POST',
                header: {
                    'content-type': 'application/json'
                },
                success(res) {
                    console.log(res)
                    if (res.statusCode == 200) {
                        for (var i = 0; i < res.data.length; i++) {
                            that.data.shopNameinfo[i] = res.data[i].shop_name,
                                that.data.shop_list[i] = res.data[i].shop_list
                        }
                        that.setData({
                            shopNameinfo: that.data.shopNameinfo,
                        });
                        wx.hideLoading();
                    }
                },
                fail(res) {
                    console.log(res)
                },
                complete(res) {
                    if (res.statusCode == 200) {
                        if (res.data == "") {
                            wx.showToast({
                                title: '网络超时',
                                icon: 'none',
                                duration: 2000
                            });
                        }
                    }

                }
            })
        }
    },
    //获取门店海报
    getPosterList() {
        var that = this;
        wx.showLoading({
            title: '玩命加载中...',
            mask: true
        });

        wx.request({
            url: api.shop.getWxappPosterList,
            data: {
                sign: app.globalData.sign,
                time: app.globalData.timestamp,
                shop_codes: that.data.shopCodes
            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success(res) {
                if (res.statusCode == 200) {

                    if (res.data.data.news_poster_list.length == 0) {
                        that.setData({
                            shownoposter: true,
                            posterExplain: "小编正在快马加鞭制作海报..."
                        })
                    } else {
                        that.data.posterImgInfo = res.data.data.news_poster_list;
                        that.setData({
                            posterImgInfo: that.data.posterImgInfo,
                            shownoposter: false,
                            haibaoshopName: that.data.shop_name
                        })
                    }

                }
                wx.hideLoading();
            }
        })

    },
    //跳转详情页面
    goWheel(e) {
        var that = this;
        wx.navigateTo({
            url: '../wheel/wheel?posterid=' + that.data.posterImgInfo[e.currentTarget.dataset.index].id + '&shopCodes=' + that.data.shopCodes,
        })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        var that = this;
        that.getPIckerShopName();
        wx.hideShareMenu();
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})