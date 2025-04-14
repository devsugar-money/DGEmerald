import React from "react";
import { Link } from "react-router-dom";
import "../styles/landing.css";

const Landing: React.FC = () => {
  return (
    <div className="landing-container" data-testid="landing-page">
      {/* Hero Section - Clean, minimalist background with subtle gradient */}
      <div className="w-full min-h-screen">
        <div className="relative h-[100vh] w-full">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            <img
              src="/landingBg.jpg"
              alt="Background"
              className="w-full h-full object-cover opacity-75"
            />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col pl-24 justify-center h-full px-6 text-center text-black">
            {/* Main Text */}
            <div className="max-w-[520px] text-start">
              <h1 className="text-3xl sm:text-4xl font-normal text-[#021247] leading-snug">
                Smarter financial decisions <br />
                in minutes.{" "}
                <span className="text-[#FF0404]">Get back to life.</span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-gray-800">
                DecideGuide is a simple-to-use interactive tool that answers
                your financial questions with personalized, trustworthy, expert
                advice and immediate action steps – whenever you need.
              </p>

              {/* CTA Buttons */}

              <div className="mt-6">
                <Link
                  to="/register"
                  className="px-6 py-3 border-2 border-black rounded-full text-lg font-medium hover:bg-black hover:text-white transition"
                >
                  Get Started
                </Link>
              </div>
              {/* <div className="mt-8 flex flex-wrap gap-4 justify-center">
                <button className="bg-blue-900 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-800">
                  Sign up for early access
                </button>
                <button className="bg-blue-900 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-800">
                  Try a free demo now
                </button>
              </div> */}

              {/* Learn More */}
              {/* <div className="mt-10">
                <a
                  href="#"
                  className="text-gray-700 hover:text-gray-900 text-lg"
                >
                  Learn more <br />
                </a>
              </div> */}
            </div>
          </div>
        </div>
        <div className="bg-[#e6effa] text-center py-16 px-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            DecideGuide is your personal digital financial advisor
          </h2>

          <p className="mt-6 text-lg text-gray-700">
            Everyone faces lots of financial decisions.
          </p>

          {/* Modern Icon Row */}
          <div className="icon-row">
            <div className="icon-card">
              <div className="icon-wrapper">
                <span className="icon">🏠</span>
              </div>
              <span className="icon-label">Housing</span>
            </div>
            <div className="icon-card">
              <div className="icon-wrapper">
                <span className="icon">🌴</span>
              </div>
              <span className="icon-label">Retirement</span>
            </div>
            <div className="icon-card">
              <div className="icon-wrapper">
                <span className="icon">📈</span>
              </div>
              <span className="icon-label">Investing</span>
            </div>
            <div className="icon-card">
              <div className="icon-wrapper">
                <span className="icon">☂️</span>
              </div>
              <span className="icon-label">Insurance</span>
            </div>
            <div className="icon-card">
              <div className="icon-wrapper">
                <span className="icon">🎓</span>
              </div>
              <span className="icon-label">Education</span>
            </div>
          </div>

          <p className="mt-6 text-lg text-gray-700">
            Everyone deserves expert financial guidance.
          </p>

          <p className="mt-6 text-2xl text-gray-700 max-w-xl mx-auto">
            "Do it myself" doesn't mean do it alone
          </p>
        </div>
      </div>

      {/* DecideGuide in Action Section - Blue Background */}
      <section className="bg-[#4865B2] py-16 text-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">DecideGuide in Action</h2>
          <h3 className="text-2xl mb-4">
            Harry and Sally have the same question:
          </h3>
          <p className="text-2xl font-semibold text-[#FFD700] mb-4">
            Do I need life insurance or disability insurance?
          </p>
          <p className="text-xl mb-8">
            but different personal circumstances and goals
          </p>
          <div className="w-1/4 h-[1px] bg-white mx-auto mb-8"></div>
          <p className="text-xl mb-12">
            With just 1 question DecideGuide creates the right unique decision
            path
          </p>

          <p className="text-lg mx-auto max-w-4xl">
            It's time to enroll in employee benefits. Harry and Sally must
            decide whether to pay for life or disability insurance. They start
            by searching online. Facing 32 million results they turn to
            DecideGuide. With just one question DecideGuide leads Harry and
            Sally down unique personal smart decision paths designed to achieve
            their individual goals.
          </p>
        </div>
      </section>

      {/* Decision Flow Diagram Section - Styled to match reference image */}
      <section className="flow-section flex-col justify-center items-center gap-3">
        {/* <div className="content-container">
          <div className="text-container">
            <h2 className="section-title">See how DecideGuide works</h2>
            <p className="section-subtitle">
              Our personalized decision path helps you make the right choices
              based on your unique circumstances
            </p>
          </div>
          <div className="image-container">
            <div className="flow-diagram">
              <div className="flow-node start">Your Financial Question</div>
              <div className="flow-arrow"></div>
              <div className="flow-node process">Personalized Assessment</div>
              <div className="flow-arrow"></div>
              <div className="flow-node process">Expert Analysis</div>
              <div className="flow-arrow"></div>
              <div className="flow-node end">Tailored Recommendations</div>
            </div>
          </div>
        </div> */}
        <div className="p-4">
          <span className="text-[1.3rem] font-normal">Welcome to DecideGuide! How can we help?</span>
        </div>
        <img src="/flow-diagram.png" className="max-w-1/2 w-1/2 " />
      </section>

      {/* Fiduciary Section - Blue background matching reference image */}
      <section className="fiduciary-section">
        <div className="content-container">
          <h2 className="section-title light mb-3">
            DecideGuide is built on science by fiduciary financial experts
          </h2>
          <p className="section-subtitle light">
            Only fiduciaries are legally and ethically required to put your best
            interest first
          </p>
          <div className="cta-container">
            <Link to="/register" className="secondary-button">
              Put DecideGuide to Work for You
            </Link>
          </div>
        </div>
      </section>

      {/* What is DecideGuide Section */}
      <section className="action-section">
        <div className="content-container">
          <h2 className="section-title">DecideGuide in Action</h2>
          <p className="section-subtitle">
            A simple-to-use interactive tool that answers your financial
            questions with personalized, trustworthy, expert advice and
            immediate action steps — whenever you need it.
          </p>
          <div className="button-group">
            <Link to="/register" className="primary-button">
              Sign up for early access
            </Link>
            <Link to="/demo" className="outline-button">
              Try a free demo
            </Link>
          </div>
        </div>
      </section>

      {/* Main Feature Section - White Background */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
            Smarter financial decisions in minutes.{" "}
            <span className="text-[#FF4438]">Get back to life.</span>
          </h2>
          <p className="text-xl text-gray-700 mb-10 max-w-3xl mx-auto">
            DecideGuide is a simple-to-use interactive tool that answers your
            financial questions with personalized, trustworthy, expert advice
            and immediate action steps - whenever you need.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              to="/register"
              className="bg-[#2D3B69] text-white px-8 py-3 rounded-md hover:bg-opacity-90 transition-colors inline-block font-medium"
            >
              Sign up for early access
            </Link>
            <Link
              to="/demo"
              className="bg-[#2D3B69] text-white px-8 py-3 rounded-md hover:bg-opacity-90 transition-colors inline-block font-medium"
            >
              Try a free demo now
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section - Light Background */}
      <section className="benefits-section">
        <div className="content-container">
          <div className="benefits-grid">
            <div className="benefit-card">
              <h3 className="benefit-title">Personalized Guidance</h3>
              <p className="benefit-text">
                Tailored to your unique financial situation and goals
              </p>
            </div>
            <div className="benefit-card">
              <h3 className="benefit-title">Expert Knowledge</h3>
              <p className="benefit-text">
                Built on proven financial principles and fiduciary standards
              </p>
            </div>
            <div className="benefit-card">
              <h3 className="benefit-title">Clear Action Steps</h3>
              <p className="benefit-text">
                Concrete next steps without jargon or complexity
              </p>
            </div>
            <div className="benefit-card">
              <h3 className="benefit-title">Time Saving</h3>
              <p className="benefit-text">
                Make informed decisions quickly with confidence
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="content-container">
          <h2 className="section-title light">
            Ready to transform your financial future?
          </h2>
          <div className="cta-container">
            <Link to="/register" className="secondary-button">
              Get Started Today
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="content-container">
          <div className="footer-grid">
            <div className="footer-col">
              <h4 className="footer-title">DecideGuide</h4>
              <p className="footer-text">Your trusted financial companion</p>
            </div>
            <div className="footer-col">
              <h4 className="footer-title">Legal</h4>
              <ul className="footer-links">
                <li>
                  <Link to="/terms" className="footer-link">
                    Terms of Use
                  </Link>
                </li>
                <li>
                  <Link to="/disclaimer" className="footer-link">
                    Disclaimer
                  </Link>
                </li>
                <li>
                  <Link to="/restrictions" className="footer-link">
                    Use Restrictions
                  </Link>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <h4 className="footer-title">Contact</h4>
              <ul className="footer-links">
                <li>
                  <Link to="/contact" className="footer-link">
                    Get in Touch
                  </Link>
                </li>
                <li>
                  <Link to="/support" className="footer-link">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-disclaimer">
            <p>
              Disclaimer: Each person's financial obligations, goals, needs, and
              circumstances are unique. The Women Investing Now (WIN) website is
              for educational purposes only. WIN does not sell financial
              products and does not recommend or manage individual investments.
              Nothing on this website shall be construed as individual
              investment, tax, or legal advice.
            </p>
          </div>

          <div className="footer-copyright">
            <p>
              Copyright ©2015-2024 Social Strategy LLC. All Rights Reserved.
              WIN, Women Investing Now, and DecideGuide are trademarks of Social
              Strategy LLC.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
