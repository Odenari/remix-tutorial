import {
  Form,
  Links,
  LiveReload,
  Outlet,
  Meta,
  Scripts,
  ScrollRestoration,
  NavLink,
  useNavigation,
  useLoaderData,
  useSubmit,
} from '@remix-run/react';
import { LinksFunction, LoaderFunction, json, redirect } from '@remix-run/node';
import appStylesHref from './app.css';
import { ContactRecord, createEmptyContact, getContacts } from './data';
import { useEffect, useState } from 'react';

export const action = async () => {
  const contact = await createEmptyContact();
  return redirect(`/contacts/${contact.id}/edit`);
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');
  const contacts = await getContacts(query);

  // const contacts = await getContacts();
  return json({ contacts, query });
};

// Every route can export links function, they will be collected and rendered in /app/root.tsx
export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: appStylesHref },
];

export default function App() {
  // typeof loader will add types from loader response
  const { contacts, query } = useLoaderData<typeof loader>();
  console.log(query);
  const navigation = useNavigation();
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has('q');
  const [search, setSearch] = useState(query || '');
  const submit = useSubmit();

  useEffect(() => {
    setSearch(query || '');
  }, [query]);

  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body>
        <div id='sidebar'>
          <h1>Remix Contacts</h1>
          <div>
            <Form
              onChange={event => {
                const isFirstSearch = query === null;
                submit(event.currentTarget, {
                  replace: !isFirstSearch,
                });
              }}
              id='search-form'
              role='search'
            >
              <input
                id='q'
                className={searching ? 'loading' : ''}
                value={search}
                onChange={event => setSearch(event.currentTarget.value)}
                aria-label='Search contacts'
                placeholder='Search'
                type='search'
                name='q'
              />
              <div id='search-spinner' aria-hidden hidden={!searching} />
            </Form>
            <Form method='post'>
              <button type='submit'>New</button>
            </Form>
          </div>
          <nav>
            {contacts.length ? (
              <ul>
                {contacts.map((contact: ContactRecord) => (
                  <li key={contact.id}>
                    <NavLink
                      className={({ isActive, isPending }) =>
                        isActive ? 'active' : isPending ? 'pending' : ''
                      }
                      to={`contacts/${contact.id}`}
                    >
                      {contact.first || contact.last ? (
                        <>
                          {contact.first} {contact.last}
                        </>
                      ) : (
                        <i>No Name</i>
                      )}{' '}
                      {contact.favorite ? <span>★</span> : null}
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                <i>No contacts</i>
              </p>
            )}
          </nav>
        </div>
        <div
          className={
            navigation.state === 'loading' && !searching ? 'loading' : ''
          }
          id='detail'
        >
          <Outlet />
        </div>

        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
