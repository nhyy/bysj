//index.js
//获取应用实例
const app = getApp()
// pages/myindex/myindex.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 用户信息
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    user: {},
    //单词信息（伪）
    words:[
      {
        name:"hello",
        IPA:"英 [hə'ləʊ] 美 [həˈloʊ]",
        means: "int.打招呼;哈喽，喂;你好，您好;表示问候\n\
        n.“喂”的招呼声或问候声\nvi.喊“喂”",
        uses: "Hello John, how are you?\n哈罗，约翰，你好吗？",
      },{
        name: "bye",
        IPA: "英 [baɪ] 美 [baɪ]",
        means: "int.再见，回头见\nn.次要的东西; （体育比赛中）轮空",
        uses: "Bye, see you tomorrow\n再见，明天见。",
      }, {
        name: "copy",
        IPA: "英 [ˈkɒpi] 美 [ˈkɑ:pi] ",
        means: "n.复制品; 一份; （报刊等的）稿件; 准备排印的书面材料\
        \nvt.& vi.复制; 抄写; 容许复制的\nvt.复制; 模仿; 仿造…的样式或图案; 抄写",
        uses: "I will send you a copy of the report.\n我会把这个报告的复印本寄给你。",
      }
    ],
    word:{},
    //是否选择词库
    haslexicon:false,
    //是否点击显示答案
    clicked:false,
    //剩余单词数
    lastnum:40,
    //中间的提示
    msg:"请把英文发音和中文意思说出口\n（点击屏幕显示答案）",
    msgtxt:"点击添加新的单词到你的词汇表"
  },
  //点击class=message块
  handleTap: function(event){
    console.log('你点击了message的块')
    if(!this.data.haslexicon){
      // 未选择词库点击->应跳转到词库
      wx.redirectTo({
        url: "../select/select"
      })
    } else if (!this.data.clicked){
      // 已选择词库点击->显示单词信息
      this.setData({
        clicked: true
      })
    }
  },
  changetoSetting: function(e){
    //跳转到设置页面
    console.log('你点击了用户设置')
    wx.redirectTo({
      url: "../setting/setting"
    })  
  },
  btnHandle: function(e){
    //认识/不认识按钮处理
    if (e.currentTarget.dataset.know){
      console.log('你点了认识')
    } else {
      console.log('你点了不认识')
      this.data.words.push(this.data.word);
    }
    var myshiftword = this.data.words.shift();
    console.log(this.data.words);
    if (typeof (myshiftword) != "undefined"){//如果没有背完所有单词
      this.setData({
        word: myshiftword,//把取出来的单词存入word
        clicked: false,//遮盖答案
        lastnum: this.data.words.length+1//修改剩余单词值
      })
    } else {//背完所有单词
      this.setData({
        word:{},//清空word
        clicked: false,//遮盖
        lastnum: 0,//清空剩余单词值
        msg: "恭喜你，已经背完今天的所有单词！"//提示
      })
    }
    // console.log(e)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('你打开了小程序首页')
    //打开小程序
    if (!this.data.haslexicon) {//如果未获取登录信息   
      this.getUserLoginInfo();//获取用户信息
      if(this.data.hasUserInfo)
        this.getUserOpenid();//获取openid并上传服务器
    } else {//如果获取登录信息
      this.getUserOpenid();//获取openid并上传服务器
      this.setData({//初始化信息
        lastnum: this.data.words.length+1
      })
    }
    if (options.selected > 0) {//如果有选择词库      
      console.log('获得的参数：' + options.selected)
      this.setData({
        word: this.data.words.shift(),//读取获取到的单词
        haslexicon: true
      })
    }

  },
  getUserInfo: function (e) {
    //按钮获取登录信息
    console.log("button get userInfo ok!")
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      user: e.detail.userInfo,
      hasUserInfo: true
    })
    this.getUserOpenid()
  },
  getUserOpenid: function() {
    var content = this;
    wx.login({
      //获取code
      success: function (res) {
        var code = res.code; //返回code
        // console.log(code);
        var appId = 'wxee05247bc3763d94';
        var secret = 'edc926f5bf46b7dec470ed3d787061c0';
        wx.request({
          url: 'https://api.weixin.qq.com/sns/jscode2session?appid=' + appId + '&secret=' + secret + '&js_code=' + code + '&grant_type=authorization_code',
          data: {},
          header: {
            'content-type': 'json'
          },
          success: function (res) {
            var openid = res.data.openid //返回openid
            app.globalData.userInfo.openid = openid
            console.log('get openid ok!openid为' + openid);
            // console.log(content.data.user)
            content.mindexInit();
          }
        })
      }
    })
  },
  getUserLoginInfo: function() {
    if (app.globalData.userInfo) {
      this.setData({
        user: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          user: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        withCredentials: true,
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            user: res.userInfo,
            hasUserInfo: true
          })
          console.log("use wx.getuserinfo ok!")
        }
      })
    }
    if(this.data.hasUserInfo){
      console.log("get login info ok!")
      console.log(this.data.user)
    }

  },
  mindexInit: function(){
    //获取的userinfo上传到服务器
    wx.request({
      url: 'http://localhost:8080/user', //仅为示例，并非真实的接口地址
      data: app.globalData.userInfo,
      // header:{
      //   "Content-Type": 'application/x-www-form-urlencoded;charset=utf-8'
      // },
      method: 'POST',
      success(res) {
        console.log(res.data)
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})