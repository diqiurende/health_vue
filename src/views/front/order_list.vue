<script lang="ts" setup>
import { reactive, ref, Ref, getCurrentInstance } from 'vue';
import { Search } from '@element-plus/icons-vue';
import router from '../../router/index';

import { dayjs } from 'element-plus';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);

const { proxy } = getCurrentInstance();

let empty = ref(false);

const dataForm = reactive({
  keyword: null,
  statusLabel: '全部',
  status: null
});

const dataRule = reactive({
  keyword: [
    { required: false, pattern: '^[a-zA-Z0-9\u4e00-\u9fa5]{1,30}$', message: '关键字内容不正确' }
  ]
});

const data = reactive({
  dataList: [],
  pageIndex: 1,
  pageSize: 10,
  totalCount: 0,
  loading: false
});


function loadDataList() {
  data.loading = true;

  //转义付款状态
  if (dataForm.statusLabel == '全部') {
    dataForm.status = null;
  } else if (dataForm.statusLabel == '未付款') {
    dataForm.status = 1;
  } else {
    dataForm.status = 3;
  }
  let json = {
    page: data.pageIndex,
    length: data.pageSize,
    keyword: dataForm.keyword,
    status: dataForm.status
  };
  proxy.$http('/front/order/searchByPage', 'POST', json, true, function (resp) {
    // console.log(resp.page);
    let statusEnum = {
      1: '未付款',
      2: '已关闭',
      3: '已付款',
      4: '已退款',
      5: '已预约',
      6: '已结束'
    };
    let page = resp.page;
    let list = page.list;
    for (let one of list) {
      //拼接minio服务器与图片地址
      one.goodsImage = `${proxy.$minioUrl}/${one.goodsImage}`;
      one.status = statusEnum[one.status];
    }
    data.dataList = list;
    data.totalCount = page.totalCount;
    data.loading = false;
    empty = (list.length == 0);
  });
}
loadDataList();

function searchHandle() {
  proxy.$refs['form'].validate(valid => {
    if (valid) {
      proxy.$refs['form'].clearValidate();
      if (dataForm.keyword == '') {
        dataForm.keyword = null;
      }
      if (dataForm.status == '') {
        dataForm.status = null;
      }

      loadDataList();
    } else {
      return false;
    }
  });
}

function sizeChangeHandle(val) {
  data.pageSize = val;
  data.pageIndex = 1;
  loadDataList();
}
function currentChangeHandle(val) {
  data.pageIndex = val;
  loadDataList();
}


function refundHandle(id) {
  proxy.$confirm(`您确定要执行退款？`, '提示信息', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    let json = { id: id };
    proxy.$http('/front/order/refund', 'POST', json, true, function (resp) {
      if (resp.result) {
        proxy.$message({
          message: '已经申请退款',
          type: 'success',
          duration: 1200
        });
      } else {
        proxy.$message({
          message: '退款申请失败',
          type: 'error',
          duration: 1200
        });
      }
    });
  });
}


const appointDialog = reactive({
  visible: false,
  number: null,
  appointCount: null,
  dataForm: {
    orderId: null,
    date: null,
    name: null,
    pid: null,
    tel: null,
    mailingAddress: null,
    company: null
  },
  dataRule: {
    date: [{ required: true, message: '日期不能为空' }],
    name: [
      { required: true, message: '姓名不能为空' },
      { pattern: '^[\u4e00-\u9fa5]{2,10}$', message: '姓名格式错误' }
    ],
    pid: [
      { required: true, message: '身份证号不能为空' },
      { pattern: '^[0-9Xx]{18}$', message: '身份证号格式错误' }
    ],
    tel: [
      { required: true, message: '电话号码不能为空' },
      { pattern: '^1[1-9]\\d{9}$', message: '电话号码格式错误' }
    ],
    mailingAddress: [
      { required: true, message: '邮寄地址不能为空' },
      { pattern: '^[0-9A-Za-z\u4e00-\u9fa5\\-_#]{10,100}$', message: '邮寄地址格式错误' }
    ],
    company: [
      { required: false, pattern: '^[0-9A-Za-z\u4e00-\u9fa5\\-_#]{2,100}$', message: '公司名称不正确' }
    ]
  }
});

function disabledDate(date) {
  //只能预约未来60天的体检
  let bool = dayjs(date).isBetween(dayjs(), dayjs().add(61, 'day'));
  return !bool;
}
function appointHandle(id, number, appointCount) {
  if (appointCount == 0) {
    proxy.$confirm("该订单预约体检后将无法退款，是否预约体检？", '提示信息', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      appointDialog.visible = true;
      appointDialog.dataForm.orderId = id;
      appointDialog.number = number;
      appointDialog.appointCount = ++appointCount;
      proxy.$nextTick(() => {
        proxy.$refs['dialogForm'].resetFields();
      });
    });
  }
}


function dataFormSubmit() {
  proxy.$refs['dialogForm'].validate(valid => {
    if (valid) {
      let json = {
        orderId: appointDialog.dataForm.orderId,
        date: appointDialog.dataForm.date,
        name: appointDialog.dataForm.name,
        pid: appointDialog.dataForm.pid,
        tel: appointDialog.dataForm.tel,
        mailingAddress: appointDialog.dataForm.mailingAddress,
        company: appointDialog.dataForm.company
      };
      proxy.$http('/front/appointment/insert', 'POST', json, true, function (resp) {
        let result = resp.result
        if (result == "预约成功") {
          proxy.$message({
            message: result,
            type: 'success',
            duration: 1200
          });
          appointDialog.visible = false;
          loadDataList();
        } else{
          proxy.$message({
            message: result,
            type: 'error',
            duration: 1200
          });
        }
      });
    }
  });
}
loadDataList
</script>

