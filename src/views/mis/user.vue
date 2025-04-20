<script lang="ts" setup>
import { reactive, getCurrentInstance, ref, onMounted } from 'vue';
const { proxy } = getCurrentInstance();
import { dayjs } from 'element-plus';

const dataForm = reactive({
  name: '',
  sex: '',
  role: '',
  deptId: '',
  status: '',
  roleList: [],
  deptList: []
});
const dataRule = reactive({
  name: [{ required: false, pattern: '^[\u4e00-\u9fa5]{1,10}$', message: '姓名格式错误' }]
});

const data=reactive({
  dataList: [],
  pageIndex: 1,
  pageSize: 10,
  totalCount: 0,
  loading: false,
  selections: []
})

//弹窗
const dialog = reactive({
  visible: false,
  update: false,//标志位
  dataForm: {
    id: null,
    username: null,
    password: null,
    name: null,
    sex: null,
    tel: null,
    email: null,
    hiredate: dayjs(new Date()).format('YYYY-MM-DD'),
    role: null,
    deptId: null,
    status: 1
  },
  dataRule: {
    username: [
      { required: true, message: '用户名不能为空' },
      { pattern: '^[a-zA-Z0-9]{5,20}$', message: '用户名格式错误' }
    ],
    password: [
      { required: true, message: '密码不能为空' },
      { pattern: '^[a-zA-Z0-9]{6,20}$', message: '密码格式错误' }
    ],
    name: [
      { required: true, message: '姓名不能为空' },
      { pattern: '^[\u4e00-\u9fa5]{2,10}$', message: '姓名格式错误' }
    ],
    sex: [{ required: true, message: '性别不能为空' }],
    tel: [{ required: true, message: '电话不能为空' }, { pattern: '^1[1-9]\\d{9}$', message: '电话格式错误' }],
    email: [
      { required: true, message: '邮箱不能为空' },
      { pattern: '^([a-zA-Z]|[0-9])(\\w|\\-)+@[a-zA-Z0-9]+\\.([a-zA-Z]{2,4})$', message: '邮箱格式错误' }
    ],
    hiredate: [{ required: true, message: '入职日期不能为空' }],
    role: [{ required: true, message: '角色不能为空' }],
    status: [{ required: true, message: '状态不能为空' }]
  }
});
//get方法获取所有的角色
function getAllRole(){
  proxy.$http('/mis/role/searchAllRole','GET',null,true,function (resp){
    dataForm.roleList=resp.list;
  })
}
//get所有的部门
function getAllDept(){
  proxy.$http('/mis/dept/searchAllDept','GET',null,true,function (resp){
    dataForm.deptList=resp.list;
  })
}
//全部执行
getAllRole();
getAllDept();


function  loadDataList(){
  data.loading=true;//设置滚动条
  let json={
    page: data.pageIndex,
    length: data.pageSize,
    name: dataForm.name,
    sex: dataForm.sex,
    role: dataForm.role,
    deptId: dataForm.deptId,
    status: dataForm.status
  };
  proxy.$http('/mis/user/searchPage', 'POST',json,true,function (resp){
    let page=resp.page;
    let list=page.list;
    //将list里的在职状态转换为文字显示
    for(let user of list){
      if(user.status==1){
        user.status='在职';
      }
      else if(user.status==2){
        user.status='离职';
      }
    }
    data.dataList=list;
    data.totalCount=page.totalCount;
    data.loading=false;
  });
}
loadDataList();

//实现查询
function searchHandle(){
  //首先对于表单的输入进行验证
   proxy.$refs['form'].validate(valid => {
     if(valid){
       //清除之前的表单验证
       proxy.$refs['form'].clearValidate();
       //替换空字符
       if(dataForm.name==''){
         dataForm.name=null;
       }
       if(data.pageIndex!=1){
         data.pageIndex=1;//默认显示第一页
       }
       //加载分页记录
       loadDataList();
     } else {
       return false;
     }
   });
}



//改变分页逻辑函数

//改变分页显示条数
function sizeChangeHandle(val){
  data.pageSize=val;
  data.pageIndex=1;
  loadDataList();
}
//翻页触发函数
function  currentChangeHandle(val){
  data.pageIndex=val;
  loadDataList();
}


