const { call } = require('../../utils/api')
Page({
  data:{family:{},members:[],openid:''}, onShow(){this.load()},
  async load(){try{const data=await call('getProfile');if(!data.family)return wx.redirectTo({url:'/pages/welcome/index'});this.setData(data)}catch(_){}},
  copyCode(){wx.setClipboardData({data:this.data.family.inviteCode})},
  leave(){wx.showModal({title:'退出家庭？',content:'退出后将看不到共享菜谱和菜单。家庭创建者需先让其他成员接管。',success:async r=>{if(r.confirm){try{await call('leaveFamily');wx.redirectTo({url:'/pages/welcome/index'})}catch(_){}}}})}
})
