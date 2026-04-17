import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Module de déploiement Trust BTP
 *
 * Ordre de déploiement :
 *   1. TrustScoreRegistry
 *   2. ChantierNFT
 *   3. EscrowVault  (dépend de TrustScoreRegistry + ChantierNFT)
 *   4. Câblage : TrustScoreRegistry.setEscrowVault(vault)
 *   5. Câblage : ChantierNFT.transferOwnership(vault)  ← vault devient owner du NFT
 *   6. Câblage : AaveV3YieldProvider (déployé séparément, optionnel)
 *   7. Câblage : EscrowVault.setAllowedToken(EURC, true)
 *
 * Paramètres (à fournir via --parameters ou ignition/parameters.json) :
 *   owner        — propriétaire de la plateforme (multisig)
 *   treasury     — adresse de la trésorerie (frais + yield)
 *   arbiter      — adresse de l'arbitre des litiges
 *   aavePool     — adresse du Pool Aave V3 (optionnel, si yield activé)
 *   usdcAddress  — adresse du token USDC
 *   aUsdcAddress — adresse de l'aUSDC Aave (optionnel)
 *
 * Adresses Arbitrum Sepolia (début 2026) :
 *   Aave V3 Pool   : 0xBfC91D59fdAA134A4ED45f7B584cAf96D7792Eff
 *   EURC           : à renseigner (Circle EURC sur Arbitrum Sepolia)
 *   aEURC          : à renseigner (aToken Aave correspondant)
 */
const TrustBTPModule = buildModule("TrustBTP", (m) => {
  // Paramètres de déploiement
  const owner = m.getParameter("owner");
  const treasury = m.getParameter("treasury");
  const arbiter = m.getParameter("arbiter");
  const usdcAddress = m.getParameter("usdcAddress");

  // Paramètres optionnels pour le yield provider Aave
  const aavePool = m.getParameter("aavePool");
  const aUsdcAddress = m.getParameter("aUsdcAddress");

  // 1. Déploiement TrustScoreRegistry
  const trustScoreRegistry = m.contract("TrustScoreRegistry", [owner]);

  // 2. Déploiement ChantierNFT (owner provisoire = owner, sera transféré au vault)
  const chantierNFT = m.contract("ChantierNFT", [owner]);

  // 3. Déploiement EscrowVault
  const escrowVault = m.contract("EscrowVault", [
    owner,
    treasury,
    arbiter,
    trustScoreRegistry,
    chantierNFT,
  ]);

  // 4. TrustScoreRegistry → autorise le vault à mettre à jour les scores
  m.call(trustScoreRegistry, "setEscrowVault", [escrowVault], {
    id: "wireRegistry",
  });

  // 5. ChantierNFT → transfère la propriété au vault (seul le vault peut minter)
  m.call(chantierNFT, "transferOwnership", [escrowVault], {
    id: "transferNFTOwnership",
  });

  // 6. Déploiement AaveV3YieldProvider (owner = vault pour qu'il puisse appeler deposit/withdraw)
  const aaveYieldProvider = m.contract("AaveV3YieldProvider", [
    aavePool,
    escrowVault,
  ]);

  // Enregistrement du token USDC dans le yield provider
  m.call(aaveYieldProvider, "registerToken", [usdcAddress, aUsdcAddress], {
    id: "registerUSDC",
  });

  // Connexion du yield provider au vault
  m.call(escrowVault, "setYieldProvider", [aaveYieldProvider], {
    id: "wireYieldProvider",
  });

  // 7. Autorisation du token USDC dans le vault
  m.call(escrowVault, "setAllowedToken", [usdcAddress, true], {
    id: "allowUSDC",
  });

  return { trustScoreRegistry, chantierNFT, escrowVault, aaveYieldProvider };
});

export default TrustBTPModule;
