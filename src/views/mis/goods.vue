<script lang="ts" setup>
import { reactive, getCurrentInstance, ref, onMounted } from 'vue';
//引入ElementPlus组件库中的三个图标，要给按钮设置图标
import { Delete, Download, Upload } from '@element-plus/icons-vue';
import router from '../../router/index';
import {TRUE} from "sass";
import {inputNumberEmits} from "element-plus";
const { proxy } = getCurrentInstance();



// 表单数据，绑定用户输入的信息
const dataForm = reactive({
  keyword: null,               // 搜索关键字，用于商品搜索或过滤
  code: null,                  // 商品编号
  type: null,                  // 商品类型
  partId: null,                // 下拉列表选中的内容（部分商品的分组或分类）
  statusLabel: '全部',         // 商品状态标签，默认为'全部'
  status: null                 // 商品状态，通常用于过滤商品列表
});

const dataRule = reactive({
  keyword: [{ pattern: '^[a-zA-Z0-9\u4e00-\u9fa5]{1,50}$', message: '关键字内容不正确' }],
  code: [{ min: 6, message: '编号不能少于6个字符' }, { pattern: '^[a-zA-Z0-9]{6,20}$', message: '编号格式错误' }]
});



// 用于存储商品列表及分页数据
const data = reactive({
  dataList: [],               // 存储商品数据的数组
  pageIndex: 1,               // 当前页码
  pageSize: 10,               // 每页显示的商品数
  totalCount: 0,              // 商品总数
  loading: false,             // 是否正在加载商品数据
  selections: []              // 当前选中的商品，用于批量操作
});


const goodsDialog = reactive({
  visible: false,
  newTag: null,
  item: [{}],
  imageUrl: null,
  checkup: null,
  ruleList: [],
  dataForm: {
    id: null,
    title: null,
    code: null,
    description: null,
    initialPrice: null,
    currentPrice: null,
    ruleId: null,
    image: null,
    type: null,
    tag: [],
    partId: null
  },
  upload: {
    action: `${proxy.$baseUrl}/mis/goods/uploadImage`,
    headers: {
      token: localStorage.getItem('token')
    },
    data: {
      id: null
    },
  },

  dataRule: {
    title: [
      { required: true, message: '名称不能为空' },
      { min: 2, message: '名称不能少于2个字符' },
      { pattern: '^[a-zA-Z0-9\u4e00-\u9fa5]{2,50}$', message: '名称格式错误' }
    ],
    code: [
      { required: true, message: '编号不能为空' },
      { min: 6, message: '编号不能少于6个字符' },
      { pattern: '^[a-zA-Z0-9]{6,20}$', message: '编号格式错误' }
    ],
    description: [{ required: true, message: '简介信息不能为空' }],
    initialPrice: [
      {
        required: true,
        message: '价格不能为空'
      },
      {
        pattern: '(^[1-9]([0-9]+)?(\\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\\.[0-9]([0-9])?$)',
        message: '价格不正确'
      }
    ],
    currentPrice: [
      {
        required: true,
        message: '价格不能为空'
      },
      {
        pattern: '(^[1-9]([0-9]+)?(\\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\\.[0-9]([0-9])?$)',
        message: '价格不正确'
      }
    ],
    image: [
      {
        required: true,
        message: '没有上传封面图片'
      }
    ],
    type: [
      {
        required: true,
        message: '没有选择套餐类别'
      }
    ]
  }
});



// 商品文档上传对话框数据
const documentDialog = reactive({
  visible: false,             // 控制商品文档上传对话框的显示与隐藏
  upload: {                   // 文档上传配置
    action: `${proxy.$baseUrl}/mis/goods/uploadCheckupExcel`,  // 上传文档的接口地址
    headers: {                // 上传文档时需要的请求头
      token: localStorage.getItem('token')  // 使用localStorage中的token进行身份验证
    }
  },
  data: {                     // 上传数据
    id: null,                 // 商品ID，用于关联上传的文档
    hasCheckup: null          // 商品是否有体检项
  }
});

