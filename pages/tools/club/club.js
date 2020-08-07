const app = getApp()
const util = require("../../../utils/util")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    customBar: app.globalData.customBar,
    loading:false,
    list:[],
    p:1,
    length:10,
    search: '',
    oldSearch: '',
    notMore: false,
    category:[{
      id:0,
      name:"全部分类"
    }],
    cid:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getList()
    this.getCategory()
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
    if(!this.data.notMore){
      this.setData({
        loading: true,
        p: this.data.p + 1
      })
      this.getList()
    }

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '找社团，上云小智'
    }
  },
  searchInput:function(e){
    this.setData({
      search: e.detail.value
    })
  },
  search:function(){
    if(this.data.search == this.data.oldSearch){
      return
    }
    this.setData({
      oldSearch: this.data.search,
      list: [],
      p:1
    })
    this.getList()
  },
  getList:function(){
    let _this = this 
    let stu_id = wx.getStorageSync('user_id')
    _this.setData({
      loading: true
    })
    app.httpRequest({
      url:'club/getList',
      needLogin: false,
      data:{
        search:_this.data.search,
        cid: _this.data.category[_this.data.cid].id,
        p: _this.data.p,
        length: _this.data.length,
        stu_id:stu_id
      },
      success:function(res){
        let list = _this.data.list
        if(res.data.data.list.length < _this.data.length){
          res.data.data.notMore = true
        }else{
          res.data.data.notMore = false
        }
        list = list.concat(res.data.data.list)
        res.data.data.list = list
        _this.setData(res.data.data)
      }
    })
  },
  //获取分类
  getCategory:function(){
    let _this = this
    app.httpRequest({
      url:'/club/getCategory',
      needLogin:false,
      success:function(res){
        let category = _this.data.category
        category = category.concat(res.data.data)
        _this.setData({
          category:category
        })
      }
    })
  },
  //选择分类
  selectCategory:function(e){
    let select = e.detail.value
    if(select == this.data.cid){
      return
    }
    this.setData({
      p:1,
      list:[],
      cid:select
    })
    this.getList()
  },
  showItem:function(e){
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/tools/club/item/item?id=' + id,
    })
  },
  star:function(e){
    let _this = this
    let stu_id = wx.getStorageSync('user_id')
    let index = e.currentTarget.dataset.index
    let cid = _this.data.list[index].id
    if(stu_id == ''){
      app.msg("登录后才能点赞哦")
      return
    }
    if(_this.data.list[index].stared == 1){
      app.msg("你已经点过赞啦！")
      return
    }
    app.httpRequest({
      url: 'club/star',
      method: 'POST',
      data:{
        cid:cid,
        stu_id:stu_id
      },
      success:function(res){
        app.msg(res.data.message)
        if(res.data.status == 0){
          let list = _this.data.list
          list[index].star++
          list[index].stared = 1
          _this.setData({
            list:list
          })
        }
      }
    })
  }
})