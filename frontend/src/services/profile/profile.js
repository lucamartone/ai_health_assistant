import api from '../../hooks/useApi';

export async function me(){
  return await api.get('/profile/cookies/me');
};

export async function changePassword(old_password, new_password, account_email){
  const data = { old_password, new_password, account_email };
  return await api.post('/profile/account/change_password', data);
};

export async function fetchUpdatedAccount(){
  const data = await api.get('/profile/cookies/me');
  return data.account;
};

export async function getProfile(){
  return await api.get('/profile/account/profile');
};

export async function logout(){
  await api.post('/profile/account/logout', null, { skipRefresh: true });
};

export async function requestPasswordReset(email) {
  const data = { email };
  return await api.post('/profile/account/request_password_reset', data);
};

export async function resetPassword(token, new_password) {
  const data = { token, new_password };
  return await api.post('/profile/account/reset_password', data, { skipRefresh: true });
};

export async function getPreferences(accountId) {
  return await api.get(`/profile/account/preferences?account_id=${accountId}`);
};

export async function savePreferences(accountId, notifications, privacy) {
  const data = { notifications, privacy };
  return await api.post(`/profile/account/preferences?account_id=${accountId}`, data);
};