//加载数据函数
function  loadDataList(){
  data.loading=true;
  if(dataForm.statusLabel=='全部'){
    dataForm.status=null;
  }
  else if(dataForm.statusLabel=='已上架'){
    dataForm.status=true;
  }
  else{
    dataForm.status=false;//未上架
  }
  let json={
    page:data.pageIndex,
    length:data.pageSize,
    keyword:dataForm.keyword,
    code:dataForm.code,
    type:dataForm.type,
    partId:dataForm.partId,
    status:dataForm.status//上架与否由radio点击赋值
  };
  proxy.$http('/mis/goods/searchByPage', 'POST',json,true,function (resp){
    let page=resp.page;
    let list=page.list;
    data.dataList=list;//查询到的list数据保存到datalist在表格里显示
    data.totalCount=page.totalCount;
    data.loading=false;
  });
}
loadDataList();

//查询函数 radio通用
function searchHandle(){
  proxy.$refs['form'].validate(valid => {
    if(valid){//触发表单验证
      //清除之前的表单验证
      proxy.$refs['form'].clearValidate();

      //在加载数据之前排除为空的字符
      if (dataForm.keyword == '') {
        dataForm.keyword = null;
      }
      if (dataForm.code == '') {
        dataForm.code = null;
      }
      if (dataForm.type == '') {
        dataForm.type = null;
      }
      if (dataForm.partId == '') {
        dataForm.partId = null;
      }
      if (data.pageIndex != 1) {
        data.pageIndex = 1;
      }
      loadDataList();
    }
    else{
      return false;
    }
  })

}

//更新每页显示
function sizeChangeHandle(val){
  data.pageSize=val;
  data.pageIndex=1;//从第一页开始显示
  loadDataList();
}
//页数跳转函数
function currentChangeHandle(val){
  data.pageIndex=val;
  loadDataList();
}

//新增商品函数
function addHandle (){
//添加新商品id和上传图片相关属性都应该置空
  goodsDialog.dataForm.id = null;
  goodsDialog.dataForm.image = null;
  goodsDialog.imageUrl = null;

  //规则列表相关的属性也要置空
  goodsDialog.dataForm.ruleId = null;
  goodsDialog.ruleList = [];

  //体检内容数组也要置空
  goodsDialog.item = [{}];

  //计算体检内容用于充当临时变量的属性也置空（该变量下面会用到）
  goodsDialog.checkup = null;

  //跟tag标签有关的属性也都重新赋值
  goodsDialog.newTag = null;
  goodsDialog.dataForm.tag = [];

  goodsDialog.visible = true;

  proxy.$nextTick(() => {
    proxy.$refs['dialogForm'].resetFields();
    //加载规则列表
    loadAllRule();
  });
}

//加载规则列表
function loadAllRule(){
  //将全部的促销规则保存
  proxy.$http('/mis/rule/searchAllRule', 'GET', null, true, function (resp) {
    goodsDialog.ruleList = resp.result;
  });
}
//上传封面前的回调函数
function imageBeforeUpload(file){
  //检验文件大小 最大不能超过2M

  if(file.size>2*1024*1024){
    proxy.$message({
      message:'图片大小不能超过2M',
      type: 'error',
      duration: 2000
    });
    return false;
  }
  return true;
}
//封面图片上传成功回调函数
function imageUploadSuccess(resp : any, uploadFile : UploadFile, uploadFiles : UploadFiles) {
  if (resp.msg == 'success') {
    let path = resp.result;
    //保存图片相对地址，添加或者修改商品的时候，要上传给后端Web方法
    goodsDialog.dataForm.image = path;//"front/goods/8a75643baf494792a10849510b213e24.jpg
    //显示已上传的图片
    goodsDialog.imageUrl = `${proxy.$minioUrl}/${path}`;
  }
}

//文件上传失败回调函数
function imageUploadError(e){
  proxy.$message({
    message:'文件上传失败',
    type:'error',
    duration:2000
  });
  console.log(e);
}

//回车确认标签回调函数
function enterTag(){
  if(goodsDialog.newTag==null||goodsDialog.newTag==''){
    return false;
  }
  //对于输入的标签 先判断之前的有没有清空
  if (goodsDialog.dataForm.tag.includes(goodsDialog.newTag)) {
    proxy.$message({
      message: '不能添加重复标签',
      type: 'warning',
      duration: 1200
    });
  }else{
    goodsDialog.dataForm.tag.push(goodsDialog.newTag);
    goodsDialog.newTag=null;//清空
  }
}

//关闭标签tag
function closeTag(one){
  //删除当前元素
  let  index=goodsDialog.dataForm.tag.indexOf(one);
  goodsDialog.dataForm.tag.splice(index,1);
}


