const app = getApp();
var api = require("../../utils/api.js");
var utils = {
    digit: function(n) {
        if (n == null || n === "" || n == undefined) {
            return "";
        } else {
            n = n.toString();
            return n[1] ? n : '0' + n;
        }
    },
    formatDate: function(date = new Date()) {
        // 年月日
        var year = date.getFullYear()
        var month = date.getMonth() + 1
        // 返回值
        return [year, this.digit(month)].map(this.digit).join('-');
    }
}
// Page
Page({
    data: {
        slideOne: "",
        slideTwo: "",
        showView: false,
        // 左右滑动定义的状态变量
        slideFlag: false,
        // 页面输出的数据
        currentDate: utils.formatDate(),
    },

    onLoad: function() {
        var that = this;
        that.getJiFenList();
        that.totalJiFen();
    },
    before: function() {
        this.tapPrev();
        this.getJiFenList();
    },
    after: function() {
        this.tapNext();
        this.getJiFenList();
    },
    tapPrev() {
        let date = new Date(this.data.currentDate);
        date.setMonth(date.getMonth() - 1);
        var nowDate = utils.formatDate()
        if (nowDate >= utils.formatDate(date)) {
            this.setData({
                showView: true
            })
        }
        this.setData({
            currentDate: utils.formatDate(date)
        })
    },
    tapNext() {
        let date = new Date(this.data.currentDate);
        var nowDate = utils.formatDate()
        date.setMonth(date.getMonth() + 1);
        if (nowDate < utils.formatDate(date)) {
            return;
        }
        if (nowDate <= utils.formatDate(date)) {
            this.setData({
                showView: false
            })
        }

        this.setData({
            currentDate: utils.formatDate(date)
        })
    },
    //获取积分的接口
    getJiFenList: function() {

        var memberData = wx.getStorageSync('memberData');
        wx.showToast({
            title: '玩命加载中...',
            icon: 'loading',
            duration: 2000,
            mask: true
        })

        var that = this;
        wx.request({
            url: api.user.jfrecord,
            data: {
                source: 'other',
                date: this.data.currentDate,
                method: 'jf_record',
                type1: 4,

                cid: memberData.cid,
                sign: app.globalData.sign,
                time: app.globalData.timestamp
            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: function(res) {
                if(res.statusCode === 200){
                    
                    var jiFen = JSON.parse(res.data);
                    if (jiFen.errcode === 0){
                        wx.hideToast();
                        that.setData({
                            jifen: jiFen.results
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
    totalJiFen: function(){
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
                if (e.statusCode === 200) {
                    var jsonData = JSON.parse(e.data);
                    that.setData({
                        total_jifen: jsonData.data.card_msg.total_jifen,
                        his_jifen: jsonData.data.card_msg.his_jifen
                    });
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
})