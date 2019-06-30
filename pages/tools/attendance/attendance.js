var md5 = require('../../../utils/md5.js');
var util = require('../../../utils/util.js');
const { $Toast } = require('../../../dist/base/index');
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
      $Toast({ content: '加载中', type: 'loading', duration: 0 });
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
          $Toast.hide();
          if(res.data.status == 1001){
            that.setData({
              term: res.data.data.terms,
              attendance: res.data.data.attendance,
              isNull:false
            });
          }else if(res.data.status == 1002){
            that.setData({
              isNull:true
            })
          }else{
            $Toast({ content: '获取失败', type: 'error' });
          }
        },
      });
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh:function(){
    // $Toast({ content: '考勤暂时无法更新', type: 'error'});
    wx.stopPullDownRefresh();
    this.showDialogBtn();
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '快来查查有没有被记旷课啦~',
      path: 'pages/tools/attendance/attendance',
      imageUrl: 'http://yunxiaozhi-1251388077.cosgz.myqcloud.com/wx_share/attendance.jpg'
    };
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
  onConfirm: function (e) {
    wx.showNavigationBarLoading();
    var that = this;
    var user_id = wx.getStorageSync('user_id');
    var user_password = wx.getStorageSync('user_password');
    var yzm = that.data.yzm;
    var cookie = that.data.cookie;
    var __VIEWSTATE = that.data.__VIEWSTATE;
    if (yzm == "") {
      $Toast({ content: '请输入验证码', type: 'warning' });
      wx.hideNavigationBarLoading();
    } else {
      that.inputBlur();
      $Toast({ content: '加载中', type: 'loading', duration: 0 });
      var str = app.globalData.key + user_id;
      var sign = md5.hexMD5(str);
      wx.request({
        url: app.globalData.domain + 'attendance/update',
        data: {
          stu_id: user_id,
          password: user_password,
          code: yzm,
          cookie: cookie,
          __VIEWSTATE: __VIEWSTATE,
          sign:sign
        },
        success: function (res) {
          $Toast.hide();
          wx.hideNavigationBarLoading();
          wx.stopPullDownRefresh();
          if(res.data.status == 1001){
            $Toast({content:'更新了'+res.data.data+'条记录',type:'success'});
            setTimeout(function(){
              that.onLoad();
              that.hideModal();
            },2000)
          }else if(res.data.status == 1003){
            $Toast({content:'验证码错误',type:'error'});
            that.freshYzm();
          }else{
            $Toast({ content: '更新失败', type: 'error' });
          }
        }
      })
    }
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
  }
})