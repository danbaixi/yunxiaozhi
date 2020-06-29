const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fileUrl:app.globalData.fileUrl + '/summary',
    loading: false,
    customBar: app.globalData.customBar,
    scrollindex: 0,  //当前页面的索引值
    totalnum: 11,  //总共页面数
    starty: 0,  //开始的位置x
    endy: -1, //结束的位置y
    critical: 50, //触发翻页的临界值
    margintop: 0,  //滑动下拉距离
    myself:true,
    show:false,
    isGraduation:true,
    needBuild:1,
    loadingData:false,
    loadingWidth:0,
    buildFail:false,
    failSeason:'未知错误',
    scrollindex:0,
    music:false,
    summary:null,
    stuName:'你',
    ta:'他',
    posterUrl:'',
    article:'http://mp.weixin.qq.com/s?__biz=MzI1NTUwNDIzNQ==&mid=100001850&idx=1&sn=86ac4874a5debb7102318da5360318a7&chksm=6a35b23e5d423b28caa7c155aa07f3b7248245f53532fff6474541594217590c33eeea9e862b#rd',
    updates:{
      info: 'user/updateInfo',
      score: 'score/updateScoreV0',
      attendance: 'attendance/update',
      summary: 'user/buildGraduation'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let id = options.id || 0
    const scene = decodeURIComponent(options.scene || '')
    if(scene != ''){
      id = scene.split("=")[1]
    }
    let systemInfo = wx.getSystemInfoSync()
    let myself = false
    let totalnum = 11
    this.loadingMusic()
    if(id == 0){
      myself = true
      id = wx.getStorageSync('user_id')
      app.isLogin('/'+this.route).then((res)=>{
        if(res){
          this.initData()
        }
      })
    }else{
      totalnum = 10
      this.getSummary(id)
    }
    console.log(scene, id)
    const config = wx.getStorageSync('configs')
    this.setData({
      winWidth: systemInfo.windowWidth,
      winHeight: systemInfo.windowHeight,
      myself:myself,
      id:id,
      totalnum: totalnum,
      isAuditing:config.auditing
    })
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
    if(this.data.show){
      this.playMusic()
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.stopMusic()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let title = '查看专属你的毕业报告'
    let path = '/' + this.route
    if(this.data.summary){
      title = '查看' + this.data.summary.data.name + '的毕业报告'
      path = path + '?id=' + this.data.id 
    }
    console.log(path)
    return app.share(title,'summary.png',path)
  },

  //初始化数据
  initData:function(){
    let _this = this
    wx.showLoading({
      title: '正在加载中...',
    })
    _this.setData({
      loading:true
    })
    app.httpRequest({
      url: 'user/initSummary',
      redirect: '/' + _this.route,
      success:function(res){
        wx.hideLoading()
        if(res.data.status == -1){
          _this.setData({
            isGraduation:false
          })
          return
        }
        _this.setData({
          loading:false
        })
        _this.setData(res.data.data)
        _this.getPoster()
      }
    })
  },
  getSummary:function(stu_id){
    let _this = this
    wx.showLoading({
      title: '正在加载中...',
    })
    _this.setData({
      loading: true
    })
    app.httpRequest({
      url: 'share/getSummary',
      data:{
        stu_id:stu_id
      },
      needLogin:false,
      success: function (res) {
        wx.hideLoading()
        _this.setData({
          loading: false
        })
        if (res.data.status == -1) {
          app.msg(res.data.message)
          return
        }
        _this.setData(res.data.data)
        if(res.data.data.isOpen == 1){
          let ta = '他'
          if (res.data.data.summary.data.sex == '女') {
            ta = '她'
          }
          _this.setData({
            stuName: res.data.data.summary.data.name ? res.data.data.summary.data.name : ta,
            ta: ta
          })
          _this.getPoster()
        }

      }
    })
  },
  view:function(){
    let _this = this
    if(_this.data.needBuild == 1){
      _this.build()
      return
    }
    _this.show()
  },
  build:function(){
    let _this = this
    _this.setData({
      buildFail:false,
      failSeason:'',
      loadingData:true,
      loadingWidth:20
    })
    let updates = _this.data.updates
    _this.updateData(updates.info).then((res1) => {
      _this.setData({
        loadingWidth: 40
      })
      _this.updateData(updates.score).then((res2) => {
        _this.setData({
          loadingWidth: 60
        })
        _this.updateData(updates.attendance).then((res3) => {
          _this.setData({
            loadingWidth: 80
          })
          _this.updateData(updates.summary).then((res4) => {
            app.msg("生成报告完成")
            _this.setData({
              summary:res4.data.summary,
              loadingWidth: 100,
              needBuild:0,
              loadingData:false
            })
            setTimeout(()=>{
              _this.show()
            },1000)
          })
        })
      })
    }).catch((message) => {
      this.setData({
        buildFail: true,
        failSeason: message
      })
    })
  },
  updateData:function(url){
    return app.promiseRequest({
      url: url
    })
  },
  closeBuild:function(){
    this.setData({
      loadingData:false
    })
  },
  show:function(){
    this.setData({
      show:true
    })
    this.playMusic()
  },
  hide:function(){
    this.setData({
      show:false,
      scrollindex:0
    })
    this.stopMusic()
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
    if(d.endy == -1){
      return
    }
    let scrollindex = d.scrollindex, preIndex = d.scrollindex
    if (d.endy - d.starty > 100 && d.scrollindex > 0) {
      scrollindex = d.scrollindex - 1
    }
    if (d.endy - d.starty < -100 && d.scrollindex < this.data.totalnum - 1) {
      scrollindex = d.scrollindex + 1
    }
    let animationPlay = false
    if(preIndex != scrollindex){
      animationPlay = true
    }
    this.setData({
      scrollindex: scrollindex,
      starty: 0,
      endy: -1,
      margintop: 0,
      animationPlay: animationPlay
    })
    setTimeout(()=>{
      this.setData({
        animationPlay:false
      })
    },1000)
  },
  loadingMusic:function(){
    this.audio = wx.createInnerAudioContext()
    this.audio.autoplay = false
    this.audio.loop = true
    this.audio.src = this.data.fileUrl + '/music.mp3'
  },
  playMusic:function(){
    this.audio.play()
    this.setData({
      music: true
    })
    this.audio.onError((res) => {
      app.msg("音乐加载失败")
    })
  },
  stopMusic:function(){
    this.audio.stop();
    this.setData({
      music: false
    })
  },
  goTime:function(){
    wx.navigateTo({
      url: '/pages/my/time/time',
    })
  },
  showShare:function(){
    let poster = this.getPoster()
    if(poster === false){
      app.msg('获取分享海报失败，请联系客服')
      return
    }
    this.setData({
      share: true
    })
  },
  hideShare:function(){
    this.setData({
      share:false
    })
  },
  getPoster:function(){
    if(this.data.shareUrl){
      return this.data.posterUrl
    }
    let _this = this
    app.httpRequest({
      url:'share/getSummaryPoster',
      needLogin: false,
      data:{
        stu_id:_this.data.id
      },
      success:function(res){
        if(res.data.status == -1){
          app.msg("获取分享海报失败")
          return false
        }
        _this.setData({
          posterUrl: res.data.data.url
        })
        return res.data.data.url
      }
    })
  },
  savePoster:function(){
    let _this = this
    if (_this.data.posterUrl == '') {
      app.msg('请先生成海报')
      return
    }
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              _this.downloadImage()
            }
          })
        } else {
          _this.downloadImage()
        }
      }
    })
  },
  downloadImage: function () {
    let _this = this
    wx.getImageInfo({
      src: _this.data.posterUrl,
      success(res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.path,
          success(result) {
            app.msg("保存成功")
          },
          fail: function () {
            app.msg("保存失败")
          }
        })
      },
      fail: function () {
        app.msg('下载图片失败，请检查你的网络情况')
        return
      }
    })
  },
  topper:function(){
    this.setData({
      scrollindex:0
    })
  },
  downner:function(){
    this.setData({
      scrollindex: this.data.totalnum - 1
    })
  },
  showEditor:function(){
    this.setData({
      editor:true
    })
  },
  hideEditor:function(){
    this.setData({
      editor: false
    })
  },
  blessingInput:function(e){
    this.setData({
      blessing: e.detail.value
    })
  },
  nameInput: function (e) {
    this.setData({
      name: e.detail.value
    })
  },
  submit:function(){
    let _this = this
    if(_this.data.blessing == ''){
      app.msg("祝福语不能为空")
      return
    }
    _this.setData({
      submiting:true
    })
    app.httpRequest({
      url:'share/submitBlessing',
      needLogin: false,
      method:'POST',
      data:{
        stu_id:_this.data.id,
        content:_this.data.blessing,
        name:_this.data.name || ''
      },
      success:function(res){
        _this.setData({
          submiting:false
        })
        app.msg(res.data.message)
        if(res.data.status == 0){
          let benediction = _this.data.benediction
          let content = {
            author: _this.data.name,
            content: _this.data.blessing
          }
          benediction.unshift(content)
          _this.setData({
            benediction:benediction,
            blessing:''
          })
          _this.hideEditor()
        }
      }
    })
  },
  switchShare:function(){
    let _this = this
    let isOpen = _this.data.summary.is_open
    let result = isOpen == 1 ? 0 : 1
    app.httpRequest({
      url:'user/switchSummaryShare',
      method:'POST',
      data:{
        status: result
      },
      success:function(res){
        app.msg(res.data.message)
        if(res.data.status == 0){
          let summary = _this.data.summary
          summary.is_open = result
          _this.setData({
            summary: summary
          })
        }
      }
    })
  },
  showArticle:function(){
    wx.navigateTo({
      url: '/pages/article/article?src=' + encodeURIComponent(this.data.article),
    })
  }
})