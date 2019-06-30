var util = require('../../utils/util.js');
var md5 = require('../../utils/md5.js');
var delPicture = require('../../utils/delPicture.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    messages:[],
    page:1,
    num:10, 
    isHideNull:true,
    isHideLoadMore: false,
    headImg_pre:'http://yunxiaozhi-1251388077.file.myqcloud.com/user_imgs/',
    pic_pre:'http://yunxiaozhi-1251388077.file.myqcloud.com/yunquan/',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var user_id = wx.getStorageSync('user_id');
    if (!user_id) {
      wx.showToast({
        title: '请登录',
        icon: 'loading'
      });
      wx.redirectTo({
        url: '../bind/bind',
      });
    } else {
      that.getOpenId();
      that.onPullDownRefresh();
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (options) {
    var that = this;
    var isFresh = that.data.isFresh;
    if (isFresh) {
      that.onPullDownRefresh();
      that.setData({
        isFresh:false,
      })
    }
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    var that = this;
    that.setData({
      messages:[],
      page:1,
      isHideNull:true
    })
    that.getMessages(that.data.page, that.data.num);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    if(that.data.isHideNull==true){
      that.setData({
        isHideLoadMore: true,
        page: that.data.page + 1,
      });
      var pre_messages_length = that.data.messages.length;
      that.getMessages(that.data.page, that.data.num);
      if (that.data.messages.length > pre_messages_length){
        that.setData({
          isHideLoadMore: true,
        });
      }
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  //发表新动态
  newMessage:function(){
    wx.navigateTo({
      url: 'new/new',
    })
  },
  //获取动态
  getMessages:function(page,num){
    var that = this;
    var user_id = wx.getStorageSync('user_id');
    var date = util.formatTime2(new Date());
    var str = user_id + '&^!*@' + date;
    var AppId = md5.hexMD5(str);
    wx.request({
      url: 'https://www.tianyae.com/yxz/yunquan/getMessages.php',
      data: {
        user_id: user_id,
        AppId: AppId,
        page: page,
        num: num
      },
      success: function (res) {
        if (res.data.code == 1002) {
          var data = res.data.data;
          for (var i = 0; i < data.length; i++) {
            //格式化时间
            data[i].time = that.formatTime(data[i].time);
            //如果头像为空，设为默认头像
            var user_img = "defalut.png";
            if (data[i].user_info.img != null) {
              user_img = data[i].user_info.img;
            }
            var message = [{
              content: data[i].content,
              time: data[i].time,
              comment_num: data[i].comment_num,
              like_num: data[i].like_num,
              mid: data[i].mid,
              isLike: data[i].isLike,
              nickname: data[i].user_info.nickname,
              sex: data[i].user_info.sex,
              department: data[i].user_info.department,
              img: user_img,
              user_id: data[i].user_info.user_id,
              pictures:data[i].pictures,
              pictures_length: data[i].pictures.length,
            }];
            that.setData({ messages: that.data.messages.concat(message) });
          }
          that.setData({
            isHideLoadMore: true,
          });
          wx.hideNavigationBarLoading() //完成停止加载
          wx.stopPullDownRefresh() //停止下拉刷新
        } else if (res.data.code == 1003) {
          wx.showToast({
            title: '服务器异常',
            icon: 'loading'
          });
        } else if (res.data.code == 1004) {
          that.setData({
            isHideNull: false
          })
        } else {
          wx.showToast({
            title: '非法操作',
            icon: 'loading'
          });
        }
      }
    })

  },
  //格式化时间
  formatTime:function(time){
    var today = this.getDateStr(0);
    var yearstoday = this.getDateStr(-1);
    var temp = time.split(' ');
    var time = temp[1].split(':')[0] + ':' + temp[1].split(':')[1];
    if(temp[0]==today){
      return time;
    }else if(temp[0]==yearstoday){
      return '昨天 '+ time;
    }else{
      return temp[0].split('-')[1] + '-' + temp[0].split('-')[2] + ' '+time;
    }
  },
  //获取前后n天的日期
  getDateStr:function(n){
    var dd = new Date();
    dd.setDate(dd.getDate()+n);
    return util.formatTime2(dd);
  },
  //点赞
  setLike:function(id,isLike){
    var that = this;
    if(isLike == 0){
      var param1 = {};
      var param2 = {};
      var string1 = "messages[" + id + "].isLike";
      var string2 = "messages[" + id + "].like_num";
      if (isLike == 0) {
        param1[string1] = 1;
        param2[string2] = that.data.messages[id].like_num + 1;
        that.setData(param1);
        that.setData(param2);
      }
      var mid = that.data.messages[id].mid;
      var user_id = wx.getStorageSync('user_id');
      var time = util.formatTime3(new Date());
      var page = 'pages/community/item/item?method=indirect&mid='+mid;
      var content = that.data.messages[id]['content'];
      if(content == ""){
        content = "[图片]";
      }
      var data_info = content + "," + wx.getStorageSync('user_nickName');
      var date = util.formatTime2(new Date());
      var str = user_id + '&^!*@' + date;
      var AppId = md5.hexMD5(str);
      wx.request({
        url: 'https://www.tianyae.com/yxz/yunquan/setLike.php',
        data: {
          AppId: AppId,
          mid: mid,
          user_id: user_id,
          time: time,
          isLike: isLike,
          page: page,
          content: content,
          data_info: data_info
        },
        success: function (res) {
          switch (res.data.code) {
            case 1001: wx.showToast({ title: '非法操作', icon: 'loading' }); break;
            case 1002: wx.showToast({ title: '参数有误', icon: 'loading' }); break;
            case 1003: wx.showToast({ title: '服务器异常', icon: 'loading' }); break;
            case 1004:
              wx.hideLoading();
              break;
          }
        },
        fail: function (res) {
          console.log('error:' + res);
        }
      })
    }else{
      wx.showToast({
        title:'你点过赞啦',
        icon:'loading'
      })
    }
  },
  //收集formId
  collectFormid:function(e){
    var that = this;
    var formId = e.detail.formId;
    console.log(e);
    var time = util.formatTime3(new Date());
    var user_id = wx.getStorageSync('user_id');
    wx.request({
      url: 'https://www.tianyae.com/yxz/wx_api/collectFormid.php',
      data:{
        user_id : user_id,
        formId : formId,
        time : time
      },
    });
    var method = e.detail.target.dataset.method;
    switch(method){
      case 'newMessage': that.newMessage();break;
      case 'setLike':
        var id = e.detail.value.id;
        var isLike = e.detail.value.isLike;
        that.setLike(id,isLike);
        break;
      case 'previewPicture':
        var message_index = e.detail.target.dataset.idnum.split("_")[0];
        var picture_index = e.detail.target.dataset.idnum.split("_")[1];
        that.previewPicture(message_index, picture_index);
        //设置参数判断是点击图片进入的详情页
        that.setData({
          clickPicture:true,
        })
        break;
      case 'more':
        var index = e.detail.target.dataset.index;
        that.actionSheetTap(index);
        break;
      case 'openItem':
        var id = e.detail.target.dataset.id;
        that.openItem(id);
        break;
    }
  },
  //图片按比例缩放
  imageLoad:function(e){
    var picture_length = e.target.dataset.index.split("_")[1];
    var m_index = e.target.dataset.index.split("_")[0];
    var winWidth = wx.getSystemInfoSync().windowWidth;
    var winHeight = wx.getSystemInfoSync().windowHeight;
    var r_width, r_height;
    if (picture_length == 1) {
      var maxWidth = winWidth * 0.6;
      var maxHeight = winHeight * 0.3;
      var width = e.detail.width;
      var height = e.detail.height;
      if (width > height) {
        r_width = maxWidth;
        r_height = height * (maxWidth / width);
      } else {
        r_width = width * (maxHeight / height);
        r_height = maxHeight;
      }
      var parmat1 = {};
      var string1 = "imageRatio[" + m_index + "]";
      parmat1[string1] = {
        width: r_width,
        height: r_height,
      }
      this.setData(parmat1);
    }
  },
  //预览图片
  previewPicture: function (message_index, picture_index){
    var picture_url = this.data.messages[message_index].pictures;
    var picture_urls = new Array();
    //添加链接前缀
    for(var i=0;i<picture_url.length;i++){
      picture_urls[i] = this.data.pic_pre+picture_url[i];
    }
    var current = picture_urls[picture_index];
    wx.previewImage({
      current: current,
      urls: picture_urls,
      fail:function(res){
        wx.showToast({
          title: '网络异常',
          icon:'loading'
        })
      }
    })
  },
  //详情页
  openItem:function(id){
    var that = this;
    //判断是否点击图片的事件。
    var clickPicture = that.data.clickPicture;
    var data = JSON.stringify(that.data.messages[id]);
    if(!clickPicture){
      wx.navigateTo({
        url: 'item/item?method=direct' + '&data=' + data + '&id=' + id,
      })
    }else{
      //恢复
      that.setData({
        clickPicture:false,
      }) 
    }
  },
  // //详情页2
  openItem2: function (e) {
    var that = this;
    //判断是否点击图片的事件。
    var clickPicture = that.data.clickPicture;
    var id = e.currentTarget.dataset.id;
    var data = JSON.stringify(that.data.messages[id]);
    if (!clickPicture) {
      wx.navigateTo({
        url: 'item/item?method=direct' + '&data=' + data + '&id=' + id,
      })
    } else {
      //恢复
      that.setData({
        clickPicture: false,
      })
    }
  },
  //点击更多
  actionSheetTap: function (id) {
    var that = this;
    //列表
    var list = ['复制','举报'];
    //判断是否是本人发表的message
    var user_id = that.data.messages[id].user_id;
    if (wx.getStorageSync('user_id') == '15230203124'){
      list = ['复制', '举报','删除','拉黑']
    } else if (user_id == wx.getStorageSync('user_id')){
      list = ['复制','举报','删除']
    }
    wx.showActionSheet({
      itemList: list,
      success: function (res) {
        if (res.tapIndex == 0){
          that.copyContent(id);
        }else if(res.tapIndex == 1){
          wx.showModal({
            title: '提示',
            content: '确定举报此记录？',
            success: function (res) {
              if (res.confirm) {
                that.report(id);
              }
            }
          })
        } else if (res.tapIndex == 2){
          that.deleteMessage(id);
        } else if(res.tapIndex == 3){
          wx.showModal({
            title: '警告',
            content: '是否要拉黑此人？',
            success:function(res){
              if(res.confirm){
                that.addBlacklist(id);
              }
            }
          })
        }
      },
    })
  },
  //复制内容
  copyContent: function (id) {
    this.setData({
      menu: 1,
      actionSheetHidden: !this.data.actionSheetHidden
    });
    var content = this.data.messages[id].content;
    wx.setClipboardData({
      data: content,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '复制成功',
              icon:'success',
            })
          }
        })
      },
      fail:function(res){
        wx.showToast({
          title: '没文本内容',
          icon: 'loading',
        })
      }
    })
  },
  //删除记录
  deleteMessage: function (id) {
    var that = this;
    wx.showModal({
      title: '警告',
      content: '确定要删除这条记录吗？',
      success: function (res) {
        if (res.confirm) {
          var mid = that.data.messages[id].mid;
          //删除照片
          if (that.data.messages[id].pictures_length > 0) {
            //图片删除成功的图片文件名
            var dir_name = 'yunquan';
            for (var i = 0; i < that.data.messages[id].pictures.length; i++) {
              var fileName = that.data.messages[id].pictures[i];
              delPicture(fileName, dir_name);
            }
          }
          var user_id = wx.getStorageSync('user_id');
          var date = util.formatTime2(new Date());
          var str = user_id + '&^!*@' + date;
          var AppId = md5.hexMD5(str);
          wx.request({
            url: 'https://www.tianyae.com/yxz/yunquan/delMessage.php',
            data: {
              AppId: AppId,
              user_id: user_id,
              mid: mid,
            },
            success: function (res) {
              wx.showToast({
                title: '删除成功',
                icon:'success',
              });
              that.onPullDownRefresh();
            },
            fail: function (res) {
              wx.showToast({
                title: '网络异常',
                icon: 'loading'
              })
            }
          });
        }
      }
    })
  },
  //举报内容
  report:function(id){
    var that = this;
    var mid = that.data.messages[id].mid;
    var user_id = wx.getStorageSync('user_id');
    var time = util.formatTime3(new Date());
    var page = 'pages/community/item/item?method=indirect&mid=' + mid;
    var content = that.data.messages[id]['content'];
    if (content == "") {
      content = "[图片]";
    }
    var data_info = content + "," + user_id+"(举报人)";
    wx.request({
      url: 'https://www.tianyae.com/yxz/yunquan/newReport.php',
      data: {
        mid: mid,
        user_id: user_id,
        time: time,
        page: page,
        data_info: data_info
      },
      success: function (res) {
        if(res.data.code == 1003){
          wx.showToast({
            title: '举报成功',
            icon:'success',
          });
        }else {
          wx.showToast({
            title: '服务器异常',
            icon: 'loading',
          });
        }
      },
      fail: function (res) {
        console.log('error:' + res);
      }
    })
  },
  //拉黑用户
  addBlacklist:function(id){
    var that = this;
    var black_id = that.data.messages[id].user_id;
    var user_id = wx.getStorageSync('user_id');
    var date = util.formatTime2(new Date());
    var str = user_id + '&^!*@' + date;
    var AppId = md5.hexMD5(str);
    wx.request({
      url: 'https://www.tianyae.com/yxz/yunquan/addBlackList.php',
      data:{
        AppId:AppId,
        user_id:user_id,
        black_id:black_id,
      },
      success:function(res){
        if(res.data.code == 1002){
          wx.showToast({
            title: '拉黑成功',
            icon:'success'
          })
        }else if(res.data.code == 1001){
          wx.showToast({
            title: '非法操作',
            icon: 'loading'
          })
        }else{
          wx.showToast({
            title: '服务器异常',
            icon: 'loading'
          })
        }
      }
    })
  },
  //微信授权
  getOpenId:function(){
    var that = this;
    var user_id = wx.getStorageSync('user_id');
    wx.request({
      url: 'https://www.tianyae.com/yxz/wx_api/isOpenId.php',
      data:{
        user_id:user_id,
      },
      success:function(res){
        if(res.data.code == 1002){
          wx.login({
            success: function (res) {
              if (res.code) {
                wx.request({
                  url: 'https://www.tianyae.com/yxz/wx_api/jscode2session.php',
                  data: {
                    user_id: user_id,
                    js_code: res.code
                  },
                  success: function (res) {
                    if (res.data.code == 1001) {
                      console.log('授权成功');
                    } else {
                      console.log('授权失败');
                    }
                  }
                })
              }
            }
          });
        }
      }
    })
  },
  //个人主页
  toUserHome:function(e){
    var that =this;
    var user_id = e.currentTarget.dataset.home.split(',')[0];
    var nickname = e.currentTarget.dataset.home.split(',')[1];
    wx.navigateTo({
      url: 'home/home?user_id='+user_id+'&nickname='+nickname,
    })
  }
})