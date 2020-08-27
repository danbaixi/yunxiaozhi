// pages/components/float-tool.js
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

  },

  ready: function(){
    const app = getApp()
    let configs = app.getConfig('floatTool')
    let floatTool = {
      display: false,
      image: '',
      src:''
    }
    if(configs){
      floatTool = configs
      let closeTime = wx.getStorageSync('float_close_time')
      let time = Math.floor((new Date()).getTime() / 1000)
      //1天内不再显示
      if(closeTime && (closeTime + 1 * 24 * 60 * 60) > time){
        floatTool.display = false
      }else if(floatTool.display && floatTool.pages.indexOf(this.data.page) != -1){
        floatTool.display = true
      }else{
        floatTool.display = false
      }
    }
    this.setData(floatTool)
  },

  /**
   * 组件的方法列表
   */
  methods: {
    click:function(){
      wx.navigateTo({
        url: '/pages/article/article?src=' + encodeURIComponent(this.data.src)
      })
    },
    close:function(){
      this.setData({
        display:false
      })
      let time = Math.floor((new Date()).getTime() / 1000)
      wx.setStorageSync('float_close_time',time)
    }
  }
})
