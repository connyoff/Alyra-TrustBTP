import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Module de déploiement Arbitrum Sepolia (testnet) — avec vrai pool Aave V3 + vrai USDC
 *
 * Contexte :
 *   - Aave V3 est disponible sur Arbitrum Sepolia avec USDC réel (token de test Circle/Aave).
 *   - Les transactions deposit/withdraw seront visibles sur Arbiscan Sepolia à l'adresse
 *     du pool Aave V3 (0xBfC91D59fdAA134A4ED45f7B584cAf96D7792Eff).
 *   - En production (Arbitrum mainnet), ce module sera remplacé par TrustBTP.ts
 *     avec les vraies adresses mainnet.
 *
 * Adresses Arbitrum Sepolia (officielles — bgd-labs/aave-address-book) :
 *   Aave V3 Pool  : 0xBfC91D59fdAA134A4ED45f7B584cAf96D7792Eff
 *   USDC          : 0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d
 *   aUSDC         : 0x460b97BD498E1157530AEb3086301d5225b91216
 *
 * Obtenir du USDC de test :
 *   → https://app.aave.com/faucet/ (sélectionner Arbitrum Sepolia + USDC)
 *
 * Paramètres requis (ignition/parameters.sepolia.json ou --parameters) :
 *   owner        — propriétaire de la plateforme (ex: adresse dev wallet)
 *   treasury     — adresse de la trésorerie
 *   arbiter      — adresse de l'arbitre des litiges
 *
 * Usage :
 *   npx hardhat ignition deploy ignition/modules/SepoliaTrustBTP.ts \
 *     --network arbitrumSepolia --parameters ignition/parameters.sepolia.json
 */

// ── Adresses Arbitrum Sepolia (fixes — ne pas mettre en paramètres) ───────────
const AAVE_V3_POOL  = "0xBfC91D59fdAA134A4ED45f7B584cAf96D7792Eff";
const USDC_ADDRESS  = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d";
const AUSDC_ADDRESS = "0x460b97BD498E1157530AEb3086301d5225b91216";

const SepoliaTrustBTPModule = buildModule("SepoliaTrustBTP", (m) => {
  const owner    = m.getParameter("owner");
  const treasury = m.getParameter("treasury");
  const arbiter  = m.getParameter("arbiter");

  // ── 1. Contrats principaux ─────────────────────────────────────────────────

  const trustScoreRegistry = m.contract("TrustScoreRegistry", [owner]);

  const chantierNFT = m.contract("ChantierNFT", [owner]);

  const escrowVault = m.contract("EscrowVault", [
    owner,
    treasury,
    arbiter,
    trustScoreRegistry,
    chantierNFT,
  ]);

  // ── 2. Câblage registry et NFT ────────────────────────────────────────────

  m.call(trustScoreRegistry, "setEscrowVault", [escrowVault], {
    id: "wireRegistry",
  });

  m.call(chantierNFT, "transferOwnership", [escrowVault], {
    id: "transferNFTOwnership",
  });

  // ── 3. AaveV3YieldProvider ────────────────────────────────────────────────
  //
  // Propriétaire initial = owner (EOA du déployeur) pour pouvoir appeler
  // registerToken() depuis Ignition. Transféré ensuite au vault.

  const aaveYieldProvider = m.contract("AaveV3YieldProvider", [AAVE_V3_POOL, owner], {
    id: "AaveV3YieldProvider",
  });

  // Enregistrement USDC ↔ aUSDC dans le provider
  m.call(aaveYieldProvider, "registerToken", [USDC_ADDRESS, AUSDC_ADDRESS], {
    id: "registerUSDC",
  });

  // Transfert de propriété → EscrowVault (seul autorisé à appeler deposit/withdraw)
  m.call(aaveYieldProvider, "transferOwnership", [escrowVault], {
    id: "transferYieldProviderOwnership",
  });

  // ── 4. Câblage vault ──────────────────────────────────────────────────────

  m.call(escrowVault, "setYieldProvider", [aaveYieldProvider], {
    id: "wireYieldProvider",
  });

  // ── 5. Autorisation du token USDC dans le vault ───────────────────────────

  m.call(escrowVault, "setAllowedToken", [USDC_ADDRESS, true], {
    id: "allowUSDC",
  });

  return {
    trustScoreRegistry,
    chantierNFT,
    escrowVault,
    aaveYieldProvider,
  };
});

export default SepoliaTrustBTPModule;
