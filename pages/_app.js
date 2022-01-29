import '../styles/globals.css'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3Modal from "web3modal"

function Marketplace({ Component, pageProps }) {
  const [isConnected, setConnected] = useState(false);
  useEffect(() => {
    const btn = document.querySelector("button.mobile-menu-button");
    const menu = document.querySelector(".mobile-menu");

    // Add Event Listeners
    btn.addEventListener("click", () => {
      menu.classList.toggle("hidden");
    });
    setConnected(window.localStorage.getItem("WEB3_CONNECT_CACHED_PROVIDER"))
  }, [])

  return (
    <div>
      <nav className="border-b center flex items-center justify-between flex-wrap bg-teal-500 p-6">

        <p className="text-4xl font-bold">PIXA GARAGE</p>

        <div className="mt-4 center desk">
          <Link href="/">
            <a href="#responsive-header" className="mr-4 text-green-500">
              GARAGE
            </a>
          </Link>
          <Link href="/create-item">
            <a href="#responsive-header" className="mr-6 text-green-500">
              Create PIXAG art now
            </a>
          </Link>
          <Link href="/my-assets">
            <a href="#responsive-header" className="mr-6 text-green-500">
              I OWN
            </a>
          </Link>
          <Link href="/creator-dashboard">
            <a href="#responsive-header" className="mr-6 text-green-500">
              I OFFER
            </a>
          </Link>
          <Link href="/sold-items">
            <a href="#responsive-header" className="mr-6 text-green-500">
              I SOLD
            </a>
          </Link>
          <Link href="/colors">
            <a href="#responsive-header" className="mr-6 text-green-500">
              BUY COLOR!
            </a>
          </Link>
          <Link href="/about">
            <a href="#responsive-header" className="mr-6 text-green-500">
              ABOUT
            </a>
          </Link>
        </div>
        <div className="mt-4 center">
          <button onClick={async () => {

            const providerOptions = {
              injected: {
                display: {
                  name: "Injected",
                  description: "Connect with the provider in your Browser"
                },
                package: null
              },
              // Example with WalletConnect provider
              walletconnect: {
                display: {
                  name: "Mobile",
                  description: "Scan qrcode with your mobile wallet"
                },
                package: WalletConnectProvider,
                options: {
                  rpc: {
                    137: "https://rpc-mainnet.maticvigil.com/" //137: "https://rpc-mainnet.maticvigil.com/" // required
                  }
                }
              }
            }
            const web3Modal = new Web3Modal({
              network: "matic",
              cacheProvider: true,
              providerOptions
            })
            if (typeof window !== "undefined" && isConnected) {
              web3Modal.clearCachedProvider();
              window.localStorage.removeItem("injected");
              window.localStorage.removeItem("walletconnect");
              window.localStorage.removeItem("WEB3_CONNECT_CACHED_PROVIDER");
              setConnected(window.localStorage.getItem("WEB3_CONNECT_CACHED_PROVIDER"))
            }
            else if (typeof window !== "undefined") {
              await web3Modal.connect()
              setConnected(window.localStorage.getItem("WEB3_CONNECT_CACHED_PROVIDER"))
            }

          }}>{isConnected ? 'DISCONNECT' : 'CONNECT'}</button></div>
        <div className="md:hidden flex items-center">
          <button className="outline-none mobile-menu-button">
            <svg
              className="w-6 h-6 text-gray-500"
              xlinkShow="!showMenu"
              fillRule="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
        <div className="hidden mobile-menu">
          <ul className="">
            <li className="active"><Link href="/">
              <a href="#responsive-header" className="mr-4 text-green-500 block py-2 pr-4 pl-3 text-white rounded md:bg-transparent md:text-blue-700 md:p-0 dark:text-white">
                GARAGE
            </a>
            </Link></li>
            <li><Link href="/create-item">
              <a href="#responsive-header" className="mr-6 text-green-500 block py-2 pr-4 pl-3 text-white rounded md:bg-transparent md:text-blue-700 md:p-0 dark:text-white">
                Create PIXAG art now
            </a>
            </Link></li>
            <li><Link href="/my-assets">
              <a href="#responsive-header" className="mr-6 text-green-500 block py-2 pr-4 pl-3 text-white rounded md:bg-transparent md:text-blue-700 md:p-0 dark:text-white">
                I OWN
            </a>
            </Link></li>
            <li><Link href="/creator-dashboard">
              <a href="#responsive-header" className="mr-6 text-green-500 block py-2 pr-4 pl-3 text-white rounded md:bg-transparent md:text-blue-700 md:p-0 dark:text-white">
                I OFFER
            </a>
            </Link></li>
            <li><Link href="/sold-items">
              <a href="#responsive-header" className="mr-6 text-green-500 block py-2 pr-4 pl-3 text-white rounded md:bg-transparent md:text-blue-700 md:p-0 dark:text-white">
                I SOLD
            </a>
            </Link></li>
            <li><Link href="/colors">
              <a href="#responsive-header" className="mr-6 text-green-500">
                BUY COLOR!
            </a>
            </Link></li>
            <li><Link href="/about">
              <a href="#responsive-header" className="mr-6 text-green-500">
                ABOUT
            </a>
            </Link></li>
          </ul>
        </div>
      </nav>
      <div className="center"><Component {...pageProps} /></div>
    </div>
  )
}

export default Marketplace