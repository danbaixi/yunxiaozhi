const app = getApp()
const { getUserTimeInfo } = require('../../api/other')
const dayjs = require('../../../utils/dayjs.min')
const { backPage } = require('../../../utils/common')
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
    critical: 50, //触发翻页的临界值
    margintop: 0,  //滑动下拉距离
    music: false,
    tips:"此功能需要登录后才能使用",
    modalDisplay:false,
    customBar: app.globalData.customBar,
    name: '某某',
    start_date: 'XXXX年XX月',
    end_date: 'XXXX年XX月',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({
      from: options.from
    })
    app.isLogin('/' + that.route).then(function (res) {
      that.setData({
        login: true
      })
      var data = wx.getStorageSync('time_data')
      if (data != "") {
        that.makeData();
      } else {
        that.getData();
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (e) {
    if(!this.data.music){
      this.audio = wx.createInnerAudioContext()
      this.audio.autoplay = true
      this.audio.loop = true
      this.audio.src = 'https://yunxiaozhi-1251388077.cos.ap-guangzhou.myqcloud.com/audio/time_music.mp3'
      this.audio.onPlay(() => {
        this.setData({
          music: true
        })
      })
      this.audio.onError((res) => {
        console.log(res)
        app.msg("音乐加载失败")
      })
    }
  },

  onUnload: function(){
    this.stopMusic()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return app.share('点击查看你剩余的白云时光','time.png',this.route)
  },
  
  //获取数据
  getData:function(){
    var that = this;
    var time_data = wx.getStorageSync("time_data");
    if (time_data == '' || time_data == null){
      getUserTimeInfo().then((res) => {
        if (res.status != 0) {
          that.setData({
            modalDisplay: true,
            tips: "无法获取个人信息，请重新登录"
          })
          return
        }
        wx.setStorageSync('time_data', res.data)
        that.makeData()
      })
    }else{
      that.makeData()
    }
  },

  //生成数据
  makeData:function(){
    var that = this;
    var data = wx.getStorageSync('time_data');
    if (data.entry_date == '0000-00-00'){
      that.setData({
        modalDisplay: true,
        tips: "无法获取个人信息，请重新登录"
      })
      return
    }
    //计算离校日期
    var tmp = data.entry_date.split("-");
    var end_date = (Number(tmp[0]) + Number(data.year - 1)) + '-07-01'; 
    var start = tmp[0]+"年"+tmp[1]+"月";
    var end = (Number(tmp[0]) + Number(data.year - 1)) + "年07月";
    var now = dayjs()
    var s = dayjs(end_date).diff(now,'s')
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

    let birth_day = dayjs(data.stu_birth)
    var diff_year_100 = birth_day.add(100,'y').diff(birth_day,'d')
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

    //秒倒计时
    that.setTimeInterval()
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
    if (!this.data.music){
      this.audio.play();
      this.setData({
        music:true
      })
    }else{
      this.audio.stop();
      this.setData({
        music: false
      })
    }
  },

  stopMusic:function(){
    this.audio.stop();
    this.setData({
      music: false
    })
  },

  login:function(){
    this.audio.stop();
    wx.setStorageSync('time_data', '')
    wx.navigateTo({
      url: '/pages/bind/bind?url=/'+ this.route,
    })
  },
  back:function(){
    backPage(this.data.from)
  },

  //倒计时
  setTimeInterval:function(){
    let ct = this.data.countdown
    if(ct){
      setInterval(() => {
        ct[ct.length - 1]--
        this.setData({
          countdown: ct
        })
      },1000)
    }
  }
})