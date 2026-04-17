import { network } from "hardhat";

const NFT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 

async function main() {
  const { ethers } = await network.connect()
  const nft = await ethers.getContractAt("ChantierNFT", NFT_ADDRESS)

  // tokenId == chantierId, on scanne les premiers IDs
  const MAX_SCAN = 20
  let found = 0

  for (let i = 0; i <= MAX_SCAN; i++) {
    try {
      const uri = await nft.tokenURI(i)
      const json = Buffer.from(uri.replace("data:application/json;base64,", ""), "base64").toString()
      console.log(`\n--- Token #${i} ---`)
      console.log(JSON.parse(json))
      found++
    } catch {
      // token non minté, on continue
    }
  }

  if (found === 0) {
    console.log("Aucun NFT minté (IDs 0–20). Lance d'abord un chantier via EscrowVault.")
  }
}

main()