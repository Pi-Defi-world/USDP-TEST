'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Shield, Lock, Eye, Database, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#000000] page-transition pb-20 lg:pb-0">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#E9ECEF] mb-2">Privacy Policy</h1>
          <p className="text-[#707784]">How we collect, use, and protect your information</p>
        </div>

        <div className="space-y-6">
          {/* Introduction */}
          <Card className="bg-panel border-[#1C1F25]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#E9ECEF]">
                <Shield className="h-5 w-5 text-gradient-blue" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#707784] leading-relaxed">
                This Privacy Policy describes how USDP collects, uses, and protects your personal information 
                when you use our platform. We are committed to protecting your privacy and ensuring the security 
                of your data.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card className="bg-panel border-[#1C1F25]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#E9ECEF]">
                <Database className="h-5 w-5 text-gradient-blue" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-panel-light border border-[#1C1F25]">
                  <h3 className="font-semibold text-[#E9ECEF] mb-2">Account Information</h3>
                  <p className="text-sm text-[#707784]">
                    When you connect your Pi Network account, we collect your username, user ID, and wallet address 
                    to provide our services.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-panel-light border border-[#1C1F25]">
                  <h3 className="font-semibold text-[#E9ECEF] mb-2">Transaction Data</h3>
                  <p className="text-sm text-[#707784]">
                    We store transaction history, including mint and redeem operations, to provide you with a complete 
                    record of your USDP activities.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-panel-light border border-[#1C1F25]">
                  <h3 className="font-semibold text-[#E9ECEF] mb-2">Wallet Information</h3>
                  <p className="text-sm text-[#707784]">
                    Your wallet address and encrypted passphrase data are stored securely to enable passkey 
                    authentication and wallet recovery.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card className="bg-panel border-[#1C1F25]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#E9ECEF]">
                <Eye className="h-5 w-5 text-gradient-blue" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-[#707784]">
                <p>We use your information to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide and maintain our USDP minting and redemption services</li>
                  <li>Process transactions and manage your account</li>
                  <li>Enable passkey authentication and wallet security features</li>
                  <li>Display transaction history and balance information</li>
                  <li>Improve our services and user experience</li>
                  <li>Comply with legal obligations and prevent fraud</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card className="bg-panel border-[#1C1F25]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#E9ECEF]">
                <Lock className="h-5 w-5 text-gradient-blue" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-[#707784]">
                <p>
                  We implement industry-standard security measures to protect your information:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Encryption of sensitive data in transit and at rest</li>
                  <li>Secure passkey authentication using WebAuthn standards</li>
                  <li>Encrypted storage of wallet passphrases</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and authentication requirements</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="bg-panel border-[#1C1F25]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#E9ECEF]">
                <UserCheck className="h-5 w-5 text-gradient-blue" />
                Your Rights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-[#707784]">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Access your personal information</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your account and data</li>
                  <li>Export your transaction history</li>
                  <li>Disconnect your Pi Network account at any time</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="bg-panel border-[#1C1F25]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#E9ECEF]">
                <FileText className="h-5 w-5 text-gradient-blue" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#707784] mb-4">
                If you have questions about this Privacy Policy or wish to exercise your rights, please contact us 
                through our support channels.
              </p>
              <Link href="/contact">
                <Button variant="outline" className="border-[#1C1F25] text-[#E9ECEF] hover:bg-panel-light">
                  Contact Support
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Last Updated */}
          <div className="text-center text-xs text-[#707784] pt-4">
            Last updated: {new Date().toLocaleDateString()}
          </div>

          {/* Back to Profile */}
          <div className="pt-4">
            <Link href="/profile">
              <Button variant="outline" className="w-full border-[#1C1F25] text-[#E9ECEF] hover:bg-panel-light">
                Back to Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

