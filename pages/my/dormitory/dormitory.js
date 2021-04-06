const { getDormitory, getRoomList, getLevelList, getDormitoryList, setDormitory } = require('../../api/user')
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

  //获取设置
  getInfo:function(){
    let _this = this
    getDormitory()
      .then((res) => {
        _this.setData({
          dormitory:res.data
        })
      })
  },

  //获取数据
  getItem:function(){
    let _this = this
    wx.showLoading({
      title: '正在加载...',
      mask: true
    })
    getRoomList()
      .then((res) => {
        _this.setData({
          rooms: res.data,
          areas: res.data[1]
        })
      })
  },

  // 获取选择器选项
  getOptions:function(type,id){
    let rooms = this.data.rooms
    let coloum = ''
    switch(type){
      case 1:coloum = 'area';break
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
    if(optype < 2){
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
          level: -1
        }
        break
      case 3:
        data = {
          level: val,
          room: 0
        }
        break
      case 4:
        data = {
          room: val
        }
    }
    this.setData(data)
    if(optype == 2){
      this.getLevels()
    }else if(optype == 3){
      this.getRooms()
    }
  },

  //获取楼层
  getLevels:function(){
    let _this = this
    let area = _this.data.areas[_this.data.area].id
    let build = _this.data.builds[_this.data.build].id
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    getLevelList({area,build})
      .then((res) => {
        if(res.status == 0){
          _this.setData({
            levels:res.data
          })
        }
      })
  },

  //获取宿舍号
  getRooms:function(){
    let _this = this
    let area = _this.data.areas[_this.data.area].id
    let build = _this.data.builds[_this.data.build].id
    let level = _this.data.levels[_this.data.level].id
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    getDormitoryList({
      area:area,
      build:build,
      level:level
    })
    .then((res) => {
      _this.setData({
        dormitorys:res.data
      })
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
    let id = _this.data.dormitorys[_this.data.room].id
    let name = _this.data.areas[_this.data.area].name + '-' + _this.data.builds[_this.data.build].name + '-' + _this.data.dormitorys[_this.data.room].name
    setDormitory({
      id: id,
      name: name
    })
    .then((res) => {
      if(res.status == 0){
        app.msg(res.message)
        _this.setData({
          dormitory: name
        })
        var pages = getCurrentPages();
        var prevPage = pages[pages.length - 2];
        if(!prevPage){
          return
        }
        prevPage.setData({
          isFresh: true
        })
      }
    })
  }
})