const app = getApp();
var api = require("../../utils/api.js");
var wxbarcode = require('../../utils/qrcode/index.js');

var countdown = 55;
var barcode = '';
var qrcode = '';
Page({
    data: {
        isTure: false,
        timer:'',
        countDownNum:'55',
        judgeshow:false,
        picture: 'http://wxapp.ruyigou.com/static/admin/yinka.png',
    },
    onLoad: function() {
        this.getCode();
    },
    onShow: function() {
        var that = this;
        that.countDown(that);

    },
    //显示问题弹窗
    showtext:function(){
        var o=this;
        if (o.data.judgeshow == true){
            o.setData({
                judgeshow: false,
            })
        }else{
            o.setData({
                judgeshow: true,
                showModal: true
            })
        }
    },
    //close
    closemask(){
        var o = this;
        o.setData({
            judgeshow: false,
            showModal: false
        })
    },
    countDown: function (that) {
        let countDownNum = that.data.countDownNum;//获取倒计时初始值
        that.data.timer = setInterval(function () {//这里把setInterval赋值给变量名为timer的变量
            //每隔一秒countDownNum就减一，实现同步
            countDownNum--;
            console.log(countDownNum);
            //在倒计时还未到0时，这中间可以做其他的事情，按项目需求来
            if (countDownNum == 0) {
                that.getCode();
                countDownNum = '55';
            }
        }, 1000)
    },

    //获取条形码和二维码接口
    getCode: function() {
        var that = this
        var memberData = wx.getStorageSync('memberData');
        wx.showToast({
            title: '玩命加载中...',
            icon: 'loading',
        })
        wx.request({

            url: api.code.getcardlist,
            data: {
                type: 1,
                sign: app.globalData.sign,
                time: app.globalData.timestamp,
                account: memberData.uc_uid,
                term_app: "APP",
                type1: 3,
                method: 'get_cardlist'
            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: function(res) {
                if(res.statusCode === 200){
                    var list = JSON.parse(res.data);
                    var erwCode = list.data;
                    qrcode = erwCode.qrcode;
                    barcode = erwCode.barcode;
                    wxbarcode.barcode('barcode', barcode, 680, 200);
                    wxbarcode.qrcode('qrcode', qrcode, 420, 420);
                    that.setData({
                        shuzi: barcode
                    })
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
    //小程序由子页面返回主页面,其子页面为隐藏,则计时器还在后台运行,应在返回主页面时清除计时器
    onUnload: function() {
        var that = this;
        clearInterval(that.data.timer);
    },
    openOfflinePay: function() {
        wx.request({
      
            url: api.code.paysign,
            data: {
                sign: app.globalData.sign,
                time: app.globalData.timestamp,
            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {
                if(res.statusCode === 200){
                    var result = JSON.parse(res.data);
                    wx.openOfflinePayView({
                        'appId': result.appid,
                        'timeStamp': result.timeStamp.toString(),
                        'nonceStr': result.nonceStr,
                        'package': result.package,
                        'signType': result.signType,
                        'paySign': result.paySign,
                    })
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


})