var md5 = require('../../../utils/md5.js');
var util = require('../../../utils/util.js');
const { $Toast } = require('../../../dist/base/index');
var app = getApp();
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
    isNull:false,
    maxUpdateTime:2,
    refreshAnimation:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var winHeight = wx.getSystemInfoSync().windowHeight;
    that.setData({
      winHeight: winHeight
    })
    //检查是否登录
    if (!wx.getStorageSync('user_id')){
      wx.reLaunch({
        url: '../../bind/bind',
      })
    }else{
      this.getScore(false);
      this.getNotice()
    } 
  },

  /**
   * 下拉刷新，更新成绩
   */
  onPullDownRefresh:function(){
    var that = this;
    wx.stopPullDownRefresh();
    if (wx.getStorageSync('system_type') != 2){
      wx.clearStorageSync('user_id');
      wx.redirectTo({
        url: '/pages/bind/bind',
      })
      wx.showToast({
        title: '请使用旧的教务系统账号登录',
        icon: 'none'
      })
      return
    }
    var time = (new Date()).getTime();
    if (wx.getStorageInfoSync('score_update_time') != ""){
      var update_time = wx.getStorageSync('score_update_time');
      var cha = time - update_time;
      var second = Math.floor(cha / 24 / 60);
    }else{
      var second = that.data.maxUpdateTime*60;
    }
    if (second >= that.data.maxUpdateTime*60){
      wx.showNavigationBarLoading();
      $Toast({ content: '更新中', type: 'loading', duration: 0 });
      var user_id = wx.getStorageSync('user_id');
      var user_password = wx.getStorageSync('user_new_password');
      var str = app.globalData.key + user_id;
      var sign = md5.hexMD5(str);
      var encoded = util.encodeInp(user_id) + "%%%" + util.encodeInp(user_password);
      wx.request({
        url: app.globalData.domain + 'score/updateScore',
        data: {
          stu_id: user_id,
          password: user_password,
          encoded: encoded,
          sign: sign
        },
        success: function (res) {
          $Toast.hide();
          wx.hideNavigationBarLoading();
          wx.setStorageSync('score_update_time', time);
          if (res.data.status == 1001) {
            $Toast({ content: '更新了' + res.data.data + '条记录', type: 'success' });
            if(res.data.data>0){
              that.setData({
                isNull: false
              })
              setTimeout(function () {
                that.getScore(true);
              }, 1000)
            }
          } else {
            $Toast({content:res.data.message, type: 'error' });
          }
        }
      })
    }else{
      wx.hideNavigationBarLoading();
      $Toast({ content: (that.data.maxUpdateTime*60-second)+'秒后可更新', type: 'error' });
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '期末成绩还是这里查得最快！',
      path: 'pages/tools/score/score',
      imageUrl:'http://yunxiaozhi-1251388077.cosgz.myqcloud.com/wx_share/score.jpg'
    };
  },
  /** 
 * 滑动切换tab 
 */
  bindChange: function (e) {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
    var scores = wx.getStorageSync('scores');
    var that = this;
    that.setData({ 
      currentTab: e.detail.current
    });
  },
  /**
   * 进入成绩详情
   */
  itemData:function(e){
    var that = this;
    var course = e.currentTarget.dataset.course;
    var score = e.currentTarget.dataset.score;
    var credit = e.currentTarget.dataset.credit;
    var gpa = e.currentTarget.dataset.gpa;
    wx.navigateTo({
      url: 'top/top?course='+course+'&score='+score+'&credit='+credit+'&gpa='+gpa,
    })
  },
  analysis:function(){
    wx.navigateTo({
      url:'ana/ana'
    })
  },
  refresh:function(){
    this.onPullDownRefresh();
  },
  //获取成绩
  getScore:function(update){
    var that = this;
    $Toast({ content: '加载中', type: 'loading', duration: 0 });
    var scores = wx.getStorageSync('scores');
    if(scores.length>0 && !update){
      that.setData({
        avg: scores.avg,
        score: scores.score,
        term: scores.term
      })
      $Toast.hide()
    }else{
      var user_id = wx.getStorageSync('user_id');
      var str = app.globalData.key + user_id;
      var sign = md5.hexMD5(str);
      wx.request({
        url: app.globalData.domain + 'score/getscorelist',
        data: {
          sign: sign,
          stu_id: user_id
        },
        success: function (res) {
          $Toast.hide()
          if (res.data.status == 1001) {
            wx.setStorageSync('scores', res.data.data);
            that.setData({
              avg: res.data.data.avg,
              score: res.data.data.score,
              term: res.data.data.term
            })
          } else if (res.data.status == 1002) {
            $Toast({ content: '获取失败', type: 'error' });
          } else if (res.data.status == 1003) {
            that.setData({
              isNull: true
            })
          }
        },
      });
    }
  },

  //获取公告
  getNotice: function () {
    var that = this;
    wx.request({
      url: app.globalData.domain + 'notice/getnotice',
      data: {
        page: 'score'
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
  updateScore: function () {
    var that = this;
    var system_type = wx.getStorageSync('system_type');
    if (system_type != 2) {
      $Toast({ content: "请使用旧教务系统账号登录后更新成绩", type: "warning" });
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
  //更新成绩
  update:function(){
    var that = this;
    that.setData({ list_is_display: false })
    var user_id = wx.getStorageSync('user_id');
    if (!user_id) {
      $Toast({ content: "请先登录", type: "warning" });
      return;
    }
    var time = (new Date()).getTime();
    if (wx.getStorageInfoSync('score_update_time') != "") {
      var update_time = wx.getStorageSync('score_update_time');
      var cha = time - update_time;
      var minutes = Math.floor(cha / 24 / 3600);
    } else {
      var minutes = 10;
    }
    if (minutes >= 10) {
      $Toast({ content: '更新中', type: 'loading', duration: 0 })
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
          url: app.globalData.domain + 'score/updateScoreV0',
          data: {
            stu_id: user_id,
            password: user_password,
            code: yzm,
            cookie: cookie,
            __VIEWSTATE: that.data.__VIEWSTATE,
            sign: sign
          },
          success: function (res) {
            $Toast.hide();
            wx.hideNavigationBarLoading();
            wx.setStorageSync('score_update_time', time);
            if (res.data.status == 1001) {
              $Toast({ content: '更新了' + res.data.data + '条记录', type: 'success' });
              if (res.data.data > 0) {
                that.setData({
                  isNull: false
                })
                setTimeout(function () {
                  that.getScore(true);
                }, 1000)
              }
            } else {
              $Toast({ content: res.data.message, type: 'error' });
            }
          }
        })
      }
    } else {
      $Toast({ content: (10 - minutes) + '分钟后可更新', type: 'error' });
    }
  }
})