//新增弹窗
function addItem(){
  //在item数组里新建空白行
  goodsDialog.item.push({});
}
//删除当前行
function deleteItem(index){
  if (goodsDialog.item.length == 1) {
    proxy.$message({
      message: '请保留至少一条体检内容',
      type: 'warning',
      duration: 1200
    });
  } else {
    goodsDialog.item.splice(index, 1);
  }
}


//提交商品回调函数
function dataFormSubmit(){
  //表单验证
  proxy.$refs['dialogForm'].validate(valid => {
    if(valid){
        for(let cp of goodsDialog.item){
          //检查列表是否被选中 后面文本框是否有效输入
          function isEmpty(value: any): boolean {
            return value === undefined || value === '';
          }

          if (isEmpty(cp.type)) {
            proxy.$message({
              message: '没有选择检查类别',
              type: 'warning',
              duration: 1200
            });
            return;
          }

          if (isEmpty(cp.title)) {
            proxy.$message({
              message: '部分体检项目未填写',
              type: 'warning',
              duration: 1200
            });
            return;
          }

          if (isEmpty(cp.content)) {
            proxy.$message({
              message: '部分体检内容未填写',
              type: 'warning',
              duration: 1200
            });
            return;
          }
          let temp={};

          //创建检查列表对应的map对象
          let check_map=new Map([
            ['科室检查', 'checkup_1'],
            ['实验室检查', 'checkup_2'],
            ['医技检查', 'checkup_3'],
            ['其他检查', 'checkup_4']
          ]);
           let type=check_map.get(cp.type);
          if (!(type in temp)) {
            // 不存在，初始化
            temp[type] = [{ title: cp.title, content: cp.content }];
          } else {
            // 已存在，追加
            temp[type].push({ title: cp.title, content: cp.content });
          }

          let checkupKeys = ['checkup_1', 'checkup_2', 'checkup_3', 'checkup_4'];

          checkupKeys.forEach(key => {
            if (!temp.hasOwnProperty(key)) {
              temp[key] = null; // 添加缺失的属性，值为空
            }
          });
          goodsDialog.checkup=temp;
          let tag = goodsDialog.dataForm.tag;

          let json = {
            // 商品ID（用于更新已有商品时，新增时可能为null或0）
            id: goodsDialog.dataForm.id,

            // 商品标题
            title: goodsDialog.dataForm.title,

            // 商品编码
            code: goodsDialog.dataForm.code,

            // 商品描述
            description: goodsDialog.dataForm.description,

            // 各类体检项列表（数组），来源于 temp
            checkup_1: goodsDialog.checkup.checkup_1, // 科室检查
            checkup_2: goodsDialog.checkup.checkup_2, // 实验室检查
            checkup_3: goodsDialog.checkup.checkup_3, // 医技检查
            checkup_4: goodsDialog.checkup.checkup_4, // 其他检查

            // 初始价格
            initialPrice: goodsDialog.dataForm.initialPrice,

            // 当前价格
            currentPrice: goodsDialog.dataForm.currentPrice,

            // 规则ID，如果为空字符串则转为 null（避免后端接收空字符串报错）
            ruleId: goodsDialog.dataForm.ruleId == '' ? null : goodsDialog.dataForm.ruleId,

            // 商品图片路径（通常是上传后的 URL）
            image: goodsDialog.dataForm.image,

            // 商品分类类型（如 体检类、药品类等）
            type: goodsDialog.dataForm.type,

            // 所属部位ID（如 心脏、肝脏等）
            partId: goodsDialog.dataForm.partId,

            // 标签数组（如 ["男", "老年人"]），如果为空则传 null（避免后端存入空数组）
            tag: tag != null && tag.length > 0 ? tag : null
          };
          //根据id来选择更新或新增
          proxy.$http(
              `/mis/goods/${goodsDialog.dataForm.id == null ? 'insert' : 'update'}`,
              'POST',
              json,
              true,
              function (resp) {
                if(resp.rows==1){
                  proxy.$message({
                    message: '操作成功',
                    type: 'success',
                    duration: 1200
                  });
                  //关闭面板
                  goodsDialog.visible = false;

                  //重加载数据
                  loadDataList();
                }else{
                  proxy.$message({
                    message: '操作失败',
                    type: 'error',
                    duration: 1200
                  });
                }


              }
          )


        }
    }
  })
}