//新增用户
function  addHandle(){
  //新增用户不需要主键值 以免之前修改的主键值影响
  dialog.dataForm.id=null;
  dialog.update=false;
  dialog.visible=true;//显示弹窗
  proxy.$nextTick(()=>{//等到 DOM 更新完成之后再执行回调函数-重置表单字段
    proxy.$refs['dialogForm'].resetFields();
  });
}
//dialog里的确认按钮绑定提交事件
function dataFormSubmit(){
  //首先验证表单字段
  proxy.$refs['dialogForm'].validate(valid => {
    if(valid){
      let json={
        userId: dialog.dataForm.id,
        username: dialog.dataForm.username,
        password: dialog.dataForm.password,
        name: dialog.dataForm.name,
        sex: dialog.dataForm.sex,
        tel: dialog.dataForm.tel,
        email: dialog.dataForm.email,
        //将日期 dialog.dataForm.hiredate 格式化成字符串 "YYYY-MM-DD" 的形式（如 2025-04-14）
        hiredate: dayjs(dialog.dataForm.hiredate).format('YYYY-MM-DD'),
        role: dialog.dataForm.role,
        deptId: dialog.dataForm.deptId,
        status: dialog.dataForm.status
      };
      console.log(json);
      //根据dialog的id字段判断当前操作 为null就是insert 否则就是更新操作
      proxy.$http(`/mis/user/${dialog.dataForm.id==null?'insertUser':'update'}`, 'POST',json,true,function (resp){
        if(resp.rows==1){
          proxy.$message({
            message:'操作成功',
            type:"success",
            duration: 2000,
            onClose: () => {
              dialog.visible=false;
              loadDataList();
            }
          });
        }else {
          proxy.$message({
            message:'操作失败',
            type:'error',
            duration: 2000
          });
        }
      });
    }
  });
}

//修改
function updateHandle(id){
  //修改标志位为更新 保存当前userid 显示弹窗
  dialog.dataForm.id=id;
  dialog.update=true;
  dialog.visible=true;
  proxy.$nextTick(()=>{
    let json={
      userId: dialog.dataForm.id
    };
    proxy.$http('/mis/user/searchById','POST',json,true,function (resp){
      let result = resp.result;
      dialog.dataForm.username = result.username;
      dialog.dataForm.name = result.name;
      dialog.dataForm.sex = result.sex;
      dialog.dataForm.tel = result.tel;
      dialog.dataForm.email = result.email;
      dialog.dataForm.hiredate = result.hiredate;
      dialog.dataForm.role = JSON.parse(result.role);
      dialog.dataForm.deptId = result.deptId;
      dialog.dataForm.status = result.status;
    })
  })
}


//删除复选框的规则 避免删除管理员账户
function selectable(row,index){

  let temp=row.roles.split("，");
  if(temp.includes("超级管理员")){
    return false;
  }
  return true;
}

//每次勾选或者取消都会触发
function selectionChangeHandle(val){
   data.selections=val;
}

