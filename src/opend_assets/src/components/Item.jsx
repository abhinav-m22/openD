import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import { HttpAgent, Actor } from '@dfinity/agent';
import { idlFactory } from "../../../declarations/nft/index";
import { Principal } from '@dfinity/principal';
import Button from "./Button";
import { opend } from "../../../declarations/opend";
import CURRENT_USER_ID from "../index";
import PriceLabel from "./PriceLabel";

function Item(props) {

  const [name, setName] = useState();
  const [owner, setOwner] = useState();
  const [image, setImage] = useState();
  const [button, setButton] = useState();
  const [priceInput, setPriceInput] = useState();
  const [loaderHidden, setLoaderHidden] = useState(true);
  const [blur, setBlur] = useState();
  const [sellStatus, setSellStatus] = useState('');
  const [priceLabel, setPriceLabel] = useState();

  const id = props.id;

  const localHost = "http://localhost:8080/";
  const agent = new HttpAgent({ host: localHost });
  agent.syncTime;
  agent.fetchRootKey();
  let NFTActor;

  async function loadNFT() {
    NFTActor = await Actor.createActor(idlFactory, {
      agent,
      canisterId: id,
    });

    const name = await NFTActor.getName();
    setName(name);

    const owner = await NFTActor.getOwner();
    setOwner(owner.toText());

    const imgData = await NFTActor.getAsset();
    const imgContent = new Uint8Array(imgData);
    const image = URL.createObjectURL(new Blob([imgContent.buffer], { type: "image/png" }));
    setImage(image);

    if (props.role == "collection") {



      const nftIsListed = await opend.isListed(props.id);

      if (nftIsListed) {
        setOwner("OpenD");
        setBlur({ filter: "blur(4px)" });
        setSellStatus("Listed!!")
      }
      else {
        setButton(<Button handleClick={handleSell} text={"Sell"} />)
      }
    }
    else if (props.role == "discover") {

      const originalOwner = await opend.getOriginalOwner(props.id);

      if (originalOwner.toText() != CURRENT_USER_ID.toText()) {
        setButton(<Button handleClick={handleBuy} text={"Buy"} />)
      }

      const price = await opend.getListedNFTPrice(props.id);
        setPriceLabel(<PriceLabel sellPrice={price.toString()} />)

    }
  };

  let price;
  function handleSell() {
    // console.log("Clicked");
    setPriceInput(
      <input
        placeholder="Price in DAM"
        type="number"
        className="price-input"
        value={price}
        onChange={(e) => price = e.target.value}
      />
    );

    setButton(<Button handleClick={sellItem} text={"Confirm"} />)
  }

  async function sellItem() {

    setBlur({ filter: "blur(4px)" });

    setLoaderHidden(false);

    // console.log(price);

    const listingResults = await opend.listItem(props.id, Number(price));
    console.log(listingResults);

    if (listingResults == "Success") {
      const openDID = await opend.getOpenDCanisterID();
      const transferResults = await NFTActor.transferOwnership(openDID);
      console.log(transferResults);

      if (transferResults == "Success") {
        setLoaderHidden(true);
        setButton();
        setPriceInput();
        setOwner("OpenD");
        setSellStatus("Listed!!");
      }
    }
  };

  async function handleBuy() {
    console.log("Clicked");
  };


  useEffect(() => {
    loadNFT();
  }, []);

  return (
    <div className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
          style={blur}
        />
        <div className="lds-ellipsis" hidden={loaderHidden}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="disCardContent-root">
          {priceLabel}
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}<span className="purple-text"> {sellStatus} </span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner}
          </p>
          {priceInput}
          {button}
        </div>
      </div>
    </div>
  );
}

export default Item;
