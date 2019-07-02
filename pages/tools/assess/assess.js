var app = getApp();
var util = require('../../../utils/util.js');
var md5 = require('../../../utils/md5.js');
const { $Toast } = require('../../../dist/base/index');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    btn:"一键评教",
    count:0,
    type:1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({
      user_id: wx.getStorageSync('user_id'),
      user_password: wx.getStorageSync('user_password')
    });
    if (!that.data.user_id) {
      wx.showToast({
        title: '请登录',
        icon: 'loading'
      });
      wx.redirectTo({
        url: '../../bind/bind',
      })
      return;
    }
    var assess = wx.getStorageSync('assess');
    that.setData({
      assesses: assess
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var that = this;
    return {
      title:'网上评教只需要3秒钟！',
      path:'pages/tools/assess/assess',
      imageUrl:'http://yunxiaozhi-1251388077.cosgz.myqcloud.com/wx_share/assess.jpg',
      success:function(res){
        that.setData({
          share:true,
        })
        wx.showToast({
          title: '分享成功',
          icon:'success',
          duration:1000,
        })
      },
      fail: function (res) {
        wx.showToast({
          title: '分享失败',
          icon: 'loading',
          duration: 1000,
        })
      }
    }
  },

  getList:function(){
    var that = this;
    var user_id = wx.getStorageSync('user_id');
    if (!user_id) {
      $Toast({ content: "请先登录", type: "warning" });
      return;
    }
    $Toast({ content: '加载中', type: 'loading', duration: 0 })
    var user_id = wx.getStorageSync('user_id');
    var user_password = wx.getStorageSync('user_password');
    var str = app.globalData.key + user_id;
    var sign = md5.hexMD5(str);
    var encoded = util.encodeInp(user_id) + "%%%" + util.encodeInp(user_password);
    wx.request({
      url: app.globalData.domain + 'access/getlist',
      data: {
        stu_id: user_id,
        password: user_password,
        encoded: encoded,
        sign: sign
      },
      success: function (res) {
        $Toast.hide();
        if (res.data.status == 1001) {
          var accesses = res.data.data.data;
          that.setData({
            accesses: accesses,
            count:res.data.data.count
          })
          var is_accessed = true;
          for (var i = 0; i < accesses.length ; i++){
            if(accesses[i].is_access == "否"){
              is_accessed = false;
              break;
            }
          }
          if(is_accessed){
            that.setData({
              is_accessed:true,
              btn:"你已完成所有评教"
            })
          }
        }else if(res.data.status==1003){
          $Toast({content:res.data.message,type:'warning'})
        }else{
          that.setData({
            isNull: true,
          })
          $Toast({ content: "你修改了密码，请重新登录", type: 'error' })
        }
      }
    })
  },
  access: function () {
    var that = this;
    var user_id = wx.getStorageSync('user_id');
    if (!user_id) {
      $Toast({ content: "请先登录", type: "warning" });
      return;
    }
    if(!that.data.is_accessed){
      $Toast({ content: '拼命评教中，请稍等', type: 'loading', duration: 0 })
      var user_id = wx.getStorageSync('user_id');
      var user_password = wx.getStorageSync('user_password');
      var str = app.globalData.key + user_id;
      var sign = md5.hexMD5(str);
      var encoded = util.encodeInp(user_id) + "%%%" + util.encodeInp(user_password);
      wx.request({
        url: app.globalData.domain + 'access/accessing',
        data: {
          stu_id: user_id,
          password: user_password,
          encoded: encoded,
          sign: sign
        },
        success: function (res) {
          $Toast.hide();
          if (res.data.status == 1001) {
            $Toast({ content: "评教成功！", type: 'success' });
            setTimeout(function(){
              that.getList();
            },1000);
          }else if(res.data.stauts == 1003){
            $Toast({content:res.data.message,type:"error"})
          }else if(res.data.status == 1004) {
            $Toast({ content: "出了点问题，请反馈给客服", type: 'error' })
          }else{
            $Toast({ content: "密码不正确，你是否修改了密码？", type: 'error' })
          }
        }
      })
    }else{
      $Toast({ content: "你已经评教完啦！", type: "warning" });
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
  },
  /**
* 弹窗
*/
  updateScore: function (e) {
    var that = this;
    var system_type = wx.getStorageSync('system_type');
    if (system_type != 2) {
      $Toast({ content: "请退出登录后使用旧教务系统账号登录", type: "warning" });
      setTimeout(function () {
        wx.redirectTo({
          url: '/pages/bind/bind',
        })
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
    var type = that.data.type
    if(type == 1){
      $Toast({ content: '正在查询', type: 'loading', duration: 0 })
    }else{
      $Toast({ content: '正在评教，请勿进行其他操作', type: 'loading', duration: 0 })
    }
    var user_id = wx.getStorageSync('user_id');
    var user_password = wx.getStorageSync('user_old_password');
    var yzm = that.data.yzm;
    var cookie = that.data.cookie;
    var str = app.globalData.key + user_id;
    var sign = md5.hexMD5(str);
    if (yzm == "") {
      $Toast({ content: '请输入验证码', type: 'warning' })
    } else {
      wx.request({
        url: app.globalData.domain + 'access/accessing',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
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
          $Toast.hide();
          that.hideModal();
          wx.hideNavigationBarLoading();
          if (res.data.status == 0) {
            $Toast({ content: res.data.message, type: 'success' });
            that.setData({
              assesses: res.data.data
            })
            wx.setStorageSync('assess', that.data.assesses)
          } else {
            $Toast({ content: res.data.message, type: 'error' });
          }
        }
      })
    }
  },
})