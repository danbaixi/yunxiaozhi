const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    optype: 1, //类型
    pid: 0,//父级id
    rooms:{},
    area: -1,
    build: -1,
    level: -1,
    room: -1,
    areas:[],
    builds:[],
    levels:[],
    dormitorys: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.isLogin()
    this.getItem()
    this.getInfo()
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

  },

  //获取设置
  getInfo:function(){
    let _this = this
    app.httpRequest({
      url:'dormitory/getDormitory',
      success:function(res){
        _this.setData({
          dormitory:res.data.data
        })
      }
    })
  },

  //获取数据
  getItem:function(){
    let _this = this
    wx.showLoading({
      title: '正在加载...',
    })
    app.httpRequest({
      url:'dormitory/getRoom',
      success:function(res){
        wx.hideLoading({
          complete: (res) => {},
        })
        _this.setData({
          rooms: res.data.data,
          areas: res.data.data[1]
        })
      }
    })
  },

  getOptions:function(type,id)
  {
    let rooms = this.data.rooms
    let coloum = ''
    switch(type){
      case 1:coloum = 'area';break
      case 2:coloum = 'build';break
    }
    let result = []
    type = type + 1
    for(let i=0;i<rooms[type].length;i++){
      if(rooms[type][i][coloum] == id){
        result.push(rooms[type][i])
      }
    }
    return result
  },

  //设置校区
  select:function(e){
    let optype = Number(e.currentTarget.dataset.optype)
    let val = e.detail.value
    let ops = []
    if(optype < 3){
      let id = this.data.rooms[optype][val]['id']
      ops = this.getOptions(optype,id)
    }
    let data = {}
    switch(optype){
      case 1:
        data = {
          area: val,
          builds: ops,
          build: -1
        }
        break
      case 2:
        data = {
          build: val,
          levels: ops,
          level: -1
        }
        break
      case 3:
        data = {
          level: val,
          room: -1
        }
        break
      case 4:
        data = {
          room: val
        }
    }
    this.setData(data)
    if(optype == 3){
      this.getRooms()
    }
  },

  getRooms:function(){
    let _this = this
    let area = _this.data.areas[_this.data.area].id
    let build = _this.data.builds[_this.data.build].id
    let level = _this.data.levels[_this.data.level].id
    wx.showLoading({
      title: '正在加载',
    })
    app.httpRequest({
      url:'dormitory/getDormitoryList',
      data:{
        area:area,
        build:build,
        level:level
      },
      success:function(res){
        wx.hideLoading({
          complete: (res) => {},
        })
        _this.setData({
          dormitorys:res.data.data
        })
      }
    })
  },

  //保存
  save:function(){
    let _this = this
    if(_this.data.area < 0){
      app.msg('请选择校区')
      return
    }
    if(_this.data.build < 0){
      app.msg('请选择宿舍楼')
      return
    }
    if(_this.data.level < 0){
      app.msg('请选择楼层')
      return
    }
    if(_this.data.room < 0){
      app.msg('请选择房号')
      return
    }
    app.httpRequest({
      url:'dormitory/setRoom',
      method:'POST',
      data:{
        did: _this.data.dormitorys[_this.data.room].did
      },
      success:function(res){
        app.msg(res.data.message)
        if(res.data.status == 0){
          _this.getInfo()
          var pages = getCurrentPages();
          var currPage = pages[pages.length - 1];
          var prevPage = pages[pages.length - 2];
          prevPage.setData({
            isFresh: true
          })
        }
      }
    })
  }
})