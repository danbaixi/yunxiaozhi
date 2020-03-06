var util = require('../../../utils/util.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    yct:[],
    num:'',
    money:0,
    amount:0,
    time:'',
    display:0,
    history:'历史查询数据',
    loading:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    app.isBind()
    that.getAccount()
    //加载历史查询记录
    var data = wx.getStorageSync('yct-data');
    if (data) {
      that.setData({
        display: 1,
        num: data[0],
        money: data[1],
        amount: data[2],
        time: data[3],
      })
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return app.share('点击查询羊城通余额','yct.png',this.route)
  },
  /**
 * 生命周期函数--监听页面显示
 */
  onShow: function (options) {
    var that = this;
    var isFresh = that.data.isFresh;
    if (isFresh) {
      that.onPullDownRefresh();
      that.setData({
        isFresh: false,
      })
    }
  },
  /**
 * 页面相关事件处理函数--监听用户下拉动作
 */
  onPullDownRefresh: function () {
    var that = this;
    that.getAccount();
  },
  query:function(e){
    var that = this;
    var num = e.target.dataset.num;
    //触摸时间距离页面打开的毫秒数  
    var touchTime = that.data.touch_end - that.data.touch_start;  
    if (touchTime > 350) {
      that.delete(num);
    }else{
      wx.showLoading({title:"查询中"})
      wx.request({
        url: "https://r2.gzyct.com/gw/base",
        method: "POST",
        data: {
          busi_flag: "1",
          card_num: "510000" + num,
          channel_code: "88888888",
          charset: "UTF-8",
          rt_flag: "1",
          service: "yct.base.card.face.balance",
          sign: "D6B9AC55D193DC18148D0A535875DF00",
          sign_type: "MD5",
          timestamp: util.formatTime3(new Date()),
          user_id: "18611001106",
          version: 1
        },
        header: {
          "content-type": "application/json"
        },
        success: function (a) {
          var data = a.data;
          wx.hideLoading()
          if(data.err_msg == ""){
            app.msg("查询成功","success")
            var time = data.balance_time.substring(0, 4) + "-" + data.balance_time.substring(4, 6) + "-" + data.balance_time.substring(6, 8) + " " + data.balance_time.substring(8, 10) + ":" + data.balance_time.substring(10, 12) + ":" + data.balance_time.substring(12, 14);
            that.setData({
              num: data.card_num,
              money: data.balance / 100,
              amount: data.threshold,
              time: time,
              display: 1,
              history: '查询结果'
            });
            var data = new Array(data.card_num, data.balance / 100, data.threshold, time);
            wx.setStorageSync('yct-data', data);
          }else{
            app.msg("查询失败，请重试")
          }
        }
      });
    }
  },
  delete:function(num){
    var that = this;
    var tip = "确定要删除"+num+"吗？"
    wx.showModal({
      title: '提示',
      content: tip,
      success: function (res) {
        if (res.confirm) {
          app.httpRequest({
            url: 'yct/delList',
            data: {
              account: num
            },
            success: function (res) {
              if(res.data.status == 0){
                app.msg("删除成功","success")
                setTimeout(function(){
                  wx.removeStorageSync("ycts");
                  that.onLoad();
                },1000)
              }else{
                app.msg("删除失败")
              }
            },
          })
        }
      }
    })
  },
  add:function(){
    wx.navigateTo({
      url: 'add/add',
    })
  },
  //按下事件开始  
  mytouchstart: function (e) {
    let that = this;
    that.setData({
      touch_start: e.timeStamp
    })
  },
  //按下事件结束  
  mytouchend: function (e) {
    let that = this;
    that.setData({
      touch_end: e.timeStamp
    })
  },
  //获取卡号
  getAccount:function(){
    var that = this;
    var ycts = wx.getStorageSync("ycts");
    if(ycts){
      that.setData({
        loading:false,
        yct: ycts,
      });
      return
    }
    app.httpRequest({
      url: 'yct/getlist',
      success: function (res) {
        if (res.data.status == 0) {
          that.setData({
            loading:false,
            yct: res.data.data,
          });
          wx.setStorageSync("ycts", res.data.data)
        } else {
          app.msg(res.data.message)
        }
      },
    });
  }
})