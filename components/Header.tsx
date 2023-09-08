import React, { useState, useEffect } from 'react'
import { useAddress, useDisconnect, useMetamask, useChainId } from "@thirdweb-dev/react"
import Link from 'next/link';
import {
    BellIcon,
    ShoppingCartIcon,
    ChevronDownIcon,
    MagnifyingGlassIcon,
} from "@heroicons/react/24/outline"
import Image from 'next/image';
import { useTheme } from "next-themes" 
import Button from './Button';
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid';

type Props = {}

function Header({}: Props) {

    const { systemTheme, theme , setTheme } = useTheme();
    const [ mounted, setMounted ] = useState(false);

    useEffect(() => {
        setMounted(true)
    }, []);
    
    const renderThemeChanger = () => {
        if(!mounted) return null;

        const currentTheme = theme === "system" ? systemTheme : theme;

        if (currentTheme === 'dark') {
            return (
                <Button className='bg-gray-200 dark:bg-[#ffffff]/20' onClick={() => setTheme('light')}>
                    <SunIcon className='w-4 h-4'/>
                </Button>
            )
        } else {
            return (
                <Button className='bg-gray-200' onClick={() => setTheme('dark')}>
                    <MoonIcon className='w-4 h-4' />
                </Button>
            )
        }
    }
    const chainId = useChainId();
    const connectWithMetamask = useMetamask();
    const disconnect = useDisconnect();
    const address = useAddress();

    return (
        <div className='max-w-6xl mx-auto p-2'>
            <nav className="flex justify-between">
                <div className="flex hover:scale-[1.05] items-center space-x-2 text-sm">
                    {address ? 
                    (
                        <button onClick={disconnect}className="connectWalletBtn">
                            Hi, {address.slice(0, 4) + "..." + address.slice(-4)}
                        </button>
                    )
                    :
                    (
                        <button onClick={()=>connectWithMetamask({chainId: chainId})} className="connectWalletBtn"> 
                            Connect your wallet 
                        </button>
                    )
                    }

                    <p className="headerLink" >Daily Deals</p>
                    <p className="headerLink" >Help & Contact</p>
                </div>
                {renderThemeChanger()}
                <div className='flex items-center space-x-4 text-sm'>
                    <p className='headerLink'>Ship to</p>
                    <p className='headerLink'>Sell</p>
                    <p className='headerLink'>WatchList</p>

                    <Link href="/addItem" className='flex items-center dark:text-[#f1f1f1] hover:link'>
                        Add to Inventory
                        <ChevronDownIcon className='h-4' />
                    </Link>

                    <BellIcon className='h-6 w-6'/>
                    <ShoppingCartIcon className='h-6 w-6'/>
                </div>
            </nav>

            <hr className='mt-2 h-px bg-gray-200 dark:bg-gray-700 rounded'/>

            <section className='flex items-center space-x-2 py-5'>
                <div className='h-16 w-16 sm:w-28 md:w-44 cursor-pointer
                    flex-shrink-0'>
                    <Link href="/">
                        <Image
                            className='h-full w-full object-contain'
                            alt='Thirdweb Logo'
                            src='https://links.papareact.com/bdb'
                            width={100}
                            height={100}
                        />
                    </Link>
                </div>

                <button className='hidden lg:flex items-center space-x-2 w-20'>
                    <p className='text-gray-600 text-sm dark:text-[#aaaaaa]'>Shop by Category</p>
                    <ChevronDownIcon className='h-4 flex-shrink-0'/>
                </button>

                <div className='flex items-center space-x-2 px-2 md:px-5 py-2
                    border-black border-2 flex-1  dark:border-[#ffffff]/20'>
                    <MagnifyingGlassIcon className='w-5 text-gray-400' />
                    <input className='flex-1 outline-none dark:bg-transparent dark:text-[#f1f1f1]' placeholder='Search for Anything' type='text'/>
                </div>

                <button className='hidden sm:inline bg-blue-600 text-white px-5
                    md:px-10 py-2 border-2 border-blue-600  dark:text-[#f1f1f1]'>
                    Search
                </button>

                <Link href='/create'>
                    <button className='border-2 border-blue-600  px-2 xs:px-5 md:px-10 xs:py-2 text-blue-600 flex-shrink
                        hover:bg-blue-600/50 hover:text-white'>
                        List Item
                    </button>
                </Link>
            </section>

            <hr className='h-px bg-gray-200 dark:bg-gray-700 rounded' />

            <section className='flex py-3 space-x-6 text-xs md:text-sm whitespace-nowrap
                justify-center px-6'>
                <p className='link'>Home</p>
                <p className='link'>Electronics</p>
                <p className='link'>Computers</p>
                <p className='link hidden sm:inline'>Video Games</p>
                <p className='link hidden sm:inline'>Home & Garden</p>
                <p className='link hidden md:inline'>Health & Beauty</p>
                <p className='link hidden lg:inline'>Collectibles & Art</p>
                <p className='link hidden lg:inline'>Books</p>
                <p className='link hidden lg:inline'>Music</p>
                <p className='link hidden xl:inline'>Deals</p>
                <p className='link hidden xl:inline'>Other</p>
                <p className='link'>More</p>
            </section>
        </div>
    );
}

export default Header