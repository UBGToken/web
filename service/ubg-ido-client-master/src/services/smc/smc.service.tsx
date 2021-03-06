import { Store } from "redux";
import Web3 from "web3";

import { getEnv } from "../../AppConfigs";
import { AppService } from "../app";
import { RESET_SMC_WALLET_DATA, SET_SMC_WALLET_DATA, SET_SMC_WALLET_ERROR, SET_SMC_WALLET_FETCHING } from "./smcWallet.reducer";
import { Contract, ContractMain, ContractToken, ESMCStatus, Ethereum } from "./smc.types";
import { SET_SMC_STATUS } from "./smc.reducer";
import { SET_SMC_POOLS_DATA, SET_SMC_POOLS_ERROR, SET_SMC_POOLS_FETCHING } from "./smcPools.reducer";
import { NumberUtils } from "../../modules";
import { CookieService, ECookieVariable } from "../cookie";
import { ContractConfig, contracts } from "../../data/contracts";
import { SET_IDO_INVESTOR, SET_IDO_PRICE, SET_IDO_TOKEN_NAME } from "./ido.reducer";

export class SmcService {
  static isInitialized: boolean = false;
  static address: string;
  static configs: ContractConfig;
  static ethereum: Ethereum;
  static web3: Web3;

  static contractIDO: Contract;
  static contractAirdrop: Contract;
  static contractIDOToken: Contract;


  static async initialize(store: Store): Promise<any> {
    if (this.isInitialized) return;

    try {
      const { ethereum } = window as any;
      if (typeof ethereum === 'undefined') throw Error('META_MASK_NOT_INSTALLED');
      this.ethereum = ethereum;

      // Events
      ethereum.on('accountsChanged', () => window.location.reload());
      ethereum.on('chainChanged', () => window.location.reload());

      // Load config in
      if (getEnv('ENV') === 'production') this.configs = contracts.production
      else this.configs = contracts.development;

      this.web3 = new Web3(ethereum);

      // Check wallet
      let accounts = await ethereum.request({ method: 'eth_accounts' });
      if (accounts[0]) this.address = this.web3.utils.toChecksumAddress(accounts[0]);

      // Contracts
      this.contractAirdrop = new this.web3.eth.Contract(this.configs['SMC_AIRDROP_ABI'], this.configs['SMC_AIRDROP_ADDRESS'], { from: this.address });
      this.contractIDO = new this.web3.eth.Contract(this.configs['SMC_IDO_ABI'], this.configs['SMC_IDO_ADDRESS'], { from: this.address });
      this.contractIDOToken = new this.web3.eth.Contract(this.configs['SMC_IDO_TOKEN_ABI'], this.configs['SMC_IDO_TOKEN_ADDRESS'], { from: this.address });

      // Fetch user wallet
      ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          this.address = this.web3.utils.toChecksumAddress(accounts[0]);
          if (this.address) {
            this.fetchIdoInvestor(store);
          }

        });

      // Fetch pools

      await this.fetchIdoPrice(store);
      await this.fetchIDOTokenName(store);

      if (this.address) {
        await this.fetchIdoInvestor(store);
        store.dispatch({ type: SET_SMC_STATUS, status: ESMCStatus.READY });
      } else {
        store.dispatch({ type: SET_SMC_STATUS, status: ESMCStatus.WALLET_MUST_BE_CONNECTED });
      }

    } catch (error) {
      const errorMesage = this.handleSMCError(error);
      store.dispatch({ type: SET_SMC_STATUS, status: ESMCStatus.ERROR, error: errorMesage });
    }
  }

  static async handleConnectWallet() {
    try {
      await this.ethereum.request({ method: 'eth_requestAccounts' });
    } catch (error) {
      AppService.createErrNoti(error.message);
    }
  }

  static handleSMCError(error: Error, isAlert = false): string {
    if (error.message === `Returned values aren't valid, did it run Out of Gas? You might also see this error if you are not using the correct ABI for the contract you are retrieving data from, requesting data from a block number that does not exist, or querying a node which is not fully synced.`) {
      const message = `You're connected to an unsupported network.`;
      if (isAlert) AppService.createErrNoti(message);
      return message;
    } else {
      return error.message;
    }
  }

  static getLinkTransactionByHash(tx: string) {
    return `${this.configs['SMC_DOMAIN_URL']}/tx/${tx}`;
  }

  static getRefCode(): string {
    return CookieService.get(ECookieVariable.USER_AFFILIATE_CODE) || this.configs['SMC_ROOT_ADDRESS'];
  }

  // ============================ Start IDO Features ============================
  static convertAmount(type: 'decode' | 'encode', amount: number): number | string {
    const decimals = 18;
    return NumberUtils.cryptoConvert(type, +amount, decimals);
  }

  static async fetchIdoInvestor(store: Store) {
    const data = await this.contractIDO.methods.investors(this.address).call();
    const isClaimed = await this.contractIDO.methods.claimed(this.address).call();
    const isRegistered = +data.tokenSwapped > 0;
    store.dispatch({ type: SET_IDO_INVESTOR, data: { ...data, isClaimed, isRegistered } });
  }

  static async fetchIdoPrice(store: Store) {
    const data = await this.contractIDO.methods.price().call().then(res => (+res * 0.000000001));
    store.dispatch({ type: SET_IDO_PRICE, data });
  }

  static async fetchIDOTokenName(store: Store) {
    const data = await this.contractIDOToken.methods.symbol().call();
    store.dispatch({ type: SET_IDO_TOKEN_NAME, data });
  }

  static async buyToken(store: Store, affiliateCode: string, amount: number) {
    const payableAmount = this.convertAmount('encode', amount);
    const refer = affiliateCode || this.configs.SMC_ROOT_ADDRESS;
    try {
      await this.contractIDO.methods
        .buyToken(refer)
        .send({ value: payableAmount });
      await this.fetchIdoInvestor(store);
      AppService.createSuccessNoti('Buy token successful.');
    } catch (error) {
      console.log(error);
      this.handleSMCError(error, true);
    }
  }

  static async claim(store: Store, affiliateCode: string) {
    const refer = affiliateCode || this.configs.SMC_ROOT_ADDRESS;
    try {
      await this.contractAirdrop.methods
        .claim(refer)
        .send();
      await this.fetchIdoInvestor(store);
      AppService.createSuccessNoti('Claim successful.');
    } catch (error) {
      console.log(error);
      this.handleSMCError(error, true);
    }
  }
  // ============================ End IDO Features ============================
}