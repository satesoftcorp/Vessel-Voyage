import React, { useState } from 'react';
import { X, ArrowRight, DollarSign, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { Stock, UserPortfolio } from '../types';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  stocks: Stock[];
  initialStock?: Stock | null;
  portfolio: UserPortfolio;
  onExecuteTrade: (trade: {
    stock: Stock;
    type: 'BUY' | 'SELL';
    shares: number;
    price: number;
    total: number;
  }) => void;
}

export const TradeModal: React.FC<TradeModalProps> = ({
  isOpen,
  onClose,
  stocks,
  initialStock,
  portfolio,
  onExecuteTrade,
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>(
    initialStock ? initialStock.symbol : stocks[0]?.symbol || 'AAPL'
  );
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'Market' | 'Limit' | 'Stop'>('Market');
  const [shares, setShares] = useState<number>(5);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const currentStock = stocks.find((s) => s.symbol === selectedSymbol) || stocks[0];
  const price = currentStock ? currentStock.price : 0;
  const estimatedTotal = shares * price;
  const maxBuyShares = Math.floor(portfolio.cashBalance / (price || 1));
  const maxSellShares = currentStock?.sharesOwned || 0;

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    if (shares <= 0) return;

    if (tradeType === 'BUY' && estimatedTotal > portfolio.cashBalance) {
      alert('Insufficient funds! Please deposit more cash or reduce share quantity.');
      return;
    }

    if (tradeType === 'SELL' && shares > maxSellShares) {
      alert(`You only own ${maxSellShares} shares of ${currentStock.symbol}.`);
      return;
    }

    onExecuteTrade({
      stock: currentStock,
      type: tradeType,
      shares,
      price,
      total: estimatedTotal,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="trade-stock-modal"
        className="w-full max-w-md rounded-sm border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 shadow-2xl transition-all text-[#1C2434] dark:text-white"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-[#2E3A47]">
          <div>
            <h3 className="text-base font-bold">Instant Trade Terminal</h3>
            <p className="text-[11px] text-[#64748B] dark:text-[#8A99AD]">
              Direct market access with 0% commission
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-sm p-1 text-[#8A99AD] hover:bg-slate-100 dark:hover:bg-[#24303F] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-10 text-center animate-in zoom-in-95">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h4 className="text-base font-bold">Order Executed Successfully!</h4>
            <p className="text-xs text-[#8A99AD] mt-1">
              {tradeType} {shares} shares of {currentStock.symbol} @ ${price.toFixed(2)}
            </p>
          </div>
        ) : (
          <form onSubmit={handleExecute} className="space-y-3 pt-3">
            {/* Buy / Sell Switch */}
            <div className="grid grid-cols-2 gap-1.5 rounded-sm bg-[#F8FAFC] dark:bg-[#24303F] p-1 border border-gray-200 dark:border-[#2E3A47]">
              <button
                type="button"
                id="tab-trade-buy"
                onClick={() => setTradeType('BUY')}
                className={`rounded-xs py-1.5 text-xs font-bold transition-all ${
                  tradeType === 'BUY'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-[#64748B] dark:text-[#8A99AD] hover:text-white'
                }`}
              >
                Buy {currentStock.symbol}
              </button>
              <button
                type="button"
                id="tab-trade-sell"
                onClick={() => setTradeType('SELL')}
                className={`rounded-xs py-1.5 text-xs font-bold transition-all ${
                  tradeType === 'SELL'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-[#64748B] dark:text-[#8A99AD] hover:text-white'
                }`}
              >
                Sell {currentStock.symbol}
              </button>
            </div>

            {/* Select Stock */}
            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] dark:text-[#8A99AD] mb-1">
                Select Stock Asset
              </label>
              <select
                id="select-trade-symbol"
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="w-full rounded-sm border border-gray-200 dark:border-[#2E3A47] bg-[#F8FAFC] dark:bg-[#24303F] p-2 text-xs font-semibold text-[#1C2434] dark:text-white focus:border-blue-600 focus:outline-hidden"
              >
                {stocks.map((s) => (
                  <option key={s.symbol} value={s.symbol}>
                    {s.symbol} - {s.name} (${s.price.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            {/* Order Type */}
            <div className="grid grid-cols-3 gap-1.5">
              {(['Market', 'Limit', 'Stop'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setOrderType(type)}
                  className={`rounded-sm border py-1 text-xs font-semibold transition-colors ${
                    orderType === type
                      ? 'border-blue-600 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'border-gray-200 dark:border-[#2E3A47] text-[#64748B] dark:text-[#8A99AD]'
                  }`}
                >
                  {type} Order
                </button>
              ))}
            </div>

            {/* Shares Input */}
            <div>
              <div className="flex items-center justify-between mb-1 text-[11px]">
                <label className="font-semibold text-[#64748B] dark:text-[#8A99AD]">
                  Number of Shares
                </label>
                <span className="text-[#8A99AD]">
                  {tradeType === 'BUY'
                    ? `Max: ${maxBuyShares} sh`
                    : `Owned: ${maxSellShares} sh`}
                </span>
              </div>
              <input
                id="input-trade-shares"
                type="number"
                min="1"
                max={tradeType === 'BUY' ? maxBuyShares : maxSellShares || 1000}
                value={shares}
                onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full rounded-sm border border-gray-200 dark:border-[#2E3A47] bg-[#F8FAFC] dark:bg-[#24303F] p-2 text-sm font-bold text-[#1C2434] dark:text-white focus:border-blue-600 focus:outline-hidden"
              />

              {/* Quick increment buttons */}
              <div className="mt-1.5 flex gap-1">
                {[1, 5, 10, 25, 50].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setShares(qty)}
                    className="flex-1 rounded-sm border border-gray-200 dark:border-[#2E3A47] bg-[#F8FAFC] dark:bg-[#24303F] py-0.5 text-[11px] font-semibold text-[#64748B] dark:text-[#8A99AD] hover:bg-slate-200 dark:hover:bg-[#2E3A47]"
                  >
                    +{qty}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setShares(tradeType === 'BUY' ? Math.max(1, maxBuyShares) : maxSellShares)
                  }
                  className="flex-1 rounded-sm border border-blue-500/30 bg-blue-500/10 py-0.5 text-[11px] font-bold text-blue-600"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Order Summary Box */}
            <div className="rounded-sm border border-gray-200 dark:border-[#2E3A47] bg-[#F8FAFC] dark:bg-[#24303F] p-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-[#64748B] dark:text-[#8A99AD] text-[11px]">
                <span>Market Price per Share:</span>
                <span className="font-semibold text-[#1C2434] dark:text-white">
                  ${price.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-[#64748B] dark:text-[#8A99AD] text-[11px]">
                <span>Brokerage & SEC Fees:</span>
                <span className="font-semibold text-emerald-500">$0.00 (Zero Fee)</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 dark:border-[#2E3A47] pt-1.5 font-bold text-xs">
                <span>Estimated Total:</span>
                <span
                  className={`text-sm font-bold ${
                    tradeType === 'BUY' ? 'text-blue-600 dark:text-blue-400' : 'text-rose-500'
                  }`}
                >
                  ${estimatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="btn-confirm-trade"
              className={`flex w-full items-center justify-center gap-1.5 rounded-sm py-2.5 text-xs font-bold text-white shadow-sm transition-all ${
                tradeType === 'BUY'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
              }`}
            >
              <span>
                Confirm {tradeType} Order ({shares} Shares)
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
