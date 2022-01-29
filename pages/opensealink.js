function OpenseaLink({ link = {
    nftaddress: "",
    tokenId: ""
} }) {
    return (<a target="_blank" href={"https://opensea.io/assets/matic/" + link.nftaddress + "/" + link.tokenId} rel="noreferrer" >See on opensea</a>);
}

export default OpenseaLink;