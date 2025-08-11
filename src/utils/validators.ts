export const isValidHost = (address: string): boolean => {
  const regexP = /^[a-zA-Z0-9.-]+:\d+$/;
  if (!regexP.test(address)) return false;

  const regexPortNumber = /:\d+/;
  const portMatch = address.match(regexPortNumber);
  if (!portMatch) return false;

  const port = portMatch[0].replace(":", "");
  if (Number(port) < 0 || Number(port) > 65536) return false;

  return true;
};
// Make sure username contains no spaces

export const isValidUsername: (username: string) => boolean = (username) => /^[a-zA-Z0-9.@-]+$/.test(username);
const EMAIL_REGEX =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
// Make sure username contains no spaces

export const isValidLightningUsername: (username: string) => boolean = (username) => {
  return EMAIL_REGEX.test(username);
};
export const validateLightningUrl = async (email: string) => {
  try {
    const [username, domain] = email.split("@");
    const url = `https://${domain}/.well-known/lnurlp/${username}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.callback;
  } catch (e) {
    return false;
  }
};
