import Link from "next/link"

export const metadata = {
  title: "Terms & Conditions - Aevum AI",
  description: "Terms and conditions for Aevum AI event promotion platform",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Terms & Conditions</h1>
          <p className="text-white/60">Last updated: May 6, 2026</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
            <p className="text-white/80">
              By accessing and using the Aevum AI platform (&quot;Service&quot;), you accept and agree to be bound by and comply with these Terms and Conditions. If you do not agree to abide by the above, please do not use this Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
            <p className="text-white/80 mb-4">
              Permission is granted to temporarily download one copy of the materials (information or software) on Aevum AI for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80">
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose or for any public display</li>
              <li>Attempting to decompile or reverse engineer any software contained on Aevum AI</li>
              <li>Removing any copyright or other proprietary notations from the materials</li>
              <li>Transferring the materials to another person or &quot;mirroring&quot; the materials on any other server</li>
              <li>Violating any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Disclaimer</h2>
            <p className="text-white/80">
              The materials on Aevum AI are provided &quot;as is&quot;. Aevum AI makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Limitations</h2>
            <p className="text-white/80">
              In no event shall Aevum AI or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use Aevum AI or the materials, even if Aevum AI or an authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Accuracy of Materials</h2>
            <p className="text-white/80">
              The materials appearing on Aevum AI could include technical, typographical, or photographic errors. Aevum AI does not warrant that any of the materials on our site are accurate, complete, or current. Aevum AI may make changes to the materials contained on our site at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Links</h2>
            <p className="text-white/80">
              Aevum AI has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Aevum AI of the site. Use of any such linked website is at the user&apos;s own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Modifications</h2>
            <p className="text-white/80">
              Aevum AI may revise these terms of service for our website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Governing Law</h2>
            <p className="text-white/80">
              These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts located in India.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. User Responsibilities</h2>
            <p className="text-white/80 mb-4">
              You agree that:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80">
              <li>You will only post content that you have the right to post</li>
              <li>You will not post illegal, threatening, or defamatory content</li>
              <li>You will use the service in compliance with all applicable laws</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You are responsible for all activities under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Content Ownership</h2>
            <p className="text-white/80">
              You retain all rights to any content you create or upload. By using our Service, you grant Aevum AI a license to use your content solely for the purpose of providing the Service to you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Limitation of Liability</h2>
            <p className="text-white/80">
              Aevum AI&apos;s total liability to you for any claim arising from the use of the Service shall not exceed the fees paid by you (if any) in the 12 months preceding the claim. This limitation applies whether the claim is based on warranty, contract, tort, or any other legal theory.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
            <p className="text-white/80">
              If you have any questions about these Terms and Conditions, please contact us at:<br />
              <strong>Email:</strong> vajinapalli.abhinav@gmail.com
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
