import { Head, Link, router } from '@inertiajs/react';
import users from '@/routes/users';
import { Eye, Pencil, Trash, Power, PowerOff } from 'lucide-react';
type Branch = {
    id: number;
    name: string;
    code: string;
};

type Role = {
    id: number;
    name: string;
    slug: string;
};

type User = {
    id: number;
    name: string;
    email: string;
    is_active:boolean;
    branches: Branch[];
    roles: Role[];
};

type Props = {
/*     currentTeam: {
        slug: string;
    }; */

    users: {
        data: User[];
    };
};

export default function Index({
    //currentTeam,
    users: usersData,
}: Props) {
    return (
        <>
            <Head title="Usuarios" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Usuarios
                        </h1>

                        <p className="text-sm text-gray-500">
                            Administración de empleados y accesos.
                        </p>
                    </div>

                    <Link
                        href={`/users/create`}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                    >
                      +  Nuevo usuario
                    </Link>
                </div>

                <div className="overflow-hidden rounded-lg border">
                    <table className="w-full">
                        <thead className="border-b bg-blue-800 text-white">
                            <tr className="border-b text-left">
                                <th className="p-3">
                                    Nombre
                                </th>

                                <th className="p-3">
                                    Correo
                                </th>

                                <th className="p-3">
                                    Sucursales
                                </th>

                                <th className="p-3">
                                    Roles
                                </th>

                                <th className="p-3">
                                    Estado
                                </th>

                                <th className="p-3 text-right">
                                    Acciones
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {usersData.data.map((user) => (
                                <tr
                                    key={user.id}
                                    className="border-b"
                                >
                                    <td className="p-3">
                                        {user.name}
                                    </td>

                                    <td className="p-3">
                                        {user.email}
                                    </td>

                                    <td className="p-3">
                                        <div className="flex flex-wrap gap-1">
                                            {user.branches.map(
                                                (branch) => (
                                                    <span
                                                        key={branch.id}
                                                        className="rounded  px-2 py-1 text-xs"
                                                    >
                                                        {branch.name}
                                                    </span>
                                                ),
                                            )}
                                        </div>
                                    </td>

                                    <td className="p-3">
                                        <div className="flex flex-wrap gap-1">
                                            {user.roles.map(
                                                (role) => (
                                                    <span
                                                        key={role.id}
                                                        className="rounded px-2 py-1 text-xs"
                                                    >
                                                        {role.name}
                                                    </span>
                                                ),
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                                                user.is_active
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}
                                        >
                                            {user.is_active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>  
                                    <td className="p-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/users/${user.id}/edit`} className="hover:cursor-pointer hover:bg-blue-300 rounded-md border px-3 py-1.5 text-xs">
                                                <Pencil className="h-4 w-4 text-blue-800" />
                                            </Link>

                                            <button
                                                onClick={() => {
                                                    if (confirm(user.is_active ? '¿Desactivar este usuario?' : '¿Activar este usuario?')) {
                                                        router.patch(`/users/${user.id}/toggle-status`, {}, { preserveScroll: true });
                                                    }
                                                }}
                                                className={`rounded-md border px-3 py-1.5 text-xs hover:cursor-pointer ${
                                                    user.is_active ? 'hover:bg-red-100' : 'hover:bg-green-100'
                                                }`}
                                            >
                                                {user.is_active ? (
                                                    <PowerOff className="h-4 w-4 text-red-600" />
                                                ) : (
                                                    <Power className="h-4 w-4 text-green-600" />
                                                )}
                                            </button>
                                        </div>
                                    </td>                                                                      

                                    {/* <td className="p-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/users/${user.id}/edit`} className="hover:cursor-pointer hover:bg-blue-300 rounded-md border px-3 py-1.5 text-xs">
                                                <Pencil className="h-4 w-4 text-blue-800" />
                                            </Link>                                         
                                        </div>
                                    </td> */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}