const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading:true,
    exist:true,
    article:'http://mp.weixin.qq.com/s?__biz=MzI1NTUwNDIzNQ==&mid=100002184&idx=1&sn=e2270b415d6581bbe4e2ec54da0df7a3&chksm=6a35b38c5d423a9a108c4318d9913ec93e9fa8a72fe608c138b701644d37620df203a9921d2f#rd'
  },  

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let id = options.id
    if(id <= 0){
      this.setData({
        loading:false,
        exist: false
      })
      return
    }
    this.setData({
      id:id
    })
    this.getItem()
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
  //获取详情
  getItem:function(){
    let _this = this
    app.httpRequest({
      url:'club/getItem',
      needLogin:false,
      data:{
        id:_this.data.id,
      },
      success:function(res){
        if(res.data.status == -1){
          app.msg(res.data.message)
          _this.setData({
            loading:false,
            exist:false
          })
          return
        }
        let item = res.data.data
        if(item.displayed == 0 || item.deleted == 1){
          app.msg("该社团不存在")
          return
        }
        _this.setData({
          loading:false,
          exist:true,
          club:item
        })
      }
    })
  },
  star:function(){
    let _this = this
    let stu_id = wx.getStorageSync('user_id')
    if(stu_id == ''){
      app.msg("登录后才能点赞哦")
      return
    }
    if(_this.data.stared == 1){
      app.msg("你已经点过赞啦！")
      return
    }
    app.httpRequest({
      url: 'club/star',
      method: 'POST',
      data:{
        cid: _this.data.id,
        stu_id:stu_id
      },
      success:function(res){
        app.msg(res.data.message)
        if(res.data.status == 0){
          let club = _this.data.club
          club.star++
          _this.setData({
            stared:1,
            club:club
          })
        }else if(res.data.status == 1001){
          _this.setData({
            stared:1
          })
        }
      }
    })
  },
  viewPhotos:function(){
    if(this.data.club.photos == ''){
      app.msg("暂无照片")
      return
    }
    let photos = JSON.parse(this.data.club.photos)
    if(photos.length == 0){
      app.msg("暂无照片")
      return
    }
    wx.previewImage({
      current: photos[0],
      urls: photos
    })
  },
  edit:function(){
    wx.navigateTo({
      url: '/pages/article/article?src=' + encodeURIComponent(this.data.article),
    })
  }
})