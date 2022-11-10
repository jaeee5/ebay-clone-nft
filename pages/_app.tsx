import '../styles/globals.css'
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { ThemeProvider } from 'next-themes';
import type { AppProps } from 'next/app'
import network from '../utils/network';
import Layout from '../components/Layout';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute='class'>
        <ThirdwebProvider desiredChainId={network}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ThirdwebProvider>
    </ThemeProvider>
  )
}

export default MyApp
