import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import { HttpAgent, Actor } from '@dfinity/agent';
import { idlFactory } from "../../../declarations/nft/index";
import { Principal } from '@dfinity/principal';
import Button from "./Button";
import { opend } from "../../../declarations/opend";

function Item(props) {

  const [name, setName] = useState();
  const [owner, setOwner] = useState();
  const [image, setImage] = useState();
  const [button, setButton] = useState();
  const [priceInput, setPriceInput] = useState();

  const id = props.id;

  const localHost = "http://localhost:8080/";
  const agent = new HttpAgent({ host: localHost });
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

    setButton(<Button handleClick={handleSell} text={"Sell"} />)
  }

  let price;
  function handleSell() {
    // console.log("Clicked");
    setPriceInput(
      <input
      placeholder="Price in DANG"
      type="number"
      className="price-input"
      value={price}
      onChange={(e) => price = e.target.value}
    />
    );

    setButton(<Button handleClick={sellItem} text={"Confirm"} />)
  }

  async function sellItem(){
    // console.log(price);

    const listingResults = await opend.listItem(props.id, Number(price));
    console.log(listingResults);

    if(listingResults == "Success"){
      const openDID = await opend.getOpenDCanisterID();
      const transferResults = await NFTActor.transferOwnership(openDID);
      console.log(transferResults);
    }
  }


  useEffect(() => {
    loadNFT();
  }, []);

  return (
    <div className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
        />
        <div className="disCardContent-root">
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}<span className="purple-text"></span>
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