//修改信息回调函数
function updateHandle(id){
  // 1. 初始化数据
  goodsDialog.upload.data.id = id;      // 上传组件关联的id
  goodsDialog.dataForm.id = id;         // 表单数据的id
  goodsDialog.dataForm.image = null;    // 清空图片字段
  goodsDialog.imageUrl = null;          // 清空图片显示URL
  goodsDialog.item = [];                 // 清空体检内容列表
  goodsDialog.checkup = null;            // 清空体检检查数据
  goodsDialog.newTag = null;             // 清空新标签
  goodsDialog.dataForm.tag = [];         // 清空标签数组
  goodsDialog.visible = true;             // 显示编辑对话框
  //在DOM更新后
  proxy.$nextTick(()=>{
    //重置表单字段
    proxy.$refs['dialogForm'].resetFields();
    let json={
      id:id
    };
    loadAllRule();
    proxy.$http('/mis/goods/searchById', 'POST', json, true, function (resp) {

      goodsDialog.dataForm.code = resp.result.code;
      goodsDialog.dataForm.title = resp.result.title;
      goodsDialog.dataForm.description = resp.result.description;

      goodsDialog.dataForm.image = resp.result.image;
      goodsDialog.imageUrl = `${proxy.$minioUrl}/${resp.result.image}`;

      goodsDialog.dataForm.initialPrice = resp.result.initialPrice;
      goodsDialog.dataForm.currentPrice = resp.result.currentPrice;
      goodsDialog.dataForm.type = resp.result.type;
      // 判断是否有标签字段，没有则赋空数组
      goodsDialog.dataForm.tag = resp.result.hasOwnProperty('tag') ? resp.result.tag : [];
      goodsDialog.dataForm.partId = resp.result.partId+"";
      goodsDialog.dataForm.ruleId = resp.result.ruleId;

      //遍历体检类别字段，将接口返回的体检内容转换为页面显示格式
      let typeJson = {
        checkup_1: '科室检查',
        checkup_2: '实验室检查',
        checkup_3: '医技检查',
        checkup_4: '其他检查'
      };
      for (let key in typeJson) {
        if (resp.result.hasOwnProperty(key)) {
          let checkup = resp.result[key]; // 取出该类别的体检内容数组
          for (let one of checkup) {
            goodsDialog.item.push({ type: typeJson[key], title: one.title, content: one.content });
          }
        }
      }
    })
  })
}

   //上传文档回调函数
    function documentHandle(id,hasCheckup){
      //将传入的连个参数保存在documentDialog
      documentDialog.data={
        id:id,
        hasCheckup: hasCheckup
      }

      documentDialog.visible = true;//显示弹窗
    }

    //弹窗里的上传文档前的回调函数
    function documentBeforeUpload(file){
     //检查文件大小
      if(file.size > 20*1024 * 1024){
        proxy.$message({
          message:"上传的文件大小不能超过20M！",
          type:"error",
          duration: 1200
        })
        return false;
      }
      return true;

    }
    //弹窗里文档上传成功回调函数
    function documentUploadSuccess(){
      //关闭弹窗
      documentDialog.visible=false;
      //提示成功
      proxy.$message({
        message:"上传的文件成功！",
        type:"success",
        duration: 1200,
        onClose:()=>{
          loadDataList()
        }
      })
    }

    //失败回调函数
      function documentUploadError(e) {
        proxy.$message({
          message: "文件上传失败",
          type: 'error',
          duration: 1200
        });
        console.error(e);
      }

      //文档弹窗里下载函数
function documentDownloadHandle() {
  // 从本地存储中获取登录 token（用于权限认证）
  let token = localStorage.getItem('token');
  // 获取当前商品的 ID（从弹窗的数据中提取）
  let id = documentDialog.data.id;
  // 构造下载请求的完整 URL，携带 token 和商品ID作为参数
  let url = `${proxy.$baseUrl}/mis/goods/downloadCheckupExcel?token=${token}&id=${id}`;
  // 创建一个 <a> 标签（超链接）
  let a = document.createElement('a');
  // 设置超链接地址为后端接口
  a.href = url;
  // 设置下载属性（可选：如果你后端没有强制下载文件名）
  a.download = `${id}.xlsx`;
  // 将这个标签添加到页面（Firefox 有时需要）
  document.body.appendChild(a);
  // 模拟点击超链接，触发浏览器下载行为
  a.click();
  // 下载完移除这个标签
  document.body.removeChild(a);
  // 延迟1秒后关闭下载弹窗（避免用户没看到就消失了）
  setTimeout(() => {
    documentDialog.visible = false;
  }, 1000);
}

    //点击上下架切换函数
    function changeSwitchHandle(id,staus){
      let json = {
        id: id,
        status: staus
      };
      proxy.$http('/mis/goods/updateStaus', 'POST', json, true, function (resp) {
        if (resp.result) {
          proxy.$message({
            message: '操作成功',
            type: 'success',
            duration: 1200
          });
        }
      });
    }

    //删除规则 只能删除已经下架，并且商品销量是零
