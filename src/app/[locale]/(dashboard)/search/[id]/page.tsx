'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Frown } from 'lucide-react';

import ProfilePageSkeleton from '@/components/ui/skeletons/profile-page-skeleton';
import DateProfileWrapper from '@/components/wrappers/date-profile-wrapper';
import useUserStore from '@/stores/user';
import { TDateProfile } from '@/types/date-profile';

const DateProfilePage = () => {
  const t = useTranslations();
  const router = useRouter();
  const { id: profileToFindId } = useParams(); // Grab the id from the dynamic route
  const { user, setUser, globalLoading } = useUserStore();
  const [dateProfile, setDateProfile] = useState<TDateProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Connection-status states
  const [isMatch, setIsMatch] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isLikedBy, setIsLikedBy] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isBlockedBy, setIsBlockedBy] = useState<boolean | null>(null);

  useEffect(() => {
    // Redirect to /profile if the user tries to visit their own profile
    if (user && profileToFindId && user.id === profileToFindId) {
      router.push('/profile'); // Redirect to /profile if it's the user's own profile
      return;
    }

    const fetchUserProfile = async () => {
      setLoading(true);
      setError('');

      // Ensure the id is available
      if (!profileToFindId) {
        setError('id-not-provided');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/search/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user?.id,
            profileToFindId: profileToFindId,
          }),
        });

        const result = await response.json();
        if (response.ok) {
          if (result.message) {
            setError(result.message);
            setUser({ ...user, ...result.user });
          } else {
            setDateProfile(result.matchingUserProfile);
            setUser({ ...user, ...result.user });
          }
        } else {
          setError(result.error ? result.error : 'error-fetching-profile');
        }
      } catch (error) {
        setError(String(error));
      } finally {
        setLoading(false);
      }
    };

    if (user && !dateProfile) fetchUserProfile();
  }, [profileToFindId]);

  useEffect(() => {
    // Log the visit once the user and dateProfile are available
    if (user && dateProfile && user.id !== dateProfile?.id) {
      const logVisit = async () => {
        try {
          await fetch('/api/interactions/visit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              visitorId: user.id,
              visitedUserId: dateProfile.id,
            }),
          });
        } catch (error) {
          console.error('Failed to log visit:', error);
        }
      };

      logVisit();
    }
  }, [dateProfile?.id]);

  // Polling for relationship status changes (with immediate first poll)
  useEffect(() => {
    const pollStatus = async () => {
      if (!user || !dateProfile) return;

      try {
        const response = await fetch('/api/activity/check-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, profileToCheckId: dateProfile.id }),
        });

        const result = await response.json();
        if (response.ok) {
          setIsLiked(result.isLiked);
          setIsLikedBy(result.isLikedBy);
          setIsMatch(result.isMatch);
          setIsBlocked(result.isBlocked);
          setIsBlockedBy(result.isBlockedBy);
        }
      } catch (error) {
        console.error('Error checking profile status:', error);
      }
    };

    // Trigger the first poll immediately
    pollStatus();

    // Then start polling every 7 seconds
    const interval = setInterval(pollStatus, 7000);
    return () => clearInterval(interval);
  }, [user, dateProfile]);

  useEffect(() => {
    if (isBlockedBy) {
      router.push('/dashboard'); // Redirect to /dashboard if a current user is blocked by this profile
      return;
    }
  }, [dateProfile, isBlockedBy]);

  return error ? (
    <div className="w-full min-w-28 flex-col items-center justify-center overflow-hidden text-ellipsis rounded-2xl bg-card p-4">
      <div className="m-5 flex items-center justify-center smooth42transition hover:scale-150">
        <Frown size={84} />
      </div>
      <p className="text-center text-lg">{error ? t(`${error}`) : t(`profile-not-found`)}</p>
    </div>
  ) : loading || globalLoading || !user || isBlockedBy === null || isBlockedBy ? (
    <ProfilePageSkeleton />
  ) : (
    <DateProfileWrapper
      dateProfile={dateProfile!}
      setDateProfile={setDateProfile}
      isMatch={isMatch}
      isLiked={isLiked}
      //isLikedBy={isLikedBy}
      isBlocked={isBlocked}
    />
  );
};

export default DateProfilePage;
