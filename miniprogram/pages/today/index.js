const { call } = require('../../utils/api')
const { today, friendly } = require('../../utils/date')
Page({
  data:{date:today(),friendlyDate:friendly(today()),family:{},voteDishes:[],confirmedDishes:[],recommendations:[],loading:true},
  onShow(){this.load()}, onPullDownRefresh(){this.load()},
  async load(){try{const data=await call('getToday',{date:this.data.date});if(!data.family)return wx.redirectTo({url:'/pages/welcome/index'});data.voteDishes=(data.voteDishes||[]).map(v=>({...v,voterSummary:(v.voters||[]).join('、')}));this.setData({...data,loading:false})}catch(_){this.setData({loading:false})}wx.stopPullDownRefresh()},
  changeDate(e){const date=e.detail.value;this.setData({date,friendlyDate:friendly(date)});this.load()},
  goSelect(){wx.navigateTo({url:`/pages/plan/index?date=${this.data.date}`})},
  goShopping(){wx.switchTab({url:'/pages/shopping/index'})}
})
