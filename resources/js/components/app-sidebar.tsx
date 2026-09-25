import { Link } from '@inertiajs/react';
import { BookOpen, FolderGit2, LayoutGrid, Bike, House, User, Notebook, FolderKey, ShoppingCart, Boxes, Split } from 'lucide-react';
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
//import { dashboard } from '@/routes';
import { dashboard } from '@/routes';
import sales from '@/routes/sales';
import inventory from '@/routes/inventory';
import suppliers from '@/routes/suppliers';
import branches from '@/routes/branches';
import mechanics from '@/routes/mechanics';
import products from '@/routes/products';
import users from '@/routes/users';
import roles from '@/routes/roles';
import permissionsRoutes from '@/routes/permissions';
import type { NavItem } from '@/types';

const dashboardUrl = dashboard()
const salesUrl = sales.index();
const inventoryUrl = inventory.index();
const suppliersUrl = suppliers.index();
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
        
    const mainNavItems: NavItem[] = [
    ...(can(userPermissions, 'dashboard.view')
        ? [{title: 'Dashboard',href: dashboardUrl,icon: LayoutGrid,}]
        : []),
    ...(can(userPermissions, 'sales.view')
        ? [{ title: 'Ventas (POS)', href: salesUrl, icon: ShoppingCart }]
        : []),
    ...(can(userPermissions, 'inventory.view')
        ? [{title: 'Inventario',href: inventoryUrl,icon: Boxes,}]
        : []),
/*     ...(can(userPermissions, 'inventory-movements.view')
        ? [{title: 'Movimientos',href: '/inventory-movements',icon: Split,}]
        : []),  */  
        {title: 'Proveedores',href: suppliersUrl,icon: User,},         
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
                            <Link href={dashboardUrl} prefetch>
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
