import Debug "mo:base/Debug";
import Nat8 "mo:base/Nat8";
import Principal "mo:base/Principal";

actor class NFT (name: Text, owner: Principal, content: [Nat8]) {
    // Debug.print("Success");

    let itemName = name;
    let nftOwner = owner;
    let imgBytes = content;

    public query func getName() : async Text{
        return itemName;
    };

    public query func getOwner() : async Principal{
        return nftOwner;
    };

    public query func getAsset() : async [Nat8]{
        return imgBytes;
    };

};