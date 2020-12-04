import {Contract, ethers} from 'ethers'
import {strToBytes32} from '../utils/helpers'
import {registryAbi} from './abi/registry.abi'

export const createProvider = (
  providerUri: string | undefined
): ethers.providers.JsonRpcProvider => {
  if (!providerUri) throw Error('Empty web3 provider uri')

  return new ethers.providers.JsonRpcProvider(providerUri)
}

export class Registry {
  private contract: Contract

  constructor(provider: ethers.providers.JsonRpcProvider, address: string) {
    this.contract = new ethers.Contract(address, registryAbi, provider)
  }

  getAddress = async (name: string): Promise<string> => this.contract.getAddress(strToBytes32(name))
}
