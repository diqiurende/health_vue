<script lang="ts" setup>
import { reactive, getCurrentInstance, ref } from 'vue';
const { proxy } = getCurrentInstance();

const dataForm = reactive({
  deptName: null
});

const dataRule = reactive({
  deptName: [{ required: false, pattern: '^[a-zA-Z0-9\u4e00-\u9fa5]{1,10}$', message: '部门名称格式错误' }]
});


const data = reactive({
  dataList: [],
  pageIndex: 1,
  pageSize: 10,
  totalCount: 0,
  loading: false,
  selections: []
});


function loadDataList() {
  data.loading = true;
  let json = {
    deptName: dataForm.deptName,
    page: data.pageIndex,
    length: data.pageSize
  };

  proxy.$http('/mis/dept/searchByPage', 'POST', json, true, function (resp : any) {
    let page = resp.page;
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
      if (dataForm.deptName == '') {
        dataForm.deptName = null;
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
</script>

<template>

  <div v-if="proxy.isAuth(['ROOT', 'DEPT:SELECT'])">
    <el-form :inline="true" :model="dataForm" :rules="dataRule" ref="form">
      <el-form-item prop="deptName">
        <el-input v-model="dataForm.deptName" placeholder="部门名称"
                  maxlength="10" class="input" clearable="clearable" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchHandle()">查询</el-button>
<!--        <el-button type="primary"-->
<!--                   :disabled="!proxy.isAuth(['ROOT', 'DEPT:INSERT'])"-->
<!--                   @click="addHandle()">-->
<!--          新增-->
<!--        </el-button>-->
<!--        <el-button type="danger"-->
<!--                   :disabled="!proxy.isAuth(['ROOT', 'DEPT:DELETE'])"-->
<!--                   @click="deleteHandle()">-->
<!--          批量删除-->
<!--        </el-button>-->
      </el-form-item>
    </el-form>
  </div>


  <el-table :data="data.dataList"
            :header-cell-style="{'background':'#f5f7fa'}" border
            v-loading="data.loading" @selection-change="selectionChangeHandle">
    <el-table-column type="selection" :selectable="selectable"
                     header-align="center" align="center" width="50" fixed />
    <el-table-column type="index" header-align="center" align="center"
                     width="120" label="序号" fixed>
      <template #default="scope">
        <span>{{ (data.pageIndex - 1) * data.pageSize + scope.$index + 1 }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="deptName" header-align="center"
                     align="center" label="部门名称" min-width="170" fixed />
    <el-table-column prop="tel" header-align="center" align="center"
                     label="联系电话" width="170" />
    <el-table-column prop="email" header-align="center" align="center"
                     label="邮箱" width="270" />
    <el-table-column header-align="center" align="center" label="员工数量"
                     width="140">
      <template #default="scope">
        <span>{{ scope.row.emps }}人</span>
      </template>
    </el-table-column>
    <el-table-column prop="desc" header-align="center" align="center"
                     label="备注" min-width="350" />
<!--    <el-table-column fixed="right" header-align="center" align="center"-->
<!--                     width="150" label="操作">-->
<!--      <template #default="scope">-->
<!--        <el-button type="text"-->
<!--                   :disabled="!proxy.isAuth(['ROOT', 'DEPT:UPDATE'])"-->
<!--                   @click="updateHandle(scope.row.id)">-->
<!--          修改-->
<!--        </el-button>-->
<!--        <el-button type="text"-->
<!--                   :disabled="!proxy.isAuth(['ROOT', 'DEPT:DELETE']) || scope.row.emps > 0"-->
<!--                   @click="deleteHandle(scope.row.id)">-->
<!--          删除-->
<!--        </el-button>-->
<!--      </template>-->
<!--    </el-table-column>-->
  </el-table>
  <el-pagination @size-change="sizeChangeHandle"
                 @current-change="currentChangeHandle" :current-page="data.pageIndex"
                 :page-sizes="[10, 20, 50]" :page-size="data.pageSize"
                 :total="data.totalCount"
                 layout="total, sizes, prev, pager, next, jumper">
  </el-pagination>
</template>

<style scoped lang="less">

</style>