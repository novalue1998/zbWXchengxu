//会员报名列表数据
var app = getApp();
var api = require("../../utils/api.js");
const utils = require('../../utils/util.js');
Page({

    data: {
        searchLoading: false,
        all: false,
        done: false,
        page_num:1,
        per_page:5,
        activity_list: [],
    },
    onShow: function (options) {
        var that = this;
        that.setData({ activity_list: [], page_num: 1, per_page: 5,  searchLoading: true, all:false})
        that.memberActivity();
        wx.hideLoading();
    },

  //会员报名活动列表
  memberActivity:function(){
      var that = this;
      wx.request({
          url: api.member.getmemberactivity,
          data: {
              sign: app.globalData.sign,
              time: app.globalData.timestamp,
              catid: 34,
              version: '3.0.1',
              shop_code: '',
              http_type:1,
              page_num:that.data.page_num,
              per_page:that.data.per_page,
          },
          method: 'POST',
          header: {
              'content-type': 'application/json'
          },
          success: function (e) {
              wx.hideLoading();
              var activity_list = e.data.data.activity_list;
               activity_list = e.data.data.news_list.nomal;
               if(activity_list.length > 0 ){
                   if (that.data.page_num == 1 && activity_list.length < 5){
                       var activity_lists = activity_list;
                   }else{
                       var activity_lists = that.data.activity_list.concat(activity_list);
                   }
                   for (var i = 0; i < activity_list.length; i++) {
                       // 获取开始时间
                       if (activity_list[i].activity_begin_time != '') {
                           activity_list[i].activity_begin_time = utils.formatTimeTwo(activity_list[i].activity_begin_time, 'Y年M月D日 h:m');
                       }
                   }

                   if (activity_lists.length  < 5) {
                       that.setData({
                           activity_list: activity_lists,
                           all: true,
                           searchLoading: false,

                       })
                   } else {
                       that.setData({
                           activity_list: activity_lists,
                           searchLoading: true,
                       })
                   }
               }else{
                   that.setData({
                       all: true,
                       searchLoading: false,
                   })
               }

   
 
       
      }
      })
  },


    // 下拉加载
    onPullDownRefresh: function () {
        var that = this;
        that.setData({
            activity_list: [], page_num: 1, per_page: 5, all: false
        });
        that.memberActivity();
        wx.stopPullDownRefresh();
    },
//上拉加载
    onReachBottom: function () {
        var that = this;
        if (!that.data.all) {
            that.setData({
                page_num: that.data.page_num + 1,
            });
            that.memberActivity();
        } else {          
            that.setData({
                all: true,
                searchLoading: false,
          });

        }
    },

    // 跳转会员活动详情页
    activityDetail: function (e) {
        var that = this;
        var activityId = e.currentTarget.dataset.activityid;
        getApp().mtj.trackEvent('activity_detail');
        wx.reportAnalytics('activity_detail', {
            activityid: e.currentTarget.dataset.activityid,

        });
        wx.showLoading({
            title: '加载中',
            icon: 'loading',
            mask: true
        })
        wx.navigateTo({
            url: '../activity-detail/activity-detail?id=' + activityId,

        });
    },
})