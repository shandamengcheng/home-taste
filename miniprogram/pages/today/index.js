const { call } = require('../../utils/api')
const { today, friendly } = require('../../utils/date')
Page({
  data:{date:today(),friendlyDate:friendly(today()),family:{},voteDishes:[],confirmedDishes:[],recommendations:[],isOwner:false,confirmMap:{},confirmIds:[],loading:true,confirming:false},
  onShow(){this.load()}, onPullDownRefresh(){this.load()},
  async load(){try{const data=await call('getToday',{date:this.data.date});if(!data.family)return wx.redirectTo({url:'/pages/welcome/index'});const ids=(data.plan&&data.plan.confirmedDishIds)||[];data.voteDishes=(data.voteDishes||[]).map(v=>({...v,voterSummary:(v.voters||[]).join('、')}));this.setData({...data,confirmIds:ids,confirmMap:ids.reduce((m,id)=>(m[id]=true,m),{}),loading:false})}catch(_){this.setData({loading:false})}wx.stopPullDownRefresh()},
  changeDate(e){const date=e.detail.value;this.setData({date,friendlyDate:friendly(date)});this.load()},
  goSelect(){wx.navigateTo({url:`/pages/plan/index?date=${this.data.date}`})},
  goShopping(){wx.switchTab({url:'/pages/shopping/index'})},
  toggleConfirm(e){if(!this.data.isOwner)return;const id=e.currentTarget.dataset.id;const ids=this.data.confirmMap[id]?this.data.confirmIds.filter(x=>x!==id):[...this.data.confirmIds,id];this.setData({confirmIds:ids,confirmMap:ids.reduce((m,x)=>(m[x]=true,m),{})})},
  async confirm(){if(!this.data.confirmIds.length)return wx.showToast({title:'请至少确认一道菜',icon:'none'});this.setData({confirming:true});try{await call('confirmPlan',{date:this.data.date,dishIds:this.data.confirmIds});wx.showToast({title:'最终菜单已确认'});this.load()}catch(_){}finally{this.setData({confirming:false})}}
})
