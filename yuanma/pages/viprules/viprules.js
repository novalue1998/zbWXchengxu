// pages/viprules/viprules.js
var WxParse = require('../../utils/wxParse/wxParse.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var that = this;
        wx.request({
            url: 'https://news.ruyigou.com/interface/appv2.php?m=Api&c=News&a=get_news&id=5277',
            method: 'GET',
            success(e) {
                if (e.data.errode == 0) {
                    WxParse.wxParse('article', 'html', e.data.data.content, that, 5);
                    that.setData({
                        title: e.data.data.title
                    })
                } else {
                    wx.showToast({
                        title: 'errode错误',
                        icon: 'loading',
                    })
                }
            }
        })
    },
})