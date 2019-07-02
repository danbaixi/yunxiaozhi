var util = require('../../utils/util.js');
var md5 = require('../../utils/md5.js');
const { $Toast } = require('../../dist/base/index');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    yzmUrl: "", 
    cookie: "",
    cookie_2:"",
    __VIEWSTATE: "",
    user_id: "",
    user_password: "",
    code: "", 
    password_display:false,
    loading:false,
    modal_visible:false,
    hasNotice:false,
    systemType:2
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (wx.getStorageSync('user_id')) {
      wx.redirectTo({
        url: '../course/course',
      })
    }
    var that = this;
    that.getNotice();
    that.loginInitV1(); 
    wx.request({
      url: app.globalData.domain + 'login/getLoginCookie',
      success: function (res) {
        if(res.data.status == 1002){
          $Toast({ content: res.data.message, type: 'error' })
          return
        }
        that.setData({
          cookie: res.data.data.cookie,
        })
      }
    });
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * 绑定教务系统
   */
  login: function (e) {
    var that = this;
    var user_id = that.data.user_id;
    var password = that.data.user_password;
    var code = that.data.code;
    if (user_id == "") {
      $Toast({ content: '请输入学号', type:'warning'});
      return
    }
    if (password == "") {
      $Toast({ content: '请输入密码', type: 'warning' })
      return
    } 
    if (that.data.systemType==2 && code == ""){
      $Toast({ content: '请输入验证码', type: 'warning' });
      return
    }
    $Toast({ content: '登录中', type: 'loading', duration: 0 });
    if(that.data.systemType == 1){
      var cookie = that.data.cookie;
      var encoded = util.encodeInp(user_id) + "%%%" + util.encodeInp(password);
      wx.request({
        url: app.globalData.domain + 'login/Login',
        data: {
          stu_id: user_id,
          password: password,
          cookie: cookie,
          encoded: encoded,
        },
        method: "POST",
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          $Toast.hide();
          if (res.data.status == 1002) {
            var str = app.globalData.key + user_id;
            var sign = md5.hexMD5(str);
            wx.request({
              url: app.globalData.domain + 'course/getList',
              data: {
                stu_id: user_id,
                sign: sign,
              },
              success: function (res) {
                if (res.data.status == 1001) {
                  wx.setStorageSync('course', res.data.data.course);
                } else {
                  $Toast({ content: '获取课表失败', type: 'error' });
                }
              },
            });
            wx.setStorageSync('user_id', user_id);
            wx.setStorageSync('user_password', password);
            wx.setStorageSync('user_old_password', res.data.data);
            wx.setStorageSync('user_new_password', password);
            wx.setStorageSync('system_type', that.data.systemType);
            setTimeout(function () {
              wx.switchTab({ url: '../index/index' })
            }, 1000);
            $Toast({ content: '登录成功', type: 'success' });
          } else if (res.data.status == 1003) {
            $Toast({ content: '学号或密码有误', type: 'error' });
          } else {
            $Toast({ content: '登录失败', type: 'error' });
          }
        }
      })
    }else{
      wx.request({
        url: app.globalData.domain + 'login/LoginV1',
        data: {
          stu_id: user_id,
          password: password,
          cookie: that.data.cookie_2,
          __VIEWSTATE: that.data.__VIEWSTATE,
          code: that.data.code,
        },
        method: "POST",
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          $Toast.hide();
          if (res.data.status == 0) {
            var str = app.globalData.key + user_id;
            var sign = md5.hexMD5(str);
            wx.setStorageSync('user_id', user_id);
            wx.setStorageSync('user_new_password', res.data.data);
            wx.setStorageSync('user_old_password', password);
            wx.setStorageSync('user_password', password);
            wx.setStorageSync('system_type', that.data.systemType);
            wx.request({
              url: app.globalData.domain + 'course/getList',
              data: {
                stu_id: user_id,
                sign: sign
              },
              success: function (res) {
                if (res.data.status == 1001) {
                  $Toast({ content: '登录成功', type: 'success' });
                  wx.setStorageSync('course', res.data.data.course);
                  wx.setStorageSync('train', res.data.data.train_course);
                  wx.switchTab({ url: '../index/index' })
                } else if(res.data.status == 1002){
                  $Toast({ content: '登录成功', type: 'success' });
                  wx.switchTab({ url: '../index/index' })
                }else{
                  $Toast({ content: '登录失败', type: 'error' });
                }
              },
            }); 
          }else {
            $Toast({ content: res.data.message, type: 'error' });
            that.freshYzm();
          }
        }
      })
    }
    

  },
  /** 刷新验证码 */
  freshYzm: function () {
    var num = Math.ceil(Math.random() * 1000000);
    this.setData({
      loading:true,
      yzmUrl: app.globalData.domain + 'login/getValidateImg?cookie=' + this.data.cookie_2 + '&rand=' + num,
    })
  },
  /** 输入学号 */
  inputUserId:function(e){
    var that = this;
    that.setData({
      user_id: e.detail.value.trim()
    })
  },
  /** 输入密码 */
  inputPwd: function (e) {
    var that = this;
    that.setData({
      user_password: e.detail.value
    })
  },
  /** 输入验证码 */
  inputCode: function (e) {
    var that = this;
    that.setData({
      code: e.detail.value
    })
  },
  /** 清空学号 */
  clearUserId:function(){
    this.setData({
      user_id:''
    })
  },
  /** 展开密码 */
  displayPwd:function(){
    this.setData({
      display_password:true
    })
  },
  /** 隐藏密码 */
  hidePwd: function () {
    this.setData({
      display_password: false
    })
  },
  /** 图片预加载 */
  imageLoad:function(){
    this.setData({
      loading:false
    })
  },
  /** 帮助 */
  help:function(){
    this.setData({
      modal_visible:true,
    })
  },
  handleClose:function(){
    this.setData({
      modal_visible: false,
    })
  },
  //获取公告
  getNotice: function () {
    var that = this;
    wx.request({
      url: app.globalData.domain + 'notice/getnotice',
      data: {
        page: 'login'
      },
      success: function (res) {
        if (res.data.status == 1001) {
          that.setData({
            hasNotice: res.data.data.display == 1 ? true : false,
            notice: res.data.data.content
          })
        } else {
          that.setData({
            hasNotice: false
          })
        }
      }
    })
  },

  //切换登录方式
  changeLoginType:function(e){
    var type = e.target.dataset.type;
    this.setData({
      systemType:type
    })
    if(this.data.cookie_2 == ""){
      this.loginInitV1(); 
    }

  },

  //获取旧的教务系统登录cookie
  loginInitV1:function(){
    var that = this
    wx.request({
      url: app.globalData.domain + 'login/getLoginInitData',
      success: function (res) {
        that.setData({
          cookie_2: res.data.data.cookie,
          __VIEWSTATE: res.data.data.__VIEWSTATE,
        })
        that.freshYzm();
      }
    });
  }
})