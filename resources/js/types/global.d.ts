import type { Auth } from '@/types/auth';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
    interface PageProps extends SharedData{}
}
/* declare module '@inertiajs/core' {
   
} */
export interface SharedData{
    [key: string]:unknown;
    flash:{
        success?:string;
        error?:string;
    };
}