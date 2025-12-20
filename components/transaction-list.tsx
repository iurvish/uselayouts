import { motion } from "motion/react";
import { Dispatch, SetStateAction } from "react";
import { X } from "lucide-react";
import { Transaction } from "../constants/transactions";

interface Props {
  transaction: Transaction;
  setSelectedTransaction: Dispatch<SetStateAction<Transaction | null>>;
}

export function SelectedTransactionWrapper({
  transaction,
  setSelectedTransaction,
}: Props) {
  return (
    <motion.div
      key="transaction-detail"
      layoutId="wrapper"
      className="absolute bg-white shadow border-[1.5px] border-black/10 w-80 p-4 rounded-3xl flex flex-col gap-4 cursor-default"
    >
      <div className="flex justify-between">
        <motion.div
          layoutId={`icon-${transaction.id}`}
          className="w-14 h-14 bg-black flex items-center justify-center"
          style={{ borderRadius: 12 }}
        >
          {transaction.icon}
        </motion.div>

        <span
          onClick={() => setSelectedTransaction(null)}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-400 cursor-pointer"
        >
          <X size={20} className="stroke-white" />
        </span>
      </div>
      <div className="flex justify-between">
        <motion.div layoutId={`header-${transaction.id}`}>
          <h3 className="leading-none capitalize font-medium">
            {transaction.name}
          </h3>
          <h4 className="leading-none capitalize text-gray-500">
            {transaction.type}
          </h4>
        </motion.div>
        <motion.span
          layoutId={`amount-${transaction.id}`}
          className="font-medium text-gray-500"
        >
          -${transaction.amount}
        </motion.span>
      </div>
      <div className="w-full border-b-2 border-dotted border-gray-300" />
      <div className="flex flex-col text-sm text-gray-500">
        <span className="capitalize">{transaction.id}</span>
        <span className="capitalize">{transaction.date}</span>
        <span className="capitalize">{transaction.time}</span>
      </div>
      <div className="w-full border-b-2 border-dotted border-gray-300" />
      <div className="flex flex-col text-sm text-gray-500">
        <span>
          Paid via <span>{transaction.paymentMethod.type}</span>
        </span>
        <div className="flex items-center gap-2">
          <span>{transaction.paymentMethod.account}</span>
          <span>{transaction.paymentMethod.icon}</span>
        </div>
      </div>
    </motion.div>
  );
}
