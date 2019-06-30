var md5 = require('../../../utils/md5.js');
var util = require('../../../utils/util.js');
const { $Toast } = require('../../../dist/base/index');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    yct:[],
    isExit:0,
    num:'',
    money:0,
    amount:0,
    time:'',
    display:0,
    history:'历史查询数据',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //检查是否登录
    if (!wx.getStorageSync('user_id')) {
      wx.reLaunch({
        url: '../../bind/bind',
      })
    } else {
      $Toast({content:"加载中",type:'loading',duration:0})
      that.getAccount();
      //加载历史查询记录
      var data = wx.getStorageSync('yct-data');
      if(data){
        that.setData({
          display:1,
          num: data[0],
          money: data[1],
          amount: data[2],
          time: data[3],
        })
      }
      $Toast.hide();
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '出门之前查查羊城通',
      path: 'pages/tools/yct/yct',
      imageUrl: 'http://yunxiaozhi-1251388077.cosgz.myqcloud.com/wx_share/yct.jpg'
    };
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
      $Toast({content:'查询中',type:'loading',duration:0})
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
          $Toast.hide();
          if(data.err_msg == ""){
            $Toast({ content: '查询成功', type: 'success' })
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
            $Toast({ content: '查询失败，请重试', type: 'error' })
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
        var user_id = wx.getStorageSync('user_id');
        var str = app.globalData.key + user_id;
        var sign = md5.hexMD5(str);
        if (res.confirm) {
          wx.request({
            url: app.globalData.domain + 'yct/delList',
            data: {
              stu_id : user_id,
              account: num,
              sign : sign
            },
            success: function (res) {
              if(res.data.status == 1001){
                $Toast({content:'删除成功',type:'success'});
                setTimeout(function(){
                  wx.removeStorageSync("ycts");
                  that.onLoad();
                },1000)
                
              }else{
                $Toast({ content: '删除失败', type: 'warning' });
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
    $Toast({ content: "加载中", type: 'loading', duration: 0 })
    var that = this;
    var ycts = wx.getStorageSync("ycts");
    if(ycts){
      that.setData({
        isExit: 1,
        yct: ycts,
      });
      $Toast.hide();
    }else{
      var user_id = wx.getStorageSync('user_id');
      var str = app.globalData.key + user_id;
      var sign = md5.hexMD5(str);
      wx.request({
        url: app.globalData.domain + 'yct/getlist',
        data: {
          stu_id: user_id,
          sign: sign
        },
        success: function (res) {
          $Toast.hide();
          if (res.data.status == 1001) {
            that.setData({
              isExit: 1,
              yct: res.data['data'],
            });
            wx.setStorageSync("ycts", res.data['data'])
          } else if (res.data.status == 1002) {
            that.setData({ isExit: 0 });
          } else {
            $Toast({ content: '获取失败', type: 'error' })
          }
        },
      });
    }
  }
})