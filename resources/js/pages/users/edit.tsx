import { Head, Link } from '@inertiajs/react';

import UserForm from '@/components/users/user-form';
//import users from '@/routes/users';

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

    branches: {
        id: number;
        name: string;
        code: string;
        is_primary: boolean;
    }[];

    roles: number[];
};

type Props = {
/*     currentTeam: {
        slug: string;
    }; */

    user: User;
    branches: Branch[];
    roles: Role[];
};

export default function Edit({
    //currentTeam,
    user,
    branches,
    roles,
}: Props) {
    return (
        <>
            <Head title="Editar usuario" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="rounded-xl border bg-card">
                    <div className="mb-6 flex items-center justify-between rounded-t-lg py-2 px-6 text-lg font-bold bg-blue-700 text-white">
                        <div>
                            <h1 className="text-2xl font-bold">
                                Editar usuario
                            </h1>
                            <p className="mt-1 text-sm text-white">
                                Editar {user.name}
                            </p>
                        </div>
                        <Link href={`/users`} className="rounded-md border px-4 py-2 text-sm">
                            Volver
                        </Link>
                    </div>
                    <div className="p-6">
                        <UserForm
                            user={user}
                            branches={branches}
                            roles={roles}
                            //currentTeam={currentTeam?.slug ?? ''}
                            mode="edit"
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
Edit.layout = () => ({
    breadcrumbs: [
        {
            title: 'Usuarios',
            href: '/users',
        },
        {
            title: 'Editar usuario',
            href: '#',
        },
    ],
});