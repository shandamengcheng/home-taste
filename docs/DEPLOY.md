# 部署与数据说明

## 数据模型

| 集合 | 用途 | 关键字段 |
| --- | --- | --- |
| families | 家庭 | name, inviteCode, ownerOpenid |
| members | 微信用户与家庭的关系 | _openid, familyId, joinedAt |
| dishes | 家庭菜谱 | familyId, name, ingredients, tags |
| plans | 成员选择与最终菜单 | familyId, date, selections, confirmedDishIds, dishSnapshots |
| shoppingStates | 某天的采购勾选状态 | familyId, date, checkedNames |

`plans.selections` 保存每位成员的独立选择，`confirmedDishIds` 和 `dishSnapshots` 保存管理员确认的最终菜单。快照保证以后修改或删除菜品时，历史菜单仍保留菜名和食材。

## 建议索引

- `families.inviteCode`：唯一索引
- `members._openid`：唯一索引
- `members.familyId`：普通索引
- `dishes.familyId + updatedAt`：组合索引
- `plans.familyId + date`：唯一组合索引
- `shoppingStates.familyId + date`：唯一组合索引

## 上线前检查

1. 把所有数据库集合权限设为“仅云函数可读写”。
2. 用两个不同微信号分别测试创建家庭、邀请码加入和菜单同步。
3. 检查云函数日志中是否存在数据库索引提示，并按上面的索引补齐。
4. 在微信公众平台填写小程序名称、图标、隐私保护指引与服务类目。
5. 真机预览，检查不同尺寸手机上的底部操作栏和安全区域。

## 第一版取舍

- 登录使用微信云开发自动识别的 OpenID，不额外收集手机号。
- 菜品第一版使用 emoji 与配色，免图片存储成本；后续可增加拍照上传云存储。
- 食材用量是自由文本。采购汇总会按食材名合并并标明每道菜的原始用量，不进行不可靠的单位换算。
