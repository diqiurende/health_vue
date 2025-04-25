<script lang="ts" setup>
import { reactive, ref, Ref, getCurrentInstance, onMounted } from 'vue';
import { ElMessageBox } from 'element-plus';
import router from '../../router/index';
const { proxy } = getCurrentInstance();

const dataForm = reactive({
  number: 1
});
const dialog = reactive({
  visible: false,
  result: false,
  qrCode: null,
  //订单流水号，查询付款结果时候使用
  outTradeNo: null
});

const data = reactive({
  code: null,
  title: null,
  description: null,
  image: null,
  initialPrice: null,
  currentPrice: null,
  ruleName: null,
  type: null,
  tag: [],
  checkup_1: [],
  checkup_2: [],
  checkup_3: [],
  checkup_4: [],
  count_1: null,
  count_2: null,
  count_3: null,
  count_4: null,
  checkupCount: null
});

//接收路由传递的商品主键值，该页面要根据商品主键值加载商品信息
let id = router.currentRoute.value.params.id;

//滚动到页面的顶部，否则路由跳转页面之后，页面垂直位置还是上一个页面的地方
window.scrollTo(0, 0);

proxy.$http('/front/goods/searchById', 'POST', { id: id }, true, function (resp) {
  let result = resp.result;
  if (result == null) {
    proxy.$message({
      message: '无法加载该商品',
      type: 'warning',
      duration: 1200,
      onClose: () => {
        router.push({ name: "FrontGoodsList" })
      }
    });
  }
  else {
    data.code = result.code;
    data.title = result.title;
    data.description = result.description;
    data.image = `${proxy.$minioUrl}/${result.image}`;
    data.initialPrice = result.initialPrice;
    data.currentPrice = result.currentPrice;
    data.ruleName = result.ruleName;
    data.type = result.type;
    data.tag = result.tag;
    data.checkup_1 = result.checkup_1;
    data.checkup_2 = result.checkup_2;
    data.checkup_3 = result.checkup_3;
    data.checkup_4 = result.checkup_4;
    data.count_1 = result.count_1;
    data.count_2 = result.count_2;
    data.count_3 = result.count_3;
    data.count_4 = result.count_4;
    data.checkupCount = result.count_1 + result.count_2 + result.count_3 + result.count_4;
  }
});


function createPayment() {
  dialog.outTradeNo = null;
  dialog.qrCode = null;
  dialog.result = false;
  //检查用户是否登录
  proxy.$http('/front/customer/checkLogin', 'GET', null, true, function (resp) {
    if (!resp.result) {
      proxy.$message({
        message: '请先登录系统',
        type: 'warning',
        duration: 1200
      });
    }
    else {
      proxy.$confirm('您确定购买该体检套餐？', '提示信息', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        let json = { goodsId: id, number: dataForm.number };
        proxy.$http('/front/order/createPayment', 'POST', json, true, function (resp) {
          if (!resp.illegal) {
            dialog.visible = true;
            let result = resp.result;
            dialog.outTradeNo = result.outTradeNo;
            dialog.qrCode = result.qrCodeBase64;
            // 利用WebSocket接受后端推送的付款结果

            let token = localStorage.getItem('token');

            proxy.$options.sockets.onmessage = function (resp) {
              let data = resp.data;
              let json = JSON.parse(data);
              if (json.result) {
                dialog.result = true;
                //删除消息监听
                delete proxy.$options.sockets.onmessage;
              }
            };
            //发送消息，后端缓存Session会话，
            proxy.$socket.sendObj(
                { opt: 'ping', identity: 'customer', token: token }
            );

          } else {
            ElMessageBox.alert(
                '今日您的未支付订单或退款订单已达到上线，导致今日不能再下单。请明日再来购买体检套餐！',
                '提示信息',
                {}
            );
          }
        });
      });
    }
  });
}

function closeHandle() {
  dialog.visible = false;
}

function successHandle() {
  let json = { outTradeNo: dialog.outTradeNo };
  proxy.$http('/front/order/searchPaymentResult', 'POST', json, true, function (resp) {
    if (!resp.result) {
      proxy.$message({
        message: '付款不成功',
        type: 'error',
        duration: 1200
      });
    } else {
      dialog.result = true;
      delete proxy.$options.sockets.onmessage;
    }
  });
}

