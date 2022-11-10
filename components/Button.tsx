import React from 'react'
//import { MoonIcon } from '@heroicons/react/24/solid';

type Props = {
    children: any,
    className: any,
    onClick: any
}

function Button({ children, className, onClick}: Props) {
    return (
        <button
            onClick={onClick}
            className={` p-2 rounded-md hover:ring-2 hover:ring-gray-300 ${className}`}
        >
            {children}
        </button>
    )
}

export default Button