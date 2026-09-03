import { Head } from '@inertiajs/react';

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

            <div className="mx-auto max-w-3xl p-6">
                <h1 className="mb-6 text-2xl font-bold">
                    Editar usuario
                </h1>

               <UserForm
                    user={user}
                    branches={branches}
                    roles={roles}
                    //currentTeam={currentTeam?.slug ?? ''}
                    mode="edit"
                />
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