// pages/components/copy/copy.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    content:{
      type: 'String',
      value: ''
    },
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
    copy:function(){
      let content = this.data.content
      wx.setClipboardData({
        data: content,
        success (res) {
          
        }
      })
    }
  }
})
