import { useState } from 'react';

/**
 * 상점(Shop) 컴포넌트의 상태 및 비즈니스 로직을 관리하는 커스텀 훅입니다.
 */
export function useShopTrade() {
  const [sellAmounts, setSellAmounts] = useState<Record<string, number>>({});

  const updateSellAmount = (resource: string, amount: number) => {
    setSellAmounts((prev) => ({ ...prev, [resource]: amount }));
  };

  const resetSellAmount = (resource: string) => {
    setSellAmounts((prev) => ({ ...prev, [resource]: 0 }));
  };

  return {
    sellAmounts,
    updateSellAmount,
    resetSellAmount,
  };
}
