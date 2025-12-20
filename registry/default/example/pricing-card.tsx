import { Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import NumberFlow from "@number-flow/react";
import { motion } from "motion/react";
import { useState } from "react";

function PricingCard() {
  const [activeTab, setactiveTab] = useState("monthly");
  const [activePlan, setActivePlan] = useState("free");

  const plans = [
    { id: "free", price: 0 },
    {
      id: "starter",
      price: activeTab == "monthly" ? 9.99 : 7.49,
      tag: "popular",
    },
    { id: "pro", price: activeTab == "monthly" ? 19.99 : 17.49 },
  ];

  const tabs = [{ id: "monthly" }, { id: "yearly" }];

  return (
    <div className="w-80 md:w-96 flex flex-col gap-3 p-3 rounded-3xl border-2 border-border bg-card">
      <div className="w-full h-12 flex font-medium rounded-full bg-muted cursor-default">
        {tabs.map((item) => (
          <div
            key={item.id}
            onClick={() => setactiveTab(item.id)}
            className="w-1/2 h-full flex justify-center items-center relative"
          >
            {activeTab == item.id && (
              <motion.div
                layoutId="period"
                className="absolute m-1 rounded-full inset-0 bg-background shadow-sm"
              />
            )}
            <span className="relative z-20 capitalize text-foreground">
              {item.id}
            </span>
          </div>
        ))}
      </div>

      {plans.map((item) => (
        <div
          key={item.id}
          className="relative h-20 rounded-2xl border-2 border-border bg-card"
        >
          {activePlan == item.id && (
            <motion.div
              layoutId="plan-border"
              className="absolute -inset-0.5 rounded-2xl border-2 border-primary z-20"
            />
          )}
          <div
            onClick={() => setActivePlan(item.id)}
            className="h-full px-4 flex items-center justify-between cursor-default"
          >
            <div className="flex flex-col gap-1">
              <h2 className="leading-none font-semibold capitalize text-foreground">
                <span>{item.id} </span>
                {item.tag != null && (
                  <span className="bg-accent text-accent-foreground uppercase text-sm font-medium rounded-lg py-0.5 px-2">
                    Popular
                  </span>
                )}
              </h2>
              <div>
                <span className="font-medium text-foreground">
                  <NumberFlow value={item.price} prefix="$" />
                </span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </div>
            <div className="w-7 h-7 -mt-6 rounded-full border-2 border-border relative">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: activePlan == item.id ? 1 : 0 }}
                className="absolute -inset-0.5 flex items-center justify-center rounded-full bg-primary"
              >
                <HugeiconsIcon
                  icon={Tick02Icon}
                  size={20}
                  className="text-primary-foreground"
                />
              </motion.div>
            </div>
          </div>
        </div>
      ))}
      <button className="bg-primary hover:bg-primary/90 duration-150 text-primary-foreground font-medium py-3 w-full rounded-full">
        Get Started
      </button>
    </div>
  );
}

export default PricingCard;
