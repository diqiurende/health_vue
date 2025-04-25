<script lang="ts" setup>
import { reactive, getCurrentInstance, ref, onMounted } from 'vue';
import {ElMessageBox, ElNotification} from 'element-plus';
import { Camera, RefreshRight, Document } from '@element-plus/icons-vue';
import router from '../../router/index';
import { dayjs } from 'element-plus';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);
const { proxy } = getCurrentInstance();

const dataForm = reactive({
  name: null,
  tel: null,
  date: dayjs().format('YYYY-MM-DD'),
  statusLabel: '全部',
  status: null
});

const dataRule = reactive({
  name: [{ pattern: '^[\u4e00-\u9fa5]{1,10}$', message: '姓名格式错误' }],
  tel: [{ pattern: '^1[1-9]\\d{9}$', message: '电话号码格式错误' }]
});

const data = reactive({
  dataList: [],
  pageIndex: 1,
  pageSize: 10,
  totalCount: 0,
  loading: false,
  selections: []
});

const checkinDialog = reactive({
  visible: false,
  btnText: '拍照',
  btnIcon: Camera,
  showEmpty: true,
  showVedio: false,
  showPhoto: false,
  streamTrack: null,
  dataForm: {
    name: null,
    sex: null,
    pid: null
  }
});


function checkinHandle() {

    checkinDialog.dataForm.name = null;
    checkinDialog.dataForm.sex = null;
    checkinDialog.dataForm.pid = null;
    checkinDialog.showEmpty = true;
    checkinDialog.showVedio = false;
    checkinDialog.showPhoto = false;
    checkinDialog.visible = true;

}

const guidanceDialog = reactive({
  visible: false,
  name: null,
  sex: null,
  age: null,
  pid: null,
  tel: null,
  date: null,
  company: null,
  qrCodeBase64: null,
  checkup: []
});


function loadDataList() {
  data.loading = true;
  if (dataForm.statusLabel == '全部') {
    dataForm.status = null;
  } else if (dataForm.statusLabel == '未签到') {
    dataForm.status = 1;
  } else if (dataForm.statusLabel == '已签到') {
    dataForm.status = 2;
  } else if (dataForm.statusLabel == '已结束') {
    dataForm.status = 3;
  }
  else if (dataForm.statusLabel == '已关闭') {
    dataForm.status = 4;
  }
  let json = {
    name: dataForm.name,
    tel: dataForm.tel,
    date: dataForm.date,
    status: dataForm.status,
    page: data.pageIndex,
    length: data.pageSize
  };

  proxy.$http('/mis/appointment/searchByPage', 'POST', json, true, function (resp : any) {
    let page = resp.page;
    let temp = {
      '1': '未签到',
      '2': '已签到',
      '3': '已结束',
      '4': '已关闭'
    };
    for (let one of page.list) {
      one.status = temp[one.status];
    }
    data.dataList = page.list;
    data.totalCount = page.totalCount;
    data.loading = false;
  });
}

loadDataList();


