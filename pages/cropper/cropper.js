const app = getApp()
const WeCropper = require('../components/we-cropper/we-cropper.min')
const { uploadFile,delFile } = require('../../utils/cos')
const { isLocal } = require('../../utils/config')
const device = wx.getSystemInfoSync()
const width = device.windowWidth
const height = parseInt(device.windowHeight * 0.9) //减去底部的操作按钮高度

Page({

  /**
   * 页面的初始数据
   */
  data: {
    customBar: app.globalData.customBar,
    type:"course",
    cropperOpt: {
      id: 'cropper',
      width,
      height,
      scale: 2.5,
      zoom: 8,
      boundStyle:{
        color: '#fbbd08',
        lineHeight: 2
      },
      cut: {}
    }
  },

  touchStart(e) {
    this.cropper.touchStart(e)
  },
  touchMove(e) {
    this.cropper.touchMove(e)
  },
  touchEnd(e) {
    this.cropper.touchEnd(e)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { src, type, width: cutWidth, height: cutHeight } = options
    this.setData({
      type:type
    })
    if(!src){
      app.msg("未选择图片")
      setTimeout(()=>{
        wx.navigateBack({
          delta: 0,
        })
      },1000)
      return
    }
    let opt = this.getOption(src,cutWidth,cutHeight)
    this.cropper = new WeCropper(opt)
      .on('ready', (ctx) => {})
      .on('beforeImageLoad', (ctx) => {
          wx.showToast({
              title: '上传中',
              icon: 'loading',
              duration: 20000
          })
      })
      .on('imageLoad', (ctx) => {
          wx.hideToast()
      })
  },

  // 获取裁剪属性
  getOption:function(src,cutWidth,cutHeight){
    const cropperOpt = this.data.cropperOpt
    cutHeight *= 0.8
    cutWidth *= 0.8
    let cut = {
      x: parseInt((width - cutWidth) / 2),
      y: parseInt((height - cutHeight) / 2),
      width: cutWidth,
      height: cutHeight
    }
    cropperOpt.src = src
    cropperOpt.cut = cut
    return cropperOpt
  },

  // 取消
  cancel:function(){
    wx.navigateBack()
  },

  // 重新选择
  uploadTap() {
    const self = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original'],
      sourceType: ['album', 'camera'],
      success(res) {
        const src = res.tempFilePaths[0]
        self.cropper.pushOrign(src)
      }
    })
  },

  // 裁剪
  crop:function(){
    let _this = this
    _this.cropper.getCropperImage()
      .then((src) => {
        _this.upload(src)
      })
      .catch((err) => {
        console.log(err)
        console.log('获取图片地址失败，请稍后重试')
      })
  },

  // 上传图片
  upload:function(src,){
    //获取文件名
    let fileName = ''
    if (!isLocal){
      fileName = src.match(/(wxfile:\/\/)(.+)/)
      fileName = fileName[2]
    }else{
      fileName = src.match(/(http:\/\/tmp\/)(.+)/)
    }
    fileName = fileName[2]
    if(fileName == ''){
      app.msg("获取图片失败，请重试")
      return
    }
    const dir_name = this.data.type == 'avatar' ? 'user_imgs' : 'course_bg' 
    let uploadResult = uploadFile(src, fileName, dir_name);
    if(uploadResult === false){
      app.msg("上传失败，请重试")
      return
    }
    app.msg("上传成功")
    if(this.data.type == 'course'){
      //删除原来的文件
      var delImg = wx.getStorageSync('upload_course_bg');
      var returnDel = delFile(dir_name + '/' + delImg);
      if (returnDel) {
        console.log('删除成功');
      }
    } 
    setTimeout(()=>{
      var pages = getCurrentPages();
      var prevPage = pages[pages.length - 2];
      prevPage.setData({
        uploadFile: fileName
      })
      wx.navigateBack({})
    },1000)
  }
})