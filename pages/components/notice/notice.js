const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    page:{
      type: "String",
      value: ""
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    display: false,
    content: "这是通知"
  },

  ready: function(){
    let _this = this
    let page = _this.data.page
    app.httpRequest({
      url: 'notice/getNotice',
      needLogin: false,
      data:{
        page:page
      },
      success:function(res){
        if(res.data.status == 0){
          _this.setData(res.data.data)
        }
      }
    })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    close:function(){
      this.setData({
        display: false
      })
    },
    go:function(){
      if(this.data.url == ''){
        return
      }
      switch(this.data.type){
        case 1:
          wx.navigateTo({
            url: '/pages/article/article?src=' + encodeURIComponent(this.data.url),
          })
          break
        case 2:
          wx.navigateTo({
            url: this.data.url,
          })
          break
        case 3:
          wx.navigateToMiniProgram({
            appId:this.data.appid,
            path: this.data.url
          })
          break
        default:
          app.msg("暂不支持跳转")
          break
      }
    }
  },

 
})
