const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    soul:'',
    name:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.isBind()
  },

  nameInput:function(e){
    this.setData({
      name:e.detail.value
    })
  },
  soulInput: function (e) {
    this.setData({
      soul: e.detail.value
    })
  },
  submit:function(){
    if(this.data.soul == ''){
      app.msg('不写点内容再提交？')
      return
    }
    let _this = this
    wx.showLoading({
      title: '提交中',
    })
    app.httpRequest({
      url:'soul/create',
      method:'POST',
      data:{
        title: _this.data.soul,
        name:_this.data.name
      },
      success:function(res){
        app.msg(res.data.message)
        if(res.data.status == 0){
          _this.setData({
            soul:'',
            name:''
          })
          return
        }
      }
    })
  }
})