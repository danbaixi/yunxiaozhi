// pages/components/update-tips/update-tips.js
Component({
  /**
   * 组件的属性列表
   */
  options: {
    addGlobalClass: true
  },

  properties: {
    display:{
      type: [Boolean,String],
      value: true
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    
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
    update:function(){
      this.setData({
        display: false
      })
      wx.navigateTo({
        url: '/pages/tools/score/score?from=index',
      })
    }
  }
})
