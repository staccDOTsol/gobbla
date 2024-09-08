import { useEffect, useState } from 'react';
import { raydium } from '@raydium-io/raydium-sdk-v2';
import { Keypair } from '@solana/web3.js';

import { connection, PROGRAMIDS, wallet } from '@raydium-io/raydium-sdk-v2';
import { formatClmmKeys } from '@raydium-io/raydium-sdk-v2';
import { getWalletTokenAccount } from '@raydium-io/raydium-sdk-v2';

type WalletTokenAccounts = Awaited<ReturnType<typeof getWalletTokenAccount>>;
type TestTxInputInfo = {
  walletTokenAccounts: WalletTokenAccounts;
  wallet: Keypair;
};

export function Component() {
  const [total, setTotal] = useState(0);
  const [ammInfos, setAmmInfos] = useState(null);
  const [cpmmInfos, setCpmmInfos] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const walletTokenAccounts = await getWalletTokenAccount(connection, wallet.publicKey);

      const { infos } = await clmmOwnerPositionInfo({
        walletTokenAccounts,
        wallet: wallet,
      });
      console.log('CLMM Infos:', infos);

      const { ammInfos } = await ammInfo({
        walletTokenAccounts,
        wallet: wallet,
      });
      setAmmInfos(ammInfos);
      console.log('AMM Infos:', ammInfos);

      const { cpmmInfos } = await cpmmInfo({
        walletTokenAccounts,
        wallet: wallet,
      });
      setCpmmInfos(cpmmInfos);
      console.log('CPMM Infos:', cpmmInfos);

      // Calculate total deposits in USD
      const totalDeposits = calculateTotalDeposits(ammInfos, cpmmInfos); // {{ edit_1 }}
      setTotal(totalDeposits); // {{ edit_2 }}
    };

    fetchData();
  }, []);

  function calculateTotalDeposits(ammInfos: any, cpmmInfos: any): number {
    // Implement logic to calculate total deposits in USD based on ammInfos and cpmmInfos
    let total = 0;
    // Example logic (replace with actual calculation)
    if (ammInfos) {
      total += ammInfos.reduce((sum: number, info: any) => sum + info.valueInUSD, 0);
    }
    if (cpmmInfos) {
      total += cpmmInfos.reduce((sum: number, info: any) => sum + info.valueInUSD, 0);
    }
    return total;
  }

  async function clmmOwnerPositionInfo(input: TestTxInputInfo) {
    const poolKeys = await formatClmmKeys(PROGRAMIDS.CLMM.toString());

    const infos = await raydium.api.fetchPoolByMints({
      connection,
      poolKeys,
      owner: input.wallet.publicKey,
      tokenAccounts: input.walletTokenAccounts,
    });

    return { infos };
  }

  async function ammInfo(input: TestTxInputInfo) {
    const ammKeys = await formatClmmKeys(PROGRAMIDS.AMM.toString());

    const ammInfos = await raydium.api.fetchAmmInfo({
      connection,
      ammKeys,
      owner: input.wallet.publicKey,
      tokenAccounts: input.walletTokenAccounts,
    });

    return { ammInfos };
  }

  async function cpmmInfo(input: TestTxInputInfo) {
    const cpmmKeys = await formatClmmKeys(PROGRAMIDS.CPMM.toString());

    const cpmmInfos = await raydium.api.fetchCpmmInfo({
      connection,
      cpmmKeys,
      owner: input.wallet.publicKey,
      tokenAccounts: input.walletTokenAccounts,
    });

    return { cpmmInfos };
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <div className="max-w-lg w-full">
        <button
          className="w-full bg-primary text-primary-foreground rounded-lg px-8 py-6 text-center transition-colors hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          onClick={() => {}}
        >
          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold">${total.toFixed(2)}</span> {/* {{ edit_3 }} */}
            <span className="text-lg font-medium text-muted-foreground">Total Deposits</span>
          </div>
        </button>
        {/* Display AMM and CPMM Infos */}
        <div>
          <h2>AMM Infos:</h2>
          <pre>{JSON.stringify(ammInfos, null, 2)}</pre>
          <h2>CPMM Infos:</h2>
          <pre>{JSON.stringify(cpmmInfos, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}