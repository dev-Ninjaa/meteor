import { defineConfig } from '@wagmi/cli'
import { react } from '@wagmi/cli/plugins'
import { monadTestnet } from './src/lib/chains'
import fs from 'fs'

const abi = JSON.parse(fs.readFileSync('./src/lib/bounty-escrow.abi.json', 'utf-8'))

export default defineConfig({
  out: 'src/lib/generated.ts',
  contracts: [
    {
      name: 'BountyEscrow',
      abi,
      address: {
        [monadTestnet.id]: '0xD06122a48bcAfe76E4eAA8CE8922b20a709AA26d',
      },
    },
  ],
  plugins: [react()],
})