import Link from "next/link"

export const metadata = {
  title: "Privacy Policy - Aevum AI",
  description: "Privacy policy for Aevum AI event promotion platform",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-white/60">Last updated: May 6, 2026</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-white/80">
              Aevum AI (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our event promotion automation platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">2.1 Google Calendar Information</h3>
                <p className="text-white/80">
                  We collect event data from your Google Calendar (event names, dates, descriptions) to generate marketing content. This data is only used for content generation and is not shared with third parties.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">2.2 LinkedIn Authorization</h3>
                <p className="text-white/80">
                  We request LinkedIn authorization to post approved content on your behalf. We only store your LinkedIn access token and use it strictly for publishing approved events. We do not access or store your LinkedIn personal data.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">2.3 Email Information</h3>
                <p className="text-white/80">
                  We collect email addresses you provide to send event promotion content. Emails are sent only with your explicit approval.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">2.4 Dashboard Usage</h3>
                <p className="text-white/80">
                  We log usage analytics to improve our service, including campaigns generated, content approved, and platforms published to.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-white/80">
              <li>Generate AI-powered marketing content for your events</li>
              <li>Publish approved content to LinkedIn and email</li>
              <li>Track campaigns and publishing metrics</li>
              <li>Improve and optimize our service</li>
              <li>Provide customer support</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
            <p className="text-white/80">
              We implement industry-standard security measures to protect your data from unauthorized access, alteration, and destruction. Your access tokens and sensitive information are encrypted and stored securely. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Third-Party Services</h2>
            <p className="text-white/80">
              Our platform integrates with:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80 mt-2">
              <li><strong>Google Calendar API</strong> - for event data</li>
              <li><strong>LinkedIn API</strong> - for content publishing</li>
              <li><strong>Google Gemini AI</strong> - for content generation</li>
              <li><strong>SMTP Email Services</strong> - for email delivery</li>
            </ul>
            <p className="text-white/80 mt-4">
              Each service has its own privacy policy. We encourage you to review them.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
            <p className="text-white/80 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80">
              <li>Access your personal data</li>
              <li>Request correction or deletion of your data</li>
              <li>Withdraw consent for data processing</li>
              <li>Disconnect your Google Calendar and LinkedIn accounts</li>
              <li>Request a copy of your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
            <p className="text-white/80">
              We retain your event data, campaigns, and publishing history for as long as your account is active. You can request deletion of your data at any time, and we will remove it within 30 days except where required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Changes to This Policy</h2>
            <p className="text-white/80">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by updating the &quot;Last updated&quot; date and posting the new policy on our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
            <p className="text-white/80">
              If you have questions about this Privacy Policy or our privacy practices, please contact us at:<br />
              <strong>Email:</strong> 2303a52486@sru.edu.in<br />
              <strong>Phone:</strong> +91-XXXXXXXXXX (if available)
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
