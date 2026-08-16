# 今天吃什么 · 微信小程序

一个给夫妻/伴侣共用的家庭菜单小程序。双方使用各自微信身份加入同一家庭，可共同维护菜谱、选择每日菜单，并自动得到采购清单。

## 已实现

- 创建家庭，生成 6 位邀请码；另一半凭邀请码加入（每个家庭最多 2 人）
- 展示菜品、主要食材和标签
- 新增、编辑、软删除自家菜品
- 按日期选择想吃的菜，双方实时共享
- 从当日菜单自动合并食材，并标记采购进度
- 新家庭自动附带 3 道示例菜

## 运行方式

1. 安装并打开微信开发者工具，选择“导入项目”，目录选本项目根目录。
2. 将 `project.config.json` 中的 `appid` 换成你的小程序 AppID。
3. 在开发者工具中开通“云开发”，创建一个云环境。代码使用当前云环境，无需写死环境 ID。
4. 在云开发数据库中创建以下集合：
   - `families`
   - `members`
   - `dishes`
   - `plans`
   - `shoppingStates`
5. 为上述集合设置为“仅云函数可读写”。所有业务访问都经过 `familyApi` 云函数，会校验微信身份和家庭归属。
6. 在开发者工具的 `cloudfunctions/familyApi` 目录上右键，选择“上传并部署：云端安装依赖”。
7. 点击编译。首次进入时创建家庭，把邀请码发给另一半即可。

详细数据设计和上线检查见 [docs/DEPLOY.md](docs/DEPLOY.md)。

## 项目结构

```text
miniprogram/             小程序端
  pages/welcome/         创建/加入家庭
  pages/menu/            菜谱列表
  pages/dish-edit/       新增与编辑菜品
  pages/plan/            每日选菜
  pages/shopping/        采购清单
  pages/profile/         家庭与邀请码
cloudfunctions/familyApi 统一业务云函数
docs/DEPLOY.md           部署与数据说明
```
