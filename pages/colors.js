import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import Web3Modal from "web3modal"
import Image from 'next/image'
import WalletConnectProvider from "@walletconnect/web3-provider";
import TagEl from "./tag-element";
const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

import {
    nftmarketaddress, nftaddress
} from '../config'

import PixaGarage from '../artifacts/contracts/PixaGarage.sol/PixaGarage.json'
import Pixag from '../artifacts/contracts/Pixag.sol/Pixag.json'
import ColorSpan, { compare } from './utils'

export default function Colors() {
    const router = useRouter();
    const [nfts, setNfts] = useState([])
    const [shouldLoad, setShouldLoad] = useState(true);
    const [selectedColor, setSelectedColor] = useState(undefined);
    const [loadingState, setLoadingState] = useState('not-loaded');
    const [nft, setNft] = useState({});
    const [allColors, setAllColors] = useState(<div></div>);
    useEffect(() => {
        loadNFTs()
    }, [])

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
                        137: "https://rpc-mainnet.maticvigil.com/"//137: "https://rpc-mainnet.maticvigil.com/" // required
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
            data = await marketContract.loadColors(0, 4096)
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
        const hexes = [];
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
            hexes.push(item.color);
            items.push(item);
            return item
        }))
        items.sort(compare);
        setNfts(items)
        const arr = [];
        setLoadingState('loaded')
        for (let ik = 0; ik < 256; ik += 17) {
            for (let jk = 0; jk < 256; jk += 17) {
                for (let kk = 0; kk < 256; kk += 17) {
                    const hex = rgbToHex(ik, jk, kk);
                    const invHex = invertColor(hex);
                    if (hexes.indexOf(hex) === -1) {
                        arr.push(
                            <button className="w-full font-bold py-2 rounded" onClick={(e) => { document.getElementById("colorSearch").value = hex; window.scrollTo(0, 0) }} style={{ backgroundColor: hex, color: invHex, margin: "1px", maxWidth: "100px", display: "inline-block" }}>{hex}</button>
                        )
                    }
                }
            }
        }
        setAllColors(arr);
    }
    function rgbToHex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
    async function findColor() {
        const hex = document.getElementById("colorSearch").value.replace("#", "");
        const rgb = hexToRgb("#" + hex);
        if (!rgb || rgb.r % 17 !== 0 || rgb.g % 17 !== 0 || rgb.b % 17 !== 0) {
            alert("Choose another color, this is not valid");
            return;
        }
        const exists = nfts.find(e => e.color === "#" + hex) !== undefined;
        if (!exists) {
            //BUY COLOR
            const canvas = document.createElement("canvas");
            canvas.width = 250;
            canvas.height = 250;
            const ctx = canvas.getContext("2d");

            ctx.fillStyle = "#" + hex;
            ctx.fillRect(0, 0, 250, 250);
            const url = canvas.toDataURL()
            setNft({
                hex,
                image: url
            })
            var blobBin = atob(url.split(',')[1]);
            var array = [];
            for (var i = 0; i < blobBin.length; i++) {
                array.push(blobBin.charCodeAt(i));
            }
            var file = new Blob([new Uint8Array(array)], { type: 'image/png' });
            if (!confirm("Do you want to buy this color " + hex + " for 5 MATIC?")) {
                return;
            }
            try {
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
                                137: "https://rpc-mainnet.maticvigil.com/"//137: "https://rpc-mainnet.maticvigil.com/" // required
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


                let contract = new ethers.Contract(nftaddress, Pixag.abi, provider)
                contract = contract.connect(signer);
                const added = await client.add(
                    file, {
                    progress: (prog) => console.log(`received: ${prog}`)
                })
                const url = `https://ipfs.infura.io/ipfs/${added.path}`
                const fileUrl = url;
                if (!window.localStorage.getItem("WEB3_CONNECT_CACHED_PROVIDER")) {
                    alert("Please press CONNECT to connect to your wallet!");
                    return;
                }
                console.log("create market");
                // upload to IPFS
                const name = "HEX " + hex;
                const data = JSON.stringify({
                    name, description: "color asset, whenever item is sold at PIXA GARAGE marketplace, and has dominant color set same as this, you get a cut of 10%", image: fileUrl, attributes: [{ trait_type: "COLOR", value: hex }]
                })
                const addedFile = await client.add(data)
                const urlAdded = `https://ipfs.infura.io/ipfs/${addedFile.path}`;
                let transaction = await contract.createToken(urlAdded)

                let tx = await transaction.wait()
                let event = tx.events[0]
                let value = event.args[2]
                let tokenId = value.toNumber()

                if (confirm("Great, NFT COLOR is minted, you just need to sign it in order to get on PixaGarage market!")) {
                    console.log(tokenId)
                }
                else {
                    console.log(tokenId)
                }
                const pr = ethers.utils.parseUnits("5", 'ether')

                // list the item for sale on the marketplace 
                contract = new ethers.Contract(nftmarketaddress, PixaGarage.abi, signer);
                const t2ransaction = await contract.createMarketItem(nftaddress, tokenId, pr, "#" + hex, name, true, false, {
                    value: pr
                })
                await t2ransaction.wait()
                alert("Congratulations! You own " + hex + " color now! Check out I OWN tab!")
                router.push('./my-assets')

            } catch (error) {
                console.log('Error uploading file:', error)
            }
        }
        else {
            alert("The color " + hex + " already has an owner! :(");
            console.log(exists);
        }
    }
    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    function invertColor(hex) {
        if (hex.indexOf('#') === 0) {
            hex = hex.slice(1);
        }
        // convert 3-digit hex to 6-digits.
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        if (hex.length !== 6) {
            throw new Error('Invalid HEX color.');
        }
        // invert color components
        var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
            g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
            b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
        // pad each with zeros and return
        return '#' + padZero(r) + padZero(g) + padZero(b);
    }

    function padZero(str, len) {
        len = len || 2;
        var zeros = new Array(len).join('0');
        return (zeros + str).slice(-len);
    }
    debugger;
    if (loadingState !== 'loaded') return (<h1 className="py-10 px-20 text-3xl">Loading</h1>)

    return (
        <div>
            <div className="flex justify-center">

                <div className="p-4">
                    <h2 className="text-2xl py-2">Colors available: {4096 - nfts.length} out of 4096</h2>
                    <input type="text" id="colorSearch" placeholder="Type HEX color" />
                    <br></br>
                    <button className="w-full bg-green-500 text-white font-bold py-2 px-12 rounded" onClick={findColor}>BUY COLOR</button>
                    {Boolean(nft.hex !== undefined) &&
                        (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                            <div className="border shadow rounded-xl overflow-hidden">
                                <Image width="100%" height="100%" layout="responsive" objectFit="contain" alt="" src={nft.image} className="rounded" />
                                <div className="p-4">
                                    <TagEl details={{ text: nft.hex, class: 'bg-white-500 w-full' }}></TagEl>
                                </div>
                            </div>

                        </div>)}
                </div>

                <br></br>

            </div>
            <br></br>
            <br></br>
            <div>Available hex colors are:
                <br></br>
                {allColors}
            </div>
        </div>
    )
}