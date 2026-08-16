const { call } = require('../../utils/api')
Page({
  data:{dish:null,ingredientSummary:'',loading:true},
  async onLoad(options){try{const dish=await call('getDish',{id:options.id});this.setData({dish,ingredientSummary:(dish.ingredients||[]).map(item=>`${item.name} ${item.amount||''}`).join(' · '),loading:false})}catch(_){this.setData({loading:false})}},
  async favorite(){try{await call('favoriteDish',{id:this.data.dish._id});wx.showToast({title:'已收藏到我家'})}catch(_){}},
  goSelect(){wx.navigateTo({url:'/pages/plan/index'})}
})
