import '../styles/globals.css'
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { ThemeProvider } from 'next-themes';
import type { AppProps } from 'next/app'
import network from '../utils/network';
import Layout from '../components/Layout';
import { ethers } from "ethers";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute='class'>
        <ThirdwebProvider 
          //desiredChainId={network} 
          activeChain="goerli"
          clientId="7284d41b4cf0c407d329f1bee1db28f1"//{process.env.CLIENT_ID} 
          secretKey={process.env.SECRET_KEY}
          //signer={new ethers.providers.Web3Provider(window.ethereum).getSigner()} 
        >
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ThirdwebProvider>
    </ThemeProvider>
  )
}

export default MyApp