function selectable(row, index) {
  if (row.salesVolume > 0 || row.status == true) {
    return false;
  }
  return true;
}
//多选商品记录点击函数
function selectionChangeHandle(val) {
  //val是内部维护的一个当前所有选中行的数组
  data.selections = val;
}

//删除商品记录
function deleteHandle(id) {
  //传参就是单条记录 不传就是批量
  let ids = id ? [id] : data.selections.map(item => {
    return item.id;
  });
  if (ids.length == 0) {
    proxy.$message({
      message: '没有选中记录',
      type: 'warning',
      duration: 1200
    });
  } else {
    proxy.$confirm(`确定要删除选中的记录？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      let json = { ids: ids };
      proxy.$http('/mis/goods/deleteByIds', 'POST', json, true, function (resp) {
        if (resp.rows > 0) {
          proxy.$message({
            message: `刪除了${resp.rows}条记录`,
            type: 'success',
            duration: 1200,
            onClose: () => {
              loadDataList();
            }
          });
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

//预览函数
function viewHandle(id) {
  //带id跳转到商品预览页面
  router.push({
    name: 'FrontGoods',
    params: {
      id: id
    }
  });
}
</script>

<template>
  <div v-if="proxy.isAuth(['ROOT', 'GOODS:SELECT'])">
    <el-form :inline="true" :model="dataForm" :rules="dataRule" ref="form">
      <el-form-item prop="keyword">
        <el-input v-model="dataForm.keyword" placeholder="套餐名称"
                  maxlength="50" class="input" clearable="clearable" />
      </el-form-item>
      <el-form-item prop="code">
        <el-input v-model="dataForm.code" placeholder="套餐编号"
                  class="input" maxlength="20" clearable="clearable" />
      </el-form-item>
      <el-form-item>
        <el-select v-model="dataForm.type" class="input"
                   placeholder="类别" clearable="clearable">
          <el-option label="父母体检" value="父母体检" />
          <el-option label="入职体检" value="入职体检" />
          <el-option label="职场白领" value="职场白领" />
          <el-option label="个人高端" value="个人高端" />
          <el-option label="中青年体检" value="中青年体检" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="dataForm.partId" class="input"
                   placeholder="展示区" clearable="clearable">
          <el-option label="活动专区" value="1" />
          <el-option label="热卖套餐" value="2" />
          <el-option label="新品推荐" value="3" />
          <el-option label="孝敬父母" value="4" />
          <el-option label="白领精英" value="5" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchHandle()">查询</el-button>
        <el-button type="primary"
                   :disabled="!proxy.isAuth(['ROOT', 'GOODS:INSERT'])"
                   @click="addHandle()">
          新增
        </el-button>
        <el-button type="danger"
                   :disabled="!proxy.isAuth(['ROOT', 'GOODS:DELETE'])"
                   @click="deleteHandle()">
          批量删除
        </el-button>
      </el-form-item>
      <el-form-item class="mold">
        <el-radio-group v-model="dataForm.statusLabel"
                        @change="searchHandle()">
          <el-radio-button label="全部"></el-radio-button>
          <el-radio-button label="已上架"></el-radio-button>
          <el-radio-button label="已下架"></el-radio-button>
        </el-radio-group>
      </el-form-item>
    </el-form>
<!--以下为表格控件-->

    <el-table :data="data.dataList"
              :header-cell-style="{'background':'#f5f7fa'}" border
              v-loading="data.loading" @selection-change="selectionChangeHandle">
      <el-table-column type="selection" header-align="center"
                       align="center" width="50" :selectable="selectable" />
      <el-table-column type="index" header-align="center" align="center"
                       width="100" label="序号">
        <template #default="scope">
          <span>{{ (data.pageIndex - 1) * data.pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="title" header-align="left" align="left"
                       min-width="250" label="套餐名称" />
      <el-table-column prop="code" header-align="left" align="left"
                       min-width="130" label="套餐编号" />
      <el-table-column header-align="center" align="center" min-width="80"
                       label="现价">
        <template #default="scope">
          <span>￥{{ scope.row.currentPrice }}</span>
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center"
                       min-width="100" label="原价">
        <template #default="scope">
          <span>￥{{ scope.row.initialPrice }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="ruleName" header-align="center"
                       align="center" min-width="100" label="促销方案" />
      <el-table-column prop="salesVolume" header-align="center"
                       align="center" min-width="100" label="销量" />
      <el-table-column prop="type" header-align="center" align="center"
                       min-width="100" label="类型" />
      <el-table-column header-align="center" align="center"
                       min-width="100" label="体检内容">
        <template #default="scope">
                <span
                    :class="scope.row.hasCheckup ? 'link-blue' : 'link-red'"
                    @click="documentHandle(scope.row.id, scope.row.hasCheckup)">
                    {{ scope.row.hasCheckup ? '有文档' : '无文档' }}
                </span>
        </template>
      </el-table-column>
      <el-table-column prop="status" header-align="center" align="center"
                       min-width="80" label="状态">
        <template #default="scope">
          <el-switch v-model="scope.row.status" inline-prompt
                     style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949;"
                     active-text="上架" inactive-text="下架"
                     :disabled="!scope.row.hasCheckup"
                     @change="changeSwitchHandle(scope.row.id, scope.row.status)" />
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" width="150"
                       label="操作">
        <template #default="scope">
          <el-button type="text" :disabled="!scope.row.status"
                     @click="viewHandle(scope.row.id)">
            预览
          </el-button>
          <el-button type="text"
                     v-if="proxy.isAuth(['ROOT', 'GOODS:UPDATE'])"
                     :disabled="scope.row.status"
                     @click="updateHandle(scope.row.id)">
            修改
          </el-button>
          <el-button type="text"
                     v-if="proxy.isAuth(['ROOT', 'GOODS:DELETE'])"
                     :disabled="scope.row.salesVolume > 0 || scope.row.status"
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
                   layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>

  </div>


  <el-dialog :title="!goodsDialog.dataForm.id ? '新增' : '修改'"
             v-if="proxy.isAuth(['ROOT', 'GOODS:INSERT', 'GOODS:UPDATE'])"
             :close-on-click-modal="false" v-model="goodsDialog.visible"
             width="750px">
    <el-form :model="goodsDialog.dataForm" ref="dialogForm"
             :rules="goodsDialog.dataRule" label-width="80px">
      <el-form-item label="套餐名称" prop="title">
        <el-input v-model="goodsDialog.dataForm.title"
                  maxlength="50" clearable />
      </el-form-item>
      <el-form-item label="套餐编号" prop="code">
        <el-input v-model="goodsDialog.dataForm.code" maxlength="20"
                  clearable />
      </el-form-item>
      <el-form-item label="简介信息" prop="description">
        <el-input type="textarea"
                  v-model="goodsDialog.dataForm.description" :rows="4"
                  maxlength="200" clearable />
      </el-form-item>
      <el-form-item label="套餐原价" prop="initialPrice">
        <el-input v-model="goodsDialog.dataForm.initialPrice"
                  placeholder="输入原价" class="price" maxlength="20"
                  clearable>
          <template #append>
            元
          </template>
        </el-input>
        <span class="desc">提示：价格精确到分（小数点后两位）</span>
      </el-form-item>
      <el-form-item label="套餐现价" prop="currentPrice">
        <el-input v-model="goodsDialog.dataForm.currentPrice"
                  placeholder="输入现价" class="price" maxlength="20"
                  clearable>
          <template #append>
            元
          </template>
        </el-input>
        <span class="desc">提示：价格精确到分（小数点后两位）</span>
      </el-form-item>
      <el-form-item label="折扣列表">
        <el-select v-model="goodsDialog.dataForm.ruleId"
                   placeholder="选择折扣信息" clearable="clearable">
          <el-option :label="one.name" :value="one.id"
                     v-for="one in goodsDialog.ruleList" />
        </el-select>
      </el-form-item>
      <el-form-item label="封面图片" prop="image">
        <el-upload class="image-uploader"
                   :action="goodsDialog.upload.action"
                   :headers="goodsDialog.upload.headers"
                   :data="goodsDialog.upload.data" :show-file-list="false"
                   accept=".jpg,.jpeg" :on-success="imageUploadSuccess"
                   :before-upload="imageBeforeUpload"
                   :on-error="imageUploadError">
          <img v-if="goodsDialog.imageUrl"
               :src="goodsDialog.imageUrl" class="image" />
          <el-icon v-else class="image-uploader-icon">
            <Plus />
          </el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item label="套餐类别" prop="type">
        <el-select v-model="goodsDialog.dataForm.type"
                   placeholder="检查类别" clearable="clearable">
          <el-option label="父母体检" value="父母体检" />
          <el-option label="入职体检" value="入职体检" />
          <el-option label="职场白领" value="职场白领" />
          <el-option label="个人高端" value="个人高端" />
          <el-option label="中青年体检" value="中青年体检" />
        </el-select>
      </el-form-item>
      <el-form-item label="特征标签">
        <div class="tag-row">
          <el-input class="tag-input" v-model="goodsDialog.newTag"
                    @keyup.enter="enterTag" clearable />
          <span class="desc">提示：输入标签后按回车键</span>
        </div>
        <div class="tags">
          <el-tag v-for="one in goodsDialog.dataForm.tag" closable
                  :disable-transitions="false" @close="closeTag(one)">
            {{ one }}
          </el-tag>
        </div>
      </el-form-item>
      <el-form-item label="展示区" prop="partId">
        <el-select v-model="goodsDialog.dataForm.partId"
                   placeholder="选择展示区" clearable="clearable">
          <el-option label="活动专区" value="1" />
          <el-option label="热卖套餐" value="2" />
          <el-option label="新品推荐" value="3" />
          <el-option label="孝敬父母" value="4" />
          <el-option label="白领精英" value="5" />
        </el-select>
      </el-form-item>
      <el-form-item label="体检内容">
        <el-row :gutter="10" class="item-row"
                v-for="(one, $index) in goodsDialog.item" :key="$index">
          {{ i }}
          <el-col :span="6">
            <el-select v-model="one.type" placeholder="检查类别"
                       clearable="clearable">
              <el-option label="科室检查" value="科室检查" />
              <el-option label="实验室检查" value="实验室检查" />
              <el-option label="医技检查" value="医技检查" />
              <el-option label="其他检查" value="其他检查" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-input v-model="one.title" placeholder="体检项目"
                      maxlength="50" clearable />
          </el-col>
          <el-col :span="11">
            <el-input v-model="one.content" placeholder="体检内容"
                      maxlength="500" clearable />
          </el-col>
          <el-col :span="1">
            <el-button type="primary" :icon="Delete"
                       @click="deleteItem($index)" />
          </el-col>
        </el-row>
      </el-form-item>
    </el-form>
    <template #footer>
        <span class="dialog-footer">
            <el-button type="danger" @click="addItem">添加项目</el-button>
            <el-button @click="goodsDialog.visible=false">取消</el-button>
            <el-button type="primary"
                       @click="dataFormSubmit">确定</el-button>
        </span>
    </template>
  </el-dialog>


  <el-dialog title="提示信息"
             v-if="proxy.isAuth(['ROOT', 'GOODS:INSERT', 'GOODS:UPDATE'])"
             v-model="documentDialog.visible" width="350px">
    <div class="message-content">
      <el-icon :size="18" class="icon">
        <WarningFilled />
      </el-icon>
      <p>请您选择【上传】或者【下载】体检内容文档？如果未上传体检内容文档，则体检套餐将无法上架。</p>
    </div>
    <template #footer>
       <span class="document-dialog-footer">
           <el-upload :action="documentDialog.upload.action"
                      :data="documentDialog.data" :show-file-list="false"
                      :headers="documentDialog.upload.headers" accept=".xlsx"
                      :before-upload="documentBeforeUpload"
                      :on-success="documentUploadSuccess"
                      :on-error="documentUploadError">
               <el-button type="success" :icon="Upload"
                          class="uploadBtn">上传</el-button>
           </el-upload>
           <el-button type="primary" :icon="Download"
                      class="downloadBtn"
                      :disabled="!documentDialog.data.hasCheckup"
                      @click="documentDownloadHandle">
               下载
           </el-button>
       </span>
    </template>
  </el-dialog>
</template>

<style lang="less" scoped>
  @import url('goods.less');
</style>