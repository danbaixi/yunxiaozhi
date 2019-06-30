var uploadFn = require('../../../utils/upload.js');
var util = require('../../../utils/util.js');
var md5 = require('../../../utils/md5.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pictures:[],
    yq_temp_data:"",
    data_length:140
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //恢复上次的编辑
    if (wx.getStorageSync('yq_temp_data') != "" || wx.getStorageSync('yq_temp_imgs').length>0){
      wx.showModal({
        title: '提示',
        content: '是否恢复上次编辑内容？',
        success: function (res) {
          if (res.confirm) {
            that.setData({
              yq_temp_data: wx.getStorageSync('yq_temp_data'),
              pictures: wx.getStorageSync('yq_temp_imgs'),
            })
          } else if (res.cancel) {
            wx.removeStorageSync('yq_temp_data');
            wx.removeStorageSync('yq_temp_imgs');
            that.setData({
              yq_temp_data: "",
            })
          }
        }
      })

    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    var that = this;
    wx.setStorageSync('yq_temp_data', that.data.yq_temp_data);
    wx.setStorageSync('yq_temp_imgs', that.data.pictures);
  },
  //上传图片
  addPicture:function(){
    var that = this;
    //设置上传目录
    var dir_name = 'yunquan';
    //获取当前已选择相片的数量
    var pic_num = that.data.pictures.length;
    wx.chooseImage({
      count: 9-pic_num,
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        var temp = that.data.pictures;
        for(var i =0;i<tempFilePaths.length;i++){
          temp.push(tempFilePaths[i]);
        }
        that.setData({
          pictures:temp,
        });
      }
    })
  },
  //删除图片
  delPicture:function(e){
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定删除此照片吗？',
      success: function (res) {
        if (res.confirm) {
          var num = e.target.dataset.num;
          var pictures = that.data.pictures;
          pictures.splice(num, 1);
          that.setData({
            pictures: pictures,
          })
        }
      }
    })
  },
  //获取输入框内容
  getData:function(e){
    var length = 140 - e.detail.value.length;
    this.setData({
      yq_temp_data:e.detail.value,
      data_length: length
    })
  },
  //发送
  submit:function(){
    var that = this;
    if(that.data.yq_temp_data==""&&that.data.pictures.length==0){
      wx.showModal({
        title: '提示',
        content: '老铁说句话或者发张图都可以呀~',
        showCancel:false
      })
    }else{
      wx.showLoading({
        title: '正在上传',
        icon: 'loading',
      })
      var tempFilePaths = that.data.pictures;
      var dir_name = 'yunquan';
      //保存照片名称
      var tempPicNames = "";
      //图片上传成功的图片文件名
      var pic_upload_success = new Array();
      for (var i = 0; i < tempFilePaths.length; i++) {
        // 获取文件路径
        var filePath = tempFilePaths[i];
        // 获取文件名
        var fileName = filePath.match(/(wxfile:\/\/)(.+)/);
        fileName = fileName[2];
        if (tempPicNames != "") {
          tempPicNames = tempPicNames + "," + fileName;
        } else {
          tempPicNames = tempPicNames + fileName;
        }
        // 文件上传cos
        var returnFile = uploadFn.upload(filePath, fileName, dir_name);
        pic_upload_success.push(returnFile);
      }
      if (pic_upload_success.length == tempFilePaths.length){
        var content = that.data.yq_temp_data;
        var user_id = wx.getStorageSync('user_id');
        var date = util.formatTime2(new Date());
        var time = util.formatTime3(new Date());
        var str = user_id + '&^!*@' + date;
        var AppId = md5.hexMD5(str);
        wx.request({
          url: 'https://www.tianyae.com/yxz/yunquan/newMessage.php',
          data: {
            AppId: AppId,
            user_id: user_id,
            content: content,
            picture: tempPicNames,
            time: time
          },
          success: function (res) {
            switch (res.data.code) {
              case 1001:
                wx.showToast({
                  title: '非法操作',
                  icon: 'loading'
                });
                break;
              case 1002:
                wx.showToast({
                  title: '空空如也',
                  icon: 'loading'
                });
                break;
              case 1003:
                wx.showToast({
                  title: '服务器异常',
                  icon: 'loading'
                });
                break;
              case 1004:
                wx.showToast({
                  title: '发送成功',
                  icon: 'success'
                })
                wx.removeStorageSync('yq_temp_data');
                wx.removeStorageSync('yq_temp_imgs');
                that.setData({
                  yq_temp_data: "",
                  pictures: []
                })
                //返回后刷新
                var pages = getCurrentPages();
                var currPage = pages[pages.length - 1];  //当前页面
                var prevPage = pages[pages.length - 2]; //上一个页面
                //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
                prevPage.setData({
                  isFresh: true
                })
                setTimeout(function () {
                  wx.navigateBack({})
                }, 1000) 
                break;
              case 1005:
                wx.showToast({
                  title: '你被禁言了',
                  icon:'loading'
                });
                break;
            }
          }
        })
      }else{
        wx.showToast({
          title: '网络异常',
          icon:'loading'
        })
      }
    }
  },

})