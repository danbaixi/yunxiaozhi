var md5 = require('../../../utils/md5.js');
var util = require('../../../utils/util.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    xq: [],
    attendance:[],
    num:0,
    showModal: false,
    yzmUrl: "",
    cookie: "",
    __VIEWSTATE: "",
    yzm: "",
    input_focus: 0,
    update_time:null,
    isNull:false,
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    if(options)
    that.setData({
      from:options.from
    })
    //检查是否登录
    if (!wx.getStorageSync('user_id')) {
      wx.reLaunch({
        url: '../../bind/bind',
      })
      return
    }
    var user_id = wx.getStorageSync('user_id');
    var str = app.globalData.key + user_id;
    var sign = md5.hexMD5(str);
    wx.request({
      url: app.globalData.domain + 'attendance/getlist',
      data: {
        stu_id: user_id,
        sign: sign
      },
      success: function (res) {
        if (res.data.status == 1001) {
          that.setData({
            term: res.data.data.terms,
            attendance: res.data.data.attendance,
            isNull: false
          });
        } else if (res.data.status == 1002) {
          that.setData({
            isNull: true
          })
        } else {
          app.msg('获取失败')
        }
      },
    });
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh:function(){
    this.update()
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return app.share('点击查询个人考勤记录', 'attendance.png', this.route)
  },
  /**
* 弹窗
*/
  showDialogBtn: function () {
    var that = this;
    that.setData({
      showModal: true
    });
    /**获取验证码 */
    wx.request({
      url: app.globalData.domain + 'login/getLoginInitData',
      success: function (res) {
        that.setData({
          cookie: res.data.data['cookie'],
          __VIEWSTATE: res.data.data['__VIEWSTATE'],
        })
        that.freshYzm();
      }
    });
  },
  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function () {
  },
  /**
   * 隐藏模态对话框
   */
  hideModal: function () {
    this.setData({
      showModal: false
    });
    wx.hideNavigationBarLoading();
    wx.stopPullDownRefresh();
  },
  /**
   * 对话框取消按钮点击事件
   */
  onCancel: function () {
    this.hideModal();
  },
  /** 获取验证码 */
  yzmInput: function (e) {
    this.setData({
      yzm: e.detail.value,
    })
  },
  /**
   * 对话框确认按钮点击事件
   */
  update: function (e) {
    var that = this;
    var user_id = wx.getStorageSync('user_id');
    var user_password = wx.getStorageSync('user_password');
    // var yzm = that.data.yzm;
    // var cookie = that.data.cookie;
    // var __VIEWSTATE = that.data.__VIEWSTATE;
    // if (yzm == "") {
    //   app.msg("请输入验证码")
    //   return
    // }
    var time = (new Date()).getTime();
    if (wx.getStorageInfoSync('attendance_update_time') != "") {
      var update_time = wx.getStorageSync('attendance_update_time');
      var cha = time - update_time;
      var season = 60 - Math.floor(cha / 1000);
    } else {
      var season = 0;
    }
    if (season > 0) {
      app.msg('请在' + season + '秒后更新')
      return
    }
    wx.showLoading({ title: "更新中" })
    var str = app.globalData.key + user_id;
    var sign = md5.hexMD5(str);
    app.httpRequest({
      url: 'attendance/update',
      data: {
        stu_id: user_id,
        password: user_password,
        // code: yzm,
        // cookie: cookie,
        // __VIEWSTATE: __VIEWSTATE,
        sign: sign
      },
      success: function (res) {
        wx.hideLoading()
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
        if (res.data.status == 1001) {
          app.msg('更新了' + res.data.data + '条记录')
          wx.setStorageSync('attendance_update_time', time);
          setTimeout(function () {
            that.onLoad();
            that.hideModal();
          }, 2000)
        } else if (res.data.status == 1003) {
          app.msg("验证码错误")
          that.freshYzm();
        } else {
          app.msg("更新失败")
        }
      }
    })
  },
  /** 刷新验证码 */
  freshYzm: function () {
    var num = Math.ceil(Math.random() * 1000000);
    this.setData({
      yzmUrl: app.globalData.domain + 'login/getValidateImg?cookie=' + this.data.cookie + '&rand=' + num,
    })
  },
  /**输入验证码时，改变模态框高度 */
  inputFocus: function () {
    this.setData({
      input_focus: 1
    })
  },
  /** 不输入验证码时，恢复 */
  inputBlur: function () {
    this.setData({
      input_focus: 0
    })
  },
  backPage: function () {
    if (this.data.from == 'index') {
      wx.navigateBack({
        delta: 1
      });
    } else {
      wx.reLaunch({
        url: '/pages/index/index',
      })
    }
  },
})