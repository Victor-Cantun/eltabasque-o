import { Link } from '@inertiajs/react';
import { BookOpen, FolderGit2, LayoutGrid, Bike, House, User, Notebook, FolderKey, ShoppingCart } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import branches from '@/routes/branches';
import mechanics from '@/routes/mechanics';
import products from '@/routes/products';
import users from '@/routes/users';
import roles from '@/routes/roles';
import permissionsRoutes from '@/routes/permissions';
import type { NavItem } from '@/types';

const branchesUrl = branches.index();
const mechanicsUrl = mechanics.index();
const productsUrl = products.index();
const usersUrl = users.index();
const rolesUrl = roles.index();
const permissionsUrl = permissionsRoutes.index();
/*Código para permisos*/

import { usePage } from '@inertiajs/react';
import { can } from '@/lib/permissions';

/*Código para permisos*/

export function AppSidebar() {
    const { auth } = usePage().props;
    const userPermissions = auth.permissions??[];
    
    //console.log("permisos",userPermissions);
    
    const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },

    /* {title: 'Inventario',href: '/inventory',icon: LayoutGrid,},
    {title: 'Sucursales',href: branchesUrl,icon: House,},
    {title: 'Productos',href: productsUrl,icon: Bike,},
    {title: 'Roles',href: rolesUrl,icon: Notebook,},
    {title: 'Permisos',href: permissionsUrl,icon: FolderKey,},
    {title: 'Usuarios',href: usersUrl,icon: User,}, 
    ]*/
    ...(can(userPermissions, 'sales.view')
        ? [{ title: 'Ventas (POS)', href: '/sales', icon: ShoppingCart }]
        : []),
    ...(can(userPermissions, 'inventory.view')
        ? [{title: 'Inventario',href: '/inventory',icon: LayoutGrid,}]
        : []),   
    ...(can(userPermissions, 'branches.view')
        ? [{title: 'Sucursales',href: branchesUrl,icon: House,}]
        : []),
    ...(can(userPermissions, 'mechanics.view')
        ? [{title: 'Mecánicos',href: mechanicsUrl,icon: User,}]
        : []),        
    ...(can(userPermissions, 'products.view')
        ?[{title: 'Productos',href: productsUrl,icon: Bike,}]
        : []), 
    ...(can(userPermissions, 'roles.view')
        ?[{title: 'Roles',href: rolesUrl,icon: Notebook,}]
        : []), 
    ...(can(userPermissions, 'permissions.view')
        ?[{title: 'Permisos',href: permissionsUrl,icon: FolderKey,}]
        : []), 
    ...(can(userPermissions, 'users.view')
        ?[{title: 'Usuarios',href: usersUrl,icon: User,}]
        : []),          
    ];
    
    const footerNavItems: NavItem[] = [
        /* {
            title: 'Repository',
            href: 'https://github.com/laravel/react-starter-kit',
            icon: FolderGit2,
        },
        {
            title: 'Documentation',
            href: 'https://laravel.com/docs/starter-kits#react',
            icon: BookOpen,
        }, */
    ];
    

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