//删除函数
function deleteHandle(id) {
  //适用于批量删除或者单条删除
  let ids = id ? [id] : data.selections.map(item => {
    return item.id;
  });//前者单删为封装一个id到ids数组 后者为将selection里的id封装为ids数组
  if (ids.length == 0) {
    proxy.$message({
      message: '没有选中记录',
      type: 'warning',
      duration: 1200
    });
  } else {
    proxy.$confirm('确定要删除所选中的数据？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
        .then(() => {
          let json = {
            ids: ids
          };
          proxy.$http('/mis/user/deleteUserByIds', 'POST', json, true, function (resp) {
            if (resp.rows > 0) {
              proxy.$message({
                message: '操作成功',
                type: 'success',
                duration: 1200,
                onClose: () => {
                  loadDataList();
                }
              })
            } else {
              proxy.$message({
                message: '未能删除记录',
                type: 'warning',
                duration: 1200
              });
            }
          });
        });
  }
}

//离职函数
function  dismissHandle(id){
  proxy.$confirm(`确定设置该用户为离职状态？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    let json = { userId: id }
    proxy.$http('/mis/user/dismiss', 'POST', json, true, function (resp) {
      if (resp.rows == 1) {
        proxy.$message({
          message: '操作成功',
          type: 'success',
          duration: 1200,
          onClose: () => {
            loadDataList();//重新加载页面
          }
        });
      } else {
        proxy.$message({
          message: '操作失败',
          type: 'warning',
          duration: 1200
        });
      }
    });
  });
}
</script>

<template>
  <div>
    <el-form :inline="true" :model="dataForm" :rules="dataRule" ref="form">
      <el-form-item prop="name">
        <el-input v-model="dataForm.name" placeholder="姓名"
                  maxlength="10" class="input" clearable="clearable" />
      </el-form-item>
      <el-form-item>
        <el-select v-model="dataForm.sex" class="input" placeholder="性别"
                   clearable="clearable">
          <el-option label="男" value="男" />
          <el-option label="女" value="女" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="dataForm.role" class="input"
                   placeholder="角色" clearable="clearable">
          <el-option v-for="one in dataForm.roleList"
                     :label="one.roleName" :value="one.roleName" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="dataForm.deptId" class="input"
                   placeholder="部门" clearable="clearable">
          <el-option v-for="one in dataForm.deptList"
                     :label="one.deptName" :value="one.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="dataForm.status" class="input"
                   placeholder="状态" clearable="clearable">
          <el-option label="在职" value="1" />
          <el-option label="离职" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchHandle()">查询</el-button>
        <el-button type="primary"
                   :disabled="!proxy.isAuth(['ROOT', 'USER:INSERT'])"
                   @click="addHandle()">
          新增
        </el-button>
        <el-button type="danger"
                   :disabled="!proxy.isAuth(['ROOT', 'USER:DELETE'])"
                   @click="deleteHandle()">
          批量删除
        </el-button>
      </el-form-item>
    </el-form>

    <el-table :data="data.dataList"
              :header-cell-style="{'background':'#f5f7fa'}" border
              v-loading="data.loading" @selection-change="selectionChangeHandle">
      <el-table-column type="selection" header-align="center"
                       :selectable="selectable" align="center" width="50" />
      <el-table-column type="index" header-align="center" align="center"
                       width="100" label="序号">
        <template #default="scope">
          <span>{{ (data.pageIndex - 1) * data.pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" header-align="center" align="center"
                       min-width="100" label="姓名" />
      <el-table-column prop="sex" header-align="center" align="center"
                       min-width="60" label="性别" />
      <el-table-column prop="tel" header-align="center" align="center"
                       min-width="130" label="电话" />
      <el-table-column prop="email" header-align="center" align="center"
                       min-width="240" label="邮箱" :show-overflow-tooltip="true" />
      <el-table-column prop="hiredate" header-align="center"
                       align="center" min-width="130" label="入职日期" />
      <el-table-column prop="roles" header-align="center" align="center"
                       min-width="150" label="角色" :show-overflow-tooltip="true" />
      <el-table-column prop="dept" header-align="center" align="center"
                       min-width="120" label="部门" />
      <el-table-column prop="status" header-align="center" align="center"
                       min-width="100" label="状态" />
      <el-table-column header-align="center" align="center" width="150"
                       label="操作">
        <template #default="scope">
          <el-button type="text"
                     v-if="proxy.isAuth(['ROOT', 'USER:UPDATE'])"
                     @click="updateHandle(scope.row.id)">
            修改
          </el-button>
          <el-button type="text"
                     v-if="proxy.isAuth(['ROOT', 'USER:UPDATE'])"
                     :disabled="scope.row.status == '离职' || scope.row.root"
                     @click="dismissHandle(scope.row.id)">
            离职
          </el-button>
          <el-button type="text" :disabled="scope.row.root"
                     v-if="proxy.isAuth(['ROOT', 'USER:DELETE'])"
                     @click="deleteHandle(scope.row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="sizeChangeHandle"
                   @current-change="currentChangeHandle" :current-page="data.pageIndex"
                   :page-sizes="[10, 20, 50]" :page-size="data.pageSize"
                   :total="data.totalCount"
                   layout="total, sizes, prev, pager, next, jumper"></el-pagination>
  </div>
  <el-dialog
     :title="!dialog.dataForm.id ? '新增':'修改'"
      :close-on-click-modal="false" v-model="dialog.visible" width="450px">
    <el-form :model="dialog.dataForm" ref="dialogForm"
      :rules="dialog.dataRule" label-width="80px">

      <el-form-item label="用户名" prop="username">
        <el-input v-model="dialog.dataForm.username" maxlength="20"
                  clearable />
      </el-form-item>
      <el-form-item label="密码" prop="password" v-if="!dialog.update">
        <el-input type="password" v-model="dialog.dataForm.password"
                  maxlength="20" clearable />
      </el-form-item>
      <el-form-item label="姓名" prop="name">
        <el-input v-model="dialog.dataForm.name" maxlength="10"
                  clearable />
      </el-form-item>
      <el-form-item label="性别" prop="sex">
        <el-select v-model="dialog.dataForm.sex" clearable>
          <el-option label="男" value="男"></el-option>
          <el-option label="女" value="女"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="电话" prop="tel">
        <el-input v-model="dialog.dataForm.tel" maxlength="11"
                  clearable />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="dialog.dataForm.email" maxlength="200"
                  clearable />
      </el-form-item>
      <el-form-item label="入职日期" prop="hiredate">
        <el-date-picker v-model="dialog.dataForm.hiredate" type="date"
                        placeholder="选择日期" :editable="false" format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD" />
      </el-form-item>
      <el-form-item label="角色" prop="role">
        <el-select v-model="dialog.dataForm.role" placeholder="选择角色"
                   class="dialog-input" multiple clearable>
          <el-option v-for="one in dataForm.roleList" :key="one.id"
                     :label="one.roleName" :value="one.id"
                     :disabled="one.roleName == '超级管理员'"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="部门">
        <el-select v-model="dialog.dataForm.deptId" placeholder="选择部门"
                   class="dialog-input" clearable>
          <el-option v-for="one in dataForm.deptList" :key="one.id"
                     :label="one.deptName" :value="one.id" />
        </el-select>
      </el-form-item>

    </el-form>
    <template #footer>
        <span class="dialog-footer">
            <el-button @click="dialog.visible = false">取消</el-button>
            <el-button type="primary" @click="dataFormSubmit">确定</el-button>
        </span>
    </template>

  </el-dialog>

</template>

<style scoped lang="less">
.dialog-input {
  width: 100% !important;
}
</style>