const advantages = [
  { title: '提前确认到院可检', desc: '避免预约号紧缺，确保体检顺利进行' },
  { title: '省时方便无需排队', desc: '无需缴费排队，凭身份证直接打印体检单' },
  { title: '电话通知灵活改期', desc: '支持改期，灵活安排行程' },
  { title: '享受优惠节省费用', desc: '线上专属优惠，享受7-9折价格' },
];

const steps = [
  { title: '选购体检套餐', desc: '确认订单，完成线上支付' },
  { title: '完成预约体检', desc: '填写信息，选择体检时间' },
  { title: '到院体检', desc: '携带身份证领取体检单' },
  { title: '获取体检报告', desc: '现场领取或自费邮寄' },
];

const props = defineProps({
  data: Object,
});
</script>

<template>
 <div class="total">


   <div class="goods-detail">
     <el-row :gutter="30">
       <!-- 左侧商品封面 -->
       <el-col :span="8">
         <el-card shadow="hover" class="cover-card">
           <img :src="data.image" class="cover-img" />
         </el-card>
       </el-col>

       <!-- 右侧商品属性 -->
       <el-col :span="16">
         <el-card shadow="hover" class="property-card">
           <h2 class="title">{{ data.title }} {{ data.code }}</h2>
           <p class="desc">{{ data.description }}</p>

           <div class="price-row">
             <span class="price-label">官网价格：</span>
             <span class="current-price">￥{{ data.currentPrice }}</span>
             <span class="initial-price">￥{{ data.initialPrice }}</span>
           </div>

           <div class="price-row">
             <span class="price-label">享有折扣：</span>
             <img src="../../assets/front/goods/discount.png" class="discount-img" />
             <el-tag size="small" type="success">{{ data.ruleName || '无' }}</el-tag>
           </div>

           <div class="info-row"><span class="label">商品类型：</span>虚拟卡（电子卡密）</div>
           <div class="info-row"><span class="label">适用人群：</span>{{ data.type }}</div>

           <div class="info-row">
             <span class="label">购买数量：</span>
             <el-input-number v-model="dataForm.number" size="small" :min="1" :max="10" @change="handleChange" />
           </div>

           <div class="service-row">
             <span class="label">服务承诺：</span>
             <img src="../../assets/front/goods/property-icon-1.png" class="property-icon" /><span class="service-tag">专业品质</span>
             <img src="../../assets/front/goods/property-icon-2.png" class="property-icon" /><span class="service-tag">官方直营</span>
             <img src="../../assets/front/goods/property-icon-3.png" class="property-icon" /><span class="service-tag">随时改</span>
             <img src="../../assets/front/goods/property-icon-4.png" class="property-icon" /><span class="service-tag">随时退</span>
           </div>

           <div class="operate-btns">
             <el-button icon="ChatLineRound" @click="consultHandle">咨询客服</el-button>
             <el-button type="primary" @click="createPayment" icon="Wallet">立即付款</el-button>
           </div>
         </el-card>
       </el-col>
     </el-row>
   </div>

   <el-divider />

   <div class="goods-content">
     <!-- 商品摘要信息 -->
     <el-card shadow="always" class="summary-card">
       <template #header>
         <div class="card-header">📦 商品摘要信息</div>
       </template>
       <el-row :gutter="20">
         <el-col :span="8">
           <p><strong>体检名称：</strong>{{ data.title }} {{ data.code }}</p>
         </el-col>
         <el-col :span="8">
           <p><strong>体检类型：</strong>{{ data.type }}</p>
         </el-col>
         <el-col :span="8">
           <p><strong>适用人群：</strong>
             <el-tag
                 v-for="(tag, index) in data.tag"
                 :key="index"
                 size="small"
                 type="success"
                 style="margin-right: 5px"
             >{{ tag }}</el-tag>
           </p>
         </el-col>
         <el-col :span="8">
           <p><strong>体检机构：</strong>昆明市华夏健康卫士体检中心</p>
         </el-col>
         <el-col :span="8">
           <p><strong>体检项目：</strong>{{ data.checkupCount }}个</p>
         </el-col>
         <el-col :span="8">
           <p><strong>有效期：</strong>一年</p>
         </el-col>
       </el-row>
     </el-card>

     <!-- 体检项目明细 -->
     <el-card shadow="always" class="detail-card" style="margin-top: 20px;">
       <template #header>
         <div class="card-header">📝 体检项目明细</div>
       </template>

       <el-collapse accordion>
         <el-collapse-item
             v-if="data.count_1 > 0"
             title="科室检查"
             :name="'checkup_1'"
         >
           <el-row :gutter="20">
             <el-col :span="12" v-for="(item, i) in data.checkup_1" :key="i">
               <el-card class="item-card" shadow="hover">
                 <h4>{{ item.title }}</h4>
                 <p>{{ item.content }}</p>
               </el-card>
             </el-col>
           </el-row>
         </el-collapse-item>

         <el-collapse-item
             v-if="data.count_2 > 0"
             title="实验室检查"
             :name="'checkup_2'"
         >
           <el-row :gutter="20">
             <el-col :span="12" v-for="(item, i) in data.checkup_2" :key="i">
               <el-card class="item-card" shadow="hover">
                 <h4>{{ item.title }}</h4>
                 <p>{{ item.content }}</p>
               </el-card>
             </el-col>
           </el-row>
         </el-collapse-item>

         <el-collapse-item
             v-if="data.count_3 > 0"
             title="医技检查"
             :name="'checkup_3'"
         >
           <el-row :gutter="20">
             <el-col :span="12" v-for="(item, i) in data.checkup_3" :key="i">
               <el-card class="item-card" shadow="hover">
                 <h4>{{ item.title }}</h4>
                 <p>{{ item.content }}</p>
               </el-card>
             </el-col>
           </el-row>
         </el-collapse-item>

         <el-collapse-item
             v-if="data.count_4 > 0"
             title="其他检查"
             :name="'checkup_4'"
         >
           <el-row :gutter="20">
             <el-col :span="12" v-for="(item, i) in data.checkup_4" :key="i">
               <el-card class="item-card" shadow="hover">
                 <h4>{{ item.title }}</h4>
                 <p>{{ item.content }}</p>
               </el-card>
             </el-col>
           </el-row>
         </el-collapse-item>
       </el-collapse>
     </el-card>
   </div>

   <div class="checkup-appointment">
     <!-- 预约须知 -->
     <el-card class="box-card" shadow="always">
       <template #header>
         <div class="card-header">📌 预约须知</div>
       </template>
       <el-descriptions :column="1" border>
         <el-descriptions-item label="预约时间">该医院支持提前预约，若当天预约请在08:30前下单</el-descriptions-item>
         <el-descriptions-item label="营业时间">周一至周五 08:00-10:30</el-descriptions-item>
         <el-descriptions-item label="体检地点">昆明市华夏健康体检中心</el-descriptions-item>
         <el-descriptions-item label="体检凭证">体检当天出示预约短信和身份证即可</el-descriptions-item>
         <el-descriptions-item label="优惠信息">含“立减”标识的套餐付款时将自动抵扣</el-descriptions-item>
         <el-descriptions-item label="订单退改">退款将扣除10%服务费，最高不超过100元</el-descriptions-item>
         <el-descriptions-item label="注意事项">放弃项目不予退款</el-descriptions-item>
         <el-descriptions-item label="发票申请">体检后在“我的订单”申请，客服电话：4008007580</el-descriptions-item>
       </el-descriptions>
     </el-card>

     <!-- 线上预约优势 -->
     <el-card class="box-card" shadow="always" style="margin-top: 20px;">
       <template #header>
         <div class="card-header">🚀 线上预约优势</div>
       </template>
       <el-row :gutter="20">
         <el-col :span="12" v-for="(item, index) in advantages" :key="index">
           <el-card class="advantage-card" shadow="hover">
             <h4>{{ item.title }}</h4>
             <p>{{ item.desc }}</p>
           </el-card>
         </el-col>
       </el-row>
       <div class="timeline">
         <ul class="timeline-ul">
           <li v-for="(step, i) in steps" :key="i">
             <div class="circle">{{ i + 1 }}</div>
             <div>
               <h4>{{ step.title }}</h4>
               <p>{{ step.desc }}</p>
             </div>
           </li>
         </ul>
       </div>
     </el-card>

     <!-- 体检注意事项 -->
     <el-card class="box-card" shadow="always" style="margin-top: 20px;">
       <template #header>
         <div class="card-header">⚠️ 体检注意事项</div>
       </template>
       <el-collapse accordion>
         <el-collapse-item title="体检前">
           <ul>
             <li>体检前一天清淡饮食、勿饮酒，体检当天空腹</li>
             <li>晚上8点后不再进食，避免剧烈运动</li>
             <li>例假期间不做妇科检查</li>
           </ul>
         </el-collapse-item>
         <el-collapse-item title="体检中">
           <ul>
             <li>空腹检查项目包括抽血、腹部B超等</li>
             <li>妇科、膀胱B超需注意排尿情况</li>
             <li>怀孕需告知医护人员，避免放射项目</li>
           </ul>
         </el-collapse-item>
         <el-collapse-item title="体检后">
           <ul>
             <li>体检后务必提交体检单</li>
             <li>认真听取医生建议，保存好报告</li>
           </ul>
         </el-collapse-item>
       </el-collapse>
     </el-card>
   </div>
 </div>


  <el-dialog title="扫码购买套餐" :close-on-click-modal="false"
             v-model="dialog.visible" width="305px" center>
    <img :src="dialog.qrCode" class="qrcode" v-if="!dialog.result" />
    <div v-if="dialog.result" class="pay-success">
      <el-result icon="success" title="付款成功" subTitle="感谢您的选购！"></el-result>
    </div>
    <div class="dialog-footer-style">
      <el-button type="danger" size="medium" v-if="!dialog.result"
                 @click="closeHandle">取消支付</el-button>
      <el-button type="primary" size="medium" v-if="!dialog.result"
                 @click="successHandle">我已支付</el-button>
      <el-button type="primary" size="medium" v-if="dialog.result"
                 @click="closeHandle">关闭窗口</el-button>
    </div>
  </el-dialog>
