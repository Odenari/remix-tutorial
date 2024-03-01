import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { deleteContact } from '~/data';
import invariant from 'tiny-invariant';

export const action = async ({ params }: ActionFunctionArgs) => {
  invariant(params.contactId, 'Where is ID boi?');
  await deleteContact(params.contactId);
  return redirect('/');
};
