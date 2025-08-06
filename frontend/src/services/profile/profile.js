import api from '../../hooks/useApi';

export async function me() {
  return await api.get('/profile/cookies/me');
};

export async function changePassword(old_password, new_password, account_email) {
  const data = { old_password, new_password, account_email };
  return await api.post('/profile/account/change_password', data);
};

export async function fetchUpdatedAccount() {
  const data = await api.get('/profile/cookies/me');
  return data.account;
};

export async function getProfile() {
  return await api.get('/profile/account/profile');
};

export async function logout() {
  await api.post('/profile/account/logout', null, { skipRefresh: true });
};
