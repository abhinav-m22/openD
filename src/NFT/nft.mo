import Debug "mo:base/Debug";
import Nat8 "mo:base/Nat8";
import Principal "mo:base/Principal";

actor class NFT (name: Text, owner: Principal, content: [Nat8]) = this{
    // Debug.print("Success");

    private let itemName = name;
    private var nftOwner = owner;
    private let imgBytes = content;

    public query func getName() : async Text{
        return itemName;
    };

    public query func getOwner() : async Principal{
        return nftOwner;
    };

    public query func getAsset() : async [Nat8]{
        return imgBytes;
    };

    public query func getCanisterId() : async Principal{
        return Principal.fromActor(this);
    };

    public shared(msg) func transferOwnership(newOwner: Principal): async Text {

        if(msg.caller == nftOwner){
            nftOwner := newOwner;
            return "Success";
        }
        else{
            return "Error: Not initiated by NFT Owner";
        };
    };

};