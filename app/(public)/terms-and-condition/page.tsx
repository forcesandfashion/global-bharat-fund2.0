"use client";
import { FileText, AlertCircle } from "lucide-react";

export default function TermsAndConditions() {
  return (
      
      <div className="space-y-6">
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-6">
          <p className="text-purple-800 text-sm">
            These Terms and Conditions (&quot;Terms&quot;) govern your access to and use of the Nebula Accelerator website (the "Site") and all services, programs, and content made available through it. By using the Site, you agree to be bound by these Terms of Nebula Def-SAT Private Limited.
          </p>
        </div>

        {[
          {
            title: "1. Use of the Site",
            content: "The Site is intended for founders, professionals, partners, and stakeholders interested in Nebula Accelerator's programs and initiatives. You agree to use the Site only for lawful purposes and in a manner that does not infringe the rights of, restrict, or inhibit the use and enjoyment of the Site by any other user."
          },
          {
            title: "2. Eligibility and Registration",
            content: "Some areas of the Site or certain services may require registration or application. You agree that the information provided during registration or application is accurate, current, and complete, and that you will update it as necessary."
          },
          {
            title: "3. Intellectual Property",
            content: "All content on the Site, including text, graphics, logos, images, videos, program materials, and designs, is owned by or licensed to Nebula Accelerator and is protected by applicable intellectual property laws. You may view, download, or print limited copies of materials for personal, non‑commercial use only, provided you do not modify the content and retain all proprietary notices."
          },
          {
            title: "4. Prohibited Activities",
            content: (
              <ul className="space-y-2">
                <li className="flex items-start">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Use the Site to upload or transmit any unlawful, harmful, defamatory, or objectionable material.</span>
                </li>
                <li className="flex items-start">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Attempt to gain unauthorized access to the Site, its servers, or any associated systems.</span>
                </li>
                <li className="flex items-start">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Copy, distribute, or exploit any part of the Site or its content for commercial purposes without prior written consent.</span>
                </li>
              </ul>
            )
          },
          {
            title: "5. Third‑Party Links and Services",
            content: "The Site may contain links to third‑party websites or services for convenience and information. Nebula Accelerator does not endorse and is not responsible for the content, security, or privacy practices of any third‑party websites, and your use of them is at your own risk."
          },
          {
            title: "6. Program and Service Modifications",
            content: "Nebula Accelerator may modify, update, or discontinue any program, offering, or feature of the Site at any time, with or without notice. Fees, eligibility criteria, and program structures may be revised periodically, and updated details will be reflected on the Site."
          },
          {
            title: "7. Limitation of Liability",
            content: "To the maximum extent permitted by law, Nebula Accelerator shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use or inability to use the Site or services. Nebula Accelerator does not guarantee uninterrupted or error‑free access to the Site and may suspend operations for maintenance or upgrades."
          },
          {
            title: "8. Indemnity",
            content: "You agree to indemnify and hold harmless Nebula Accelerator, its team members, partners, and affiliates from any claims, losses, damages, liabilities, and expenses arising from your breach of these Terms or misuse of the Site."
          },
          {
            title: "9. Changes to these Terms",
            content: "Nebula Accelerator may revise these Terms from time to time by updating this page. Continued use of the Site after such changes constitutes your acceptance of the revised Terms."
          },
          {
            title: "10. Governing Law and Jurisdiction",
            content: "These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with the Site or these Terms shall be subject to the exclusive jurisdiction of the courts located in India."
          }
        ].map((item, index) => (
          <div key={index} className="border-l-4 border-purple-200 pl-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
            <div className="text-gray-700 leading-relaxed">
              {item.content}
            </div>
          </div>
        ))}
      </div>
  );
}