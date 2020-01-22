
var app = getApp();
var api = require("../../utils/api.js");
var userData = require("../../utils/userData.js");
Page({

    /**
     * 页面的初始数据
     */
    data: {
        focus: false,
        showModal: false,
        isDisabled: true,
        inputValue: '',
        currtab: 0,
        pageNum: 1,
        add_begin:'',
        perPage: 10,
        topNum: 0,
        mobile: '',
        password: '',
        couponid: '',
        timer: '',
        couponList: [],
        searchLoading: false,
        searchLoadingComplete: '',
        showNum: false,
        swipertab: [{
            name: '全部',
            index: 0
        }, {
            name: '爆款',
            index: 1
        }, {
            name: '超市',
            index: 3
        }, {
            name: '好物',
            index: 5
        }],
    },
    hideerror(){
        var that = this;
        that.setData({
            error: true,
            showNum: false,
        })
    },
    onLoad:function(){
        var that = this;
        that.setData({ couponList: [], pageNum: 1, perPage: 10, currtab: that.data.currtab, searchLoading: true, })
        that.getWxappCouponList();
        var memberData = wx.getStorageSync('memberData');
        var sessionId = wx.getStorageSync('sessionId');
        if (memberData !== '' && sessionId !== '') {
            that.totalJiFen();
            that.getCardPhone();
        }
    },
    onShow: function() {
        // var that = this;
        // // wx.showLoading({title: '加载中',mask: true});

        // that.setData({ couponList: [], pageNum: 1, perPage: 10, currtab: that.data.currtab, searchLoading: true, })
        // that.getWxappCouponList();
        // var memberData = wx.getStorageSync('memberData');
        // var sessionId = wx.getStorageSync('sessionId');
        // if (memberData !== '' && sessionId !== '') {
        //     that.totalJiFen();
        //     that.getCardPhone();
        // }

    },

    // 弹窗关闭按钮
    Close: function() {
        this.setData({
 
            showModal: false,
            error: true,

        });
    },

    // 点击搜索
    couponSearch: function() {
        wx.navigateTo({
            url: '/pages/search/search',
        })
    },
    goCoupon:function(){
        var memberData = wx.getStorageSync('memberData');
        var sessionId = wx.getStorageSync('sessionId');
        getApp().mtj.trackEvent('voucher_bag');
        wx.reportAnalytics('voucher_bag');
        if (memberData !== '' && sessionId !== '') {
            wx.navigateTo({
                url: '/pages/coupon/coupon',
            })
        }else{
            wx.navigateTo({
                url: '/pages/authorize/index',
            })
        }
    },

    // 点击切换选项卡
    tabSwitch: function(e) {
        var that = this;
        console.log(e)
        getApp().mtj.trackEvent('sort');
        wx.reportAnalytics('sort', {
            sort_name: e.currentTarget.dataset.name,

        });
        if (this.data.currtab === e.target.dataset.current) {
            return false
        } else {
            clearTimeout(that.data.timer);
            that.setData({ couponList: [], pageNum: 1, perPage: 10, currtab: e.target.dataset.current,searchLoadingComplete:''})
            // wx.showLoading({ title: '加载中', mask: true })
            that.getWxappCouponList();
        }
    },

    // 跳转优惠券详情页
    couponListDetail: function(e) {
        
        var that = this;
        clearTimeout(that.data.timer);
        var couponId = e.currentTarget.dataset.couponid;
        getApp().mtj.trackEvent('go_coupon_detail');
        wx.reportAnalytics('go_coupon_detail', {
            couponid: e.currentTarget.dataset.couponid,

        });
        wx.showLoading({
            title: '加载中',
            icon: 'loading',
            mask: true
        })
        wx.navigateTo({
            url: '../coupon-list-detail/coupon-list-detail?id=' + couponId,

        });
    },

    getWxappCouponList: function (catid, couponReceive) {
        
        var that = this;
        var memberData = wx.getStorageSync('memberData');
        if (app.globalData.shopCodeData == ""){
            app.globalData.shopCodeData = "3003"
        }
        wx.request({
            url: api.coupon.getwxappcouponlist,
            data: {
                appid: app.globalData.appid,
                sign: app.globalData.sign,
                time: app.globalData.timestamp,
                where_type: 2,
                page_num: that.data.pageNum,
                per_page: that.data.perPage,
                shop_code: app.globalData.shopCodeData,
                catid: that.data.currtab,
                username: memberData.username,
                ucuid: memberData.uc_uid,
            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: function(e) {

                if (e.statusCode === 200){
                    if (e.data != "") {
                        if (e.data.data.cid === "") {
                            var cid = "buxianshi";
                        } else {
                            var cid = "xianshi";
                        }


                        var couponList = e.data.data.coupon_list;
                        clearTimeout(that.data.timer);
                        wx.hideLoading();
                        if (couponList.length > 0) {

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
                                // 获取开始时间
                                if (couponLists[i].user_rank != '') {
                                    if (e.data.data.cust_type != '') {
                                        var cust_type = couponLists[i].user_rank.indexOf(e.data.data.cust_type);

                                        if (cust_type == "-1") {
                                            couponLists[i].lingqutype = "1";//不可领取
                                        } else {
                                            couponLists[i].lingqutype = "2";//可领取
                                        }
                                    } else {
  
                                        couponLists[i].lingqutype = "3";//不可领取
                                    }
                                } else {
 
                                    couponLists[i].lingqutype = "4";//可领取
                                }

                                couponLists[i].zcid = cid;//可领取
                                couponLists[i].percentage = Math.ceil(couponLists[i].get_num / couponLists[i].total_num * 100);
                                var remainTime = couponLists[i].add_begin - e.data.data.now_time;
                                if (remainTime > 0) {
                                    var num = 1;
                                    couponLists[i].remainTime = remainTime * 1000;
                                } else {
                                    couponLists[i].remainTime = remainTime;

                                }

                            }
     
                            if (num == 1) {
                                that.setCountDown();
                            }

                            if (couponLists.length < 10) {
                                that.setData({
                                    couponList: couponLists,
                                    searchLoadingComplete: true,
                                    searchLoading: false,

                                })
                            } else {
                              
                                that.setData({
                                    couponList: couponLists,
                                    searchLoading: true,
                                })
                            }


                        } else {
                            that.setData({
 
                                searchLoadingComplete: true,
                                searchLoading: false,
                            })

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

    /**
     * 倒计时
     */

    setCountDown: function () {
        var that = this;
        let time = 100;
        let { couponList } = that.data;
        let list = couponList.map((v, i) => {
            if (v.remainTime == 0) {
                v.remainTime = 0;
                that.getWxappCouponList();
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
    getFormat: function (msec) {
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
        return {ss,mm,hh};
    },




    //小程序由子页面返回主页面,其子页面为隐藏,则计时器还在后台运行,应在返回主页面时清除计时器
    onUnload: function () {
        var that = this;
        clearTimeout(that.data.timer);
    },




    clickReceive: function(e) {
        var that = this;
        wx.showLoading({ title: '加载中', mask: true })
        that.setData({
            isDisabled: true,
            showNum:false
        })
        var couponClickData = e.currentTarget.dataset;
        var couponid = e.currentTarget.dataset.couponid;
        var consume_credit = e.currentTarget.dataset.consume_credit;
        getApp().mtj.trackEvent('coupon_draw');
        wx.reportAnalytics('coupon_draw', {
            couponid: e.currentTarget.dataset.couponid,

        });
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
                if (couponClickData.zcid == "xianshi"){
                    
                    that.setData({
                        showModal: true,
                        consume_credit: consume_credit,
                        couponid: couponid
                    })
                }else{
                    wx.showModal({
                        content: '仅限北人电子会员兑换',
                        showCancel:true,
                        cancelText:'取消',
                        confirmText:'去开卡',
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
    //免费领取
    couponReceive: function (couponid) {
        var that = this;
        wx.showLoading({ title: '加载中', mask: true })
        var memberData = wx.getStorageSync('memberData');
        wx.request({
            url: api.coupon.getwxappreveivecoupon,
            data: {
                appid: app.globalData.appid,
                sign: app.globalData.sign,
                time: app.globalData.timestamp,
                username: memberData.username,
                ucuid: memberData.uc_uid,
                cid: memberData.cid,
                couponid: couponid
            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: function (e) {

                wx.hideLoading();
                if(e.statusCode === 200){
                    if (e.data.errcode === '0') {

                        wx.showToast({
                            title: '领取成功',
                            icon: 'success',
                        })
                        var catid = 1;
                        var couponReceive = "mianfeilingqu";
                        that.getWxappCouponList(catid, couponReceive);
                    } else {
                        wx.showToast({
                            title: e.data.errmsg,
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
                
                
            },
        })
    },
    // 下拉刷新
    onPullDownRefresh: function () {
        var that = this;
        that.setData({
            couponList: [], pageNum: 1, perPage: 10, searchLoadingComplete:false
        });
        // wx.showLoading({ title: '加载中', mask: true });
        that.getWxappCouponList();
        wx.stopPullDownRefresh();

    },
    // 上拉加载
    onReachBottom: function(e) {
      
        var that = this;
       
        if (!that.data.searchLoadingComplete) {
            //wx.showLoading({ title: '加载中', mask: true });
            that.setData({
                pageNum: that.data.pageNum + 1,
            });
            that.getWxappCouponList();
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

                if(e.statusCode === 200){
                    if (e.data !== "") {
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


    //获取用户预留手机号接口
    getCardPhone: function() {
        var that = this;
        var memberData = wx.getStorageSync('memberData');
        var sessionId = wx.getStorageSync('sessionId');
        if (memberData.cid){
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

                    if(e.statusCode === 200){
                        if (e.data !== "") {
                            var jsonData = JSON.parse(e.data);
                            that.setData({
                                mobile: jsonData.data.mobile
                            });
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
                isDisabled: false,
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
        wx.showLoading({ title: '加载中', mask: true });
        var memberData = wx.getStorageSync('memberData');
        getApp().mtj.trackEvent('exchange');
        wx.reportAnalytics('exchange');
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

                wx.hideLoading();
                if(e.statusCode === 200){
                    if (e.data.errcode === '0') {
                        that.totalJiFen();

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
                                    var catid = 1;
                                    var couponReceive = "jifenduihuan";
                                    that.getWxappCouponList(catid, couponReceive);
                                }
                            }
  
                        })
                    } else {

                        that.setData({
                            error: false,
                            errmsg: e.data.errmsg
                        })
                    }
                }else{

                    wx.showToast({
                        title: '网络请求超时，请重试！',
                        duration: 1500,
                        icon: 'none',
                    })
                }
                

            },fail:function(){
                wx.hideLoading();
                wx.showToast({
                    title: '网络请求超时，请重试！',
                    duration: 1500,
                    icon: 'none',
                })
            }
        })

    },
    //scroll-view 滚动事件
    scroll: function (e) {
        // 因为scroll当横向滑动另一个页面时，他也会多滑动一次，而最后一次就是0
        if (e.detail.scrollTop != 0) {
            //设置缓存
           
            wx.setStorage({
                key: 'data',
                //    缓存滑动的距离，和当前页面的id
                data: [e.detail.scrollTop, e.target.dataset.id]
            })
        }
    },

//忘记密码
    forgetPassword:function(){
        getApp().mtj.trackEvent('forget_password');
        wx.reportAnalytics('forget_password');
        wx.navigateTo({
            url: '../resetting/resetting',
        })
    }

})