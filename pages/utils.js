export const compare = (a, b) => {
    if (a.itemId < b.itemId) {
        return 1;
    }
    if (a.itemId > b.itemId) {
        return -1;
    }
    return 0;
}

function ColorSpan({ nft = { color: "#aaaaaa" } }) {
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
    return (<span style={{ color: invertColor(nft.color), backgroundColor: nft.color, margin: "1vw" }} className={"inline-block rounded-full px-3 py-1 text-sm font-semibold mr-2 mb-2"}>{nft.color}</span>)
}

export default ColorSpan;
