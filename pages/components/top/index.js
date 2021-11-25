Component({
  properties: {
    duration: {
      type: Number,
      value: 300
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    toTop() {
      wx.pageScrollTo({
        duration: this.properties.duration,
        scrollTop: 0
      })
      this.triggerEvent('click')
    }
  }
})
