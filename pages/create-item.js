import { ethers } from 'ethers'
import { default as NImage } from 'next/image'
import { useState, useEffect } from 'react'
import Web3Modal from 'web3modal'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { nftaddress, nftmarketaddress } from '../config'
import Pixag from '../artifacts/contracts/Pixag.sol/Pixag.json'
import { useRouter } from 'next/router'
import PixaGarage from '../artifacts/contracts/PixaGarage.sol/PixaGarage.json'
import * as $ from 'jquery';
import { faPen, faArrowDown, faArrowUp, faUpload, faFileUpload, faArrowsAlt, faFillDrip, faDownload, faUndo, faRedo, faFileExport, faPaintRoller, faBorderAll, faSearchPlus, faSearchMinus, faSave, faTable, faTrashAlt, faRocket, faInfo, faInfoCircle } from '@fortawesome/free-solid-svg-icons'
const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import WalletConnectProvider from "@walletconnect/web3-provider";
import Modal from 'react-modal';
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};
const customDetailsStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
}
export default function CreateItem() {
  const router = useRouter();
  const [deviceType, setDeviceType] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [modalInfoIsOpen, setInfoIsOpen] = useState(true);
  const [detailsModalIsOpen, setDetailsIsOpen] = useState(false);
  const [imgToUpload, setImgToUpload] = useState("");
  const [onlyCreate, setOnlyCreate] = useState(true);
  const [price, setPrice] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  if (typeof window !== "undefined" && !initialized) {
    setInitialized(true);
    console.log("im here");
    window.name;
    window.description;
    window.price = "0.001";
    window.fileUrl;
    window.myContext;
    window.imageData23;
    window.imgData;
    window.imW;
    window.imH;
    window.tool = "pen";
    window.smallW;
    window.smallH;
    window.multC;
    window.brush = 0;
    window.mousedown = false;
    window.xy;
    window.layers = 0;
    window.finalMap = {};
    window.myCanvas; // Creates a canvas object
    // canvas = window.myCanvas;
    window.textW = 0;
    window.textH = 0;
    window.textY = 0;
    window.textX = 0;
    window.mousemovepoints = [];
    window.lineX;
    window.lineY;
    window.lineBeingDrawn;
    window.toolMovement = false;
    window.zoom;
    window.historyMoves = {};
    window.move = 0;
    window.background = "#f2f2f2";
    window.floodFillMap = {};
    window.cof = 50;
    window.fMap = {};
    window.latestFinalMozaics = [];
    window.colorHistory = [];
    window.collapse = true;
    window.fileToUpload;
    // canvas;
    window.disableBorders = false;
    window.clickChanged = "black";
    window.navBarH;
    window.bottomH;
    window.screenWithBtmHPercent;
    window.screenWithNOBtmHPercent;
    window.resizeCoef = 0.12;
    window.disabled = false;
  }
  useEffect(() => {
    $(document).ready(() => {
      let hasTouchScreen = false;
      if ("maxTouchPoints" in navigator) {
        hasTouchScreen = navigator.maxTouchPoints > 0;
      } else if ("msMaxTouchPoints" in navigator) {
        hasTouchScreen = navigator.msMaxTouchPoints > 0;
      } else {
        const mQ = window.matchMedia && matchMedia("(pointer:coarse)");
        if (mQ && mQ.media === "(pointer:coarse)") {
          hasTouchScreen = !!mQ.matches;
        } else if ("orientation" in window) {
          hasTouchScreen = true; // deprecated, but good fallback
        } else {
          // Only as a last resort, fall back to user agent sniffing
          var UA = navigator.userAgent;
          hasTouchScreen =
            /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA) ||
            /\b(Android|Windows Phone|iPad|iPod)\b/i.test(UA);
        }
      }
      if (hasTouchScreen) {
        setDeviceType("Mobile");

        return;
      } else {
        setDeviceType("Desktop");
      }
      console.log("here also");
      window.navBarH = document.getElementsByTagName("nav")[0].parentElement.offsetHeight;
      window.bottomH = document.getElementById("actions").offsetHeight;
      window.screenWithBtmHPercent = -0.045 + (window.outerHeight - (window.navBarH + window.bottomH)) / window.outerHeight;
      window.screenWithNOBtmHPercent = -0.045 + (window.outerHeight - (window.navBarH)) / window.outerHeight;
      $("#favcolor").change(function (e) { changeClick(e); });
      window.myCanvas = document.getElementById("myCanvas");
      window.myContext = window.myCanvas.getContext("2d");
      window.myCanvas.addEventListener('click', function (event) {
        console.log(event.button);
        if (event.button !== 0) {
          const x = Math.floor(event.offsetX / window.multC);
          const y = Math.floor(event.offsetY / window.multC);
          if (x < 0 || y < 0) return;
          return;
        }
        if (window.xy !== event.offsetX + ":" + event.offsetY) return;
        let x = Math.floor(event.offsetX / window.zoom / window.multC) * window.multC;
        let y = Math.floor(event.offsetY / window.zoom / window.multC) * window.multC;
        clickEvent(x, y);

      }, true);
      window.myCanvas.addEventListener('mousemove', mousemove, false);
      window.myCanvas.addEventListener('contextmenu', function (event) {
        event.preventDefault();
        const x = Math.floor(event.offsetX / window.zoom / window.multC) * window.multC;
        const y = Math.floor(event.offsetY / window.zoom / window.multC) * window.multC;
        if (window.finalMap[x + ":" + y]) {
          const color = window.finalMap[x + ":" + y].color;
          clickChanged = color;
          document.getElementById("favcolor").value = color;
        }
      }, false);
      window.myCanvas.addEventListener('mousedown', function (event) {
        window.mousemovepoints = [];
        if (event.button !== 0) return;
        mousedown(event);


      }, false);
      window.myCanvas.addEventListener('mouseup', mouseup, false);
      window.myCanvas.addEventListener('mouseout', mouseup, false);

      // window.myCanvas.addEventListener("touchstart", (e) => {
      //   const offsets = recursiveOffsetLeftAndTop(e.target);
      //   const ev = {
      //     offsetX: e.changedTouches[0].clientX - offsets.offsetLeft,
      //     offsetY: e.changedTouches[0].clientY - offsets.offsetTop,
      //   }
      //   mousedown(ev);
      // }, false);
      // window.myCanvas.addEventListener("touchend", (e) => {
      //   const offsets = recursiveOffsetLeftAndTop(e.target);
      //   const ev = {
      //     offsetX: e.changedTouches[0].clientX - offsets.offsetLeft,
      //     offsetY: e.changedTouches[0].clientY - offsets.offsetTop,
      //   }
      //   mouseup(ev);
      // }, false);
      // window.myCanvas.addEventListener("touchcancel", (e) => {
      //   const offsets = recursiveOffsetLeftAndTop(e.target);
      //   const ev = {
      //     offsetX: e.changedTouches[0].clientX - offsets.offsetLeft,
      //     offsetY: e.changedTouches[0].clientY - offsets.offsetTop,
      //   }
      //   mouseup(ev);
      // }, false);
      // window.myCanvas.addEventListener("touchmove", (e) => {
      //   const offsets = recursiveOffsetLeftAndTop(e.target);
      //   const ev = {
      //     offsetX: e.changedTouches[0].clientX - offsets.offsetLeft,
      //     offsetY: e.changedTouches[0].clientY - offsets.offsetTop,
      //   }
      //   mousemove(ev);
      // }, false);

      $("#hiddenBtn").hide();

      prepareCanvas();

      initCanvas();
      if (window.localStorage.getItem('json') && window.localStorage.getItem('json') !== '{}') {
        window.finalMap = JSON.parse(window.localStorage.getItem('json'));
        if (!window.finalMap["background"]) {
          window.finalMap["background"] = "#ffffff";
        }
        appendJson(window.finalMap, false);
      }

    })
  }, [])
  function openInfoModal() {
    setInfoIsOpen(true);
  }
  function closeInfoModal() {
    setInfoIsOpen(false);
  }
  function openModal() {
    setIsOpen(true);
  }

  function openDetailsModal() {
    setDetailsIsOpen(true);
  }

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
  }

  function closeModal() {
    setIsOpen(false);
  }
  function closeDetailsModal() {
    setDetailsIsOpen(false);
  }
  function recursiveOffsetLeftAndTop(element) {
    var offsetLeft = 0;
    var offsetTop = 0;
    while (element) {
      offsetLeft += element.offsetLeft;
      offsetTop += element.offsetTop;
      element = element.offsetParent;
    }
    return {
      offsetLeft: offsetLeft,
      offsetTop: offsetTop
    };
  };
  function mousedown(event) {
    window.mousedown = true;
    if (window.tool === "move") {
      const x = Math.floor(event.offsetX / window.zoom / window.multC) * window.multC;
      const y = Math.floor(event.offsetY / window.zoom / window.multC) * window.multC;
      window.lineX = x;
      window.lineY = y;
      return;
    }
    window.xy = event.offsetX + ":" + event.offsetY;
  }
  function mouseup(event) {
    if (event.button !== 0) {
      window.mousemovepoints = [];
      const x = Math.floor(event.offsetX / window.zoom / window.multC);
      const y = Math.floor(event.offsetY / window.zoom / window.multC);
      if (x || y < 0) return;
      return;
    }
    if (window.mousedown && window.xy !== event.offsetX + ":" + event.offsetY && window.tool !== "move") {
      window.move++;
    }
    window.mousedown = false;

  }

  function clickEvent(x, y) {
    if (window.tool === "bucket") {
      floodFill(x, y);
      window.toolMovement = false;
      return;
    }
    if (window.tool === "move") {
      window.lineX = x;
      window.lineY = y;
      return;
    }
    if (window.tool === "line") {
      if (window.lineBeingDrawn) {
        window.lineBeingDrawn = false;
        window.toolMovement = false;
        return;
      }
      window.lineBeingDrawn = true;
      window.lineX = x;
      window.lineY = y;

      // drawLine(x, y, x, y);
      return;
    }
    if (x < 0 || y < 0) return;
    window.toolMovement = false;
    if (window.brush === 0) draw(x, y);
    else {
      const sx = x - window.multC * window.brush;
      const sy = y - window.multC * window.brush;
      x = x - window.multC * window.brush;
      y = y - window.multC * window.brush;
      for (let i = 0; i < window.brush * 2; i++) {
        y += window.multC;
        x = sx;
        for (let j = 0; j < window.brush * 2; j++) {
          x += window.multC;
          draw(x, y);
        }
      }
    }
    window.move++;
  }
  function moveCanvas(dx, dy) {
    window.historyMoves[move] = [];
    const col = clickChanged;
    const toUpdate = [];
    const toDelete = [];
    window.myContext.clearRect(0, 0, window.imW, window.imH)
    window.myContext.fillStyle = "white";
    window.myContext.fillRect(0, 0, window.imW, window.imH);
    drawBorders();
    for (var q = 0; q < Object.keys(window.finalMap).length; q++) {
      const key = Object.keys(window.finalMap)[q];
      if (key !== "background") {
        const x = +key.split(":")[0];
        const y = +key.split(":")[1];
        if (window.finalMap[x + ":" + y]) {

          toUpdate.push({
            x: (x + dx),
            y: (y + dy),
            color: window.finalMap[x + ":" + y].color
          })
          //draw((x + dx), (y + dy));
          toDelete.push(x + ":" + y);
        }
      }
    }
    toDelete.forEach(t => {
      delete window.finalMap[t];
    })
    toUpdate.forEach(t => {
      clickChanged = t.color;
      draw(t.x, t.y);
    })
    window.move++;
    clickChanged = col;
  }
  function mousemove(event) {
    // if (event.button !== 0) return;
    if (window.mousedown) {
      let x = Math.floor(event.offsetX / window.zoom / window.multC) * window.multC;
      let y = Math.floor(event.offsetY / window.zoom / window.multC) * window.multC;
      if (window.tool === "move") {
        const diffX = x - window.lineX;
        const diffY = y - window.lineY;

        moveCanvas(diffX, diffY);
        window.lineX = x;
        window.lineY = y;
        return;
      }
      window.mousemovepoints.push({
        x: x / window.multC,
        y: y / window.multC
      })
      const l = window.mousemovepoints.length;
      if (l > 1) {
        const start = { x: window.mousemovepoints[l - 1].x, y: window.mousemovepoints[l - 1].y };
        const end = { x: window.mousemovepoints[l - 2].x, y: window.mousemovepoints[l - 2].y };
        if (Math.abs(start.x - end.x) > 1 || Math.abs(start.y - end.y) > 1 || (Math.abs(start.x - end.x) <= 1 && Math.abs(start.y - end.y) > 1)) {
          const path = getPath([start.x, start.y], [end.x, end.y]);
          for (let i = 0; i < path.length; i++) {
            draw(path[i][0] * window.multC, path[i][1] * window.multC);
          }
        }
      }
      if (x < 0 || y < 0) return;
      if (window.brush === 0) {
        draw(x, y);
      }
      else {
        const sx = x - window.multC * window.brush;
        const sy = y - window.multC * window.brush;
        x = x - window.multC * window.brush;
        y = y - window.multC * window.brush;
        for (let i = 0; i < window.brush * 2; i++) {
          y += window.multC;
          x = sx;
          for (let j = 0; j < window.brush * 2; j++) {
            x += window.multC;
            draw(x, y);
          }
        }
      }


    }
    else {

      const x = Math.floor(event.offsetX / window.zoom / window.multC) * window.multC;
      const y = Math.floor(event.offsetY / window.zoom / window.multC) * window.multC;
      if (window.tool === "line" && window.lineBeingDrawn) {
        drawLine(window.lineX, window.lineY, x, y);
        window.toolMovement = true;
        window.move++;
        return;
      }
      // drawTemp(x, y);
      if (x < 0 || y < 0) return;
      const el = document.getElementById(window.finalMap[x + ":" + y]?.color || background)
      const els = document.getElementsByClassName("usedColors")
      if (els) [...els].forEach(e => { e.style.border = 0; });
      if (el) {
        el.style = "background-color: " + el.style.backgroundColor + "; border-color: red; border-style: solid; border-width: 2px";
        el.focus();
      }
    }

  }
  function drawText(text, fill, stroke, x, y, font) {
    window.myContext.clearRect(window.textX, window.textY, window.textW, window.textH);
    window.myContext.font = font + "px verdana";
    window.myContext.fillStyle = fill;
    window.myContext.strokeStyle = stroke;
    const mt = window.myContext.measureText(text);

    window.textW = mt.width;
    window.textH = mt.fontBoundingBoxAscent;
    window.textX = x;
    window.textY = y;
    window.myContext.fillText(text, x, y);
    window.myContext.strokeText(text, x, y);
    // drawBorders();
  }
  function drawBorders() {
    for (let i = 0; i < window.smallW; i++) {
      for (let j = 0; j < window.smallH; j++) {
        if (window.finalMap[i * window.multC + ":" + j * window.multC] !== undefined) {
          window.myContext.fillStyle = window.finalMap[i * window.multC + ":" + j * window.multC].color;
          window.myContext.fillRect(i * window.multC, j * window.multC, window.multC, window.multC);
        }
        else {
          window.myContext.fillStyle = background;
          window.myContext.fillRect(i * window.multC, j * window.multC, window.multC, window.multC);
        }
        drawBorder(i * window.multC, j * window.multC, window.multC, window.multC);
      }
    }
    window.myContext.fillStyle = clickChanged;
  }
  function drawElement(element, offsetX, offsetY, isBack) {
    window.historyMoves[move] = [];
    if (isBack && element["background"]) {
      const l = clickChanged;
      clickChanged = element["background"].color;
      setBackground(false);
      clickChanged = l;
      window.historyMoves[move] = [];
    }
    const backColor = element["background"]?.color || "#ffffff";
    let el;
    let x;
    let y;
    for (var q = 0; q < Object.keys(element).length; q++) {
      const key = Object.keys(element)[q];
      el = element[key];
      if (key !== "background" && backColor !== el.color) {
        window.myContext.fillStyle = el.color;
        x = +key.split(":")[0] + offsetX * window.multC;
        y = +key.split(":")[1] + offsetY * window.multC;
        window.myContext.fillRect(x, y, window.multC, window.multC);
        window.historyMoves[move].push({ x, y, color: el.color });
        window.finalMap[x + ":" + y] = {
          color: el.color
        }
      }
    }

    window.move++;

  }
  function setBackground(isCustom) {
    debugger;
    window.historyMoves[move] = [];
    const hx = getColorWithOffset(hexToRgb(getAvgHex()), 17);
    window.myContext.fillStyle = isCustom ? hx : clickChanged;
    for (let i = 0; i < window.smallW; i++) {
      for (let j = 0; j < window.smallH; j++) {
        if (window.finalMap[i * window.multC + ":" + j * window.multC] === undefined) {
          draw(i * window.multC, j * window.multC);
        }
        if (window.finalMap[i * window.multC + ":" + j * window.multC]?.color === background) {
          if (isCustom) {
            clickChanged = hx;
          }
          draw(i * window.multC, j * window.multC);
        }
      }
    }
    appendColor(isCustom ? hx : clickChanged)
    window.historyMoves[move].push({ x: window.smallW * window.multC, y: window.smallW * window.multC, color: isCustom ? hx : clickChanged });

    background = isCustom ? hx : clickChanged
    window.finalMap["background"] = {
      color: isCustom ? hx : clickChanged
    }
    drawBorders();
    window.move++;
  }
  function undo() {
    if (move === 0) { clearCanvas(); return; }
    for (let i = 0; i < window.historyMoves[move - 1].length; i++) {
      const x = window.historyMoves[move - 1][i].x;
      const y = window.historyMoves[move - 1][i].y;
      window.myContext.fillStyle = background;
      window.myContext.fillRect(x, y, window.multC, window.multC);
      drawBorder(x, y, window.multC, window.multC, 1);
      delete window.finalMap[x + ":" + y];
    }
    move--;
    if (move > 0) {
      for (let i = 0; i < window.historyMoves[move - 1].length; i++) {
        const x = window.historyMoves[move - 1][i].x;
        const y = window.historyMoves[move - 1][i].y;
        const color = window.historyMoves[move - 1][i].color;
        window.myContext.fillStyle = color;
        window.myContext.fillRect(x, y, window.multC, window.multC);
        window.finalMap[x + ":" + y] = {
          color
        }
        drawBorder(x, y, window.multC, window.multC, 1);

      }
    }
    else window.move = 0;
    window.myContext.fillStyle = clickChanged;
  }
  function redo() {
    if (!window.historyMoves[move]) return;
    for (let i = 0; i < window.historyMoves[move].length; i++) {
      const x = window.historyMoves[move][i].x;
      const y = window.historyMoves[move][i].y;
      const color = window.historyMoves[move][i].color;
      window.myContext.fillStyle = color;
      window.myContext.fillRect(x, y, window.multC, window.multC);
      window.finalMap[x + ":" + y] = {
        color
      }
      drawBorder(x, y, window.multC, window.multC, 1);
    }
    window.myContext.fillStyle = clickChanged;
    window.move++;

  }
  function downloadJson() {
    var a = document.createElement("a");
    var file = new Blob([JSON.stringify(window.finalMap, null, "\t")], { type: "text/plain" });
    a.href = URL.createObjectURL(file);
    a.download = Date.now() + ".json";
    a.click();
  }
  function draw(x, y) {
    window.myContext.strokeStyle = clickChanged;
    window.myContext.fillStyle = clickChanged;
    window.myContext.fillRect(x, y, window.multC, window.multC);
    window.finalMap[x + ":" + y] = {
      color: clickChanged
    }
    // window.localStorage.setItem('json', JSON.stringify(window.finalMap));
    if (!window.historyMoves[move]) window.historyMoves[move] = [];
    window.historyMoves[move].push({ x, y, color: clickChanged });
    drawBorder(x, y, window.multC, window.multC, 1);

  }

  function drawBorder(xPos, yPos, width, height, thickness = 1) {
    if (window.disableBorders) return;
    window.myContext.strokeStyle = 'gray';
    window.myContext.strokeRect(xPos + (thickness), yPos + (thickness), width - (thickness * 2), height - (thickness * 2));
  }

  const previewBig = () => {
    document.getElementById("loader").style.display = "block";
    let photo = document.getElementById("big-image-file").files[0];
    var reader = new FileReader();
    reader.onload = function (e) {
      var image = new Image();
      image.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.id = "tempCanvas";
        canvas.width = window.myCanvas.width / 5;
        canvas.height = window.myCanvas.height / 5;
        canvas.style.display = "none";
        var body = document.getElementsByTagName("body")[0];
        document.body.appendChild(canvas);
        var ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, window.myCanvas.width / 5, window.myCanvas.height / 5);
        pixelize(ctx, window.myCanvas.width / 5, window.myCanvas.height / 5);
        $("#tempCanvas").remove();
      };
      image.src = e.target.result;

    }
    reader.readAsDataURL(photo);
  }
  function getColorWithOffset(rgb, coef) {
    let r = rgb.r;
    let g = rgb.g;
    let b = rgb.b;
    let rm = rgb.r;
    let gm = rgb.g;
    let bm = rgb.b;
    while (r % coef !== 0 && rm % coef !== 0) {
      r++;
      rm--;
      if (r >= 255 || rm <= 0) break;
    }
    if (rm % coef === 0) r = rm;
    while (g % coef !== 0 && gm % coef !== 0) {
      g++;
      gm--;
      if (g >= 255 || gm <= 0) break;
    }
    if (gm % coef === 0) g = gm;
    while (b % coef !== 0 && bm % coef !== 0) {
      b++;
      bm--;
      if (b >= 255 || bm <= 0) break;
    }
    if (bm % coef === 0) b = bm;
    return rgbToHex(r, g, b)
  }
  function pixelize(c, w, h) {
    let pixIndex = 0;
    const finalMozaics = [];
    const step = window.multC / 5;
    for (let x = 0; x < w; x += step) {
      for (let y = 0; y < h; y += step) {
        finalMozaics.push(getAverageColor(x, y, c, step, step));
      }
    }
    window.latestFinalMozaics = finalMozaics;
    window.colorHistory = [];
    executePixelation();
  }
  function executePixelation() {
    removeAllChildNodes(document.getElementById("colors"));
    window.colorHistory = [];
    for (let i = 0; i < window.latestFinalMozaics.length; i++) {
      const rgb = window.latestFinalMozaics[i];
      let hex = getColorWithOffset(rgb, window.cof);
      window.fMap[window.latestFinalMozaics[i].x + ":" + window.latestFinalMozaics[i].y] = {
        color: hex
      }

    }
    appendJson(window.fMap, false);
  }
  function getAvgHexNotInverse() {
    if (window.colorHistory.length === 0) {
      return "#ffffff";
    }
    let tr = 0;
    let tg = 0;
    let tb = 0;
    window.colorHistory.forEach(c => {
      const rgb = hexToRgb(c);
      tr += rgb.r;
      tg += rgb.g;
      tb += rgb.b;
    })
    const hx = rgbToHex(parseInt(tr / window.colorHistory.length),
      parseInt(tg / window.colorHistory.length),
      parseInt(tb / window.colorHistory.length));
    return hx;
  }
  function getAvgHex() {
    if (window.colorHistory.length === 0) {
      return "#ffffff";
    }
    let tr = 0;
    let tg = 0;
    let tb = 0;
    window.colorHistory.forEach(c => {
      const rgb = hexToRgb(c);
      tr += rgb.r;
      tg += rgb.g;
      tb += rgb.b;
    })
    const hx = rgbToHex(255 - parseInt(tr / window.colorHistory.length),
      parseInt(255 - tg / window.colorHistory.length),
      parseInt(255 - tb / window.colorHistory.length));
    return hx;
  }
  function getAverageColor(x, y, c, w, h) {
    let imData = c.getImageData(x, y, w, h);
    let data = imData.data;
    let tr = 0;
    let tg = 0;
    let tb = 0;
    let count = 1;
    let i = 0;
    while (i < data.length) {
      count++;
      tr += data[i];
      tg += data[i + 1];
      tb += data[i + 2];
      i += 4;
    }
    return { x: x * window.multC / w, y: y * window.multC / h, r: parseInt(tr / count), g: parseInt(tg / count), b: parseInt(tb / count) };

  }
  function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
  function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  }

  function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }
  function getPath(start, end) {
    const matrix = [];
    for (let i = 0; i < window.smallW; i++) {
      const row = [];
      for (let j = 0; j < window.smallH; j++) {
        if (i === end[0] && j === end[1]) {
          row.push(1);
        }
        else {
          row.push(0);
        }

      }
      matrix.push(row);
    }
    return findWay(start, end, matrix);

  }

  function findWay(position, end, matrix) {
    const queue = [];
    matrix[position[0]][position[1]] = 1;
    queue.push([position]); // store a path, not just a position

    while (queue.length > 0) {
      const path = queue.shift(); // get the path out of the queue
      const pos = path[path.length - 1]; // ... and then the last position from it
      const direction = [
        [pos[0] + 1, pos[1]],
        [pos[0], pos[1] + 1],
        [pos[0] - 1, pos[1]],
        [pos[0], pos[1] - 1],
        [pos[0] + 1, pos[1] + 1],
        [pos[0] - 1, pos[1] - 1],
        [pos[0] - 1, pos[1] + 1],
        [pos[0] + 1, pos[1] - 1],
      ];

      for (let i = 0; i < direction.length; i++) {
        // Perform this check first:
        if (direction[i][0] == end[0] && direction[i][1] == end[1]) {
          // return the path that led to the find
          return path.concat([end]);
        }

        if (direction[i][0] < 0 || direction[i][0] >= matrix.length
          || direction[i][1] < 0 || direction[i][1] >= matrix[0].length
          || matrix[direction[i][0]][direction[i][1]] != 0) {
          continue;
        }
        matrix[direction[i][0]][direction[i][1]] = 1;
        // extend and push the path on the queue
        queue.push(path.concat([direction[i]]));
      }
    }
  }

  function floodFill(x, y) {
    window.floodFillMap = {};
    // read the pixels in the canvas
    const targetColor = window.finalMap[x + ":" + y]?.color ?? background;
    if (x < 0 || y < 0 || x > window.imW || y > window.imH) return;
    window.historyMoves[move] = [];
    floodFilling(x, y, targetColor);
    window.move++;

  }

  function floodFilling(x, y, color) {

    // read the pixels in the canvas
    const targetColor = window.finalMap[x + ":" + y]?.color ?? background;
    if (x < 0 || y < 0 || x >= window.imW || y >= window.imH) return;
    // check we are actually filling a different color
    if (color === targetColor && !window.floodFillMap[x + ":" + y]) {
      window.floodFillMap[x + ":" + y] = true;
      draw(x, y);
      floodFilling(x + window.multC, y, color);
      floodFilling(x - window.multC, y, color);
      floodFilling(x, y + window.multC, color);
      floodFilling(x, y - window.multC, color);
    }
    else {
      window.floodFillMap[x + ":" + y] = true;
    }
  }

  function drawLine(x, y, movex, movey) {
    if (window.toolMovement) undo();
    const path = getPath([x / window.multC, y / window.multC], [movex / window.multC, movey / window.multC]);
    for (let i = 0; i < path.length; i++) {
      draw(path[i][0] * window.multC, path[i][1] * window.multC);
    }
  }

  function getColorsTotal() {
    const colorsCount = {};
    let total = 0;
    Object.keys(window.finalMap).forEach(v => {
      if (v !== "background") {
        total++;
        if (!colorsCount[window.finalMap[v].color])
          colorsCount[window.finalMap[v].color] = 1;
        else colorsCount[window.finalMap[v].color]++
      }
    })
    return {
      ...colorsCount,
      total
    }
  }
  function getDominantColor() {
    const all = getColorsTotal();
    let max = "#unknown";
    let maxN = -1;
    Object.keys(all).forEach(key => {
      if (all[key] > maxN && key != "total") {
        maxN = all[key];
        max = key;
      }
    })
    return max;
  }
  async function startMint() {
    window.disabled = true;
    const file = window.fileToUpload;
    try {
      const added = await client.add(
        file, {
        progress: (prog) => console.log(`received: ${prog}`)
      })
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      window.fileUrl = url;
      createMarket();
    } catch (error) {
      console.log('Error uploading file:', error)
    }
  }

  async function createMarket() {
    if (!window.localStorage.getItem("WEB3_CONNECT_CACHED_PROVIDER")) {
      alert("Please press CONNECT to connect to your wallet!");
      return;
    }
    console.log("create market");

    if (!window.name || !window.description || !window.price || !window.fileUrl) {
      console.log(window.name);
      console.log(window.description);
      console.log(window.price);
      console.log(window.fileUrl);
      return
    }
    // upload to IPFS
    const data = JSON.stringify({
      name: window.name, description: window.description, image: window.fileUrl, attributes: [{ trait_type: "PIXAG Color", value: getDominantColor() }]
    })
    try {
      const added = await client.add(data)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      createSale(url)
    } catch (error) {
      console.log('Error uploading file:', error)
    }
  }

  async function createSale(url) {
    if (!window.localStorage.getItem("WEB3_CONNECT_CACHED_PROVIDER")) {
      alert("Please press CONNECT to connect to your wallet!");
      return;
    }
    // create the items and list them on the marketplace
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
            137: "https://rpc-mainnet.maticvigil.com/"//80001: "https://rpc-mumbai.maticvigil.com/" // required
          }
        }
      }
    }
    const web3Modal = new Web3Modal({
      network: "matic",
      cacheProvider: true,
      providerOptions,
    })
    const connection = await web3Modal.connect()
    let provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    // we want to create the token
    let contract = new ethers.Contract(nftaddress, Pixag.abi, signer)
    contract = contract.connect(signer);
    let transaction = await contract.createToken(url)

    let tx = await transaction.wait()
    let event = tx.events[0]
    let value = event.args[2]
    let tokenId = value.toNumber()
    if (!onlyCreate) {
      if (confirm("Great, NFT is minted, we will now put your item on PixaGarage market!")) {
        console.log(tokenId)
      }
      else {
        console.log(tokenId)
      }
    }
    if (onlyCreate) {
      if (confirm("Your token will be on your opensea account, here is the link: https://opensea.io/assets/matic/0xe24590c9ebef69f01682c704664deb6dc9f5926f/" + tokenId)) {
        window.disabled = true;
        router.push('./')
        return;
      }
      window.disabled = true;
      router.push('./')
      return;
    }
    const pr = ethers.utils.parseUnits(window.price, 'ether')

    // list the item for sale on the marketplace 
    contract = new ethers.Contract(nftmarketaddress, PixaGarage.abi, signer)
    const dominantColor = getDominantColor();
    transaction = await contract.createMarketItem(nftaddress, tokenId, pr, dominantColor, window.name, false, false)
    await transaction.wait()
    window.disabled = true;
    router.push('./')
  }


  async function downloadCanvas() {
    if (!window.disableBorders && confirm('Remove borders from your drawing?')) {
      bordersUpdate()
    }

    const url = document.getElementById('myCanvas').toDataURL()
    var blobBin = atob(url.split(',')[1]);
    var array = [];
    for (var i = 0; i < blobBin.length; i++) {
      array.push(blobBin.charCodeAt(i));
    }
    var file = new Blob([new Uint8Array(array)], { type: 'image/png' });

    window.fileToUpload = file;
    setImgToUpload(url);
    openDetailsModal();
    //await startMint();
  }
  function saveWork() {
    window.localStorage.setItem("json", JSON.stringify(window.finalMap));
    alert("Work is saved!")
  }
  function clearCanvas() {
    console.log("123");
    if (confirm('Are you sure you want to clear your work?')) {
      window.localStorage.setItem('json', JSON.stringify({}));
      initCanvas();
    }
  }
  function changeTool(t) {
    window.tool = t;
    [...document.getElementsByClassName("tools")].forEach(e => {
      e.style.backgroundImage = "linear-gradient(to bottom, white, aquamarine)";
    })
    document.getElementById(t).style.backgroundImage = "linear-gradient(to bottom, white, indianred)";

  }

  function collapseBottom() {
    if (window.collapse) {
      $("#actions").hide();
      $("#hiddenBtn").show();
      document.getElementById("canvas").style.maxHeight = 100 * window.screenWithNOBtmHPercent + "%";
      document.getElementById("canvas").style.height = 100 * window.screenWithNOBtmHPercent + "%";
      window.zoom = (window.screenWithNOBtmHPercent - window.resizeCoef) * (window.outerHeight) / (window.myCanvas.height);
      window.myCanvas.style.zoom = window.zoom;
    }
    else {
      $("#actions").show();
      $("#hiddenBtn").hide();
      document.getElementById("canvas").style.maxHeight = 100 * screenWithBtmHPercent + "%";
      window.zoom = (window.screenWithBtmHPercent - window.resizeCoef) * window.outerHeight / window.myCanvas.height;
      window.myCanvas.style.zoom = window.zoom;
    }
    window.collapse = !window.collapse;
  }
  function simetrisize(side) {
    window.historyMoves[move] = [];
    const jk = clickChanged;
    if (side === 'l') {
      for (let i = 0; i < window.smallW / 2; i++) {
        for (let j = 0; j < window.smallH; j++) {
          clickChanged = window.finalMap[i * window.multC + ":" + j * window.multC]?.color ?? background;
          draw((window.smallW - i - 1) * window.multC, j * window.multC);
        }
      }
    }
    if (side === 'u') {
      for (let i = 0; i < window.smallW; i++) {
        for (let j = 0; j < window.smallH / 2; j++) {
          clickChanged = window.finalMap[i * window.multC + ":" + j * window.multC]?.color ?? background;
          draw(i * window.multC, (window.smallH - j - 1) * window.multC);
        }
      }
    }
    window.move++;
    clickChanged = jk;
  }
  function drawOver() {
    let photo = document.getElementById("uploadOverlay").files[0];

    var reader = new FileReader();

    reader.onload = function (e) {
      var image = new Image();
      image.onload = function () {
        window.myContext.drawImage(image, 0, 0);
      };
      image.src = e.target.result;
    }
    reader.readAsDataURL(photo);
  }
  function recreateCanvas() {
    if (confirm("Are you sure you want to change the canvas size? Your work will be lost...")) {
      if (+document.getElementById("cols").value > 100 || +document.getElementById("rows").value > 100) {
        alert("maybe not, hah? 100x100 canvas field is enough")
        return;
      }
      if (document.getElementById("cols").value === "") {
        alert("those are not numbers, man")
        return;
      }
      if (+document.getElementById("cols").value === 0) {
        alert("those are not numbers, man")
        return;
      }
      window.localStorage.setItem('cols', +document.getElementById("cols").value);
      window.localStorage.setItem('rows', +document.getElementById("rows").value);
      window.localStorage.setItem('json', JSON.stringify({}));
      prepareCanvas();
      initCanvas();
    }
  }
  function changeBrush() {
    window.brush = +document.getElementById("brush").value;
    document.getElementById("brushLabel").innerText = "Brush: " + window.brush * 2;
  }
  function pixelOffsetUpdate() {
    let offsUp = +document.getElementById("pixelOffset").value;
    let offsDown = +document.getElementById("pixelOffset").value;
    while (offsUp % 17 !== 0 && offsDown % 17 !== 0) {
      offsUp++;
      offsDown--;
    }
    if (offsUp % 17 === 0) {
      window.cof = offsUp;
    }
    else {
      window.cof = offsDown;
    }
    document.getElementById("pixelOffsetLabel").innerText = "PixelOffset: " + window.cof;
    executePixelation();
  }
  function removeAllChildNodes(parent) {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
  }
  function zoomIn() {
    window.zoom += +(1 / window.smallW);
    document.getElementById("myCanvas").style.zoom = window.zoom;
  }
  function zoomOut() {
    window.zoom -= +(1 / window.smallW);
    document.getElementById("myCanvas").style.zoom = window.zoom;
  }
  function initCanvas() {
    removeAllChildNodes(document.getElementById("colors"));
    window.finalMap = {};
    window.historyMoves = {};
    window.move = 0;
    window.historyMoves[move] = [];
    window.layers = 0;
    window.myContext.clearRect(0, 0, window.imW * window.multC, window.imH * window.multC);
    window.myContext.putImageData(window.imageData23, 0, 0);
    clickChanged = "#ffffff";
    setBackground(false);
    clickChanged = "#000000";
    appendColor("#ffffff");
    // appendColor("#000000");
    drawBorders();
    const bw = 150 * 100 / window.outerWidth;
    document.getElementById("actions").style.width = 99 + "%";
    document.getElementById("canvas").style.width = 99 + "%";

    document.getElementById("cols").value = window.localStorage.getItem('cols');
    document.getElementById("rows").value = window.localStorage.getItem('rows');
    document.getElementById("canvas").style.maxHeight = 100 * screenWithBtmHPercent + "%";
    window.zoom = (window.screenWithBtmHPercent - window.resizeCoef) * window.outerHeight / window.myCanvas.height;
    window.myCanvas.style.zoom = window.zoom;

  }
  function prepareCanvas() {
    window.imW = +window.localStorage.getItem('cols') > 0 ? +window.localStorage.getItem('cols') : +document.getElementById("cols").value;
    window.imH = +window.localStorage.getItem('rows') > 0 ? +window.localStorage.getItem('rows') : +document.getElementById("rows").value;


    window.multC = window.imW <= 10 ? 105 : window.imW <= 20 ? 60 : window.imW <= 30 ? 45 : window.imW <= 40 ? 30 : window.imW <= 50 ? 15 : window.imW <= 60 ? 15 : window.imW <= 80 ? 15 : 15;
    window.myCanvas.width = window.imW; // Assigns image's width to canvas
    window.myCanvas.height = window.imH; // Assigns image's height to canvas
    window.imgData = new ImageData(window.imH, window.imW);
    //create small canvas
    let li = 0;
    for (let i = 0; i < window.imgData.data.length; i += 4) {
      window.imgData.data[i] = 255;
      window.imgData.data[i + 1] = 255;
      window.imgData.data[i + 2] = 255;
      window.imgData.data[i + 3] = 255;
      li++;
    }

    window.myCanvas.width = window.myCanvas.width * window.multC;
    window.myCanvas.height = window.myCanvas.height * window.multC;
    window.smallW = window.imW;
    window.smallH = window.imH;
    window.imW = window.myCanvas.width;
    window.imH = window.myCanvas.height;
    window.imageData23 = new ImageData(window.myCanvas.width, window.myCanvas.height)
    let ind = 0;
    const randoms = [255, 245, 225];
    const randoms2 = [0, 14, 25];
    const randoms3 = [55, 45, 35];
    const map = {};
    for (let i = 0; i < window.imgData.data.length; i += 4) {
      let r = window.imgData.data[i];
      let g = window.imgData.data[i + 1];
      let b = window.imgData.data[i + 2];
      let o = window.imgData.data[i + 3];
      const x = (i / 4) % (window.imW / window.multC);
      const y = Math.floor((i / 4) / (window.imW / window.multC));
      let color1 = r;//randoms3[Math.floor(Math.random() * 3)];
      let color2 = g;//randoms2[Math.floor(Math.random() * 3)];
      let color3 = b;//randoms3[Math.floor(Math.random() * 3)];
      let opacity = o;
      let indy = 0;
      while (indy < window.multC * 4) {
        let indx = 0;
        while (indx < window.multC * 4) {
          const toSet = window.multC * i + (window.multC - 1) * 4 * window.imW * y + window.imW * indy + indx;
          window.imageData23.data[toSet] = color1;
          window.imageData23.data[toSet + 1] = color2;
          window.imageData23.data[toSet + 2] = color3;
          window.imageData23.data[toSet + 3] = o;
          indx += 4;
        }
        indy += 4;
      }
      ind++;
    }
  }
  function changeClick(color) {
    const rgb = hexToRgb(color.target.value);
    clickChanged = getColorWithOffset(rgb, 17);
    $("#favcolor").val(clickChanged);
    appendColor(clickChanged);
  }
  function bordersUpdate() {
    window.disableBorders = !window.disableBorders;
    if (window.disableBorders) {

      document.getElementById("borders").style.backgroundImage = "linear-gradient(to bottom, white, aquamarine)";
      document.getElementById("borders").style.color = "black";
    }
    else {
      document.getElementById("borders").style.backgroundImage = "linear-gradient(to bottom, white, indianred)";
      document.getElementById("borders").style.color = "white";
    }
    drawBorders();
  }

  function appendColor(color) {
    if (window.colorHistory.indexOf(color) < 0) {
      window.colorHistory.push(color);
      var b = document.createElement("button");
      b.style = "background-color: " + color + ";";
      b.id = color;
      b.classList.add('usedColors');
      // b.innerText = "" + color
      // var span = document.createElement("span");
      // span.style.backgroundColor = "white";
      // span.style.opacity = 0.5;
      // span.innerText = "" + color
      // b.prepend(span)
      const rgb = hexToRgb(color);
      b.title = rgb.r + "," + rgb.g + "," + rgb.b;
      b.onclick = (e) => {
        document.getElementById("favcolor").value = color;
        clickChanged = document.getElementById("favcolor").value;
      }
      document.getElementById("colors").prepend(b);
    }
  }
  function appendJson(json) {
    const keys = Object.keys(json);
    for (let i = 0; i < keys.length; i++) {
      // window.finalMap[keys[i]] = {
      //   color: result[keys[i]].color
      // }
      appendColor(json[keys[i]].color);
    }
    drawElement(json, 0, 0, window.layers === 0)
    window.layers++;
    drawBorders();
    document.getElementById("loader").style.display = "none";
  }
  function readFile(i, l) {
    if (i === l.length) return;
    var fr = new FileReader();

    fr.onload = function (e) {
      var result = JSON.parse(e.target.result);
      appendJson(result, false);
      readFile(++i, l);
    }

    fr.readAsText(l.item(i));
  }
  function readJson() {
    var files = document.getElementById('selectFiles').files;
    if (files.length <= 0) {
      return false;
    }

    readFile(0, files);
  }
  async function sellArt(event) {
    event.preventDefault();
    window.price = document.getElementById("priceVal")?.value || "0.001";
    window.name = document.getElementById("nameVal").value.trim();
    window.description = document.getElementById("descVal").value.trim();
    await startMint();
  }
  if (Boolean(deviceType === "Desktop")) {
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
          <h2>Info</h2>
          <p>
            you can import and pixelize any image by pressing first button on the left
        </p>
          <p>
            you can export and import your work, by clicking on JSON buttons
        </p>
          <p>
            you can save your draft by clicking save, and whenever you reload, it will be there
        </p>
          <p>
            I am sure you will figure out the rest
        </p>
          <p>
            if you have trouble connecting to your wallet, just press disconnect and connect, before selling your art!
            good luck, my friend!
        </p>
        </Modal>

        <Modal
          ariaHideApp={false}
          isOpen={detailsModalIsOpen}
          onRequestClose={closeDetailsModal}
          style={customDetailsStyles}
          contentLabel="Details Modal"
        >
          <form onSubmit={sellArt}>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white px-10 py-8 rounded-xl w-screen shadow-md max-w-sm">
                <div className="space-y-4">
                  <h1 className="text-center text-2xl font-semibold text-gray-600">Describe your art</h1>
                  <div>
                    <label htmlFor="name" className="block mb-1 text-gray-600 font-semibold">Name</label>
                    <input type="text" id="nameVal" className="bg-indigo-50 px-4 py-2 outline-none rounded-md w-full" maxLength="50" minLength="3" />
                  </div>
                  <div>
                    <label htmlFor="desc" className="block mb-1 text-gray-600 font-semibold">Description</label>
                    <input id="descVal" type="text" className="bg-indigo-50 px-4 py-2 outline-none rounded-md w-full" maxLength="100" minLength="3" />
                  </div>
                  {/* <div>
                    <label htmlFor="email" className="block mb-1 text-gray-600 font-semibold">PRICE (in MATIC - Polygon)</label>
                    <input id="priceVal" type="number" min="0" max="999999" step=".001" className="bg-indigo-50 px-4 py-2 outline-none rounded-md w-full" />
                  </div> */}
                  {!Boolean(onlyCreate) && (
                    <div>
                      <label htmlFor="email" className="block mb-1 text-gray-600 font-semibold">PRICE (in MATIC - Polygon)</label>
                      <input id="priceVal" type="number" min="0" max="999999" step=".001" className="bg-indigo-50 px-4 py-2 outline-none rounded-md w-full" />
                    </div>)}
                  <div>
                    <label className="flex items-center">
                      <input onChange={() => { setOnlyCreate(!onlyCreate) }} id="createOnlyVal" type="checkbox" className="form-checkbox" />
                      <span className="ml-2">Put it on PIXA GARAGE market</span>
                    </label>
                  </div>
                </div>
                <button disabled={window.disabled} className="button green-btn">SELL <FontAwesomeIcon icon={faRocket} /></button>
              </div>
              <div>
                <NImage alt="" layout="responsive" width="200" height="200" id="imgToSell" src={imgToUpload}></NImage>
              </div></div>
          </form>
        </Modal>
        <div id="canvas">
          <h3 id="loader" style={{ display: "none" }}>Please wait, your image is being pixelized...</h3><canvas id="myCanvas"
            width="500" height="500" style={{ zoom: 1, border: 1, borderColor: "white", borderStyle: "inset" }}></canvas>
        </div>
        <div id="actions">
          <br />
          <div id="colors"></div>
          <label htmlFor="big-image-file" className="btn"><FontAwesomeIcon icon={faUpload} /> IMAGE</label>
          <input className="images" id="big-image-file" type="file" onChange={() => previewBig()} />

          <label htmlFor="selectFiles" className="btn"><FontAwesomeIcon icon={faFileUpload} /> JSON</label>
          <input className="images" onChange={() => readJson()} type="file" id="selectFiles" multiple />
          <button id="pen" className="button tools" onClick={() => changeTool('pen')}><FontAwesomeIcon icon={faPen} /></button>
          <button id="move" className="button tools" onClick={() => changeTool('move')}><FontAwesomeIcon icon={faArrowsAlt} /></button>
          <button id="bucket" className="button tools" onClick={() => changeTool('bucket')}><FontAwesomeIcon icon={faFillDrip} /></button>

          <button className="button" onClick={() => undo()}><FontAwesomeIcon icon={faUndo} /></button>
          <button className="button" onClick={() => redo()}><FontAwesomeIcon icon={faRedo} /></button>
          <button className="button" onClick={() => downloadJson()}><FontAwesomeIcon icon={faFileExport} /> JSON</button>
          <button id="cb" className="button" onClick={() => setBackground(true)}><FontAwesomeIcon icon={faPaintRoller} /></button>
          <button className="button indian" id="borders" style={{ backgroundColor: "indianred", color: "black" }}
            onClick={() => bordersUpdate()}><FontAwesomeIcon icon={faBorderAll} /></button>
          <button className="button" onClick={() => zoomIn()}><FontAwesomeIcon icon={faSearchPlus} /></button>
          <button className="button" onClick={() => zoomOut()}><FontAwesomeIcon icon={faSearchMinus} /></button>
          <button className="button" onClick={() => clearCanvas()}><FontAwesomeIcon icon={faTrashAlt} /></button>
          <button className="button" onClick={() => saveWork()}><FontAwesomeIcon icon={faSave} /> Save</button>

          <button className="button green-btn" onClick={() => downloadCanvas()}>SELL YOUR ART <FontAwesomeIcon icon={faRocket} /></button>
          <button className="button" onClick={() => openModal('info')}>READ <FontAwesomeIcon icon={faInfo} /></button>
          <hr />

          <input type="color" id="favcolor" name="favcolor" defaultValue={"#000000"} />
          <label htmlFor="brush" id="brushLabel" className="">brush: 0</label>
          <input defaultValue="0" onChange={() => changeBrush()} type="range" id="brush" name="volume" min="0" max="4" />
          <label htmlFor="pixelCoef" id="pixelOffsetLabel" className="">Pixels Offset: 50</label>
          <input defaultValue="50" onChange={() => pixelOffsetUpdate()} type="range" id="pixelOffset" name="volume2" min="5" max="150"
            step="5" />
          <label htmlFor="cols" id="brushLabel" className="">Cols</label>
          <input defaultValue="70" onChange={() => ""} type="number" id="cols" name="cols" min="5" max="70" />
          <label htmlFor="rows" id="brushLabel" className="">Rows</label>
          <input defaultValue="55" onChange={() => ""} type="number" id="rows" name="rows" min="5" max="70" />
          <button className="button" onClick={() => recreateCanvas()}><FontAwesomeIcon icon={faTable} /> resize</button>
          <button className="button" onClick={() => simetrisize('l')}>Mirror Left-Right</button>
          <button className="button" onClick={() => simetrisize('u')}>Mirror Up-Down</button>
          <button className="button collapseBtn" onClick={() => collapseBottom()}><FontAwesomeIcon icon={faArrowDown} /></button>

        </div>
        <button id="hiddenBtn" className="button" onClick={() => collapseBottom()}><FontAwesomeIcon icon={faArrowUp} /></button>
      </div>
    )
  }
  else {
    return (
      <div>
        <Modal
          ariaHideApp={false}
          isOpen={true}
          onRequestClose={closeInfoModal}
          style={customStyles}
          contentLabel="INFO Modal"
        >
          <h2>Info</h2>
          <p>
            Please use laptop and mouse to create your art, will be better!
        </p>
        </Modal>
      </div>
    )
  }

}