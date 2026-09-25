import {Head, Link} from '@inertiajs/react';
import { Eye, Pencil, Trash } from 'lucide-react';
type Supplier = {
    id:number;
    business_name:string;
    contact_name:string;
    phone:string;
    email:string;
    address:string;
    rfc:string;
    active:boolean;
}
type Props = {
    suppliers:Supplier[];
}
export default function Index({suppliers}:Props){
    return (
        <>
            <Head title="Proveedores" />
                <div className="flex flex-1 flex-col gap-4 p-4">
                    {/* Encabezado */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">
                                Proveedores
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Administración de los proveedores
                            </p>
                        </div>
                        <Link href={`/suppliers/create`} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
                            + Nuevo proveedor
                        </Link>
                    </div>
                {/* Tabla */}
                <div className="overflow-hidden rounded-xl border">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-blue-800 text-white">
                                <tr>
                                    <th className="px-4 py-3 text-left">
                                        Proveedor
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Contácto
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Teléfono
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Correo
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Dirección
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        RFC
                                    </th>                                    
                                    <th className="px-4 py-3 text-center">
                                        Estado
                                    </th>
                                    <th className="px-4 py-3 text-right">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {suppliers.map((supplier) => (
                                    <tr key={supplier.id} className="border-b last:border-0 hover:bg-muted/30">
                                        {/* Proverdor */}
                                        <td className="px-4 py-3">
                                            <div className="font-medium">
                                                {supplier.business_name}
                                            </div>
                                        </td>
                                        {/* Contácto */}
                                        <td className="px-4 py-3 font-mono">
                                            {supplier.contact_name}
                                        </td>
                                        {/* Phone */}
                                        <td className="px-4 py-3 font-mono">
                                            {supplier.phone}
                                        </td>
                                        {/* Email */}
                                        <td className="px-4 py-3">
                                            {supplier.email ?? '—'}
                                        </td>
                                        {/* Domicilio */}
                                        <td className="px-4 py-3">
                                            {supplier.address ?? '—'}
                                        </td>
                                        {/* RFC */}
                                        <td className="px-4 py-3 text-center">
                                            {supplier.rfc}
                                        </td>
                                        {/* Estado */}
                                        <td className="px-4 py-3 text-center">
                                            {supplier.active ? (
                                                <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700">
                                                    Activa
                                                </span>
                                            ) : (
                                                <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium bg-red-100 text-red-700">
                                                    Inactiva
                                                </span>
                                            )}
                                        </td>
                                        {/* Acciones */}
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <Link className="hover:cursor-pointer hover:bg-blue-300 rounded-md border px-3 py-1.5 text-xs">
                                                    <Pencil className="h-4 w-4 text-blue-800" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    className={`rounded-md px-3 py-1.5 text-xs ${
                                                        supplier.active
                                                            ? 'border border-red-200 text-red-600 hover:bg-red-50'
                                                            : 'border border-green-200 text-green-600 hover:bg-green-50'
                                                    }`}
                                                >
                                                    {supplier.active
                                                        ? 'Desactivar'
                                                        : 'Activar'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {/* Sin resultados */}
                                {suppliers.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center">
                                            <div className="text-muted-foreground">
                                                No se encontraron
                                                sucursales.
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>                    
            </div>
        </>
    )
}