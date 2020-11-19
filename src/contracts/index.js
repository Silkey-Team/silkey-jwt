import ethersjs from 'ethers'
import registryAbi from './abi/registry.abi.js'
import { strToBytes32, isEmpty } from '../utils/helpers.js'

const { ethers } = ethersjs

export const createProvider = providerUri => {
  if (isEmpty(providerUri)) throw Error('Empty web3 provider uri')

  return new ethers.providers.JsonRpcProvider(providerUri)
}

export const Registry = function (provider, address) {
  this.contract = new ethers.Contract(address, registryAbi, provider)

  this.getAddress = async name => this.contract.getAddress(strToBytes32(name))
}
