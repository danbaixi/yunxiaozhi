// pages/components/focus/focus.js
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
    article: "http://mp.weixin.qq.com/s?__biz=MzI1NTUwNDIzNQ==&mid=100001363&idx=1&sn=67d2da535e60c9cb0f6e14d6064fd343&chksm=6a35bc575d423541201186f77e8203f6d5318a073a69e614967edf4ebf207381690812f0f08d#rd"
  },

  /**
   * 组件的方法列表
   */
  methods: {
    focus:function(){
      wx.navigateTo({
        url: '/pages/article/article?src=' + encodeURIComponent(this.data.article),
      })
    }
  }
})
