"use client";

import { useState } from "react";
import { PLANS } from "../lib/pricing";

/** The three plan cards with a monthly / yearly switch. */
export default function PricingPlans() {
  const [yearly, setYearly] = useState(false);

  return (
    <>
      <div className="billing" role="group" aria-label="Billing period">
        <button type="button" aria-pressed={!yearly} onClick={() => setYearly(false)}>Monthly</button>
        <button type="button" aria-pressed={yearly} onClick={() => setYearly(true)}>
          Yearly <span>save 20%</span>
        </button>
      </div>

      <div className="plans">
        {PLANS.map((plan) => {
          const price = yearly ? plan.yearly : plan.monthly;
          return (
            <div key={plan.name} className={plan.featured ? "plan featured" : "plan"}>
              <h3>{plan.name}</h3>
              <p className="plan-for">{plan.for}</p>
              <p className="plan-price">${price}<span>/mo</span></p>
              <p className="plan-billed">
                {price === 0 ? "Free forever" : yearly ? `$${price * 12} billed yearly` : "Billed monthly"}
              </p>
              <p className="plan-minutes">{plan.minutes}</p>
              <ul className="plan-list">
                {plan.highlights.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <a href="/reserve" className={plan.featured ? "btn-pink" : "btn-line"}>Reserve Your Spot</a>
            </div>
          );
        })}
      </div>
    </>
  );
}
