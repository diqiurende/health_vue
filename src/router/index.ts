import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
const history = createWebHistory();
const routes : Array<RouteRecordRaw> = [
    {
        path: '/front',
        name: 'Front',
        component: () => import('../views/front/main.vue'),
        children: [
            {
                path: 'index',
                name: 'FrontIndex',
                component: () => import('../views/front/index.vue')
            },
            {
                path: 'goods/:id',//需传入商品的id访问
                name: 'FrontGoods',
                component: () => import('../views/front/goods.vue')
            },
            {
                path: 'goods_list',
                name: 'FrontGoodsList',
                component: () => import('../views/front/goods_list.vue')
            },
            {
                path: 'customer',
                name: 'FrontCustomer',
                component: () => import('../views/front/customer.vue'),
                children: [

                ]
            },
            {
                path: 'customer',
                name: 'FrontCustomer',
                component: () => import('../views/front/customer.vue'),
                children: [
                    {
                        path: 'mine',
                        name: 'FrontMine',
                        component: () => import('../views/front/mine.vue')
                    },
                    {
                        path: 'order_list',
                        name: 'FrontOrderList',
                        component: () => import('../views/front/order_list.vue')
                    },
                    {
                        path: 'appointment_list',
                        name: 'FrontAppointmentList',
                        component: () => import('../views/front/appointment_list.vue')
                    }
                ]
            },
            {
                path: 'goods_snapshot/:id/:mode',
                name: 'FrontGoodsSnapshot',
                component: () => import('../views/front/goods_snapshot.vue')
            },
        ]
    },

    {
        path: '/mis',
        name: 'Main',
        component: () => import('../views/mis/main.vue'),
        children: [
            {
                path: 'home',
                name: 'MisHome',
                component: () => import('../views/mis/home.vue'),
                meta: {
                    title: '首页'
                }
            },
            {
                path: 'dept',
                name: 'MisDept',
                component: () => import('../views/mis/dept.vue'),
                meta: {
                    title: '部门管理',
                    isTab: true

                }
            },
            {
                path: 'role',
                name: 'MisRole',
                component: () => import('../views/mis/role.vue'),
                meta: {
                    title: '角色管理',
                    isTab: true
                }
            },
            {
                path: 'user',
                name: 'MisUser',
                component: () => import('../views/mis/user.vue'),
                meta: {
                    title: '用户管理',
                    isTab: true
                }
            },
            {
                path:'goods',
                name:'MisGoods',
                component: () => import('../views/mis/goods.vue'),
                meta: {
                    title: '体检套餐',
                    isTab: true
                }
            },
            {
                path: 'order',
                name: 'MisOrder',
                component: () => import('../views/mis/order.vue'),
                meta: {
                    title: '订单管理',
                    isTab: true
                }
            },
            {
                path: 'rule',
                name: 'MisRule',
                component: () => import('../views/mis/rule.vue'),
                meta: {
                    title: '促销规则',
                    isTab: true
                }
            },
            {
                path: 'appointment',
                name: 'MisAppointment',
                component: () => import('../views/mis/appointment.vue'),
                meta: {
                    title: '体检预约',
                    isTab: true
                }
            },
            {
                path: 'customer_checkin',
                name: 'MisCustomerCheckin',
                component: () => import('../views/mis/customer_checkin.vue'),
                meta: {
                    title: '体检签到',
                    isTab: true
                }
            },
            {
                path: 'checkup',
                name: 'MisDoctorCheckup',
                component: () => import('../views/mis/doctor_checkup.vue'),
                meta: {
                    title: '医生检查',
                    isTab: true
                }
            },
            {
                path: 'checkup_report',
                name: 'MisCheckupReport',
                component: () => import('../views/mis/checkup_report.vue'),
                meta: {
                    title: '体检报告',
                    isTab: true
                }
            },
            {
                path: 'chat',
                name: 'MisChat',
                component: () => import('../views/mis/ChatPanel.vue'),
                meta: {
                    title: '医疗AI机器人',
                    isTab: true
                }
            },
        ]
    },
    {
        path: '/mis/login',
        name: 'MisLogin',
        component: () => import('../views/mis/login.vue')
    },
    {
        path: '/404',
        name: '404',
        component: () => import('../views/404.vue')
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/404'
    }
];
const router = createRouter({
    history,
    routes
});


//全局前置导航守卫，当每次切换路由时，这个函数都会执行
// router.beforeEach((to, from, next) => {
//     let permissions = localStorage.getItem('permissions');
//     let token = localStorage.getItem('token');
//     let fullPath = to.fullPath;
//     if (fullPath.startsWith('/mis') && fullPath != '/mis/login') {
//         if (permissions == null || permissions == '' || token == null || token == '') {
//             next({ name: 'MisLogin' });
//         } else {
//             return next();
//         }
//     } else if (fullPath.startsWith('/front/customer') || fullPath.startsWith('/front/goods_snapshot')) {
//         if (token == null || token == '') {
//             next({ name: 'FrontIndex' });
//         } else {
//             return next();
//         }
//         //不需要登陆的页面 直接跳转
//     } else {
//         return next();
//     }
// });

export default router;
