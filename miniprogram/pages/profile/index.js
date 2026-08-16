const { call } = require('../../utils/api')
Page({
  data:{family:{},members:[],openid:'',isOwner:false},onShow(){this.load()},
  async load(){try{const data=await call('getProfile');if(!data.family)return wx.redirectTo({url:'/pages/welcome/index'});this.setData(data)}catch(_){}},
  copyCode(){wx.setClipboardData({data:this.data.family.inviteCode})},
  refreshCode(){wx.showModal({title:'刷新邀请码？',content:'旧邀请码会立即失效。',success:async r=>{if(r.confirm){try{const data=await call('refreshInviteCode');this.setData({'family.inviteCode':data.inviteCode});wx.showToast({title:'已刷新'})}catch(_){}}}})},
  removeMember(e){const id=e.currentTarget.dataset.id;wx.showModal({title:'移除这位成员？',content:'移除后对方将无法查看家庭数据。',success:async r=>{if(r.confirm){try{await call('removeMember',{memberId:id});this.load()}catch(_){}}}})},
  transferOwner(e){const id=e.currentTarget.dataset.id;wx.showModal({title:'转让管理员？',content:'转让后对方可以管理成员和最终菜单。',success:async r=>{if(r.confirm){try{await call('transferOwner',{memberId:id});wx.showToast({title:'已转让'});this.load()}catch(_){}}}})},
  leave(){wx.showModal({title:'退出家庭？',content:'退出后将看不到共享菜谱和菜单。管理员需先转让权限。',success:async r=>{if(r.confirm){try{await call('leaveFamily');wx.redirectTo({url:'/pages/welcome/index'})}catch(_){}}}})}
})
