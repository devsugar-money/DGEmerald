import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const defaultActions: string[] = [
  "Set up Emergency Fund",
  "Open Brokerage Account",
  "Choose Index Fund",
  "Enroll in Employer Pension Plan",
];

const stripHtmlTags = (text: string) => {
  return text.replace(/<[^>]*>/g, "");
};

const ActionPlan = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { actionPlan = [], surveyName = "Survey" } = location.state || {};
  const [showModal, setShowModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const getStepColor = (index: number): string => {
    switch (index) {
      case 0:
        return "bg-emerald-400";
      case 1:
        return "bg-blue-600";
      case 2:
        return "bg-blue-400";
      case 3:
        return "bg-green-400";
      default:
        return "bg-gray-500";
    }
  };

  const getStepBgColor = (index: number): string => {
    switch (index) {
      case 0:
        return "bg-emerald-300";
      case 1:
        return "bg-blue-500";
      case 2:
        return "bg-blue-300";
      case 3:
        return "bg-green-300";
      default:
        return "bg-gray-400";
    }
  };

  const getGuidanceContent = (action: string) => {
    switch (action) {
      case "Open Brokerage Account":
        return {
          title: "Investing: Opening a Brokerage Account",
          steps: [
            "Compare the services & fees of different brokerage account providers",
            "Decide if to open the account online, by phone or in-person",
            "Fill out a new account application",
            "Select taxable and / or tax-advantaged account type (or both)",
            "Transfer money from your bank to your new brokerage account",
            "Choose your investment",
          ],
          guidance: [
            "To start investing you need a Brokerage Account. A brokerage account is different from a bank savings or checking account and is used for buying and selling investments.",
            "A brokerage account can be opened online or in-person, with your current financial institution, with another bank, or with a brokerage company. To make getting started easier, below you will find links to the 5 largest brokerage firms in the United States.",
            "Tax-Advantaged Accounts. Some brokerage accounts provide special tax benefits when set up and funding according to regulations. Brokerage accounts with tax benefits include, Pension and 401(k) Plans, Individual Retirement Accounts, and 529 Plans (education savings accounts).",
            "Your Personal Goals. The type of account your choose should reflect your goal for the account and your ability to meet the requirements of the account. Each account type has unique requirements and benefits, so check all withdrawal and contribution conditions when deciding your best option. Failure to meet requirements can result in significant penalty. For example, funds withdraw from a 529 Plan must be used for qualified educational expenses or incur a 10% IRS penalty.",
          ],
          brokerageLinks: [
            { name: "Charles Schwab", url: "https://www.schwab.com" },
            { name: "Vanguard", url: "https://www.vanguard.com" },
            { name: "Fidelity Investments", url: "https://www.fidelity.com" },
            { name: "E*TRADE", url: "https://www.etrade.com" },
            { name: "TD Ameritrade", url: "https://www.tdameritrade.com" },
          ],
          tip: "Know your Risk Tolerance and Time Horizon before selecting investments. When you open a brokerage account you are usually asked about your risk tolerance and time horizon. DecideGuide can help you determine and understand your time horizon and risk profile so you can select appropriate investments.",
        };
      default:
        return null;
    }
  };

  // If no action plan data is provided, redirect to home
  React.useEffect(() => {
    if (!location.state) {
      navigate("/");
    }
  }, [location.state, navigate]);

  const actions: string[] = actionPlan.length > 0 ? actionPlan : [];

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-600">
          Your Custom <span className="italic">Action</span> Plan
        </h1>
      </div>

      <div className="bg-white rounded-3xl shadow-lg overflow-hidden p-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">
            My Personal <span className="italic">Action</span> Plan
          </h2>
          <p className="text-xl text-gray-600 mt-2">How do I Invest Smart</p>
          <p className="text-sm text-gray-500 mt-1">Illustration Only*</p>
        </div>

        <div className="relative border border-gray-200 rounded-xl">
          <div className="flex w-full relative">
            <div className="flex-grow w-full">
              <div className="flex border-b">
                <div className="py-3 px-6">
                  <h3 className="text-lg font-medium text-blue-600">
                    Action Plan
                  </h3>
                  <p className="text-sm text-gray-500">Standard Subscription</p>
                </div>
              </div>

              {actions.map((action: string, index: number) => (
                <div key={index} className="flex w-full">
                  <div className={`flex-grow ${getStepColor(index)}`}>
                    <div className="flex">
                      <div className={`w-[150px]`}>
                        <div className={`w-full h-3/4 ${getStepBgColor(index)} flex items-center justify-center py-6`}>
                          <div className="text-2xl font-bold text-white">
                            {(index + 1).toString().padStart(2, "0")}
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 flex items-center z-10">
                        <div className="px-6 py-6 flex justify-between items-center w-full">
                          <p className="text-xl font-medium text-white">
                            {stripHtmlTags(action)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-64 bg-yellow-50">
                    <div className={`py-6 flex justify-center border-dotted border-l-4  ${getStepColor(index)}`}>
                      <button
                        onClick={() => {
                          setSelectedAction(action);
                          setShowModal(true);
                        }}
                        className="hover:opacity-100 transition-opacity"
                      >
                        <svg
                          className="h-8 w-8 text-white opacity-80"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="w-64 absolute right-0 top-0">
              <div className="py-3 px-6 bg-yellow-100 border-dotted border-gray-200 border-l-4">
                <h3 className="text-lg font-medium text-gray-800">
                  Step-by-Step Guidance
                </h3>
                <p className="text-sm text-gray-600">Premium Subscription</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          Based on answers of: "No" to "Do you have an Emergency Fund?" "Yes" to
          "Do you want to choose your investments?" "Yes" to "Does your employer
          offer a 401(k) plan?"
        </div>
        <div className="mt-3 text-center text-sm text-gray-600">
          Premium subscribers receive additional step-by-step guidance. Premium
          Plus subscribers have access to virtual meetings.
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-lg max-w-3xl w-full mx-4 my-auto relative">
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-6 top-6 text-gray-500 hover:text-gray-700"
              title="Back to site"
              aria-label="Back to site"
            >
              <svg
                className="w-6 h-6"
                viewBox="25.975 25.975 148.05 148.05"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g>
                  <path d="M172.9 167.6L105.3 100l67.6-67.6c1.5-1.5 1.5-3.8 0-5.3s-3.8-1.5-5.3 0L100 94.7 32.4 27.1c-1.5-1.5-3.8-1.5-5.3 0s-1.5 3.8 0 5.3L94.7 100l-67.6 67.6c-1.5 1.5-1.5 3.8 0 5.3s3.8 1.5 5.3 0l67.6-67.6 67.6 67.6c1.5 1.5 3.8 1.5 5.3 0s1.5-3.8 0-5.3z"></path>
                </g>
              </svg>
            </button>

            <div className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-medium text-[#FF4233]">
                  Premium Member
                </h3>
                <p className="text-xl text-[#FF4233]">
                  Step-by-Step & Guidance
                </p>
              </div>

              <div className="space-y-8">
                <h2 className="text-2xl font-medium text-[#2B6CB0] text-center">
                  {stripHtmlTags(selectedAction || "")}
                </h2>

                <div>
                  <h3 className="text-xl font-medium text-[#FF4233] mb-4 text-center">
                    STEPS
                  </h3>
                  <ol className="list-decimal pl-10 space-y-4 text-[#2B6CB0]">
                    <li>Review your current financial situation</li>
                    <li>Understand the requirements and benefits</li>
                    <li>Gather necessary documentation</li>
                    <li>Complete required forms and applications</li>
                    <li>
                      Set up automatic payments or transfers if applicable
                    </li>
                    <li>Monitor and adjust as needed</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-[#FF4233] mb-4 text-center">
                    GUIDANCE
                  </h3>
                  <div className="space-y-6 text-[#2B6CB0]">
                    <p>1. Understanding Your Goals</p>
                    <div className="pl-10">
                      This step is crucial for your financial wellbeing. Our
                      premium guidance will help you understand the best
                      approach for your specific situation.
                    </div>

                    <p>2. Implementation Strategy</p>
                    <div className="pl-10">
                      We provide detailed, step-by-step instructions to help you
                      implement this financial action effectively and
                      efficiently.
                    </div>

                    <p>3. Important Considerations</p>
                    <ul className="list-none pl-10 space-y-2 mt-2">
                      <li>- Time requirements</li>
                      <li>- Financial commitments</li>
                      <li>- Documentation needed</li>
                      <li>- Legal requirements</li>
                      <li>- Tax implications</li>
                      <li>- Long-term benefits</li>
                    </ul>

                    <div className="mt-8">
                      <p className="text-[#2B6CB0]">
                        <span className="font-bold text-[#FF4233]">Tip:</span>{" "}
                        Premium members receive detailed guidance customized to
                        their specific situation. Consider upgrading to Premium
                        Plus for personalized virtual meetings with our
                        financial experts.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors mt-8"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionPlan;
