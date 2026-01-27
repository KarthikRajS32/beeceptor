import React, { useState } from "react";
import { Check } from "lucide-react";

const Price = ({ onLoginClick, onSignUpClick, isAuthenticated = false, user = null, onLogout }) => {
  const [billingCycle, setBillingCycle] = useState("monthly"); // "monthly" | "yearly"

  const plans = [
    {
      name: "Individual",
      price: billingCycle === "monthly" ? "5" : "50",
      features: [
        "1000 Responsive",
        "rules",
        "private",
        "Dynamic Responsive",
        "local Tunnel",
        "CRUD APIs",
        "Open Mock server",
        "Live Request",
        "Email Support",
      ],
      highlight: false,
    },
    {
      name: "Team",
      price: billingCycle === "monthly" ? "10" : "100",
      features: [
        "10000 Responsive",
        "rules",
        "private",
        "Dynamic Responsive",
        "local Tunnel",
        "CRUD APIs",
        "Open Mock server",
        "Live Request",
        "Email Support",
      ],
      highlight: true,
      badge: "Popular",
    },
    {
      name: "Scale",
      price: billingCycle === "monthly" ? "20" : "200",
      features: [
        "10000 Responsive",
        "rules",
        "private",
        "Dynamic Responsive",
        "local Tunnel",
        "CRUD APIs",
        "Open Mock server",
        "Live Request",
        "Email Support",
      ],
      highlight: false,
    },
  ];

  const comparisonFeatures = [
    "10000 Responsive",
    "rules",
    "private",
    "local Tunnel",
    "Dynamic Responsive",
    "Live Request",
    "Email Support",
    "Open Mock server",
  ];

  return (
    <div className="text-gray-900 flex flex-col font-sans overflow-x-hidden">

      <main className="flex-1 pt-8 pb-24 px-4 sm:px-6 lg:px-8 relative">
        {/* Background Glow Effect */}
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-100/40 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Hero Section */}
          <div className="text-center mb-20 space-y-6">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
              Select a Plan That Power{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                <br />
                Your success
              </span>
            </h1>
            <p className="text-gray-600 text-lg font-light max-w-xl mx-auto">
              Upgrade only when you need advanced <br />
              features.
            </p>

            {/* Toggle Switch */}
            <div className="flex items-center justify-center pt-8">
              <div className="bg-white p-1.5 rounded-xl flex items-center border border-gray-200 shadow-sm">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-8 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    billingCycle === "monthly"
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle("yearly")}
                  className={`px-8 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    billingCycle === "yearly"
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Yearly
                  <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded uppercase ${
                    billingCycle === "yearly" 
                      ? "bg-white/20 text-white" 
                      : "bg-blue-100 text-blue-700"
                  }`}>
                    20% Off
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center mb-32">
            {plans.map((plan, idx) => (
              <div
                key={plan.name}
                className={`relative rounded-3xl p-8 transition-all duration-500 hover:translate-y-[-4px] ${
                  plan.highlight
                    ? "bg-white border-2 border-blue-600 scale-105 z-20 shadow-2xl"
                    : "bg-white border border-gray-200 shadow-xl z-10 hover:border-blue-300 hover:shadow-2xl"
                }`}
              >
                {plan.badge && (
                  <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-blue-600 px-4 py-1 rounded-full text-[12px] font-bold tracking-widest uppercase text-white shadow-lg">
                    {plan.badge}
                  </span>
                )}

                <div className="mb-8 p-4">
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-medium text-gray-500">
                      $
                    </span>
                    <span className="text-6xl font-black text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-sm text-gray-500">
                      /month
                    </span>
                  </div>
                </div>

                <ul className="space-y-4 mb-10 px-4">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-sm font-medium"
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        plan.highlight ? "bg-blue-100" : "bg-gray-100 group-hover:bg-blue-50"
                      }`}>
                         <Check className={`w-3 h-3 ${
                           plan.highlight ? "text-blue-600" : "text-gray-500"
                         }`} />
                      </div>
                      <span className="text-gray-600">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-4 rounded-xl text-sm font-bold transition-all ${
                    plan.highlight
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-blue-600/30"
                      : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-600"
                  }`}
                >
                  Buy Now
                </button>
              </div>
            ))}
          </div>

          {/* Subscriptions Section */}
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">Subscriptions</h2>
              <p className="text-gray-600 font-light">
                Choose a plan that grows with your projects.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/50">
                      <th className="px-8 py-8 text-xl font-bold text-gray-900">Access</th>
                      <th className="px-8 py-8 text-center text-lg font-medium text-gray-600">
                        Individual
                      </th>
                      <th className="px-8 py-8 text-center text-lg font-medium text-blue-600">
                        Team
                      </th>
                      <th className="px-8 py-8 text-center text-lg font-medium text-gray-600">
                        Scale
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {comparisonFeatures.map((feature) => (
                      <tr
                        key={feature}
                        className="group hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-8 py-6 text-gray-600 font-medium whitespace-nowrap">
                          {feature}
                        </td>
                        <td className="px-8 py-6 text-center">
                          <div className="flex justify-center">
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                              <Check className="text-green-600 w-4 h-4" />
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center bg-blue-50/30">
                          <div className="flex justify-center">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                              <Check className="text-blue-600 w-4 h-4" />
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <div className="flex justify-center">
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                              <Check className="text-green-600 w-4 h-4" />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default Price;
