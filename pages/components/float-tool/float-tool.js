// pages/components/float-tool.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  ready: function(){
    let configs = wx.getStorageSync('configs')
    let floatTool = {
      display: false,
      image: '',
      src:''
    }
    if(configs.hasOwnProperty('floatTool')){
      floatTool = configs.floatTool
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
    }
  }
})
