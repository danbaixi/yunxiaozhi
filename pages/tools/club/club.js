const app = getApp()
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
    cid:0
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
        length: _this.data.length
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
  star:function(){
    app.msg("暂未开放")
    return
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
    let id = e.currentTarget.dataset.index
    this.setData({
      showItem:true,
      activeId: id
    })
  },
  hideItem:function(){
    this.setData({
      showItem: false
    })
  }
})