<template>
  <el-form :inline="true" :model="dataForm" :rules="dataRule" ref="form">
    <el-form-item prop="keyword">
      <el-input v-model="dataForm.keyword" placeholder="套餐标题 / 订单编号"
                size="medium" class="keyword" maxlength="30" clearable="clearable" />
    </el-form-item>
    <el-form-item>
      <el-button size="medium" type="primary" :icon="Search"
                 @click="searchHandle()">查询</el-button>
    </el-form-item>
    <el-form-item class="mold">
      <el-radio-group v-model="dataForm.statusLabel" size="medium"
                      @change="searchHandle()">
        <el-radio-button label="全部"></el-radio-button>
        <el-radio-button label="未付款"></el-radio-button>
        <el-radio-button label="已付款"></el-radio-button>
      </el-radio-group>
    </el-form-item>
  </el-form>
  <div class="order-list" v-show="!empty">
    <div class="order" v-for="one in data.dataList">
      <div class="header">
        <div class="datetime">{{ one.createTime }}</div>
        <div class="uuid">
          订单号：
          <span>{{ one.outTradeNo }}</span>
        </div>
        <div class="detail" @click="searchDetailHandle(one.snapshotId)">
          查看商品详情
        </div>
      </div>
      <div class="content">
        <img :src="one.goodsImage" class="image" />
        <div class="info">
          <h4>{{ one.goodsTitle }}</h4>
          <p>{{ one.goodsDescription }}</p>
        </div>
        <div class="price">
          <span class="label">套餐单价</span>
          <span class="value">￥{{ one.goodsPrice }}</span>
        </div>
        <div class="number">
          <span class="label">购买数量</span>
          <span class="value">×{{ one.number }}</span>
        </div>
        <div class="amount">
          <span class="label">合计</span>
          <span class="value">￥{{ one.amount }}</span>
        </div>
        <div class="status">
          <span class="label">状态</span>
          <span class="value">{{ one.status }}</span>
        </div>
        <div class="operate">
          <el-button v-if="one.status == '未付款'" type="primary"
                     :disabled="one.disabled"
                     @click="paymentHandle(one.outTradeNo)">
            付款
          </el-button>
          <el-button v-if="one.status == '未付款'" type="danger"
                     @click="closeOrderHandle(one.id)">
            取消订单
          </el-button>
          <el-button v-if="one.status == '已付款'" type="primary"
                     :disabled="one.appointCount == one.number"
                     @click="appointHandle(one.id, one.number, one.appointCount)">
            预约体检
          </el-button>
          <el-button v-if="one.status == '已结束'">获取发票</el-button>
          <el-button v-if="one.status == '已付款'" type="danger"
                     :disabled="one.appointCount > 0"
                     @click="refundHandle(one.id)">
            退款
          </el-button>
        </div>
      </div>
    </div>
    <el-pagination @size-change="sizeChangeHandle"
                   @current-change="currentChangeHandle" :current-page="data.pageIndex"
                   :page-sizes="[10, 20, 50]" :page-size="data.pageSize"
                   :total="data.totalCount"
                   layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
  </div>
  <div class="empty" v-show="empty">
    <el-empty :image-size="200" />
  </div>



  <el-dialog title="体检预约" :close-on-click-modal="false"
             v-model="appointDialog.visible" width="550px">
    <el-form :model="appointDialog.dataForm" ref="dialogForm"
             :rules="appointDialog.dataRule" label-width="80px">
      <fieldset class="appointment">
        <legend>
          <h4>我的预约</h4>
        </legend>
        <el-form-item label="预约日期" prop="date">
          <el-date-picker v-model="appointDialog.dataForm.date"
                          type="date" placeholder="选择日期" size="medium"
                          :editable="false" format="YYYY-MM-DD"
                          value-format="YYYY-MM-DD"
                          :disabled-date="disabledDate" />
          <span class="desc" style="margin-left: 10px">  提示:从明天起预约</span>
        </el-form-item>
        <el-form-item label="体检人" prop="name">
          <el-input v-model="appointDialog.dataForm.name"
                    size="medium" placeholder="输入姓名" maxlength="10"
                    clearable />
        </el-form-item>
        <el-form-item label="身份证号" prop="pid">
          <el-input v-model="appointDialog.dataForm.pid" size="medium"
                    placeholder="输入身份证号" maxlength="18" clearable />
        </el-form-item>
        <el-form-item label="电话号码" prop="tel">
          <el-input v-model="appointDialog.dataForm.tel" size="medium"
                    placeholder="输入电话号码" maxlength="11" clearable />
        </el-form-item>
        <el-form-item label="邮寄地址" prop="mailingAddress">
          <el-input v-model="appointDialog.dataForm.mailingAddress"
                    size="medium" placeholder="输入接收体检报告的邮寄地址"
                    maxlength="100" clearable />
        </el-form-item>
        <el-form-item label="公司名称" prop="company">
          <el-input v-model="appointDialog.dataForm.company"
                    size="medium" placeholder="输入公司名称" maxlength="100"
                    clearable />
        </el-form-item>
      </fieldset>
    </el-form>
    <template #footer>
        <span class="dialog-footer">
            <el-button size="medium"
                       @click="appointDialog.visible = false">取消</el-button>
            <el-button type="primary" size="medium"
                       @click="dataFormSubmit">确定</el-button>
        </span>
    </template>
  </el-dialog>
</template>

<style lang="less" scoped>
@import url(order_list.less);
</style>