import {WalletManager, TargetNode, AddressType, NodeConfigurationData, BlockData} from '../walletManager';
import * as cfdjs from 'cfd-js/index.d';


export interface UtxoData {
    outpoint: string;
    txid: string;
    vout: number;
    amount: bigint | number;
    address: string;
    descriptor: string;
    lockingScript: string;
    blockHash: string;
    blockHeight: number;
    asset?: string;
    confidentialKey?: string;
    assetBlinder?: string;
    amountBlinder?: string;
    coinbase: boolean;
    spent: boolean;
    solvable: boolean;
    extend: {[key: string]: string};
}

export interface AddressData {
    pubkey?: string;
    path?: string;
    address: string;
    type: string;
    lockingScript: string;
    descriptor: string;
    label: string;
    multisig?: boolean;
    pubkeyMap?: {[key: string]: string[]};
    extra: {[key: string]: string[]};
}

export interface FundRawTxResponse {
    hex: string;
    fee: bigint | number;
}

export interface AmountByAddress {
    address: string;
    amount: bigint | number;
}

export interface AmountByAsset {
    asset: string;
    amount: bigint | number;
}

export interface GetBalanceResponse {
    [asset: string]: bigint | number;
}

export interface OutPoint {
    txid: string;
    vout: number;
}

export interface GetSignatureData extends OutPoint {
    pubkey: string;
    signature: string;
    sighashtype: string;
}

export interface ErrorOutPoint extends OutPoint {
    error: string;
}

export interface GetSignaturesResponse {
    signatures: GetSignatureData[];
    complete: boolean;
    errors: ErrorOutPoint[];
}

export interface SignResponse {
    hex: string;
    complete: boolean;
    errors: ErrorOutPoint[];
}

export interface SendToAddressResponse extends OutPoint {
    hex: string;
}

/**
 * Wallet class.
 */
export class Wallet {
  /**
   * constructor.
   * @param {string} userNamePrefix user name prefix.
   * @param {number} userIndex user index.
   * @param {string} dirPath directory path.
   * @param {string} network network type.
   * @param {string} masterXprivkey master xprivkey.
   * @param {NodeConfigurationData} nodeConfig node config.
   * @param {WalletManager} manager wallet manager.
   * @param {boolean} inMemoryDatabase use in-memory database.
   */
  constructor(userNamePrefix: string, userIndex: number, dirPath: string,
      network: string, masterXprivkey: string,
      nodeConfig: NodeConfigurationData, manager: WalletManager,
      inMemoryDatabase: boolean);

  getCfd(): cfdjs;

  initialize(): Promise<boolean>;

  getTarget(): TargetNode;

  checkConnection(): Promise<boolean>;

  callbackUpdateBlock(tipBlockCount: number, blockHashList: string[],
    blockTxMap: { [key: string]: BlockData }): Promise<boolean>;

  forceUpdateUtxoData(): Promise<boolean>;

  generate(count: number, address: string,
    nowait: boolean): Promise<AmountByAddress>;

  generateFund(satoshiAmount: bigint | number,
    nowait: boolean): Promise<bigint | number>;

  // estimateMode: UNSET or CONSERVATIVE or ECONOMICAL
  sendToAddress(address: string, satoshiAmount: bigint | number,
      asset: string, estimateMode: string, feeRateForUnset: number,
      targetConf: number): Promise<SendToAddressResponse>;

  createRawTransaction(version: number, locktime: number,
      txin: TxInRequest[] | ElementsTxInRequest[],
      txout: TxOutRequest[] | ElementsTxOutRequest[],
      fee: AmountByAsset): string;

  getNewAddress(addressType: AddressType | AddressKind | undefined,
      label: string, targetIndex: number,
      hasFeeAddress: boolean): Promise<AddressData>;

  getAddresses(): Promise<AddressData[]>;

  getAddressesByLabel(label: string): Promise<AddressData[]>;

  getAddressInfo(address: string): Promise<AddressData>;

  addMultisigAddress(pubkeys: string[], requireNum: number,
      addressType: AddressType | AddressKind,
      label: string): Promise<AddressData>;

  getScriptAddress(script: string,
      addressType: AddressType | AddressKind, label: string,
      relatedPubkeys: string[]): Promise<AddressData>;

  dumpPrivkey(address: string, pubkey: string): Promise<string>;

  estimateSmartFee(confTarget: number, estimateMode: string): void;

  setGapLimit(limit: number): void;

  setAddressType(addressType: AddressType | AddressKind): void;

  convertAddressType(addressType: AddressType | AddressKind,
      isScript: boolean): AddressType;

  getBalance(minimumConf: number, address: string, path: string,
      asset: string): Promise<GetBalanceResponse>;

  listUnspent(minimumConf: number, maximumConf: number,
      address: string, path: string, asset: string): Promise<UtxoData[]>;

  getMempoolUtxoCount(): Promise<number>;

  getUtxoBlockIds(): Promise<string[]>;

  setMinimumFeeRate(minimumFeeRate: number): Promise<void>

  decodeRawTransaction(tx: string):
      cfdjs.DecodeRawTransactionResponse |
      cfdjs.ElementsDecodeRawTransactionResponse;

  fundRawTransaction(tx: string,
      feeAsset: string): Promise<FundRawTxResponse>;

  signRawTransactionWithWallet(tx: string, ignoreError: boolean,
      prevtxs: OutPoint[],
      sighashtype: string): Promise<SignResponse>;

  getSignatures(tx: string, ignoreError: boolean,
      prevtxs: OutPoint[],
      sighashtype: string): Promise<GetSignaturesResponse>;

  sendRawTransaction(tx: string): Promise<string>;

  getWalletTxData(txid: string, vout: number): Promise<UtxoData>;
};