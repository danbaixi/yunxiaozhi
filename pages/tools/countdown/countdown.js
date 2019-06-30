var md5 = require('../../../utils/md5.js');
var util = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //页面配置 
    winWidth: 0,
    winHeight: 0,
    // tab切换  
    currentTab: 0, 
    //tab标题
    tab_title: ['我的考证','考证中心'],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //获取系统信息 
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
      // var a = "2018/3/15";
      // var b = "2018/12/1";
      // var now = new Date(a.replace(/-/g,'/'));
      // var time = new Date(b.replace(/-/g, '/'));
      // var days = time.getTime() - now.getTime();
      // var day = parseInt(days/1000/60/60/24);
      // this.setData({
      //   test:day
      // })
      //检查是否登录
      if (!wx.getStorageSync('user_id')) {
        wx.reLaunch({
          url: '../../bind/bind',
        })
      } else {
        var user_id = wx.getStorageSync('user_id');
        var date = util.formatTime2(new Date());
        var str = user_id + '&^!*@' + date;
        var AppId = md5.hexMD5(str);
        wx.request({
          url: 'https://www.tianyae.com/yxz/countdown/getAllList.php',
          data: {
            AppId:AppId,
            stu_id:user_id
          },
          success:function(res){
            var list = new Array();
            for(var i=0;i<res.data.data.length;i++){
              list.push(res.data.data[i]);
            }

            console.log(list);
            that.setData({
              list:list
            })
            // console.log(that.data.list);
          }
        })
      }

  },
  /**
  * 用户点击右上角分享
  */
  onShareAppMessage: function () {
  
  },
  /** 
   * 滑动切换tab 
   */
  bindChange: function (e) {
    var that = this;
    that.setData({ currentTab: e.detail.current});
  },  
  /** 
  * 点击tab切换 
  */
  swichNav: function (e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  },
  //创建新的考证事件
  createCountdown:function(){
    wx.navigateTo({
      url: 'add/add',
    })
  }  
})