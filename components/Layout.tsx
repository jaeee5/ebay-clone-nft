import Head from 'next/head'
import React from 'react'
import Header from './Header'

type Props = {
    children: any
}

function Layout({children}: Props) {
    return (
        <>
            <Head>
                <title>
                    Ebay Clone - NFT
                </title>
            </Head>
            <div>
                <Header />
                <main>
                    {children}
                </main>
            </div>
        </>
    )
}

export default Layout