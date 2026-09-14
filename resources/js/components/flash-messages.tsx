import { usePage } from '@inertiajs/react';
import { SharedData } from '@/types';
import { useEffect, useState } from 'react';

export function FlashMessage() {
    const { flash } = usePage<SharedData>().props;
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        setVisible(true);
        const timeout = setTimeout(() => setVisible(false), 5000);
        return () => clearTimeout(timeout);
    }, [flash.success, flash.error]);

    if (!visible) return null;

    return (
        <>
            {flash.success && (
                <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
                    {flash.success}
                </div>
            )}
            {flash.error && (
                <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                    {flash.error}
                </div>
            )}
        </>
    );
}