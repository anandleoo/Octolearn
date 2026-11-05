import { Stack } from 'expo-router';
import { act, renderRouter, screen } from 'expo-router/testing-library';
import { Text } from 'react-native';
import { create } from 'zustand';

/**
 * Regression test for "page not found on first launch" (seen in the release APK).
 * Same route shape as the app: the protected tabs own "/", and the (auth) group has no address of its own,
 * so each Protected group needs an explicit `redirectTo`.
 */
const useSession = create<{ signedIn: boolean }>(() => ({ signedIn: false }));

function Layout() {
  const signedIn = useSession((s) => s.signedIn);
  return (
    <Stack>
      <Stack.Protected guard={signedIn} redirectTo="/sign-in">
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={!signedIn} redirectTo="/">
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

const routes = {
  _layout: Layout,
  '(tabs)/_layout': () => <Stack />,
  '(tabs)/index': () => <Text>tabs home</Text>,
  '(auth)/_layout': () => <Stack />,
  '(auth)/sign-in': () => <Text>sign in page</Text>,
};

describe('protected route redirects', () => {
  it('a signed-out launch lands on the sign-in page (not "page not found")', async () => {
    useSession.setState({ signedIn: false });
    await renderRouter(routes, { initialUrl: '/' });
    expect(screen).toHavePathname('/sign-in');
    expect(screen.getByText('sign in page')).toBeTruthy();
  });

  it('a signed-in launch (Remember me) opens the app', async () => {
    useSession.setState({ signedIn: true });
    await renderRouter(routes, { initialUrl: '/' });
    expect(screen).toHavePathname('/');
    expect(screen.getByText('tabs home')).toBeTruthy();
  });

  it('signing in moves from the sign-in page to the app, and signing out moves back', async () => {
    useSession.setState({ signedIn: false });
    await renderRouter(routes, { initialUrl: '/' });
    expect(screen).toHavePathname('/sign-in');

    await act(async () => useSession.setState({ signedIn: true }));
    expect(screen).toHavePathname('/');
    expect(screen.getByText('tabs home')).toBeTruthy();

    await act(async () => useSession.setState({ signedIn: false }));
    expect(screen).toHavePathname('/sign-in');
  });
});
