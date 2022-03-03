import { ethers } from 'ethers'
import { useEffect, useState, } from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"
import Image from 'next/image'
import { useRouter } from 'next/router'
import WalletConnectProvider from "@walletconnect/web3-provider";

import {
  nftmarketaddress, nftaddress
} from '../config'

import PixaGarage from '../artifacts/contracts/PixaGarage.sol/PixaGarage.json'
import Pixag from '../artifacts/contracts/Pixag.sol/Pixag.json'
import ColorSpan, { compare } from './utils'
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

export default function MyAssets() {
  const router = useRouter();
  const [initialized, setInitialized] = useState(false);
  const [nfts, setNfts] = useState([])
  const [colors, setSoldColors] = useState([])
  const [start, setStart] = useState(0);
  const [limit, setLimit] = useState(10);
  const [shouldLoad, setShouldLoad] = useState(true);
  const [shouldColorLoad, setShouldColorLoad] = useState(true);
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [modalIsOpen, setIsOpen] = useState(false);
  if (typeof window !== "undefined" && !initialized) {
    setInitialized(true);
    window.cstart = 0;
    window.climit = 10;
    window.filterColor = "";
  }
  useEffect(() => {
    loadNFTs()
  }, [])
  // async function putOnSale(nft) {
  //   if (!window.localStorage.getItem("WEB3_CONNECT_CACHED_PROVIDER")) {
  //     alert("Please press CONNECT to connect to your wallet!");
  //     return;
  //   }
  //   const providerOptions = {
  //     injected: {
  //       display: {
  //         name: "Injected",
  //         description: "Connect with the provider in your Browser"
  //       },
  //       package: null
  //     },
  //     // Example with WalletConnect provider
  //     walletconnect: {
  //       display: {
  //         name: "Mobile",
  //         description: "Scan qrcode with your mobile wallet"
  //       },
  //       package: WalletConnectProvider,
  //       options: {
  //         rpc: {
  //           137: "https://rpc-mainnet.maticvigil.com" // required
  //         }
  //       }
  //     }
  //   }

  //   const web3Modal = new Web3Modal({
  //     network: "matic",
  //     cacheProvider: true,
  //     providerOptions
  //   })
  //   const connection = await web3Modal.connect()
  //   const provider = new ethers.providers.Web3Provider(connection)
  //   const signer = provider.getSigner()
  //   const price = ethers.utils.parseUnits("0.00001", 'ether')
  //   const contract = new ethers.Contract(nftmarketaddress, PixaGarage.abi, signer)
  //   let listingPrice = await contract.getListingPrice()
  //   listingPrice = listingPrice.toString()
  //   console.log(nft);
  //   const transaction = await contract.putItemToResell(nftaddress, nft.itemId.toNumber(), price, { value: listingPrice })
  //   await transaction.wait()
  //   router.push('./')
  // }
  function openModal() {
    setIsOpen(true);
  }

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
  }

  function closeModal() {
    setIsOpen(false);
  }
  async function GetSold(color) {
    if (color !== window.filterColor) {
      window.cstart = 0;
      setSoldColors([]);
      window.filterColor = color;
    }

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
    if (!modalIsOpen) openModal();
    const total = (await marketContract.getTotal()).toNumber();
    try {
      data = await marketContract.fetchSoldItemsByColor(window.cstart, window.climit, window.filterColor)
      if (data.length === 0) {
        setShouldColorLoad(false);
        return;
      }
    }
    catch (e) {
      setShouldColorLoad(false);
      console.log(e);
      return;
    }
    const items = colors;
    await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      console.log(i);
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        itemId: i.itemId.toNumber(),
        name: meta.data.name,
        description: meta.data.description,
        isColor: i.assetColor,
        color: i.dominantColor,
        percent: price / 10,
        sold: i.sold
      }
      items.push(item);
      return item
    }))
    items.sort(compare);
    setSoldColors(items)
    window.cstart = total - items[items.length - 1].itemId + 1;
  }
  async function loadNFTs() {
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
      data = await marketContract.fetchMyNFTs(start, limit)
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
    await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        itemId: i.itemId.toNumber(),
        name: meta.data.name,
        description: meta.data.description,
        isColor: i.assetColor,
        color: i.dominantColor,
        sold: i.sold
      }
      items.push(item);
      return item
    }))

    items.sort(compare);
    setNfts(items)
    console.log(items);
    setLoadingState('loaded')
    setStart(total - items[items.length - 1].itemId + 1);
  }
  if (loadingState === 'loaded' && nfts.length === 0) return (<h1 className="py-10 px-20 text-3xl">No assets owned</h1>)
  return (
    <div>
      <Modal
        ariaHideApp={false}
        isOpen={modalIsOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Example Modal"
      >
        {Boolean(colors.length === 0) && (<h1>No items yet</h1>)}
        {Boolean(colors.length > 0) && (<div><h1>Items matching your color:</h1>
          <div className="flex justify-center">
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                {
                  colors.map((nft, i) => (
                    <div key={i} className="border shadow rounded-xl overflow-hidden">
                      <Image width="100%" height="100%" layout="responsive" objectFit="contain" alt="" src={nft.image} className="rounded" />
                      <div className="p-4">
                        <TagEl details={{ text: nft.name, class: 'bg-white-500 w-full' }}></TagEl>
                        <ColorSpan nft={nft}></ColorSpan>
                        <TagEl details={{ text: nft.price + ' MATIC', class: 'bg-blue text-green-600' }}></TagEl>
                        {Boolean(nft.isColor) && (<TagEl details={{ text: 'COLOR', class: 'bg-blue text-green-600' }}></TagEl>)}
                        {Boolean(nft.sold) && (<TagEl details={{ text: 'Your cut: ' + nft.percent + ' MATIC', class: 'bg-blue text-green-600' }}></TagEl>)}
                        {Boolean(!nft.sold) && (<TagEl details={{ text: 'Your cut will be: ' + nft.percent + ' MATIC', class: 'bg-blue text-green-600' }}></TagEl>)}
                      </div>
                      <OpenseaLink link={{ nftaddress, tokenId: nft.tokenId }}></OpenseaLink>
                    </div>

                  ))
                }
              </div>
            </div>
          </div>
          {shouldColorLoad ? <button onClick={() => { GetSold(window.filterColor) }}>Load more</button> : <div></div>}
        </div>)}
      </Modal>
      <div className="flex justify-center">
        <div className="p-4">
          <h2 className="text-2xl py-2">Items Owned by me</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {
              nfts.map((nft, i) => (
                <div key={i} className="border shadow rounded-xl overflow-hidden">
                  <Image width="100%" height="100%" layout="responsive" objectFit="contain" alt="" src={nft.image} className="rounded" />
                  <div className="p-4">
                    <TagEl details={{ text: nft.name, class: 'bg-white-500 w-full' }}></TagEl>
                    <ColorSpan nft={nft}></ColorSpan>
                    {/* <TagEl details={{ text: nft.price + ' MATIC', class: 'bg-blue text-green-600' }}></TagEl> */}
                    {Boolean(nft.isColor) && (<TagEl details={{ text: 'COLOR', class: 'bg-blue text-green-600' }}></TagEl>)}
                    {Boolean(nft.isColor) && (<button onClick={(e) => { GetSold(nft.color) }}>Show Art with this color</button>)}
                  </div>
                  <OpenseaLink link={{ nftaddress, tokenId: nft.tokenId }}></OpenseaLink>
                </div>

              ))
            }
          </div>
        </div>
      </div>
      {shouldLoad ? <button onClick={() => { loadNFTs() }}>Load more</button> : <div></div>}
    </div>
  )
}