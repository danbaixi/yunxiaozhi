const app = getApp()
const { getNotice, noticeClickEvent } = require('../../../utils/common')
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    page:{
      type: "String",
      value: ""
    },
    Style:{
      type: 'String',
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
    let data = getNotice(this.data.page)
    if(!data){
      this.setData({
        display: false
      })
      return
    }
    this.setData(data)
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
      noticeClickEvent(this.data)
    }
  }
})
