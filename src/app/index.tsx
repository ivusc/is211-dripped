import { Redirect } from 'expo-router';

import { useApp } from '@/store';

// "/" has no screen of its own: send people to the login, first-run setup, or the stylist.
export default function Index() {
  const { loggedIn, setup } = useApp();
  return <Redirect href={!loggedIn ? '/login' : setup ? '/body-scan' : '/stylist'} />;
}
