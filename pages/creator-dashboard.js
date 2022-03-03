import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"
import Image from 'next/image'
import WalletConnectProvider from "@walletconnect/web3-provider";
import TagEl from "./tag-element";



import {
  nftmarketaddress, nftaddress
} from '../config'

import PixaGarage from '../artifacts/contracts/PixaGarage.sol/PixaGarage.json'
import Pixag from '../artifacts/contracts/Pixag.sol/Pixag.json'
import ColorSpan, { compare } from './utils'
import OpenseaLink from './opensealink'

export default function CreatorDashboard() {
  const [nfts, setNfts] = useState([])
  const [start, setStart] = useState(0);
  const [limit, setLimit] = useState(10);
  const [shouldLoad, setShouldLoad] = useState(true);
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    loadNFTs(start, limit)
  }, [])
  async function loadNFTs(start, limit) {
    if (!window.localStorage.getItem("WEB3_CONNECT_CACHED_PROVIDER")) {
      alert("Please press CONNECT to connect to your wallet!");
      return;
    }
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
            137: "https://polygon-rpc.com/"//137: "https://polygon-rpc.com/" // required
          }
        }
      }
    }
    const web3Modal = new Web3Modal({
      network: "matic",
      cacheProvider: true,
      providerOptions
    })
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const marketContract = new ethers.Contract(nftmarketaddress, PixaGarage.abi, signer)
    const tokenContract = new ethers.Contract(nftaddress, Pixag.abi, provider)
    let data;
    const total = (await marketContract.getTotal()).toNumber();
    try {
      data = await marketContract.fetchItemsForSell(start, limit)
    }
    catch (e) {
      setShouldLoad(false);
      return;
    }
    if (data.length === 0) {
      setLoadingState('loaded')
      setShouldLoad(false);
      return;
    }
    const items = nfts;
    await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        sold: i.sold,
        image: meta.data.image,
        itemId: i.itemId.toNumber(),
        name: meta.data.name,
        description: meta.data.description,
        isColor: i.assetColor,
        color: i.dominantColor
      }
      items.push(item);
      return item
    }))
    items.sort(compare);
    setNfts(items)
    setLoadingState('loaded')
    setStart(total - items[items.length - 1].itemId + 1);
  }
  debugger;
  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">No assets offered</h1>)

  return (
    <div>
      <div className="flex justify-center">
        <div className="p-4">
          <h2 className="text-2xl py-2">Items Offered</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {
              nfts.map((nft, i) => (
                <div key={i} className="border shadow rounded-xl overflow-hidden">
                  <Image width="100%" height="100%" layout="responsive" objectFit="contain" alt="" src={nft.image} className="rounded" />
                  <div className="p-4">
                    <TagEl details={{ text: nft.name, class: 'bg-white-500 w-full' }}></TagEl>
                    <ColorSpan nft={nft}></ColorSpan>
                    <TagEl details={{ text: nft.price + ' MATIC', class: 'bg-blue text-green-600' }}></TagEl>
                    {Boolean(nft.isColor) && (<TagEl details={{ text: 'COLOR', class: 'bg-blue text-green-600' }}></TagEl>)}
                  </div>
                </div>
              ))
            }
          </div>
        </div>
        <br></br>

      </div>
      {shouldLoad ? <button onClick={() => { loadNFTs(start, limit) }}>Load more</button> : <div></div>}
    </div>
  )
}