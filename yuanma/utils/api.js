var _api_root = "https://wxapp.ruyigou.com/index.php/";

var api = {
    login: {
        sessionid: _api_root + "user/getId/sessionid",
        phone: _api_root + "user/getId/phone",
    },
    coupon: {
        couponpackage: _api_root + "user/userTransfer/couponpackage",
        consumecoupon: _api_root + "user/userTransfer/consumecoupon",
        coupondetail: _api_root + "user/userTransfer/coupondetail",
        utfgcoupondetail: _api_root + "user/userTransferGet/coupondetail",
        getwxapprkzxq: _api_root + "coupon/getWxappRkzxq",
        getwxappzgl: _api_root + "coupon/getWxappZgl",
        getwxappzglingqu: _api_root + "coupon/getWxappZgLingqu",
        getwxappcouponlist: _api_root + "coupon/getWxappCouponList",
        getwxappcouponsearch: _api_root + "coupon/getWxappCouponSearch",
        getwxappreveivecoupon: _api_root + "coupon/getWxappReveiveCoupon",
        getwappcoupondetail: _api_root + "coupon/getWxappCouponDetail",
        getWxappHomeCouponList: _api_root + "coupon/getWxappHomeCouponList",

    },
    user: {
        register: _api_root + "user/userTransfer/register",
        userinformation: _api_root + "user/userTransfer/userinformation",
        registercardnew: _api_root + "user/userTransfer/registercardnew",
        getwxappuserinfo: _api_root + "coupon/getWxappUserinfo",
        usercardmsg: _api_root + "user/userTransfer/usercardmsg",
        sendsmsrepeat: _api_root + "user/userTransfer/sendsmsrepeat",
        cardbind: _api_root + "user/userTransfer/cardbind",
        jfrecord: _api_root + "user/userTransfer/jfrecord",
        memberbenefits: _api_root + "shop/getNextLevel",


    },
    shop: {
        getwxappnearshop: _api_root + "shop/getWxappNearShop",
        getwxappchooseshop: _api_root + "shop/getWxappChooseShop",
        getsmsverifycode: _api_root + "shop/getSmsVerifyCode",
        getzbsetcardpassword: _api_root + "shop/getZbSetCardpassword",
        getcardmobilecode: _api_root + "shop/getCardMobileCode",
        getcardmobile: _api_root + "shop/getCardMobile",
        getWxappPosterList: _api_root + "shop/getWxappPosterList",
        getwxappposterdetail: _api_root + "shop/getWxappPosterDetail",
        getwxappposterchooseshop: _api_root + "shop/getWxappPosterChooseShop",

    },
    ad: {
        shouyead: _api_root + "advert/advertUrls/shouyead",
        shouyetype: _api_root + "advert/advertUrls/shouyetype",
        wcouponad: _api_root + "advert/advertUrls/wcouponad",
    },
    code: {
        getcardlist: _api_root + "user/userTransfer/getcardlist",
        paysign: _api_root + "coupon/paySign",
    },
    member: {
        getmemberactivity: _api_root + "activity/getMemberActivity/get_news_list",
        activitydetail: _api_root + "activity/getMemberActivity/get_activity_detail",
        comfirm: _api_root + "activity/getMemberActivity/get_submit_activity_page",
        sumbit: _api_root + "activity/getMemberActivity/get_user_activity_submit",
        showticket: _api_root + "activity/getMemberActivity/get_user_activity_check_init",
        myactive: _api_root + "activity/getMemberActivity/get_activity_order_list",
        writeoff: _api_root + "activity/getMemberActivity/check_status_activity_status",
        getwxappnewslist: _api_root + "activity/getMemberActivity/get_wxapp_news_list",
        share: _api_root + "activity/getMemberActivity/get_activity_codes",
    }

};

module.exports = api;