</template>

<style lang="less" scoped>
@import url('goods.less');

.goods-detail {
  margin-top: 24px;
}
.cover-card {
  padding: 0;
}
.cover-img {
  width: 100%;
  border-radius: 10px;
  object-fit: cover;
}
.property-card {
  padding: 20px;
}
.title {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 10px;
}
.desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
  line-height: 1.6;
}
.price-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
}
.price-label {
  width: 90px;
  color: #888;
}
.current-price {
  color: #e91e63;
  font-size: 18px;
  font-weight: bold;
  margin-right: 10px;
}
.initial-price {
  text-decoration: line-through;
  color: #aaa;
}
.discount-img {
  width: 20px;
  height: 20px;
  margin: 0 6px;
  vertical-align: middle;
}
.info-row {
  margin-bottom: 8px;
  font-size: 14px;
}
.label {
  color: #888;
  margin-right: 6px;
}
.service-row {
  margin-top: 16px;
  font-size: 14px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.property-icon {
  width: 18px;
  margin-right: 4px;
  margin-left: 10px;
}
.service-tag {
  margin-right: 10px;
  color: #409eff;
}
.operate-btns {
  margin-top: 24px;
  display: flex;
  gap: 16px;
}

.box-card {
  margin-bottom: 24px;
}
.card-header {
  font-size: 20px;
  font-weight: bold;
}
.advantage-card {
  padding: 16px;
  height: 100%;
}
.timeline-ul {
  list-style: none;
  padding-left: 0;
  margin-top: 20px;
}
.timeline-ul li {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}
.circle {
  width: 28px;
  height: 28px;
  background-color: #409EFF;
  color: #fff;
  text-align: center;
  line-height: 28px;
  border-radius: 50%;
  font-weight: bold;
  margin-right: 12px;
}

.card-header {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}
.summary-card p {
  font-size: 14px;
  color: #555;
}
.item-card {
  margin-bottom: 16px;
}
.item-card h4 {
  margin: 0;
  font-size: 15px;
  color: #409EFF;
}
.item-card p {
  font-size: 14px;
  color: #666;
}
</style>