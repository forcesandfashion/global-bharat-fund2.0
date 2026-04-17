'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/store/auth';
import FounderProfile from '@/components/dashboard/FounderProfile';
import InvestorProfile from '@/components/dashboard/InvestorProfile';
import MentorProfile from '@/components/dashboard/MentorProfile';
import InfluencerProfile from '@/components/dashboard/InfluencerProfile';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.userType) {
    case 'FOUNDER': return <FounderProfile />;
    case 'INVESTOR': return <InvestorProfile />;
    case 'MENTOR': return <MentorProfile />;
    case 'INFLUENCER': return <InfluencerProfile />;
    default: return <div className="p-8 text-center text-gray-500">Unknown role</div>;
  }
}