function searchHandle() {
  proxy.$refs['form'].validate(valid => {
    if (valid) {
      proxy.$refs['form'].clearValidate();
      if (dataForm.name == '') {
        dataForm.name = null;
      }
      if (dataForm.tel == '') {
        dataForm.tel = null;
      }
      if (data.pageIndex != 1) {
        data.pageIndex = 1;
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

//体检签到按钮
function checkin(id){

}


function dataFormSubmit() {
  let json = {
    pid: checkinDialog.dataForm.pid,
    name: checkinDialog.dataForm.name,
    photo_1: checkinDialog.dataForm.photo_1,
    photo_2: checkinDialog.dataForm.photo_2
  };
  proxy.$http('/mis/appointment/checkin', 'POST', json, true, function (resp) {
    if (resp.result) {
      ElNotification({
        title: '通知消息',
        message: "签到成功",
        type: 'success',
        duration: 1200
      });
      checkinDialog.showEmpty = true;
      checkinDialog.dataForm.name = null;
      checkinDialog.dataForm.sex = null;
      checkinDialog.dataForm.pid = null;
      loadDataList();
      checkinDialog.visible=false;
    } else {
      proxy.$message({
        message: "签到失败",
        type: 'error',
        duration: 1200
      });
    }
  });
}


function guidanceHandle(id) {
  guidanceDialog.visible = true
  proxy.$http("/mis/appointment/searchGuidanceInfo", "POST", { id: id }, true, function (resp) {
    let result = resp.result
    guidanceDialog.name = result.name
    guidanceDialog.sex = result.sex
    guidanceDialog.age = result.age
    guidanceDialog.pid = result.pid
    guidanceDialog.tel = result.tel
    guidanceDialog.date = result.date
    guidanceDialog.company = result.company == null ? '无' : result.company
    guidanceDialog.checkup = result.checkup
    guidanceDialog.qrCodeBase64 = result.qrCodeBase64
  })
}


function finishHandle() {
  ElMessageBox.prompt('请输入体检单编号，结束该次体检', '提示信息', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPlaceholder: "体检编号",
    type: "warning",
    inputPattern: /^[0-9a-zA-Z]{32}$/,
    inputErrorMessage: '体检编号不正确',
  }).then(({ value }) => {
    let json = {
      uuid: value,
      status: 3
    }
    proxy.$http("/mis/appointment/updateStatusByUuid", "POST", json, true, function (resp) {
      if (resp.result) {
        proxy.$message({
          message: '操作成功',
          type: 'success',
          duration: 1200,
          onClose: () => {
            loadDataList();
          }
        });
      } else {
        proxy.$message({
          message: '未能更新记录',
          type: 'error',
          duration: 1200
        });
      }
    })
  })
}
</script>

<template>
  <div v-if="proxy.isAuth(['ROOT', 'APPOINTMENT:SELECT'])">
    <el-form :inline="true" :model="dataForm" :rules="dataRule" ref="form">
      <el-form-item>
        <el-date-picker v-model="dataForm.date" type="date"
                        placeholder="选择日期" :editable="false" format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD" :clearable="false" />
      </el-form-item>
      <el-form-item prop="name">
        <el-input v-model="dataForm.name" placeholder="姓名"
                  maxlength="10" class="input" clearable="clearable" />
      </el-form-item>
      <el-form-item prop="tel">
        <el-input v-model="dataForm.tel" placeholder="电话号码"
                  maxlength="11" class="input" clearable="clearable" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchHandle()">查询</el-button>
        <el-button type="success" @click="checkinHandle()">体检签到</el-button>
        <el-button type="danger"  @click="finishHandle()">完成体检</el-button>
      </el-form-item>
      <el-form-item class="mold">
        <el-radio-group v-model="dataForm.statusLabel" @change="searchHandle()">
          <el-radio-button label="全部"></el-radio-button>
          <el-radio-button label="未签到"></el-radio-button>
          <el-radio-button label="已签到"></el-radio-button>
          <el-radio-button label="已结束"></el-radio-button>
          <el-radio-button label="已关闭"></el-radio-button>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <el-table :data="data.dataList"
              :header-cell-style="{'background':'#f5f7fa'}" border
              v-loading="data.loading" @selection-change="selectionChangeHandle">
      <el-table-column type="selection" :selectable="selectable"
                       header-align="center" align="center" width="50" fixed />
      <el-table-column type="index" header-align="center" align="center"
                       width="70" label="序号" fixed>
        <template #default="scope">
          <span>{{ (data.pageIndex - 1) * data.pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" header-align="center" align="center"
                       label="姓名" width="90" fixed />
      <el-table-column prop="sex" header-align="center" align="center"
                       label="性别" width="70" />
      <el-table-column prop="age" header-align="center" align="center"
                       label="年龄" width="70" />
      <el-table-column prop="tel" header-align="center" align="center"
                       label="联系电话" width="150" />
      <el-table-column prop="pid" header-align="center" align="center"
                       label="身份证号" width="190" />
      <el-table-column prop="company" header-align="center" align="center"
                       label="公司名称" width="100" />
      <el-table-column prop="title" header-align="center" align="center"
                       label="体检套餐" min-width="100" />
      <el-table-column prop="status" header-align="center" align="center"
                       label="状态" width="100" />
      <el-table-column  header-align="center" align="center"
                       width="150" label="操作">
        <template #default="scope">
          <el-button type="text"
                     :disabled="!proxy.isAuth(['ROOT', 'APPOINTMENT:SELECT'])"
                     @click="guidanceHandle(scope.row.id)">
            导引单
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="sizeChangeHandle"
                   @current-change="currentChangeHandle" :current-page="data.pageIndex"
                   :page-sizes="[10, 20, 50]" :page-size="data.pageSize"
                   :total="data.totalCount"
                   layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
  </div>

  <el-dialog title="体检签到" v-if="proxy.isAuth(['ROOT', 'APPOINTMENT:UPDATE'])"
             :close-on-click-modal="false" v-model="checkinDialog.visible"
             width="500px" :before-close="closeHandle">
    <div class="card-info">
      <div class="left">
        <el-form :model="checkinDialog.dataForm" ref="dialogForm" label-width="60px">
          <el-form-item label="姓名">
            <el-input v-model="checkinDialog.dataForm.name"  />
          </el-form-item>
          <el-form-item label="性别">
            <el-input v-model="checkinDialog.dataForm.sex"  />
          </el-form-item>
          <el-form-item label="身份证">
            <el-input v-model="checkinDialog.dataForm.pid"  />
          </el-form-item>
        </el-form>
      </div>
    </div>
    <template #footer>
        <span class="dialog-footer">
            <el-button @click="closeHandle">取消</el-button>
            <el-button type="success"
                       :disabled="checkinDialog.dataForm.pid == null"
                       @click="dataFormSubmit">
                签到
            </el-button>
        </span>
    </template>
  </el-dialog>

  <el-dialog title="体检导引单"
             v-if="proxy.isAuth(['ROOT', 'APPOINTMENT:SELECT'])"
             v-model="guidanceDialog.visible" width="800px">
    <div class="guidance" id="pdfDom" :name="guidanceDialog.name">
      <h2 class="title">神州大健康体检项目导引单</h2>
      <div class="summary">
        <table class="base-info">
          <tr>
            <td class="label">姓名:</td>
            <td class="value">{{guidanceDialog.name}}</td>
            <td class="label">性别:</td>
            <td class="value">{{guidanceDialog.sex}}</td>
            <td class="label">年龄:</td>
            <td class="value">{{guidanceDialog.age}}</td>
          </tr>
          <tr>
            <td class="label">身份证:</td>
            <td class="value">{{guidanceDialog.pid}}</td>
            <td class="label">电话:</td>
            <td class="value">{{guidanceDialog.tel}}</td>
            <td class="label">日期:</td>
            <td class="value">{{guidanceDialog.date}}</td>
          </tr>
          <tr>
            <td class="label">公司:</td>
            <td colspan="5" class="value">
              {{guidanceDialog.company}}
            </td>
          </tr>
        </table>
        <img class="qrcode" :src="guidanceDialog.qrCodeBase64" />
      </div>
      <table class="checkup">
        <tr>
          <th>序号</th>
          <th align="left">检查地点</th>
          <th align="left">检查项目</th>
          <th>体检医生</th>
        </tr>
        <tr v-for="(one,index) in guidanceDialog.checkup">
          <td align="center">{{index+1}}</td>
          <td>{{one.place}}</td>
          <td>{{one.name}}</td>
          <td></td>
        </tr>
      </table>
      <div class="desc">
        <p>请注意：体检结束10天后，即可在华夏健康卫士网站查询到您的体检报告。之后的5个工作日之内，您将收到本体检中心邮寄的体检报告，请留意查收！</p>
        <ul>
          <li>
            <el-icon><PhoneFilled /></el-icon>
            <span>体检咨询：010-23891145</span>
          </li>
          <li>
            <el-icon><PhoneFilled /></el-icon>
            <span>体检咨询：010-23891145</span></li>
          <li>
            <el-icon><PhoneFilled /></el-icon>
            <span>体检咨询：010-23891145</span>
          </li>
        </ul>
      </div>
    </div>
    <div class="operate">
      <el-button type="primary" size="large" :icon="Document" @click="getPdf()">
        下载导引单
      </el-button>
    </div>
  </el-dialog>
</template>

<style lang="less" scoped>
@import url('customer_checkin.less');
</style>