import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const usdc = (amount: number) => BigInt(amount) * 10n ** 6n;

const DEVIS    = usdc(10_000);
const DEPOSIT  = (DEVIS * 11_000n) / 10_000n; // 11 000 USDC
const PROOF    = ethers.keccak256(ethers.toUtf8Bytes("preuve-v1"));
const DESCS    = ["Fondations", "Gros œuvre", "Couverture", "Second œuvre", "Finitions"];
const MONTANTS = [usdc(2_000), usdc(2_000), usdc(2_000), usdc(2_000), usdc(2_000)];
const DEADLINES = [1893456000n, 1893456000n, 1893456000n, 1893456000n, 1893456000n];

/** Génère une signature EIP-2612 permit */
async function signPermit(
  token: any,
  owner: any,
  spender: string,
  value: bigint,
  deadline: bigint
) {
  const domain = await token.eip712Domain();
  const nonce  = await token.nonces(owner.address);
  const sig = await owner.signTypedData(
    {
      name: domain.name,
      version: domain.version,
      chainId: domain.chainId,
      verifyingContract: domain.verifyingContract,
    },
    {
      Permit: [
        { name: "owner",    type: "address" },
        { name: "spender",  type: "address" },
        { name: "value",    type: "uint256" },
        { name: "nonce",    type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    },
    { owner: owner.address, spender, value, nonce, deadline }
  );
  return ethers.Signature.from(sig);
}

/** Retourne un deadline 1 heure dans le futur */
async function futureDeadline(): Promise<bigint> {
  const block = await ethers.provider.getBlock("latest");
  return BigInt(block!.timestamp) + 3600n;
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite de tests
// ─────────────────────────────────────────────────────────────────────────────

describe("Yield — MockYieldProvider", () => {
  let owner: any, treasury: any, arbiter: any;
  let particulier: any, artisan: any;
  let vault: any, registry: any, nft: any;
  let mockUSDC: any, mockYieldProvider: any;

  // ── Setup ────────────────────────────────────────────────────────────────

  async function deployer() {
    [owner, treasury, arbiter, particulier, artisan] = await ethers.getSigners();

    // Mock USDC (6 décimales, EIP-2612 permit)
    const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
    mockUSDC = await ERC20Mock.deploy("Mock USDC", "USDC", 6);
    await mockUSDC.mint(particulier.address, usdc(100_000));

    // TrustScoreRegistry
    const Registry = await ethers.getContractFactory("TrustScoreRegistry");
    registry = await Registry.deploy(owner.address);

    // ChantierNFT
    const NFT = await ethers.getContractFactory("ChantierNFT");
    nft = await NFT.deploy(owner.address);

    // EscrowVault
    const Vault = await ethers.getContractFactory("EscrowVault");
    vault = await Vault.deploy(
      owner.address,
      treasury.address,
      arbiter.address,
      await registry.getAddress(),
      await nft.getAddress()
    );

    // Câblage
    await registry.connect(owner).setEscrowVault(await vault.getAddress());
    await nft.connect(owner).transferOwnership(await vault.getAddress());
    await vault.connect(owner).setAllowedToken(await mockUSDC.getAddress(), true);

    // MockYieldProvider — owner = vault (seul le vault peut deposit/withdraw)
    const MockProvider = await ethers.getContractFactory("MockYieldProvider");
    mockYieldProvider = await MockProvider.deploy(await vault.getAddress());

    // Branchement du provider au vault
    await vault.connect(owner).setYieldProvider(await mockYieldProvider.getAddress());
  }

  // ── Helpers de scénarios ─────────────────────────────────────────────────

  async function soumettreDevis(): Promise<bigint> {
    const tx = await vault.connect(artisan).submitDevis(
      particulier.address,
      await mockUSDC.getAddress(),
      DEVIS,
      "Rénovation appartement T3",
      DESCS,
      MONTANTS,
      DEADLINES
    );
    const receipt = await tx.wait();
    const ev = receipt?.logs
      .map((l: any) => { try { return vault.interface.parseLog(l); } catch { return null; } })
      .find((e: any) => e?.name === "DevisSoumis");
    return ev?.args?.chantierId ?? 0n;
  }

  /** Crée un chantier actif avec yieldOptIn=true */
  async function creerChantierAvecYield(): Promise<bigint> {
    const id       = await soumettreDevis();
    const deadline = await futureDeadline();
    const sig      = await signPermit(mockUSDC, particulier, await vault.getAddress(), DEPOSIT, deadline);
    await vault.connect(particulier).acceptDevisWithPermit(id, true, deadline, sig.v, sig.r, sig.s);
    return id;
  }

  /** Crée un chantier actif SANS yieldOptIn */
  async function creerChantierSansYield(): Promise<bigint> {
    const id       = await soumettreDevis();
    const deadline = await futureDeadline();
    const sig      = await signPermit(mockUSDC, particulier, await vault.getAddress(), DEPOSIT, deadline);
    await vault.connect(particulier).acceptDevisWithPermit(id, false, deadline, sig.v, sig.r, sig.s);
    return id;
  }

  /** Valide le jalon courant (artisan) et l'accepte (particulier) */
  async function validerEtAccepterJalon(chantierId: bigint) {
    await vault.connect(artisan).validateJalon(chantierId, PROOF);
    await vault.connect(particulier).acceptJalon(chantierId);
  }

  beforeEach(deployer);

  // ── 1. MockYieldProvider — déploiement ───────────────────────────────────

  describe("MockYieldProvider — déploiement", () => {
    it("providerName retourne 'Mock Yield Provider'", async () => {
      expect(await mockYieldProvider.providerName()).to.equal("Mock Yield Provider");
    });

    it("totalValue est 0 avant tout dépôt", async () => {
      expect(await mockYieldProvider.totalValue(await mockUSDC.getAddress())).to.equal(0n);
    });

    it("pendingYield est 0 avant tout dépôt", async () => {
      expect(await mockYieldProvider.pendingYield(await mockUSDC.getAddress(), 0n)).to.equal(0n);
    });

    it("le vault est bien owner du provider", async () => {
      expect(await mockYieldProvider.owner()).to.equal(await vault.getAddress());
    });
  });

  // ── 2. Dépôt lors de l'acceptation du devis ──────────────────────────────

  describe("acceptDevisWithPermit — yieldOptIn=true", () => {
    it("les tokens vont dans le MockYieldProvider (pas dans le vault)", async () => {
      await creerChantierAvecYield();
      expect(await mockUSDC.balanceOf(await mockYieldProvider.getAddress())).to.equal(DEPOSIT);
      expect(await mockUSDC.balanceOf(await vault.getAddress())).to.equal(0n);
    });

    it("yieldPrincipal est mis à jour dans le vault", async () => {
      await creerChantierAvecYield();
      expect(await vault.yieldPrincipal(await mockUSDC.getAddress())).to.equal(DEPOSIT);
    });

    it("totalValue reflète le dépôt", async () => {
      await creerChantierAvecYield();
      expect(await mockYieldProvider.totalValue(await mockUSDC.getAddress())).to.equal(DEPOSIT);
    });

    it("émet l'événement DevisAccepte avec yieldOptIn=true", async () => {
      const id       = await soumettreDevis();
      const deadline = await futureDeadline();
      const sig      = await signPermit(mockUSDC, particulier, await vault.getAddress(), DEPOSIT, deadline);
      await expect(
        vault.connect(particulier).acceptDevisWithPermit(id, true, deadline, sig.v, sig.r, sig.s)
      ).to.emit(vault, "DevisAccepte").withArgs(id, particulier.address, DEPOSIT, true);
    });
  });

  describe("acceptDevisWithPermit — yieldOptIn=false", () => {
    it("les tokens restent dans le vault", async () => {
      await creerChantierSansYield();
      expect(await mockUSDC.balanceOf(await vault.getAddress())).to.equal(DEPOSIT);
      expect(await mockUSDC.balanceOf(await mockYieldProvider.getAddress())).to.equal(0n);
    });

    it("yieldPrincipal reste à 0", async () => {
      await creerChantierSansYield();
      expect(await vault.yieldPrincipal(await mockUSDC.getAddress())).to.equal(0n);
    });
  });

  // ── 3. Simulation du yield ────────────────────────────────────────────────

  describe("Simulation de yield (mint → MockYieldProvider)", () => {
    it("pendingYield retourne 0 sans yield simulé", async () => {
      await creerChantierAvecYield();
      const usdcAddr = await mockUSDC.getAddress();
      const principal = await vault.yieldPrincipal(usdcAddr);
      expect(await mockYieldProvider.pendingYield(usdcAddr, principal)).to.equal(0n);
    });

    it("pendingYield reflète le yield simulé après mint", async () => {
      await creerChantierAvecYield();
      const usdcAddr   = await mockUSDC.getAddress();
      const yieldAmount = usdc(500); // simule 500 USDC de yield

      // Simulation : mint des tokens supplémentaires directement au provider
      await mockUSDC.mint(await mockYieldProvider.getAddress(), yieldAmount);

      const principal = await vault.yieldPrincipal(usdcAddr);
      expect(await mockYieldProvider.pendingYield(usdcAddr, principal)).to.equal(yieldAmount);
    });

    it("totalValue = principal + yield simulé", async () => {
      await creerChantierAvecYield();
      const usdcAddr    = await mockUSDC.getAddress();
      const yieldAmount = usdc(300);

      await mockUSDC.mint(await mockYieldProvider.getAddress(), yieldAmount);

      expect(await mockYieldProvider.totalValue(usdcAddr)).to.equal(DEPOSIT + yieldAmount);
    });
  });

  // ── 4. collecterYield ─────────────────────────────────────────────────────

  describe("collecterYield()", () => {
    it("transfère le yield simulé vers la trésorerie", async () => {
      await creerChantierAvecYield();
      const usdcAddr    = await mockUSDC.getAddress();
      const yieldAmount = usdc(750);

      await mockUSDC.mint(await mockYieldProvider.getAddress(), yieldAmount);

      const treasuryBefore = await mockUSDC.balanceOf(treasury.address);
      await vault.connect(owner).collecterYield(usdcAddr);
      const treasuryAfter = await mockUSDC.balanceOf(treasury.address);

      expect(treasuryAfter - treasuryBefore).to.equal(yieldAmount);
    });

    it("le provider ne contient plus que le principal après collecte", async () => {
      await creerChantierAvecYield();
      const usdcAddr    = await mockUSDC.getAddress();
      const yieldAmount = usdc(200);

      await mockUSDC.mint(await mockYieldProvider.getAddress(), yieldAmount);
      await vault.connect(owner).collecterYield(usdcAddr);

      expect(await mockYieldProvider.totalValue(usdcAddr)).to.equal(DEPOSIT);
    });

    it("pendingYield est 0 après collecte", async () => {
      await creerChantierAvecYield();
      const usdcAddr    = await mockUSDC.getAddress();
      const yieldAmount = usdc(100);

      await mockUSDC.mint(await mockYieldProvider.getAddress(), yieldAmount);
      await vault.connect(owner).collecterYield(usdcAddr);

      const principal = await vault.yieldPrincipal(usdcAddr);
      expect(await mockYieldProvider.pendingYield(usdcAddr, principal)).to.equal(0n);
    });

    it("émet l'événement YieldCollecte", async () => {
      await creerChantierAvecYield();
      const usdcAddr    = await mockUSDC.getAddress();
      const yieldAmount = usdc(50);

      await mockUSDC.mint(await mockYieldProvider.getAddress(), yieldAmount);

      await expect(vault.connect(owner).collecterYield(usdcAddr))
        .to.emit(vault, "YieldCollecte")
        .withArgs(usdcAddr, yieldAmount);
    });

    it("revert si pas de yield accumulé", async () => {
      await creerChantierAvecYield();
      await expect(
        vault.connect(owner).collecterYield(await mockUSDC.getAddress())
      ).to.be.revertedWith("EscrowVault: pas de yield");
    });

    it("seul le owner peut appeler collecterYield", async () => {
      await creerChantierAvecYield();
      const usdcAddr = await mockUSDC.getAddress();
      await mockUSDC.mint(await mockYieldProvider.getAddress(), usdc(100));
      await expect(
        vault.connect(artisan).collecterYield(usdcAddr)
      ).to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
    });

    it("collecte multiple : deux simulations successives", async () => {
      await creerChantierAvecYield();
      const usdcAddr = await mockUSDC.getAddress();

      // Première simulation + collecte
      await mockUSDC.mint(await mockYieldProvider.getAddress(), usdc(100));
      await vault.connect(owner).collecterYield(usdcAddr);

      // Deuxième simulation + collecte
      await mockUSDC.mint(await mockYieldProvider.getAddress(), usdc(200));
      const treasuryBefore = await mockUSDC.balanceOf(treasury.address);
      await vault.connect(owner).collecterYield(usdcAddr);
      const treasuryAfter = await mockUSDC.balanceOf(treasury.address);

      expect(treasuryAfter - treasuryBefore).to.equal(usdc(200));
    });
  });

  // ── 5. Flux jalons avec yieldOptIn ───────────────────────────────────────

  describe("Flux jalons — yieldOptIn=true", () => {
    it("l'artisan est payé depuis le provider lors de l'acceptation d'un jalon", async () => {
      const id = await creerChantierAvecYield();
      const artisanBefore = await mockUSDC.balanceOf(artisan.address);

      await validerEtAccepterJalon(id);

      const artisanAfter = await mockUSDC.balanceOf(artisan.address);
      // Net = 98% du jalon (2% = frais plateforme)
      const jalonAmount = usdc(2_000);
      const frais = (jalonAmount * 200n) / 10_000n;
      const net   = jalonAmount - frais;

      expect(artisanAfter - artisanBefore).to.equal(net);
    });

    it("yieldPrincipal diminue du montant brut du jalon", async () => {
      const id      = await creerChantierAvecYield();
      const usdcAddr = await mockUSDC.getAddress();

      await validerEtAccepterJalon(id);

      const jalonAmount = usdc(2_000);
      expect(await vault.yieldPrincipal(usdcAddr)).to.equal(DEPOSIT - jalonAmount);
    });

    it("le provider conserve le surplus (frais) après paiement du jalon", async () => {
      const id = await creerChantierAvecYield();
      await validerEtAccepterJalon(id);

      const jalonAmount = usdc(2_000);
      const frais       = (jalonAmount * 200n) / 10_000n;

      // Provider : DEPOSIT - net (les frais restent dans le provider au-dessus du yieldPrincipal)
      const net              = jalonAmount - frais;
      const providerBalance  = await mockUSDC.balanceOf(await mockYieldProvider.getAddress());
      const expectedBalance  = DEPOSIT - net;
      expect(providerBalance).to.equal(expectedBalance);
    });

    it("collecterYield récupère les frais accumulés dans le provider", async () => {
      const id = await creerChantierAvecYield();
      await validerEtAccepterJalon(id);

      const usdcAddr    = await mockUSDC.getAddress();
      const jalonAmount = usdc(2_000);
      const frais       = (jalonAmount * 200n) / 10_000n;

      // Les frais sont au-dessus du principal → pendingYield les inclut
      const principal = await vault.yieldPrincipal(usdcAddr);
      const pending   = await mockYieldProvider.pendingYield(usdcAddr, principal);
      expect(pending).to.equal(frais);

      // collecterYield transfère les frais vers la trésorerie
      const treasuryBefore = await mockUSDC.balanceOf(treasury.address);
      await vault.connect(owner).collecterYield(usdcAddr);
      const treasuryAfter = await mockUSDC.balanceOf(treasury.address);
      expect(treasuryAfter - treasuryBefore).to.equal(frais);
    });

    it("flux complet 5 jalons : buffer retourné au particulier depuis le provider", async () => {
      const id = await creerChantierAvecYield();

      for (let i = 0; i < 5; i++) {
        await validerEtAccepterJalon(id);
      }

      const c = await vault.chantiers(id);
      expect(c.status).to.equal(5n); // Completed

      // Buffer = DEPOSIT - DEVIS = 10% du devis, retourné au particulier à la clôture
      // (solde initial = 100 000 USDC, - DEPOSIT + buffer = 100 000 - DEVIS)
      const soldeParticulier = await mockUSDC.balanceOf(particulier.address);
      expect(soldeParticulier).to.equal(usdc(100_000) - DEVIS);
    });
  });

  // ── 6. cancelChantier avec yieldOptIn ────────────────────────────────────

  describe("cancelChantier — yieldOptIn=true", () => {
    it("les fonds sont retirés du provider avant distribution", async () => {
      const id = await creerChantierAvecYield();

      const artisanBefore     = await mockUSDC.balanceOf(artisan.address);
      const particulierBefore = await mockUSDC.balanceOf(particulier.address);

      await vault.connect(particulier).cancelChantier(id);

      const premierJalon     = usdc(2_000);
      const remboursement    = DEPOSIT - premierJalon;

      expect(await mockUSDC.balanceOf(artisan.address)).to.equal(artisanBefore + premierJalon);
      expect(await mockUSDC.balanceOf(particulier.address)).to.equal(particulierBefore + remboursement);
      // Provider est vide après l'annulation
      expect(await mockUSDC.balanceOf(await mockYieldProvider.getAddress())).to.equal(0n);
    });

    it("yieldPrincipal est remis à 0 après annulation", async () => {
      const id = await creerChantierAvecYield();
      await vault.connect(particulier).cancelChantier(id);
      expect(await vault.yieldPrincipal(await mockUSDC.getAddress())).to.equal(0n);
    });
  });

  // ── 7. Swap de provider (prod-readiness) ─────────────────────────────────

  describe("setYieldProvider — swap vers un nouveau provider", () => {
    it("l'owner peut changer de provider sans changer le code", async () => {
      // Déploie un second MockYieldProvider (simule le swap vers AaveV3YieldProvider en prod)
      const MockProvider2 = await ethers.getContractFactory("MockYieldProvider");
      const mockYieldProvider2 = await MockProvider2.deploy(await vault.getAddress());

      await expect(
        vault.connect(owner).setYieldProvider(await mockYieldProvider2.getAddress())
      ).to.emit(vault, "YieldProviderMisAJour");

      expect(await vault.yieldProvider()).to.equal(await mockYieldProvider2.getAddress());
    });

    it("seul le owner peut changer le provider", async () => {
      const MockProvider2 = await ethers.getContractFactory("MockYieldProvider");
      const mockYieldProvider2 = await MockProvider2.deploy(await vault.getAddress());

      await expect(
        vault.connect(artisan).setYieldProvider(await mockYieldProvider2.getAddress())
      ).to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
    });
  });
});
