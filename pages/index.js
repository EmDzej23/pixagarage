import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'
import Web3Modal from "web3modal"
import Image from 'next/image'
import WalletConnectProvider from "@walletconnect/web3-provider";

import {
  nftaddress, nftmarketaddress
} from '../config'

import Pixag from '../artifacts/contracts/Pixag.sol/Pixag.json'
import PixaGarage from '../artifacts/contracts/PixaGarage.sol/PixaGarage.json'
import ColorSpan, { compare } from './utils'
import Link from 'next/link'
import OpenseaLink from './opensealink'
import TagEl from './tag-element'
import Modal from 'react-modal';
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: "80%",
    overflow: "auto"
  },
};
let rpcEndpoint = null

if (process.env.NEXT_PUBLIC_WORKSPACE_URL) {
  rpcEndpoint = process.env.NEXT_PUBLIC_WORKSPACE_URL
}

export default function Home() {
  const [nfts, setNfts] = useState([])
  const [start, setStart] = useState(0);
  const [limit, setLimit] = useState(12);
  const router = useRouter();
  const [shouldLoad, setShouldLoad] = useState(true);
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [modalIsOpen, setIsOpen] = useState(false);
  const [loadingText, setLoadingText] = useState("Buying NFT...");
  useEffect(() => {
    loadNFTs()
  }, [])
  async function loadNFTs() {
    setLoadingState('loading')
    const provider = new ethers.providers.JsonRpcProvider("https://rpc-mainnet.maticvigil.com/")
    const tokenContract = new ethers.Contract(nftaddress, Pixag.abi, provider)
    const marketContract = new ethers.Contract(nftmarketaddress, PixaGarage.abi, provider)
    let data;
    const total = (await marketContract.getTotal()).toNumber();
    try {
      console.log(start, limit);
      data = await marketContract.fetchMarketItems(start, limit);
      if (data.length === 0) {
        setLoadingState('loaded')
        setShouldLoad(false);
        return;
      }
    }
    catch (e) {
      setShouldLoad(false);
      return;
    }
    const items = nfts;
    console.log(data);
    await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        itemId: i.itemId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        creator: i.creator,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
        isColor: i.assetColor,
        color: i.dominantColor,
        tokenId: i.tokenId,
        name2: i.name
      }
      items.push(item);
      return item
    }))
    items.sort(compare);
    setNfts(items)
    console.log(nfts);
    setStart(total - items[items.length - 1].itemId + 1);
    setLoadingState('loaded')
  }

  function openModal() {
    setIsOpen(true);
  }

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
  }

  function closeModal() {
    setIsOpen(false);
  }

  async function buyNft(nft) {
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
            137: "https://rpc-mainnet.maticvigil.com/"//137: "https://rpc-mainnet.maticvigil.com/"//"https://rpc-mainnet.maticvigil.com" // required
          }
        }
      }
    }
    const web3Modal = new Web3Modal({
      network: "matic",
      cacheProvider: true,
      providerOptions
    })
    openModal();
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(nftmarketaddress, PixaGarage.abi, signer)

    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
    const transaction = await contract.createMarketSale(nftaddress, nft.itemId, {
      value: price
    })
    setLoadingText("Waiting for transaction confirm...")
    await transaction.wait()
    closeModal();
    router.push('./my-assets');
  }
  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>)
  return (
    <div>
      <Modal
        ariaHideApp={false}
        isOpen={modalIsOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={(e) => { }}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <div className="flex justify-center">
          <h2>{loadingText}</h2><div className="lds-dual-ring"></div>
        </div>
      </Modal>
      <div className="flex justify-center">
        <div className="p-4">
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

                  <button className="w-full bg-green-500 text-white font-bold py-2 px-12 rounded" onClick={() => buyNft(nft)}>BUY</button>
                  <OpenseaLink link={{ nftaddress, tokenId: nft.tokenId }}></OpenseaLink>
                </div>
              ))
            }
          </div>
        </div>
      </div>
      {shouldLoad && loadingState !== 'loaded' ? <div>Loading...</div> : <div></div>}
      {shouldLoad && loadingState === 'loaded' ? <button onClick={() => { loadNFTs() }}>Load more</button> : <div></div>}
    </div>
  )
}
