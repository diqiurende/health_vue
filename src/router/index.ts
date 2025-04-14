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
            }
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
            }
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
