var app = getApp();
var api = require("../../utils/api.js");
Page({
    data: {
        openPicker: false,
        show: false, //控制下拉列表的显示隐藏，false隐藏、true显示
        selectData: [], //下拉列表的数据
        index: 0, //选择的下拉列 表下标,
        phone:'',
    },
    onLoad: function() {
        wx.showLoading({
            title: '玩命加载中...',
            mask: true
        })
        var that = this;
        that.getShopLocationList(that);
    },

    getShopLocationList: function (that) {
        wx.getSetting({
            success: function(res) {
                if (res.authSetting['scope.userLocation']) {
                    wx.getLocation({
                        type: 'gcj02',
                        success: function(res) {
                            var latitude = res.latitude;
                            var longitude = res.longitude;
                            that.getWxappChooseShop(that, latitude, longitude);
                            that.setData({
                                meters: "cunzai"
                            });
                        },fail(res){
                            var latitude = 0;
                            var longitude = 0;
                            that.getWxappChooseShop(that, latitude, longitude);
                            that.setData({
                                meters: "bucunzai"
                            });
              
                        }
                    })
                } else {
                    var latitude = 0;
                    var longitude = 0;
                    that.getWxappChooseShop(that, latitude, longitude);
                    that.setData({
                        meters: "bucunzai"
                    });
                }
            }
        })

    },

    getWxappChooseShop: function(that, latitude, longitude) {
        wx.request({
            url: api.shop.getwxappchooseshop,
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
            success: function(e) {
                if (e.statusCode === 200){
                    wx.hideLoading();
                    var scode = e.data.citys[0].code;
                    var shoplists = e.data.list[scode];
                    for (var i = 0; i < shoplists.length; i++) {
                        shoplists[i].json_shop_list = JSON.stringify(shoplists[i].shop_list);
                    }
                    that.setData({
                        selectData: e.data.citys,
                        shopLists: shoplists,
                        index: 0,
                    })
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

    // 点击下拉显示框
    selectTap() {
        this.setData({
            openPicker: !this.data.openPicker,
            show: !this.data.show,
        });
    },
    // 点击下拉列表
    optionTap(e) {
        wx.showLoading({
            title: '玩命加载中...',
            mask: true
        })
        let index = e.currentTarget.dataset.index; //获取点击的下拉列表的下标
        let code = e.currentTarget.dataset.code; //获取点击的下拉列表的下标
        var that = this;
        wx.getSetting({
            success: function(res) {
                if (res.authSetting['scope.userLocation']) {
                    wx.getLocation({
                        type: 'gcj02',
                        success: function(res) {
                            var latitude = res.latitude;
                            var longitude = res.longitude;
                            that.getWxappChooseOptionTap(that, latitude, longitude, code);
                        }, fail(res) {
                            var latitude = 0;
                            var longitude = 0;
                            that.getWxappChooseOptionTap(that, latitude, longitude, code);
                            that.setData({
                                meters: "bucunzai"
                            });
                        }
                    })
                } else {
                    var latitude = 0;
                    var longitude = 0;
                    that.getWxappChooseOptionTap(that, latitude, longitude, code);
                    that.setData({
                        meters: "bucunzai"
                    });
                }
            }
        })

        this.setData({
            index: index,
            show: !this.data.show,
            openPicker: !this.data.openPicker,
        });
    },


    getWxappChooseOptionTap: function(that, latitude, longitude, code) {
        wx.request({
            url: api.shop.getwxappchooseshop,
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
            success: function(e) {
                wx.hideLoading();
                if(e.statusCode === 200){
                    var shoplists = e.data.list[code];
                    for (var i = 0; i < shoplists.length; i++) {
                        shoplists[i].json_shop_list = JSON.stringify(shoplists[i].shop_list);
                    }

                    that.setData({
                        shopLists: shoplists
                    })

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
    //点击打电话
    makePhoneCall: function(e) {
        var phone = e.currentTarget.dataset.phone;
        wx.makePhoneCall({
            phoneNumber: phone,
        })
    },
    goToAddress: function(e) {
        var that = this;
        let addressData = e.currentTarget.dataset; //获取点击的下拉列表的下标
        wx.getSetting({
            success: function() {
                that.addressLocation(addressData);
            }
        })

    },
    addressLocation: function(addressData) {
        wx.openLocation({
            latitude: Number(addressData.storeshoplatitude),
            longitude: Number(addressData.storeshoplongitude),
            name: addressData.storeshopname,
            address: addressData.storeshopaddress,
        })
    },

    reLocation: function() {
        var that = this;
        wx.showLoading({
            title: '玩命加载中...',
            mask: true
        })
        wx.getSetting({
            success: function(res) {
                if (res.authSetting['scope.userLocation']) {
                    that.getShopLocationList(that);
                } else {
                    wx.openSetting({
                        success(res) {
                            if (res.authSetting['scope.userLocation']) {
                                that.getShopLocationList(that);
                            } else {
                                wx.hideLoading();
                            }
                        }
                    })
                }
            }
        })

    },
    goToShowYe: function(e) {
        var shop = e.currentTarget.dataset;
        app.globalData.shopNameLocation = shop.storesname;
        app.globalData.shopCodeData = shop.storeshopscode;
        app.globalData.cityCode = shop.storecitycode;
        app.globalData.shopListLocation = shop.storeshopslist;
        wx.switchTab({
            url: '/pages/index/index',
        })
    }

})