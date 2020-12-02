import {ethers, ContractInterface, Contract} from 'ethers'
import { isEmpty, strToBytes32 } from '../utils/helpers'
import fs from 'fs'
import path from 'path'

export const createProvider = (providerUri: string): ethers.providers.JsonRpcProvider => {
  if (isEmpty(providerUri)) throw Error('Empty web3 provider uri')

  return new ethers.providers.JsonRpcProvider(providerUri)
}

export class Registry {
  static ABI: ContractInterface = fs.readFileSync(path.resolve(__dirname, './abi/registry.abi.json'), 'utf-8');
  private contract: Contract

  constructor(provider: ethers.providers.JsonRpcProvider, address: string) {
    this.contract = new ethers.Contract(address, Registry.ABI, provider)
  }

  getAddress = async (name: string): Promise<string> => this.contract.getAddress(strToBytes32(name))
}
