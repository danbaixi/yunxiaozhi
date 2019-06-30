var md5 = require('../../../utils/md5.js');
var util = require('../../../utils/util.js');
const { $Toast } = require('../../../dist/base/index');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    login:false,
    animationData:{},
    units:['年','月','周','天','小时','分钟','秒'],
    cando_pre: ['上', '订', '等', '开', '打','有', '聚','参加'],
    cando_last: ['节课', '份外卖', '次523', '次黑', '次球', '个假期', '次餐','场活动'],
    year_100_cando_pre:['睡','吃','生','过','流','吵','放'],
    year_100_cando_last:['次觉','顿饭','次病','个周末','次泪','次架','个屁'],
    scrollindex: 0,  //当前页面的索引值
    totalnum: 4,  //总共页面数
    starty: 0,  //开始的位置x
    endy: 0, //结束的位置y
    critical: 100, //触发翻页的临界值
    margintop: 0,  //滑动下拉距离
    rotating: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var user_id = wx.getStorageSync('user_id');
    if (user_id) {
      that.setData({
        login:true
      })
      if (JSON.stringify(wx.getStorageSync('time_data')) == "{}"){
        that.makeData();
      }else{
        that.getData();
      }
    }

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var user_id = wx.getStorageSync('user_id');
    if (user_id) {
      this.audio = wx.createInnerAudioContext()
      this.audio.autoplay = true
      this.audio.loop = true
      this.audio.src = 'http://yunxiaozhi-1251388077.cosgz.myqcloud.com/audio/time_music.mp3'
      this.audio.onPlay(() => {
        this.setData({
          rotating: 'rotating'
        })
      })
      this.audio.onError((res) => {
        $Toast({ 'content': '音乐加载失败', 'type': 'error' })
      })
    }
  },

  onUnload: function(){
    this.audio.stop();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '点击查看你的白云倒计时',
    }
  },
  //更新数据
  updateData:function(){
    var that = this;
    var cookie;
    wx.request({
      url: app.globalData.domain + 'login/getLoginCookie',
      success: function (res) {
        cookie = res.data.data.cookie;
      }
    });
    var user_id = wx.getStorageSync('user_id');
    var password = wx.getStorageSync('user_password');
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
          return true;
        }else {
          return false;
        }
      }
    })
  },
  //获取数据
  getData:function(){
    var that = this;
    var time_data = wx.getStorageSync("time_data");
    if (time_data){
      that.makeData();
    }else{
      var stu_id = wx.getStorageSync('user_id');
      var str = app.globalData.key + stu_id;
      var sign = md5.hexMD5(str);
      wx.request({
        url: app.globalData.domain + 'time/getData',
        data: {
          stu_id: stu_id,
          sign: sign
        },
        success: function (res) {
          if (res.data.status == 1002) {
            var update = that.updateData();
            if (update) {
              that.getData;
            } else {
              $Toast({ content: '获取数据失败，请联系客服', type: 'error' });
            }
          } else {
            var data = res.data.data;
            wx.setStorageSync('time_data', data);
            that.makeData();
          }
        }
      })
    }
  },
  //生成数据
  makeData:function(){
    var that = this;
    var data = wx.getStorageSync('time_data');
    //计算离校日期
    var tmp = data.entry_date.split("-");
    var end_date = (Number(tmp[0]) + Number(data.year - 1)) + '-07-01'; 
    var start = tmp[0]+"年"+tmp[1]+"月";
    var end = (Number(tmp[0]) + Number(data.year - 1)) + "年07月";
    var now = util.formatTime2(new Date());
    var hs = that.dateDiff(end_date,now);
    var s = parseInt(hs / 1000);
    var i = parseInt(s / 60);
    var h = parseInt(i / 60);
    var d = parseInt(h / 24);
    var w = Math.floor(d / 7);
    var m = Math.floor(d / 30 * 10)/10;
    var y = Math.floor(d / 365 *10)/10;
    var countdown = new Array(y,m,w,d,h,i,s)

    var course = parseInt(d*0.95);
    var lunch = parseInt(d*0.3);
    var bus = parseInt(d/14);
    var game = parseInt(d/18);
    var act = parseInt(d/40);
    var ball = parseInt(d/20);
    var dine = parseInt(d/50);
    var holiday = parseInt(d*7/365);
    var cando = new Array(course, lunch, bus, game, ball,holiday, dine, act);

    var birth = data.stu_birth.split("-");
    var year_100_date = (Number(birth[0])+100) + '-' + birth[1] + '-' + birth[2];
    var diff_year_100 = that.dateDiff(year_100_date, data.stu_birth)/1000/60/60/24;
    var eat = diff_year_100*3;
    var ill = parseInt(diff_year_100 / 365);
    var weekend = parseInt(diff_year_100/7);
    var tear = parseInt(diff_year_100/15);
    var brawl = parseInt(diff_year_100/60);
    var fart = parseInt(diff_year_100*1.7);
    var year_100_cando = new Array(diff_year_100,eat,ill,weekend,tear,brawl,fart);

    that.setData({
      name: data.stu_name,
      start_date: start,
      end_date: end,
      countdown: countdown,
      diff_year_100:diff_year_100,
      cando: cando,
      year_100_cando:year_100_cando,
    })
  },
  //计算两个日期的天数
  dateDiff: function (date1, date2) {
    var start_date = new Date(date1.replace(/-/g, "/"));
    var end_date = new Date(date2.replace(/-/g, "/"));
    var hs = start_date.getTime() - end_date.getTime();
    return hs;
  },
  scrollTouchstart: function (e) {
    let py = e.touches[0].pageY;
    this.setData({
      starty: py
    })
  },
  scrollTouchmove: function (e) {
    let py = e.touches[0].pageY;
    let d = this.data;
    this.setData({
      endy: py,
    })
    if (py - d.starty < 100 && py - d.starty > -100) {
      this.setData({
        margintop: py - d.starty
      })
    }
  },
  scrollTouchend: function (e) {
    let d = this.data;
    if (d.endy - d.starty > 100 && d.scrollindex > 0) {
      this.setData({
        scrollindex: d.scrollindex - 1
      })
    } else if (d.endy - d.starty < -100 && d.scrollindex < this.data.totalnum - 1) {
      this.setData({
        scrollindex: d.scrollindex + 1
      })
    }
    this.setData({
      starty: 0,
      endy: 0,
      margintop: 0
    })
  },
  //播放背景音乐
  playBG:function(){
    if(this.data.rotating == ""){
      this.audio.play();
      this.setData({
        rotating:'rotating'
      })
    }else{
      this.audio.stop();
      this.setData({
        rotating: ''
      })
    }
  },
  login:function(){
    wx.navigateTo({
      url: '../../bind/bind',
    })
  }
})