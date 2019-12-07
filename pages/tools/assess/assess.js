var app = getApp();
var util = require('../../../utils/util.js');
var md5 = require('../../../utils/md5.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var user_id = wx.getStorageSync('user_id')
    var password = wx.getStorageSync('user_password')
    if (user_id == "") {
      wx.showToast({
        title: '请登录',
        icon: 'loading'
      });
      wx.redirectTo({
        url: '../../bind/bind',
      })
      return;
    }
    that.getList()
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return app.share()
  },

  getList:function(){
    wx.showLoading({
      title: '正在加载...',
    })
    var that = this;
    var user_id = wx.getStorageSync('user_id')
    var password = wx.getStorageSync('user_password')
    app.httpRequest({
      url: "access/getItem",
      method: "POST",
      data: {
        stu_id: user_id,
        password: password
      },
      success: function (res) {
        wx.hideLoading()
        if(res.data.status == 0){
          that.setData({
            assess: res.data.data.assess,
            term: res.data.data.term,
            list: res.data.data.list,
            finish: res.data.data.finish,
            totalCount: res.data.data.totalCount
          })
        }else{
          that.setData({
            assess: res.data.data.assess,
            term: res.data.data.term,
            list: res.data.data.list,
            totalCount: res.data.data.totalCount
          })
          app.msg(res.data.message)
        }
      }
    })
  },
  assess: function () {
    var that = this;
    var user_id = wx.getStorageSync('user_id');
    if (!user_id) {
      app.msg("请先登录")
      return;
    }
    if(that.data.finish){
      app.msg("你已经完成评教啦！")
      return
    }
    wx.showLoading({
      title: '努力评教中...',
    })
    var user_id = wx.getStorageSync('user_id');
    var user_password = wx.getStorageSync('user_password');
    app.httpRequest({
      url: 'access/accessing',
      data: {
        aid:that.data.assess.id,
        stu_id: user_id,
        password: user_password,
      },
      method:"POST",
      success: function (res) {
        wx.hideLoading()
        if (res.data.status == 1001) {
          app.msg("评教成功！", "success")
          setTimeout(function () {
            that.getList();
          }, 1000);
        } else {
          app.msg(res.data.message)
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
  /**
* 弹窗
*/
  updateScore: function (e) {
    var that = this;
    if (that.checkStatus) {
      app.msg("你已完成评教")
      return
    }
    var system_type = wx.getStorageSync('system_type');
    if (system_type != 2) {
      app.msg("请退出登录后使用旧教务系统账号登录")
      setTimeout(function () {
        app.needLogin(that.route)
      }, 2000)
      return;
    }
    that.setData({
      showModal: true
    });
    var type = e.target.dataset.type
    that.setData({
      type:type
    })
    /**获取验证码 */
    app.httpRequest({
      url: 'login/getLoginInitData',
      needLogin:false,
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
  hideModal: function (e) {
    this.setData({
      showModal: false
    })
  },
  /**
   * 对话框取消按钮点击事件
   */
  onCancel: function (e) {
    this.hideModal();
  },
  /** 获取验证码 */
  yzmInput: function (e) {
    this.setData({
      yzm: e.detail.value,
    })
  },

  //旧版获取列表
  assessV0:function(){
    var that = this
    if (that.checkStatus){
      app.msg("你已完成评教")
      return
    }
    var type = that.data.type
    if(type == 1){
      app.msg("正在查询")
    }else{
      wx.showLoading({
        title: '加载中',
      })
    }
    var user_id = wx.getStorageSync('user_id');
    var user_password = wx.getStorageSync('user_password');
    var yzm = that.data.yzm;
    var cookie = that.data.cookie;
    var str = app.globalData.key + user_id;
    var sign = md5.hexMD5(str);
    if (yzm == "") {
      app.msg("请输入验证码")
    } else {
      app.httpRequest({
        url: 'access/accessing',
        method: 'POST',
        data: {
          stu_id: user_id,
          password: user_password,
          code: yzm,
          cookie: cookie,
          __VIEWSTATE: that.data.__VIEWSTATE,
          sign: sign,
          type: type
        },
        success: function (res) {
          wx.hideLoading()
          that.hideModal();
          wx.hideNavigationBarLoading();
          if (res.data.status == 0) {
            that.setData({
              assesses: res.data.data
            })
            wx.setStorageSync('assess', that.data.assesses)
          } else {
            app.msg(res.data.message)
          }
        }
      })
    }
  },

  checkStatus:function(){
    var assess = this.data.assesses
    if (assess.length <= 0){
      return false
    }
    for (let i = 0; i < assess.length;i++){
      if(assess[i].status != '已评'){
        return false
      }
    }
    return true
  },
})