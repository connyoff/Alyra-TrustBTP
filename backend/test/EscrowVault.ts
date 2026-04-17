import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const usdc = (amount: number) => BigInt(amount) * 10n ** 6n;

/** Valeurs des enums — doivent correspondre à l'ordre dans DataTypes.sol */
const ChantierStatus = {
  DevisSubmitted: 0n,
  DevisRejected: 1n,
  Active: 2n,
  Paused: 3n,
  InLitige: 4n,
  Completed: 5n,
  Cancelled: 6n,
};

const JalonStatus = {
  Pending: 0n,
  Finished: 1n,
  Accepted: 2n,
  AcceptedWithReserves: 3n,
  PaidWithReserves: 4n,
  InLitige: 5n,
  ReservesLifted: 6n,
};

// ─────────────────────────────────────────────────────────────────────────────
// Suite de tests
// ─────────────────────────────────────────────────────────────────────────────

describe("EscrowVault", () => {
  let owner: any, treasury: any, arbiter: any;
  let particulier: any, artisan: any, stranger: any;
  let vault: any, registry: any, nft: any, mockUSDC: any;

  const DEVIS = usdc(10_000);
  const DEPOSIT = (DEVIS * 11_000n) / 10_000n; // 11 000 USDC
  const PROOF = ethers.keccak256(ethers.toUtf8Bytes("preuve-v1"));
  const DESCS = ["Fondations", "Gros œuvre", "Couverture", "Second œuvre", "Finitions"];
  const MONTANTS = [usdc(2_000), usdc(2_000), usdc(2_000), usdc(2_000), usdc(2_000)];
  // Deadlines fictives (1er jan 2030, timestamps fixes bien dans le futur)
  const DEADLINES = [1893456000n, 1893456000n, 1893456000n, 1893456000n, 1893456000n];

  /**
   * Génère une signature EIP-2612 permit.
   * Utilise eip712Domain() d'OZ v5 pour récupérer name/version/chainId.
   */
  async function signPermit(
    token: any,
    owner: any,
    spender: string,
    value: bigint,
    deadline: bigint
  ) {
    const domain = await token.eip712Domain();
    const nonce = await token.nonces(owner.address);

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

  /** Retourne un deadline 1 heure dans le futur (suffisant pour les tests) */
  async function futureDeadline(): Promise<bigint> {
    const block = await ethers.provider.getBlock("latest");
    return BigInt(block!.timestamp) + 3600n;
  }

  async function deployer() {
    [owner, treasury, arbiter, particulier, artisan, stranger] = await ethers.getSigners();

    // Token ERC-20 mock avec EIP-2612 permit (USDC 6 décimales)
    const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
    mockUSDC = await ERC20Mock.deploy("Mock USDC", "USDC", 6);
    await mockUSDC.mint(particulier.address, usdc(100_000));

    // TrustScoreRegistry
    const Registry = await ethers.getContractFactory("TrustScoreRegistry");
    registry = await Registry.deploy(owner.address);

    // ChantierNFT (owner provisoire = owner, sera transféré au vault)
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

    // Câblage : registry autorise le vault
    await registry.connect(owner).setEscrowVault(await vault.getAddress());
    // Câblage : vault devient owner du NFT (seul le vault peut minter)
    await nft.connect(owner).transferOwnership(await vault.getAddress());
    // Vault autorise USDC
    await vault.connect(owner).setAllowedToken(await mockUSDC.getAddress(), true);
    // Pas d'approve() préalable — on utilise EIP-2612 permit dans acceptDevisWithPermit()
  }

  /** Soumet un devis standard (5 jalons de 2 000 USDC) et retourne le chantierId */
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

  /** Soumet puis accepte un devis via permit — retourne le chantierId */
  async function creerChantierActif(): Promise<bigint> {
    const id = await soumettreDevis();
    const deadline = await futureDeadline();
    const sig = await signPermit(
      mockUSDC,
      particulier,
      await vault.getAddress(),
      DEPOSIT,
      deadline
    );
    await vault.connect(particulier).acceptDevisWithPermit(
      id, false, deadline, sig.v, sig.r, sig.s
    );
    return id;
  }

  beforeEach(deployer);

  // ── Déploiement ─────────────────────────────────────────────────────────────

  describe("Déploiement", () => {
    it("configure les adresses correctement", async () => {
      expect(await vault.owner()).to.equal(owner.address);
      expect(await vault.arbiter()).to.equal(arbiter.address);
      expect(await vault.treasury()).to.equal(treasury.address);
    });

    it("USDC est autorisé", async () => {
      expect(await vault.allowedTokens(await mockUSDC.getAddress())).to.be.true;
    });
  });

  // ── Soumission du devis ──────────────────────────────────────────────────────

  describe("submitDevis()", () => {
    it("crée le chantier en statut DevisSubmitted", async () => {
      const id = await soumettreDevis();
      const c = await vault.chantiers(id);
      expect(c.status).to.equal(ChantierStatus.DevisSubmitted);
      expect(c.artisan).to.equal(artisan.address);
      expect(c.particulier).to.equal(particulier.address);
      expect(c.devisAmount).to.equal(DEVIS);
      expect(c.depositAmount).to.equal(0n); // pas encore déposé
    });

    it("émet DevisSoumis", async () => {
      await expect(
        vault.connect(artisan).submitDevis(particulier.address, await mockUSDC.getAddress(), DEVIS, "Test", DESCS, MONTANTS, DEADLINES)
      ).to.emit(vault, "DevisSoumis");
    });

    it("rejette un token non autorisé", async () => {
      const Fake = await ethers.getContractFactory("ERC20Mock");
      const fake = await Fake.deploy("Fake", "FAKE", 6);
      await expect(
        vault.connect(artisan).submitDevis(particulier.address, await fake.getAddress(), DEVIS, "Test", DESCS, MONTANTS, DEADLINES)
      ).to.be.revertedWithCustomError(vault, "TokenNonAutorise");
    });

    it("rejette si la somme des jalons ≠ devis", async () => {
      const mauvais = [usdc(1_000), usdc(2_000), usdc(2_000), usdc(2_000), usdc(2_000)];
      await expect(
        vault.connect(artisan).submitDevis(particulier.address, await mockUSDC.getAddress(), DEVIS, "Test", DESCS, mauvais, DEADLINES)
      ).to.be.revertedWithCustomError(vault, "SommeJalonsMismatch");
    });

    it("rejette avec 0 jalons", async () => {
      await expect(
        vault.connect(artisan).submitDevis(particulier.address, await mockUSDC.getAddress(), DEVIS, "Test", [], [], [])
      ).to.be.revertedWithCustomError(vault, "NombreJalonsInvalide");
    });
  });

  // ── Refus du devis ───────────────────────────────────────────────────────────

  describe("rejectDevis()", () => {
    it("marque le chantier DevisRejected sans transfert de fonds", async () => {
      const id = await soumettreDevis();
      const avant = await mockUSDC.balanceOf(particulier.address);
      await vault.connect(particulier).rejectDevis(id);
      const apres = await mockUSDC.balanceOf(particulier.address);

      expect((await vault.chantiers(id)).status).to.equal(ChantierStatus.DevisRejected);
      expect(avant).to.equal(apres); // aucun mouvement de fonds
    });

    it("émet DevisRefuse", async () => {
      const id = await soumettreDevis();
      await expect(vault.connect(particulier).rejectDevis(id))
        .to.emit(vault, "DevisRefuse").withArgs(id, particulier.address);
    });

    it("rejette si appelé par un tiers", async () => {
      const id = await soumettreDevis();
      await expect(vault.connect(stranger).rejectDevis(id))
        .to.be.revertedWithCustomError(vault, "PasLeParticulier");
    });
  });

  // ── Acceptation du devis (EIP-2612) ─────────────────────────────────────────

  describe("acceptDevisWithPermit()", () => {
    it("prélève 110% via permit et passe le chantier en Active", async () => {
      const avant = await mockUSDC.balanceOf(particulier.address);
      const id = await creerChantierActif();
      const apres = await mockUSDC.balanceOf(particulier.address);

      expect(avant - apres).to.equal(DEPOSIT);
      expect((await vault.chantiers(id)).status).to.equal(ChantierStatus.Active);
      expect((await vault.chantiers(id)).depositAmount).to.equal(DEPOSIT);
    });

    it("minte 1 NFT détenu par le vault (tokenId = chantierId)", async () => {
      const id = await creerChantierActif();
      expect(await nft.ownerOf(id)).to.equal(await vault.getAddress());
    });

    it("le NFT est non-transférable (soulbound)", async () => {
      const id = await creerChantierActif();
      await expect(
        nft.connect(owner).transferFrom(await vault.getAddress(), stranger.address, id)
      ).to.be.revertedWithCustomError(nft, "Soulbound");
    });

    it("le tokenURI contient les données du devis en base64", async () => {
      const id = await creerChantierActif();
      const uri = await nft.tokenURI(id);
      expect(uri).to.match(/^data:application\/json;base64,/);
    });

    it("les statuts des jalons sont initialisés à Pending dans le NFT", async () => {
      const id = await creerChantierActif();
      const statuts = await nft.getJalonStatuses(id);
      expect(statuts.length).to.equal(5);
      statuts.forEach((s: bigint) => expect(s).to.equal(0n)); // 0 = Pending
    });

    it("le statut du jalon est mis à jour dans le NFT après validateJalon", async () => {
      const id = await creerChantierActif();
      await vault.connect(artisan).validateJalon(id, PROOF);
      expect(await nft.getJalonStatus(id, 0)).to.equal(1n); // 1 = Finished
    });

    it("le statut du jalon passe à Accepted dans le NFT après acceptJalon", async () => {
      const id = await creerChantierActif();
      await vault.connect(artisan).validateJalon(id, PROOF);
      await vault.connect(particulier).acceptJalon(id);
      expect(await nft.getJalonStatus(id, 0)).to.equal(2n); // 2 = Accepted
    });

    it("rejette si appelé par un tiers (modifier avant permit)", async () => {
      const id = await soumettreDevis();
      const deadline = await futureDeadline();
      // La signature n'est pas validée car le modifier PasLeParticulier revert en premier
      const sig = await signPermit(
        mockUSDC,
        stranger,
        await vault.getAddress(),
        DEPOSIT,
        deadline
      );
      await expect(
        vault.connect(stranger).acceptDevisWithPermit(id, false, deadline, sig.v, sig.r, sig.s)
      ).to.be.revertedWithCustomError(vault, "PasLeParticulier");
    });

    it("rejette si le permit est expiré", async () => {
      const id = await soumettreDevis();
      // Deadline dans le passé
      const block = await ethers.provider.getBlock("latest");
      const deadline = BigInt(block!.timestamp) - 1n;
      const sig = await signPermit(
        mockUSDC,
        particulier,
        await vault.getAddress(),
        DEPOSIT,
        deadline
      );
      // Le permit échoue silencieusement (try/catch) puis safeTransferFrom échoue
      // car l'allowance n'a pas été mise à jour
      await expect(
        vault.connect(particulier).acceptDevisWithPermit(id, false, deadline, sig.v, sig.r, sig.s)
      ).to.be.revert(ethers);
    });
  });

  // ── Chemin nominal — 5 jalons sans réserve ───────────────────────────────────

  describe("Chemin nominal — 5 jalons acceptés sans réserve", () => {
    it("artisan reçoit 98% du devis, buffer 10% retourné au particulier", async () => {
      const id = await creerChantierActif();
      const artisanAvant = await mockUSDC.balanceOf(artisan.address);
      const particulierAvant = await mockUSDC.balanceOf(particulier.address);

      for (let i = 0; i < 5; i++) {
        await vault.connect(artisan).validateJalon(id, PROOF);
        await vault.connect(particulier).acceptJalon(id);
      }

      const artisanApres = await mockUSDC.balanceOf(artisan.address);
      const particulierApres = await mockUSDC.balanceOf(particulier.address);

      // 98% de 10 000 = 9 800 USDC pour l'artisan
      const attenduArtisan = (DEVIS * (10_000n - 200n)) / 10_000n;
      expect(artisanApres - artisanAvant).to.equal(attenduArtisan);

      // Buffer 10% = 1 000 USDC retourné au particulier
      expect(particulierApres - particulierAvant).to.equal(DEPOSIT - DEVIS);

      expect((await vault.chantiers(id)).status).to.equal(ChantierStatus.Completed);
    });
  });

  // ── Auto-validation 48h ──────────────────────────────────────────────────────

  describe("triggerAutoValidation()", () => {
    it("échoue avant 48h", async () => {
      const id = await creerChantierActif();
      await vault.connect(artisan).validateJalon(id, PROOF);
      await expect(vault.triggerAutoValidation(id))
        .to.be.revertedWithCustomError(vault, "AutoValidationPasPrete");
    });

    it("valide automatiquement après 48h", async () => {
      const id = await creerChantierActif();
      await vault.connect(artisan).validateJalon(id, PROOF);

      await ethers.provider.send("evm_increaseTime", [48 * 3600 + 1]);
      await ethers.provider.send("evm_mine", []);

      await expect(vault.triggerAutoValidation(id))
        .to.emit(vault, "JalonAutoValide").withArgs(id, 0n);
    });
  });

  // ── Réserves mineures ────────────────────────────────────────────────────────

  describe("Réserves mineures", () => {
    it("bloque 10% + 3% pénalité ; artisan accuse réception ; particulier lève", async () => {
      const id = await creerChantierActif();
      await vault.connect(artisan).validateJalon(id, PROOF);

      const preuveClient = ethers.keccak256(ethers.toUtf8Bytes("preuve-client"));
      await vault.connect(particulier).acceptJalonWithMinorReserves(id, preuveClient);

      const j = await vault.getJalon(id, 0);
      const JALON = usdc(2_000);
      expect(j.blockedAmount).to.equal((JALON * 1_000n) / 10_000n); // 200 USDC
      expect(j.penaltyAmount).to.equal((JALON * 300n) / 10_000n);   // 60 USDC

      // Accusé de réception → paiement partiel
      const avant = await mockUSDC.balanceOf(artisan.address);
      await vault.connect(artisan).acknowledgeReserves(id, true);
      const apres = await mockUSDC.balanceOf(artisan.address);
      expect(apres - avant).to.equal(JALON - j.blockedAmount - j.penaltyAmount); // 1 740 USDC

      // Levée des réserves → déblocage des 200 USDC
      const avant2 = await mockUSDC.balanceOf(artisan.address);
      await vault.connect(particulier).lifterReserves(id);
      const apres2 = await mockUSDC.balanceOf(artisan.address);
      expect(apres2 - avant2).to.equal(j.blockedAmount);

      expect((await vault.chantiers(id)).currentJalonIndex).to.equal(1n);
    });

    it("refus artisan → litige ouvert", async () => {
      const id = await creerChantierActif();
      await vault.connect(artisan).validateJalon(id, PROOF);
      await vault.connect(particulier).acceptJalonWithMinorReserves(
        id, ethers.keccak256(ethers.toUtf8Bytes("preuve-client"))
      );
      await vault.connect(artisan).acknowledgeReserves(id, false);
      expect((await vault.chantiers(id)).status).to.equal(ChantierStatus.InLitige);
    });
  });

  // ── Réserves majeures ────────────────────────────────────────────────────────

  describe("Réserves majeures — pause chantier", () => {
    it("suspend le chantier et permet la reprise", async () => {
      const id = await creerChantierActif();
      await vault.connect(artisan).validateJalon(id, PROOF);
      await vault.connect(particulier).acceptJalonWithMajorReserves(
        id, ethers.keccak256(ethers.toUtf8Bytes("preuve-majeure"))
      );
      expect((await vault.chantiers(id)).status).to.equal(ChantierStatus.Paused);

      await vault.connect(particulier).resumeChantier(id);
      expect((await vault.chantiers(id)).status).to.equal(ChantierStatus.Active);
      expect((await vault.getJalon(id, 0)).status).to.equal(JalonStatus.Pending);
    });
  });

  // ── Résolution de litige ─────────────────────────────────────────────────────

  describe("resolveLitige()", () => {
    async function ouvrirLitige(): Promise<bigint> {
      const id = await creerChantierActif();
      await vault.connect(artisan).validateJalon(id, PROOF);
      await vault.connect(particulier).acceptJalonWithMinorReserves(
        id, ethers.keccak256(ethers.toUtf8Bytes("preuve-client"))
      );
      await vault.connect(artisan).acknowledgeReserves(id, false);
      return id;
    }

    it("artisan en tort → remboursement particulier calculé depuis j.amount brut", async () => {
      const id = await ouvrirLitige();
      const avant = await mockUSDC.balanceOf(particulier.address);
      await vault.connect(arbiter).resolveLitige(id, true, 2_000, 500);
      const apres = await mockUSDC.balanceOf(particulier.address);

      // Nouvelle logique : calcul depuis j.amount entier (blockedAmount ignoré)
      // Le crédit 3% précédent est annulé avant ce calcul (Option A)
      const JALON = usdc(2_000);
      const retenue  = (JALON * 2_000n) / 10_000n; // 400 USDC
      const penalite = (JALON * 500n)   / 10_000n;  // 100 USDC
      expect(apres - avant).to.equal(JALON - retenue - penalite); // 1 500 USDC
      expect((await vault.chantiers(id)).status).to.equal(ChantierStatus.Active);
    });

    it("particulier en tort → artisan reçoit jalon net de 2% (pas de penaltyBps)", async () => {
      const id = await ouvrirLitige();
      const avant = await mockUSDC.balanceOf(artisan.address);
      // penaltyBps ignoré quand particulier est en tort
      await vault.connect(arbiter).resolveLitige(id, false, 0, 0);
      const apres = await mockUSDC.balanceOf(artisan.address);

      // Artisan reçoit j.amount × 98% (frais plateforme 2% fixes)
      const JALON = usdc(2_000);
      const PLATFORM_FEE_BPS = 200n;
      expect(apres - avant).to.equal(JALON - (JALON * PLATFORM_FEE_BPS) / 10_000n); // 1 960 USDC
    });

    it("particulier en tort → buffer non retourné à la clôture", async () => {
      const id = await ouvrirLitige();
      await vault.connect(arbiter).resolveLitige(id, false, 0, 0);

      // Valider les jalons restants (jalon 0 vient d'être résolu, jalons 1 et 2 à faire)
      const chantier = await vault.chantiers(id);
      const jalonCount = Number(chantier.jalonCount);
      const avantCloture = await mockUSDC.balanceOf(particulier.address);

      for (let i = 1; i < jalonCount; i++) {
        await vault.connect(artisan).validateJalon(id, PROOF);
        await vault.connect(particulier).acceptJalon(id);
      }

      const apresCloture = await mockUSDC.balanceOf(particulier.address);
      // Le particulier ne reçoit rien (ni buffer, ni jalon — tout le dépôt a été consommé)
      expect(apresCloture).to.equal(avantCloture);
      expect((await vault.chantiers(id)).status).to.equal(ChantierStatus.Completed);
    });

    it("rejette si appelé par un tiers", async () => {
      const id = await ouvrirLitige();
      await expect(vault.connect(stranger).resolveLitige(id, true, 2_000, 500))
        .to.be.revertedWithCustomError(vault, "PasLArbiter");
    });
  });

  // ── Annulation ───────────────────────────────────────────────────────────────

  describe("cancelChantier()", () => {
    it("artisan reçoit le 1er jalon, particulier récupère le reste", async () => {
      const id = await creerChantierActif();
      const artisanAvant = await mockUSDC.balanceOf(artisan.address);
      const particulierAvant = await mockUSDC.balanceOf(particulier.address);

      await vault.connect(particulier).cancelChantier(id);

      const artisanApres = await mockUSDC.balanceOf(artisan.address);
      const particulierApres = await mockUSDC.balanceOf(particulier.address);

      const premierJalon = usdc(2_000);
      expect(artisanApres - artisanAvant).to.equal(premierJalon);
      expect(particulierApres - particulierAvant).to.equal(DEPOSIT - premierJalon);
      expect((await vault.chantiers(id)).status).to.equal(ChantierStatus.Cancelled);
    });

    it("rejette si un jalon a déjà démarré", async () => {
      const id = await creerChantierActif();
      await vault.connect(artisan).validateJalon(id, PROOF);
      await expect(vault.connect(particulier).cancelChantier(id))
        .to.be.revertedWith("EscrowVault: jalon deja demarre");
    });

    it("rejette si appelé par un tiers", async () => {
      const id = await creerChantierActif();
      await expect(vault.connect(stranger).cancelChantier(id))
        .to.be.revertedWithCustomError(vault, "PasLeParticulier");
    });
  });

  // ── Contrôle d'accès ─────────────────────────────────────────────────────────

  describe("Contrôle d'accès", () => {
    it("seul l'artisan peut valider un jalon", async () => {
      const id = await creerChantierActif();
      await expect(vault.connect(stranger).validateJalon(id, PROOF))
        .to.be.revertedWithCustomError(vault, "PasLArtisan");
    });

    it("seul le particulier peut accepter un jalon", async () => {
      const id = await creerChantierActif();
      await vault.connect(artisan).validateJalon(id, PROOF);
      await expect(vault.connect(stranger).acceptJalon(id))
        .to.be.revertedWithCustomError(vault, "PasLeParticulier");
    });

    it("seul le owner peut ajouter un token", async () => {
      await expect(vault.connect(stranger).setAllowedToken(await mockUSDC.getAddress(), false))
        .to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
    });
  });
});
